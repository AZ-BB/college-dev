-- Fix infinite recursion in RLS policies by using SECURITY DEFINER functions
-- These functions bypass RLS to check permissions without triggering recursion

-- Function to check if user is ADMIN or OWNER of a community (bypasses RLS)
CREATE OR REPLACE FUNCTION is_community_admin_or_owner(comm_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = comm_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
        AND cm.member_status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is OWNER of a community (bypasses RLS)
CREATE OR REPLACE FUNCTION is_community_owner(comm_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = comm_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'OWNER'
        AND cm.member_status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is an active member of a community (bypasses RLS)
CREATE OR REPLACE FUNCTION is_community_active_member(comm_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = comm_id
        AND cm.user_id = auth.uid()
        AND cm.member_status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins and Owners can update communities" ON communities;
DROP POLICY IF EXISTS "Owners can delete communities" ON communities;
DROP POLICY IF EXISTS "Public or active members can select community_members" ON community_members;
DROP POLICY IF EXISTS "Admins and Owners can update community_members" ON community_members;
DROP POLICY IF EXISTS "Admins and Owners can delete community_members" ON community_members;

-- Recreate communities UPDATE policy using the function
CREATE POLICY "Admins and Owners can update communities" ON communities
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(communities.id))
WITH CHECK (is_community_admin_or_owner(communities.id));

-- Recreate communities DELETE policy using the function
CREATE POLICY "Owners can delete communities" ON communities
FOR DELETE
TO authenticated
USING (is_community_owner(communities.id));

-- Recreate community_members SELECT policy using the function
CREATE POLICY "Public or active members can select community_members" ON community_members
FOR SELECT
USING (
    -- Allow if the community is public
    EXISTS (
        SELECT 1 FROM communities AS c
        WHERE c.id = community_members.community_id
        AND c.is_public = true
    )
    OR
    -- Allow if the user is an active member (using function to avoid recursion)
    (
        auth.uid() IS NOT NULL
        AND is_community_active_member(community_members.community_id)
    )
);

-- Recreate community_members UPDATE policy using the function
CREATE POLICY "Admins and Owners can update community_members" ON community_members
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(community_members.community_id))
WITH CHECK (is_community_admin_or_owner(community_members.community_id));

-- Recreate community_members DELETE policy using the function
CREATE POLICY "Admins and Owners can delete community_members" ON community_members
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_members.community_id));

-- Fix policies for other tables that query community_members
-- Drop and recreate community_text_blocks policies
DROP POLICY IF EXISTS "Admins and Owners can insert community_text_blocks" ON community_text_blocks;
DROP POLICY IF EXISTS "Admins and Owners can update community_text_blocks" ON community_text_blocks;
DROP POLICY IF EXISTS "Admins and Owners can delete community_text_blocks" ON community_text_blocks;

CREATE POLICY "Admins and Owners can insert community_text_blocks" ON community_text_blocks
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(community_text_blocks.community_id));

CREATE POLICY "Admins and Owners can update community_text_blocks" ON community_text_blocks
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(community_text_blocks.community_id))
WITH CHECK (is_community_admin_or_owner(community_text_blocks.community_id));

CREATE POLICY "Admins and Owners can delete community_text_blocks" ON community_text_blocks
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_text_blocks.community_id));

-- Drop and recreate community_gallery_media policies
DROP POLICY IF EXISTS "Admins and Owners can insert community_gallery_media" ON community_gallery_media;
DROP POLICY IF EXISTS "Admins and Owners can update community_gallery_media" ON community_gallery_media;
DROP POLICY IF EXISTS "Admins and Owners can delete community_gallery_media" ON community_gallery_media;

CREATE POLICY "Admins and Owners can insert community_gallery_media" ON community_gallery_media
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(community_gallery_media.community_id));

CREATE POLICY "Admins and Owners can update community_gallery_media" ON community_gallery_media
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(community_gallery_media.community_id))
WITH CHECK (is_community_admin_or_owner(community_gallery_media.community_id));

CREATE POLICY "Admins and Owners can delete community_gallery_media" ON community_gallery_media
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_gallery_media.community_id));

-- Drop and recreate community_cta_links policies
DROP POLICY IF EXISTS "Admins and Owners can insert community_cta_links" ON community_cta_links;
DROP POLICY IF EXISTS "Admins and Owners can update community_cta_links" ON community_cta_links;
DROP POLICY IF EXISTS "Admins and Owners can delete community_cta_links" ON community_cta_links;

CREATE POLICY "Admins and Owners can insert community_cta_links" ON community_cta_links
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(community_cta_links.community_id));

CREATE POLICY "Admins and Owners can update community_cta_links" ON community_cta_links
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(community_cta_links.community_id))
WITH CHECK (is_community_admin_or_owner(community_cta_links.community_id));

CREATE POLICY "Admins and Owners can delete community_cta_links" ON community_cta_links
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_cta_links.community_id));

-- Update the trigger function to use the helper function for consistency
CREATE OR REPLACE FUNCTION check_role_update_permission()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is being changed, check if user is owner
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF NOT is_community_owner(NEW.community_id) THEN
            RAISE EXCEPTION 'Only owners can change the role column';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
