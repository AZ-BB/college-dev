CREATE TABLE users
(
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT NULL,
    bio TEXT DEFAULT NULL,

    website_url TEXT DEFAULT NULL,
    facebook_url TEXT DEFAULT NULL,
    instagram_url TEXT DEFAULT NULL,
    x_url TEXT DEFAULT NULL,
    youtube_url TEXT DEFAULT NULL,
    linkedin_url TEXT DEFAULT NULL,

    is_online BOOLEAN NOT NULL DEFAULT FALSE,

    followers_count INTEGER NOT NULL DEFAULT 0,
    following_count INTEGER NOT NULL DEFAULT 0,
    contributions_count INTEGER NOT NULL DEFAULT 0,

    location TEXT DEFAULT NULL,

    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    posts_count INTEGER NOT NULL DEFAULT 0,
    poll_votes_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE POLICY "Users can delete their own account" ON users FOR
DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own account" ON users FOR
UPDATE TO authenticated USING (auth.uid() = id);

CREATE TYPE audience_size_enum AS ENUM
('UNDER_10K', '10K_TO_100K', '100K_TO_1M', 'OVER_1M');

CREATE TABLE communities
(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    about TEXT DEFAULT NULL,
    cover_image TEXT DEFAULT NULL,

    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    price NUMERIC NOT NULL DEFAULT 0,
    slug TEXT NOT NULL UNIQUE,

    member_count INTEGER NOT NULL DEFAULT 0,
    support_email TEXT DEFAULT NULL,
    audience_size audience_size_enum NOT NULL DEFAULT 'UNDER_10K',

    created_by UUID NOT NULL REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE community_role_enum AS ENUM
('OWNER', 'MEMBER', 'ADMIN');

CREATE TABLE community_members
(
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role community_role_enum NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE community_gallery_media
(
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on community_gallery_media table
ALTER TABLE community_gallery_media ENABLE ROW LEVEL SECURITY;

-- INSERT Policy: Only Admins and Owners can add gallery media to their community
CREATE POLICY "Admins and Owners can insert gallery media" ON community_gallery_media 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_gallery_media.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- UPDATE Policy: Only Admins and Owners can update gallery media in their community
CREATE POLICY "Admins and Owners can update gallery media" ON community_gallery_media 
FOR
UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_gallery_media.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK
(
    EXISTS
(
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_gallery_media.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE Policy: Only Admins and Owners can delete gallery media from their community
CREATE POLICY "Admins and Owners can delete gallery media" ON community_gallery_media 
FOR
DELETE TO authenticated 
USING (
    EXISTS (
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_gallery_media.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
);

CREATE TABLE community_cta_links
(
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on community_cta_links table
ALTER TABLE community_cta_links ENABLE ROW LEVEL SECURITY;

-- INSERT Policy: Only Admins and Owners can add CTA links to their community
CREATE POLICY "Admins and Owners can insert CTA links" ON community_cta_links 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = community_cta_links.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- UPDATE Policy: Only Admins and Owners can update CTA links in their community
CREATE POLICY "Admins and Owners can update CTA links" ON community_cta_links 
FOR
UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_cta_links.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK
(
    EXISTS
(
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_cta_links.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE Policy: Only Admins and Owners can delete CTA links from their community
CREATE POLICY "Admins and Owners can delete CTA links" ON community_cta_links 
FOR
DELETE TO authenticated 
USING (
    EXISTS (
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_cta_links.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
);


-- Enable Row Level Security on community_members table
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- DELETE Policy 1: Admins and Owners of a community can delete members from their community
CREATE POLICY "Admins and Owners can delete community members" ON community_members 
FOR
DELETE TO authenticated 
USING (
    EXISTS (
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE Policy 2: Members can only delete their own memberships
CREATE POLICY "Members can delete their own memberships" ON community_members 
FOR
DELETE TO authenticated 
USING (user_id = auth.uid());

-- UPDATE Policy 1: Admins and Owners of a community can update members in their community
CREATE POLICY "Admins and Owners can update community members" ON community_members 
FOR
UPDATE TO authenticated 
USING (
    EXISTS (
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
)
WITH CHECK
(
    EXISTS
(
        SELECT 1
FROM community_members AS cm
WHERE cm.community_id = community_members.community_id
    AND cm.user_id = auth.uid()
    AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- Create a reusable trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for communities table
CREATE TRIGGER update_communities_updated_at BEFORE
UPDATE ON communities
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for community_gallery_media table
CREATE TRIGGER update_community_gallery_media_updated_at BEFORE
UPDATE ON community_gallery_media
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for community_cta_links table
CREATE TRIGGER update_community_cta_links_updated_at BEFORE
UPDATE ON community_cta_links
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for community_members table
CREATE TRIGGER update_community_members_updated_at BEFORE
UPDATE ON community_members
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Create a trigger function to add the creator as an owner when a community is created
CREATE OR REPLACE FUNCTION create_community_owner_membership
()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO community_members
        (community_id, user_id, role)
    VALUES
        (NEW.id, NEW.created_by, 'OWNER');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create owner membership when a community is created
CREATE TRIGGER create_owner_on_community_creation AFTER
INSERT ON
communities
FOR
EACH
ROW
EXECUTE FUNCTION create_community_owner_membership
();

CREATE TABLE community_post_categories
(
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    icon TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts
(
    id SERIAL PRIMARY KEY,
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    category_id INTEGER REFERENCES community_post_categories(id) DEFAULT NULL,

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- INSERT Policy: Only members, admins, and owners of a specific community can create posts
CREATE POLICY "Members can insert posts in their community" ON posts 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM community_members AS cm
        WHERE cm.community_id = posts.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('MEMBER', 'ADMIN', 'OWNER')
    )
);

-- UPDATE Policy: Only the post author or community admins/owners can update posts
CREATE POLICY "Authors and community admins can update posts" ON posts 
FOR
UPDATE TO authenticated 
USING (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1
    FROM community_members AS cm
    WHERE cm.community_id = posts.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- DELETE Policy: Only the post author or community admins/owners can delete posts
CREATE POLICY "Authors and community admins can delete posts" ON posts 
FOR
DELETE TO authenticated 
USING (
    author_id = auth.uid()
    OR EXISTS (
        SELECT 1
    FROM community_members AS cm
    WHERE cm.community_id = posts.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('ADMIN', 'OWNER')
    )
);

-- SELECT Policy: Public communities can be viewed by anyone, private communities only by members
CREATE POLICY "Anyone can view posts in public communities" ON posts 
FOR
SELECT USING (
    EXISTS (
        SELECT 1
    FROM communities c
    WHERE c.id = posts.community_id
        AND c.is_public = TRUE
    )
);

-- SELECT Policy: Only members of private communities can view posts
CREATE POLICY "Members can view posts in private communities" ON posts 
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = posts.community_id
        AND c.is_public = FALSE
        AND EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = c.id
            AND cm.user_id = auth.uid()
        )
    )
);

-- Trigger for community_post_categories table
CREATE TRIGGER update_community_post_categories_updated_at BEFORE UPDATE ON community_post_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for posts table updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();