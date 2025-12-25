-- Enable Row Level Security on communities table
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- SELECT Policy: Public - anyone can read communities
CREATE POLICY "Public can select communities" ON communities
FOR SELECT
USING (true);

-- INSERT Policy: Public - anyone can insert communities
CREATE POLICY "Public can insert communities" ON communities
FOR INSERT
TO public
WITH CHECK (true);

-- UPDATE Policy: Only owners and admins can update communities
CREATE POLICY "Owners and admins can update communities" ON communities
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = communities.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('OWNER', 'ADMIN')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = communities.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('OWNER', 'ADMIN')
    )
);

-- DELETE Policy: Only owners and admins can delete communities
CREATE POLICY "Owners and admins can delete communities" ON communities
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = communities.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('OWNER', 'ADMIN')
    )
);

