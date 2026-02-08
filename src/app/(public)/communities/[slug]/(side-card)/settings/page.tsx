import { getUserData } from "@/utils/get-user-data";
import { CommunitySettingsModal } from "./_components/community-settings-modal"
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { CommunityRole } from "@/enums/enums";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const userData = await getUserData();
    const supabase = await createSupabaseServerClient();

    const { data: community, error } = await supabase.from('communities')
        .select('id')
        .eq('slug', slug)
        .single();

    if (error || !community) {
        return notFound();
    }

    const { data: membership, error: membershipError } = await supabase.from('community_members')
        .select('id, role')
        .eq('community_id', community.id)
        .eq('user_id', userData.id)
        .single();

    if (membership?.role !== CommunityRole.OWNER && membership?.role !== CommunityRole.ADMIN) {
        return redirect(`/communities/${slug}`);
    }

    return (
        <div>
            <CommunitySettingsModal
                slug={slug}
                asModal
            />
        </div>
    )
}
