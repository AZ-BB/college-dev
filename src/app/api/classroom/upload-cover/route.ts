import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminServerClient, createSupabaseServerClient } from '@/utils/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for file uploads

/**
 * Upload cover image for a classroom
 * POST /api/classroom/upload-cover
 * Body: FormData with 'file' and 'classroomId'
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const classroomId = formData.get('classroomId') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!classroomId) {
            return NextResponse.json(
                { error: 'No classroom ID provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Please select an image file' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Image size should be less than 10MB' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseAdminServerClient();

        // Verify classroom exists
        const { data: classroom, error: classroomError } = await supabase
            .from('classrooms')
            .select('id')
            .eq('id', parseInt(classroomId))
            .single();

        if (classroomError || !classroom) {
            return NextResponse.json(
                { error: 'Classroom not found' },
                { status: 404 }
            );
        }

        // Upload cover: classrooms/{classroom_id}/cover.{extension}
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `${classroomId}/cover.${fileExt}`;
        const bucketName = 'classrooms';

        // Check if old cover exists
        let useUpsert = false;
        const { data: existingClassroom } = await supabase
            .from('classrooms')
            .select('cover_url')
            .eq('id', parseInt(classroomId))
            .single();

        if (existingClassroom?.cover_url) {
            try {
                const urlParts = existingClassroom.cover_url.split(`/${bucketName}/`);
                if (urlParts.length > 1) {
                    const oldFilePath = urlParts[1];
                    const oldFileExt = oldFilePath.split('.').pop()?.toLowerCase();
                    if (oldFileExt === fileExt) {
                        useUpsert = true;
                    } else {
                        // Delete old file if extension differs
                        await supabase.storage
                            .from(bucketName)
                            .remove([oldFilePath]);
                    }
                }
            } catch (error) {
                console.error('Error checking/deleting old cover:', error);
            }
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                upsert: useUpsert,
                contentType: file.type,
            });

        if (uploadError) {
            console.error("Error uploading cover image:", uploadError);
            console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
            return NextResponse.json(
                { error: `Failed to upload cover image: ${uploadError.message || 'Unknown error'}` },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            path: filePath,
            message: 'Cover image uploaded successfully'
        });

    } catch (error) {
        console.error('Error in classroom upload cover API:', error);
        return NextResponse.json(
            { error: 'Failed to upload cover image' },
            { status: 500 }
        );
    }
}
