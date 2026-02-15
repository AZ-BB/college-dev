"use server"

import { createSupabaseServerClient } from "@/utils/supabase-server"
import { createSupabaseAdminServerClient } from "@/utils/supabase-server"
import { GeneralResponse } from "@/utils/general-response"
import type { Tables } from "@/database.types"

export type NotificationRow = Tables<"notifications">

export interface GetNotificationsResult {
  data: NotificationRow[]
  total: number
  page: number
  limit: number
}

export interface CreateNotificationItem {
  user_id: string
  type: string
  url?: string | null
  title: string
  description?: string | null
}

export async function getNotifications(
  page: number,
  limit: number
): Promise<GeneralResponse<GetNotificationsResult>> {
  try {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("getNotifications error:", error)
      return { error: error.message, statusCode: 500 }
    }

    return {
      data: {
        data: (data ?? []) as NotificationRow[],
        total: count ?? 0,
        page,
        limit,
      },
      statusCode: 200,
    }
  } catch (err) {
    console.error("getNotifications:", err)
    return { error: "Failed to get notifications", statusCode: 500 }
  }
}

export async function createNotification(
  items: CreateNotificationItem[]
): Promise<GeneralResponse<{ inserted: number }>> {
  if (!items?.length) {
    return { data: { inserted: 0 }, statusCode: 200 }
  }

  try {
    const supabase = await createSupabaseAdminServerClient()

    const rows = items.map((item) => ({
      user_id: item.user_id,
      type: item.type,
      url: item.url ?? null,
      title: item.title,
      message: item.description ?? null,
    }))

    const { data, error } = await supabase
      .from("notifications")
      .insert(rows)
      .select("id")

    if (error) {
      console.error("createNotification error:", error)
      return { error: error.message, statusCode: 500 }
    }

    return {
      data: { inserted: data?.length ?? 0 },
      statusCode: 200,
    }
  } catch (err) {
    console.error("createNotification:", err)
    return { error: "Failed to create notifications", statusCode: 500 }
  }
}

export async function resetNotificationCount(): Promise<GeneralResponse<void>> {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { error: "Unauthorized", statusCode: 401 }
    }

    // @ts-ignore - notifications_count table not in types yet (needs migration push)
    const { error } = await supabase
      .from("notifications_count")
      .update({ count: 0 })
      .eq("user_id", user.id)

    if (error) {
      console.error("resetNotificationCount error:", error)
      return { error: error.message, statusCode: 500 }
    }

    return { statusCode: 200 }
  } catch (err) {
    console.error("resetNotificationCount:", err)
    return { error: "Failed to reset count", statusCode: 500 }
  }
}
