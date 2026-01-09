import { getUserJoinedCommunitiesByUsername, UserJoinedCommunity } from "@/action/profile";
import { AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";
import Image from "next/image";

export default async function Memberships({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUserData();
    const isCurrentUser = user?.username === username;

    const { data: memberships, error: membershipsError } = await getUserJoinedCommunitiesByUsername(username);

    if (membershipsError || !memberships) {
        console.error("Error fetching communities:", membershipsError);
        return <div className="text-center text-sm text-red-300 font-medium">Error fetching communities</div>;
    }

    // TODO: Memberships request
    const membershipsRequest: UserJoinedCommunity[] = []

    return (
        <div className="space-y-8">
            {
                memberships?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10">
                        {memberships?.map((membership) => (
                            <Link href={`/communities/${membership.community_id}`} className="flex gap-4 hover:bg-grey-200 rounded-xl p-2.5 transition-colors duration-200" key={membership.community_id}>
                                <Avatar>
                                    <AvatarImage className="w-[52px] h-[52px] rounded-lg" src={membership.community.avatar || ""} />
                                    <AvatarFallback>
                                        <div className="w-[52px] h-[52px] flex items-center justify-center rounded-lg border border-[#DDDDDD] bg-[#0D121C] text-[#F8FAFC]">
                                            {membership.community.name.charAt(0).toUpperCase()}
                                        </div>
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-2">
                                    <h2 className="text-sm font-bold">{membership.community.name}</h2>
                                    <p className="text-sm text-grey-primaryfont-medium flex items-center">
                                        <span>
                                            {membership.community.member_count} members
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-[#CBCFD4] mx-1" />
                                        <span>
                                            {membership.community.is_public ? "Free" : "Paid"}
                                        </span>
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            }

            {
                isCurrentUser && (
                    <div>
                        <div className="text-xl font-bold">Pending Memberships Requests
                            <span className="ml-2 px-2 py-1 bg-grey-200 rounded-md text-sm text-grey-600 font-semibold">0</span>
                        </div>

                        <div className="text-sm text-grey-600 font-medium py-4">
                            No Pending Memberships Requests
                        </div>
                    </div>
                )
            }

            {(memberships?.length === 0 && membershipsRequest.length === 0 && isCurrentUser) && (
                <div className="text-center text-sm text-grey-600 font-medium w-full gap-8 flex flex-col items-center justify-center">
                    <Image
                        src="/placeholders/memberships.png"
                        alt="Empty state"
                        width={900}
                        height={900}
                        className="w-[300px] h-[300px] object-cover"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <span className="text-xl font-medium text-grey-900">Real progress doesn't happen alone.</span>
                        <Button variant="default" className=" bg-orange-500 hover:bg-orange-600 text-white text-base">
                            Join a community
                        </Button>
                    </div>
                </div>
            )}

            {(memberships?.length === 0 && membershipsRequest.length === 0 && !isCurrentUser) && (
                <div className="text-center w-full gap-8 flex flex-col items-center justify-center pt-4">
                    <span className="text-base font-medium text-grey-600">No Memberships Found</span>
                </div>
            )}
        </div>
    )
}