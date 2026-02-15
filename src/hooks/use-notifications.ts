"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"
import type { NotificationRow } from "@/action/notifications"
import { resetNotificationCount as resetNotificationCountAction } from "@/action/notifications"

interface UseNotificationsResult {
  notifications: NotificationRow[]
  unreadCount: number
  loading: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  resetCount: () => Promise<void>
}

export function useNotifications(userId: string | null | undefined): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const channelRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null)
  const LIMIT = 15

  // Reset count function
  const resetCount = useCallback(async () => {
    if (!userId) return

    // Optimistically update UI
    setUnreadCount(0)

    // Update database
    const result = await resetNotificationCountAction()
    if (result.error) {
      console.error("Failed to reset notification count:", result.error)
      // Could revert the optimistic update here if needed
    }
  }, [userId])

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!userId || loading || !hasMore) return

    setLoading(true)
    try {
      const { getNotifications } = await import("@/action/notifications")
      const result = await getNotifications(page + 1, LIMIT)

      if (result.data?.data) {
        setNotifications((prev) => [...prev, ...result.data!.data])
        setPage(page + 1)
        setHasMore(result.data!.data.length === LIMIT)
      }
    } catch (err) {
      console.error("Error loading more notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [userId, loading, hasMore, page, LIMIT])

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const supabase = createSupabaseBrowserClient()
    let mounted = true
    let retryTimeout: NodeJS.Timeout

    // Fetch initial count and recent notifications
    const fetchInitialData = async () => {
      setLoading(true)

      try {
        // Verify auth session first
        const { data: { session } } = await supabase.auth.getSession()
        console.log("🔐 Auth session exists:", !!session, "User ID matches:", session?.user?.id === userId)

        // Fetch initial unread count
        // @ts-ignore - notifications_count table not in types yet (needs migration push)
        const { data: countData, error: countError } = await supabase
          .from("notifications_count")
          .select("count")
          .eq("user_id", userId)
          .maybeSingle()

        if (countError && countError.code !== "PGRST116") {
          // PGRST116 is "not found" which is ok
          console.error("Error fetching notification count:", countError)
        } else {
          if (mounted) setUnreadCount(countData?.count ?? 0)
        }

        // Fetch recent notifications (first page)
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(LIMIT)

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError)
        } else {
          if (mounted) {
            setNotifications((notificationsData as NotificationRow[]) ?? [])
            setHasMore((notificationsData?.length ?? 0) === LIMIT)
          }
        }
      } catch (err) {
        console.error("Error in fetchInitialData:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const setupRealtimeSubscription = async () => {
      // Wait a bit to ensure auth is fully set up
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify we have a session before subscribing
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error("❌ No auth session found, cannot subscribe to realtime")
        return null
      }

      console.log("🚀 Setting up realtime subscription for user:", userId)
      console.log("📍 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...")
      
      const channel = supabase
        .channel(`notifications-${userId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: userId },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("🔔 New notification received:", payload)
            if (!mounted) return
            
            const newNotification = payload.new as NotificationRow

            // Add to notifications list (prepend to top)
            setNotifications((prev) => [newNotification, ...prev])

            // Increment unread count
            setUnreadCount((prev) => prev + 1)
          }
        )
        .subscribe((status, err) => {
          console.log("📡 Realtime subscription status:", status, err ? `Error: ${err}` : "")
          
          if (status === "SUBSCRIBED") {
            console.log("✅ Successfully subscribed to notifications channel for user:", userId)
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Error subscribing to notifications channel:", err)
            // Retry after 5 seconds
            if (mounted) {
              retryTimeout = setTimeout(() => {
                console.log("🔄 Retrying realtime subscription...")
                setupRealtimeSubscription()
              }, 5000)
            }
          } else if (status === "CLOSED") {
            console.warn("⚠️ Notifications channel closed")
          } else if (status === "TIMED_OUT") {
            console.error("⏱️ Notifications channel timed out")
          }
        })

      return channel
    }

    fetchInitialData()
    
    setupRealtimeSubscription().then(channel => {
      if (channel) {
        channelRef.current = channel
      }
    })

    // Cleanup on unmount
    return () => {
      mounted = false
      clearTimeout(retryTimeout)
      console.log("🧹 Cleaning up notifications subscription for user:", userId)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId])

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadMore,
    resetCount,
  }
}
