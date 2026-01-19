"use client"
import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClassroomProvider, useClassroomContext } from "./classroom-context";
import { CancelDialog } from "./cancel-dialog";
import { ModalHeader } from "./modal-header";
import { ClassroomDetailsStep } from "./classroom-details-step";
import { ModuleDetailsStep } from "./module-details-step";
import { ModalMode } from "./types";
import { useRouter, useParams } from "next/navigation";

function ClassroomModalContent({ children, mode, defaultOpen = false }: { children?: React.ReactNode; mode: ModalMode; defaultOpen?: boolean }) {
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
        handleSave,
        handleEdit: contextHandleEdit,
        setStep,
        isDraft,
        classroomId,
    } = useClassroomContext();
    
    const router = useRouter();
    const params = useParams();

    const handleCancelConfirm = () => {
        setIsOpen(false);
        setIsCancelDialogOpen(false);
        resetForm();
        // Navigate back based on mode and defaultOpen
        if (defaultOpen && params.slug) {
            if (mode === 'edit' && classroomId) {
                // Navigate back to view page when canceling edit
                router.push(`/communities/${params.slug}/classrooms/${classroomId}`);
            } else {
                // Navigate back to classrooms list for view mode
                router.push(`/communities/${params.slug}/classrooms`);
            }
        }
    };

    const handleDialogClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetForm();
            // Navigate back based on mode and defaultOpen
            if (defaultOpen && params.slug) {
                if (mode === 'edit' && classroomId) {
                    // Navigate back to view page when closing edit modal
                    router.push(`/communities/${params.slug}/classrooms/${classroomId}`);
                } else {
                    // Navigate back to classrooms list for view mode
                    router.push(`/communities/${params.slug}/classrooms`);
                }
            }
        }
    };

    const handleEdit = () => {
        // Navigate to edit page if we have classroomId and slug
        if (classroomId && params.slug) {
            router.push(`/communities/${params.slug}/classrooms/${classroomId}`);
        } else {
            // Fallback to context handler
            contextHandleEdit();
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
                {!defaultOpen && (
                    <DialogTrigger asChild>
                        {children || <button>Create Classroom</button>}
                    </DialogTrigger>
                )}

                <DialogContent showCloseButton={false} fullScreen className="overflow-y-auto pt-16">
                    <DialogTitle className="h-0">
                        <ModalHeader
                            mode={mode}
                            step={step}
                            onCancel={() => setIsCancelDialogOpen(true)}
                            onGoBack={() => setStep('classroom-details')}
                            onSaveDraft={handleSaveDraft}
                            onNext={() => setStep('module-details')}
                            onPublish={handlePublish}
                            onSave={handleSave}
                            onEdit={handleEdit}
                            isNextDisabled={isNextButtonDisabled()}
                            isDraft={isDraft}
                        />
                    </DialogTitle>

                    {mode === 'view' ? (
                        // In view mode, only show module-details step
                        <ModuleDetailsStep />
                    ) : (
                        // In create/edit mode, show both steps
                        <>
                            {step === 'classroom-details' && <ClassroomDetailsStep />}
                            {step === 'module-details' && <ModuleDetailsStep />}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ClassroomModal({ 
    communityId, 
    children,
    mode = 'create',
    classroomId = null,
    defaultOpen = false,
}: { 
    communityId: number
    children?: React.ReactNode
    mode?: ModalMode
    classroomId?: number | null
    defaultOpen?: boolean
}) {
    return (
        <ClassroomProvider communityId={communityId} mode={mode} classroomId={classroomId} defaultOpen={defaultOpen}>
            <ClassroomModalContent mode={mode} defaultOpen={defaultOpen}>
                {children}
            </ClassroomModalContent>
        </ClassroomProvider>
    );
}
