-- Enable Row Level Security on posts_reports table
ALTER TABLE posts_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INSERT: Only active community members can insert reports
-- ============================================
CREATE POLICY "Community members can insert reports" ON posts_reports
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_community_active_member(get_post_community_id(post_id))
);

-- ============================================
-- SELECT: Admins and owners can view all reports, users can view their own reports
-- ============================================
DROP POLICY IF EXISTS "Admins and owners can select reports" ON posts_reports;

CREATE POLICY "Admins owners and users can select their own reports" ON posts_reports
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR is_community_admin_or_owner(get_post_community_id(post_id))
);

-- No UPDATE policy: updating is disabled for everyone.

-- ============================================
-- DELETE: Only admins and owners can delete reports
-- ============================================
CREATE POLICY "Admins and owners can delete reports" ON posts_reports
FOR DELETE
TO authenticated
USING (
  is_community_admin_or_owner(get_post_community_id(post_id))
);
