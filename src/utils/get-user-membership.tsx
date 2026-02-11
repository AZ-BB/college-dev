import { createSupabaseServerClient } from "./supabase-server";

export async function getUserMembership(community: number | string) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }

    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

    if (userError || !userData) {
        return null;
    }

    const userId = userData.id;
    const communityId = typeof community === "number" ? community : (await supabase.from("communities").select("id").eq("slug", community).single()).data?.id;

    const { data: membership, error: membershipError } = await supabase
        .from("community_members")
        .select("role, member_status, joined_at")
        .eq("user_id", userId)
        // @ts-ignore
        .eq("community_id", communityId)
        .single();

    if (membershipError || !membership) {
        return null;
    }

    return membership;
}