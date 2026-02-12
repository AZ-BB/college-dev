-- Prevent duplicate bans for the same user in the same community
ALTER TABLE banned_list ADD CONSTRAINT banned_list_community_id_user_id_key UNIQUE (community_id, user_id);
