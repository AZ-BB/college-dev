DROP POLICY
IF EXISTS "Community members and admins can insert member classrooms" ON community_member_classrooms;

CREATE POLICY "Community members and admins can insert member classrooms" ON community_member_classrooms
FOR
INSERT
TO authenticated
WITH CHECK (
  (
is_community_active_member(community_id)
AND user_id = auth.uid
()) OR is_community_admin_or_owner
(community_id)
);