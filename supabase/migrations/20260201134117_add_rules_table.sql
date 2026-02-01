CREATE TABLE community_rules (
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    rule TEXT NOT NULL,
    index INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_community_rules_updated_at BEFORE UPDATE ON community_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: set the next unique index (1, 2, 3, ...) for the rule's community_id
CREATE OR REPLACE FUNCTION set_community_rule_index_for_community()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT COALESCE(MAX(r.index), 0) + 1
  INTO NEW.index
  FROM community_rules r
  WHERE r.community_id = NEW.community_id;
  RETURN NEW;
END;
$$;

-- Trigger: before INSERT, assign the next index for this community
CREATE TRIGGER set_community_rule_index_trigger
  BEFORE INSERT ON community_rules
  FOR EACH ROW
  EXECUTE FUNCTION set_community_rule_index_for_community();

-- Backfill existing rows with sequential index per community (1, 2, 3, ...)
UPDATE community_rules r
SET index = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY community_id ORDER BY id) AS rn
  FROM community_rules
) sub
WHERE r.id = sub.id;

-- Unique index per community so (community_id, index) is unique
CREATE UNIQUE INDEX community_rules_community_id_index_key
  ON community_rules (community_id, index);
