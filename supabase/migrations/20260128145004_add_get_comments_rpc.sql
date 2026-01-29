CREATE OR REPLACE FUNCTION get_comments(
    p_post_id INTEGER,
    p_comments_limit INTEGER DEFAULT 10,
    p_replies_limit INTEGER DEFAULT 2
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Build result JSON with top-level comments and their replies
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
                'users', json_build_object(
                    'id', u.id,
                    'username', u.username,
                    'avatar_url', u.avatar_url,
                    'first_name', u.first_name,
                    'last_name', u.last_name
                ),
                'replies_count', COALESCE(
                    (
                        SELECT COUNT(*)
                        FROM comments r
                        WHERE r.reply_to_comment_id = c.id
                    ),
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
    ) c
    INNER JOIN users u ON c.author_id = u.id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
