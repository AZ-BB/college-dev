import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase-server";

interface InvitePageProps {
    params: Promise<{ slug: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('Invite page loaded');

    if (user) {
        redirect(`/communities/${slug}`);
    }

    const redirectUrl = `/communities/${slug}`;
    redirect(`/signup?redirect=${encodeURIComponent(redirectUrl)}`);
}
