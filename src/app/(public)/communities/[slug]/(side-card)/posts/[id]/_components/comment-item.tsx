"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/user-avatart";
import { formatFullName } from "@/lib/utils";
import MenuDotsIcon from "@/components/icons/menu-dots";
import { Input } from "@/components/ui/input";
import { type Comment } from "./comments-list";
import { getCommentReplies, createReply, deleteComment, type CommentReply } from "@/action/posts";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { UserAccess } from "@/enums/enums";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Trash2 } from "lucide-react";
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
import AccessControl from "../../../../../../../../components/access-control";

interface CommentItemProps {
    comment: Comment;
    postId: number;
    commentsDisabled?: boolean;
    highlightedCommentId?: number;
}

function formatTimeAgo(dateString: string | null): string {
    if (!dateString) return "just now";
    try {
        // Parse the UTC date string - Supabase returns timestamps in UTC
        // If the string doesn't have a timezone indicator, treat it as UTC
        let date: Date;
        if (dateString.includes('Z') || dateString.includes('+') || dateString.match(/-\d{2}:\d{2}$/)) {
            // Already has timezone info
            date = new Date(dateString);
        } else {
            // No timezone indicator - assume UTC and append 'Z'
            date = new Date(dateString + 'Z');
        }

        // Verify the date is valid
        if (isNaN(date.getTime())) {
            return "just now";
        }

        // Use formatDistanceToNow from date-fns to get "X ago" format
        // The Date object represents the UTC time, but formatDistanceToNow compares
        // it with the current local time, giving us the correct relative time
        return formatDistanceToNow(date, { addSuffix: true }).replace(/^about /i, '');
    } catch {
        return "just now";
    }
}

type ReplyDisplay = Comment | CommentReply;

