import { UserAccess } from "@/enums/enums";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { notFound } from "next/navigation";
import { UserAccessProvider } from "./_components/access-context";

export default async function CommunityLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userAccess: UserAccess

    if (user) {
        const { data: community, error: communityError } = await supabase.from("communities").select("id").eq("slug", slug).single();

        if (communityError || !community) {
            return notFound();
        }

        const { data: membership, error: membershipError } = await supabase
            .from("community_members")
            .select("*")
            .eq("user_id", user?.id).eq("community_id", community?.id).single();

        if (membershipError || !membership) {
            userAccess = UserAccess.NOT_MEMBER;
        }
        else {
            userAccess = membership.role as UserAccess;
        }
    }
    else {
        userAccess = UserAccess.ANONYMOUS;
    }

    return (
        <UserAccessProvider initialUserAccess={userAccess} initialUserId={user?.id ?? null}>
            <div>
                {children}
            </div>
        </UserAccessProvider>
    );
}