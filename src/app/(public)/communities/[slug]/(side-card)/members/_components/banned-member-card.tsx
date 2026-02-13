"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatFullName } from "@/lib/utils"
import { format } from "date-fns"
import UserAvatar from "@/components/user-avatart"
import { unbanUser } from "@/action/members"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BannedMemberWithUser } from "@/action/members"

interface BannedMemberCardProps {
    bannedMember: BannedMemberWithUser
    communityId: number
    communitySlug: string
}

export default function BannedMemberCard({ bannedMember, communityId, communitySlug }: BannedMemberCardProps) {
    const router = useRouter()
    const [unbanning, setUnbanning] = useState(false)
    const user = bannedMember.users

    async function handleUnban() {
        setUnbanning(true)
        const res = await unbanUser(communityId, user.id)
        setUnbanning(false)
        if (res.error) {
            toast.error(res.message ?? res.error)
            return
        }
        toast.success("User removed from banned list")
        router.refresh()
    }

    return (
        <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <UserAvatar user={user} className="w-12 h-12 rounded-[12px] shrink-0" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-grey-900">
                                {formatFullName(user.first_name, user.last_name)}
                            </h3>
                        </div>
                        <p className="text-sm text-grey-600 mt-0.5">
                            @{user.username}
                        </p>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto shrink-0 py-6 rounded-xl px-4 text-sm sm:text-base font-semibold"
                    onClick={handleUnban}
                    disabled={unbanning}
                >
                    {unbanning ? "Removing…" : "Remove from banned list"}
                </Button>
            </div>

            <div className="text-sm text-grey-600">
                <span className="font-medium">Banned on {format(new Date(bannedMember.created_at), "MMM d, yyyy")}</span>
            </div>
        </div>
    )
}
