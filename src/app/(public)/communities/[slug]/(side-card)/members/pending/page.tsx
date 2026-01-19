import { getCommunityBySlug } from "@/action/communities";
import { getCommunityMembers } from "@/action/members";
import { CommunityMemberStatus } from "@/enums/enums";
import PendingMemberCard from "./_components/pending-member-card";

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

    console.log(pendingMembers);

    return (
        <div>
            <h1 className="font-bold">Memberships Requests</h1>

            {pendingMembers.members.map((member) => (
                <PendingMemberCard
                    key={member.id}
                    member={member}
                />
            ))}
        </div>
    )
}