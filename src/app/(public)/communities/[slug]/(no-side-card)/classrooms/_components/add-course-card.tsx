"use client"

import { Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import ClassroomModal from "./create-classroom-modal"

interface AddCourseCardProps {
    communityId: number
}

export default function AddCourseCard({ communityId }: AddCourseCardProps) {
    return (
        <ClassroomModal communityId={communityId}>
            <Card className="border-2 border-dashed border-gray-300 p-0 hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer h-full flex items-center justify-center min-h-[300px] bg-white">
                <div className="flex items-center justify-center gap-2 text-orange-500">
                    <Plus className="size-5" />
                    <span className="text-base font-medium">Add Course</span>
                </div>
            </Card>
        </ClassroomModal>
    )
}
