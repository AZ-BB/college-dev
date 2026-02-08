CREATE TABLE community_questions_answers (
    id SERIAL PRIMARY KEY,
    community_question_id INTEGER NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
    community_member_id INTEGER NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_community_questions_answers_updated_at BEFORE UPDATE ON community_questions_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

