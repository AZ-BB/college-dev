"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatFullName } from "@/lib/utils"
import { format } from "date-fns"
import CalendarIcon from "@/components/icons/calendar"
import ClockIcon from "@/components/icons/clock"
import {  WatchIcon } from "lucide-react"
import Link from "next/link"
import TagIcon from "@/components/icons/tag"
import { Tables } from "@/database.types"
import { CommunityRole, UserAccess } from "@/enums/enums"
import UserAvatar from "@/components/user-avatart"
import AccessControl from "@/components/access-control"
import { useUserAccess } from "@/contexts/access-context"
import MemberSettingsModal from "./member-settings-modal"

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
  is_free: boolean
  billing_cycle: "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | "ONE_TIME" | null
  amount_per_month: number | null
  amount_per_year: number | null
  amount_one_time: number | null
}

type InvitedByUser = {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  username: string
} | null

interface MemberCardProps {
  member: MemberWithUser
  community: CommunityPricing
  invitedByUser?: InvitedByUser
  isCurrentUser?: boolean
  communitySlug: string
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
  if (community.is_free) {
    return "Free"
  }
  if (community.billing_cycle === "ONE_TIME") {
    return `₹${community.amount_one_time || 0}`
  }
  if (community.billing_cycle === "MONTHLY" || community.billing_cycle === "MONTHLY_YEARLY") {
    return `₹${community.amount_per_month || 0}/mo`
  }
  if (community.billing_cycle === "YEARLY") {
    return `₹${community.amount_per_year || 0}/yr`
  }
  return "Free"
}

function getAccessType(community: CommunityPricing): string {
  if (community.is_free || community.billing_cycle === "ONE_TIME") {
    return "Lifetime access"
  }
  if (community.billing_cycle === "MONTHLY") {
    return "Monthly access"
  }
  if (community.billing_cycle === "YEARLY") {
    return "Yearly access"
  }
  if (community.billing_cycle === "MONTHLY_YEARLY") {
    return "Monthly access"
  }
  return "Lifetime access"
}

function getRoleDisplayName(role: string): string {
  if (role === CommunityRole.OWNER) return "OWNER"
  if (role === CommunityRole.ADMIN) return "Admin"
  return ""
}

export default function MemberCard({ member, community, invitedByUser, isCurrentUser = false, communitySlug }: MemberCardProps) {
  const { userAccess } = useUserAccess()
  const [editModalOpen, setEditModalOpen] = useState(false)

  const user = member.users
  const roleDisplayName = getRoleDisplayName(member.role)
  const isAdminOrOwner = member.role === CommunityRole.ADMIN || member.role === CommunityRole.OWNER
  const daysAgo = calculateDaysAgo(member.updated_at)
  const membershipType = getMembershipType(community)
  const accessType = getAccessType(community)

  function renderEditMemberButton() {
    if (isCurrentUser) return null
    if (member.role === CommunityRole.OWNER) return null
    if (userAccess === UserAccess.ADMIN && member.role === CommunityRole.ADMIN) return null

    return (
      <Button
        variant="secondary"
        size="sm"
        className="w-full sm:w-auto shrink-0 py-6 rounded-xl px-4 text-base font-semibold"
        onClick={() => setEditModalOpen(true)}
      >
        Member Settings
      </Button>
    )
  }

    return (
        <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-4 sm:p-6 flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <UserAvatar user={user} className="w-12 h-12 rounded-[12px] shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-grey-900">
                {formatFullName(user.first_name, user.last_name)}
              </h3>
              {isAdminOrOwner && (
                <span className="text-sm font-semibold text-orange-500">
                  {roleDisplayName}
                </span>
              )}
            </div>
            <p className="text-sm text-grey-600 mt-0.5">
              @{user.username}
            </p>
          </div>
        </div>

        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
          <div className="w-full sm:w-auto shrink-0">{renderEditMemberButton()}</div>
        </AccessControl>
      </div>

      {/* Bio Section */}
      {user.bio && (
        <p className="text-sm text-grey-700 leading-relaxed">
          {user.bio}
        </p>
      )}

      {/* Membership Details */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-grey-600">
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
          <TagIcon className="size-5 stroke-grey-600" />
          <span className="font-medium">{membershipType}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <WatchIcon className="size-5 stroke-grey-600" />
          <span className="font-medium">{accessType}</span>
        </div>
      </div>

      {/* Invited By Section */}
      {member.invited_by && invitedByUser && (
        <Link href={`/profile/${invitedByUser.username}`} className="flex items-center gap-2 hover:underline">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-grey-100 rounded-full">
            <UserAvatar user={invitedByUser} className="w-5 h-5 rounded-full shrink-0" />
            <span className="text-sm text-grey-700 font-medium">
              Invited By {formatFullName(invitedByUser.first_name, invitedByUser.last_name)}
            </span>
          </div>
        </Link>
      )}

      <MemberSettingsModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        member={member}
        community={community}
        invitedByUser={invitedByUser}
        communitySlug={communitySlug}
      />
    </div>
  )
}
