-- Add RLS policies for posts storage bucket
-- Allow public read access (anyone can view)
-- Allow authenticated users to insert, update, and delete

-- Allow public read access to posts bucket
CREATE POLICY "Allow public read access to posts bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Allow authenticated users to upload to posts bucket
CREATE POLICY "Allow authenticated users to upload to posts bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'posts'
);

-- Allow authenticated users to update files in posts bucket
CREATE POLICY "Allow authenticated users to update posts bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'posts'
)
WITH CHECK (
    bucket_id = 'posts'
);

-- Allow authenticated users to delete files in posts bucket
CREATE POLICY "Allow authenticated users to delete posts bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'posts'
);
