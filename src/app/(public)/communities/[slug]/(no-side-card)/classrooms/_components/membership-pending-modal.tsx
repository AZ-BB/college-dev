"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";

interface MembershipPendingModalProps {
    communityName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MembershipPendingModal({
    communityName,
    open,
    onOpenChange,
}: MembershipPendingModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="space-y-4">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-orange-100 p-3">
                            <Clock className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl font-bold text-gray-900">
                        Join Request Pending
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-600 text-center">
                        Your request to join <span className="font-semibold">{communityName}</span> is still being reviewed by the community admins.
                    </p>
                    
                    <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                        <p className="text-sm text-gray-700 text-center">
                            You&apos;ll receive a notification once your membership is approved.
                        </p>
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 rounded-lg"
                        onClick={() => onOpenChange(false)}
                    >
                        Got It
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
