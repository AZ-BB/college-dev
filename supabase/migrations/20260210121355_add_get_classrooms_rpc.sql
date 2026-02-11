-- RPC function to get classrooms with is_joined flag
CREATE OR REPLACE FUNCTION get_classrooms_with_join_status(
    p_community_id INTEGER,
    p_user_id UUID DEFAULT NULL,
    p_view_drafts BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    description TEXT,
    slug TEXT,
    cover_url TEXT,
    type classroom_type_enum,
    amount_one_time NUMERIC,
    time_unlock_in_days INTEGER,
    is_draft BOOLEAN,
    community_id INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_joined BOOLEAN,
    modules_count INTEGER,
    lessons_count INTEGER,
    resources_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.slug,
        c.cover_url,
        c.type,
        c.amount_one_time,
        c.time_unlock_in_days,
        c.is_draft,
        c.community_id,
        c.created_at,
        c.updated_at,
        -- Check if user has joined this classroom
        CASE 
            WHEN p_user_id IS NULL THEN FALSE
            ELSE EXISTS (
                SELECT 1 
                FROM community_member_classrooms cmc
                WHERE cmc.classroom_id = c.id
                AND cmc.user_id = p_user_id
                AND cmc.community_id = p_community_id
            )
        END AS is_joined,
        -- Count modules
        (
            SELECT COUNT(*)::INTEGER
            FROM modules m
            WHERE m.classroom_id = c.id
        ) AS modules_count,
        -- Count lessons
        (
            SELECT COUNT(*)::INTEGER
            FROM lessons l
            INNER JOIN modules m ON l.module_id = m.id
            WHERE m.classroom_id = c.id
        ) AS lessons_count,
        -- Count resources
        (
            SELECT COUNT(*)::INTEGER
            FROM lesson_resources lr
            INNER JOIN lessons l ON lr.lesson_id = l.id
            INNER JOIN modules m ON l.module_id = m.id
            WHERE m.classroom_id = c.id
        ) AS resources_count
    FROM classrooms c
    WHERE c.community_id = p_community_id
    AND (p_view_drafts = TRUE OR c.is_draft = FALSE)
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
