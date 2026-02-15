CREATE TABLE notifications
(
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT DEFAULT NULL,
    url TEXT DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RLS: users can only view their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- No UPDATE or DELETE or INSERT policies: those operations are disabled