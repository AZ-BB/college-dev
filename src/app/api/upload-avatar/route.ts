import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'No userId provided' },
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

        // Validate file size (max 10MB for API route, more generous than server actions)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Image size should be less than 10MB' },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();
        
        // Generate unique filename with user folder
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Error uploading avatar:", uploadError);
            return NextResponse.json(
                { error: 'Failed to upload avatar' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            message: 'Avatar uploaded successfully'
        });

    } catch (error) {
        console.error('Error in upload avatar API:', error);
        return NextResponse.json(
            { error: 'Failed to upload avatar' },
            { status: 500 }
        );
    }
}

