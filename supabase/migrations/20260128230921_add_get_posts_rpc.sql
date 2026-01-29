-- Indexes to optimize get_posts RPC function performance

-- Composite index for filtering by community_id with sorting by is_pinned and created_at (default sort)
-- This covers the main WHERE clause and ORDER BY for 'default' sort when topic is 'all'
CREATE INDEX IF NOT EXISTS idx_posts_community_pinned_created 
ON posts(community_id, is_pinned DESC, created_at DESC);

-- Composite index for filtering by community_id and topic_id, with sorting by is_pinned and created_at
-- This covers the main WHERE clause and ORDER BY for 'default' sort when topic is filtered
CREATE INDEX IF NOT EXISTS idx_posts_community_topic_pinned_created 
ON posts(community_id, topic_id, is_pinned DESC, created_at DESC);

-- Composite index for filtering by community_id with sorting by created_at (for 'new' and 'top' sorts)
-- This covers the main WHERE clause and ORDER BY for non-default sorts
CREATE INDEX IF NOT EXISTS idx_posts_community_created_desc 
ON posts(community_id, created_at DESC);

-- Composite index for filtering by community_id and topic_id with sorting by created_at
-- This covers non-default sorts when topic is filtered
CREATE INDEX IF NOT EXISTS idx_posts_community_topic_created_desc 
ON posts(community_id, topic_id, created_at DESC);

-- Index for posts_attachments to optimize the EXISTS subquery checking for IMAGE type attachments
-- This composite index covers both the post_id filter and type filter efficiently
CREATE INDEX IF NOT EXISTS idx_posts_attachments_post_id_type 
ON posts_attachments(post_id, type);

-- Index for posts_attachments to optimize fetching all attachments for a post
-- This is used in the attachments subquery
CREATE INDEX IF NOT EXISTS idx_posts_attachments_post_id_created 
ON posts_attachments(post_id, created_at ASC);

-- Index for comments to optimize the COUNT(*) subquery
-- This is used to count comments per post
CREATE INDEX IF NOT EXISTS idx_comments_post_id 
ON comments(post_id);

-- get_posts: returns all posts for a community with optional topic filter.
-- Input: comm_id, topic_id (NULL = all), sort_by ('default' | 'new' | 'top'), limit, offset
-- Output: post data, user (id, username, first_name, last_name, avatar_url), attachments (IMAGE only), comment_count
CREATE OR REPLACE FUNCTION get_posts(
    p_community_id INTEGER,
    p_topic_id INTEGER DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'default',
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT COALESCE(
        json_agg(
            json_build_object(
                -- Post fields
                'id', p.id,
                'author_id', p.author_id,
                'community_id', p.community_id,
                'content', p.content,
                'created_at', p.created_at,
                'updated_at', p.updated_at,
                'title', p.title,
                'topic_id', p.topic_id,
                'video_url', p.video_url,
                'poll_id', p.poll_id,
                'is_pinned', p.is_pinned,
                'comments_disabled', p.comments_disabled,
                -- User (author)
                'users', json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'avatar_url', u.avatar_url
                ),
                -- Attachments (IMAGE only)
                'attachments', COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', pa.id,
                                'post_id', pa.post_id,
                                'url', pa.url,
                                'name', pa.name,
                                'type', pa.type,
                                'created_at', pa.created_at
                            )
                            ORDER BY pa.created_at ASC
                        )
                        FROM posts_attachments pa
                        WHERE pa.post_id = p.id AND pa.type = 'IMAGE'
                    ),
                    '[]'::json
                ),
                -- Comment count
                'comment_count', COALESCE(
                    (SELECT COUNT(*)::INTEGER FROM comments c WHERE c.post_id = p.id),
                    0
                )
            )
        ),
        '[]'::json
    ) INTO v_result
    FROM (
        SELECT p.*
        FROM posts p
        WHERE p.community_id = p_community_id
            AND (p_topic_id IS NULL OR p.topic_id = p_topic_id)
        ORDER BY
            CASE WHEN p_sort_by = 'default' THEN (CASE WHEN p.is_pinned THEN 0 ELSE 1 END) ELSE 1 END,
            p.created_at DESC
        LIMIT p_limit
        OFFSET p_offset
    ) p
    INNER JOIN users u ON p.author_id = u.id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
