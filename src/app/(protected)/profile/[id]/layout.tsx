import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserProfileCard from "./_components/UserProfileCard";
import ProfileTabs from "./_components/ProfileTabs";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { getUserData, UserData } from "@/utils/get-user-data";
import { formatFullName } from "@/lib/utils";
import getUserProfileByUsername from "@/action/profile";
import { notFound } from "next/navigation";
import NotFound from "./not-found";

export default async function ProfileLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {

    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: user, error: userError } = await getUserProfileByUsername(id);

    if (!user) {
        return <NotFound />;
    }


    return (
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-20 pt-6 sm:pt-14 pb-10 sm:pb-0">
            <div className="w-full sm:w-[calc(100%-420px)]">
                <h1 className="text-6xl font-bold font-generalSans mb-8 hidden sm:block">
                    {formatFullName(user?.first_name || "", user?.last_name || "")}
                </h1>

                <ProfileTabs
                    userId={id}
                    ownershipsCount={user?.owned_communities_count || 0}
                    membershipsCount={user?.joined_communities_count || 0}
                />
                {children}
            </div>

            <div className="w-full sm:w-[420px]">
                {user && (
                    <UserProfileCard
                        user={user}
                    />
                )}
            </div>
        </div>
    )
}