-- Add new enum values to community_member_status_enum
-- These values are added at the end of the enum to avoid affecting existing data
ALTER TYPE community_member_status_enum ADD VALUE 'CHURNED';
ALTER TYPE community_member_status_enum ADD VALUE 'LEAVING_SOON';
