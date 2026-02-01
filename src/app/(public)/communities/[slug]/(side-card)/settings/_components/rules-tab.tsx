"use client";

import {
    createRule,
    getRules,
    updateRule,
    deleteRule,
    moveRuleUp,
    moveRuleDown,
} from "@/action/rules";
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

const RULE_MAX_LENGTH = 30;

type RuleRow = Tables<"community_rules">;

interface RulesTabProps {
    communityId: number;
    slug: string;
}

export function RulesTab({ communityId: communityIdProp, slug }: RulesTabProps) {
    const [communityId, setCommunityId] = useState<number | null>(null);
    const [rules, setRules] = useState<RuleRow[]>([]);
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
    const [addRuleText, setAddRuleText] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    const [editingRule, setEditingRule] = useState<RuleRow | null>(null);
    const [editRuleText, setEditRuleText] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const [deletingRule, setDeletingRule] = useState<RuleRow | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [moveLoadingId, setMoveLoadingId] = useState<number | null>(null);

    const loadRules = async () => {
        if (communityId == null) return;
        setLoading(true);
        const res = await getRules(communityId);
        setLoading(false);
        if (res.error || !res.data) {
            toast.error(res.error ?? "Failed to load rules");
            return;
        }
        const sorted = [...res.data].sort((a, b) => a.index - b.index);
        setRules(sorted);
    };

    useEffect(() => {
        if (communityId != null) loadRules();
    }, [communityId]);

    const handleAddSubmit = async () => {
        if (communityId == null) return;
        const trimmed = addRuleText.trim();
        if (!trimmed) {
            toast.error("Rule is required");
            return;
        }
        if (trimmed.length > RULE_MAX_LENGTH) {
            toast.error(`Rule must be at most ${RULE_MAX_LENGTH} characters`);
            return;
        }
        setAddLoading(true);
        const res = await createRule(communityId, trimmed);
        setAddLoading(false);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        if (res.data) {
            setAddRuleText("");
            setAddOpen(false);
            toast.success("Rule added successfully");
            loadRules();
        }
    };

    const openEdit = (rule: RuleRow) => {
        setEditingRule(rule);
        setEditRuleText(rule.rule);
    };

    const handleEditSubmit = async () => {
        if (!editingRule || communityId == null) return;
        const trimmed = editRuleText.trim();
        if (!trimmed) {
            toast.error("Rule is required");
            return;
        }
        if (trimmed.length > RULE_MAX_LENGTH) {
            toast.error(`Rule must be at most ${RULE_MAX_LENGTH} characters`);
            return;
        }
        setEditLoading(true);
        const res = await updateRule(editingRule.id, communityId, trimmed);
        setEditLoading(false);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        if (res.data) {
            setEditingRule(null);
            toast.success("Rule updated successfully");
            loadRules();
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingRule || communityId == null) return;
        setDeleteLoading(true);
        const res = await deleteRule(deletingRule.id, communityId);
        setDeleteLoading(false);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        setDeletingRule(null);
        toast.success("Rule deleted successfully");
        loadRules();
    };

    const handleMoveUp = async (rule: RuleRow) => {
        if (communityId == null) return;
        setMoveLoadingId(rule.id);
        const res = await moveRuleUp(rule.id, communityId);
        setMoveLoadingId(null);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Rule moved up");
        loadRules();
    };

    const handleMoveDown = async (rule: RuleRow) => {
        if (communityId == null) return;
        setMoveLoadingId(rule.id);
        const res = await moveRuleDown(rule.id, communityId);
        setMoveLoadingId(null);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success("Rule moved down");
        loadRules();
    };

    if (communityId == null) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-row items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-xl font-bold text-black">
                            Community Rules
                        </h1>
                        <p className="text-sm font-normal text-grey-600">
                            Add rules for Posting, commenting and discussion
                            inside community tab.
                        </p>
                    </div>
                </div>
                <p className="text-sm text-grey-500">Loading community…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-xl font-bold text-black">
                        Community Rules
                    </h1>
                    <p className="text-sm font-normal text-grey-600">
                        Add rules for Posting, commenting and discussion inside
                        community tab.
                    </p>
                </div>
                <Button
                    className="shrink-0 py-6 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    onClick={() => {
                        setAddOpen(true);
                        setAddRuleText("");
                    }}
                >
                    Add New
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-grey-500">Loading rules…</p>
            ) : rules.length === 0 ? (
                <p className="text-sm text-grey-500">
                    No rules yet. Add one to get started.
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {rules.map((rule, index) => {
                        const isFirst = index === 0;
                        const isLast = index === rules.length - 1;
                        const isMoving = moveLoadingId === rule.id;
                        return (
                            <li
                                key={rule.id}
                                className="flex items-center justify-between gap-4 rounded-xl bg-grey-100 px-5 py-4 border border-grey-200"
                            >
                                <span className="font-semibold text-black truncate flex-1 min-w-0">
                                    {rule.rule}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-grey-600 hover:text-grey-900 hover:bg-grey-200/80"
                                            disabled={isMoving}
                                        >
                                            <span className="sr-only">
                                                Open menu
                                            </span>
                                            <svg
                                                className="size-6"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => openEdit(rule)}
                                        >
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleMoveUp(rule)}
                                            disabled={isFirst || isMoving}
                                        >
                                            Move up
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleMoveDown(rule)
                                            }
                                            disabled={isLast || isMoving}
                                        >
                                            Move down
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                setDeletingRule(rule)
                                            }
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

            {/* Add Rule dialog */}
            <Dialog
                open={addOpen}
                onOpenChange={(o) => {
                    setAddOpen(o);
                    if (!o) setAddRuleText("");
                }}
            >
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Add Rule</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <label
                                    htmlFor="add-rule-input"
                                    className="text-sm font-medium text-grey-700"
                                >
                                    Rule
                                </label>
                                <span className="text-sm text-grey-500">
                                    {addRuleText.length}/{RULE_MAX_LENGTH}
                                </span>
                            </div>
                            <Input
                                id="add-rule-input"
                                type="text"
                                value={addRuleText}
                                onChange={(e) =>
                                    setAddRuleText(
                                        e.target.value.slice(0, RULE_MAX_LENGTH)
                                    )
                                }
                                placeholder="Rule"
                                className="rounded-lg bg-grey-100"
                                maxLength={RULE_MAX_LENGTH}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                disabled={
                                    !addRuleText.trim() || addLoading
                                }
                                className="py-7 rounded-[16px] flex-1 bg-orange-500 hover:bg-orange-600"
                                onClick={handleAddSubmit}
                            >
                                {addLoading ? "Adding…" : "Add"}
                            </Button>
                            <Button
                                className="py-7 rounded-[16px] flex-1"
                                variant="secondary"
                                onClick={() => setAddOpen(false)}
                                disabled={addLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Rule dialog */}
            <Dialog
                open={!!editingRule}
                onOpenChange={(o) => {
                    if (!o) {
                        setEditingRule(null);
                        setEditRuleText("");
                    }
                }}
            >
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Edit Rule</DialogTitle>
                    </DialogHeader>
                    {editingRule && (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <label
                                        htmlFor="edit-rule-input"
                                        className="text-sm font-medium text-grey-700"
                                    >
                                        Rule
                                    </label>
                                    <span className="text-sm text-grey-500">
                                        {editRuleText.length}/{RULE_MAX_LENGTH}
                                    </span>
                                </div>
                                <Input
                                    id="edit-rule-input"
                                    type="text"
                                    value={editRuleText}
                                    onChange={(e) =>
                                        setEditRuleText(
                                            e.target.value.slice(
                                                0,
                                                RULE_MAX_LENGTH
                                            )
                                        )
                                    }
                                    placeholder="Rule"
                                    className="rounded-lg bg-grey-100"
                                    maxLength={RULE_MAX_LENGTH}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    disabled={
                                        !editRuleText.trim() || editLoading
                                    }
                                    className="py-7 rounded-[16px] flex-1 bg-orange-500 hover:bg-orange-600"
                                    onClick={handleEditSubmit}
                                >
                                    {editLoading ? "Updating…" : "Update"}
                                </Button>
                                <Button
                                    className="py-7 rounded-[16px] flex-1"
                                    variant="secondary"
                                    onClick={() => {
                                        setEditingRule(null);
                                        setEditRuleText("");
                                    }}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog
                open={!!deletingRule}
                onOpenChange={(o) => {
                    if (!o) setDeletingRule(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete rule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete
                            &quot;{deletingRule?.rule}&quot;? This cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteConfirm();
                            }}
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
