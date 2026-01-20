"use client"

import { useState } from "react"
import Image from "next/image"
import { MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tables } from "@/database.types"
import { toast } from "sonner"
import { deleteClassroom } from "@/action/classroom"
import Link from "next/link"

type Classroom = Tables<"classrooms">

interface ClassroomCardProps {
    classroom: Classroom
    communitySlug: string
}

export default function ClassroomCard({ classroom, communitySlug }: ClassroomCardProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

    return (
        <Card className="overflow-hidden p-0 shadow-none hover:shadow-md transition-shadow group cursor-pointer">
            <Link href={`/communities/${communitySlug}/classrooms/${classroom.id}`}>
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

                    {/* Draft Badge */}
                    {classroom.is_draft && (
                        <div className="absolute bottom-2 left-3 bg-white rounded-md text-black text-sm font-bold px-2 py-1">
                            Draft
                        </div>
                    )}

                    {/* Dropdown Menu */}
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
                                <DropdownMenuItem disabled>Edit</DropdownMenuItem>
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
            </Link>
        </Card>
    )
}
