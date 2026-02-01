import SaveIcon from "@/components/icons/save";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatart";
import VideoThumbnail from "@/components/video-thumbnail";
import { formatFullName } from "@/lib/utils";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import VideoEmbed from "@/components/video-embed";
import ImageGallery from "./_components/image-gallery";
import Poll from "./_components/poll";
import PollResults from "./_components/poll-results";
import { getIsUserVotedOnPoll } from "@/action/posts";
import { ExternalLinkIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { createComment } from "@/action/posts";
import CommentsList, { type Comment } from "./_components/comments-list";
import { getUserData } from "@/utils/get-user-data";
import { UserAccess } from "@/enums/enums";
import AccessControl from "../../../../../../../components/access-control";
import { getTopics } from "@/action/topics";
import PostActionsDropdown from "./_components/post-actions-dropdown";

interface PollResultUser {
    first_name: string;
    last_name: string;
    avatar: string | null;
    username: string;
}

interface PollResultOption {
    id: number;
    poll_id: number;
    text: string;
    vote_count: number;
    users: PollResultUser[];
}

interface PollResultsData {
    total_votes: number;
    options: PollResultOption[];
}

export default async function PostPage({ params, searchParams }: { params: Promise<{ slug: string; id: string }>, searchParams: Promise<{ expanded_comment_id?: string; highlighted_comment_id?: string }> }) {
    const { slug, id } = await params;
    const { expanded_comment_id, highlighted_comment_id } = await searchParams;

    const user = await getUserData();

    if (!id || isNaN(parseInt(id))) {
        return notFound();
    }

    const supabase = await createSupabaseServerClient();
    const { data: post, error: postError } = await supabase.from("posts").select(`
        *,
        users!posts_author_id_fkey(id, username, avatar_url, first_name, last_name),
        poll!posts_poll_id_fkey(*, poll_options!poll_options_poll_id_fkey(*)),
        topic:topics!posts_topic_id_fkey(id, name),
        attachments:posts_attachments!posts_attachments_post_id_fkey(*)
    `).eq("id", parseInt(id)).single();

    // Get comment count (only top-level comments, not replies)
    const { count: commentCount } = await supabase
        .from("comments")
        .select("*", { count: "estimated", head: true })
        .eq("post_id", parseInt(id))

    const { count: mainCommentsCount } = await supabase
        .from("comments")
        .select("*", { count: "estimated", head: true })
        .eq("post_id", parseInt(id))
        .is("reply_to_comment_id", null);

    const { data: isUserVotedOnPoll } = await getIsUserVotedOnPoll(parseInt(id));

    if (postError || !post) {
        return notFound();
    }

    // Get topics for the community
    const { data: topics, error: topicsError } = await getTopics(post.community_id);
    const topicsList = topics || [];

    // Fetch poll results if user has voted
    let pollResults: PollResultsData | null = null;
    if (post.poll && isUserVotedOnPoll) {
        const { data: results } = await supabase.rpc("get_votes_result", { p_post_id: parseInt(id) });
        pollResults = results as PollResultsData | null;
    }

    // Comments
    const { data: commentsData, error: commentsError } = await supabase.rpc("get_comments", {
        p_post_id: parseInt(id),
        p_comments_limit: 20,
        p_replies_limit: 2,
        p_comments_offset: 0
    });

    // RPC returns JSON; keep a small runtime guard for safety
    const comments: Comment[] = Array.isArray(commentsData)
        ? (commentsData as Comment[])
        : [];




    return (
        <div>
            <Card key={post.id} className="shadow-none border-grey-200 px-6 hover:shadow-sm transition-all duration-300 relative"
            >
                <div className="flex flex-col gap-4 justify-between">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${post.users.username}`}>
                                <UserAvatar className="w-11 h-11 rounded-[14px]" user={post.users} />
                            </Link>
                            <div className="flex flex-col gap-0.5 items-start text-base font-medium">
                                <Link href={`/profile/${post.users.username}`} className="font-semibold hover:underline">
                                    {formatFullName(post.users.first_name, post.users.last_name)}
                                </Link>
                                <span className="text-grey-700 text-sm font-medium">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true }).replace(/^about /i, '')} | {post.topic?.name}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">{post.title}</h3>
                            <p className="text-sm text-grey-600 font-medium">{post.content}</p>
                        </div>
                    </div>
                </div>

                {
                    post.poll &&
                        !isUserVotedOnPoll ?
                        <Poll poll={post.poll} />
                        :
                        pollResults && <PollResults pollResults={pollResults} />
                }

                {
                    post.video_url && (
                        <VideoEmbed url={post.video_url} className="w-full h-auto rounded-lg" />
                    )
                }

                {
                    post.attachments && post.attachments.length > 0 && (
                        <ImageGallery attachments={post.attachments} />
                    )
                }

                {
                    post.attachments && post.attachments.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {
                                post.attachments.map((attachment) => {
                                    if (attachment.type === "LINK") {
                                        return (
                                            <a key={attachment.id} href={attachment.url} target="_blank" className="text-sm text-orange-500 hover:underline flex gap-2">{attachment.name} <ExternalLinkIcon className="w-4 h-4" /></a>
                                        )
                                    }

                                    return null
                                })
                            }
                        </div>
                    )
                }

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
                        <span>{commentCount}</span>
                    </div>

                    <button>
                        <SaveIcon className="size-6" />
                    </button>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-col gap-6">
                    {post.comments_disabled ? (
                        <div className="flex items-center justify-center py-4 px-4 bg-grey-50 rounded-lg border border-grey-200">
                            <p className="text-sm text-grey-600 font-medium">Comments are disabled for this post</p>
                        </div>
                    ) : (
                        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                            <div className="flex w-full gap-2 items-center">
                                <UserAvatar className="w-11 h-11 rounded-[14px]" user={user} />

                                <form className="w-full"
                                    action={createComment}
                                >
                                    <input type="hidden" name="post_id" value={post.id} />
                                    <Input
                                        type="text"
                                        name="comment_content"
                                        placeholder="Add a comment"
                                        className="h-11 md:text-base w-full"
                                        maxLength={500}
                                    />
                                </form>
                            </div>
                        </AccessControl>
                    )}

                    <div>
                        <CommentsList
                            comments={comments}
                            postId={post.id}
                            commentCount={mainCommentsCount}
                            commentsDisabled={post.comments_disabled || false}
                            extraExpandedCommentId={expanded_comment_id ? parseInt(expanded_comment_id) : undefined}
                            highlightedCommentId={highlighted_comment_id ? parseInt(highlighted_comment_id) : undefined}
                        />
                    </div>
                </div>
                <PostActionsDropdown
                    post={{
                        id: post.id,
                        author_id: post.author_id,
                        topic_id: post.topic_id,
                        comments_disabled: post.comments_disabled,
                        is_pinned: post.is_pinned,
                    }}
                    topics={topicsList}
                    slug={slug}
                />
            </Card>
        </div>
    )
}