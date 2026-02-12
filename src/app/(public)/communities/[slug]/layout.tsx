import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { notFound } from "next/navigation";
import { UserAccessProvider } from "../../../../contexts/access-context";
import { headers } from "next/headers";

export default async function CommunityLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: community, error: communityError } = await supabase.from("communities").select("is_public").eq("slug", slug).single();
    if (communityError || !community) {
        return notFound();
    }

    let userAccess: UserAccess
    let userStatus: CommunityMemberStatus | null = null;
    let isBanned = false;

    if (user) {
        const { data: communityWithId, error: communityError } = await supabase.from("communities").select("id").eq("slug", slug).single();

        if (communityError || !communityWithId) {
            return notFound();
        }

        const { data: membership, error: membershipError } = await supabase
            .from("community_members")
            .select("role, member_status")
            .eq("user_id", user?.id).eq("community_id", communityWithId?.id).single();

        if (membershipError || !membership) {
            userAccess = UserAccess.NOT_MEMBER;
            userStatus = null;
            const { data: bannedEntry } = await supabase
                .from("banned_list")
                .select("id")
                .eq("community_id", communityWithId.id)
                .eq("user_id", user.id)
                .maybeSingle();
            isBanned = !!bannedEntry;
        }
        else {
            userAccess = membership.role as UserAccess;
            userStatus = membership.member_status as CommunityMemberStatus;
        }
    }
    else {
        userAccess = UserAccess.ANONYMOUS;
        userStatus = null;
    }

    // Path the user is on (set by middleware via x-pathname header)
    const pathname = (await headers()).get("x-pathname") ?? "";

    if (!community.is_public && (userAccess === UserAccess.ANONYMOUS || userAccess === UserAccess.NOT_MEMBER || userStatus === CommunityMemberStatus.PENDING)) {
        if (pathname.includes(`/communities/${slug}/posts`)
            || pathname.includes(`/communities/${slug}/members`)
            || pathname.includes(`/communities/${slug}/members/pending`)
            || pathname.includes(`/communities/${slug}/settings`)
            || pathname.includes(`/communities/${slug}/classrooms`)
        ) {
            return notFound();
        }
    }

    return (
        <UserAccessProvider
            initialUserAccess={userAccess}
            initialUserStatus={userStatus}
            initialUserId={user?.id ?? null}
            initialIsCommunityPrivate={!community.is_public}
            initialIsBanned={isBanned}
        >
            {children}
        </UserAccessProvider>
    );
}