"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Clock, Lock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tables } from "@/database.types"
import { toast } from "sonner"
import { deleteClassroom, createMemberClassroomProgress } from "@/action/classroom"
import Link from "next/link"
import AccessControl from "@/components/access-control"
import { UserAccess, CommunityMemberStatus } from "@/enums/enums"
import { useUserAccess } from "@/contexts/access-context"
import ClassroomPaymentModal from "./classroom-payment-modal"
import ClassroomTimeUnlockModal from "./classroom-time-unlock-modal"
import MembershipPendingModal from "./membership-pending-modal"

type Classroom = Tables<"classrooms"> & {
    modulesCount?: number
    lessonsCount?: number
    resourcesCount?: number
    is_joined?: boolean
}

interface ClassroomCardProps {
    classroom: Classroom
    communitySlug: string
    communityId: number
    communityName: string
    membership?: {
        role: string
        member_status: string
        joined_at: string | null
    } | null
    userId?: string | null
}

export default function ClassroomCard({ 
    classroom, 
    communitySlug, 
    communityId,
    communityName,
    membership,
    userId 
}: ClassroomCardProps) {
    const router = useRouter()
    const { userAccess, userStatus } = useUserAccess()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [paymentModalOpen, setPaymentModalOpen] = useState(false)
    const [timeUnlockModalOpen, setTimeUnlockModalOpen] = useState(false)
    const [pendingModalOpen, setPendingModalOpen] = useState(false)

    const formatPrice = () => {
        if (classroom.type === "ONE_TIME_PAYMENT" && classroom.amount_one_time) {
            return `₹${classroom.amount_one_time}`
        }
        // For other types, you might want to show monthly pricing or other info
        return null
    }

    const getPriceDisplay = () => {
        const price = formatPrice()
        if (!price) return null

        // For ONE_TIME_PAYMENT, show the one-time price
        if (classroom.type === "ONE_TIME_PAYMENT") {
            return price
        }

        // For subscription types, you might want to show monthly pricing
        // This would require additional data from the community or classroom
        // For now, return null to show "Start Now" instead
        return null
    }

    const handleDelete = async () => {
        const response = await deleteClassroom(classroom.id, communitySlug)
        if (response?.error) {
            toast.error(response.message)
        } else {
            toast.success(response?.message || "Classroom deleted successfully")
        }
    }

    const calculateDaysRemaining = (): number => {
        if (!membership?.joined_at || !classroom.time_unlock_in_days) {
            return classroom.time_unlock_in_days || 0
        }
        
        const joinedDate = new Date(membership.joined_at)
        const today = new Date()
        const daysSinceJoined = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysRemaining = classroom.time_unlock_in_days - daysSinceJoined
        
        return Math.max(0, daysRemaining)
    }

    const isClassroomLocked = (): boolean => {
        // Admin/Owner always have access
        if (userAccess === UserAccess.ADMIN || userAccess === UserAccess.OWNER) {
            return false
        }

        // If already joined, not locked
        if (classroom.is_joined) {
            return false
        }

        // Free classrooms are not locked
        if (classroom.type === "PUBLIC" || classroom.type === "PRIVATE") {
            return false
        }

        // Paid classroom is locked if not joined
        if (classroom.type === "ONE_TIME_PAYMENT") {
            return true
        }

        // Time-unlock classroom is locked if days remaining > 0
        if (classroom.type === "TIME_UNLOCK") {
            return calculateDaysRemaining() > 0
        }

        return false
    }

    const handleCardClick = async (e: React.MouseEvent) => {
        // Don't handle if clicking on dropdown or its children
        if (isDropdownOpen) {
            return
        }

        // Admin/Owner - navigate directly (they can access everything)
        if (userAccess === UserAccess.ADMIN || userAccess === UserAccess.OWNER) {
            router.push(`/communities/${communitySlug}/classrooms/${classroom.id}`)
            return
        }

        // Check user access
        if (userAccess === UserAccess.ANONYMOUS || userAccess === UserAccess.NOT_MEMBER) {
            toast.error("Please join the community first to access classrooms")
            return
        }

        // Check if membership is pending
        if (userStatus === CommunityMemberStatus.PENDING) {
            setPendingModalOpen(true)
            return
        }

        // If user has already joined this classroom, navigate directly
        if (classroom.is_joined) {
            router.push(`/communities/${communitySlug}/classrooms/${classroom.id}`)
            return
        }

        // For ACTIVE members who haven't joined yet
        if (userAccess === UserAccess.MEMBER) {
            // Free classrooms - navigate directly
            if (classroom.type === "PUBLIC" || classroom.type === "PRIVATE") {
                router.push(`/communities/${communitySlug}/classrooms/${classroom.id}`)
                return
            }

            // Paid classroom - show payment modal
            if (classroom.type === "ONE_TIME_PAYMENT") {
                setPaymentModalOpen(true)
                return
            }

            // Time-unlock classroom - always show modal
            if (classroom.type === "TIME_UNLOCK") {
                setTimeUnlockModalOpen(true)
                return
            }
        }
    }

    return (
        <>
            <Card 
                className="overflow-hidden p-0 shadow-none hover:shadow-md transition-shadow group cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="relative h-44 w-full">
                    {/* Cover Image */}
                    {classroom.cover_url ? (
                        <Image
                            src={classroom.cover_url}
                            alt={classroom.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full relative flex items-center justify-center">
                            <Image
                                src="/placeholders/placeholder.png"
                                alt="Classroom Placeholder"
                                fill
                                className="object-cover"
                            />

                            <div className="absolute inset-0 w-full h-full bg-[#E671254D]" />
                        </div>
                    )}

                    {/* Locked Overlay for Time-Unlock */}
                    {isClassroomLocked() && classroom.type === "TIME_UNLOCK" && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <div className="bg-white/20 rounded-full p-3 mb-2">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-white text-sm font-semibold">
                                Unlock in {calculateDaysRemaining()} {calculateDaysRemaining() === 1 ? "day" : "days"}
                            </p>
                        </div>
                    )}

                    {/* Locked Overlay for Paid */}
                    {isClassroomLocked() && classroom.type === "ONE_TIME_PAYMENT" && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                            <div className="bg-white/20 rounded-full p-3 mb-2">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-white text-sm font-semibold">
                                Unlock For ₹{classroom.amount_one_time}
                            </p>
                        </div>
                    )}

                    {/* Draft Badge */}
                    {classroom.is_draft && (
                        <div className="absolute bottom-2 left-3 bg-white rounded-md text-black text-sm font-bold px-2 py-1">
                            Draft
                        </div>
                    )}

                    {/* Dropdown Menu */}
                    <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                        <div
                            className={`absolute top-3 right-3 transition-opacity duration-300 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="h-11 w-11 rounded-lg bg-white p-0"
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    >
                                        <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z" stroke="#0E1011" strokeWidth="1.5" />
                                            <path d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z" stroke="#0E1011" strokeWidth="1.5" />
                                            <path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" stroke="#0E1011" strokeWidth="1.5" />
                                        </svg>

                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Link href={`/communities/${communitySlug}/classrooms/${classroom.id}/edit`}>
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        variant="destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete()
                                        }}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </AccessControl>
                </div>

                {/* Content */}
                <div className="px-4 pb-4 flex flex-col gap-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {classroom.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-10">
                        {classroom.description}
                    </p>

                    {/* Footer with Price/Action */}
                    <div className="mt-auto pt-2 flex items-center justify-end">
                        <span className="text-orange-500 font-bold text-sm cursor-pointer hover:text-orange-600">
                            {getPriceDisplay() || "Start Now"}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Modals */}
            {userId && (
                <ClassroomPaymentModal
                    classroom={classroom}
                    communityId={communityId}
                    communitySlug={communitySlug}
                    userId={userId}
                    open={paymentModalOpen}
                    onOpenChange={setPaymentModalOpen}
                />
            )}

            {userId && (
                <ClassroomTimeUnlockModal
                    classroom={classroom}
                    daysRemaining={calculateDaysRemaining()}
                    communityId={communityId}
                    communitySlug={communitySlug}
                    userId={userId}
                    open={timeUnlockModalOpen}
                    onOpenChange={setTimeUnlockModalOpen}
                />
            )}

            <MembershipPendingModal
                communityName={communityName}
                open={pendingModalOpen}
                onOpenChange={setPendingModalOpen}
            />
        </>
    )
}
