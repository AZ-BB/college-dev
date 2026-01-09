-- Enable Row Level Security on community_members table (if not already enabled)
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for community_members table
-- ============================================

-- SELECT: 
-- - If community is public, anyone can view members
-- - If community is not public, only active members can view other members
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
    -- Allow if the user is an active member of this community
    (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM community_members AS cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = auth.uid()
            AND cm.member_status = 'ACTIVE'
        )
    )
);

-- INSERT: Any authenticated user can insert community_members
CREATE POLICY "Authenticated users can insert community_members" ON community_members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Only admins and owners can update community_members
CREATE POLICY "Admins and Owners can update community_members" ON community_members
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- Function to enforce that only owners can change the role column
CREATE OR REPLACE FUNCTION check_role_update_permission()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is being changed, check if user is owner
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF NOT EXISTS (
            SELECT 1 FROM community_members AS cm
            WHERE cm.community_id = NEW.community_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'OWNER'
        ) THEN
            RAISE EXCEPTION 'Only owners can change the role column';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce role update restriction
CREATE TRIGGER enforce_role_update_permission
BEFORE UPDATE ON community_members
FOR EACH ROW
EXECUTE FUNCTION check_role_update_permission();

-- DELETE: Only admins and owners can delete community_members
CREATE POLICY "Admins and Owners can delete community_members" ON community_members
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_members.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);
