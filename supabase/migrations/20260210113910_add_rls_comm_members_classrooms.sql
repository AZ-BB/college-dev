-- Enable Row Level Security on community_member_classrooms
ALTER TABLE community_member_classrooms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INSERT: Members of the community + admins or owners
-- ============================================
CREATE POLICY "Community members and admins can insert member classrooms" ON community_member_classrooms
FOR INSERT
TO authenticated
WITH CHECK (
  is_community_active_member(community_id)
  AND user_id = auth.uid()
);

-- ============================================
-- UPDATE: Members of the community + admins or owners
-- (members can update only their own row; admins/owners can update any row in the community)
-- ============================================
CREATE POLICY "Community members and admins can update member classrooms" ON community_member_classrooms
FOR UPDATE
TO authenticated
USING (
  is_community_active_member(community_id)
  AND (user_id = auth.uid() OR is_community_admin_or_owner(community_id))
)
WITH CHECK (
  is_community_active_member(community_id)
  AND (user_id = auth.uid() OR is_community_admin_or_owner(community_id))
);

-- ============================================
-- DELETE: Admins or owners only
-- ============================================
CREATE POLICY "Admins and owners can delete member classrooms" ON community_member_classrooms
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_id));

-- ============================================
-- SELECT: Each member sees their own rows; admins or owners see all in the community
-- ============================================
CREATE POLICY "Members see own rows admins see all member classrooms" ON community_member_classrooms
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR is_community_admin_or_owner(community_id)
);
