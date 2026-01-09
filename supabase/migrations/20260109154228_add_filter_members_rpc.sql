-- RPC function to get community members with filtering, searching, and custom role ordering
CREATE OR REPLACE FUNCTION get_community_members(
    p_community_id INTEGER,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 10,
    p_search TEXT DEFAULT NULL,
    p_status community_member_status_enum DEFAULT NULL,
    p_role community_role_enum DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'role',
    p_sort_order TEXT DEFAULT 'asc'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INTEGER;
    v_members JSONB;
    v_total_count BIGINT;
BEGIN
    v_offset := (p_page - 1) * p_limit;
    
    -- Get total count
    SELECT COUNT(*) INTO v_total_count
    FROM community_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.community_id = p_community_id
        AND (p_status IS NULL OR cm.member_status = p_status)
        AND (p_role IS NULL OR cm.role = p_role)
        AND (
            p_search IS NULL OR 
            p_search = '' OR
            u.first_name ILIKE '%' || p_search || '%' OR
            u.last_name ILIKE '%' || p_search || '%' OR
            u.email ILIKE '%' || p_search || '%'
        );
    
    -- Get paginated members with custom role ordering
    WITH ordered_members AS (
        SELECT 
            cm.*,
            u.id as user_id_col,
            u.bio,
            u.email,
            u.username,
            u.first_name,
            u.last_name,
            u.avatar_url
        FROM community_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.community_id = p_community_id
            AND (p_status IS NULL OR cm.member_status = p_status)
            AND (p_role IS NULL OR cm.role = p_role)
            AND (
                p_search IS NULL OR 
                p_search = '' OR
                u.first_name ILIKE '%' || p_search || '%' OR
                u.last_name ILIKE '%' || p_search || '%' OR
                u.email ILIKE '%' || p_search || '%'
            )
        ORDER BY 
            CASE WHEN p_sort_by = 'role' AND p_sort_order = 'asc' THEN 
                CASE cm.role
                    WHEN 'OWNER' THEN 1
                    WHEN 'ADMIN' THEN 2
                    WHEN 'MEMBER' THEN 3
                    ELSE 999
                END
            END ASC,
            CASE WHEN p_sort_by = 'role' AND p_sort_order = 'desc' THEN 
                CASE cm.role
                    WHEN 'OWNER' THEN 1
                    WHEN 'ADMIN' THEN 2
                    WHEN 'MEMBER' THEN 3
                    ELSE 999
                END
            END DESC,
            CASE WHEN p_sort_by = 'id' AND p_sort_order = 'asc' THEN cm.id END ASC,
            CASE WHEN p_sort_by = 'id' AND p_sort_order = 'desc' THEN cm.id END DESC,
            CASE WHEN p_sort_by = 'community_id' AND p_sort_order = 'asc' THEN cm.community_id END ASC,
            CASE WHEN p_sort_by = 'community_id' AND p_sort_order = 'desc' THEN cm.community_id END DESC,
            CASE WHEN p_sort_by = 'member_status' AND p_sort_order = 'asc' THEN cm.member_status::TEXT END ASC,
            CASE WHEN p_sort_by = 'member_status' AND p_sort_order = 'desc' THEN cm.member_status::TEXT END DESC,
            CASE WHEN p_sort_by = 'joined_at' AND p_sort_order = 'asc' THEN cm.joined_at END ASC,
            CASE WHEN p_sort_by = 'joined_at' AND p_sort_order = 'desc' THEN cm.joined_at END DESC,
            CASE WHEN p_sort_by = 'updated_at' AND p_sort_order = 'asc' THEN cm.updated_at END ASC,
            CASE WHEN p_sort_by = 'updated_at' AND p_sort_order = 'desc' THEN cm.updated_at END DESC
        LIMIT p_limit OFFSET v_offset
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'community_id', community_id,
            'user_id', user_id,
            'role', role,
            'member_status', member_status,
            'joined_at', joined_at,
            'invited_at', invited_at,
            'invited_by', invited_by,
            'updated_at', updated_at,
            'users', jsonb_build_object(
                'id', user_id_col,
                'bio', bio,
                'email', email,
                'username', username,
                'first_name', first_name,
                'last_name', last_name,
                'avatar_url', avatar_url
            )
        )
    ) INTO v_members
    FROM ordered_members;
    
    RETURN jsonb_build_object(
        'members', COALESCE(v_members, '[]'::jsonb),
        'total_count', v_total_count
    );
END;
$$;
