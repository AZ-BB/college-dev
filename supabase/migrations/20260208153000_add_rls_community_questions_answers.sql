-- Enable Row Level Security on community_questions_answers
ALTER TABLE community_questions_answers ENABLE ROW LEVEL SECURITY;

-- Helper: get community_id for a question (bypasses RLS, avoids recursion)
CREATE OR REPLACE FUNCTION get_community_id_from_question_id(question_id INTEGER)
RETURNS INTEGER AS $$
  SELECT community_id FROM community_questions WHERE id = question_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- SELECT: Admins and owners of the community, or the author of the answer
-- ============================================
CREATE POLICY "Admins owners and author can select answers" ON community_questions_answers
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR is_community_admin_or_owner(get_community_id_from_question_id(community_question_id))
);

-- ============================================
-- INSERT: Only members of the community can insert (their own answer)
-- ============================================
CREATE POLICY "Community members can insert answers" ON community_questions_answers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_community_active_member(get_community_id_from_question_id(community_question_id))
);

-- No UPDATE policy: updating is disabled for everyone.
-- No DELETE policy: deleting is disabled for everyone.
