"use client";
import { PostList, togglePinPost } from "@/action/posts";
import CommentIcon from "@/components/icons/comment";
import LikeIcon from "@/components/icons/like";
import SaveIcon from "@/components/icons/save";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatart";
import VideoEmbed from "@/components/video-embed";
import VideoThumbnail from "@/components/video-thumbnail";
import { formatFullName } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
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
import { UserAccess } from "@/enums/enums";
import { toast } from "sonner";
import { Pin } from "lucide-react";
import { useState } from "react";
import { Tables } from "@/database.types";
import ChangeTopicModal from "./change-topic-modal";
import ToggleCommentsModal from "./toggle-comments-modal";
import DeletePostModal from "./delete-post-modal";
import { toggleCommentsDisabled, deletePost } from "@/action/posts";

export default function PostCard({ post, topics }: { post: PostList; topics: Tables<"topics">[] }) {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const [changeTopicModalOpen, setChangeTopicModalOpen] = useState(false);
    const [toggleCommentsModalOpen, setToggleCommentsModalOpen] = useState(false);
    const [isTogglingComments, setIsTogglingComments] = useState(false);
    const [deletePostModalOpen, setDeletePostModalOpen] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);

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
            toast.success(result.message || ((post as any).comments_disabled ? "Comments enabled" : "Comments disabled"));
            router.refresh();
        }
        setToggleCommentsModalOpen(false);
    };

    const handleDeletePostClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletePostModalOpen(true);
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

    const handleCardClick = () => {
        // Don't navigate if any modal is open
        if (changeTopicModalOpen || toggleCommentsModalOpen || deletePostModalOpen) {
            return;
        }
        router.push(`/communities/${slug}/posts/${post.id}`);
    };

    return (
        <Card key={post.id} className="shadow-none border-grey-200 px-6 flex flex-row gap-4 justify-between cursor-pointer hover:shadow-sm transition-all duration-300 relative"
            onClick={handleCardClick}
        >
            <div className="flex flex-col gap-4 justify-between">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${post.users.username}`}>
                            <UserAvatar className="w-11 h-11 rounded-[16px]" user={post.users} />
                        </Link>
                        <div className="flex flex-col gap-0.5 items-start text-base font-medium">
                            <Link href={`/profile/${post.users.username}`} className="font-semibold hover:underline">
                                {formatFullName(post.users.first_name, post.users.last_name)}
                            </Link>
                            <span className="text-grey-700 text-sm font-medium">
                                {format(new Date(post.created_at), "MMM d, yyyy")} | {topics.find((t) => t.id === post.topic_id)?.name ?? ""}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-grey-600 font-medium line-clamp-2">{post.content}</p>
                    </div>

                    {post.poll && (
                        <div className="w-fit text-sm font-medium text-orange-500 bg-orange-50 rounded-full px-2 py-1 flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_36878_5161)">
                                    <path d="M1.3335 14.6693H14.6668M6.00016 5.73594C6.00016 5.45304 5.88778 5.18173 5.68774 4.98169C5.4877 4.78165 5.21639 4.66927 4.9335 4.66927H3.06683C2.78393 4.66927 2.51262 4.78165 2.31258 4.98169C2.11254 5.18173 2.00016 5.45304 2.00016 5.73594V14.6693M6.00016 14.6693V2.4026C6.00016 2.11971 6.11254 1.8484 6.31258 1.64836C6.51262 1.44832 6.78393 1.33594 7.06683 1.33594H8.9335C9.21639 1.33594 9.4877 1.44832 9.68774 1.64836C9.88778 1.8484 10.0002 2.11971 10.0002 2.4026V14.6693M14.0002 14.6693V9.06927C14.0002 8.78637 13.8878 8.51506 13.6877 8.31502C13.4877 8.11498 13.2164 8.0026 12.9335 8.0026H11.0668C10.7839 8.0026 10.5126 8.11498 10.3126 8.31502C10.1125 8.51506 10.0002 8.78637 10.0002 9.06927" stroke="#F7670E" strokeWidth="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_36878_5161">
                                        <rect width="16" height="16" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            Poll
                        </div>
                    )}

                </div>

                <div className="flex items-center gap-4">

                    <div className="flex items-center gap-1">
                        <button>
                            <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.47998 18.3505L10.58 20.7505C10.98 21.1505 11.88 21.3505 12.48 21.3505H16.28C17.48 21.3505 18.78 20.4505 19.08 19.2505L21.48 11.9505C21.98 10.5505 21.08 9.35046 19.58 9.35046H15.58C14.98 9.35046 14.48 8.85046 14.58 8.15046L15.08 4.95046C15.28 4.05046 14.68 3.05046 13.78 2.75046C12.98 2.45046 11.98 2.85046 11.58 3.45046L7.47998 9.55046" stroke="#292D32" strokeWidth="1.5" stroke-miterlimit="10" />
                                <path d="M2.37988 18.3484V8.54844C2.37988 7.14844 2.97988 6.64844 4.37988 6.64844H5.37988C6.77988 6.64844 7.37988 7.14844 7.37988 8.54844V18.3484C7.37988 19.7484 6.77988 20.2484 5.37988 20.2484H4.37988C2.97988 20.2484 2.37988 19.7484 2.37988 18.3484Z" stroke="#292D32" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <span>0</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button>
                            <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68999 8.28985 2 13.1698 2C18.0498 2 21.9998 5.68999 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z" stroke="#292D32" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M13 15.2337C13 16.4237 12.56 17.5237 11.82 18.3937C10.83 19.5937 9.26 20.3637 7.5 20.3637L4.89 21.9137C4.45 22.1837 3.89 21.8137 3.95 21.3037L4.2 19.3337C2.86 18.4037 2 16.9137 2 15.2337C2 13.4737 2.94 11.9237 4.38 11.0037C5.27 10.4237 6.34 10.0938 7.5 10.0938C10.54 10.0938 13 12.3937 13 15.2337Z" stroke="#292D32" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <span>{post.comment_count ?? 0}</span>
                    </div>

                    <button>
                        <SaveIcon className="size-6" />
                    </button>
                </div>
            </div>

            <div className="flex items-center">
                {
                    post.video_url && (
                        <div className="py-4">
                            <VideoThumbnail url={post.video_url} className="w-48 h-32 mt-5" />
                        </div>
                    )
                }

                {
                    post.video_url === null && post.attachments.length > 0 && (
                        <div key={post.attachments[0].id} >
                            <Image src={post.attachments[0].url} alt={post.attachments[0].name} width={160} height={160} className="w-40 h-40 rounded-md object-cover mt-8" />
                        </div>
                    )
                }
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                {(post as any).is_pinned && (
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
                                {(post as any).is_pinned ? "Unpin Post" : "Pin Post"}
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]} allowedUserId={post.author_id}>
                            <DropdownMenuItem onClick={handleChangeTopic}>
                                Change Topic
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]} allowedUserId={post.author_id}>
                            <DropdownMenuItem onClick={handleToggleCommentsClick}>
                                {(post as any).comments_disabled ? "Turn on comments" : "Turn off comments"}
                            </DropdownMenuItem>
                        </AccessControl>
                        <AccessControl allowedAccess={[UserAccess.MEMBER]}>
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
                        {/* Disabled for now */}
                        {/* <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                            <DropdownMenuItem variant="destructive">
                                Delete post and ban
                            </DropdownMenuItem>
                        </AccessControl> */}
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
                commentsDisabled={(post as any).comments_disabled || false}
                isSubmitting={isTogglingComments}
            />
            <DeletePostModal
                open={deletePostModalOpen}
                onOpenChange={setDeletePostModalOpen}
                onConfirm={handleConfirmDeletePost}
                isSubmitting={isDeletingPost}
            />
        </Card>
    )
}