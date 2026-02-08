"use client";

import { useState, useEffect } from "react";
import { likePost, unlikePost } from "@/action/likes";
import SaveIcon from "@/components/icons/save";
import AccessControl from "@/components/access-control";
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import { toast } from "sonner";

interface PostLikeCommentBarProps {
    postId: number;
    communityId: number;
    likesCount: number;
    commentCount: number | null;
    initialLiked?: boolean;
}

export default function PostLikeCommentBar({ postId, communityId, likesCount, commentCount, initialLiked = false }: PostLikeCommentBarProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [isLiking, setIsLiking] = useState(false);
    const [displayLikesCount, setDisplayLikesCount] = useState(likesCount);

    useEffect(() => {
        setLiked(initialLiked);
    }, [initialLiked]);

    useEffect(() => {
        setDisplayLikesCount(likesCount);
    }, [likesCount]);

    const handleLikeClick = async () => {
        if (isLiking) return;
        const nextLiked = !liked;
        const nextCount = displayLikesCount + (nextLiked ? 1 : -1);
        setLiked(nextLiked);
        setDisplayLikesCount(nextCount);
        setIsLiking(true);
        const result = liked ? await unlikePost(postId) : await likePost(communityId, postId);
        setIsLiking(false);
        if (result.error) {
            setLiked(liked);
            setDisplayLikesCount(displayLikesCount);
            toast.error(result.message || "Failed to update like");
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <AccessControl
                    fallback={<span className="mr-1 font-medium">Likes</span>}
                    allowedStatus={[CommunityMemberStatus.ACTIVE]} allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                    <button
                        type="button"
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        className="hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {liked ? (
                            <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="#F7670E" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.47998 18.3505L10.58 20.7505C10.98 21.1505 11.88 21.3505 12.48 21.3505H16.28C17.48 21.3505 18.78 20.4505 19.08 19.2505L21.48 11.9505C21.98 10.5505 21.08 9.35046 19.58 9.35046H15.58C14.98 9.35046 14.48 8.85046 14.58 8.15046L15.08 4.95046C15.28 4.05046 14.68 3.05046 13.78 2.75046C12.98 2.45046 11.98 2.85046 11.58 3.45046L7.47998 9.55046" stroke="#48505777" strokeWidth="1.5" strokeMiterlimit="10" />
                                <path d="M2.37988 18.3484V8.54844C2.37988 7.14844 2.97988 6.64844 4.37988 6.64844H5.37988C6.77988 6.64844 7.37988 7.14844 7.37988 8.54844V18.3484C7.37988 19.7484 6.77988 20.2484 5.37988 20.2484H4.37988C2.97988 20.2484 2.37988 19.7484 2.37988 18.3484Z" stroke="#48505777" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.47998 18.3505L10.58 20.7505C10.98 21.1505 11.88 21.3505 12.48 21.3505H16.28C17.48 21.3505 18.78 20.4505 19.08 19.2505L21.48 11.9505C21.98 10.5505 21.08 9.35046 19.58 9.35046H15.58C14.98 9.35046 14.48 8.85046 14.58 8.15046L15.08 4.95046C15.28 4.05046 14.68 3.05046 13.78 2.75046C12.98 2.45046 11.98 2.85046 11.58 3.45046L7.47998 9.55046" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" />
                                <path d="M2.37988 18.3484V8.54844C2.37988 7.14844 2.97988 6.64844 4.37988 6.64844H5.37988C6.77988 6.64844 7.37988 7.14844 7.37988 8.54844V18.3484C7.37988 19.7484 6.77988 20.2484 5.37988 20.2484H4.37988C2.97988 20.2484 2.37988 19.7484 2.37988 18.3484Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </AccessControl>
                <span>{displayLikesCount}</span>
            </div>

            <div className="flex items-center gap-1">
                <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68999 8.28985 2 13.1698 2C18.0498 2 21.9998 5.68999 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13 15.2337C13 16.4237 12.56 17.5237 11.82 18.3937C10.83 19.5937 9.26 20.3637 7.5 20.3637L4.89 21.9137C4.45 22.1837 3.89 21.8137 3.95 21.3037L4.2 19.3337C2.86 18.4037 2 16.9137 2 15.2337C2 13.4737 2.94 11.9237 4.38 11.0037C5.27 10.4237 6.34 10.0938 7.5 10.0938C10.54 10.0938 13 12.3937 13 15.2337Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{commentCount ?? 0}</span>
            </div>

            <button type="button">
                <SaveIcon className="size-6" />
            </button>
        </div>
    );
}
