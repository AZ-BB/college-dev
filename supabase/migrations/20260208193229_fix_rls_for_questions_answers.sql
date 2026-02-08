-- Allow inserting answers for any user who has a membership (any status) in the community.
-- This lets PENDING members submit their question answers when joining.

-- Helper: true if current user has any row in community_members for this community (any status)
CREATE OR REPLACE FUNCTION is_community_member_any_status(comm_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = comm_id
        AND cm.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Replace INSERT policy to allow any community member (any status), not only ACTIVE
DROP POLICY IF EXISTS "Community members can insert answers" ON community_questions_answers;

CREATE POLICY "Community members can insert answers" ON community_questions_answers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND is_community_member_any_status(get_community_id_from_question_id(community_question_id))
);
