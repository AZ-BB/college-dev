-- Enable Row Level Security on avatars bucket
ALTER PUBLICATION supabase_realtime ADD TABLE storage.objects;

-- Allow public read access to avatars bucket
CREATE POLICY "Allow public read access to avatars bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow anyone to upload to avatars bucket
CREATE POLICY "Allow anyone to upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
);

-- Allow users to update their own avatars
CREATE POLICY "Allow users to update their own avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

