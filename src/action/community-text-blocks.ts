"use server"

import { Tables } from "@/database.types";
import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { revalidatePath } from "next/cache";

// CREATE
export async function createTextBlock(
  communityId: number,
  title: string,
  description: string,
  index: number
): Promise<GeneralResponse<Tables<"community_text_blocks">>> {
  try {
    if (!communityId) {
      return {
        error: "Community ID is required",
        message: "Community ID is required",
        statusCode: 400,
      };
    }

    if (!title || !title.trim()) {
      return {
        error: "Title is required",
        message: "Title is required",
        statusCode: 400,
      };
    }

    if (!description || !description.trim()) {
      return {
        error: "Description is required",
        message: "Description is required",
        statusCode: 400,
      };
    }

    if (index === undefined || index === null || index < 0) {
      return {
        error: "Index is required and must be a non-negative number",
        message: "Index is required",
        statusCode: 400,
      };
    }

    const supabase = await createSupabaseServerClient();

    // Verify community exists
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id")
      .eq("id", communityId)
      .single();

    if (communityError || !community) {
      return {
        error: "Community not found",
        message: "Community not found",
        statusCode: 404,
      };
    }

    // Insert text block
    const { data: textBlock, error: textBlockError } = await supabase
      .from("community_text_blocks")
      .insert({
        community_id: communityId,
        title: title.trim(),
        description: description.trim(),
        index,
      })
      .select()
      .single();

    if (textBlockError) {
      console.error("Error creating text block:", textBlockError);
      return {
        error: "Failed to create text block",
        message: "Failed to create text block",
        statusCode: 500,
      };
    }

    // Get community slug for revalidation
    const { data: comm } = await supabase
      .from("communities")
      .select("slug")
      .eq("id", communityId)
      .single();

    if (comm?.slug) {
      revalidatePath(`/communities/${comm.slug}`);
      revalidatePath(`/communities/${comm.slug}`, "layout");
    }

    return {
      data: textBlock,
      error: undefined,
      message: "Text block created successfully",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error creating text block:", error);
    return {
      error: "Failed to create text block",
      message: "Failed to create text block",
      statusCode: 500,
    };
  }
}

// READ - Get all text blocks for a community
export async function getTextBlocksByCommunity(
  communityId: number
): Promise<GeneralResponse<Tables<"community_text_blocks">[]>> {
  try {
    if (!communityId) {
      return {
        error: "Community ID is required",
        message: "Community ID is required",
        statusCode: 400,
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data: textBlocks, error: textBlocksError } = await supabase
      .from("community_text_blocks")
      .select("*")
      .eq("community_id", communityId)
      .order("index", { ascending: true });

    if (textBlocksError) {
      console.error("Error fetching text blocks:", textBlocksError);
      return {
        error: "Failed to fetch text blocks",
        message: "Failed to fetch text blocks",
        statusCode: 500,
      };
    }

    return {
      data: textBlocks || [],
      error: undefined,
      message: "Text blocks fetched successfully",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error fetching text blocks:", error);
    return {
      error: "Failed to fetch text blocks",
      message: "Failed to fetch text blocks",
      statusCode: 500,
    };
  }
}

// READ - Get a single text block by ID
export async function getTextBlockById(
  id: number
): Promise<GeneralResponse<Tables<"community_text_blocks">>> {
  try {
    if (!id) {
      return {
        error: "Text block ID is required",
        message: "Text block ID is required",
        statusCode: 400,
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data: textBlock, error: textBlockError } = await supabase
      .from("community_text_blocks")
      .select("*")
      .eq("id", id)
      .single();

    if (textBlockError || !textBlock) {
      return {
        error: "Text block not found",
        message: "Text block not found",
        statusCode: 404,
      };
    }

    return {
      data: textBlock,
      error: undefined,
      message: "Text block fetched successfully",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error fetching text block:", error);
    return {
      error: "Failed to fetch text block",
      message: "Failed to fetch text block",
      statusCode: 500,
    };
  }
}

// UPDATE
export async function updateTextBlock(
  id: number,
  {
    title,
    description,
    index,
  }: {
    title?: string;
    description?: string;
    index?: number;
  }
): Promise<GeneralResponse<Tables<"community_text_blocks">>> {
  try {
    if (!id) {
      return {
        error: "Text block ID is required",
        message: "Text block ID is required",
        statusCode: 400,
      };
    }

    const supabase = await createSupabaseServerClient();

    // Build update object
    const updateData: {
      title?: string;
      description?: string;
      index?: number;
      updated_at?: string;
    } = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return {
          error: "Title cannot be empty",
          message: "Title cannot be empty",
          statusCode: 400,
        };
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return {
          error: "Description cannot be empty",
          message: "Description cannot be empty",
          statusCode: 400,
        };
      }
      updateData.description = description.trim();
    }

    if (index !== undefined) {
      if (index < 0) {
        return {
          error: "Index must be a non-negative number",
          message: "Invalid index",
          statusCode: 400,
        };
      }
      updateData.index = index;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: textBlock, error: textBlockError } = await supabase
      .from("community_text_blocks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (textBlockError) {
      console.error("Error updating text block:", textBlockError);
      return {
        error: "Failed to update text block",
        message: "Failed to update text block",
        statusCode: 500,
      };
    }

    if (!textBlock) {
      return {
        error: "Text block not found",
        message: "Text block not found",
        statusCode: 404,
      };
    }

    // Get community slug for revalidation
    const { data: comm } = await supabase
      .from("communities")
      .select("slug")
      .eq("id", textBlock.community_id)
      .single();

    if (comm?.slug) {
      revalidatePath(`/communities/${comm.slug}`);
      revalidatePath(`/communities/${comm.slug}`, "layout");
    }

    return {
      data: textBlock,
      error: undefined,
      message: "Text block updated successfully",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error updating text block:", error);
    return {
      error: "Failed to update text block",
      message: "Failed to update text block",
      statusCode: 500,
    };
  }
}

// DELETE
export async function deleteTextBlock(
  id: number
): Promise<GeneralResponse<boolean>> {
  try {
    if (!id) {
      return {
        error: "Text block ID is required",
        message: "Text block ID is required",
        statusCode: 400,
      };
    }

    const supabase = await createSupabaseServerClient();

    // Get community_id before deleting for revalidation
    const { data: textBlock } = await supabase
      .from("community_text_blocks")
      .select("community_id")
      .eq("id", id)
      .single();

    const { error: deleteError } = await supabase
      .from("community_text_blocks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting text block:", deleteError);
      return {
        error: "Failed to delete text block",
        message: "Failed to delete text block",
        statusCode: 500,
      };
    }

    // Get community slug for revalidation
    if (textBlock?.community_id) {
      const { data: comm } = await supabase
        .from("communities")
        .select("slug")
        .eq("id", textBlock.community_id)
        .single();

      if (comm?.slug) {
        revalidatePath(`/communities/${comm.slug}`);
        revalidatePath(`/communities/${comm.slug}`, "layout");
      }
    }

    return {
      data: true,
      error: undefined,
      message: "Text block deleted successfully",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error deleting text block:", error);
    return {
      error: "Failed to delete text block",
      message: "Failed to delete text block",
      statusCode: 500,
    };
  }
}
