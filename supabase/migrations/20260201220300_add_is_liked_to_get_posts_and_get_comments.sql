-- Add optional p_user_id to get_posts; when provided, include is_liked per post.
DROP FUNCTION IF EXISTS get_posts(INTEGER, INTEGER, TEXT, INTEGER, INTEGER);

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
    SELECT COALESCE(
        json_agg(
            json_build_object(
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
                'is_liked', CASE WHEN p_user_id IS NOT NULL THEN (SELECT EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = p_user_id)) ELSE NULL END,
                'users', json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'avatar_url', u.avatar_url
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
                        WHERE pa.post_id = p.id AND pa.type = 'IMAGE'
                    ),
                    '[]'::json
                ),
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

-- Add optional p_user_id to get_comments; when provided, include is_liked per comment and reply.
DROP FUNCTION IF EXISTS get_comments(INTEGER, INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_comments(
    p_post_id INTEGER,
    p_comments_limit INTEGER DEFAULT 10,
    p_replies_limit INTEGER DEFAULT 2,
    p_comments_offset INTEGER DEFAULT 0,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', c.id,
                'post_id', c.post_id,
                'author_id', c.author_id,
                'content', c.content,
                'reply_to_comment_id', c.reply_to_comment_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at,
                'likes_count', COALESCE(c.likes_count, 0),
                'is_liked', CASE WHEN p_user_id IS NOT NULL THEN (SELECT EXISTS (SELECT 1 FROM comments_likes cl WHERE cl.comment_id = c.id AND cl.user_id = p_user_id)) ELSE NULL END,
                'users', json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'avatar_url', u.avatar_url,
                    'first_name', u.first_name,
                    'last_name', u.last_name
                ),
                'replies_count', COALESCE(
                    (SELECT COUNT(*) FROM comments r WHERE r.reply_to_comment_id = c.id),
                    0
                ),
                'replies', COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', reply_data.id,
                                'post_id', reply_data.post_id,
                                'author_id', reply_data.author_id,
                                'content', reply_data.content,
                                'reply_to_comment_id', reply_data.reply_to_comment_id,
                                'created_at', reply_data.created_at,
                                'updated_at', reply_data.updated_at,
                                'likes_count', COALESCE(reply_data.likes_count, 0),
                                'is_liked', CASE WHEN p_user_id IS NOT NULL THEN (SELECT EXISTS (SELECT 1 FROM comments_likes cl WHERE cl.comment_id = reply_data.id AND cl.user_id = p_user_id)) ELSE NULL END,
                                'users', json_build_object(
                                    'id', reply_data.user_id,
                                    'username', reply_data.username,
                                    'avatar_url', reply_data.avatar_url,
                                    'first_name', reply_data.first_name,
                                    'last_name', reply_data.last_name
                                )
                            )
                        )
                        FROM (
                            SELECT 
                                r.id,
                                r.post_id,
                                r.author_id,
                                r.content,
                                r.reply_to_comment_id,
                                r.created_at,
                                r.updated_at,
                                r.likes_count,
                                ru.id as user_id,
                                ru.username,
                                ru.avatar_url,
                                ru.first_name,
                                ru.last_name
                            FROM comments r
                            INNER JOIN users ru ON r.author_id = ru.id
                            WHERE r.reply_to_comment_id = c.id
                            ORDER BY r.created_at ASC
                            LIMIT p_replies_limit
                        ) reply_data
                    ),
                    '[]'::json
                )
            )
        ),
        '[]'::json
    ) INTO v_result
    FROM (
        SELECT c.*
        FROM comments c
        WHERE c.post_id = p_post_id
        AND c.reply_to_comment_id IS NULL
        ORDER BY c.created_at DESC
        LIMIT p_comments_limit
        OFFSET p_comments_offset
    ) c
    INNER JOIN users u ON c.author_id = u.id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
