"use client"
import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Classroom } from "./types";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { InfoEditor } from "./info-editor";
import { ClassroomEditorProvider, useClassroomEditorContext } from "./classroom-editor-context";
import { ClassroomType } from "@/enums/enums";
import { ContentEditor } from "./content-editor";
import { getClassroom, getClassroomById } from "@/action/classroom";

function CancelDialog({ isOpen, onOpenChange, onConfirm }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
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



function ClassroomEditorContent() {
    const { classroom, saveClassroom, saveAndPublishClassroom, isSaving, isPublishing } = useClassroomEditorContext();

    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [step, setStep] = useState<'classroom-details' | 'module-details'>('classroom-details');

    const router = useRouter();
    const params = useParams();

    const handleCancelConfirm = () => {
        setIsCancelDialogOpen(false);
        router.push(`/communities/${params.slug}/classrooms`);
    };

    return (
        <>
            <CancelDialog
                isOpen={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                onConfirm={handleCancelConfirm}
            />
            <Dialog open={true} >
                <DialogContent showCloseButton={false} fullScreen className="overflow-y-auto pt-16">
                    <DialogTitle className="h-0">
                        <div className="w-full border-b h-16 fixed top-0 left-0 right-0 bg-white z-10">
                            <div className="max-w-6xl h-full mx-auto w-full flex justify-between items-center">
                                <div className="flex gap-2 items-center">

                                    <button className="cursor-pointer" onClick={() => setIsCancelDialogOpen(true)}>
                                        <ArrowLeft className="size-5" />
                                    </button>

                                    <span className="font-bold text-base">
                                        Edit {classroom.name}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {step === 'classroom-details' && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsCancelDialogOpen(true);
                                            }}
                                            disabled={false}
                                            className="rounded-[12px] px-7 py-5 text-sm font-semibold"
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    {step === 'module-details' && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setStep('classroom-details');
                                            }}
                                            disabled={false}
                                            className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                        >
                                            Go Back
                                        </Button>
                                    )}

                                    {step === 'classroom-details' && (
                                        <Button
                                            onClick={() => {
                                                setStep('module-details');
                                            }}
                                            disabled={
                                                !classroom.name ||
                                                !classroom.description ||
                                                (classroom.type === ClassroomType.ONE_TIME_PAYMENT && !classroom.amount_one_time) ||
                                                (classroom.type === ClassroomType.TIME_UNLOCK && !classroom.time_unlock_in_days)
                                            }
                                            className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                        >
                                            Next
                                        </Button>
                                    )}

                                    {step === 'module-details' && (
                                        <>
                                            <Button
                                                variant={classroom.is_draft ? "secondary" : "default"}
                                                onClick={() => { saveClassroom() }}
                                                disabled={isSaving || isPublishing}
                                                className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    "Save"
                                                )}
                                            </Button>

                                            {classroom.is_draft && (
                                                <Button
                                                    onClick={() => { saveAndPublishClassroom() }}
                                                    disabled={isPublishing || isSaving}
                                                    className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                                >
                                                    {isPublishing ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Publishing...
                                                        </>
                                                    ) : (
                                                        "Publish"
                                                    )}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogTitle>


                    {step === 'classroom-details' && <InfoEditor />}
                    {step === 'module-details' && <ContentEditor />}

                </DialogContent>
            </Dialog>
        </>
    );
}

export function ClassroomEditor({ initialClassroom }: { initialClassroom: Awaited<ReturnType<typeof getClassroom>> }) {
    return (
        <ClassroomEditorProvider initialClassroom={initialClassroom}>
            <ClassroomEditorContent />
        </ClassroomEditorProvider>
    );
}