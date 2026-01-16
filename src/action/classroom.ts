"use server"

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { CreateClassroom } from "@/app/(public)/communities/[slug]/classrooms/_components/types";
import { GeneralResponse } from "@/utils/general-response";
import { Tables } from "@/database.types";
import { getUserData } from "@/utils/get-user-data";

interface CreatedLesson {
    id: number;
    moduleIndex: number;
    lessonIndex: number;
}

interface CreatedClassroomData {
    classroomId: number;
    lessons: CreatedLesson[];
}

export async function createClassroom(
    communityId: number,
    classroomData: CreateClassroom,
    isDraft: boolean = false
): Promise<GeneralResponse<CreatedClassroomData>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Generate slug
        let generatedSlug = classroomData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        for (let i = 1; i < 10; i++) {
            const { data: slugExists } = await supabase
                .from("classrooms")
                .select("id")
                .eq("slug", generatedSlug)
                .single();
            if (!slugExists) {
                break;
            }
            generatedSlug = generatedSlug + "-" + i.toString();
        }

        // Create classroom (cover will be uploaded via API after creation)
        // If coverUrl is base64, we'll set it to null and upload it later via API
        const coverUrl = classroomData.coverUrl && !classroomData.coverUrl.startsWith('data:') 
            ? classroomData.coverUrl 
            : null;

        const { data: classroom, error: classroomError } = await supabase
            .from("classrooms")
            .insert({
                name: classroomData.name,
                description: classroomData.description,
                type: classroomData.type,
                cover_url: coverUrl,
                amount_one_time: classroomData.oneTimePayment || null,
                time_unlock_in_days: classroomData.timeUnlockInDays || null,
                is_draft: isDraft,
                slug: generatedSlug,
                community_id: communityId,
            })
            .select()
            .single();

        if (classroomError || !classroom) {
            console.error("Error creating classroom:", classroomError);
            return {
                error: "Error creating classroom",
                message: "Error creating classroom",
                statusCode: 500,
            };
        }

        // Create modules
        const moduleInserts = classroomData.modules.map((module) => ({
            classroom_id: classroom.id,
            name: module.name,
            description: "", // Add description if needed in the future
            index: module.index,
        }));

        const { data: modules, error: modulesError } = await supabase
            .from("modules")
            .insert(moduleInserts)
            .select();

        if (modulesError || !modules) {
            console.error("Error creating modules:", modulesError);
            // Rollback: delete classroom
            await supabase.from("classrooms").delete().eq("id", classroom.id);
            return {
                error: "Error creating modules",
                message: "Error creating modules",
                statusCode: 500,
            };
        }

        // Create lessons and resources
        const createdLessons: CreatedLesson[] = [];
        for (let moduleIndex = 0; moduleIndex < classroomData.modules.length; moduleIndex++) {
            const module = classroomData.modules[moduleIndex];
            const dbModule = modules[moduleIndex];

            if (!dbModule) continue;

            const lessonInserts = module.lessons.map((lesson) => ({
                module_id: dbModule.id,
                name: lesson.name,
                index: lesson.index,
                video_url: lesson.videoUrl || null,
                video_type: lesson.videoType || null,
                text_content: lesson.textContent || null,
            }));

            const { data: lessons, error: lessonsError } = await supabase
                .from("lessons")
                .insert(lessonInserts)
                .select();

            if (lessonsError || !lessons) {
                console.error("Error creating lessons:", lessonsError);
                // Rollback: delete classroom and modules
                await supabase.from("classrooms").delete().eq("id", classroom.id);
                return {
                    error: "Error creating lessons",
                    message: "Error creating lessons",
                    statusCode: 500,
                };
            }

            // Store lesson IDs for file uploads
            lessons.forEach((lesson, lessonIndex) => {
                createdLessons.push({
                    id: lesson.id,
                    moduleIndex,
                    lessonIndex,
                });
            });

            // Create lesson resources (only LINK resources and non-base64 FILE resources)
            // Base64 FILE resources will be uploaded via API after classroom creation
            for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
                const lesson = module.lessons[lessonIndex];
                const dbLesson = lessons[lessonIndex];

                if (!dbLesson || !lesson.resources || lesson.resources.length === 0) continue;

                // Filter out FILE resources that are base64 (they'll be uploaded via API)
                const linkResources = lesson.resources.filter(
                    resource => resource.type === "LINK" || 
                    (resource.type === "FILE" && !resource.url.startsWith('data:'))
                );

                if (linkResources.length === 0) continue;

                const resourceInserts = linkResources.map((resource) => ({
                    lesson_id: dbLesson.id,
                    url: resource.url,
                    type: resource.type,
                    link_name: resource.type === "LINK" ? resource.name : null,
                    file_name: resource.type === "FILE" ? resource.name : null,
                    file_type: resource.type === "FILE" ? resource.name.split(".").pop() || null : null,
                    file_size: null,
                }));

                const { error: resourcesError } = await supabase
                    .from("lesson_resources")
                    .insert(resourceInserts);

                if (resourcesError) {
                    console.error("Error creating lesson resources:", resourcesError);
                    // Rollback: delete classroom, modules, and lessons
                    await supabase.from("classrooms").delete().eq("id", classroom.id);
                    return {
                        error: "Error creating lesson resources",
                        message: "Error creating lesson resources",
                        statusCode: 500,
                    };
                }
            }
        }

        return {
            data: {
                classroomId: classroom.id,
                lessons: createdLessons,
            },
            message: "Classroom created successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in createClassroom:", error);
        return {
            error: "Error creating classroom",
            message: "Error creating classroom",
            statusCode: 500,
        };
    }
}

/**
 * Update classroom cover URL
 */
export async function updateClassroomCover(
    classroomId: number,
    coverUrl: string
): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const { error } = await supabase
        .from("classrooms")
        .update({ cover_url: coverUrl })
        .eq("id", classroomId);

    if (error) {
        console.error("Error updating classroom cover:", error);
        return {
            error: "Error updating classroom cover",
            message: "Error updating classroom cover",
            statusCode: 500,
        };
    }

    return {
        data: undefined,
        message: "Classroom cover updated successfully",
        statusCode: 200,
    };
}

/**
 * Create lesson resource after file upload
 */
export async function createLessonResource(
    lessonId: number,
    resource: {
        url: string;
        type: "FILE" | "LINK";
        name: string;
        fileType?: string;
        fileSize?: number;
    }
): Promise<GeneralResponse<number>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const { data, error } = await supabase
        .from("lesson_resources")
        .insert({
            lesson_id: lessonId,
            url: resource.url,
            type: resource.type,
            link_name: resource.type === "LINK" ? resource.name : null,
            file_name: resource.type === "FILE" ? resource.name : null,
            file_type: resource.type === "FILE" ? (resource.fileType || resource.name.split(".").pop() || null) : null,
            file_size: resource.fileSize || null,
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Error creating lesson resource:", error);
        return {
            error: "Error creating lesson resource",
            message: "Error creating lesson resource",
            statusCode: 500,
        };
    }

    return {
        data: data.id,
        message: "Lesson resource created successfully",
        statusCode: 200,
    };
}
