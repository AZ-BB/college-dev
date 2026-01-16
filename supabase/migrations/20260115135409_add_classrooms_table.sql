CREATE TYPE classroom_type_enum AS ENUM
('PRIVATE', 'PUBLIC', 'ONE_TIME_PAYMENT', 'TIME_UNLOCK');

CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,

    slug TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,
    description TEXT NOT NULL,

    cover_url TEXT,
    type classroom_type_enum NOT NULL,

    amount_one_time NUMERIC DEFAULT NULL,
    time_unlock_in_days INTEGER DEFAULT NULL,

    is_draft BOOLEAN NOT NULL,

    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,

    classroom_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT NOT NULL,
    index INTEGER NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TYPE video_type_enum AS ENUM
('YOUTUBE', 'LOOM', 'VIMEO');

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,

    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    index INTEGER NOT NULL,

    video_url TEXT DEFAULT NULL,
    video_type video_type_enum DEFAULT NULL,
    text_content TEXT DEFAULT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TYPE lesson_resource_type_enum AS ENUM
('FILE', 'LINK');

CREATE TABLE lesson_resources (
    id SERIAL PRIMARY KEY,

    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

    url TEXT NOT NULL,

    type lesson_resource_type_enum NOT NULL,

    file_type TEXT,
    file_size INTEGER,
    file_name TEXT,

    link_name TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_lesson_resources_updated_at BEFORE UPDATE ON lesson_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

