CREATE TABLE notifications_count (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0
);

-- RLS: users can only view their own notifications count
ALTER TABLE notifications_count ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications count"
    ON notifications_count
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert notifications count"
    ON notifications_count
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update notifications count"
    ON notifications_count
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- No DELETE policies: those operations are disabled