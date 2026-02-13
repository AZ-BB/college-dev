"use client"

import { useEffect, useRef, useState } from "react"
import { getCurrentUserCommunities } from "@/action/profile"
import type { CommunityItem } from "@/action/profile"
import type { UserData } from "@/utils/get-user-data"

export function useUserCommunities(userData: UserData | null) {
  const [communities, setCommunities] = useState<CommunityItem[]>([])
  const [loading, setLoading] = useState(false)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!userData?.id) {
      userIdRef.current = null
      setCommunities([])
      return
    }

    if (userIdRef.current === userData.id) {
      return
    }
    userIdRef.current = userData.id

    setLoading(true)
    getCurrentUserCommunities()
      .then((res) => {
        if (res?.data) {
          setCommunities(res.data)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userData?.id])

  return { communities, loading }
}
