-- RLS for posts table: topic write rules, author-only update, and community visibility

-- Ensure RLS is enabled on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Helper: can the current user write to the given topic in the community?
-- True if: no topic (NULL), or user is admin/owner, or topic is PUBLIC.
CREATE OR REPLACE FUNCTION can_write_to_topic(comm_id INTEGER, topic_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  -- No topic restriction
  IF topic_id_param IS NULL THEN
    RETURN true;
  END IF;
  -- Admins/owners can write to any topic
  IF is_community_admin_or_owner(comm_id) THEN
    RETURN true;
  END IF;
  -- Members: only PUBLIC topics
  RETURN EXISTS (
    SELECT 1 FROM topics t
    WHERE t.id = topic_id_param
      AND t.community_id = comm_id
      AND t.write_permission_type = 'PUBLIC'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing posts policies (from init or previous state)
DROP POLICY IF EXISTS "Members can insert posts in their community" ON posts;
DROP POLICY IF EXISTS "Authors and community admins can update posts" ON posts;
DROP POLICY IF EXISTS "Authors and community admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view posts in public communities" ON posts;
DROP POLICY IF EXISTS "Members can view posts in private communities" ON posts;

-- ============================================
-- INSERT: Only members/admins/owners; topic must be PUBLIC if user is just a member
-- ============================================
CREATE POLICY "Members can insert posts in their community" ON posts
FOR INSERT
TO authenticated
WITH CHECK (
  is_community_active_member(posts.community_id)
  AND can_write_to_topic(posts.community_id, posts.topic_id)
);

-- ============================================
-- UPDATE: Only the author; if topic_id changes, new topic must be PUBLIC for members
-- ============================================
CREATE POLICY "Authors can update their own posts" ON posts
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (
  author_id = auth.uid()
  AND can_write_to_topic(posts.community_id, posts.topic_id)
);

-- ============================================
-- DELETE: Author of the post or admin/owner of the community
-- ============================================
CREATE POLICY "Authors and admins can delete posts" ON posts
FOR DELETE
TO authenticated
USING (
  author_id = auth.uid()
  OR is_community_admin_or_owner(posts.community_id)
);

-- ============================================
-- SELECT: Public if community is public; if private, user must be a member
-- ============================================
CREATE POLICY "Anyone can view posts in public communities" ON posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = posts.community_id
      AND c.is_public = true
  )
);

CREATE POLICY "Members can view posts in private communities" ON posts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = posts.community_id
      AND c.is_public = false
      AND is_community_active_member(c.id)
  )
);

-- ============================================
-- Helpers for post-related tables (attachments, poll, poll_options)
-- ============================================

-- Get community_id for a post (bypasses RLS)
CREATE OR REPLACE FUNCTION get_post_community_id(post_id_param INTEGER)
RETURNS INTEGER AS $$
  SELECT community_id FROM posts WHERE id = post_id_param;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- True if current user is the author of the post
CREATE OR REPLACE FUNCTION is_post_author(post_id_param INTEGER)
RETURNS BOOLEAN AS $$
  SELECT author_id = auth.uid() FROM posts WHERE id = post_id_param;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- True if current user is the author of the poll's post (for poll_options)
CREATE OR REPLACE FUNCTION is_poll_post_author(poll_id_param INTEGER)
RETURNS BOOLEAN AS $$
  SELECT p.author_id = auth.uid()
  FROM poll pol
  JOIN posts p ON p.id = pol.post_id
  WHERE pol.id = poll_id_param;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- posts_attachments
-- ============================================
ALTER TABLE posts_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments in public communities" ON posts_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN communities c ON c.id = p.community_id
    WHERE p.id = posts_attachments.post_id AND c.is_public = true
  )
);

CREATE POLICY "Members can view attachments in private communities" ON posts_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN communities c ON c.id = p.community_id
    WHERE p.id = posts_attachments.post_id
      AND c.is_public = false
      AND is_community_active_member(c.id)
  )
);

CREATE POLICY "Post authors can insert attachments" ON posts_attachments
FOR INSERT
TO authenticated
WITH CHECK (is_post_author(post_id));

CREATE POLICY "Post authors can update attachments" ON posts_attachments
FOR UPDATE
TO authenticated
USING (is_post_author(post_id))
WITH CHECK (is_post_author(post_id));

CREATE POLICY "Authors and admins can delete attachments" ON posts_attachments
FOR DELETE
TO authenticated
USING (
  is_post_author(post_id)
  OR is_community_admin_or_owner(get_post_community_id(post_id))
);

-- ============================================
-- poll
-- ============================================
ALTER TABLE poll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls in public communities" ON poll
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN communities c ON c.id = p.community_id
    WHERE p.id = poll.post_id AND c.is_public = true
  )
);

CREATE POLICY "Members can view polls in private communities" ON poll
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts p
    JOIN communities c ON c.id = p.community_id
    WHERE p.id = poll.post_id
      AND c.is_public = false
      AND is_community_active_member(c.id)
  )
);

CREATE POLICY "Post authors can insert polls" ON poll
FOR INSERT
TO authenticated
WITH CHECK (is_post_author(post_id));

CREATE POLICY "Post authors can update polls" ON poll
FOR UPDATE
TO authenticated
USING (is_post_author(post_id))
WITH CHECK (is_post_author(post_id));

CREATE POLICY "Authors and admins can delete polls" ON poll
FOR DELETE
TO authenticated
USING (
  is_post_author(poll.post_id)
  OR is_community_admin_or_owner(get_post_community_id(poll.post_id))
);

-- ============================================
-- poll_options
-- ============================================
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll options in public communities" ON poll_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM poll pol
    JOIN posts p ON p.id = pol.post_id
    JOIN communities c ON c.id = p.community_id
    WHERE pol.id = poll_options.poll_id AND c.is_public = true
  )
);

CREATE POLICY "Members can view poll options in private communities" ON poll_options
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM poll pol
    JOIN posts p ON p.id = pol.post_id
    JOIN communities c ON c.id = p.community_id
    WHERE pol.id = poll_options.poll_id
      AND c.is_public = false
      AND is_community_active_member(c.id)
  )
);

CREATE POLICY "Post authors can insert poll options" ON poll_options
FOR INSERT
TO authenticated
WITH CHECK (is_poll_post_author(poll_id));

CREATE POLICY "Post authors can update poll options" ON poll_options
FOR UPDATE
TO authenticated
USING (is_poll_post_author(poll_id))
WITH CHECK (is_poll_post_author(poll_id));

CREATE POLICY "Authors and admins can delete poll options" ON poll_options
FOR DELETE
TO authenticated
USING (
  is_poll_post_author(poll_id)
  OR is_community_admin_or_owner((
    SELECT p.community_id FROM poll pol JOIN posts p ON p.id = pol.post_id WHERE pol.id = poll_options.poll_id
  ))
);
