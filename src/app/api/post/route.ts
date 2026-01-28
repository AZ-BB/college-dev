import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';
import { getUserData } from '@/utils/get-user-data';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for file uploads

/**
 * Upload image for a post
 * POST /api/post
 * Body: FormData with 'file' and 'postId'
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const postId = formData.get('postId') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!postId) {
            return NextResponse.json(
                { error: 'No post ID provided' },
                { status: 400 }
            );
        }

        // Validate file type - only images
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

        const supabase = await createSupabaseServerClient();
        const user = await getUserData();

        if (!user) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Verify post exists and user has permission
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('id, author_id')
            .eq('id', parseInt(postId))
            .single();

        if (postError || !post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Verify user is the author of the post
        if (post.author_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Upload image: posts/{post_id}/{UUID-name}.{extension}
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
        const uuid = uuidv4();
        const filePath = `${postId}/${sanitizedFileName}-${uuid}.${fileExt}`;
        const bucketName = 'posts';

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                upsert: false,
                contentType: file.type,
            });

        if (uploadError) {
            console.error("Error uploading image:", uploadError);
            console.error("Upload error details:", JSON.stringify(uploadError, null, 2));
            return NextResponse.json(
                { error: `Failed to upload image: ${uploadError.message || 'Unknown error'}` },
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
            message: 'Image uploaded successfully'
        });

    } catch (error) {
        console.error('Error in post image upload API:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
