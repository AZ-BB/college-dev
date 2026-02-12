"use server"

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { CreateClassroom, isExistingItem } from "@/app/(public)/communities/[slug]/(no-side-card)/classrooms/_components/types";
import { GeneralResponse } from "@/utils/general-response";
import { getUserData } from "@/utils/get-user-data";
import { revalidatePath } from "next/cache";
import { Tables } from "@/database.types";
import { notFound, redirect } from "next/navigation";

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
export async function getClassroom(classroomId: number) {
    const supabase = await createSupabaseServerClient();

    const query = supabase
        .from("classrooms")
        .select(`
            *,
            modules(*,lessons(*, lesson_resources(*)))
        `)
        .eq("id", classroomId)
        .single();


    const { data: classroom, error: classroomError } = await query;
    if (classroomError || !classroom) {
        return {
            error: "Classroom not found",
            message: "Classroom not found",
            statusCode: 404,
        };
    }

    return {
        data: classroom,
        message: "Classroom fetched successfully",
        statusCode: 200,
    };
}

export async function getClassrooms(communityId: number, viewDrafts: boolean = true) {
    const supabase = await createSupabaseServerClient();

    const query = supabase
        .from("classrooms")
        .select("*")
        .eq("community_id", communityId);

    if (!viewDrafts) {
        query.eq("is_draft", false);
    }

    const { data: classrooms, error: classroomsError } = await query;

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

// MEMBER CLASSROOM PROGRESS

export async function removeMemberClassroomAccess(
    userId: string,
    communityId: number,
    classroomId: number
): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const currentUser = await getUserData();

    if (!currentUser) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        const { error: deleteError } = await supabase
            .from("community_member_classrooms")
            .delete()
            .eq("user_id", userId)
            .eq("community_id", communityId)
            .eq("classroom_id", classroomId);

        if (deleteError) {
            console.error("Error removing classroom access:", deleteError);
            return {
                error: "Error removing access",
                message: "Error removing classroom access",
                statusCode: 500,
            };
        }

        return {
            data: undefined,
            message: "Access removed successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in removeMemberClassroomAccess:", error);
        return {
            error: "Error removing access",
            message: "Error removing classroom access",
            statusCode: 500,
        };
    }
}

export async function getAvailableClassroomsForMember(
    userId: string,
    communityId: number
): Promise<GeneralResponse<Array<Tables<"classrooms">>>> {
    const supabase = await createSupabaseServerClient();

    try {
        // Get all classrooms in the community (excluding drafts)
        const { data: allClassrooms, error: classroomsError } = await supabase
            .from("classrooms")
            .select("*")
            .eq("community_id", communityId)
            .eq("is_draft", false)
            .order("name");

        if (classroomsError) {
            console.error("Error fetching classrooms:", classroomsError);
            return {
                error: "Error fetching classrooms",
                message: "Error fetching available classrooms",
                statusCode: 500,
            };
        }

        // Get classrooms the member has already joined
        const { data: joinedClassrooms, error: joinedError } = await supabase
            .from("community_member_classrooms")
            .select("classroom_id")
            .eq("user_id", userId)
            .eq("community_id", communityId);

        if (joinedError) {
            console.error("Error fetching joined classrooms:", joinedError);
            return {
                error: "Error fetching joined classrooms",
                message: "Error fetching joined classrooms",
                statusCode: 500,
            };
        }

        const joinedClassroomIds = joinedClassrooms?.map(jc => jc.classroom_id) || [];

        // Filter out already joined classrooms
        const availableClassrooms = allClassrooms?.filter(
            classroom => !joinedClassroomIds.includes(classroom.id)
        ) || [];

        return {
            data: availableClassrooms,
            message: "Available classrooms fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in getAvailableClassroomsForMember:", error);
        return {
            error: "Error fetching classrooms",
            message: "Error fetching available classrooms",
            statusCode: 500,
        };
    }
}

