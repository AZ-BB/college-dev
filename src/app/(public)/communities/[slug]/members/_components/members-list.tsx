import { getCommunityMembers, getInvitedByUser } from "@/action/members";
import { CommunityMemberStatus } from "@/enums/enums";
import MemberCard from "./member-card";
import { unstable_noStore as noStore } from "next/cache";
import { getUserData } from "@/utils/get-user-data";

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

    const currentUser = await getUserData();

    return (
        <div className="space-y-4">
            {members.members.map((member) => (
                <MemberCard
                    key={member.id}
                    member={member}
                    community={community}
                    invitedByUser={undefined}
                    isCurrentUser={currentUser?.id === member.user_id}
                />
            ))}
        </div>
    );
}
