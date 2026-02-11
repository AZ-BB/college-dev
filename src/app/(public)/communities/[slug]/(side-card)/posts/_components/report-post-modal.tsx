"use client";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { createPostReport } from "@/action/posts-reports";
import { getRules } from "@/action/rules";
import { toast } from "sonner";
import { Tables } from "@/database.types";

interface ReportPostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: number;
    communityId: number;
}

export default function ReportPostModal({
    open,
    onOpenChange,
    postId,
    communityId,
}: ReportPostModalProps) {
    const [selectedRules, setSelectedRules] = useState<number[]>([]);
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rules, setRules] = useState<Tables<"community_rules">[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(false);

    useEffect(() => {
        if (open && communityId) {
            loadRules();
        }
    }, [open, communityId]);

    const loadRules = async () => {
        setIsLoadingRules(true);
        const result = await getRules(communityId);
        setIsLoadingRules(false);
        
        if (result.error || !result.data) {
            toast.error(result.message || "Failed to load rules");
            return;
        }
        
        setRules(result.data);
    };

    const handleRuleToggle = (ruleId: number) => {
        setSelectedRules((prev) =>
            prev.includes(ruleId)
                ? prev.filter((id) => id !== ruleId)
                : [...prev, ruleId]
        );
    };

    const handleSubmit = async () => {
        if (selectedRules.length === 0) {
            toast.error("Please select at least one rule violation");
            return;
        }

        setIsSubmitting(true);
        const result = await createPostReport({
            postId,
            rulesIds: selectedRules,
            additionalNotes: additionalNotes.trim() || null,
        });

        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.message || "Failed to submit report");
        } else {
            toast.success(result.message || "Report submitted successfully");
            onOpenChange(false);
            // Reset form
            setSelectedRules([]);
            setAdditionalNotes("");
        }
    };

    const handleSubmitClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleSubmit();
    };

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenChange(false);
        // Reset form
        setSelectedRules([]);
        setAdditionalNotes("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DialogTitle className="text-xl font-semibold mb-2">
                    Report to admins
                </DialogTitle>
                
                <div className="space-y-4" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                    <div className="space-y-3">
                        <p className="text-sm text-grey-700 font-medium">
                            What rules does this post break?
                        </p>
                        
                        {isLoadingRules ? (
                            <div className="text-sm text-grey-500">Loading rules...</div>
                        ) : rules.length === 0 ? (
                            <div className="text-sm text-grey-500">No rules available</div>
                        ) : (
                            <div className="space-y-3">
                                {rules.map((rule) => (
                                    <label
                                        key={rule.id}
                                        className="flex items-center gap-3 cursor-pointer hover:bg-grey-50 p-2 rounded-lg transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedRules.includes(rule.id)}
                                            onChange={() => handleRuleToggle(rule.id)}
                                            className="w-4 h-4 rounded border-grey-300 text-orange-500 focus:ring-orange-500 focus:ring-2"
                                        />
                                        <span className="text-sm font-medium text-grey-900">
                                            {rule.rule}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-grey-900">
                            Additional notes (optional)
                        </label>
                        <Textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Provide any additional details..."
                            className="min-h-[100px] rounded-lg resize-none"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    </div>

                    <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-4">
                        <Button
                            onClick={handleSubmitClick}
                            className="w-1/2 py-6 rounded-[12px] bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={isSubmitting || selectedRules.length === 0}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                        <Button
                            className="w-1/2 py-6 rounded-[12px] bg-grey-200 hover:bg-grey-300 text-grey-900"
                            variant="secondary"
                            onClick={handleCancelClick}
                            disabled={isSubmitting}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
