"use client";

import { createMemberClassroomProgress } from "@/action/classroom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type PaymentMethod = "CARD" | "GOOGLE_PAY";

interface ClassroomPaymentModalProps {
    classroom: Tables<"classrooms"> & {
        modulesCount?: number;
        lessonsCount?: number;
        resourcesCount?: number;
    };
    communityId: number;
    communitySlug: string;
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ClassroomPaymentModal({
    classroom,
    communityId,
    communitySlug,
    userId,
    open,
    onOpenChange,
}: ClassroomPaymentModalProps) {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Create the member classroom progress record
            const result = await createMemberClassroomProgress(
                userId,
                communityId,
                classroom.id
            );

            if (result.error) {
                toast.error(result.message);
                setProcessing(false);
                return;
            }

            // Success - navigate to the classroom
            toast.success("Payment successful!");
            
            // Close modal first
            onOpenChange(false);
            
            // Small delay to ensure modal closes before navigation
            setTimeout(() => {
                router.push(`/communities/${communitySlug}/classrooms/${classroom.id}`);
                router.refresh();
            }, 100);
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("An error occurred during payment");
            setProcessing(false);
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
                            Unlock for ₹{classroom.amount_one_time}
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
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">Payment Method</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPaymentMethod("CARD")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                                    paymentMethod === "CARD"
                                        ? "border-orange-500 bg-orange-50 text-orange-600"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                )}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Card
                            </button>
                            <button
                                onClick={() => setPaymentMethod("GOOGLE_PAY")}
                                className={cn(
                                    "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                                    paymentMethod === "GOOGLE_PAY"
                                        ? "border-orange-500 bg-orange-50 text-orange-600"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                )}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                                </svg>
                                G Pay
                            </button>
                        </div>
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 rounded-lg"
                        onClick={handlePayment}
                        disabled={processing}
                    >
                        {processing ? "Processing..." : `Buy Now for ₹${classroom.amount_one_time}`}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                        This is a placeholder payment. In production, this would integrate with your payment provider.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
