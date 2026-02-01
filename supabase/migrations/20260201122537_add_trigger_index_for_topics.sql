-- Function: set the next unique index (0, 1, 2, ...) for the topic's community_id
CREATE OR REPLACE FUNCTION set_topic_index_for_community()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT COALESCE(MAX(t.index), -1) + 1
  INTO NEW.index
  FROM topics t
  WHERE t.community_id = NEW.community_id;
  RETURN NEW;
END;
$$;

-- Trigger: before INSERT, assign the next index for this community
CREATE TRIGGER set_topic_index_trigger
  BEFORE INSERT ON topics
  FOR EACH ROW
  EXECUTE FUNCTION set_topic_index_for_community();

-- Backfill existing rows with sequential index per community (0, 1, 2, ...)
UPDATE topics t
SET index = sub.rn
FROM (
  SELECT id, (ROW_NUMBER() OVER (PARTITION BY community_id ORDER BY id)) - 1 AS rn
  FROM topics
) sub
WHERE t.id = sub.id;

-- Unique index per community so (community_id, index) is unique
CREATE UNIQUE INDEX IF NOT EXISTS topics_community_id_index_key
  ON topics (community_id, index);
