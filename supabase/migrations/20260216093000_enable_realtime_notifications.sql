-- Enable realtime for notifications table
-- This allows clients to subscribe to INSERT, UPDATE, DELETE events on the notifications table

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
