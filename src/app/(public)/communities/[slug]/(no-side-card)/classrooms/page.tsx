import { getClassrooms } from "@/action/classroom";
import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";
import ClassroomCard from "./_components/classroom-card";
import AddCourseCard from "./_components/add-course-card";
import ClassroomModal from "./_components/create-classroom-modal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AccessControl from "@/components/access-control";
import { UserAccess } from "@/enums/enums";

export default async function ClassroomsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) {
        return notFound();
    }

    const { data: classrooms, error: classroomsError } = await getClassrooms();
    if (classroomsError || !classrooms) {
        return notFound();
    }

    // Filter classrooms by community_id
    const communityClassrooms = classrooms.filter(
        (classroom) => classroom.community_id === community.id
    );

    return (
        <>
            {
                communityClassrooms.length > 0 &&
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {communityClassrooms.map((classroom) => (
                        <ClassroomCard key={classroom.id} classroom={classroom} communitySlug={slug} />
                    ))}
                    <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                        <AddCourseCard communityId={community.id} />
                    </AccessControl>
                </div>
            }

            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                {
                    communityClassrooms.length === 0 &&
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div>
                            <Image src="/placeholders/classrooms.png" alt="No classrooms found" width={320} height={320} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-center text-xl font-bold text-gray-900">
                            Structured courses turn paying members <br /> into recurring income
                        </p>
                        <ClassroomModal communityId={community.id}>
                            <Button variant="default" className="rounded-[16px] py-7 text-lg px-12">
                                Add Course
                            </Button>
                        </ClassroomModal>
                    </div>
                }
            </AccessControl>
        </>
    )
}   