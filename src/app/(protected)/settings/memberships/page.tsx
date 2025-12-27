import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function SettingsMembershipsPage() {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    const supabase = await createSupabaseServerClient();
    const userId = result.data.id;

    const { data: memberships, error } = await supabase
        .from("community_members")
        .select(`
            *,
            communities (*)
        `)
        .eq("user_id", userId)
        .neq("role", "OWNER")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching memberships:", error);
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold text-gray-900 font-generalSans mb-6">
                Memberships
            </h1>
            <div className="space-y-4">
                {memberships && memberships.length > 0 ? (
                    memberships.map((membership: any) => (
                        <div
                            key={membership.id}
                            className="p-4 border border-gray-200 rounded-lg"
                        >
                            {membership.communities && (
                                <>
                                    <h2 className="text-lg font-semibold">
                                        {membership.communities.name}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {membership.communities.description}
                                    </p>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">You're not a member of any communities yet.</p>
                )}
            </div>
        </div>
    );
}

