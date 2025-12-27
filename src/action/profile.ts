"use server"
import { GeneralResponse } from "@/utils/general-response"
import { createSupabaseServerClient } from "@/utils/supabase-server"
import { Tables } from "@/database.types"
export interface UserProfile extends Tables<"users"> {
  owned_communities_count: number
  joined_communities_count: number
}

export default async function getUserProfileByUsername(
  username: string
): Promise<GeneralResponse<UserProfile>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()

    if (userError) {
      console.error("Error fetching user profile:", userError)
      return {
        error: "Failed to get user profile",
        statusCode: 404,
      }
    }

    if (!user) {
      console.error("User not found")
      return { error: "User not found", statusCode: 404 }
    }
    let ownedCount = 0
    let joinedCount = 0
    try {
      const { count: ownedCountValue, error: ownedError } = await supabase
        .from("communities")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id)

      ownedCount = ownedCountValue || 0
    } catch (error) {
      console.error("Error fetching owned communities count:", error)
      return {
        error: "Failed to get user profile",
        statusCode: 404,
      }
    }

    // Fetch count of joined communities
    try {
      const { count: joinedCountValue, error: joinedError } = await supabase
        .from("community_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("role", "OWNER") // exclude owner from joined communities
      joinedCount = joinedCountValue || 0
    } catch (error) {
      console.error("Error fetching joined communities count:", error)
      return {
        error: "Failed to get user profile",
        statusCode: 404,
      }
    }

    return {
      data: {
        ...user,
        owned_communities_count: ownedCount || 0,
        joined_communities_count: joinedCount || 0,
      },
      statusCode: 200,
      error: undefined,
    }
  } catch (error) {
    console.error(error)
    return { error: "Failed to get user profile", statusCode: 404 }
  }
}

export async function getUserOwnedCommunitiesByUsername(
  username: string
): Promise<GeneralResponse<Tables<"communities">[]>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()
    if (userError) {
      console.error("Error fetching user:", userError)
      return { error: "User not found", statusCode: 404 }
    }
    if (!user) {
      console.error("User not found")
      return { error: "User not found", statusCode: 404 }
    }
    const { data: communities, error: communitiesError } = await supabase
      .from("communities")
      .select("*")
      .eq("created_by", user.id)
    return {
      data: communities || [],
      statusCode: 200,
      error: undefined,
    }
  } catch (error) {
    console.error("Error fetching owned communities:", error)
    return {
      error: "Failed to get user owned communities",
      statusCode: 404,
      
    }
  }
}
export interface UserJoinedCommunity {
  id: number
  community_id: number
  joined_at: string
  role: "OWNER" | "MEMBER" | "ADMIN"
  updated_at: string
  community: Tables<"communities">
  user_id: string
}
export async function getUserJoinedCommunitiesByUsername(
  username: string
): Promise<GeneralResponse<UserJoinedCommunity[]>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()
    if (userError) {
      console.error("Error fetching user:", userError)
      return { error: "User not found", statusCode: 404 }
    }
    if (!user) {
      console.error("User not found")
      return { error: "User not found", statusCode: 404 }
    }
    const { data: memberships, error: membershipsError } = await supabase
      .from("community_members")
      .select(
        `
            id,
            community_id,
            user_id,
            joined_at,
            role,
            updated_at,
            communities!community_members_community_id_fkey(id, name, avatar, slug, member_count, is_public)
            `
      )
      .eq("user_id", user.id)
      .neq("role", "OWNER") // exclude owner from joined communities
      .order("joined_at", { ascending: true })
    if (membershipsError) {
      console.error("Error fetching joined communities:", membershipsError)
      return {
        error: "Failed to get user joined communities",
        statusCode: 404,
        
      }
    }
    return {
      data: memberships?.map((membership) => ({
        id: Number(membership.id),
        community_id: Number(membership.communities.id),
        joined_at: membership.joined_at || "",
        role: membership.role as "OWNER" | "MEMBER" | "ADMIN",
        updated_at: membership.updated_at || "",
        user_id: membership.user_id,
        community: membership.communities as Tables<"communities">,
      })) || [] as UserJoinedCommunity[],
      statusCode: 200,
      error: undefined,
    }
  } catch (error) {
    console.error("Error fetching joined communities:", error)
    return {
      error: "Failed to get user joined communities",
      statusCode: 404,
      
    }
  }
}

export interface UpdateUserProfileData {
  first_name?: string
  last_name?: string
  username?: string
  bio?: string | null
  location?: string | null
  avatar_url?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  x_url?: string | null
  linkedin_url?: string | null
  youtube_url?: string | null
  website_url?: string | null
}

export async function updateUserProfile(
  data: UpdateUserProfileData
): Promise<GeneralResponse<boolean>> {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Not authenticated", statusCode: 401, data: false }
    }

    // Check if username is being updated and if it's already taken
    if (data.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", data.username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return { error: "Username is already taken", statusCode: 400, data: false }
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<UpdateUserProfileData> = {}

    if (data.first_name !== undefined) updateData.first_name = data.first_name
    if (data.last_name !== undefined) updateData.last_name = data.last_name
    if (data.username !== undefined) updateData.username = data.username
    if (data.bio !== undefined) updateData.bio = data.bio || null
    if (data.location !== undefined) updateData.location = data.location || null
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url || null
    if (data.facebook_url !== undefined) updateData.facebook_url = data.facebook_url || null
    if (data.instagram_url !== undefined) updateData.instagram_url = data.instagram_url || null
    if (data.x_url !== undefined) updateData.x_url = data.x_url || null
    if (data.linkedin_url !== undefined) updateData.linkedin_url = data.linkedin_url || null
    if (data.youtube_url !== undefined) updateData.youtube_url = data.youtube_url || null
    if (data.website_url !== undefined) updateData.website_url = data.website_url || null

    // Update user profile in database
    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating user profile:", updateError)

      // Check for unique constraint violation
      if (updateError.code === '23505' && updateError.message?.includes('username')) {
        return { error: "Username is already taken", statusCode: 400, data: false }
      }

      return { error: "Failed to update profile", statusCode: 500, data: false }
    }

    return {
      data: true,
      statusCode: 200,
      error: undefined,
      message: "Profile updated successfully"
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { error: "Failed to update profile", statusCode: 500, data: false }
  }
}

export async function getCurrentUserProfile(): Promise<GeneralResponse<Tables<"users"> | null>> {
  try {
    const supabase = await createSupabaseServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Not authenticated", statusCode: 401, data: null }
    }

    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError) {
      console.error("Error fetching user profile:", userError)
      return {
        error: "Failed to get user profile",
        statusCode: 404,
        
      }
    }

    if (!dbUser) {
      return { error: "User not found", statusCode: 404, data: null }
    }

    return {
      data: dbUser,
      statusCode: 200,
      error: undefined,
    }
  } catch (error) {
    console.error(error)
    return { error: "Failed to get user profile", statusCode: 500, data: null }
  }
}
