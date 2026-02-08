"use server"

import { Tables } from "@/database.types";
import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { revalidatePath } from "next/cache";

export async function addVideoMedia(
  commSlug: string,
  videoType: "youtube" | "loom" | "vimeo",
  videoUrl: string
): Promise<GeneralResponse<Tables<"community_gallery_media">>> {
  try {
    if (!commSlug) {
      return {
        error: "Community slug is required",
        message: "Community slug is required",
        statusCode: 400,
      };
    }

    if (!videoType || (videoType !== "youtube" && videoType !== "loom" && videoType !== "vimeo")) {
      return {
        error: "Invalid video type. Must be 'youtube', 'loom', or 'vimeo'",
        message: "Invalid video type",
        statusCode: 400,
      };
    }

    if (!videoUrl || !videoUrl.trim()) {
      return {
        error: "Video URL is required",
        message: "Video URL is required",
        statusCode: 400,
      };
    }

    const supabase = await createSupabaseServerClient();

    // Get the community to get the community_id
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id")
      .eq("slug", commSlug)
      .single();

    if (communityError || !community) {
      return {
        error: "Community not found",
        message: "Community not found",
        statusCode: 404,
      };
    }

    // Insert video media record
    const { data: galleryMedia, error: galleryMediaError } = await supabase
      .from("community_gallery_media")
      .insert({
        community_id: community.id,
        type: videoType,
        url: videoUrl.trim(),
      })
      .select()
      .single();

    if (galleryMediaError) {
      console.error("Error adding video media:", galleryMediaError);
      return {
        error: "Failed to add video media",
        message: "Failed to add video media",
        statusCode: 500,
      };
    }

    // Revalidate the community page
    revalidatePath(`/communities/${commSlug}`);
    revalidatePath(`/communities/${commSlug}`, "layout");

    return {
      data: galleryMedia,
      error: undefined,
      message: "Video media added successfully",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error adding video media:", error);
    return {
      error: "Failed to add video media",
      message: "Failed to add video media",
      statusCode: 500,
    };
  }
}
