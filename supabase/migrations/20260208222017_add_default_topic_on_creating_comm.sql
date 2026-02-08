-- Update the trigger function to create a default "General" topic when creating owner membership
CREATE OR REPLACE FUNCTION create_community_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_members
        (community_id, user_id, role, joined_at, member_status)
    VALUES
        (NEW.id, NEW.created_by, 'OWNER', CURRENT_TIMESTAMP, 'ACTIVE');
    
    INSERT INTO topics
        (community_id, name, write_permission_type)
    VALUES
        (NEW.id, 'General', 'PUBLIC');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
