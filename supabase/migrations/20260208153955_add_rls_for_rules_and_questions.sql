-- ============================================
-- RLS for community_questions
-- ============================================
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can select questions
CREATE POLICY "Authenticated users can select community_questions" ON community_questions
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only admins and owners can insert questions
CREATE POLICY "Admins and owners can insert community_questions" ON community_questions
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(community_id));

-- UPDATE: Only admins and owners can update questions
CREATE POLICY "Admins and owners can update community_questions" ON community_questions
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(community_id))
WITH CHECK (is_community_admin_or_owner(community_id));

-- DELETE: Only admins and owners can delete questions
CREATE POLICY "Admins and owners can delete community_questions" ON community_questions
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_id));

-- ============================================
-- RLS for community_rules
-- ============================================
ALTER TABLE community_rules ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can select rules
CREATE POLICY "Authenticated users can select community_rules" ON community_rules
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only admins and owners can insert rules
CREATE POLICY "Admins and owners can insert community_rules" ON community_rules
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(community_id));

-- UPDATE: Only admins and owners can update rules
CREATE POLICY "Admins and owners can update community_rules" ON community_rules
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(community_id))
WITH CHECK (is_community_admin_or_owner(community_id));

-- DELETE: Only admins and owners can delete rules
CREATE POLICY "Admins and owners can delete community_rules" ON community_rules
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(community_id));
