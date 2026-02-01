-- Add likes_count to get_posts RPC output
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
                'likes_count', COALESCE(p.likes_count, 0),
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
