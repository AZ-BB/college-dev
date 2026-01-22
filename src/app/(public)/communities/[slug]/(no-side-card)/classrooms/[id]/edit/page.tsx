import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";
import ClassroomModal from "../../_components/create-classroom-modal";
import { ClassroomEditor } from "./_components/classroom-editor";
import { getClassroom } from "@/action/classroom";
import { Classroom } from "./_components/types";

export default async function EditClassroomPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
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
        <ClassroomEditor
            initialClassroom={classroom}
        />
    );
}
