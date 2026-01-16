-- Add indexes on foreign key columns for better RLS performance
CREATE INDEX idx_classrooms_community_id ON classrooms(community_id);
CREATE INDEX idx_modules_classroom_id ON modules(classroom_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lesson_resources_lesson_id ON lesson_resources(lesson_id);

-- Enable Row Level Security on all classroom-related tables
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR PERFORMANCE
-- ============================================

-- Function to get community_id from classroom_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_classroom_community_id(classroom_id_param INTEGER)
RETURNS INTEGER AS $$
    SELECT community_id FROM classrooms WHERE id = classroom_id_param;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get community_id from module_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_module_community_id(module_id_param INTEGER)
RETURNS INTEGER AS $$
    SELECT cl.community_id 
    FROM modules m
    INNER JOIN classrooms cl ON cl.id = m.classroom_id
    WHERE m.id = module_id_param;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get community_id from lesson_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_lesson_community_id(lesson_id_param INTEGER)
RETURNS INTEGER AS $$
    SELECT cl.community_id 
    FROM lessons l
    INNER JOIN modules m ON m.id = l.module_id
    INNER JOIN classrooms cl ON cl.id = m.classroom_id
    WHERE l.id = lesson_id_param;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to check if user can access classroom content in a community
CREATE OR REPLACE FUNCTION can_access_classroom_content(comm_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        -- User is an active member of the community
        (
            auth.uid() IS NOT NULL
            AND is_community_active_member(comm_id)
        )
        OR
        -- Community is public
        EXISTS (
            SELECT 1 FROM communities AS c
            WHERE c.id = comm_id
            AND c.is_public = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- CLASSROOMS TABLE POLICIES
-- ============================================

-- INSERT: Only admins and owners can create classrooms
CREATE POLICY "Admins and Owners can insert classrooms" ON classrooms
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(classrooms.community_id));

-- UPDATE: Only admins and owners can update classrooms
CREATE POLICY "Admins and Owners can update classrooms" ON classrooms
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(classrooms.community_id))
WITH CHECK (is_community_admin_or_owner(classrooms.community_id));

-- DELETE: Only admins and owners can delete classrooms
CREATE POLICY "Admins and Owners can delete classrooms" ON classrooms
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(classrooms.community_id));

-- SELECT: Members of the community can view, or anyone if community is public
CREATE POLICY "Members can view classrooms in their community" ON classrooms
FOR SELECT
USING (can_access_classroom_content(classrooms.community_id));

-- ============================================
-- MODULES TABLE POLICIES
-- ============================================

-- INSERT: Only admins and owners can create modules
CREATE POLICY "Admins and Owners can insert modules" ON modules
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(get_classroom_community_id(modules.classroom_id)));

-- UPDATE: Only admins and owners can update modules
CREATE POLICY "Admins and Owners can update modules" ON modules
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(get_classroom_community_id(modules.classroom_id)))
WITH CHECK (is_community_admin_or_owner(get_classroom_community_id(modules.classroom_id)));

-- DELETE: Only admins and owners can delete modules
CREATE POLICY "Admins and Owners can delete modules" ON modules
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(get_classroom_community_id(modules.classroom_id)));

-- SELECT: Members of the community can view, or anyone if community is public
CREATE POLICY "Members can view modules in their community" ON modules
FOR SELECT
USING (can_access_classroom_content(get_classroom_community_id(modules.classroom_id)));

-- ============================================
-- LESSONS TABLE POLICIES
-- ============================================

-- INSERT: Only admins and owners can create lessons
CREATE POLICY "Admins and Owners can insert lessons" ON lessons
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(get_module_community_id(lessons.module_id)));

-- UPDATE: Only admins and owners can update lessons
CREATE POLICY "Admins and Owners can update lessons" ON lessons
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(get_module_community_id(lessons.module_id)))
WITH CHECK (is_community_admin_or_owner(get_module_community_id(lessons.module_id)));

-- DELETE: Only admins and owners can delete lessons
CREATE POLICY "Admins and Owners can delete lessons" ON lessons
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(get_module_community_id(lessons.module_id)));

-- SELECT: Members of the community can view, or anyone if community is public
CREATE POLICY "Members can view lessons in their community" ON lessons
FOR SELECT
USING (can_access_classroom_content(get_module_community_id(lessons.module_id)));

-- ============================================
-- LESSON_RESOURCES TABLE POLICIES
-- ============================================

-- INSERT: Only admins and owners can create lesson resources
CREATE POLICY "Admins and Owners can insert lesson_resources" ON lesson_resources
FOR INSERT
TO authenticated
WITH CHECK (is_community_admin_or_owner(get_lesson_community_id(lesson_resources.lesson_id)));

-- UPDATE: Only admins and owners can update lesson resources
CREATE POLICY "Admins and Owners can update lesson_resources" ON lesson_resources
FOR UPDATE
TO authenticated
USING (is_community_admin_or_owner(get_lesson_community_id(lesson_resources.lesson_id)))
WITH CHECK (is_community_admin_or_owner(get_lesson_community_id(lesson_resources.lesson_id)));

-- DELETE: Only admins and owners can delete lesson resources
CREATE POLICY "Admins and Owners can delete lesson_resources" ON lesson_resources
FOR DELETE
TO authenticated
USING (is_community_admin_or_owner(get_lesson_community_id(lesson_resources.lesson_id)));

-- SELECT: Members of the community can view, or anyone if community is public
CREATE POLICY "Members can view lesson_resources in their community" ON lesson_resources
FOR SELECT
USING (can_access_classroom_content(get_lesson_community_id(lesson_resources.lesson_id)));
