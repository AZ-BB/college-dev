-- Add SELECT policy for community_members table
-- This allows anyone to view the members of any community

-- CREATE OR REPLACE POLICY "Anyone can view community members" ON community_members FOR SELECT USING (true);

