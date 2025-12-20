import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserProfileCard from "./_components/UserProfileCard";
import ProfileTabs from "./_components/ProfileTabs";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { getUserData } from "@/utils/get-user-data";
import { formatFullName } from "@/lib/utils";

export default async function ProfileLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

    // Fetch ownerships count
    const { count: ownershipsCount, error: ownershipsError } = await supabase
        .from("communities")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("creator_id", user?.id || "");

    // Fetch memberships count
    const { count: membershipsCount, error: membershipsError } = await supabase
        .from("community_members")
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("user_id", user?.id || "");

    if (ownershipsError || membershipsError) {
        console.error("Error fetching counts:", ownershipsError || membershipsError);
        return <div>Error fetching profile data</div>;
    }

    return (
        <div className="flex gap-20 pt-14">
            <div className="w-[calc(100%-420px)]">
                <h1 className="text-6xl font-bold font-generalSans mb-8">
                    {formatFullName(user?.first_name || "", user?.last_name || "")}
                </h1>

                <ProfileTabs
                    userId={id}
                    ownershipsCount={ownershipsCount || 0}
                    membershipsCount={membershipsCount || 0}
                />
                {children}
            </div>

            <div className="w-[420px]">
                {user && (
                    <UserProfileCard
                        user={user}
                    />
                )}
            </div>
        </div>
    )
}