export async function giveClassroomAccessToMember(
    userId: string,
    communityId: number,
    classroomIds: number[]
): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const currentUser = await getUserData();

    if (!currentUser) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Create rows for each classroom
        const rows = classroomIds.map(classroomId => ({
            user_id: userId,
            community_id: communityId,
            classroom_id: classroomId,
            progress_lessons: "[]",
        }));

        const { data: insertedRecords, error: insertError } = await supabase
            .from("community_member_classrooms")
            .insert(rows)
            .select("id, classroom_id");

        if (insertError || !insertedRecords) {
            console.error("Error giving classroom access:", insertError);
            return {
                error: "Error giving access",
                message: "Error giving classroom access",
                statusCode: 500,
            };
        }

        // Fetch classroom details to check if they're paid
        const { data: classrooms, error: classroomsError } = await supabase
            .from("classrooms")
            .select("id, type, amount_one_time")
            .in("id", classroomIds);

        if (classroomsError) {
            console.error("Error fetching classroom details:", classroomsError);
            // Don't fail the operation if we can't fetch classroom details
        } else if (classrooms) {
            // Create zero-amount payment records for paid classrooms
            const paymentRecords = insertedRecords
                .map(record => {
                    const classroom = classrooms.find(c => c.id === record.classroom_id);
                    if (classroom && classroom.type === "ONE_TIME_PAYMENT" && classroom.amount_one_time != null) {
                        return {
                            user_id: userId,
                            comm_id: communityId,
                            community_member_classrooms_id: record.id,
                            amount: 0, // Zero amount for admin-granted access
                            type: "CLASSROOM_ONE_TIME_PAYMENT" as const,
                            status: "PAID" as const,
                        };
                    }
                    return null;
                })
                .filter((record): record is NonNullable<typeof record> => record !== null);

            if (paymentRecords.length > 0) {
                const { error: paymentError } = await (supabase as any)
                    .from("payments")
                    .insert(paymentRecords);

                if (paymentError) {
                    console.error("Error creating payment records:", paymentError);
                    // Don't fail the operation if payment records fail, just log it
                }
            }
        }

        return {
            data: undefined,
            message: "Access granted successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in giveClassroomAccessToMember:", error);
        return {
            error: "Error giving access",
            message: "Error giving classroom access",
            statusCode: 500,
        };
    }
}

export async function getMemberClassroomProgress(
    userId: string,
    communityId: number
): Promise<GeneralResponse<Array<{
    classroom: Tables<"classrooms">;
    progress_lessons: number[];
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
}>>> {
    const supabase = await createSupabaseServerClient();

    try {
        // Get all classrooms the member has joined
        const { data: memberClassrooms, error: memberError } = await supabase
            .from("community_member_classrooms")
            .select(`
                classroom_id,
                progress_lessons,
                classrooms (*)
            `)
            .eq("user_id", userId)
            .eq("community_id", communityId);

        if (memberError) {
            console.error("Error fetching member classrooms:", memberError);
            return {
                error: "Error fetching progress",
                message: "Error fetching classroom progress",
                statusCode: 500,
            };
        }

        if (!memberClassrooms || memberClassrooms.length === 0) {
            return {
                data: [],
                message: "No classrooms found",
                statusCode: 200,
            };
        }

        // Get lesson counts for each classroom
        const progressData = await Promise.all(
            memberClassrooms.map(async (mc: any) => {
                const classroom = mc.classrooms;
                
                // Count total lessons in this classroom
                const { data: modules } = await supabase
                    .from("modules")
                    .select("id")
                    .eq("classroom_id", classroom.id);

                const moduleIds = modules?.map(m => m.id) || [];
                
                const { count: totalLessons } = await supabase
                    .from("lessons")
                    .select("*", { count: "exact", head: true })
                    .in("module_id", moduleIds);

                // Parse completed lessons
                let completedLessonsArray: number[] = [];
                if (mc.progress_lessons) {
                    try {
                        completedLessonsArray = JSON.parse(mc.progress_lessons);
                    } catch (e) {
                        completedLessonsArray = [];
                    }
                }

                const completedCount = completedLessonsArray.length;
                const total = totalLessons || 0;
                const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

                return {
                    classroom,
                    progress_lessons: completedLessonsArray,
                    total_lessons: total,
                    completed_lessons: completedCount,
                    progress_percentage: percentage,
                };
            })
        );

        return {
            data: progressData,
            message: "Progress fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in getMemberClassroomProgress:", error);
        return {
            error: "Error fetching progress",
            message: "Error fetching classroom progress",
            statusCode: 500,
        };
    }
}

