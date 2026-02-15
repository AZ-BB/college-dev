"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/utils/supabase-browser"

/**
 * Debug component to test Supabase Realtime connection
 * Add this to any page temporarily to test realtime
 */
export function RealtimeTest({ userId }: { userId: string }) {
  const [status, setStatus] = useState<string>("Not connected")
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    console.log("🧪 Testing realtime connection...")
    console.log("📍 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("👤 User ID:", userId)

    const channel = supabase
      .channel(`test-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🎉 Realtime event received:", payload)
          setEvents((prev) => [...prev, { time: new Date().toISOString(), payload }])
        }
      )
      .subscribe((status, err) => {
        console.log("📊 Status:", status, err ? `Error: ${err}` : "")
        setStatus(status)
      })

    return () => {
      console.log("🧹 Cleaning up test channel")
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-orange-500 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">🧪 Realtime Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong>{" "}
          <span
            className={
              status === "SUBSCRIBED"
                ? "text-green-600"
                : status === "CHANNEL_ERROR"
                ? "text-red-600"
                : "text-yellow-600"
            }
          >
            {status}
          </span>
        </div>
        <div>
          <strong>User ID:</strong> {userId}
        </div>
        <div>
          <strong>Events received:</strong> {events.length}
        </div>
        {events.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto">
            <strong>Recent events:</strong>
            {events.slice(-3).map((event, i) => (
              <div key={i} className="text-xs bg-gray-100 p-1 mt-1 rounded">
                {event.time}: {event.payload.eventType}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Check browser console for detailed logs
      </div>
    </div>
  )
}
