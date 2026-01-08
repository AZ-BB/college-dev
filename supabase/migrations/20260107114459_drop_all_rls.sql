-- Drop all RLS policies

-- Drop policies on users table
DROP POLICY IF EXISTS "Users can delete their own account" ON users;
DROP POLICY IF EXISTS "Users can update their own account" ON users;
DROP POLICY IF EXISTS "Users can select all users" ON users;
DROP POLICY IF EXISTS "Users can insert users" ON users;

-- Drop policies on communities table
DROP POLICY IF EXISTS "Public can select communities" ON communities;
DROP POLICY IF EXISTS "Public can insert communities" ON communities;
DROP POLICY IF EXISTS "Owners and admins can update communities" ON communities;
DROP POLICY IF EXISTS "Owners and admins can delete communities" ON communities;

-- Drop policies on community_members table
DROP POLICY IF EXISTS "Admins and Owners can delete community members" ON community_members;
DROP POLICY IF EXISTS "Members can delete their own memberships" ON community_members;
DROP POLICY IF EXISTS "Admins and Owners can update community members" ON community_members;

-- Drop policies on community_gallery_media table
DROP POLICY IF EXISTS "Admins and Owners can insert gallery media" ON community_gallery_media;
DROP POLICY IF EXISTS "Admins and Owners can update gallery media" ON community_gallery_media;
DROP POLICY IF EXISTS "Admins and Owners can delete gallery media" ON community_gallery_media;
DROP POLICY IF EXISTS "Public can select community gallery media" ON community_gallery_media;

-- Drop policies on community_cta_links table
DROP POLICY IF EXISTS "Admins and Owners can insert CTA links" ON community_cta_links;
DROP POLICY IF EXISTS "Admins and Owners can update CTA links" ON community_cta_links;
DROP POLICY IF EXISTS "Admins and Owners can delete CTA links" ON community_cta_links;
DROP POLICY IF EXISTS "Public can select communities cta links" ON community_cta_links;

-- Drop policies on posts table
DROP POLICY IF EXISTS "Members can insert posts in their community" ON posts;
DROP POLICY IF EXISTS "Authors and community admins can update posts" ON posts;
DROP POLICY IF EXISTS "Authors and community admins can delete posts" ON posts;
DROP POLICY IF EXISTS "Anyone can view posts in public communities" ON posts;
DROP POLICY IF EXISTS "Members can view posts in private communities" ON posts;

-- Drop policies on storage.objects (avatars bucket)
DROP POLICY IF EXISTS "Allow public read access to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- Disable Row Level Security on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_gallery_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_cta_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
