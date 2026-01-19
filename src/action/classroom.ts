"use server"

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { CreateClassroom, isExistingItem } from "@/app/(public)/communities/[slug]/(no-side-card)/classrooms/_components/types";
import { GeneralResponse } from "@/utils/general-response";
import { getUserData } from "@/utils/get-user-data";
import { revalidatePath } from "next/cache";
import { Tables } from "@/database.types";
import { redirect } from "next/navigation";

interface CreatedLesson {
    id: number;
    moduleIndex: number;
    lessonIndex: number;
}

interface CreatedClassroomData {
    classroomId: number;
    lessons: CreatedLesson[];
}

// CREATE
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
        const moduleInserts = classroomData.modules.map((module: typeof classroomData.modules[number]) => ({
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

            const lessonInserts = module.lessons.map((lesson: typeof module.lessons[number]) => ({
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
                    (resource: typeof lesson.resources[number]) => resource.type === "LINK" ||
                        (resource.type === "FILE" && !resource.url.startsWith('data:'))
                );

                if (linkResources.length === 0) continue;

                const resourceInserts = linkResources.map((resource: typeof linkResources[number]) => ({
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


// READ
export async function getClassrooms() {
    const supabase = await createSupabaseServerClient();

    const { data: classrooms, error: classroomsError } = await supabase
        .from("classrooms")
        .select("*");

    if (classroomsError) {
        console.error("Error fetching classrooms:", classroomsError);
        return {
            error: "Error fetching classrooms",
            message: "Error fetching classrooms",
            statusCode: 500,
        };
    }

    return {
        data: classrooms,
        message: "Classrooms fetched successfully",
        statusCode: 200,
    };
}

/**
 * Get a single classroom with all modules, lessons, and resources
 */
export async function getClassroomById(classroomId: number): Promise<GeneralResponse<{
    classroom: Tables<"classrooms">;
    modules: Array<{
        module: Tables<"modules">;
        lessons: Array<{
            lesson: Tables<"lessons">;
            resources: Tables<"lesson_resources">[];
        }>;
    }>;
}>> {
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
        // Get classroom
        const { data: classroom, error: classroomError } = await supabase
            .from("classrooms")
            .select("*")
            .eq("id", classroomId)
            .single();

        if (classroomError || !classroom) {
            console.error("Error fetching classroom:", classroomError);
            return {
                error: "Error fetching classroom",
                message: "Error fetching classroom",
                statusCode: 500,
            };
        }

        // Get modules
        const { data: modules, error: modulesError } = await supabase
            .from("modules")
            .select("*")
            .eq("classroom_id", classroomId)
            .order("index", { ascending: true });

        if (modulesError) {
            console.error("Error fetching modules:", modulesError);
            return {
                error: "Error fetching modules",
                message: "Error fetching modules",
                statusCode: 500,
            };
        }

        // Get lessons and resources for each module
        const modulesWithLessons = await Promise.all(
            (modules || []).map(async (module) => {
                const { data: lessons, error: lessonsError } = await supabase
                    .from("lessons")
                    .select("*")
                    .eq("module_id", module.id)
                    .order("index", { ascending: true });

                if (lessonsError) {
                    console.error("Error fetching lessons:", lessonsError);
                    return {
                        module,
                        lessons: [],
                    };
                }

                const lessonsWithResources = await Promise.all(
                    (lessons || []).map(async (lesson) => {
                        const { data: resources, error: resourcesError } = await supabase
                            .from("lesson_resources")
                            .select("*")
                            .eq("lesson_id", lesson.id);

                        if (resourcesError) {
                            console.error("Error fetching resources:", resourcesError);
                            return {
                                lesson,
                                resources: [],
                            };
                        }

                        return {
                            lesson,
                            resources: resources || [],
                        };
                    })
                );

                return {
                    module,
                    lessons: lessonsWithResources,
                };
            })
        );

        return {
            data: {
                classroom,
                modules: modulesWithLessons,
            },
            message: "Classroom fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in getClassroomById:", error);
        return {
            error: "Error fetching classroom",
            message: "Error fetching classroom",
            statusCode: 500,
        };
    }
}


// UPDATE

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
 * Update classroom with all modules, lessons, and resources
 */
export async function updateClassroom(
    classroomId: number,
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
        // Update classroom
        const coverUrl = classroomData.coverUrl && !classroomData.coverUrl.startsWith('data:')
            ? classroomData.coverUrl
            : null;

        const { error: classroomError } = await supabase
            .from("classrooms")
            .update({
                name: classroomData.name,
                description: classroomData.description,
                type: classroomData.type,
                cover_url: coverUrl,
                amount_one_time: classroomData.oneTimePayment || null,
                time_unlock_in_days: classroomData.timeUnlockInDays || null,
                is_draft: isDraft,
            })
            .eq("id", classroomId);

        if (classroomError) {
            console.error("Error updating classroom:", classroomError);
            return {
                error: "Error updating classroom",
                message: "Error updating classroom",
                statusCode: 500,
            };
        }

        // Get all existing modules and lessons to track what should be deleted
        const { data: allExistingModules } = await supabase
            .from("modules")
            .select("id")
            .eq("classroom_id", classroomId);

        const allExistingModuleIds = new Set((allExistingModules || []).map(m => m.id));
        const modulesToKeep = new Set<number>();

        // Update or create modules
        const createdLessons: CreatedLesson[] = [];
        for (let moduleIndex = 0; moduleIndex < classroomData.modules.length; moduleIndex++) {
            const module = classroomData.modules[moduleIndex];
            const isExistingModule = isExistingItem(module.id);
            const moduleId = isExistingModule ? module.id as number : null;

            let dbModule;
            if (isExistingModule && moduleId) {
                // Update existing module
                modulesToKeep.add(moduleId);
                const { data: updatedModule, error: updateError } = await supabase
                    .from("modules")
                    .update({
                        name: module.name,
                        index: module.index,
                    })
                    .eq("id", moduleId)
                    .select()
                    .single();

                if (updateError) {
                    console.error("Error updating module:", updateError);
                    continue;
                }
                dbModule = updatedModule;
            } else {
                // Create new module
                const { data: newModule, error: createError } = await supabase
                    .from("modules")
                    .insert({
                        classroom_id: classroomId,
                        name: module.name,
                        description: "",
                        index: module.index,
                    })
                    .select()
                    .single();

                if (createError || !newModule) {
                    console.error("Error creating module:", createError);
                    continue;
                }
                dbModule = newModule;
                modulesToKeep.add(newModule.id);
            }

            if (!dbModule) continue;

            // Get all existing lessons for this module
            const { data: allExistingLessons } = await supabase
                .from("lessons")
                .select("id")
                .eq("module_id", dbModule.id);

            const allExistingLessonIds = new Set((allExistingLessons || []).map(l => l.id));
            const lessonsToKeep = new Set<number>();

            // Update or create lessons
            for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
                const lesson = module.lessons[lessonIndex];
                const isExistingLesson = isExistingItem(lesson.id);
                const lessonId = isExistingLesson ? lesson.id as number : null;

                let dbLesson;
                if (isExistingLesson && lessonId) {
                    // Update existing lesson
                    lessonsToKeep.add(lessonId);
                    const { data: updatedLesson, error: updateError } = await supabase
                        .from("lessons")
                        .update({
                            name: lesson.name,
                            index: lesson.index,
                            video_url: lesson.videoUrl || null,
                            video_type: lesson.videoType || null,
                            text_content: lesson.textContent || null,
                        })
                        .eq("id", lessonId)
                        .select()
                        .single();

                    if (updateError) {
                        console.error("Error updating lesson:", updateError);
                        continue;
                    }
                    dbLesson = updatedLesson;
                } else {
                    // Create new lesson
                    const { data: newLesson, error: createError } = await supabase
                        .from("lessons")
                        .insert({
                            module_id: dbModule.id,
                            name: lesson.name,
                            index: lesson.index,
                            video_url: lesson.videoUrl || null,
                            video_type: lesson.videoType || null,
                            text_content: lesson.textContent || null,
                        })
                        .select()
                        .single();

                    if (createError || !newLesson) {
                        console.error("Error creating lesson:", createError);
                        continue;
                    }
                    dbLesson = newLesson;
                    lessonsToKeep.add(newLesson.id);
                }

                if (!dbLesson) continue;

                createdLessons.push({
                    id: dbLesson.id,
                    moduleIndex,
                    lessonIndex,
                });

                // Get all existing resources for this lesson
                const { data: allExistingResources } = await supabase
                    .from("lesson_resources")
                    .select("id")
                    .eq("lesson_id", dbLesson.id);

                const allExistingResourceIds = new Set((allExistingResources || []).map(r => r.id));
                const resourcesToKeep = new Set<number>();

                // Handle resources - update existing or create new
                if (lesson.resources && lesson.resources.length > 0) {
                    // Separate base64 file resources (need upload) from others
                    const linkResources = lesson.resources.filter(
                        (resource: typeof lesson.resources[number]) => resource.type === "LINK" ||
                            (resource.type === "FILE" && !resource.url.startsWith('data:'))
                    );

                    for (const resource of linkResources) {
                        const isExistingResource = isExistingItem(resource.id);
                        const resourceId = isExistingResource ? resource.id as number : null;

                        if (isExistingResource && resourceId) {
                            // Update existing resource
                            resourcesToKeep.add(resourceId);
                            await supabase
                                .from("lesson_resources")
                                .update({
                                    url: resource.url,
                                    link_name: resource.type === "LINK" ? resource.name : null,
                                    file_name: resource.type === "FILE" ? resource.name : null,
                                    file_type: resource.type === "FILE" ? resource.name.split(".").pop() || null : null,
                                })
                                .eq("id", resourceId);
                        } else {
                            // Create new resource
                            const { data: newResource, error: createError } = await supabase
                                .from("lesson_resources")
                                .insert({
                                    lesson_id: dbLesson.id,
                                    url: resource.url,
                                    type: resource.type,
                                    link_name: resource.type === "LINK" ? resource.name : null,
                                    file_name: resource.type === "FILE" ? resource.name : null,
                                    file_type: resource.type === "FILE" ? resource.name.split(".").pop() || null : null,
                                    file_size: null,
                                })
                                .select()
                                .single();

                            if (newResource) {
                                resourcesToKeep.add(newResource.id);
                            }
                        }
                    }
                }

                // Delete resources that are no longer in the lesson
                const resourcesToDelete = Array.from(allExistingResourceIds).filter(id => !resourcesToKeep.has(id));
                if (resourcesToDelete.length > 0) {
                    await supabase.from("lesson_resources").delete().in("id", resourcesToDelete);
                }
            }

            // Delete lessons that are no longer in the module
            const lessonsToDelete = Array.from(allExistingLessonIds).filter(id => !lessonsToKeep.has(id));
            if (lessonsToDelete.length > 0) {
                await supabase.from("lessons").delete().in("id", lessonsToDelete);
            }
        }

        // Delete modules that are no longer in the classroom
        const modulesToDelete = Array.from(allExistingModuleIds).filter(id => !modulesToKeep.has(id));
        if (modulesToDelete.length > 0) {
            await supabase.from("modules").delete().in("id", modulesToDelete);
        }


        return {
            data: {
                classroomId: classroomId,
                lessons: createdLessons,
            },
            message: "Classroom updated successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in updateClassroom:", error);
        return {
            error: "Error updating classroom",
            message: "Error updating classroom",
            statusCode: 500,
        };
    }
}


// DELETE

export async function deleteClassroom(classroomId: number, communitySlug: string) {
    const supabase = await createSupabaseServerClient();
    try {
        const { error: classroomError } = await supabase.from("classrooms").delete().eq("id", classroomId);
        if (classroomError) {
            console.error("Error deleting classroom:", classroomError);
            return {
                error: "Error deleting classroom",
                message: "Error deleting classroom",
                statusCode: 500,
            };
        }

        revalidatePath(`/communities/${communitySlug}/classrooms`);
    }
    catch (error) {
        console.error("Error deleting classroom:", error);
        return {
            error: "Error deleting classroom",
            message: "Error deleting classroom",
            statusCode: 500,
        };
    }

}