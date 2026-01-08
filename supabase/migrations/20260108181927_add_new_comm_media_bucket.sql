-- Create the community_media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community_media',
    'community_media',
    true,
    10485760, -- 10MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects for community_media bucket
-- (This is already enabled globally, but we ensure it's set)

-- Allow public read access to community_media bucket
CREATE POLICY "Allow public read access to community_media bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'community_media');

-- Allow authenticated users to upload to community_media bucket
CREATE POLICY "Allow authenticated users to upload to community_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community_media'
);

-- Allow authenticated users to update files in community_media bucket
-- (for community owners/admins updating their community cover images)
CREATE POLICY "Allow authenticated users to update community_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'community_media'
)
WITH CHECK (
    bucket_id = 'community_media'
);

-- Allow authenticated users to delete files in community_media bucket
-- (for community owners/admins deleting old cover images)
CREATE POLICY "Allow authenticated users to delete community_media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'community_media'
);
