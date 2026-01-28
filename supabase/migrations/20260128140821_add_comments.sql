CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_comment_id INTEGER REFERENCES comments(id) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for comments table
-- ============================================

-- SELECT: Any user can select comments
CREATE POLICY "Public can select comments" ON comments
FOR SELECT
USING (true);

-- INSERT: Only active community members can insert comments
CREATE POLICY "Community members can insert comments" ON comments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM posts AS p
        WHERE p.id = comments.post_id
        AND is_community_active_member(p.community_id)
    )
);

-- DELETE: Only the comment author or community admins/owners can delete comments
CREATE POLICY "Authors and community admins can delete comments" ON comments
FOR DELETE
TO authenticated
USING (
    -- Allow if user is the author of the comment
    author_id = auth.uid()
    OR
    -- Allow if user is admin or owner of the community
    EXISTS (
        SELECT 1 FROM posts AS p
        WHERE p.id = comments.post_id
        AND is_community_admin_or_owner(p.community_id)
    )
);

-- Note: UPDATE is not allowed, so no UPDATE policy is created

