import { getCommunityBySlug } from "@/action/communities"
import { notFound } from "next/navigation"
import CommunityMedia from "../_components/community-media"
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/utils/supabase-server"
import { revalidatePath } from "next/cache"
import TextEditor from "../_components/text-editor"
import CommunityDetails from "../_components/community-details"
import AccessControl from "@/components/access-control"
import { UserAccess } from "@/enums/enums"
import { Input } from "@/components/ui/input"

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

  return (
    <div className="space-y-6">
      {/* Media Section */}
      <CommunityMedia
        media={community.community_gallery_media}
        deleteMedia={deleteMedia}
        slug={slug}
      />

      {/* Details Section */}
      <CommunityDetails community={community} />


      {/* Text Section */}
      <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
        <TextEditor communityId={community.id} slug={slug} />
      </AccessControl>

      <AccessControl allowedAccess={[UserAccess.NOT_MEMBER, UserAccess.ANONYMOUS, UserAccess.MEMBER]}>
        {
          community.community_text_blocks.map((block) => (
            <div
              key={block.id}
              className=""
            >
              <div className="mb-2 font-bold text-lg">
                {block.title}
              </div>

              <div className="mb-2 text-base font-medium ">
                {block.description}
              </div>
            </div>
          ))
        }
      </AccessControl>
    </div>
  )
}
