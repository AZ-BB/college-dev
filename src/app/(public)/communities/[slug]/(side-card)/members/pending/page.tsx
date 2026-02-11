import { getCommunityBySlug } from "@/action/communities";
import { getCommunityMembers } from "@/action/members";
import { CommunityMemberStatus, CommunityRole } from "@/enums/enums";
import PendingMemberCard from "./_components/pending-member-card";
import { getUserMembership } from "@/utils/get-user-membership";
import { redirect } from "next/navigation";

export default async function PendingMembersPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{
        page?: string,
    }>,
}) {
    const { slug } = await params;
    const { page } = await searchParams;

    const userMembership = await getUserMembership(slug);

    if (userMembership?.role !== CommunityRole.ADMIN && userMembership?.role !== CommunityRole.OWNER) {
        redirect(`/communities/${slug}`);
    }

    const { data: community, error: communityError } = await getCommunityBySlug(slug);
    if (communityError || !community) return null;
    const { data: pendingMembers, error: pendingMembersError } = await getCommunityMembers(
        community.id,
        {
            filter: {
                status: CommunityMemberStatus.PENDING,
            },
            page: page ? parseInt(page) : 1,
            limit: 10,
        }
    );

    if (pendingMembersError || !pendingMembers) return null;

    return (
        <div className="space-y-4">
            <h1 className="font-bold">Memberships Requests</h1>

            {pendingMembers.members.map((member) => (
                <PendingMemberCard
                    key={member.id}
                    member={member}
                />
            ))}

            {
                pendingMembers.totalCount === 0 && (
                    <div className="text-center text-sm text-grey-600 font-medium py-4">
                        No Pending Memberships Requests
                    </div>
                )
            }
        </div>
    )
}