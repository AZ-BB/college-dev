import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function SettingsOwnershipPage() {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    const supabase = await createSupabaseServerClient();
    const userId = result.data.id;

    const { data: communities, error } = await supabase
        .from("communities")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching owned communities:", error);
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold text-grey-900 font-generalSans mb-6">
                Ownership
            </h1>
            <div className="space-y-4">
                {communities && communities.length > 0 ? (
                    communities.map((community) => (
                        <div
                            key={community.id}
                            className="p-4 border border-grey-200 rounded-lg"
                        >
                            <h2 className="text-lg font-semibold">{community.name}</h2>
                            <p className="text-sm text-grey-600">{community.description}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-grey-500">You don't own any communities yet.</p>
                )}
            </div>
        </div>
    );
}

