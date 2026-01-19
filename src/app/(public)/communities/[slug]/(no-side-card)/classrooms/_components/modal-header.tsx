import { X, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomContext } from "./classroom-context";
import { ModalMode } from "./types";
import Link from "next/link";
import { useParams } from "next/navigation";

export function ModalHeader({
    mode,
    step,
    onCancel,
    onGoBack,
    onSaveDraft,
    onNext,
    onPublish,
    onSave,
    onEdit,
    isNextDisabled,
    isDraft,
}: {
    mode: ModalMode;
    step: string;
    onCancel: () => void;
    onGoBack: () => void;
    onSaveDraft: () => void;
    onNext: () => void;
    onPublish: () => void;
    onSave: () => void;
    onEdit: () => void;
    isNextDisabled: boolean;
    isDraft: boolean;
}) {
    const { isLoading, isSavingDraft, isPublishing, classroomData } = useClassroomContext();
    const params = useParams();
    const getTitle = () => {
        if (mode === 'view') return 'View ' + classroomData.name;
        if (mode === 'edit') return 'Edit Course';
        return 'Add Course';
    };
    return (
        <div className="w-full border-b h-16 fixed top-0 left-0 right-0 bg-white z-10">
            <div className="max-w-6xl h-full mx-auto w-full flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    {
                        mode === 'create' &&
                        <div
                            className={`cursor-pointer ${isSavingDraft || isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={isSavingDraft || isPublishing ? undefined : onCancel}
                        >
                            <X className="size-5" />
                        </div>
                    }

                    {
                        (mode === 'view' || mode === 'edit') && (
                            <Link href={`/communities/${params.slug}/classrooms`}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        )
                    }

                    <span className="font-bold text-base">
                        {getTitle()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {mode === 'view' && (
                        <Link href={`/communities/${params.slug}/classrooms/${params.id}/edit`}>
                            <Button
                                variant="secondary"
                                className="rounded-[12px] px-20 py-5 text-sm font-semibold"
                            >
                                Edit Course
                            </Button>
                        </Link>
                    )}

                    {mode === 'create' && (
                        <>
                            {step === 'classroom-details' && (
                                <Button
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isSavingDraft || isPublishing}
                                    className="rounded-[12px] px-7 py-5 text-sm font-semibold"
                                >
                                    Cancel
                                </Button>
                            )}

                            {step === 'module-details' && (
                                <Button
                                    variant="secondary"
                                    onClick={onGoBack}
                                    disabled={isSavingDraft || isPublishing}
                                    className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                >
                                    Go Back
                                </Button>
                            )}

                            <Button
                                variant="secondary"
                                className="rounded-[12px] py-5 text-sm font-semibold"
                                disabled={isNextDisabled || isSavingDraft || isPublishing}
                                onClick={onSaveDraft}
                            >
                                {isSavingDraft ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save As Draft"
                                )}
                            </Button>

                            {step === 'classroom-details' && (
                                <Button
                                    onClick={onNext}
                                    disabled={isNextDisabled || isSavingDraft || isPublishing}
                                    className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                >
                                    Next
                                </Button>
                            )}

                            {step === 'module-details' && (
                                <Button
                                    onClick={onPublish}
                                    disabled={isPublishing || isSavingDraft}
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

                    {mode === 'edit' && (
                        <>
                            {step === 'classroom-details' && (
                                <Button
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isLoading || isSavingDraft || isPublishing}
                                    className="rounded-[12px] px-7 py-5 text-sm font-semibold"
                                >
                                    Cancel
                                </Button>
                            )}

                            {step === 'module-details' && (
                                <Button
                                    variant="secondary"
                                    onClick={onGoBack}
                                    disabled={isLoading || isSavingDraft || isPublishing}
                                    className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                >
                                    Go Back
                                </Button>
                            )}

                            {step === 'classroom-details' && (
                                <Button
                                    onClick={onNext}
                                    disabled={isNextDisabled || isLoading || isSavingDraft || isPublishing}
                                    className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                >
                                    Next
                                </Button>
                            )}

                            {step === 'module-details' && (
                                <>
                                    <Button
                                        onClick={onSave}
                                        disabled={isNextDisabled || isLoading || isPublishing || isSavingDraft}
                                        className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>

                                    {isDraft && (
                                        <Button
                                            onClick={onPublish}
                                            disabled={isPublishing || isSavingDraft || isLoading}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
