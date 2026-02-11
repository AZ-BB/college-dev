"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Tables } from "@/database.types";
import { Lock } from "lucide-react";
import { useState } from "react";
import { createMemberClassroomProgress } from "@/action/classroom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClassroomTimeUnlockModalProps {
    classroom: Tables<"classrooms"> & {
        modulesCount?: number;
        lessonsCount?: number;
        resourcesCount?: number;
    };
    daysRemaining: number;
    communityId: number;
    communitySlug: string;
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ClassroomTimeUnlockModal({
    classroom,
    daysRemaining,
    communityId,
    communitySlug,
    userId,
    open,
    onOpenChange,
}: ClassroomTimeUnlockModalProps) {
    const router = useRouter();
    const [unlocking, setUnlocking] = useState(false);
    const isUnlocked = daysRemaining === 0;

    const handleUnlock = async () => {
        setUnlocking(true);
        try {
            const result = await createMemberClassroomProgress(
                userId,
                communityId,
                classroom.id
            );

            if (result.error) {
                toast.error(result.message);
                setUnlocking(false);
                return;
            }

            toast.success("Classroom unlocked!");

            // Close modal first
            onOpenChange(false);

            router.push(`/communities/${communitySlug}/classrooms/${classroom.id}`);
        } catch (error) {
            console.error("Unlock error:", error);
            toast.error("An error occurred while unlocking");
            setUnlocking(false);
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="space-y-4">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-orange-100 p-3">
                            <Lock className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">
                            {classroom.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {isUnlocked
                                ? "Ready to unlock"
                                : `Unlock in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`
                            }
                        </p>
                    </div>
                    <div className="flex justify-center gap-4 text-sm text-gray-600">
                        <span>{classroom.modulesCount || 0} Modules</span>
                        <span>•</span>
                        <span>{classroom.lessonsCount || 0} Lessons</span>
                        <span>•</span>
                        <span>{classroom.resourcesCount || 0} Resources</span>
                    </div>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                        <p className="text-sm text-gray-700 text-center">
                            {isUnlocked ? (
                                <>
                                    You&apos;ve been a member for{" "}
                                    <span className="font-semibold">{classroom.time_unlock_in_days} days</span>.
                                    Click below to unlock this classroom!
                                </>
                            ) : (
                                <>
                                    This classroom will unlock after you&apos;ve been a member for{" "}
                                    <span className="font-semibold">{classroom.time_unlock_in_days} days</span>.
                                    You need to wait <span className="font-semibold">{daysRemaining} more {daysRemaining === 1 ? "day" : "days"}</span>.
                                </>
                            )}
                        </p>
                    </div>

                    <Button
                        variant="default"
                        className={`w-full bg-orange-500 text-white font-semibold py-6 rounded-lg ${isUnlocked ? "hover:bg-orange-600" : "hover:bg-orange-500 opacity-60 cursor-not-allowed"
                            }`}
                        disabled={!isUnlocked || unlocking}
                        onClick={handleUnlock}
                    >
                        {unlocking
                            ? "Unlocking..."
                            : isUnlocked
                                ? "Unlock"
                                : `Unlock in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`
                        }
                    </Button>

                    {!isUnlocked && (
                        <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700 font-semibold py-6 rounded-lg"
                            onClick={() => onOpenChange(false)}
                        >
                            Got It
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
