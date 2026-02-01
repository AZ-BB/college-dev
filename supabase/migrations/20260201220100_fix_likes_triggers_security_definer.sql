-- Fix: trigger functions must use SECURITY DEFINER so UPDATE on posts/comments
-- is not blocked by RLS (no UPDATE policy exists on those tables).
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

-- Use SET search_path and run as table owner so RLS doesn't block the UPDATE on comments.
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

-- Run as postgres (table owner) so RLS is bypassed when updating comments.
ALTER FUNCTION update_comments_likes_count() OWNER TO postgres;
