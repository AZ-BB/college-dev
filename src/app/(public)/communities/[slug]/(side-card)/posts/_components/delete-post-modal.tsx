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

interface DeletePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export default function DeletePostModal({
    open,
    onOpenChange,
    onConfirm,
    isSubmitting,
}: DeletePostModalProps) {
    const handleConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this post? This action cannot be undone. All comments and replies will also be deleted.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel 
                        disabled={isSubmitting}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="bg-destructive rounded-[12px] hover:bg-destructive/90"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {isSubmitting ? "Deleting..." : "Delete Post"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
