"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatFullName } from "@/lib/utils"
import { format } from "date-fns"
import CalendarIcon from "@/components/icons/calendar"
import ClockIcon from "@/components/icons/clock"
import { WatchIcon } from "lucide-react"
import TagIcon from "@/components/icons/tag"
import { Tables } from "@/database.types"
import { CommunityRole, UserAccess } from "@/enums/enums"
import UserAvatar from "@/components/user-avatart"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUserAccess } from "@/contexts/access-context"
import { updateMemberRole, removeMember, getMemberAnswers } from "@/action/members"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type TabId = "membership" | "courses" | "payments" | "questions"

const TABS: { id: TabId; label: string }[] = [
  { id: "membership", label: "Membership" },
  { id: "courses", label: "Courses" },
  { id: "payments", label: "Payments" },
  { id: "questions", label: "Questions" },
]

export type MemberWithUser = Tables<"community_members"> & {
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

interface MemberSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  if (community.pricing === "FREE") return "Free"
  if (community.pricing === "ONE_TIME") return `₹${community.amount_one_time || 0}`
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
  if (community.pricing === "FREE" || community.pricing === "ONE_TIME") return "Lifetime access"
  if (community.pricing === "SUB") {
    if (community.billing_cycle === "MONTHLY") return "Monthly access"
    if (community.billing_cycle === "YEARLY") return "Yearly access"
    return "Monthly access"
  }
  return "Lifetime access"
}

