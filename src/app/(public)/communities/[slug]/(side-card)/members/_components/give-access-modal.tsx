"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getAvailableClassroomsForMember, giveClassroomAccessToMember } from "@/action/classroom"
import { Tables } from "@/database.types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface GiveAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  communityId: number
  onAccessGranted?: () => void
}

export default function GiveAccessModal({
  open,
  onOpenChange,
  userId,
  communityId,
  onAccessGranted,
}: GiveAccessModalProps) {
  const router = useRouter()
  const [availableClassrooms, setAvailableClassrooms] = useState<Tables<"classrooms">[]>([])
  const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [granting, setGranting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setLoading(true)
      setError(null)
      setSelectedClassroomIds([])
      
      getAvailableClassroomsForMember(userId, communityId).then((result) => {
        setLoading(false)
        if (result.error || !result.data) {
          setError(result.message || "Failed to load classrooms")
        } else {
          setAvailableClassrooms(result.data)
        }
      })
    } else {
      setAvailableClassrooms([])
      setSelectedClassroomIds([])
      setError(null)
    }
  }, [open, userId, communityId])

  const handleToggleClassroom = (classroomId: number) => {
    setSelectedClassroomIds((prev) =>
      prev.includes(classroomId)
        ? prev.filter((id) => id !== classroomId)
        : [...prev, classroomId]
    )
  }

  const handleSelectAll = () => {
    if (selectedClassroomIds.length === availableClassrooms.length) {
      setSelectedClassroomIds([])
    } else {
      setSelectedClassroomIds(availableClassrooms.map((c) => c.id))
    }
  }

  const handleConfirm = async () => {
    if (selectedClassroomIds.length === 0) {
      toast.error("Please select at least one classroom")
      return
    }

    setGranting(true)
    const result = await giveClassroomAccessToMember(userId, communityId, selectedClassroomIds)
    setGranting(false)

    if (result.error) {
      toast.error(result.message)
      return
    }

    toast.success(`Access granted to ${selectedClassroomIds.length} ${selectedClassroomIds.length === 1 ? "classroom" : "classrooms"}`)
    onOpenChange(false)
    
    if (onAccessGranted) {
      onAccessGranted()
    }
    
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Give Access to Courses</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-grey-600">Loading classrooms...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : availableClassrooms.length === 0 ? (
            <div className="text-center py-8 text-grey-500">
              No available classrooms. This member has access to all classrooms.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-grey-200 pb-3">
                <p className="text-sm font-medium text-grey-700">
                  Select classrooms ({selectedClassroomIds.length} selected)
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                >
                  {selectedClassroomIds.length === availableClassrooms.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {availableClassrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-grey-200 hover:bg-grey-50 transition-colors cursor-pointer"
                    onClick={() => handleToggleClassroom(classroom.id)}
                  >
                    <Checkbox
                      checked={selectedClassroomIds.includes(classroom.id)}
                      onCheckedChange={() => handleToggleClassroom(classroom.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-grey-900">{classroom.name}</p>
                      {classroom.description && (
                        <p className="text-sm text-grey-600 line-clamp-2 mt-1">
                          {classroom.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-grey-100 text-grey-700 font-medium">
                          {classroom.type === "PUBLIC"
                            ? "Public"
                            : classroom.type === "PRIVATE"
                            ? "Private"
                            : classroom.type === "ONE_TIME_PAYMENT"
                            ? `₹${classroom.amount_one_time}`
                            : `${classroom.time_unlock_in_days} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-grey-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  disabled={granting}
                  className="flex-1 py-6 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={granting || selectedClassroomIds.length === 0}
                  className="flex-1 bg-orange-500 py-6 rounded-lg hover:bg-orange-600"
                >
                  {granting ? "Granting Access..." : "Confirm"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
