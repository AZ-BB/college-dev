import { getUserJoinedCommunitiesByUsername } from "@/action/profile";
import { AvatarImage } from "@/components/ui/avatar";
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";

export default async function Memberships({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const { data: memberships, error: membershipsError } = await getUserJoinedCommunitiesByUsername(username);

    if (membershipsError || !memberships) {
        console.error("Error fetching communities:", membershipsError);
        return <div className="text-center text-sm text-red-300 font-medium">Error fetching communities</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 space-y-4">
                {memberships?.map((membership) => (
                    <Link href={`/communities/${membership.community_id}`} className="flex gap-4" key={membership.community_id}>
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
                            <p className="text-sm text-gray-primaryfont-medium flex items-center">
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

                {memberships?.length === 0 && (
                    <div className="col-span-2 text-center text-sm text-[#65707A] font-medium">
                        No memberships found
                    </div>
                )}
            </div>
        </div>
    )
}