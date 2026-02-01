CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE posts ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION update_posts_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_posts_likes_count();


CREATE TABLE comments_likes (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE comments ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION update_comments_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER comments_likes_count_trigger
AFTER INSERT OR DELETE ON comments_likes
FOR EACH ROW EXECUTE FUNCTION update_comments_likes_count();

-- RLS for likes: only community members can SELECT, INSERT, DELETE (own likes only for INSERT/DELETE)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can select likes"
ON likes FOR SELECT
USING (true);

CREATE POLICY "Community members can insert own like"
ON likes FOR INSERT TO authenticated
WITH CHECK (
    is_community_active_member(community_id)
    AND user_id = auth.uid()
);

CREATE POLICY "Community members can delete own like"
ON likes FOR DELETE TO authenticated
USING (
    is_community_active_member(community_id)
    AND user_id = auth.uid()
);

-- RLS for comments_likes: only community members can SELECT, INSERT, DELETE (own likes only for INSERT/DELETE)
ALTER TABLE comments_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can select comments_likes"
ON comments_likes FOR SELECT
USING (true);

CREATE POLICY "Community members can insert own comment like"
ON comments_likes FOR INSERT TO authenticated
WITH CHECK (
    is_community_active_member(community_id)
    AND user_id = auth.uid()
);

CREATE POLICY "Community members can delete own comment like"
ON comments_likes FOR DELETE TO authenticated
USING (
    is_community_active_member(community_id)
    AND user_id = auth.uid()
);

