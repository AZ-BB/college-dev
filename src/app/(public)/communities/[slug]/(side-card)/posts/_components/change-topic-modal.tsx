"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import { useState } from "react";
import { updatePostTopic } from "@/action/posts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserAccess } from "@/components/access-context";
import { UserAccess } from "@/enums/enums";
import { TopicWritePermissionType } from "@/enums/enums";

interface ChangeTopicModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    postId: number;
    currentTopicId: number | null;
    topics: Tables<"topics">[];
}

export default function ChangeTopicModal({
    open,
    onOpenChange,
    postId,
    currentTopicId,
    topics,
}: ChangeTopicModalProps) {
    const router = useRouter();
    const { userAccess } = useUserAccess();
    const [selectedTopicId, setSelectedTopicId] = useState<number>(
        currentTopicId || topics[0]?.id || 0
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter topics based on user access (same logic as create post modal)
    const filteredTopics = userAccess === UserAccess.MEMBER
        ? topics.filter(t => t.write_permission_type === TopicWritePermissionType.PUBLIC)
        : topics;

    const handleSubmit = async () => {
        if (!selectedTopicId || selectedTopicId === currentTopicId) {
            onOpenChange(false);
            return;
        }

        setIsSubmitting(true);
        const result = await updatePostTopic(postId, selectedTopicId);

        if (result.error) {
            toast.error(result.message || "Failed to update topic");
        } else {
            toast.success(result.message || "Topic updated successfully");
            router.refresh();
            onOpenChange(false);
        }
        setIsSubmitting(false);
    };

    const handleSubmitClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleSubmit();
    };

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-[425px]"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DialogTitle>Change Topic</DialogTitle>
                <div className="space-y-4" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select New Topic</label>
                        <Select
                            value={selectedTopicId.toString()}
                            onValueChange={(value) => setSelectedTopicId(parseInt(value))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredTopics.map((topic) => (
                                    <SelectItem
                                        key={topic.id}
                                        value={topic.id.toString()}
                                        disabled={topic.id === currentTopicId}
                                    >
                                        {topic.name}
                                        {topic.id === currentTopicId && " (Current)"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                        <Button
                            onClick={handleSubmitClick}
                            className="py-6 rounded-[16px]"
                            disabled={isSubmitting || selectedTopicId === currentTopicId}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {isSubmitting ? "Updating..." : "Update Topic"}
                        </Button>
                        <Button
                            className="py-6 rounded-[16px]"
                            variant="secondary"
                            onClick={handleCancelClick}
                            disabled={isSubmitting}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
