import Image from "next/image"
import Link from "next/link"
import { Lock, ExternalLink, X, Plus, Globe, Users, Tag, UsersIcon, LockIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getCommunityBySlug } from "@/action/communities"
import { notFound } from "next/navigation"
import UploadIcon from "@/components/icons/upload"
import CommunityMedia from "./_components/community-media"
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/utils/supabase-server"
import { revalidatePath } from "next/cache"
import TextEditor from "./_components/text-editor"
import MoneyIcon from "@/components/icons/money"
import MemberIcon from "@/components/icons/member"
import { formatPrice } from "@/utils/communities"

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: community, error: communityError } = await getCommunityBySlug(slug);

  if (communityError || !community) {
    return notFound();
  }

  async function deleteMedia(mediaId: number, mediaUrl: string, type: 'image' | string) {
    'use server';
    const supabase = await createSupabaseAdminServerClient();
    await supabase.from("community_gallery_media").delete().eq("id", mediaId);
    if (type === 'image') {
      await supabase.storage.from("community_media").remove([mediaUrl.split("community_media/")[1]]);
    }
    revalidatePath(`/communities/${slug}`);
    revalidatePath(`/communities/${slug}`, 'layout');
  }

  console.log(community.community_gallery_media);

  return (
    <div className="space-y-6">
      <CommunityMedia
        media={community.community_gallery_media}
        deleteMedia={deleteMedia}
        slug={slug}
      />

      <div className="flex gap-12 font-semibold">
        {community.is_public ? (
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>Public</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <LockIcon className="w-5 h-5" />
            <span>Private</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 stroke-gray-900" />
          <span>
            {community.member_count >= 1000
              ? `${(community.member_count / 1000).toFixed(community.member_count >= 100000 ? 0 : 1)}K`
              : community.member_count}{" "}
            members
          </span>
        </div>

        {community.is_free ? (
          <div className="flex items-center gap-2">
            <MoneyIcon className="w-5 h-5 stroke-gray-900" />
            <span>Free</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MoneyIcon className="w-5 h-5 stroke-gray-900" />
            <span>{formatPrice(Number(community.price), "INR")}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Avatar
            className="w-6 h-6"
          >
            <AvatarImage src={community.created_by?.avatar_url || ""} />
            <AvatarFallback>
              <div className="w-6 h-6 flex items-center justify-center text-xs rounded-full bg-orange-500 text-[#f8fafc]">
                {community.created_by?.first_name?.charAt(0).toUpperCase() || "Unknown"}
              </div>
            </AvatarFallback>
          </Avatar>
          <span className="">
            By {community.created_by?.first_name || "Unknown"} {community.created_by?.last_name || ""}
          </span>
        </div>
      </div>

      <TextEditor communityId={community.id} slug={slug} />
    </div>
  )
}