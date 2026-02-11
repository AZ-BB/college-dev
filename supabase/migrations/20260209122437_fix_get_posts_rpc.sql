-- Update get_posts RPC to handle multiple sort options: 'default', 'new', 'top'
DROP FUNCTION IF EXISTS get_posts(INTEGER, INTEGER, TEXT, INTEGER, INTEGER, UUID);

CREATE OR REPLACE FUNCTION get_posts(
    p_community_id INTEGER,
    p_topic_id INTEGER DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'default',
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    WITH ordered_posts AS (
        SELECT 
            p.*,
            u.id as user_id,
            u.username,
            u.first_name,
            u.last_name,
            u.avatar_url,
            ROW_NUMBER() OVER (
                ORDER BY
                    CASE 
                        WHEN p_sort_by = 'default' THEN (CASE WHEN p.is_pinned THEN 0 ELSE 1 END)
                        ELSE NULL
                    END ASC NULLS LAST,
                    CASE 
                        WHEN p_sort_by = 'top' THEN COALESCE(p.likes_count, 0)
                        ELSE NULL
                    END DESC NULLS LAST,
                    CASE 
                        WHEN p_sort_by IN ('new', 'default') THEN p.created_at
                        WHEN p_sort_by = 'top' THEN p.created_at
                        ELSE NULL
                    END DESC NULLS LAST,
                    p.created_at DESC
            ) as sort_order
        FROM posts p
        INNER JOIN users u ON p.author_id = u.id
        WHERE p.community_id = p_community_id
            AND (p_topic_id IS NULL OR p.topic_id = p_topic_id)
        ORDER BY sort_order ASC
        LIMIT p_limit
        OFFSET p_offset
    )
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', op.id,
                'author_id', op.author_id,
                'community_id', op.community_id,
                'content', op.content,
                'created_at', op.created_at,
                'updated_at', op.updated_at,
                'title', op.title,
                'topic_id', op.topic_id,
                'video_url', op.video_url,
                'poll_id', op.poll_id,
                'is_pinned', op.is_pinned,
                'comments_disabled', op.comments_disabled,
                'likes_count', COALESCE(op.likes_count, 0),
                'is_liked', CASE WHEN p_user_id IS NOT NULL THEN (SELECT EXISTS (SELECT 1 FROM likes l WHERE l.post_id = op.id AND l.user_id = p_user_id)) ELSE NULL END,
                'users', json_build_object(
                    'id', op.user_id,
                    'username', op.username,
                    'first_name', op.first_name,
                    'last_name', op.last_name,
                    'avatar_url', op.avatar_url
                ),
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
                        WHERE pa.post_id = op.id AND pa.type = 'IMAGE'
                    ),
                    '[]'::json
                ),
                'comment_count', COALESCE(
                    (SELECT COUNT(*)::INTEGER FROM comments c WHERE c.post_id = op.id),
                    0
                )
            )
            ORDER BY op.sort_order ASC
        ),
        '[]'::json
    ) INTO v_result
    FROM ordered_posts op;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
