"use client";

import { useState, useTransition, useEffect } from "react";
import CommentItem from "./comment-item";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { getCommentWithReplies } from "@/action/posts";

export type CommentUser = {
    id: string;
    username: string;
    avatar_url: string | null;
    first_name: string;
    last_name: string;
};

export type Comment = {
    id: number;
    post_id: number;
    author_id: string;
    content: string;
    reply_to_comment_id: number | null;
    created_at: string;
    updated_at: string;
    likes_count?: number;
    is_liked?: boolean | null;
    users: CommentUser;
    replies_count: number;
    replies?: Comment[];
};

interface CommentsListProps {
    comments: Comment[] | null;
    postId: number;
    communityId: number;
    userId?: string | null;
    commentCount: number | null;
    commentsDisabled?: boolean;
    extraExpandedCommentId?: number | undefined;
    highlightedCommentId?: number | undefined;
}

export default function CommentsList({ comments: initialComments, postId, communityId, userId, commentCount, commentsDisabled = false, extraExpandedCommentId = undefined, highlightedCommentId = undefined }: CommentsListProps) {
    const [comments, setComments] = useState<Comment[] | null>(initialComments);
    const [loadedCount, setLoadedCount] = useState(initialComments?.length || 0);
    const [isLoadingMore, startTransition] = useTransition();

    // Sync state when initialComments changes (e.g., when a new comment is added)
    useEffect(() => {
        setLoadedCount(initialComments?.length || 0);
        
        if (extraExpandedCommentId) {
            // Check if the comment is already in the list
            const commentExists = initialComments?.some(c => c.id === extraExpandedCommentId);
            
            if (!commentExists) {
                // Fetch the comment with replies and append it to the list
                startTransition(async () => {
                    const { data, error } = await getCommentWithReplies(extraExpandedCommentId);
                    if (!error && data) {
                        // Transform to match Comment type
                        const comment: Comment = {
                            ...data,
                            replies: data.replies?.map(reply => ({
                                ...reply,
                                replies: undefined, // Replies don't have nested replies
                            })),
                        };
                        // Append the fetched comment to the existing comments
                        setComments([...(initialComments || []), comment]);
                        setLoadedCount(prev => prev + 1);
                    } else {
                        // If error, just set the initial comments
                        setComments(initialComments);
                    }
                });
            } else {
                setComments(initialComments);
            }
        }
        else {
            setComments(initialComments);
        }
    }, [initialComments, extraExpandedCommentId]);

    // Only show "show more" if there are more than 20 comments AND we haven't loaded all of them
    const hasMoreComments = commentCount !== null && commentCount > 20 && loadedCount < commentCount;

    const loadMoreComments = async () => {
        if (isLoadingMore || !hasMoreComments) return;

        startTransition(async () => {
            const supabase = createSupabaseBrowserClient();
            
            // Fetch more comments using RPC with offset
            const { data: newCommentsData, error: commentsError } = await supabase.rpc("get_comments", {
                p_post_id: postId,
                p_comments_limit: 20,
                p_replies_limit: 2,
                p_comments_offset: loadedCount,
                p_user_id: userId ?? undefined,
            });

            if (commentsError || !newCommentsData) {
                console.error("Error loading more comments:", commentsError);
                setLoadedCount(commentCount || loadedCount);
                return;
            }

            // RPC returns JSON; keep a small runtime guard for safety
            const newComments: Comment[] = Array.isArray(newCommentsData)
                ? (newCommentsData as Comment[])
                : [];

            if (newComments.length === 0) {
                setLoadedCount(commentCount || loadedCount);
                return;
            }

            setComments([...(comments || []), ...newComments]);
            setLoadedCount(prev => prev + newComments.length);
        });
    };

    if (!comments || comments.length === 0) {
        return (
            <div className="text-sm text-grey-600 font-medium">No comments yet</div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} postId={postId} communityId={communityId} commentsDisabled={commentsDisabled} highlightedCommentId={highlightedCommentId} />
            ))}

            {hasMoreComments && (
                <button
                    onClick={loadMoreComments}
                    disabled={isLoadingMore}
                    className="text-sm text-orange-500 font-medium hover:underline self-start disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingMore 
                        ? "Loading..." 
                        : `Show ${Math.min(20, (commentCount || 0) - loadedCount)} more comments`
                    }
                </button>
            )}
        </div>
    );
}
