"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import AccessControl from "@/components/access-control";
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import { toast } from "sonner";
import { Pin } from "lucide-react";
import { Tables } from "@/database.types";
import ChangeTopicModal from "../../_components/change-topic-modal";
import ToggleCommentsModal from "../../_components/toggle-comments-modal";
import DeletePostModal from "../../_components/delete-post-modal";
import EditPostModal from "../../_components/edit-post-modal";
import { togglePinPost, toggleCommentsDisabled, deletePost } from "@/action/posts";
import { banUserFromCommunity } from "@/action/members";
import { UserData } from "@/utils/get-user-data";
import { formatFullName } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PostActionsDropdownProps {
    post: {
        id: number;
        author_id: string;
        community_id: number;
        topic_id: number | null;
        comments_disabled?: boolean;
        is_pinned?: boolean;
        title?: string;
        content?: string;
        video_url?: string | null;
        attachments?: Array<{ id: number; type: string; url: string; name: string }>;
        poll?: { id: number; poll_options?: Array<{ id: number; text: string }> } | null;
        author_first_name?: string;
        author_last_name?: string;
    };
    topics: Tables<"topics">[];
    slug: string;
    user?: UserData | null;
}

export default function PostActionsDropdown({ post, topics, slug, user }: PostActionsDropdownProps) {
    const router = useRouter();
    const [changeTopicModalOpen, setChangeTopicModalOpen] = useState(false);
    const [toggleCommentsModalOpen, setToggleCommentsModalOpen] = useState(false);
    const [isTogglingComments, setIsTogglingComments] = useState(false);
    const [deletePostModalOpen, setDeletePostModalOpen] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [editPostModalOpen, setEditPostModalOpen] = useState(false);
    const [banUserModalOpen, setBanUserModalOpen] = useState(false);
    const [isBanningUser, setIsBanningUser] = useState(false);

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const postUrl = `${window.location.origin}/communities/${slug}/posts/${post.id}`;
        try {
            await navigator.clipboard.writeText(postUrl);
            toast.success("Link copied to clipboard");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const handleTogglePin = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await togglePinPost(post.id);
        if (result.error) {
            toast.error(result.message || "Failed to toggle pin status");
        } else {
            toast.success(result.message || (result.data?.is_pinned ? "Post pinned" : "Post unpinned"));
            router.refresh();
        }
    };

    const handleChangeTopic = (e: React.MouseEvent) => {
        e.stopPropagation();
        setChangeTopicModalOpen(true);
    };

    const handleToggleCommentsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setToggleCommentsModalOpen(true);
    };

    const handleConfirmToggleComments = async () => {
        setIsTogglingComments(true);
        const result = await toggleCommentsDisabled(post.id);
        setIsTogglingComments(false);

        if (result.error) {
            toast.error(result.message || "Failed to toggle comments");
        } else {
            toast.success(result.message || (post.comments_disabled ? "Comments enabled" : "Comments disabled"));
            router.refresh();
        }
        setToggleCommentsModalOpen(false);
    };

    const handleDeletePostClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletePostModalOpen(true);
    };

    const handleEditPostClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditPostModalOpen(true);
    };

    const handleConfirmDeletePost = async () => {
        setIsDeletingPost(true);
        const result = await deletePost(post.id);
        setIsDeletingPost(false);

        if (result.error) {
            toast.error(result.message || "Failed to delete post");
            setDeletePostModalOpen(false);
        } else {
            toast.success(result.message || "Post deleted successfully");
            router.push(`/communities/${slug}/posts`);
        }
    };

    const handleBanUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setBanUserModalOpen(true);
    };

    const handleConfirmBanUser = async () => {
        setIsBanningUser(true);
        const result = await banUserFromCommunity(post.community_id, post.author_id);
        setIsBanningUser(false);
        setBanUserModalOpen(false);
        if (result.error) {
            toast.error(result.message || "Failed to ban user");
        } else {
            toast.success(result.message || "User banned successfully");
            router.refresh();
        }
    };

    return (
        <>
            <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                {post.is_pinned && (
                    <div className="flex items-center justify-center">
                        <Pin className="size-4 text-orange-500" />
                    </div>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10Z" stroke="#292D32" strokeWidth="1.5" />
                                <path d="M19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10Z" stroke="#292D32" strokeWidth="1.5" />
                                <path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" stroke="#292D32" strokeWidth="1.5" />
                            </svg>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleCopyLink}>
                            Copy Link
                        </DropdownMenuItem>
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                            <DropdownMenuItem onClick={handleTogglePin}>
                                {post.is_pinned ? "Unpin Post" : "Pin Post"}
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]} allowedUserId={post.author_id}>
                            <DropdownMenuItem onClick={handleEditPostClick}>
                                Edit post
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]} allowedUserId={post.author_id}>
                            <DropdownMenuItem onClick={handleChangeTopic}>
                                Change Topic
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]} allowedUserId={post.author_id}>
                            <DropdownMenuItem onClick={handleToggleCommentsClick}>
                                {post.comments_disabled ? "Turn on comments" : "Turn off comments"}
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.MEMBER]} allowedStatus={[CommunityMemberStatus.ACTIVE]}>
                            <DropdownMenuItem>
                                Report to admins
                            </DropdownMenuItem>
                        </AccessControl>
                        <DropdownMenuSeparator />
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]} allowedUserId={post.author_id}>
                            <DropdownMenuItem variant="destructive" onClick={handleDeletePostClick}>
                                Delete post
                            </DropdownMenuItem>
                        </AccessControl>
                        {user?.id !== post.author_id && (
                            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                                <DropdownMenuItem variant="destructive" onClick={handleBanUserClick}>
                                    Ban user
                                </DropdownMenuItem>
                            </AccessControl>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ChangeTopicModal
                open={changeTopicModalOpen}
                onOpenChange={setChangeTopicModalOpen}
                postId={post.id}
                currentTopicId={post.topic_id}
                topics={topics}
            />
            <ToggleCommentsModal
                open={toggleCommentsModalOpen}
                onOpenChange={setToggleCommentsModalOpen}
                onConfirm={handleConfirmToggleComments}
                commentsDisabled={post.comments_disabled || false}
                isSubmitting={isTogglingComments}
            />
            <DeletePostModal
                open={deletePostModalOpen}
                onOpenChange={setDeletePostModalOpen}
                onConfirm={handleConfirmDeletePost}
                isSubmitting={isDeletingPost}
            />
            {user && (
                <EditPostModal
                    open={editPostModalOpen}
                    onOpenChange={setEditPostModalOpen}
                    post={{
                        id: post.id,
                        title: post.title ?? "",
                        content: post.content ?? "",
                        topic_id: post.topic_id,
                        video_url: post.video_url ?? null,
                        attachments: post.attachments ?? [],
                        poll: post.poll ?? null,
                    }}
                    topics={topics}
                    user={user}
                />
            )}
            <AlertDialog open={banUserModalOpen} onOpenChange={setBanUserModalOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ban User From Community?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to ban {post.author_first_name && post.author_last_name ? formatFullName(post.author_first_name, post.author_last_name) : "this user"} from this community? They will be removed and unable to re-join.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBanningUser}>Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmBanUser}
                            disabled={isBanningUser}
                        >
                            {isBanningUser ? "Banning…" : "Ban"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
