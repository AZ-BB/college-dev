CREATE TABLE banned_list (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE banned_list ENABLE ROW LEVEL SECURITY;

-- SELECT: Any authenticated user can view banned list
CREATE POLICY "Authenticated users can select banned_list" ON banned_list
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Only community owners/admins can add to banned list
CREATE POLICY "Owners and admins can insert banned_list" ON banned_list
    FOR INSERT
    TO authenticated
    WITH CHECK (is_community_admin_or_owner(community_id));

-- DELETE: Only community owners/admins can remove from banned list
CREATE POLICY "Owners and admins can delete banned_list" ON banned_list
    FOR DELETE
    TO authenticated
    USING (is_community_admin_or_owner(community_id));