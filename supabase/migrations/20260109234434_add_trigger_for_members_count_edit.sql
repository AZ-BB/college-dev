-- Migration to update member_count trigger to only count MEMBER role
-- This modifies the trigger created in 20260109234017_add_trigger_for_members_count.sql
-- to exclude OWNER and ADMIN roles from the member_count

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_member_count_on_insert ON community_members;
DROP TRIGGER IF EXISTS update_member_count_on_update ON community_members;
DROP TRIGGER IF EXISTS update_member_count_on_delete ON community_members;

-- Replace function with updated version that only counts MEMBER role
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
DECLARE
    v_community_id INTEGER;
    v_old_status community_member_status_enum;
    v_new_status community_member_status_enum;
    v_old_role community_role_enum;
    v_new_role community_role_enum;
BEGIN
    -- Handle INSERT: increment if status is ACTIVE and role is MEMBER
    IF TG_OP = 'INSERT' THEN
        IF NEW.member_status = 'ACTIVE' AND NEW.role = 'MEMBER' THEN
            UPDATE communities
            SET member_count = member_count + 1
            WHERE id = NEW.community_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE: adjust count based on status and role transitions
    IF TG_OP = 'UPDATE' THEN
        v_old_status := OLD.member_status;
        v_new_status := NEW.member_status;
        v_old_role := OLD.role;
        v_new_role := NEW.role;
        v_community_id := NEW.community_id;

        -- Check if status or role changed
        IF v_old_status != v_new_status OR v_old_role != v_new_role THEN
            -- Determine if old state should be counted (MEMBER + ACTIVE)
            -- and if new state should be counted (MEMBER + ACTIVE)
            IF v_old_role = 'MEMBER' AND v_old_status = 'ACTIVE' AND 
               NOT (v_new_role = 'MEMBER' AND v_new_status = 'ACTIVE') THEN
                -- Was counted, now shouldn't be: decrement
                UPDATE communities
                SET member_count = GREATEST(member_count - 1, 0)
                WHERE id = v_community_id;
            ELSIF NOT (v_old_role = 'MEMBER' AND v_old_status = 'ACTIVE') AND 
                  v_new_role = 'MEMBER' AND v_new_status = 'ACTIVE' THEN
                -- Wasn't counted, now should be: increment
                UPDATE communities
                SET member_count = member_count + 1
                WHERE id = v_community_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE: decrement if status was ACTIVE and role was MEMBER
    IF TG_OP = 'DELETE' THEN
        IF OLD.member_status = 'ACTIVE' AND OLD.role = 'MEMBER' THEN
            UPDATE communities
            SET member_count = GREATEST(member_count - 1, 0)
            WHERE id = OLD.community_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for INSERT
CREATE TRIGGER update_member_count_on_insert
    AFTER INSERT ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();

-- Recreate trigger for UPDATE
-- Fires when status or role changes
CREATE TRIGGER update_member_count_on_update
    AFTER UPDATE ON community_members
    FOR EACH ROW
    WHEN (
        OLD.member_status IS DISTINCT FROM NEW.member_status 
        OR OLD.role IS DISTINCT FROM NEW.role
    )
    EXECUTE FUNCTION update_community_member_count();

-- Recreate trigger for DELETE
CREATE TRIGGER update_member_count_on_delete
    AFTER DELETE ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();
