ALTER TABLE community_members ADD invited_by UUID REFERENCES users(id) DEFAULT NULL;
ALTER TABLE community_members ADD invited_at TIMESTAMP NULL;

ALTER TABLE community_members DROP COLUMN joined_at;
ALTER TABLE community_members ADD joined_at TIMESTAMP NULL;

CREATE TYPE community_member_status_enum AS ENUM
('PENDING', 'BANNED', 'ACTIVE');
ALTER TABLE community_members ADD member_status community_member_status_enum NOT NULL DEFAULT 'PENDING';

-- Community
CREATE TYPE community_pricing_enum AS ENUM
('FREE', 'SUB', 'ONE_TIME');
ALTER TABLE communities ADD pricing community_pricing_enum NOT NULL DEFAULT 'FREE';

CREATE TYPE community_billing_cycle_enum AS ENUM
('MONTHLY', 'YEARLY', 'MONTHLY_YEARLY');
ALTER TABLE communities ADD billing_cycle community_billing_cycle_enum NULL;

ALTER TABLE communities ADD amount_per_month NUMERIC NULL;
ALTER TABLE communities ADD amount_per_year NUMERIC NULL;
ALTER TABLE communities ADD amount_one_time NUMERIC NULL;

ALTER TABLE communities ADD free_trial BOOLEAN NOT NULL DEFAULT FALSE;

-- Enable Row Level Security on tables
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_text_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_cta_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for communities table
-- ============================================

-- SELECT: Any user (including anonymous) can select communities
CREATE POLICY "Public can select communities" ON communities
FOR SELECT
USING (true);

-- INSERT: Any authenticated user can insert communities
CREATE POLICY "Authenticated users can insert communities" ON communities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Only Admin or Owner can update communities
CREATE POLICY "Admins and Owners can update communities" ON communities
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = communities.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = communities.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE: Only Owner can delete communities
CREATE POLICY "Owners can delete communities" ON communities
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = communities.id
        AND cm.user_id = auth.uid()
        AND cm.role = 'OWNER'
    )
);

-- ============================================
-- RLS Policies for community_text_blocks table
-- ============================================

-- SELECT: Any user (including anonymous) can select community_text_blocks
CREATE POLICY "Public can select community_text_blocks" ON community_text_blocks
FOR SELECT
USING (true);

-- INSERT: Only Admin or Owner can insert community_text_blocks
CREATE POLICY "Admins and Owners can insert community_text_blocks" ON community_text_blocks
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_text_blocks.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- UPDATE: Only Admin or Owner can update community_text_blocks
CREATE POLICY "Admins and Owners can update community_text_blocks" ON community_text_blocks
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_text_blocks.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_text_blocks.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE: Only Admin or Owner can delete community_text_blocks
CREATE POLICY "Admins and Owners can delete community_text_blocks" ON community_text_blocks
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_text_blocks.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- ============================================
-- RLS Policies for community_gallery_media table
-- ============================================

-- SELECT: Any user (including anonymous) can select community_gallery_media
CREATE POLICY "Public can select community_gallery_media" ON community_gallery_media
FOR SELECT
USING (true);

-- INSERT: Only Admin or Owner can insert community_gallery_media
CREATE POLICY "Admins and Owners can insert community_gallery_media" ON community_gallery_media
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_gallery_media.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- UPDATE: Only Admin or Owner can update community_gallery_media
CREATE POLICY "Admins and Owners can update community_gallery_media" ON community_gallery_media
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_gallery_media.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_gallery_media.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE: Only Admin or Owner can delete community_gallery_media
CREATE POLICY "Admins and Owners can delete community_gallery_media" ON community_gallery_media
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_gallery_media.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- ============================================
-- RLS Policies for community_cta_links table
-- ============================================

-- SELECT: Any user (including anonymous) can select community_cta_links
CREATE POLICY "Public can select community_cta_links" ON community_cta_links
FOR SELECT
USING (true);

-- INSERT: Only Admin or Owner can insert community_cta_links
CREATE POLICY "Admins and Owners can insert community_cta_links" ON community_cta_links
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_cta_links.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- UPDATE: Only Admin or Owner can update community_cta_links
CREATE POLICY "Admins and Owners can update community_cta_links" ON community_cta_links
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_cta_links.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_cta_links.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE: Only Admin or Owner can delete community_cta_links
CREATE POLICY "Admins and Owners can delete community_cta_links" ON community_cta_links
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_cta_links.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

