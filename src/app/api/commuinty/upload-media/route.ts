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
        
        // Get the community to get the community_id
        const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('id')
            .eq('slug', commSlug)
            .single();

        if (communityError || !community) {
            return NextResponse.json(
                { error: 'Community not found' },
                { status: 404 }
            );
        }

        // Step 1: Create media record in database first with placeholder URL
        const { data: mediaRecord, error: insertError } = await supabase
            .from('community_gallery_media')
            .insert({
                community_id: community.id,
                type: 'image',
                url: '' // Placeholder, will be updated after upload
            })
            .select()
            .single();

        if (insertError || !mediaRecord) {
            console.error("Error creating media record:", insertError);
            return NextResponse.json(
                { error: 'Failed to create media record' },
                { status: 500 }
            );
        }

        // Step 2: Upload file to storage with path: community_media/{slug}/media-{media_id}.{fileType}
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `${commSlug}/media-${mediaRecord.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('community_media')
            .upload(filePath, file, {
                upsert: false
            });

        if (uploadError) {
            console.error("Error uploading media file:", uploadError);
            // Delete the media record if upload fails
            await supabase
                .from('community_gallery_media')
                .delete()
                .eq('id', mediaRecord.id);
            
            return NextResponse.json(
                { error: 'Failed to upload media file' },
                { status: 500 }
            );
        }

        // Step 3: Get public URL and update the media record
        const { data: { publicUrl } } = supabase.storage
            .from('community_media')
            .getPublicUrl(filePath);

        const { error: updateError } = await supabase
            .from('community_gallery_media')
            .update({ url: publicUrl })
            .eq('id', mediaRecord.id);

        if (updateError) {
            console.error("Error updating media record:", updateError);
            // Try to delete the uploaded file if update fails
            await supabase.storage
                .from('community_media')
                .remove([filePath]);
            // Delete the media record
            await supabase
                .from('community_gallery_media')
                .delete()
                .eq('id', mediaRecord.id);
            
            return NextResponse.json(
                { error: 'Failed to update media record' },
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
            mediaId: mediaRecord.id,
            message: 'Media uploaded successfully'
        });

    } catch (error) {
        console.error('Error in upload media API:', error);
        return NextResponse.json(
            { error: 'Failed to upload media' },
            { status: 500 }
        );
    }
}
