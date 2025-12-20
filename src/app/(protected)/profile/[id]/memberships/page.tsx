import { AvatarImage } from "@/components/ui/avatar";
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";

export default async function Memberships({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: memberships, error } = await supabase
        .from("community_members")
        .select(`
            community_id,
            user_id,
            communities!community_members_community_id_fkey(id, name, avatar, slug, member_count, is_public)
            `)
        .eq("user_id", id)
        .order("joined_at", { ascending: true });

    if (error) {
        console.error("Error fetching communities:", error);
        return <div>Error fetching communities</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 pt-10 space-y-4">
                {memberships?.map((membership) => (
                    <Link href={`/communities/${membership.community_id}`} className="flex gap-4" key={membership.community_id}>
                        <Avatar>
                            <AvatarImage className="w-[52px] h-[52px] rounded-lg" src={membership.communities.avatar || ""} />
                            <AvatarFallback>
                                <div className="w-[52px] h-[52px] flex items-center justify-center rounded-lg border border-[#DDDDDD] bg-[#0D121C] text-[#F8FAFC]">
                                    {membership.communities.name.charAt(0).toUpperCase()}
                                </div>
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                            <h2 className="text-sm font-bold">{membership.communities.name}</h2>
                            <p className="text-sm text-[#485057] font-medium flex items-center">
                                <span>
                                    {membership.communities.member_count} members
                                </span>
                                <div className="w-1 h-1 rounded-full bg-[#CBCFD4] mx-1" />
                                <span>
                                    {membership.communities.is_public ? "Free" : "Paid"}
                                </span>
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}