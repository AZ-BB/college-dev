import { getCommunityBySlug } from "@/action/communities";
import Filters from "./_components/filters";
import { getCommunityMembers, getCommunityMembersCounts, getInvitedByUser } from "@/action/members";
import PaginationControl from "@/components/pagination-control";
import { CommunityMemberStatus } from "@/enums/enums";
import MemberCard from "./_components/member-card";

export default async function MembersPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{
        page?: string,
        tab?: CommunityMemberStatus,
    }>
}) {
    const { slug } = await params;
    const { page, tab } = await searchParams;


    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) return null;


    const { data: members, error: membersError } = await getCommunityMembers(community.id, {
        page: page ? parseInt(page) : 1,
        limit: 10,
        filter: {
            status: (tab && ['LEAVING_SOON', 'CHURNED', 'BANNED'].includes(tab)) ? tab as CommunityMemberStatus : undefined
        }
    });

    if (membersError || !members) return null;

    const { data: counts, error: countsError } = await getCommunityMembersCounts(community.id);

    // Fetch invited_by user info for members that have it
    const invitedByUserPromises = members.members
        .filter(member => member.invited_by)
        .map(async (member) => {
            const { data } = await getInvitedByUser(member.invited_by!);
            return { memberId: member.id, user: data };
        });

    const invitedByUsers = await Promise.all(invitedByUserPromises);
    const invitedByMap = new Map(
        invitedByUsers.map(item => [item.memberId, item.user])
    );

    return (
        <div className="space-y-6">
            <Filters counts={{
                all: counts?.all || 0,
                leavingSoon: counts?.leavingSoon || 0,
                churned: counts?.churned || 0,
                banned: counts?.banned || 0,
            }} />

            <div className="space-y-4">
                {members.members.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        community={{
                            pricing: community.pricing,
                            billing_cycle: community.billing_cycle,
                            amount_per_month: community.amount_per_month,
                            amount_per_year: community.amount_per_year,
                            amount_one_time: community.amount_one_time,
                        }}
                        invitedByUser={invitedByMap.get(member.id) || undefined}
                    />
                ))}
            </div>

            {
                members.totalCount > 10 && (
                    <PaginationControl currentPage={page ? parseInt(page) : 1} maxPages={Math.ceil(members.totalCount / 10)} />
                )
            }
        </div>
    )
}   