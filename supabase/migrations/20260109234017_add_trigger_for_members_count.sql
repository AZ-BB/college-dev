-- Function to update member_count based on member_status changes
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
DECLARE
    v_community_id INTEGER;
    v_old_status community_member_status_enum;
    v_new_status community_member_status_enum;
BEGIN
    -- Handle INSERT: increment if status is ACTIVE
    IF TG_OP = 'INSERT' THEN
        IF NEW.member_status = 'ACTIVE' THEN
            UPDATE communities
            SET member_count = member_count + 1
            WHERE id = NEW.community_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE: adjust count based on status transitions
    IF TG_OP = 'UPDATE' THEN
        v_old_status := OLD.member_status;
        v_new_status := NEW.member_status;
        v_community_id := NEW.community_id;

        -- Only update if status actually changed
        IF v_old_status != v_new_status THEN
            -- Transition from non-ACTIVE to ACTIVE: increment
            IF v_old_status != 'ACTIVE' AND v_new_status = 'ACTIVE' THEN
                UPDATE communities
                SET member_count = member_count + 1
                WHERE id = v_community_id;
            -- Transition from ACTIVE to non-ACTIVE: decrement
            ELSIF v_old_status = 'ACTIVE' AND v_new_status != 'ACTIVE' THEN
                UPDATE communities
                SET member_count = GREATEST(member_count - 1, 0)
                WHERE id = v_community_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE: decrement if status was ACTIVE
    IF TG_OP = 'DELETE' THEN
        IF OLD.member_status = 'ACTIVE' THEN
            UPDATE communities
            SET member_count = GREATEST(member_count - 1, 0)
            WHERE id = OLD.community_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
CREATE TRIGGER update_member_count_on_insert
    AFTER INSERT ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();

-- Create trigger for UPDATE
CREATE TRIGGER update_member_count_on_update
    AFTER UPDATE ON community_members
    FOR EACH ROW
    WHEN (OLD.member_status IS DISTINCT FROM NEW.member_status)
    EXECUTE FUNCTION update_community_member_count();

-- Create trigger for DELETE
CREATE TRIGGER update_member_count_on_delete
    AFTER DELETE ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();
