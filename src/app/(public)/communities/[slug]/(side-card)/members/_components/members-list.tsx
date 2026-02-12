import { getCommunityMembers, getBannedMembers } from "@/action/members";
import { CommunityMemberStatus, CommunityRole } from "@/enums/enums";
import MemberCard from "./member-card";
import BannedMemberCard from "./banned-member-card";
import { unstable_noStore as noStore } from "next/cache";
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";

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

    if (tab === 'BANNED') {
        const { data: bannedData, error: bannedError } = await getBannedMembers(communityId, { page, limit: 10 });

        if (bannedError || !bannedData) {
            return <div>Error loading banned members</div>;
        }

        if (bannedData.members.length === 0) {
            return <div className="text-center py-12 text-grey-600">No banned members</div>;
        }

        return (
            <div className="space-y-4">
                {bannedData.members.map((bannedMember) => (
                    <BannedMemberCard
                        key={bannedMember.id}
                        bannedMember={bannedMember}
                        communityId={communityId}
                        communitySlug={communitySlug}
                    />
                ))}
            </div>
        );
    }

    const { data: members, error: membersError } = await getCommunityMembers(communityId, {
        page,
        limit: 10,
        filter: {
            status: (tab && ['LEAVING_SOON', 'CHURNED'].includes(tab)) ? tab as CommunityMemberStatus : CommunityMemberStatus.ACTIVE,
            roles: tab === "admins" ? [CommunityRole.ADMIN, CommunityRole.OWNER] : undefined
        },
    });

    if (membersError || !members) {
        return <div>Error loading members</div>;
    }

    const currentUser = await getUserData();

    // Fetch invited-by users for members who were invited
    const invitedByIds = [...new Set(
        members.members
            .map((m) => m.invited_by)
            .filter((id): id is string => !!id)
    )];

    const invitedByUserMap: Record<string, { id: string; first_name: string; last_name: string; avatar_url: string | null; username: string }> = {};
    if (invitedByIds.length > 0) {
        const supabase = await createSupabaseServerClient();
        const { data: inviters } = await supabase
            .from("users")
            .select("id, first_name, last_name, avatar_url, username")
            .in("id", invitedByIds);
        for (const inviter of inviters ?? []) {
            invitedByUserMap[inviter.id] = inviter;
        }
    }

    return (
        <div className="space-y-4">
            {members.members.map((member) => (
                <MemberCard
                    key={member.id}
                    member={member}
                    community={community}
                    invitedByUser={member.invited_by ? invitedByUserMap[member.invited_by] ?? undefined : undefined}
                    isCurrentUser={currentUser?.id === member.user_id}
                    communitySlug={communitySlug}
                />
            ))}
        </div>
    );
}
