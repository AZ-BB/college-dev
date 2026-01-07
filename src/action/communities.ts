"use server"

import { Tables, TablesInsert } from "@/database.types"
import { AudienceSize } from "@/enums/enums";
import { GeneralResponse } from "@/utils/general-response"
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { QueryFilters } from "@/utils/types";
import { redirect } from "next/navigation";


export type Community = Tables<"communities"> & {
  community_cta_links: Tables<"community_cta_links">[],
  created_by: Tables<"users">,
  community_gallery_media: Tables<"community_gallery_media">[],
  posts_count: { count: number }[],
};

// GET
export async function getCommunities({
  page = 1,
  limit = 10,
  search = "",
  filter,
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number,
  limit?: number,
  search?: string,
  filter?: {
    is_public?: boolean,
  },
  sortBy?: "created_at" | "updated_at" | "name" | "member_count" | "price",
  sortOrder?: "asc" | "desc",
}): Promise<GeneralResponse<{
  communities: Tables<"communities">[],
  totalCount: number
}>> {
  try {
    const supabase = await createSupabaseServerClient();

    const filters: QueryFilters<keyof Tables<"communities">>[] = [
      {
        column: "is_deleted",
        operator: "eq",
        value: false
      }
    ];

    const query = supabase.from("communities")
      .select("*")

    if (filter?.is_public) {
      filters.push({
        column: "is_public",
        operator: "eq",
        value: filter.is_public
      });
    }

    if (search) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${search.trim()}%`
      });
      filters.push({
        column: "description",
        operator: "ilike",
        value: `%${search.trim()}%`
      });
    }

    filters.forEach(filter => {
      query.filter(filter.column, filter.operator, filter.value);
    });

    query.order(sortBy, { ascending: sortOrder === "asc" });
    query.range((page - 1) * limit, page * limit - 1);

    // Fetch communities
    const { data: communities, error: communitiesError } = await query;

    // Total count of communities
    const totalQuery = supabase.from("communities").select("count", { head: true });

    filters.forEach(filter => {
      totalQuery.filter(filter.column, filter.operator, filter.value);
    });

    const { count: totalCount, error: countError } = await totalQuery;

    if (communitiesError || countError) {
      console.error("Error fetching communities:", communitiesError || countError)
      return {
        error: "Error fetching communities",
        message: "Error fetching communities",
        statusCode: 500
      }
    }

    return {
      data: {
        communities,
        totalCount: totalCount || 0
      },
      error: undefined,
      message: "Communities fetched successfully",
      statusCode: 200
    }
  }

  catch (error) {
    console.error("Error fetching communities:", error)
    return {
      error: "Error fetching communities",
      message: "Error fetching communities",
      statusCode: 500
    }
  }
}

export async function getCommunityBySlug(slug: string): Promise<GeneralResponse<Community>> {
  const supabase = await createSupabaseServerClient();

  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select(`*, 
      community_cta_links(*), 
      created_by(*),
      community_gallery_media(*),
      posts_count: posts(count)
      `)
    .eq("slug", slug).single();

  if (communityError) {
    console.error("Error fetching community by slug:", communityError)
    return {
      error: "Error fetching community by slug",
      message: "Error fetching community by slug",
      statusCode: 500
    }
  }

  if (!community) {
    return {
      error: "Community not found",
      message: "Community not found",
      statusCode: 404
    }
  }

  return {
    data: community,
    error: undefined,
    message: "Community fetched successfully",
    statusCode: 200
  }
}

export async function getCommunityById(id: number): Promise<GeneralResponse<Tables<"communities">>> {
  const supabase = await createSupabaseServerClient();
  const { data: community, error: communityError } = await supabase.from("communities").select("*").eq("id", id).single();

  if (communityError) {
    console.error("Error fetching community by id:", communityError)
    return {
      error: "Error fetching community by id",
      message: "Error fetching community by id",
      statusCode: 500
    }
  }

  if (!community) {
    return {
      error: "Community not found",
      message: "Community not found",
      statusCode: 404
    }
  }

  return {
    data: community,
    error: undefined,
    message: "Community fetched successfully",
    statusCode: 200
  }
}

// CREATE
export async function createCommunity({
  name,
  audience_size,
}: {
  name: string;
  audience_size?: AudienceSize;
}): Promise<GeneralResponse<number>> {
  const supabase = await createSupabaseServerClient();

  const user = await getUserData();
  if (!user) {
    return {
      error: "User not authenticated",
      message: "User not authenticated",
      statusCode: 401
    }
  }

  let generatedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  for (let i = 1; i < 10; i++) {
    const { data: slugExists } = await supabase.from("communities").select("id").eq("slug", generatedSlug).single();
    if (!slugExists) {
      break;
    }
    generatedSlug = generatedSlug + "-" + i.toString();
  }

  const { data: community, error: communityError } = await supabase.from("communities").insert({
    name,
    audience_size,
    created_by: user.id,
    description: "",
    slug: generatedSlug,
    is_active: false
  }).select().single();

  if (communityError) {
    console.error("Error creating community:", communityError)
    return {
      error: "Error creating community",
      message: "Error creating community",
      statusCode: 500
    }
  }

  redirect(`/communities/${community.slug}`);
}

export async function addCtaLink(communityId: number, {
  url,
  text,
}: {
  url: string,
  text: string,
}): Promise<GeneralResponse<Tables<"community_cta_links">>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: ctaLink, error: ctaLinkError } = await supabase.from("community_cta_links").insert({
      community_id: communityId,
      url,
      text,
    }).select().single();

    if (ctaLinkError) {
      console.error("Error adding CTA link:", ctaLinkError)
      return {
        error: "Error adding CTA link",
        message: "Error adding CTA link",
        statusCode: 500
      }
    }

    return {
      data: ctaLink,
      error: undefined,
      message: "CTA link added successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error adding CTA link:", error)
    return {
      error: "Error adding CTA link",
      message: "Error adding CTA link",
      statusCode: 500
    }
  }
}

export async function addGalleryMedia(communityId: number, {
  media_url,
  media_type,
}: {
  media_url: string,
  media_type: string,
}): Promise<GeneralResponse<Tables<"community_gallery_media">>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: galleryMedia, error: galleryMediaError } = await supabase.from("community_gallery_media").insert({
      community_id: communityId,
      type: media_type,
      url: media_url,
    }).select().single();

    if (galleryMediaError) {
      console.error("Error adding gallery media:", galleryMediaError)
      return {
        error: "Error adding gallery media",
        message: "Error adding gallery media",
        statusCode: 500
      }
    }

    return {
      data: galleryMedia,
      error: undefined,
      message: "Gallery media added successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error adding gallery media:", error)
    return {
      error: "Error adding gallery media",
      message: "Error adding gallery media",
      statusCode: 500
    }
  }
}

// UPDATE
export async function updateCommunity({
  id,
  name,
  description,
  about,
  avatar,
  cover_image,
  is_public,
  support_email,
}: {
  id: number,
  name: string,
  description: string,
  about?: string,
  avatar?: string,
  cover_image?: string,
  is_public?: boolean,
  support_email?: string,
}): Promise<GeneralResponse<Tables<"communities">>> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!id) {
      return {
        error: "Community ID is required",
        message: "Community ID is required",
        statusCode: 400
      }
    }

    const { data: community, error: communityError } = await supabase.from("communities").update({
      name,
      description,
      about: about,
      avatar: avatar,
      cover_image: cover_image,
      is_public: is_public,
      support_email: support_email,
    }).eq("id", id).select().single();

    if (communityError) {
      console.error("Error updating community:", communityError)
    }

    return {
      data: community || undefined,
      error: undefined,
      message: "Community updated successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error updating community:", error)
    return {
      error: "Error updating community",
      message: "Error updating community",
      statusCode: 500
    }
  }
}

export async function updateCtaLink(ctaLinkId: number, {
  url,
  text,
}: {
  url: string,
  text: string,
}): Promise<GeneralResponse<Tables<"community_cta_links">>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: ctaLink, error: ctaLinkError } = await supabase.from("community_cta_links").update({
      url,
      text,
    }).eq("id", ctaLinkId).select().single();
    if (ctaLinkError) {
      console.error("Error updating CTA link:", ctaLinkError)
      return {
        error: "Error updating CTA link",
        message: "Error updating CTA link",
        statusCode: 500
      }
    }
    return {
      data: ctaLink,
      error: undefined,
      message: "CTA link updated successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error updating CTA link:", error)
    return {
      error: "Error updating CTA link",
      message: "Error updating CTA link",
      statusCode: 500
    }
  }
}

export async function updateGalleryMedia(galleryMediaId: number, {
  media_url,
  media_type,
}: {
  media_url: string,
  media_type: string,
}): Promise<GeneralResponse<Tables<"community_gallery_media">>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: galleryMedia, error: galleryMediaError } = await supabase.from("community_gallery_media").update({
      url: media_url,
      type: media_type,
    }).eq("id", galleryMediaId).select().single();

    if (galleryMediaError) {
      console.error("Error updating gallery media:", galleryMediaError)
      return {
        error: "Error updating gallery media",
        message: "Error updating gallery media",
        statusCode: 500
      }
    }

    return {
      data: galleryMedia,
      error: undefined,
      message: "Gallery media updated successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error updating gallery media:", error)
    return {
      error: "Error updating gallery media",
      message: "Error updating gallery media",
      statusCode: 500
    }
  }
}

// DELETE
export async function deleteCommunity({
  id,
}: {
  id: number,
}): Promise<GeneralResponse<boolean>> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!id) {
      return {
        error: "Community ID is required",
        message: "Community ID is required",
        statusCode: 400
      }
    }

    const { error: communityError } = await supabase.from("communities").update({
      is_deleted: true
    }).eq("id", id);

    if (communityError) {
      console.error("Error deleting community:", communityError)
    }

    return {
      data: true,
      error: undefined,
      message: "Community deleted successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error deleting community:", error)
    return {
      error: "Error deleting community",
      message: "Error deleting community",
      statusCode: 500
    }
  }
}

export async function deleteCtaLink(ctaLinkId: number): Promise<GeneralResponse<boolean>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error: ctaLinkError } = await supabase.from("community_cta_links").delete().eq("id", ctaLinkId);

    if (ctaLinkError) {
      console.error("Error deleting CTA link:", ctaLinkError)
      return {
        error: "Error deleting CTA link",
        message: "Error deleting CTA link",
        statusCode: 500
      }
    }

    return {
      data: true,
      error: undefined,
      message: "CTA link deleted successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error deleting CTA link:", error)
    return {
      error: "Error deleting CTA link",
      message: "Error deleting CTA link",
      statusCode: 500
    }
  }
}

export async function deleteGalleryMedia(galleryMediaId: number): Promise<GeneralResponse<boolean>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error: galleryMediaError } = await supabase.from("community_gallery_media").delete().eq("id", galleryMediaId);

    if (galleryMediaError) {
      console.error("Error deleting gallery media:", galleryMediaError)
      return {
        error: "Error deleting gallery media",
        message: "Error deleting gallery media",
        statusCode: 500
      }
    }
    return {
      data: true,
      error: undefined,
      message: "Gallery media deleted successfully",
      statusCode: 200
    }
  }
  catch (error) {
    console.error("Error deleting gallery media:", error)
    return {
      error: "Error deleting gallery media",
      message: "Error deleting gallery media",
      statusCode: 500
    }
  }
} 