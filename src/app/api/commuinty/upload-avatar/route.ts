import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const commSlug = formData.get('commSlug') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!commSlug) {
            return NextResponse.json(
                { error: 'No community slug provided' },
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

        const supabase = await createSupabaseServerClient();

        // Get the community to find the old avatar image
        const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('id, avatar')
            .eq('slug', commSlug)
            .single();

        if (communityError || !community) {
            return NextResponse.json(
                { error: 'Community not found' },
                { status: 404 }
            );
        }

        // Get new file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `${commSlug}/avatar.${fileExt}`;

        // Check if old avatar exists and extract its file type
        let useUpsert = false;

        if (community.avatar) {
            try {
                // Extract the file path from the URL
                // URL format: https://[project].supabase.co/storage/v1/object/public/community_media/[path]
                const urlParts = community.avatar.split('/community_media/');
                if (urlParts.length > 1) {
                    const oldFilePath = urlParts[1];
                    // Extract old file extension
                    const oldFileExt = oldFilePath.split('.').pop()?.toLowerCase();

                    // If file types match, use upsert (don't delete)
                    if (oldFileExt === fileExt) {
                        useUpsert = true;
                    } else {
                        // File types differ, delete old one
                        await supabase.storage
                            .from('community_media')
                            .remove([oldFilePath]);
                    }
                }
            } catch (error) {
                // Log error but continue with upload
                console.error('Error checking/deleting old avatar image:', error);
                // If we can't check, default to not using upsert
                useUpsert = false;
            }
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('community_media')
            .upload(filePath, file, {
                upsert: useUpsert
            });

        if (uploadError) {
            console.error("Error uploading avatar image:", uploadError);
            return NextResponse.json(
                { error: 'Failed to upload avatar image' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('community_media')
            .getPublicUrl(filePath);

        // Update the community's avatar column
        const { error: updateError } = await supabase
            .from('communities')
            .update({ avatar: publicUrl })
            .eq('id', community.id);

        if (updateError) {
            console.error("Error updating community avatar:", updateError);
            // Try to delete the uploaded file if update fails
            await supabase.storage
                .from('community_media')
                .remove([filePath]);

            return NextResponse.json(
                { error: 'Failed to update community avatar' },
                { status: 500 }
            );
        }

        // Revalidate the community page to clear Next.js cache
        revalidatePath(`/communities/${commSlug}`);
        revalidatePath(`/communities/${commSlug}`, 'layout');

        // Return URL with cache-busting parameter for immediate client update
        const cacheBustingUrl = `${publicUrl}?t=${Date.now()}`;

        return NextResponse.json({
            url: cacheBustingUrl,
            message: 'Avatar image uploaded successfully'
        });

    } catch (error) {
        console.error('Error in upload avatar API:', error);
        return NextResponse.json(
            { error: 'Failed to upload avatar image' },
            { status: 500 }
        );
    }
}
