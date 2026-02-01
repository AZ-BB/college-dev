"use client";

import { createTopic } from "@/action/topics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopicWritePermissionType } from "@/enums/enums";
import { useState } from "react";
import { toast } from "sonner";

export default function AddTopicButton({ communityId }: { communityId: number }) {
    const [open, setOpen] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [writePermissionType, setWritePermissionType] = useState<TopicWritePermissionType>(TopicWritePermissionType.PUBLIC);

    const handleSubmit = async () => {
        setNameError(null);
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Name is required");
            return;
        }
        const { data, error, errorCode } = await createTopic(communityId, trimmedName, writePermissionType);
        if (error) {
            toast.error(error);
            if (errorCode === "UNIQUE_TOPIC_NAME") {
                setNameError(error);
            }
            return;
        }
        if (data) {
            setName("");
            setWritePermissionType(TopicWritePermissionType.PUBLIC);
            setOpen(false);
            toast.success("Topic created successfully");
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setNameError(null); }}>
            <DialogTrigger asChild>
                <Button variant={"ghost"} className="h-full">
                    <svg className="size-6" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.99984 18.3307C14.5832 18.3307 18.3332 14.5807 18.3332 9.9974C18.3332 5.41406 14.5832 1.66406 9.99984 1.66406C5.4165 1.66406 1.6665 5.41406 1.6665 9.9974C1.6665 14.5807 5.4165 18.3307 9.99984 18.3307Z" stroke="#E15E0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.6665 10H13.3332" stroke="#E15E0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 13.3307V6.66406" stroke="#E15E0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Add Topic
                </Button>
            </DialogTrigger>

            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Add Topic</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label>Name <span className="text-destructive">*</span></Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setNameError(null); }}
                            placeholder="Enter topic name"
                            required
                            aria-invalid={!!nameError}
                            aria-describedby={nameError ? "name-error" : undefined}
                        />
                        {nameError && (
                            <p id="name-error" className="text-sm text-destructive">
                                {nameError}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Write Permission Type</Label>
                        <Select value={writePermissionType} onValueChange={(value) => setWritePermissionType(value as TopicWritePermissionType)}>
                            <SelectContent>
                                <SelectItem value={TopicWritePermissionType.PUBLIC}>Public</SelectItem>
                                <SelectItem value={TopicWritePermissionType.ADMINS}>Admins</SelectItem>
                            </SelectContent>
                            <SelectTrigger variant="secondary" className="w-full rounded-lg py-5">
                                <SelectValue placeholder="Select write permission type" />
                            </SelectTrigger>
                        </Select>

                        {
                            writePermissionType === TopicWritePermissionType.ADMINS && (
                                <p className="text-sm text-muted-foreground mt-2">Only admins can post or move posts to this category.</p>
                            )
                        }

                        {
                            writePermissionType === TopicWritePermissionType.PUBLIC && (
                                <p className="text-sm text-muted-foreground mt-2">Members and admins can post in this Topic.</p>
                            )
                        }
                    </div>

                    <Button disabled={!name.trim()} className="py-7 rounded-[16px]" onClick={handleSubmit}>Add Topic</Button>
                    <Button className="py-7 rounded-[16px]" onClick={() => setOpen(false)} variant={"secondary"}>Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}