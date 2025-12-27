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

export default async function ProfileLayout({ children, params }: { children: React.ReactNode, params: Promise<{ username: string }> }) {

    const { username } = await params;
    const userData = await getUserData();

    const { data: user, error: userError } = await getUserProfileByUsername(username);

    if (!user) {
        return notFound()
    }


    const tabs = username === userData?.username ? [
        { label: "Activity", value: "activity", href: `/profile/${username}` },
        { label: "Contribution", value: "contribution", href: `/profile/${username}/contribution` },
        { label: "Saved Posts", value: "saved-posts", href: `/profile/${username}/saved-posts`, count: 0 },
        { label: "Ownerships", value: "ownerships", href: `/profile/${username}/ownerships`, count: user?.owned_communities_count || 0 },
        { label: "Memberships", value: "memberships", href: `/profile/${username}/memberships`, count: user?.joined_communities_count || 0 },
    ] : [
        { label: "Activity", value: "activity", href: `/profile/${username}` },
        { label: "Contribution", value: "contribution", href: `/profile/${username}/contribution` },
        { label: "Ownerships", value: "ownerships", href: `/profile/${username}/ownerships`, count: user?.owned_communities_count || 0 },
        { label: "Memberships", value: "memberships", href: `/profile/${username}/memberships`, count: user?.joined_communities_count || 0 },
    ]

    return (
        <div className="max-w-7xl mx-auto flex flex-col-reverse sm:flex-row gap-2 sm:gap-20 pt-6 sm:pt-14 pb-10 sm:pb-0">
            <div className="w-full sm:w-[70%]">
                <h1 className="text-5xl font-bold font-generalSans mb-8 hidden sm:block">
                    {formatFullName(user?.first_name || "", user?.last_name || "")}
                </h1>

                <ProfileTabs
                    username={user?.username}
                    tabs={tabs}
                />
                {children}
            </div>

            <div className="w-full sm:w-[30%]">
                {user && (
                    <UserProfileCard
                        user={user}
                        isUserProfile={user.id === userData?.id}
                    />
                )}
            </div>
        </div>
    )
}