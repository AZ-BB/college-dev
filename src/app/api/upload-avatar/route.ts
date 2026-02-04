import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;
const ALLOWED_MIME_PREFIX = 'image/';

// Magic bytes for image types (client MIME can be spoofed)
const IMAGE_SIGNATURES: { ext: (typeof ALLOWED_EXTENSIONS)[number]; check: (buf: Uint8Array) => boolean }[] = [
    { ext: 'jpg', check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { ext: 'jpeg', check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { ext: 'png', check: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a },
    { ext: 'gif', check: (b) => b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 && (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61 },
    { ext: 'webp', check: (b) => b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
];

async function getDetectedImageExtension(file: File): Promise<(typeof ALLOWED_EXTENSIONS)[number] | null> {
    const head = await file.slice(0, 12).arrayBuffer();
    const buf = new Uint8Array(head);
    for (const { ext, check } of IMAGE_SIGNATURES) {
        if (check(buf)) return ext;
    }
    return null;
}

function sanitizeExtension(ext: string | undefined): (typeof ALLOWED_EXTENSIONS)[number] | null {
    if (!ext) return null;
    const lower = ext.toLowerCase().replace(/[^a-z]/g, '');
    return ALLOWED_EXTENSIONS.includes(lower as (typeof ALLOWED_EXTENSIONS)[number]) ? (lower as (typeof ALLOWED_EXTENSIONS)[number]) : null;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'You must be logged in to upload an avatar' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'Image size should be less than 10MB' },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return NextResponse.json(
                { error: 'File is empty' },
                { status: 400 }
            );
        }

        // Validate MIME (quick client hint check)
        if (!file.type.startsWith(ALLOWED_MIME_PREFIX)) {
            return NextResponse.json(
                { error: 'Please select an image file (JPEG, PNG, WebP, or GIF)' },
                { status: 400 }
            );
        }

        // Validate real content via magic bytes (cannot be spoofed)
        const detectedExt = await getDetectedImageExtension(file);
        if (!detectedExt) {
            return NextResponse.json(
                { error: 'File is not a valid image (JPEG, PNG, WebP, or GIF)' },
                { status: 400 }
            );
        }

        // Fixed path per user: one avatar per user, re-upload replaces the old one
        const safeExt = sanitizeExtension(detectedExt) ?? detectedExt;
        const fileName = `avatar.${safeExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Remove any existing avatar in this user's folder (different extension from a previous upload)
        const { data: existingFiles } = await supabase.storage
            .from('avatars')
            .list(user.id);
        if (existingFiles?.length) {
            const toRemove = existingFiles.map((f) => `${user.id}/${f.name}`);
            await supabase.storage.from('avatars').remove(toRemove);
        }

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
            });

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload avatar' },
                { status: 500 }
            );
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrl,
            message: 'Avatar uploaded successfully',
        });
    } catch (error) {
        console.error('Error in upload avatar API:', error);
        return NextResponse.json(
            { error: 'Failed to upload avatar' },
            { status: 500 }
        );
    }
}
