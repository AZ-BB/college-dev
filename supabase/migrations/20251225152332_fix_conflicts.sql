-- ALTER TABLE communities ADD COLUMN avatar TEXT DEFAULT NULL;

-- ALTER TABLE communities ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
-- ALTER TABLE communities ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;

-- Update the trigger function to use SECURITY DEFINER so it can bypass RLS
-- This allows the trigger to insert the owner membership without RLS blocking it
CREATE OR REPLACE FUNCTION create_community_owner_membership()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO community_members
        (community_id, user_id, role)
    VALUES
        (NEW.id, NEW.created_by, 'OWNER');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add INSERT policies for community_members table

-- Policy 1: Allow authenticated users to insert themselves as MEMBER
-- This allows users to join communities
-- CREATE POLICY "Users can insert themselves as MEMBER" ON community_members 
-- FOR INSERT TO authenticated 
-- WITH CHECK (
--     user_id = auth.uid() 
--     AND role = 'MEMBER'
-- );

-- -- Policy 2: Allow admins and owners to insert members into their communities
-- -- This allows community admins/owners to add other users
-- CREATE POLICY "Admins and Owners can insert members" ON community_members 
-- FOR INSERT TO authenticated 
-- WITH CHECK (
--     EXISTS (
--         SELECT 1 FROM community_members AS cm
--         WHERE cm.community_id = community_members.community_id
--         AND cm.user_id = auth.uid()
--         AND cm.role IN ('ADMIN', 'OWNER')
--     )
-- );

