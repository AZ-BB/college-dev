-- Add unique constraint on user_id for UPSERT to work
ALTER TABLE notifications_count
ADD CONSTRAINT notifications_count_user_id_unique UNIQUE (user_id);

-- Function to increment notification count when a notification is inserted
CREATE OR REPLACE FUNCTION increment_notification_count()
RETURNS TRIGGER AS $$
BEGIN
    -- UPSERT: Insert new row with count=1 or increment existing count
    INSERT INTO notifications_count (user_id, count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET count = notifications_count.count + 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires after each notification insert
CREATE TRIGGER on_notification_insert
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION increment_notification_count();
