-- Seed existing communities with their creators as owners
INSERT INTO community_members (community_id, user_id, role)
SELECT id, creator_id, 'owner'::community_role
FROM communities
ON CONFLICT (community_id, user_id) DO UPDATE 
SET role = 'owner';