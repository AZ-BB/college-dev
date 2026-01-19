import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function CancelDialog({ isOpen, onOpenChange, onConfirm }: CancelDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[400px]" showCloseButton={false}>
                <DialogTitle className="text-2xl font-semibold">
                    Cancel
                </DialogTitle>

                <p className="font-medium">
                    You will lose all your progress and everything you have added so far. Do you want to cancel creating this course?
                </p>

                <div className="w-full flex justify-between gap-2">
                    <Button
                        className="w-1/2 rounded-[16px] py-6"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        No
                    </Button>

                    <Button
                        className="w-1/2 rounded-[16px] py-6"
                        onClick={onConfirm}
                    >
                        Yes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
