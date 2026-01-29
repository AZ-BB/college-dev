"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ToggleCommentsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    commentsDisabled: boolean;
    isSubmitting: boolean;
}

export default function ToggleCommentsModal({
    open,
    onOpenChange,
    onConfirm,
    commentsDisabled,
    isSubmitting,
}: ToggleCommentsModalProps) {
    const handleConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {commentsDisabled ? "Enable Comments?" : "Disable Comments?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {commentsDisabled
                            ? "Are you sure you want to enable comments on this post? Users will be able to comment again."
                            : "Are you sure you want to disable comments on this post? Users will no longer be able to comment."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel 
                        className="rounded-[12px]" 
                        disabled={isSubmitting}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        className="rounded-[12px]" 
                        onClick={handleConfirm} 
                        disabled={isSubmitting}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {isSubmitting
                            ? "Processing..."
                            : commentsDisabled
                            ? "Enable Comments"
                            : "Disable Comments"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
