CREATE POLICY "Public can select community gallery media" ON community_gallery_media
FOR SELECT
USING (true);

CREATE POLICY "Public can select communities cta links" ON community_cta_links
FOR SELECT
USING (true);


ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT WITH CHECK (true);

