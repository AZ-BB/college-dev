"use client"

import { useState } from "react"
import { createNotification } from "@/action/notifications"

/**
 * Test button to manually create a notification for the current user
 * Add this temporarily to test if notifications are working
 */
export function NotificationTestButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")

  const handleTest = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await createNotification([
        {
          user_id: userId,
          type: "test",
          title: "Test Notification",
          description: `Test notification created at ${new Date().toLocaleTimeString()}`,
          url: null,
        },
      ])

      if (response.error) {
        setResult(`❌ Error: ${response.error}`)
      } else {
        setResult(`✅ Success! Created ${response.data?.inserted} notification(s)`)
      }
    } catch (err) {
      setResult(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-500 text-white rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold mb-2">🧪 Notification Test</h3>
      <button
        onClick={handleTest}
        disabled={loading}
        className="bg-white text-blue-500 px-4 py-2 rounded font-semibold hover:bg-blue-50 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Test Notification"}
      </button>
      {result && (
        <div className="mt-2 text-sm">
          {result}
        </div>
      )}
      <div className="mt-2 text-xs opacity-75">
        This will create a notification for the current user
      </div>
    </div>
  )
}
