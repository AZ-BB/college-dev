import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminServerClient, createSupabaseServerClient } from '@/utils/supabase-server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for file uploads

/**
 * Upload resource file for a classroom
 * POST /api/classroom/upload-resource
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

        // Validate file size (max 50MB for resources)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size should be less than 50MB' },
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

        // Upload resource: classrooms/{classroom_id}/{resource-file-name}-{UUID}.{extension}
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
        const uuid = uuidv4();
        const filePath = `${classroomId}/${sanitizedFileName}-${uuid}.${fileExt}`;
        const bucketName = 'classrooms';

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                upsert: false,
                contentType: file.type,
            });

        if (uploadError) {
            console.error("Error uploading resource file:", uploadError);
            console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
            return NextResponse.json(
                { error: `Failed to upload resource file: ${uploadError.message || 'Unknown error'}` },
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
            fileName: file.name,
            fileSize: file.size,
            message: 'Resource file uploaded successfully'
        });

    } catch (error) {
        console.error('Error in classroom upload resource API:', error);
        return NextResponse.json(
            { error: 'Failed to upload resource file' },
            { status: 500 }
        );
    }
}
