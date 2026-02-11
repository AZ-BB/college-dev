import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";
import ClassroomCard from "./_components/classroom-card";
import AddCourseCard from "./_components/add-course-card";
import ClassroomModal from "./_components/create-classroom-modal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import AccessControl from "@/components/access-control";
import { UserAccess } from "@/enums/enums";
import { getUserMembership } from "@/utils/get-user-membership";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { getUserData } from "@/utils/get-user-data";

export default async function ClassroomsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) {
        return notFound();
    }

    const membership = await getUserMembership(community.id);
    const user = await getUserData();

    // Use RPC to get classrooms with stats and is_joined flag
    const supabase = await createSupabaseServerClient();
    const viewDrafts = membership?.role === UserAccess.OWNER || membership?.role === UserAccess.ADMIN;
    
    const { data, error: classroomsError } = await supabase.rpc(
        'get_classrooms_with_join_status' as any,
        {
            p_community_id: community.id,
            p_user_id: user?.id || null,
            p_view_drafts: viewDrafts
        }
    );

    const classroomsWithStats = data || [];

    if (classroomsError) {
        console.error("Error fetching classrooms:", classroomsError);
        return notFound();
    }

    return (
        <>
            {
                classroomsWithStats.length > 0 &&
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {classroomsWithStats.map((classroom: any) => (
                        <ClassroomCard 
                            key={classroom.id} 
                            classroom={{
                                ...classroom,
                                modulesCount: classroom.modules_count,
                                lessonsCount: classroom.lessons_count,
                                resourcesCount: classroom.resources_count,
                                is_joined: classroom.is_joined,
                            }} 
                            communitySlug={slug}
                            communityId={community.id}
                            communityName={community.name}
                            membership={membership}
                            userId={user?.id || null}
                        />
                    ))}
                    <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                        <AddCourseCard communityId={community.id} />
                    </AccessControl>
                </div>
            }

            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                {
                    classroomsWithStats.length === 0 &&
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

            <AccessControl allowedAccess={[UserAccess.MEMBER, UserAccess.NOT_MEMBER, UserAccess.ANONYMOUS]}>
                {
                    classroomsWithStats.length === 0 &&
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div>
                            <Image src="/placeholders/client-empty-classrooms.png" alt="No classrooms found" width={320} height={320} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-center text-xl font-bold text-gray-900">
                            Awesome courses are coming soon!
                        </p>
                    </div>
                }
            </AccessControl>
        </>
    )
}   