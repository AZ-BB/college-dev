import { getCommunityMembers } from "@/action/members";
import { CommunityMemberStatus, CommunityRole } from "@/enums/enums";
import MemberCard from "./member-card";
import { unstable_noStore as noStore } from "next/cache";
import { getUserData } from "@/utils/get-user-data";

type MembersListProps = {
    communityId: number;
    page: number;
    tab?: CommunityMemberStatus | "admins";
    community: {
        is_free: boolean;
        billing_cycle: "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | "ONE_TIME" | null;
        amount_per_month: number | null;
        amount_per_year: number | null;
        amount_one_time: number | null;
    };
    communitySlug: string;
};

export default async function MembersList({
    communityId,
    page,
    tab,
    community,
    communitySlug,
}: MembersListProps) {
    // Prevent caching to ensure Suspense works properly
    noStore();

    console.log('Tab:', tab);

    const { data: members, error: membersError } = await getCommunityMembers(communityId, {
        page,
        limit: 10,
        filter: {
            status: (tab && ['LEAVING_SOON', 'CHURNED', 'BANNED'].includes(tab)) ? tab as CommunityMemberStatus : CommunityMemberStatus.ACTIVE,
            roles: tab === "admins" ? [CommunityRole.ADMIN, CommunityRole.OWNER] : undefined
        },
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
                    communitySlug={communitySlug}
                />
            ))}
        </div>
    );
}
