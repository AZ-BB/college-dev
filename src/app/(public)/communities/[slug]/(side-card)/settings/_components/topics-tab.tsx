"use client";

import {
    createTopic,
    getTopics,
    updateTopic,
    deleteTopic,
    moveTopicUp,
    moveTopicDown,
} from "@/action/topics";
import { getCommunityBySlug } from "@/action/communities";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TopicWritePermissionType } from "@/enums/enums";
import { Tables } from "@/database.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

type TopicRow = Tables<"topics">;

function permissionLabel(type: string): string {
    return type === TopicWritePermissionType.ADMINS ? "Admins" : "Public";
}

interface TopicsTabProps {
    communityId: number;
    slug: string;
}

export function TopicsTab({ communityId: communityIdProp, slug }: TopicsTabProps) {
    const [communityId, setCommunityId] = useState<number | null>(null);
    const [topics, setTopics] = useState<TopicRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const id =
            communityIdProp != null && !Number.isNaN(Number(communityIdProp))
                ? Number(communityIdProp)
                : null;
        if (id != null) {
            setCommunityId(id);
            return;
        }
        getCommunityBySlug(slug).then((res) => {
            if (res.data?.id != null) setCommunityId(res.data.id);
        });
    }, [slug, communityIdProp]);

    const [addOpen, setAddOpen] = useState(false);
    const [addName, setAddName] = useState("");
    const [addWritePermissionType, setAddWritePermissionType] =
        useState<TopicWritePermissionType>(TopicWritePermissionType.PUBLIC);
    const [addNameError, setAddNameError] = useState<string | null>(null);

    const [editingTopic, setEditingTopic] = useState<TopicRow | null>(null);
    const [editName, setEditName] = useState("");
    const [editWritePermissionType, setEditWritePermissionType] =
        useState<TopicWritePermissionType>(TopicWritePermissionType.PUBLIC);
    const [editNameError, setEditNameError] = useState<string | null>(null);

    const [deletingTopic, setDeletingTopic] = useState<TopicRow | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [moveLoadingId, setMoveLoadingId] = useState<number | null>(null);

    const loadTopics = async () => {
        if (communityId == null) return;
        setLoading(true);
        const res = await getTopics(communityId);
        setLoading(false);
        if (res.error || !res.data) {
            toast.error(res.error ?? "Failed to load topics");
            return;
        }
        const sorted = [...res.data].sort((a, b) => a.index - b.index);
        setTopics(sorted);
    };

    useEffect(() => {
        if (communityId != null) loadTopics();
    }, [communityId]);

    const handleAddSubmit = async () => {
        if (communityId == null) return;
        setAddNameError(null);
        const trimmed = addName.trim();
        if (!trimmed) {
            toast.error("Name is required");
            return;
        }
        const { data, error, errorCode } = await createTopic(
            communityId,
            trimmed,
            addWritePermissionType
        );
        if (error) {
            toast.error(error);
            if (errorCode === "UNIQUE_TOPIC_NAME") setAddNameError(error);
            return;
        }
        if (data) {
            setAddName("");
            setAddWritePermissionType(TopicWritePermissionType.PUBLIC);
            setAddOpen(false);
            toast.success("Topic created successfully");
            loadTopics();
        }
    };

    const openEdit = (topic: TopicRow) => {
        setEditingTopic(topic);
        setEditName(topic.name);
        setEditWritePermissionType(
            topic.write_permission_type as TopicWritePermissionType
        );
        setEditNameError(null);
    };

    const handleEditSubmit = async () => {
        if (!editingTopic || communityId == null) return;
        setEditNameError(null);
        const trimmed = editName.trim();
        if (!trimmed) {
            toast.error("Name is required");
            return;
        }
        const { data, error, errorCode } = await updateTopic(
            editingTopic.id,
            communityId,
            trimmed,
            editWritePermissionType
        );
        if (error) {
            toast.error(error);
            if (errorCode === "UNIQUE_TOPIC_NAME") setEditNameError(error);
            return;
        }
        if (data) {
            setEditingTopic(null);
            toast.success("Topic updated successfully");
            loadTopics();
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTopic || communityId == null) return;
        setDeleteLoading(true);
        const res = await deleteTopic(deletingTopic.id, communityId);
        setDeleteLoading(false);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        setDeletingTopic(null);
        toast.success("Topic deleted successfully");
        loadTopics();
    };

    const handleMoveUp = async (topic: TopicRow) => {
        if (communityId == null) return;
        setMoveLoadingId(topic.id);
        const res = await moveTopicUp(topic.id, communityId);
        setMoveLoadingId(null);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Topic moved up");
        loadTopics();
    };

    const handleMoveDown = async (topic: TopicRow) => {
        if (communityId == null) return;
        setMoveLoadingId(topic.id);
        const res = await moveTopicDown(topic.id, communityId);
        setMoveLoadingId(null);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Topic moved down");
        loadTopics();
    };

    if (communityId == null) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-row items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-xl font-bold text-black">Topics</h1>
                        <p className="text-sm font-normal text-grey-600">
                            Add or Edit topics for posting inside community tab
                        </p>
                    </div>
                </div>
                <p className="text-sm text-grey-500">Loading community…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header: title + subtitle left, Add New button right (aligned with title) */}
            <div className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-xl font-bold text-black">Topics</h1>
                    <p className="text-sm font-normal text-grey-600">
                        Add or Edit topics for posting inside community tab
                    </p>
                </div>
                <Button
                    className="shrink-0 py-6 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    onClick={() => {
                        setAddOpen(true);
                        setAddNameError(null);
                    }}
                >
                    Add New
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-grey-500">Loading topics…</p>
            ) : topics.length === 0 ? (
                <p className="text-sm text-grey-500">No topics yet. Add one to get started.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {topics.map((topic, index) => {
                        const isFirst = index === 0;
                        const isLast = index === topics.length - 1;
                        const isMoving = moveLoadingId === topic.id;
                        return (
                            <li
                                key={topic.id}
                                className="flex items-center justify-between gap-4 rounded-xl bg-grey-100 px-5 py-4 border border-grey-200"
                            >
                                <div className="flex flex-1 min-w-0 items-center gap-3">
                                    <span className="font-semibold text-black truncate">{topic.name}</span>
                                    <span className="text-sm font-normal text-grey-600 shrink-0">
                                        Permission : {permissionLabel(topic.write_permission_type)}
                                    </span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0 text-grey-600 hover:text-grey-900 hover:bg-grey-200/80" disabled={isMoving}>
                                            <span className="sr-only">Open menu</span>
                                            <svg className="size-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z" stroke="#292D32" stroke-width="1.5" />
                                                <path d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z" stroke="#292D32" stroke-width="1.5" />
                                                <path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" stroke="#292D32" stroke-width="1.5" />
                                            </svg>

                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEdit(topic)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleMoveUp(topic)}
                                            disabled={isFirst || isMoving}
                                        >
                                            Move up
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleMoveDown(topic)}
                                            disabled={isLast || isMoving}
                                        >
                                            Move down
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => setDeletingTopic(topic)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Add topic dialog */}
            <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (o) setAddNameError(null); }}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Add Topic</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input
                                type="text"
                                value={addName}
                                onChange={(e) => { setAddName(e.target.value); setAddNameError(null); }}
                                placeholder="Enter topic name"
                                aria-invalid={!!addNameError}
                            />
                            {addNameError && (
                                <p className="text-sm text-destructive">{addNameError}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Write Permission Type</Label>
                            <Select
                                value={addWritePermissionType}
                                onValueChange={(v) => setAddWritePermissionType(v as TopicWritePermissionType)}
                            >
                                <SelectContent>
                                    <SelectItem value={TopicWritePermissionType.PUBLIC}>Public</SelectItem>
                                    <SelectItem value={TopicWritePermissionType.ADMINS}>Admins</SelectItem>
                                </SelectContent>
                                <SelectTrigger variant="secondary" className="w-full rounded-lg py-5">
                                    <SelectValue placeholder="Select write permission type" />
                                </SelectTrigger>
                            </Select>
                            {addWritePermissionType === TopicWritePermissionType.ADMINS && (
                                <p className="text-sm text-muted-foreground">
                                    Only admins can post or move posts to this category.
                                </p>
                            )}
                            {addWritePermissionType === TopicWritePermissionType.PUBLIC && (
                                <p className="text-sm text-muted-foreground">
                                    Members and admins can post in this Topic.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                disabled={!addName.trim()}
                                className="py-7 rounded-[16px] flex-1"
                                onClick={handleAddSubmit}
                            >
                                Add Topic
                            </Button>
                            <Button
                                className="py-7 rounded-[16px] flex-1"
                                variant="secondary"
                                onClick={() => setAddOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit topic dialog */}
            <Dialog
                open={!!editingTopic}
                onOpenChange={(o) => { if (!o) { setEditingTopic(null); setEditNameError(null); } }}
            >
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Edit Topic</DialogTitle>
                    </DialogHeader>
                    {editingTopic && (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label>Name <span className="text-destructive">*</span></Label>
                                <Input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => { setEditName(e.target.value); setEditNameError(null); }}
                                    placeholder="Enter topic name"
                                    aria-invalid={!!editNameError}
                                />
                                {editNameError && (
                                    <p className="text-sm text-destructive">{editNameError}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Write Permission Type</Label>
                                <Select
                                    value={editWritePermissionType}
                                    onValueChange={(v) => setEditWritePermissionType(v as TopicWritePermissionType)}
                                >
                                    <SelectContent>
                                        <SelectItem value={TopicWritePermissionType.PUBLIC}>Public</SelectItem>
                                        <SelectItem value={TopicWritePermissionType.ADMINS}>Admins</SelectItem>
                                    </SelectContent>
                                    <SelectTrigger variant="secondary" className="w-full rounded-lg py-5">
                                        <SelectValue placeholder="Select write permission type" />
                                    </SelectTrigger>
                                </Select>
                                {editWritePermissionType === TopicWritePermissionType.ADMINS && (
                                    <p className="text-sm text-muted-foreground">
                                        Only admins can post or move posts to this category.
                                    </p>
                                )}
                                {editWritePermissionType === TopicWritePermissionType.PUBLIC && (
                                    <p className="text-sm text-muted-foreground">
                                        Members and admins can post in this Topic.
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    disabled={!editName.trim()}
                                    className="py-7 rounded-[16px] flex-1"
                                    onClick={handleEditSubmit}
                                >
                                    Update
                                </Button>
                                <Button
                                    className="py-7 rounded-[16px] flex-1"
                                    variant="secondary"
                                    onClick={() => setEditingTopic(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingTopic} onOpenChange={(o) => { if (!o) setDeletingTopic(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete topic</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{deletingTopic?.name}&quot;? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }}
                            disabled={deleteLoading}
                            className="bg-destructive text-white rounded-md hover:bg-destructive/90"
                        >
                            {deleteLoading ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
