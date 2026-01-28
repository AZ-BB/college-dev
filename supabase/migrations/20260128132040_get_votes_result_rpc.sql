CREATE OR REPLACE FUNCTION get_votes_result(p_post_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_poll_id INTEGER;
    v_total_votes INTEGER;
    v_result JSON;
BEGIN
    -- Get poll_id from post_id
    SELECT poll_id INTO v_poll_id
    FROM posts
    WHERE id = p_post_id;
    
    -- Return NULL if no poll exists for this post
    IF v_poll_id IS NULL THEN
        RETURN json_build_object(
            'total_votes', 0,
            'options', '[]'::json
        );
    END IF;
    
    -- Get total votes count
    SELECT COUNT(*) INTO v_total_votes
    FROM poll_votes
    WHERE post_id = p_post_id;
    
    -- Build result JSON with options, their vote counts, and users
    SELECT json_build_object(
        'total_votes', COALESCE(v_total_votes, 0),
        'options', COALESCE(
            json_agg(
                json_build_object(
                    'id', po.id,
                    'poll_id', po.poll_id,
                    'text', po.text,
                    'vote_count', COALESCE(option_votes.vote_count, 0),
                    'users', COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'first_name', u.first_name,
                                    'last_name', u.last_name,
                                    'avatar', u.avatar_url,
                                    'username', u.username
                                )
                            )
                            FROM (
                                SELECT pv.user_id, pv.created_at
                                FROM poll_votes pv
                                WHERE pv.poll_option_id = po.id
                                AND pv.post_id = p_post_id
                                ORDER BY pv.created_at DESC
                                LIMIT 4
                            ) pv
                            INNER JOIN users u ON pv.user_id = u.id
                        ),
                        '[]'::json
                    )
                ) ORDER BY po.id
            ),
            '[]'::json
        )
    ) INTO v_result
    FROM poll_options po
    LEFT JOIN (
        SELECT 
            poll_option_id,
            COUNT(*) as vote_count
        FROM poll_votes
        WHERE post_id = p_post_id
        GROUP BY poll_option_id
    ) option_votes ON po.id = option_votes.poll_option_id
    WHERE po.poll_id = v_poll_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;