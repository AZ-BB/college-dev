import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomContext } from "./classroom-context";

export function ModalHeader({
    step,
    onCancel,
    onGoBack,
    onSaveDraft,
    onNext,
    onPublish,
    isNextDisabled,
}: {
    step: string;
    onCancel: () => void;
    onGoBack: () => void;
    onSaveDraft: () => void;
    onNext: () => void;
    onPublish: () => void;
    isNextDisabled: boolean;
}) {
    const { isLoading } = useClassroomContext();
    return (
        <div className="w-full border-b h-16 fixed top-0 left-0 right-0 bg-white z-10">
            <div className="max-w-6xl h-full mx-auto w-full flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <div 
                        className={`cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                        onClick={isLoading ? undefined : onCancel}
                    >
                        <X className="size-5" />
                    </div>

                    <span className="font-bold text-base">
                        Add Course
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {step === 'classroom-details' && (
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="rounded-[12px] px-7 py-5 text-sm font-semibold"
                        >
                            Cancel
                        </Button>
                    )}

                    {step === 'module-details' && (
                        <Button
                            variant="secondary"
                            onClick={onGoBack}
                            disabled={isLoading}
                            className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                        >
                            Go Back
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        className="rounded-[12px] py-5 text-sm font-semibold"
                        disabled={isNextDisabled || isLoading}
                        onClick={onSaveDraft}
                    >
                        {isLoading ? (
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
                            disabled={isNextDisabled || isLoading}
                            className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                        >
                            Next
                        </Button>
                    )}

                    {step === 'module-details' && (
                        <Button
                            onClick={onPublish}
                            disabled={isLoading}
                            className="rounded-[12px] py-5 px-8 text-sm font-semibold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                "Publish"
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
