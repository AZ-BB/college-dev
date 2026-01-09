-- Update the trigger function to add joined_at and member_status when creating owner membership
CREATE OR REPLACE FUNCTION create_community_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_members
        (community_id, user_id, role, joined_at, member_status)
    VALUES
        (NEW.id, NEW.created_by, 'OWNER', CURRENT_TIMESTAMP, 'ACTIVE');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