export default function CommentItem({ comment, postId, commentsDisabled = false, highlightedCommentId }: CommentItemProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const commentRef = useRef<HTMLDivElement>(null);
    const replyRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [fetchedReplies, setFetchedReplies] = useState<CommentReply[] | null>(null);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const initialReplies = comment.replies || [];
    const hasMoreReplies = comment.replies_count > 2;

    // Use fetched replies if available, otherwise use initial replies
    const allReplies: ReplyDisplay[] = fetchedReplies || initialReplies;
    const displayedReplies: ReplyDisplay[] = showAllReplies ? allReplies : initialReplies.slice(0, 2);

    // Check if this comment or any of its replies should be highlighted
    const isCommentHighlighted = highlightedCommentId === comment.id;
    const highlightedReply = highlightedCommentId && allReplies.find(reply => reply.id === highlightedCommentId);
    const isReplyHighlighted = !!highlightedReply;

    // Check if this comment should be expanded based on URL param
    useEffect(() => {
        const expandedCommentId = searchParams.get("expanded_comment_id");
        if (expandedCommentId && parseInt(expandedCommentId) === comment.id && !showAllReplies && !fetchedReplies) {
            handleShowMoreReplies();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Scroll to comment when it's expanded via URL param
    useEffect(() => {
        const expandedCommentId = searchParams.get("expanded_comment_id");
        if (expandedCommentId && parseInt(expandedCommentId) === comment.id && showAllReplies && commentRef.current) {
            // Use setTimeout to ensure DOM has updated after state changes
            setTimeout(() => {
                commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    }, [searchParams, showAllReplies, comment.id]);

    // Handle highlighted comment - if it's a reply, expand parent and scroll to it
    useEffect(() => {
        if (highlightedCommentId && isReplyHighlighted && !showAllReplies) {
            // Expand replies to show the highlighted reply
            handleShowMoreReplies();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightedCommentId, isReplyHighlighted, showAllReplies]);

    // Scroll to highlighted reply when it becomes visible
    useEffect(() => {
        if (highlightedCommentId && isReplyHighlighted && showAllReplies) {
            const replyElement = replyRefs.current.get(highlightedCommentId);
            if (replyElement) {
                setTimeout(() => {
                    replyElement.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 200);
            }
        }
    }, [highlightedCommentId, isReplyHighlighted, showAllReplies]);

    const updateUrlWithExpandedComment = (commentId: number) => {
        // Only update URL if it's different to avoid unnecessary updates
        const currentExpandedId = searchParams.get("expanded_comment_id");
        if (currentExpandedId === commentId.toString()) return;

        // Use window.history.replaceState to update URL without page reload
        const params = new URLSearchParams(window.location.search);
        params.set("expanded_comment_id", commentId.toString());
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState(null, '', newUrl);
    };

    const removeExpandedCommentFromUrl = () => {
        // Only update URL if the param exists
        if (!searchParams.get("expanded_comment_id")) return;

        // Use window.history.replaceState to update URL without page reload
        const params = new URLSearchParams(window.location.search);
        params.delete("expanded_comment_id");
        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState(null, '', newUrl);
    };

    const handleShowMoreReplies = async () => {
        if (fetchedReplies) {
            // If we already fetched replies, just show them
            setShowAllReplies(true);
            updateUrlWithExpandedComment(comment.id);
            return;
        }

        setIsLoadingReplies(true);
        try {
            const { data, error } = await getCommentReplies(comment.id);
            if (error || !data) {
                console.error("Error fetching replies:", error);
                // Fallback to showing initial replies
                setShowAllReplies(true);
            } else {
                setFetchedReplies(data);
                setShowAllReplies(true);
            }
            updateUrlWithExpandedComment(comment.id);
        } catch (error) {
            console.error("Error fetching replies:", error);
            // Fallback to showing initial replies
            setShowAllReplies(true);
            updateUrlWithExpandedComment(comment.id);
        } finally {
            setIsLoadingReplies(false);
        }
    };

    const handleReplyIconClick = async () => {
        if (commentsDisabled) return;
        // If replies are collapsed and there are more than 2, expand them first
        if (!showAllReplies && hasMoreReplies) {
            await handleShowMoreReplies();
        } else if (!showAllReplies) {
            // Even if there are 2 or fewer replies, expand to show the input
            setShowAllReplies(true);
            updateUrlWithExpandedComment(comment.id);
        }
        // Show the reply input
        setShowReplyInput(true);
    };

    const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!replyContent.trim()) return;

        const content = replyContent.trim();
        setReplyContent("");

        // Get current user data for optimistic update
        const supabase = createSupabaseBrowserClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            console.error("User not authenticated");
            return;
        }

        const { data: userData } = await supabase
            .from("users")
            .select("id, username, avatar_url, first_name, last_name")
            .eq("id", authUser.id)
            .single();

        if (!userData) {
            console.error("User data not found");
            return;
        }

        // Create optimistic reply
        const optimisticReply: CommentReply = {
            id: Date.now(), // Temporary ID
            post_id: postId,
            author_id: userData.id,
            content: content,
            reply_to_comment_id: comment.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            users: {
                id: userData.id,
                username: userData.username || "",
                avatar_url: userData.avatar_url,
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
            },
        };

        // Optimistically add reply to state
        // If we have fetched replies, add to them
        // Otherwise, initialize fetchedReplies with initial replies + new reply
        if (fetchedReplies) {
            setFetchedReplies([...fetchedReplies, optimisticReply]);
        } else {
            // Convert initial replies to CommentReply format and add new reply
            const initialRepliesAsCommentReply: CommentReply[] = initialReplies.map(reply => ({
                id: reply.id,
                post_id: reply.post_id,
                author_id: reply.author_id,
                content: reply.content,
                reply_to_comment_id: reply.reply_to_comment_id,
                created_at: reply.created_at,
                updated_at: reply.updated_at,
                users: reply.users,
            }));
            setFetchedReplies([...initialRepliesAsCommentReply, optimisticReply]);
        }

        // Ensure replies are shown
        if (!showAllReplies) {
            setShowAllReplies(true);
        }

        // Submit the reply
        startTransition(async () => {
            const formData = new FormData();
            formData.append("comment_id", comment.id.toString());
            formData.append("post_id", postId.toString());
            formData.append("reply_content", content);

            await createReply(formData);

            // Refresh replies to get the actual reply from server
            try {
                const { data, error } = await getCommentReplies(comment.id);
                if (!error && data) {
                    setFetchedReplies(data);
                }
            } catch (error) {
                console.error("Error refreshing replies:", error);
            }
        });

        setShowReplyInput(false);
    };

    const handleCopyLink = (options: { highlightedId: number; expandedId: number }) => {
        // Extract slug from pathname: /communities/[slug]/posts/[id]
        const pathParts = pathname.split('/');
        const slugIndex = pathParts.indexOf('communities') + 1;
        const slug = pathParts[slugIndex];

        const params = new URLSearchParams();
        params.set("expanded_comment_id", String(options.expandedId));
        params.set("highlighted_comment_id", String(options.highlightedId));
        const commentUrl = `${window.location.origin}/communities/${slug}/posts/${postId}?${params.toString()}`;
        navigator.clipboard.writeText(commentUrl);
        toast.success("Link copied");
    };

    const openDeleteDialog = (commentId: number) => {
        setDeleteTargetId(commentId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;

        setIsDeleting(true);
        const toastId = toast.loading("Deleting...");

        try {
            const { error, message } = await deleteComment(deleteTargetId);
            if (error) {
                console.error("Error deleting comment:", error);
                toast.error(message || "Failed to delete", { id: toastId });
                return;
            }

            toast.success("Comment deleted", { id: toastId });
            setDeleteDialogOpen(false);
            setDeleteTargetId(null);
            router.refresh();
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div ref={commentRef} className="flex items-start gap-2">
                <UserAvatar className="w-11 h-11 rounded-[14px]" user={comment.users} />
                <div className="w-full space-y-3">
                    <div className={`rounded-lg p-2 w-full ${isCommentHighlighted ? 'bg-orange-50' : 'bg-grey-200'}`}>
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${comment.users.username}`} className="font-semibold hover:underline">
                                {formatFullName(comment.users.first_name, comment.users.last_name)}
                            </Link>
                            <span className="text-sm text-grey-600 font-medium">
                                {formatTimeAgo(comment.created_at)}
                            </span>
                        </div>
                        <p className="text-sm text-grey-700 mt-1 font-medium w-full">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-5 text-grey-700 font-medium">
                        <div className="flex items-center gap-1">
                            <svg className="size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.47998 18.3505L10.58 20.7505C10.98 21.1505 11.88 21.3505 12.48 21.3505H16.28C17.48 21.3505 18.78 20.4505 19.08 19.2505L21.48 11.9505C21.98 10.5505 21.08 9.35046 19.58 9.35046H15.58C14.98 9.35046 14.48 8.85046 14.58 8.15046L15.08 4.95046C15.28 4.05046 14.68 3.05046 13.78 2.75046C12.98 2.45046 11.98 2.85046 11.58 3.45046L7.47998 9.55046" stroke="#485057" strokeWidth="1.5" strokeMiterlimit="10" />
                                <path d="M2.37988 18.3484V8.54844C2.37988 7.14844 2.97988 6.64844 4.37988 6.64844H5.37988C6.77988 6.64844 7.37988 7.14844 7.37988 8.54844V18.3484C7.37988 19.7484 6.77988 20.2484 5.37988 20.2484H4.37988C2.97988 20.2484 2.37988 19.7484 2.37988 18.3484Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>0</span>
                        </div>

                        {!commentsDisabled && (
                            <button
                                onClick={handleReplyIconClick}
                                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                            >
                                <svg className="size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68999 8.28985 2 13.1698 2C18.0498 2 21.9998 5.68999 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13 15.2337C13 16.4237 12.56 17.5237 11.82 18.3937C10.83 19.5937 9.26 20.3637 7.5 20.3637L4.89 21.9137C4.45 22.1837 3.89 21.8137 3.95 21.3037L4.2 19.3337C2.86 18.4037 2 16.9137 2 15.2337C2 13.4737 2.94 11.9237 4.38 11.0037C5.27 10.4237 6.34 10.0938 7.5 10.0938C10.54 10.0938 13 12.3937 13 15.2337Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>
                                    {comment.replies_count}
                                </span>
                            </button>
                        )}
                        {commentsDisabled && (
                            <div className="flex items-center gap-1 opacity-50 cursor-not-allowed">
                                <svg className="size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68999 8.28985 2 13.1698 2C18.0498 2 21.9998 5.68999 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13 15.2337C13 16.4237 12.56 17.5237 11.82 18.3937C10.83 19.5937 9.26 20.3637 7.5 20.3637L4.89 21.9137C4.45 22.1837 3.89 21.8137 3.95 21.3037L4.2 19.3337C2.86 18.4037 2 16.9137 2 15.2337C2 13.4737 2.94 11.9237 4.38 11.0037C5.27 10.4237 6.34 10.0938 7.5 10.0938C10.54 10.0938 13 12.3937 13 15.2337Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>
                                    {comment.replies_count}
                                </span>
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hover:opacity-70 transition-opacity">
                                    <MenuDotsIcon className="size-6" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleCopyLink({
                                            highlightedId: comment.id,
                                            expandedId: comment.id,
                                        })
                                    }
                                    className="cursor-pointer"
                                >
                                    <Copy className="size-4 mr-2" />
                                    Copy link
                                </DropdownMenuItem>
                                <AccessControl
                                    allowedAccess={[UserAccess.ADMIN, UserAccess.OWNER]}
                                    allowedUserId={comment.author_id}
                                >
                                    <DropdownMenuItem
                                        onClick={() => openDeleteDialog(comment.id)}
                                        variant="destructive"
                                        className="cursor-pointer"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="size-4 mr-2" />
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </DropdownMenuItem>
                                </AccessControl>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Replies */}
                    {(initialReplies.length > 0 || (showAllReplies && allReplies.length > 0) || showReplyInput) && (
                        <div className="flex flex-col gap-3 border-grey-200">
                            {displayedReplies.map((reply) => {
                                const isThisReplyHighlighted = highlightedCommentId === reply.id;
                                return (
                                    <div
                                        key={reply.id}
                                        ref={(el) => {
                                            if (el) {
                                                replyRefs.current.set(reply.id, el);
                                            } else {
                                                replyRefs.current.delete(reply.id);
                                            }
                                        }}
                                        className="flex items-start gap-2"
                                    >
                                        <UserAvatar className="w-9 h-9 rounded-[12px]" user={reply.users} />
                                        <div className="w-full space-y-2">
                                            <div className={`w-full space-y-2 rounded-lg p-2 ${isThisReplyHighlighted ? 'bg-orange-50' : 'bg-grey-200'}`}>
                                                <div className={`rounded-lg w-full ${isThisReplyHighlighted ? 'bg-orange-50' : 'bg-grey-100'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/profile/${reply.users.username}`} className="font-semibold hover:underline">
                                                            {formatFullName(reply.users.first_name, reply.users.last_name)}
                                                        </Link>
                                                        <span className="text-sm text-grey-600 font-medium">
                                                            {formatTimeAgo(reply.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-grey-700 mt-1 font-medium w-full">{reply.content}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5 text-grey-700 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <svg className="size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7.47998 18.3505L10.58 20.7505C10.98 21.1505 11.88 21.3505 12.48 21.3505H16.28C17.48 21.3505 18.78 20.4505 19.08 19.2505L21.48 11.9505C21.98 10.5505 21.08 9.35046 19.58 9.35046H15.58C14.98 9.35046 14.48 8.85046 14.58 8.15046L15.08 4.95046C15.28 4.05046 14.68 3.05046 13.78 2.75046C12.98 2.45046 11.98 2.85046 11.58 3.45046L7.47998 9.55046" stroke="#485057" strokeWidth="1.5" strokeMiterlimit="10" />
                                                        <path d="M2.37988 18.3484V8.54844C2.37988 7.14844 2.97988 6.64844 4.37988 6.64844H5.37988C6.77988 6.64844 7.37988 7.14844 7.37988 8.54844V18.3484C7.37988 19.7484 6.77988 20.2484 5.37988 20.2484H4.37988C2.97988 20.2484 2.37988 19.7484 2.37988 18.3484Z" stroke="#485057" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span>0</span>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="hover:opacity-70 transition-opacity">
                                                            <MenuDotsIcon className="size-6" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleCopyLink({
                                                                    highlightedId: reply.id,
                                                                    expandedId: reply.reply_to_comment_id ?? comment.id,
                                                                })
                                                            }
                                                            className="cursor-pointer"
                                                        >
                                                            <Copy className="size-4 mr-2" />
                                                            Copy link
                                                        </DropdownMenuItem>
                                                        <AccessControl
                                                            allowedAccess={[UserAccess.ADMIN, UserAccess.OWNER]}
                                                            allowedUserId={reply.author_id}
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteDialog(reply.id)}
                                                                variant="destructive"
                                                                className="cursor-pointer"
                                                                disabled={isDeleting}
                                                            >
                                                                <Trash2 className="size-4 mr-2" />
                                                                {isDeleting ? "Deleting..." : "Delete"}
                                                            </DropdownMenuItem>
                                                        </AccessControl>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Show more button */}
                            {hasMoreReplies && !showAllReplies && (
                                <button
                                    onClick={handleShowMoreReplies}
                                    disabled={isLoadingReplies}
                                    className="text-sm text-orange-500 font-medium hover:underline self-start disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingReplies
                                        ? "Loading..."
                                        : `Show ${comment.replies_count - displayedReplies.length} more ${comment.replies_count - displayedReplies.length === 1 ? 'reply' : 'replies'}`
                                    }
                                </button>
                            )}


                            {!commentsDisabled && (
                                <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                                    {/* Reply input - visible when expanded or when showReplyInput is true */}
                                    {(showAllReplies || showReplyInput) && (
                                        <form
                                            onSubmit={handleReplySubmit}
                                            className="flex items-start gap-2"
                                        >
                                            <div className="flex-1">
                                                <Input
                                                    type="text"
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="Add a reply"
                                                    className="h-9 md:text-sm w-full text-xs"
                                                    maxLength={500}
                                                    autoFocus={showReplyInput}
                                                    disabled={isPending}
                                                />
                                            </div>
                                        </form>
                                    )}
                                </AccessControl>
                            )}
                        </div>
                    )}


                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
