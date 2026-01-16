import CreateClassroomModal from "./_components/create-classroom-modal";
import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";

export default async function ClassroomsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) {
        return notFound();
    }

    return (
        <div>
            <h1>Classrooms</h1>
            <CreateClassroomModal communityId={community.id} />
        </div>
    )
}   