"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatFullName } from "@/lib/utils"
import ClockIcon from "@/components/icons/clock"
import { Tables } from "@/database.types"
import { formatDistanceToNow } from "date-fns"
import { acceptMember, rejectMember } from "@/action/members"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type MemberWithUser = Tables<"community_members"> & {
  users: {
    id: string
    bio: string | null
    email: string
    username: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

interface PendingMemberCardProps {
  member: MemberWithUser
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "just now"
  try {
    // Parse the UTC date string - Supabase returns timestamps in UTC
    // If the string doesn't have a timezone indicator, treat it as UTC
    let date: Date
    if (dateString.includes('Z') || dateString.includes('+') || dateString.match(/-\d{2}:\d{2}$/)) {
      // Already has timezone info
      date = new Date(dateString)
    } else {
      // No timezone indicator - assume UTC and append 'Z'
      date = new Date(dateString + 'Z')
    }
    
    // Verify the date is valid
    if (isNaN(date.getTime())) {
      return "just now"
    }
    
    // Use formatDistanceToNow from date-fns to get "X ago" format
    // The Date object represents the UTC time, but formatDistanceToNow compares
    // it with the current local time, giving us the correct relative time
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return "just now"
  }
}

export default function PendingMemberCard({ member }: PendingMemberCardProps) {
  const user = member.users
  const timeAgo = formatTimeAgo(member.created_at)

  const handleAcceptMember = async () => {
    const response = await acceptMember(member.id)
    if (response.error) {
      toast.error(response.message)
    } else {
      toast.success(response.message)
    }
  }

  const handleRejectMember = async () => {
    const response = await rejectMember(member.id)
    if (response.error) {
      toast.error(response.message)
    } else {
      toast.success(response.message)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-6 flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="w-12 h-12 rounded-[12px] shrink-0">
            <AvatarImage src={user.avatar_url || ""} />
            <AvatarFallback className="bg-grey-200 text-grey-900 text-sm font-semibold rounded-[12px]">
              {user.first_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-grey-900">
                {formatFullName(user.first_name, user.last_name)}
              </h3>
            </div>
            <p className="text-sm text-grey-600 mt-0.5">
              @{user.username}
            </p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {user.bio && (
        <p className="text-sm text-grey-700 leading-relaxed">
          {user.bio}
        </p>
      )}

      {/* Membership Details */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-grey-600">
        <div className="flex items-center gap-1.5">
          <ClockIcon />
          <span className="font-medium">Requested {timeAgo}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button className="rounded-[8px]" variant="secondary" onClick={handleAcceptMember}>Decline</Button>
        <Button className="rounded-[8px]" variant="default" onClick={handleRejectMember}>Approve</Button>
      </div>

    </div>
  )
}
