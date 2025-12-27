import { redirect } from "next/navigation";
import getUserProfileByUsername, { getCurrentUserProfile } from "@/action/profile";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import SettingsTabs from "./_components/SettingsTabs";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    // Get ownership count
    const { data: profile } = await getUserProfileByUsername(result.data.username);

    return (
        <div className="container mx-auto py-8 w-full ">
            <div className="flex flex-col sm:flex-row gap-8">
                <div className="w-full sm:w-64 shrink-0 sm:sticky sm:top-24 sm:self-start">
                    <SettingsTabs
                        ownershipsCount={profile?.owned_communities_count || 0}
                        membershipsCount={profile?.joined_communities_count || 0}
                    />
                </div>
                <div className="flex-1 sm:mt-16 mb-8 lg:mx-0 -mx-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