export async function toggleLessonCompletion(
    userId: string,
    communityId: number,
    classroomId: number,
    lessonId: number,
    isCompleted: boolean
): Promise<GeneralResponse<{ progress_lessons: string | null }>> {
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
        // Get current progress
        const { data: existingProgress, error: fetchError } = await supabase
            .from("community_member_classrooms")
            .select("progress_lessons")
            .eq("user_id", userId)
            .eq("community_id", communityId)
            .eq("classroom_id", classroomId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching progress:", fetchError);
            return {
                error: "Error fetching progress",
                message: "Error fetching progress",
                statusCode: 500,
            };
        }

        // Parse existing progress or initialize empty array
        let completedLessons: number[] = [];
        if (existingProgress?.progress_lessons) {
            try {
                completedLessons = JSON.parse(existingProgress.progress_lessons);
            } catch (e) {
                completedLessons = [];
            }
        }

        // Toggle lesson completion
        if (isCompleted) {
            // Add lesson if not already in array
            if (!completedLessons.includes(lessonId)) {
                completedLessons.push(lessonId);
            }
        } else {
            // Remove lesson from array
            completedLessons = completedLessons.filter(id => id !== lessonId);
        }

        const updatedProgress = JSON.stringify(completedLessons);

        // Update or insert progress
        if (existingProgress) {
            const { error: updateError } = await supabase
                .from("community_member_classrooms")
                .update({ progress_lessons: updatedProgress })
                .eq("user_id", userId)
                .eq("community_id", communityId)
                .eq("classroom_id", classroomId);

            if (updateError) {
                console.error("Error updating progress:", updateError);
                return {
                    error: "Error updating progress",
                    message: "Error updating progress",
                    statusCode: 500,
                };
            }
        } else {
            const { error: insertError } = await supabase
                .from("community_member_classrooms")
                .insert({
                    user_id: userId,
                    community_id: communityId,
                    classroom_id: classroomId,
                    progress_lessons: updatedProgress,
                });

            if (insertError) {
                console.error("Error creating progress:", insertError);
                return {
                    error: "Error creating progress",
                    message: "Error creating progress",
                    statusCode: 500,
                };
            }
        }

        return {
            data: { progress_lessons: updatedProgress },
            message: isCompleted ? "Lesson marked as completed" : "Lesson marked as incomplete",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in toggleLessonCompletion:", error);
        return {
            error: "Error updating progress",
            message: "Error updating lesson progress",
            statusCode: 500,
        };
    }
}

export async function createMemberClassroomProgress(
    userId: string,
    communityId: number,
    classroomId: number
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

    try {
        // Check if the record already exists
        const { data: existing, error: checkError } = await supabase
            .from("community_member_classrooms")
            .select("id")
            .eq("user_id", userId)
            .eq("community_id", communityId)
            .eq("classroom_id", classroomId)
            .single();

        if (existing) {
            // Record already exists, no need to insert
            return {
                data: undefined,
                message: "Progress already exists",
                statusCode: 200,
            };
        }

        // Insert new record
        const { data: newRecord, error: insertError } = await supabase
            .from("community_member_classrooms")
            .insert({
                user_id: userId,
                community_id: communityId,
                classroom_id: classroomId,
                progress_lessons: null,
            })
            .select("id")
            .single();

        if (insertError || !newRecord) {
            console.error("Error creating member classroom progress:", insertError);
            return {
                error: "Error creating progress",
                message: "Error creating classroom progress",
                statusCode: 500,
            };
        }

        // Fetch classroom details to get the amount
        const { data: classroom, error: classroomError } = await supabase
            .from("classrooms")
            .select("amount_one_time, type")
            .eq("id", classroomId)
            .single();

        if (classroomError) {
            console.error("Error fetching classroom details:", classroomError);
            // Don't fail the operation if we can't fetch classroom details
        } else if (classroom && classroom.type === "ONE_TIME_PAYMENT" && classroom.amount_one_time != null) {
            // Create payment record for paid classroom
            const { error: paymentError } = await (supabase as any)
                .from("payments")
                .insert({
                    user_id: userId,
                    comm_id: communityId,
                    community_member_classrooms_id: newRecord.id,
                    amount: Number(classroom.amount_one_time),
                    type: "CLASSROOM_ONE_TIME_PAYMENT",
                    status: "PAID",
                });

            if (paymentError) {
                console.error("Error creating payment record:", paymentError);
                // Don't fail the operation if payment record fails, just log it
            }
        }

        const { data: community, error: communityError } = await supabase.from("communities").select("slug").eq("id", communityId).single();
        if (communityError) {
            console.error("Error getting community:", communityError);
            return {
                error: "Error getting community",
                message: "Error getting community",
                statusCode: 500,
            };
        }

        revalidatePath(`/communities/${community.slug}/classrooms`);

        return {
            data: undefined,
            message: "Progress created successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in createMemberClassroomProgress:", error);
        return {
            error: "Error creating progress",
            message: "Error creating classroom progress",
            statusCode: 500,
        };
    }
}