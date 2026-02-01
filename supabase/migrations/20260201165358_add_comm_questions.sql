CREATE TYPE community_question_type_enum AS ENUM ('TEXT', 'EMAIL', 'MULTIPLE_CHOICE');

CREATE TABLE community_questions (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    index INTEGER NOT NULL,
    type community_question_type_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_community_questions_updated_at BEFORE UPDATE ON community_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

