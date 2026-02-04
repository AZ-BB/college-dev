-- Add RLS policies for avatars storage bucket
-- Public read (SELECT); only authenticated users can upload, update, delete

-- Drop existing avatars policies if any (idempotent)
DROP POLICY IF EXISTS "Allow public read access to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- Allow public read access to avatars bucket
CREATE POLICY "Allow public read access to avatars bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "Allow authenticated users to upload to avatars bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
);

-- Allow authenticated users to update files in avatars bucket
CREATE POLICY "Allow authenticated users to update avatars bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
)
WITH CHECK (
    bucket_id = 'avatars'
);

-- Allow authenticated users to delete files in avatars bucket
CREATE POLICY "Allow authenticated users to delete avatars bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
);
