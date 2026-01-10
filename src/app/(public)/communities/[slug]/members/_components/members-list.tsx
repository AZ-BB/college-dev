import { getCommunityMembers, getInvitedByUser } from "@/action/members";
import { CommunityMemberStatus } from "@/enums/enums";
import MemberCard from "./member-card";
import { unstable_noStore as noStore } from "next/cache";

type MembersListProps = {
    communityId: number;
    page: number;
    tab?: CommunityMemberStatus;
    community: {
        pricing: "FREE" | "SUB" | "ONE_TIME";
        billing_cycle: "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | null;
        amount_per_month: number | null;
        amount_per_year: number | null;
        amount_one_time: number | null;
    };
};

export default async function MembersList({
    communityId,
    page,
    tab,
    community,
}: MembersListProps) {
    // Prevent caching to ensure Suspense works properly
    noStore();
    
    const { data: members, error: membersError } = await getCommunityMembers(communityId, {
        page,
        limit: 10,
        filter: {
            status: (tab && ['LEAVING_SOON', 'CHURNED', 'BANNED'].includes(tab)) ? tab as CommunityMemberStatus : CommunityMemberStatus.ACTIVE
        }
    });

    if (membersError || !members) {
        return <div>Error loading members</div>;
    }

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
        <div className="space-y-4">
            {members.members.map((member) => (
                <MemberCard
                    key={member.id}
                    member={member}
                    community={community}
                    invitedByUser={invitedByMap.get(member.id) || undefined}
                />
            ))}
        </div>
    );
}
