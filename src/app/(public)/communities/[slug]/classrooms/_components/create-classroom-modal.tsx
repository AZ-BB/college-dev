"use client"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClassroomProvider, useClassroomContext } from "./classroom-context";
import { CancelDialog } from "./cancel-dialog";
import { ModalHeader } from "./modal-header";
import { ClassroomDetailsStep } from "./classroom-details-step";
import { ModuleDetailsStep } from "./module-details-step";

function CreateClassroomModalContent() {
    const {
        isOpen,
        step,
        isCancelDialogOpen,
        setIsCancelDialogOpen,
        setIsOpen,
        resetForm,
        isNextButtonDisabled,
        handleSaveDraft,
        handlePublish,
        setStep,
    } = useClassroomContext();

    const handleCancelConfirm = () => {
        setIsOpen(false);
        setIsCancelDialogOpen(false);
        resetForm();
    };

    const handleDialogClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetForm();
        }
    };

    return (
        <>
            <CancelDialog
                isOpen={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                onConfirm={handleCancelConfirm}
            />
            <Dialog open={isOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger>
                    Create Classroom
                </DialogTrigger>

                <DialogContent showCloseButton={false} fullScreen className="overflow-y-auto pt-16">
                    <DialogTitle className="h-0">
                        <ModalHeader
                            step={step}
                            onCancel={() => setIsCancelDialogOpen(true)}
                            onGoBack={() => setStep('classroom-details')}
                            onSaveDraft={handleSaveDraft}
                            onNext={() => setStep('module-details')}
                            onPublish={handlePublish}
                            isNextDisabled={isNextButtonDisabled()}
                        />
                    </DialogTitle>

                    {step === 'classroom-details' && <ClassroomDetailsStep />}
                    {step === 'module-details' && <ModuleDetailsStep />}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function CreateClassroomModal({ communityId }: { communityId: number }) {
    return (
        <ClassroomProvider communityId={communityId}>
            <CreateClassroomModalContent />
        </ClassroomProvider>
    );
}
