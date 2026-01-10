"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatFullName } from "@/lib/utils"
import { format } from "date-fns"
import CalendarIcon from "@/components/icons/calendar"
import ClockIcon from "@/components/icons/clock"
import { Tag, Timer } from "lucide-react"
import { Tables } from "@/database.types"
import { CommunityRole } from "@/enums/enums"

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

type CommunityPricing = {
  pricing: "FREE" | "SUB" | "ONE_TIME"
  billing_cycle: "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | null
  amount_per_month: number | null
  amount_per_year: number | null
  amount_one_time: number | null
}

type InvitedByUser = {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
} | null

interface MemberCardProps {
  member: MemberWithUser
  community: CommunityPricing
  invitedByUser?: InvitedByUser
}

function calculateDaysAgo(dateString: string | null): string {
  if (!dateString) return "0d"
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays}d`
}

function getMembershipType(community: CommunityPricing): string {
  if (community.pricing === "FREE") {
    return "Free"
  }
  if (community.pricing === "ONE_TIME") {
    return `₹${community.amount_one_time || 0}`
  }
  if (community.pricing === "SUB") {
    if (community.billing_cycle === "MONTHLY" || community.billing_cycle === "MONTHLY_YEARLY") {
      return `₹${community.amount_per_month || 0}/mo`
    }
    if (community.billing_cycle === "YEARLY") {
      return `₹${community.amount_per_year || 0}/yr`
    }
  }
  return "Free"
}

function getAccessType(community: CommunityPricing): string {
  if (community.pricing === "FREE" || community.pricing === "ONE_TIME") {
    return "Lifetime access"
  }
  if (community.pricing === "SUB") {
    if (community.billing_cycle === "MONTHLY") {
      return "Monthly access"
    }
    if (community.billing_cycle === "YEARLY") {
      return "Yearly access"
    }
    return "Monthly access"
  }
  return "Lifetime access"
}

function getRoleDisplayName(role: string): string {
  if (role === CommunityRole.OWNER) return "Owner"
  if (role === CommunityRole.ADMIN) return "Admin"
  return "Member"
}

export default function MemberCard({ member, community, invitedByUser }: MemberCardProps) {
  const user = member.users
  const roleDisplayName = getRoleDisplayName(member.role)
  const isAdminOrOwner = member.role === CommunityRole.ADMIN || member.role === CommunityRole.OWNER
  const daysAgo = calculateDaysAgo(member.updated_at)
  const membershipType = getMembershipType(community)
  const accessType = getAccessType(community)

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
              {isAdminOrOwner && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 border-orange-500 text-orange-500 bg-transparent"
                >
                  {roleDisplayName}
                </Badge>
              )}
            </div>
            <p className="text-sm text-grey-600 mt-0.5">
              @{user.username}
            </p>
          </div>
        </div>

        <Button 
          variant="secondary" 
          size="sm"
          className="shrink-0"
        >
          Member Settings
        </Button>
      </div>

      {/* Bio Section */}
      {user.bio && (
        <p className="text-sm text-grey-700 leading-relaxed">
          {user.bio}
        </p>
      )}

      {/* Membership Details */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-grey-600">
        {member.joined_at && (
          <div className="flex items-center gap-1.5">
            <CalendarIcon />
            <span className="font-medium">Joined {format(new Date(member.joined_at), "MMM d, yyyy")}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5">
          <ClockIcon />
          <span className="font-medium">Active {daysAgo} ago</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Tag className="w-4 h-4" />
          <span className="font-medium">{membershipType}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Timer className="w-4 h-4" />
          <span className="font-medium">{accessType}</span>
        </div>
      </div>

      {/* Invited By Section */}
      {member.invited_by && invitedByUser && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-grey-100 rounded-full">
            <Avatar className="w-5 h-5 rounded-full">
              <AvatarImage src={invitedByUser.avatar_url || ""} />
              <AvatarFallback className="bg-grey-300 text-grey-700 text-xs">
                {invitedByUser.first_name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-grey-700 font-medium">
              Invited By {formatFullName(invitedByUser.first_name, invitedByUser.last_name)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
