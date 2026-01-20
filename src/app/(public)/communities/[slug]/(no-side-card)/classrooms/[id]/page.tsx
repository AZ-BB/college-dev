import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";
import ClassroomModal from "../_components/create-classroom-modal";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClassroomViewer from "./_components/classroom-viewer";
import { Tables } from "@/database.types";

async function getClassroom(classroomId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: classroom, error: classroomError } = await supabase
        .from("classrooms")
        .select(`
            *,
            modules(*,lessons(*, lesson_resources(*)))
        `)
        .eq("id", classroomId)
        .single();

    if (classroomError || !classroom) {
        return notFound();
    }

    return classroom;
}

export type Classroom = Awaited<ReturnType<typeof getClassroom>>;

export default async function ClassroomPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = await params;

    // Get community to get communityId
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) {
        return notFound();
    }

    // Parse classroom ID from URL
    const classroomId = parseInt(id, 10);
    if (isNaN(classroomId)) {
        return notFound();
    }

    const classroom = await getClassroom(classroomId);

    return (
        <>
            <ClassroomViewer classroom={classroom} />
        </>
    );
}