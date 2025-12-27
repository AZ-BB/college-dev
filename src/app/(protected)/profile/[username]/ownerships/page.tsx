import { getUserOwnedCommunitiesByUsername } from "@/action/profile";
import { AvatarImage } from "@/components/ui/avatar";
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default async function Ownershipts({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUserData();
    const isCurrentUser = user?.username === username;

    const { data: communities, error: communitiesError } = await getUserOwnedCommunitiesByUsername(username);

    if (communitiesError || !communities) {
        console.error("Error fetching communities:", communitiesError);
        return <div>Error fetching communities</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 space-y-4">
                {communities.map((community) => (
                    <Link href={`/communities/${community.slug}`} className="flex gap-4" key={community.id}>
                        <Avatar>
                            <AvatarImage className="w-[52px] h-[52px] rounded-lg" src={community.avatar || ""} />
                            <AvatarFallback>
                                <div className="w-[52px] h-[52px] flex items-center justify-center rounded-lg border border-[#DDDDDD] bg-[#0D121C] text-[#F8FAFC]">
                                    {community.name.charAt(0).toUpperCase()}
                                </div>
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                            <h2 className="text-sm font-bold">{community.name}</h2>
                            <p className="text-sm text-gray-primary font-medium flex items-center">
                                <span>
                                    {community.member_count} members
                                </span>
                                <div className="w-1 h-1 rounded-full bg-[#CBCFD4] mx-1" />
                                <span>
                                    {community.is_public ? "Free" : "Paid"}
                                </span>
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {(communities?.length === 0 && isCurrentUser) && (
                <div className="text-center text-sm text-[#65707A] font-medium w-full gap-8 flex flex-col items-center justify-center">
                    <Image
                        src="/placeholders/ownership.png"
                        alt="Empty state"
                        width={900}
                        height={900}
                        className="w-[300px] h-[300px] object-cover"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <span className="text-xl font-medium text-gray-900">Turn what you know into monthly income.</span>
                        <Button variant="default" className=" bg-orange-500 hover:bg-orange-600 text-white text-base">
                            Start a community
                        </Button>
                    </div>
                </div>
            )}

            {(communities?.length === 0 && !isCurrentUser) && (
                <div className="text-center w-full gap-8 flex flex-col items-center justify-center">
                    <span className="text-base font-medium text-gray-600">No Ownerships Found</span>
                </div>
            )}
        </div>
    )
}