export default function MemberSettingsModal({
  open,
  onOpenChange,
  member,
  community,
  invitedByUser,
}: MemberSettingsModalProps) {
  const router = useRouter()
  const { userAccess } = useUserAccess()
  const [loadedMember, setLoadedMember] = useState<MemberWithUser | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("membership")
  const [roleUpdating, setRoleUpdating] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Array<{ id: number; question: string; answer: string; questionType: string }>>([])
  const [loadingAnswers, setLoadingAnswers] = useState(false)
  const [answersError, setAnswersError] = useState<string | null>(null)

  const canChangeRole = userAccess === UserAccess.OWNER

  async function handleRoleChange(newRole: CommunityRole) {
    if (!loadedMember || !canChangeRole || newRole === loadedMember.role) return
    setRoleError(null)
    setRoleUpdating(true)
    const res = await updateMemberRole(loadedMember.id, newRole)
    setRoleUpdating(false)
    if (res.error) {
      setRoleError(res.message ?? res.error)
      return
    }
    setLoadedMember((prev) => (prev ? { ...prev, role: newRole } : null))
  }

  async function handleRemoveMember() {
    if (!loadedMember) return
    setRemoveError(null)
    setRemoveLoading(true)
    const res = await removeMember(loadedMember.id)
    setRemoveLoading(false)
    if (res.error) {
      setRemoveError(res.message ?? res.error)
      return
    }
    setRemoveConfirmOpen(false)
    onOpenChange(false)
    router.refresh()
  }

  useEffect(() => {
    if (open) {
      setLoadedMember(member)
    } else {
      setLoadedMember(null)
      setAnswers([])
      setAnswersError(null)
    }
  }, [open, member])

  // Fetch answers when questions tab is opened
  useEffect(() => {
    if (open && activeTab === "questions" && loadedMember && answers.length === 0 && !loadingAnswers) {
      setLoadingAnswers(true)
      setAnswersError(null)
      getMemberAnswers(loadedMember.id).then((result) => {
        setLoadingAnswers(false)
        if (result.error || !result.data) {
          setAnswersError(result.message || "Failed to load answers")
        } else {
          setAnswers(result.data.answers)
        }
      })
    }
  }, [open, activeTab, loadedMember, answers.length, loadingAnswers])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-sm:inset-0 max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-screen max-sm:h-screen max-sm:max-w-none max-sm:rounded-none max-sm:border-0 sm:max-w-3xl p-0 gap-0 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Header: avatar, name, "Membership Settings" */}
          <div className="flex items-start gap-3 px-6 pt-6 pb-4 pr-12 border-b border-grey-200">
            {loadedMember && (
              <>
                <UserAvatar user={loadedMember.users} className="w-12 h-12 rounded-[14px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-grey-900">
                    {formatFullName(loadedMember.users.first_name, loadedMember.users.last_name)}
                  </h2>
                  <p className="text-sm text-grey-700">Membership Settings</p>
                </div>
              </>
            )}
          </div>

          {/* Tabs sidebar + content */}
          <div className="flex min-h-0 flex-1">
            {/* Left: vertical tabs */}
            <nav className="w-48 shrink-0 border-r border-grey-200 bg-grey-50/50 py-3 px-4 space-y-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-lg",
                    activeTab === tab.id
                      ? "bg-orange-500 text-white"
                      : "text-grey-600 hover:text-grey-900 hover:bg-grey-100/80"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right: tab content */}
            <div className="flex-1 overflow-auto p-6 bg-white min-h-[450px]">
              {activeTab === "membership" && loadedMember && (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-1 items-center">
                    <p className="text-sm font-medium text-grey-900">Email: </p>
                    <p className="text-sm text-grey-700 font-medium">{loadedMember.users.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-grey-700 mb-2">Role</p>
                    <Select
                      value={loadedMember.role}
                      onValueChange={(value) => handleRoleChange(value as CommunityRole)}
                      disabled={!canChangeRole || roleUpdating}
                    >
                      <SelectTrigger variant="secondary" className="w-full max-w-[130px] rounded-lg py-5">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CommunityRole.MEMBER}>
                          Member
                        </SelectItem>
                        <SelectItem value={CommunityRole.ADMIN}>
                          Admin
                        </SelectItem>
                        <SelectItem value={CommunityRole.OWNER}>
                          Owner
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {roleError && (
                      <p className="text-sm text-destructive mt-1">{roleError}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-4 text-sm text-grey-600">
                    {loadedMember.joined_at && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 shrink-0" />
                        <span>Joined {format(new Date(loadedMember.joined_at), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-4 shrink-0" />
                      <span>Active {calculateDaysAgo(loadedMember.updated_at)} ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TagIcon className="size-4 shrink-0 stroke-grey-600" />
                      <span>{getMembershipType(community)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <WatchIcon className="size-4 shrink-0 stroke-grey-600" />
                      <span>{getAccessType(community)}</span>
                    </div>
                    {loadedMember.invited_by && invitedByUser && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-grey-100 rounded-full w-fit">
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
                  <div className="flex flex-col gap-1 pt-2 border-t border-grey-200">
                    <button
                      type="button"
                      className="text-sm text-grey-700 hover:text-destructive text-left"
                      onClick={() => setRemoveConfirmOpen(true)}
                    >
                      Remove from community
                    </button>
                    <button type="button" className="text-sm text-grey-700 hover:text-destructive text-left">
                      Ban from community
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "courses" && <div className="text-sm text-grey-500">No content yet.</div>}
              {activeTab === "payments" && <div className="text-sm text-grey-500">No content yet.</div>}
              {activeTab === "questions" && (
                <div className="space-y-4">
                  {loadingAnswers ? (
                    <div className="text-center py-8 text-grey-600">Loading answers...</div>
                  ) : answersError ? (
                    <div className="text-center py-8 text-destructive">{answersError}</div>
                  ) : answers.length === 0 ? (
                    <div className="text-center py-8 text-grey-500">No answers found</div>
                  ) : (
                    <>
                      <p className="font-bold text-lg text-grey-900 mb-2">Questions Answers</p>
                      <div className="bg-grey-200 rounded-lg p-4 overflow-y-auto max-h-[300px] space-y-5">
                        {
                          answers.map((answer) => {
                            const isMcq = answer.questionType === "MULTIPLE_CHOICE";
                            const answerParts = isMcq ? answer.answer.split(", ") : [answer.answer];
                            
                            return (
                              <div key={answer.id} className="">
                                <p className="text-base font-bold text-grey-900 mb-1">{answer.question}</p>
                                {isMcq && answerParts.length > 1 ? (
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {answerParts.map((part, i) => (
                                      <li key={i} className="text-base font-medium text-grey-800">{part}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-base font-medium text-grey-800">{answer.answer}</p>
                                )}
                              </div>
                            );
                          })
                        }

                        {
                          answers.length === 0 && (
                            <p>No questions to show</p>
                          )
                        }
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove From Community?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you certain you wish to remove &quot;{loadedMember ? formatFullName(loadedMember.users.first_name, loadedMember.users.last_name) : "Member Name"}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeError && (
            <p className="text-sm text-destructive">{removeError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLoading}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => handleRemoveMember()}
              disabled={removeLoading}
            >
              {removeLoading ? "Removing…" : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
