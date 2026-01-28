ALTER TABLE posts DROP COLUMN category_id;
DROP TABLE community_post_categories;

CREATE TYPE topic_write_permission_type_enum AS ENUM
('PUBLIC', 'ADMINS');

CREATE TABLE topics
(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    write_permission_type topic_write_permission_type_enum NOT NULL,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_topics_updated_at BEFORE
UPDATE ON topics FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

ALTER TABLE posts ADD topic_id INTEGER REFERENCES topics(id) DEFAULT NULL;