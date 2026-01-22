import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminServerClient, createSupabaseServerClient } from '@/utils/supabase-server';
import { getUserData } from '@/utils/get-user-data';
import { Classroom } from '@/app/(public)/communities/[slug]/(no-side-card)/classrooms/[id]/edit/_components/types';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for large payloads

/**
 * Helper function to check if a string is a UUID
 */
function isUUID(str: string | number): boolean {
    if (typeof str === 'number') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Helper function to convert base64 to buffer
 */
function base64ToBuffer(base64: string): { buffer: Buffer; mimeType: string; extension: string } {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid base64 data URL format');
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Determine extension from mime type
    const extension = mimeType.split('/')[1]?.split(';')[0] || 'bin';
    
    const buffer = Buffer.from(base64Data, 'base64');
    return { buffer, mimeType, extension };
}

/**
 * Update classroom with all modules, lessons, and resources
 * POST /api/classroom/update
 * Body: { classroom: Classroom }
 */
export async function POST(request: NextRequest) {
    console.log('[Classroom Update API] Route called');
    try {
        const body = await request.json();
        const { classroom }: { classroom: Classroom } = body;

        console.log('[Classroom Update API] Received classroom data:', {
            id: classroom?.id,
            name: classroom?.name,
            isInfoEdited: classroom?.isInfoEdited,
            isCoverEdited: classroom?.isCoverEdited,
            is_draft: classroom?.is_draft,
            modulesCount: classroom?.modules?.length || 0,
        });

        if (!classroom || !classroom.id) {
            console.error('[Classroom Update API] Missing required fields');
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    message: 'classroom with id is required',
                    statusCode: 400,
                },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseAdminServerClient();
        const user = await getUserData();

        console.log('[Classroom Update API] User authenticated:', !!user, user ? { id: user.id, email: user.email } : null);

        if (!user) {
            console.error('[Classroom Update API] User not authenticated');
            return NextResponse.json(
                {
                    error: 'User not authenticated',
                    message: 'User not authenticated',
                    statusCode: 401,
                },
                { status: 401 }
            );
        }

        const classroomId = classroom.id;
        console.log('[Classroom Update API] Processing classroom ID:', classroomId);

        // Verify classroom exists
        console.log('[Classroom Update API] Verifying classroom exists...');
        const { data: existingClassroom, error: classroomCheckError } = await supabase
            .from('classrooms')
            .select('id, is_draft')
            .eq('id', classroomId)
            .single();

        if (classroomCheckError || !existingClassroom) {
            console.error('[Classroom Update API] Classroom not found:', classroomCheckError);
            return NextResponse.json(
                {
                    error: 'Classroom not found',
                    message: 'Classroom not found',
                    statusCode: 404,
                },
                { status: 404 }
            );
        }

        console.log('[Classroom Update API] Classroom found:', {
            id: existingClassroom.id,
            current_is_draft: existingClassroom.is_draft,
            new_is_draft: classroom.is_draft,
        });

        // 1. Update classroom info if isInfoEdited
        if (classroom.isInfoEdited) {
            console.log('[Classroom Update API] Updating classroom info...');
            const updateData: any = {
                name: classroom.name,
                description: classroom.description,
                type: classroom.type,
                amount_one_time: classroom.amount_one_time,
                time_unlock_in_days: classroom.time_unlock_in_days,
                updated_at: new Date().toISOString(),
            };

            console.log('[Classroom Update API] Update data:', updateData);
            const { error: updateError } = await supabase
                .from('classrooms')
                .update(updateData)
                .eq('id', classroomId);

            if (updateError) {
                console.error('[Classroom Update API] Error updating classroom info:', updateError);
                return NextResponse.json(
                    {
                        error: 'Error updating classroom info',
                        message: 'Error updating classroom info',
                        statusCode: 500,
                    },
                    { status: 500 }
                );
            }
            console.log('[Classroom Update API] Classroom info updated successfully');
        } else {
            console.log('[Classroom Update API] Skipping classroom info update (not edited)');
        }

        // Update is_draft directly from classroom object (no special logic)
        if (classroom.is_draft !== undefined) {
            console.log('[Classroom Update API] Updating is_draft to:', classroom.is_draft);
            const { error: draftUpdateError } = await supabase
                .from('classrooms')
                .update({ is_draft: classroom.is_draft })
                .eq('id', classroomId);

            if (draftUpdateError) {
                console.error('[Classroom Update API] Error updating is_draft:', draftUpdateError);
                return NextResponse.json(
                    {
                        error: 'Error updating is_draft',
                        message: 'Error updating is_draft',
                        statusCode: 500,
                    },
                    { status: 500 }
                );
            }
            console.log('[Classroom Update API] is_draft updated successfully');
        }

        // 2. Handle cover upload if isCoverEdited
        console.log('[Classroom Update API] Checking cover upload:', {
            isCoverEdited: classroom.isCoverEdited,
            hasCoverUrl: !!classroom.cover_url,
        });
        if (classroom.isCoverEdited && classroom.cover_url) {
            console.log('[Classroom Update API] Processing cover upload...');
            try {
                // Check if cover_url is base64
                if (classroom.cover_url.startsWith('data:')) {
                    console.log('[Classroom Update API] Cover is base64, converting and uploading...');
                    const { buffer, mimeType, extension } = base64ToBuffer(classroom.cover_url);
                    
                    const filePath = `${classroomId}/cover.${extension}`;
                    const bucketName = 'classrooms';

                    console.log('[Classroom Update API] Uploading cover to:', filePath, 'Size:', buffer.length, 'bytes');

                    // Upload to Supabase Storage with upsert
                    const { error: uploadError } = await supabase.storage
                        .from(bucketName)
                        .upload(filePath, buffer, {
                            upsert: true,
                            contentType: mimeType,
                        });

                    if (uploadError) {
                        console.error('[Classroom Update API] Error uploading cover:', uploadError);
                        return NextResponse.json(
                            {
                                error: 'Error uploading cover',
                                message: 'Error uploading cover',
                                statusCode: 500,
                            },
                            { status: 500 }
                        );
                    }

                    console.log('[Classroom Update API] Cover uploaded successfully');

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(filePath);

                    console.log('[Classroom Update API] Cover public URL:', publicUrl);

                    // Update cover_url in database
                    const { error: updateCoverError } = await supabase
                        .from('classrooms')
                        .update({ cover_url: publicUrl })
                        .eq('id', classroomId);

                    if (updateCoverError) {
                        console.error('[Classroom Update API] Error updating cover_url:', updateCoverError);
                    } else {
                        console.log('[Classroom Update API] Cover URL updated in database');
                    }
                } else {
                    console.log('[Classroom Update API] Cover is already a URL, updating database...');
                    // If it's already a URL, just update it
                    const { error: updateCoverError } = await supabase
                        .from('classrooms')
                        .update({ cover_url: classroom.cover_url })
                        .eq('id', classroomId);

                    if (updateCoverError) {
                        console.error('[Classroom Update API] Error updating cover_url:', updateCoverError);
                    } else {
                        console.log('[Classroom Update API] Cover URL updated in database');
                    }
                }
            } catch (error) {
                console.error('Error handling cover upload:', error);
                return NextResponse.json(
                    {
                        error: 'Error handling cover upload',
                        message: 'Error handling cover upload',
                        statusCode: 500,
                    },
                    { status: 500 }
                );
            }
        }

        // 3. Create mapping for UUID to actual DB IDs
        const moduleIdMap = new Map<string | number, number>(); // UUID/oldId -> newId
        const lessonIdMap = new Map<string | number, number>(); // UUID/oldId -> newId

        console.log('[Classroom Update API] Starting module processing. Total modules:', classroom.modules.length);

        // 4. Process modules
        for (const module of classroom.modules) {
            console.log('[Classroom Update API] Processing module:', {
                id: module.id,
                name: module.name,
                isUUID: isUUID(module.id),
                isDeleted: module.isDeleted,
                isEdited: module.isEdited,
            });
            // Skip deleted modules with UUID (they don't exist in DB)
            if (module.isDeleted && isUUID(module.id)) {
                console.log('[Classroom Update API] Skipping deleted module with UUID:', module.id);
                continue;
            }

            // Delete module if isDeleted and ID is number
            if (module.isDeleted && !isUUID(module.id)) {
                const moduleId = typeof module.id === 'number' ? module.id : parseInt(module.id as string);
                console.log('[Classroom Update API] Deleting module:', moduleId);
                const { error: deleteError } = await supabase
                    .from('modules')
                    .delete()
                    .eq('id', moduleId);

                if (deleteError) {
                    console.error('[Classroom Update API] Error deleting module:', deleteError);
                } else {
                    console.log('[Classroom Update API] Module deleted successfully');
                }
                continue;
            }

            // Insert new module if UUID
            if (isUUID(module.id)) {
                console.log('[Classroom Update API] Inserting new module with UUID:', module.id);
                const { data: newModule, error: insertError } = await supabase
                    .from('modules')
                    .insert({
                        classroom_id: classroomId,
                        name: module.name,
                        description: module.description,
                        index: module.index,
                    })
                    .select()
                    .single();

                if (insertError || !newModule) {
                    console.error('[Classroom Update API] Error inserting module:', insertError);
                    return NextResponse.json(
                        {
                            error: 'Error inserting module',
                            message: 'Error inserting module',
                            statusCode: 500,
                        },
                        { status: 500 }
                    );
                }

                console.log('[Classroom Update API] Module inserted successfully. UUID:', module.id, '-> DB ID:', newModule.id);
                moduleIdMap.set(module.id, newModule.id);
            } else {
                // Update existing module if isEdited
                if (module.isEdited) {
                    console.log('[Classroom Update API] Updating existing module:', module.id);
                    const moduleId = typeof module.id === 'number' ? module.id : parseInt(module.id as string);
                    const { error: updateError } = await supabase
                        .from('modules')
                        .update({
                            name: module.name,
                            description: module.description,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', moduleId);

                    if (updateError) {
                        console.error('[Classroom Update API] Error updating module:', updateError);
                        return NextResponse.json(
                            {
                                error: 'Error updating module',
                                message: 'Error updating module',
                                statusCode: 500,
                            },
                            { status: 500 }
                        );
                    }
                    console.log('[Classroom Update API] Module updated successfully');
                } else {
                    console.log('[Classroom Update API] Module not edited, skipping update');
                }

                moduleIdMap.set(module.id, module.id as number);
            }
        }

        console.log('[Classroom Update API] Module ID mapping:', Array.from(moduleIdMap.entries()));
        console.log('[Classroom Update API] Starting lesson processing...');

        // 5. Process lessons
        for (const module of classroom.modules) {
            console.log('[Classroom Update API] Processing lessons for module:', module.id);
            // Skip if module was deleted (UUID) or doesn't exist in map
            const actualModuleId = moduleIdMap.get(module.id);
            if (!actualModuleId) {
                console.log('[Classroom Update API] Skipping lessons for module (not in map):', module.id);
                continue;
            }

            console.log('[Classroom Update API] Processing', module.lessons.length, 'lessons for module:', module.id, '->', actualModuleId);

            for (const lesson of module.lessons) {
                console.log('[Classroom Update API] Processing lesson:', {
                    id: lesson.id,
                    name: lesson.name,
                    isUUID: isUUID(lesson.id),
                    isDeleted: lesson.isDeleted,
                    isEdited: lesson.isEdited,
                    isReorded: lesson.isReorded,
                    isTransefered: lesson.isTransefered,
                });

                // Skip deleted lessons with UUID
                if (lesson.isDeleted && isUUID(lesson.id)) {
                    console.log('[Classroom Update API] Skipping deleted lesson with UUID:', lesson.id);
                    continue;
                }

                // Delete lesson if isDeleted and ID is number
                if (lesson.isDeleted && !isUUID(lesson.id)) {
                    const lessonId = typeof lesson.id === 'number' ? lesson.id : parseInt(lesson.id as string);
                    console.log('[Classroom Update API] Deleting lesson:', lessonId);
                    const { error: deleteError } = await supabase
                        .from('lessons')
                        .delete()
                        .eq('id', lessonId);

                    if (deleteError) {
                        console.error('[Classroom Update API] Error deleting lesson:', deleteError);
                    } else {
                        console.log('[Classroom Update API] Lesson deleted successfully');
                    }
                    continue;
                }

                // Get actual module_id (handle transferred lessons)
                let actualLessonModuleId = actualModuleId;
                if (lesson.isTransefered && lesson.module_id) {
                    console.log('[Classroom Update API] Lesson transferred. Original module_id:', lesson.module_id);
                    const transferredModuleId = moduleIdMap.get(lesson.module_id);
                    if (transferredModuleId) {
                        actualLessonModuleId = transferredModuleId;
                        console.log('[Classroom Update API] Using mapped module ID:', transferredModuleId);
                    } else if (!isUUID(lesson.module_id)) {
                        // Verify the module exists
                        const moduleId = typeof lesson.module_id === 'number' ? lesson.module_id : parseInt(lesson.module_id as string);
                        console.log('[Classroom Update API] Verifying transferred module exists:', moduleId);
                        const { data: checkModule } = await supabase
                            .from('modules')
                            .select('id')
                            .eq('id', moduleId)
                            .single();
                        
                        if (checkModule) {
                            actualLessonModuleId = moduleId;
                            console.log('[Classroom Update API] Transferred module verified');
                        }
                    }
                }

                // Insert new lesson if UUID
                if (isUUID(lesson.id)) {
                    // Double-check: if somehow this UUID was already mapped, skip insertion
                    const existingMappedId = lessonIdMap.get(lesson.id);
                    if (existingMappedId) {
                        console.log('[Classroom Update API] Lesson UUID already mapped, skipping insertion:', lesson.id, '->', existingMappedId);
                        continue;
                    }

                    console.log('[Classroom Update API] Inserting new lesson with UUID:', lesson.id, 'into module:', actualLessonModuleId);
                    const { data: newLesson, error: insertError } = await supabase
                        .from('lessons')
                        .insert({
                            module_id: actualLessonModuleId,
                            name: lesson.name,
                            index: lesson.index, // Always use the provided index for new lessons
                            video_url: lesson.video_url,
                            video_type: lesson.video_type,
                            text_content: lesson.text_content,
                        })
                        .select()
                        .single();

                    if (insertError || !newLesson) {
                        console.error('[Classroom Update API] Error inserting lesson:', insertError);
                        return NextResponse.json(
                            {
                                error: 'Error inserting lesson',
                                message: 'Error inserting lesson',
                                statusCode: 500,
                            },
                            { status: 500 }
                        );
                    }

                    console.log('[Classroom Update API] Lesson inserted successfully. UUID:', lesson.id, '-> DB ID:', newLesson.id, 'with index:', newLesson.index);
                    lessonIdMap.set(lesson.id, newLesson.id);
                } else {
                    // Update existing lesson
                    const lessonId = typeof lesson.id === 'number' ? lesson.id : parseInt(lesson.id as string);
                    const updateData: any = {};

                    if (lesson.isEdited) {
                        updateData.name = lesson.name;
                        updateData.video_url = lesson.video_url;
                        updateData.video_type = lesson.video_type;
                        updateData.text_content = lesson.text_content;
                    }

                    // Always update index if reordered OR if transferred (module change might affect index)
                    if (lesson.isReorded || lesson.isTransefered) {
                        updateData.index = lesson.index;
                        console.log('[Classroom Update API] Updating lesson index due to reorder/transfer:', lesson.index);
                    }

                    if (lesson.isTransefered) {
                        updateData.module_id = actualLessonModuleId;
                    }

                    // Always update if there's any change, or if index needs updating
                    if (Object.keys(updateData).length > 0) {
                        console.log('[Classroom Update API] Updating lesson:', lessonId, 'with data:', updateData);
                        updateData.updated_at = new Date().toISOString();
                        const { error: updateError } = await supabase
                            .from('lessons')
                            .update(updateData)
                            .eq('id', lessonId);

                        if (updateError) {
                            console.error('[Classroom Update API] Error updating lesson:', updateError);
                            return NextResponse.json(
                                {
                                    error: 'Error updating lesson',
                                    message: 'Error updating lesson',
                                    statusCode: 500,
                                },
                                { status: 500 }
                            );
                        }
                        console.log('[Classroom Update API] Lesson updated successfully');
                    } else {
                        // Even if no other changes, check if index needs updating
                        // Get current lesson from DB to compare index
                        const { data: currentLesson } = await supabase
                            .from('lessons')
                            .select('index')
                            .eq('id', lessonId)
                            .single();
                        
                        if (currentLesson && currentLesson.index !== lesson.index) {
                            console.log('[Classroom Update API] Index mismatch detected. Current:', currentLesson.index, 'New:', lesson.index, 'Updating index...');
                            const { error: indexUpdateError } = await supabase
                                .from('lessons')
                                .update({ 
                                    index: lesson.index,
                                    updated_at: new Date().toISOString(),
                                })
                                .eq('id', lessonId);
                            
                            if (indexUpdateError) {
                                console.error('[Classroom Update API] Error updating lesson index:', indexUpdateError);
                            } else {
                                console.log('[Classroom Update API] Lesson index updated successfully');
                            }
                        } else {
                            console.log('[Classroom Update API] Lesson not modified, skipping update');
                        }
                    }

                    lessonIdMap.set(lesson.id, lessonId);
                }
            }
        }

        console.log('[Classroom Update API] Lesson ID mapping:', Array.from(lessonIdMap.entries()));
        console.log('[Classroom Update API] Starting resource processing...');

        // 6. Process resources
        let resourcesProcessed = 0;
        let resourcesInserted = 0;
        let resourcesDeleted = 0;
        let resourcesSkipped = 0;
        
        console.log('[Classroom Update API] Starting resource processing. Total modules:', classroom.modules.length);
        
        for (const module of classroom.modules) {
            console.log('[Classroom Update API] Processing resources for module:', module.id, 'with', module.lessons.length, 'lessons');
            
            for (const lesson of module.lessons) {
                console.log('[Classroom Update API] Checking lesson for resource processing:', {
                    lessonId: lesson.id,
                    isUUID: isUUID(lesson.id),
                    isDeleted: lesson.isDeleted,
                    resourcesCount: lesson.resources?.length || 0,
                });
                
                // Skip if lesson was deleted (UUID) or doesn't exist in map
                const actualLessonId = lessonIdMap.get(lesson.id);
                if (!actualLessonId) {
                    console.log('[Classroom Update API] Skipping resources for lesson (not in map):', lesson.id, {
                        lessonDeleted: lesson.isDeleted,
                        lessonIsUUID: isUUID(lesson.id),
                        mapEntries: Array.from(lessonIdMap.entries()),
                    });
                    resourcesSkipped += lesson.resources?.length || 0;
                    continue;
                }

                console.log('[Classroom Update API] Processing', lesson.resources?.length || 0, 'resources for lesson:', lesson.id, '->', actualLessonId);

                if (!lesson.resources || lesson.resources.length === 0) {
                    console.log('[Classroom Update API] No resources to process for lesson:', lesson.id);
                    continue;
                }

                for (const resource of lesson.resources) {
                    resourcesProcessed++;
                    console.log('[Classroom Update API] Processing resource:', {
                        id: resource.id,
                        type: resource.type,
                        isUUID: isUUID(resource.id),
                        isDeleted: resource.isDeleted,
                        isBase64: resource.url?.startsWith('data:'),
                        hasUrl: !!resource.url,
                        urlLength: resource.url?.length || 0,
                    });

                    // Skip deleted resources with UUID
                    if (resource.isDeleted && isUUID(resource.id)) {
                        console.log('[Classroom Update API] Skipping deleted resource with UUID:', resource.id);
                        continue;
                    }

                    // Delete resource if isDeleted and ID is number
                    if (resource.isDeleted && !isUUID(resource.id)) {
                        const resourceId = typeof resource.id === 'number' ? resource.id : parseInt(resource.id as string);
                        console.log('[Classroom Update API] Deleting resource:', resourceId);
                        const { error: deleteError } = await supabase
                            .from('lesson_resources')
                            .delete()
                            .eq('id', resourceId);

                        if (deleteError) {
                            console.error('[Classroom Update API] Error deleting resource:', deleteError);
                        } else {
                            console.log('[Classroom Update API] Resource deleted successfully');
                            resourcesDeleted++;
                        }
                        continue;
                    }

                    // Insert new resource if UUID (or if it's a string that's not a number)
                    const isNewResource = isUUID(resource.id) || (typeof resource.id === 'string' && isNaN(Number(resource.id)));
                    
                    if (isNewResource) {
                        console.log('[Classroom Update API] Found new resource, proceeding to insert:', {
                            resourceId: resource.id,
                            isUUID: isUUID(resource.id),
                            isString: typeof resource.id === 'string',
                        });
                        
                        if (!resource.url) {
                            console.error('[Classroom Update API] Resource missing URL, skipping:', resource.id);
                            continue;
                        }
                        
                        let resourceUrl = resource.url;
                        let fileName = resource.file_name;
                        let fileType = resource.file_type;
                        let fileSize = resource.file_size;

                        // Handle file upload if type is FILE and url is base64
                        if (resource.type === 'FILE' && resource.url && resource.url.startsWith('data:')) {
                            try {
                                console.log('[Classroom Update API] Resource is FILE with base64, converting and uploading...');
                                const { buffer, mimeType, extension } = base64ToBuffer(resource.url);
                                
                                // Generate filename: UUID-{filename}.{ext}
                                const resourceUuid = uuidv4();
                                const sanitizedFileName = (resource.file_name || 'file')
                                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                                    .replace(/\.[^/.]+$/, ''); // Remove existing extension
                                
                                const filePath = `${classroomId}/${resourceUuid}-${sanitizedFileName}.${extension}`;
                                const bucketName = 'classrooms';

                                console.log('[Classroom Update API] Uploading resource file to:', filePath, 'Size:', buffer.length, 'bytes');

                                // Upload to Supabase Storage
                                const { error: uploadError } = await supabase.storage
                                    .from(bucketName)
                                    .upload(filePath, buffer, {
                                        upsert: false,
                                        contentType: mimeType,
                                    });

                                if (uploadError) {
                                    console.error('[Classroom Update API] Error uploading resource file:', uploadError);
                                    return NextResponse.json(
                                        {
                                            error: 'Error uploading resource file',
                                            message: 'Error uploading resource file',
                                            statusCode: 500,
                                        },
                                        { status: 500 }
                                    );
                                }

                                console.log('[Classroom Update API] Resource file uploaded successfully');

                                // Get public URL
                                const { data: { publicUrl } } = supabase.storage
                                    .from(bucketName)
                                    .getPublicUrl(filePath);

                                console.log('[Classroom Update API] Resource public URL:', publicUrl);

                                resourceUrl = publicUrl;
                                fileName = resource.file_name || `${sanitizedFileName}.${extension}`;
                                fileType = extension;
                                fileSize = buffer.length;
                            } catch (error) {
                                console.error('[Classroom Update API] Error processing resource file:', error);
                                return NextResponse.json(
                                    {
                                        error: 'Error processing resource file',
                                        message: 'Error processing resource file',
                                        statusCode: 500,
                                    },
                                    { status: 500 }
                                );
                            }
                        }

                        // Insert resource
                        console.log('[Classroom Update API] Inserting resource into database:', {
                            lesson_id: actualLessonId,
                            type: resource.type,
                            url: resourceUrl?.substring(0, 100) + '...',
                        });
                        const { error: insertError } = await supabase
                            .from('lesson_resources')
                            .insert({
                                lesson_id: actualLessonId,
                                url: resourceUrl,
                                type: resource.type,
                                link_name: resource.link_name,
                                file_name: fileName,
                                file_type: fileType,
                                file_size: fileSize,
                            });

                        if (insertError) {
                            console.error('[Classroom Update API] Error inserting resource:', insertError);
                            return NextResponse.json(
                                {
                                    error: 'Error inserting resource',
                                    message: 'Error inserting resource',
                                    statusCode: 500,
                                },
                                { status: 500 }
                            );
                        }
                        console.log('[Classroom Update API] Resource inserted successfully');
                        resourcesInserted++;
                    } else {
                        console.log('[Classroom Update API] Resource is not a UUID (existing resource), skipping (no update flag):', resource.id);
                        // Note: Resources don't have an isEdited flag, so we don't update existing resources
                    }
                }
            }
        }

        console.log('[Classroom Update API] Resource processing complete:', {
            processed: resourcesProcessed,
            inserted: resourcesInserted,
            deleted: resourcesDeleted,
            skipped: resourcesSkipped,
        });

        console.log('[Classroom Update API] Classroom update completed successfully');
        return NextResponse.json({
            message: 'Classroom updated successfully',
            statusCode: 200,
        });
    } catch (error) {
        console.error('[Classroom Update API] Error in updateClassroom API:', error);
        return NextResponse.json(
            {
                error: 'Error updating classroom',
                message: 'Error updating classroom',
                statusCode: 500,
            },
            { status: 500 }
        );
    }
}
