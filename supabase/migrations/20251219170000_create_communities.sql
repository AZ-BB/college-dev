-- Create communities table
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    avatar TEXT,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 0,
    price NUMERIC(10, 2),
    currency TEXT DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    is_free BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community_members table for many-to-many relationship
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_communities_creator_id ON communities(creator_id);
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_is_active ON communities(is_active);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);

-- Add trigger for updated_at on communities
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update member_count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE communities 
        SET member_count = GREATEST(member_count - 1, 0) 
        WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update member_count
CREATE TRIGGER update_member_count_on_join
    AFTER INSERT ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();

CREATE TRIGGER update_member_count_on_leave
    AFTER DELETE ON community_members
    FOR EACH ROW
    EXECUTE FUNCTION update_community_member_count();

-- Function to automatically add creator as owner when community is created
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_members (community_id, user_id, role)
    VALUES (NEW.id, NEW.creator_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as owner
CREATE TRIGGER add_creator_as_community_owner
    AFTER INSERT ON communities
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_owner();

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities table

-- Everyone can view public communities
CREATE POLICY "Public communities are viewable by everyone"
ON communities
FOR SELECT
USING (is_public = true OR auth.uid() = creator_id);

-- Only authenticated users can create communities
CREATE POLICY "Authenticated users can create communities"
ON communities
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Only creator and admins can update their communities
CREATE POLICY "Creators and admins can update their communities"
ON communities
FOR UPDATE
USING (
    auth.uid() = creator_id 
    OR EXISTS (
        SELECT 1 FROM community_members 
        WHERE community_id = id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- Only creator can delete their communities
CREATE POLICY "Creators can delete their communities"
ON communities
FOR DELETE
USING (auth.uid() = creator_id);

-- RLS Policies for community_members table

-- Members can view other members in their communities
CREATE POLICY "Members can view community members"
ON community_members
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM communities 
        WHERE id = community_id 
        AND (is_public = true OR creator_id = auth.uid())
    )
);

-- Authenticated users can join communities
CREATE POLICY "Users can join communities"
ON community_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Owners and admins can add members
CREATE POLICY "Owners and admins can add members"
ON community_members
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
);

-- Users can leave communities (delete their own membership)
CREATE POLICY "Users can leave communities"
ON community_members
FOR DELETE
USING (auth.uid() = user_id);

-- Owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
ON community_members
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
);

-- Owners and admins can update member roles
CREATE POLICY "Owners and admins can update member roles"
ON community_members
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
);

