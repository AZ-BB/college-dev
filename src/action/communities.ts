"use server"

import { createSupabaseServerClient as createClient } from "@/utils/supabase-server"
import { Database } from "@/database.types"

export type Community = Database["public"]["Tables"]["communities"]["Row"] & {
  creator?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    avatar_url: string | null
  }
}

export type CommunityMember =
  Database["public"]["Tables"]["community_members"]["Row"]

/**
 * Fetch all public communities
 */
export async function getCommunities() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      *,
      creator:users(id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("is_active", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching communities:", error)
    return []
  }

  return data as Community[]
}

/**
 * Fetch a single community by slug
 */
export async function getCommunityBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      *,
      creator:users(id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("Error fetching community:", error)
    return null
  }

  return data as Community
}

/**
 * Fetch a single community by ID
 */
export async function getCommunityById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      *,
      creator:users(id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error("Error fetching community:", error)
    return null
  }

  return data as Community
}

/**
 * Search communities by name or description
 */
export async function searchCommunities(query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      *,
      creator:users(id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("is_active", true)
    .eq("is_public", true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("member_count", { ascending: false })

  if (error) {
    console.error("Error searching communities:", error)
    return []
  }

  return data as Community[]
}

/**
 * Check if user is a member of a community
 */
export async function isUserMember(
  userId: string,
  communityId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("community_members")
    .select("id")
    .eq("user_id", userId)
    .eq("community_id", communityId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

/**
 * Get user's communities
 */
export async function getUserCommunities(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("community_members")
    .select(
      `
      *,
      community:communities(
        *,
        creator:users(id, first_name, last_name, email, avatar_url)
      )
    `
    )
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching user communities:", error)
    return []
  }

  return data
}

/**
 * Join a community
 */
export async function joinCommunity(userId: string, communityId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("community_members")
    .insert({
      user_id: userId,
      community_id: communityId,
      role: "member",
    })
    .select()
    .single()

  if (error) {
    console.error("Error joining community:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Leave a community
 */
export async function leaveCommunity(userId: string, communityId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId)

  if (error) {
    console.error("Error leaving community:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Create a new community
 */
export async function createCommunity(
  userId: string,
  community: {
    name: string
    slug: string
    description?: string
    cover_image?: string
    avatar?: string
    price?: number
    currency?: string
    is_public?: boolean
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("communities")
    .insert({
      ...community,
      creator_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating community:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}




