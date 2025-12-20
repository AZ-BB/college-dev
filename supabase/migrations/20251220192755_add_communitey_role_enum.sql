CREATE TYPE community_role AS ENUM
('owner', 'member');


-- Drop dependent policies first
DROP POLICY IF EXISTS "Creators and admins can update their communities" ON communities;
DROP POLICY IF EXISTS "Owners and admins can add members" ON community_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON community_members;
DROP POLICY IF EXISTS "Owners and admins can update member roles" ON community_members;

-- Modify the column
ALTER TABLE community_members DROP COLUMN role;
ALTER TABLE community_members ADD COLUMN role community_role NOT NULL DEFAULT 'member';

-- Recreate policies with the new enum type
-- Note: 'admin' is removed as it's not in the new community_role enum

CREATE POLICY "Creators and owners can update their communities"
ON communities
FOR UPDATE
USING (
    auth.uid() = creator_id 
    OR EXISTS (
        SELECT 1 FROM community_members 
        WHERE community_id = id 
        AND user_id = auth.uid() 
        AND role = 'owner'
    )
);

CREATE POLICY "Owners can add members"
ON community_members
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
);

CREATE POLICY "Owners can remove members"
ON community_members
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
);

CREATE POLICY "Owners can update member roles"
ON community_members
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
);
