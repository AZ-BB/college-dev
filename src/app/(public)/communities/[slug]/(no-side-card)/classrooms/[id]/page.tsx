import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";
import ClassroomModal from "../_components/create-classroom-modal";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClassroomViewer from "./_components/classroom-viewer";
import { Tables } from "@/database.types";
import { getClassroom } from "@/action/classroom";

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

    const classroom: Awaited<ReturnType<typeof getClassroom>> = await getClassroom(classroomId);
    if (classroom.error || !classroom.data) {
        return notFound();
    }

    return (
        <>
            <ClassroomViewer classroom={classroom.data} />
        </>
    );
}