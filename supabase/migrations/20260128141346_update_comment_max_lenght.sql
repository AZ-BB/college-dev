ALTER TABLE comments DROP COLUMN content;
ALTER TABLE comments ADD COLUMN content TEXT NOT NULL CHECK (length(content) <= 500);