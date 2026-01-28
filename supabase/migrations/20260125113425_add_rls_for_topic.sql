-- Enable Row Level Security on topics table
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can read topics (e.g. when viewing a community)
CREATE POLICY "Public can select topics" ON topics
FOR SELECT
USING (true);

-- INSERT: Only the community owner can add topics
CREATE POLICY "Owners can insert topics" ON topics
FOR INSERT
TO authenticated
WITH CHECK (is_community_owner(topics.community_id));

-- UPDATE: Only the community owner can update topics
CREATE POLICY "Owners can update topics" ON topics
FOR UPDATE
TO authenticated
USING (is_community_owner(topics.community_id))
WITH CHECK (is_community_owner(topics.community_id));

-- DELETE: Only the community owner can delete topics
CREATE POLICY "Owners can delete topics" ON topics
FOR DELETE
TO authenticated
USING (is_community_owner(topics.community_id));
