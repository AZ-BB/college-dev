-- Add RLS policies for community_media storage bucket
-- Restrict INSERT/UPDATE/DELETE to community owners/admins only
-- SELECT remains public

-- Helper function to get community_id from storage object path
-- Path format: {slug}/filename (e.g., "my-community/cover.jpg")
CREATE OR REPLACE FUNCTION get_community_id_from_storage_path(storage_path TEXT)
RETURNS INTEGER AS $$
DECLARE
    comm_slug TEXT;
    comm_id INTEGER;
BEGIN
    -- Extract slug from path (first part before first '/')
    comm_slug := split_part(storage_path, '/', 1);
    
    -- Get community_id from slug
    SELECT id INTO comm_id
    FROM communities
    WHERE slug = comm_slug;
    
    RETURN comm_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to upload to community_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update community_media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete community_media" ON storage.objects;

-- Allow only community owners/admins to upload to community_media bucket
CREATE POLICY "Community owners/admins can upload to community_media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community_media'
    AND get_community_id_from_storage_path(name) IS NOT NULL
    AND is_community_admin_or_owner(get_community_id_from_storage_path(name))
);

-- Allow only community owners/admins to update files in community_media bucket
CREATE POLICY "Community owners/admins can update community_media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'community_media'
    AND get_community_id_from_storage_path(name) IS NOT NULL
    AND is_community_admin_or_owner(get_community_id_from_storage_path(name))
)
WITH CHECK (
    bucket_id = 'community_media'
    AND get_community_id_from_storage_path(name) IS NOT NULL
    AND is_community_admin_or_owner(get_community_id_from_storage_path(name))
);

-- Allow only community owners/admins to delete files in community_media bucket
CREATE POLICY "Community owners/admins can delete community_media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'community_media'
    AND get_community_id_from_storage_path(name) IS NOT NULL
    AND is_community_admin_or_owner(get_community_id_from_storage_path(name))
);
