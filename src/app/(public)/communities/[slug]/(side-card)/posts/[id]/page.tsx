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
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import AccessControl from "../../../../../../../components/access-control";
import { getTopics } from "@/action/topics";
import PostActionsDropdown from "./_components/post-actions-dropdown";
import PostLikeCommentBar from "./_components/post-like-comment-bar";

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

    // Comments (p_user_id sets is_liked per comment/reply when provided)
    const { data: commentsData } = await supabase.rpc("get_comments", {
        p_post_id: parseInt(id),
        p_comments_limit: 20,
        p_replies_limit: 2,
        p_comments_offset: 0,
        p_user_id: user?.id ?? null,
    });

    // RPC returns JSON; keep a small runtime guard for safety
    const comments: Comment[] = Array.isArray(commentsData)
        ? (commentsData as Comment[])
        : [];

    // Post like status for the single post (used by PostLikeCommentBar)
    let initialPostLiked = false;
    if (user?.id) {
        const { data: postLike } = await supabase.from("likes").select("id").eq("post_id", parseInt(id)).eq("user_id", user.id).maybeSingle();
        initialPostLiked = !!postLike;
    }




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

                <PostLikeCommentBar
                    postId={post.id}
                    communityId={post.community_id}
                    likesCount={post.likes_count ?? 0}
                    commentCount={mainCommentsCount ?? commentCount}
                    initialLiked={initialPostLiked}
                />

                <Separator className="my-4" />

                <div className="flex flex-col gap-6">
                    {post.comments_disabled ? (
                        <div className="flex items-center justify-center py-4 px-4 bg-grey-50 rounded-lg border border-grey-200">
                            <p className="text-sm text-grey-600 font-medium">Comments are disabled for this post</p>
                        </div>
                    ) : (
                        <AccessControl allowedStatus={[CommunityMemberStatus.ACTIVE]} allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
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
                            communityId={post.community_id}
                            userId={user?.id}
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
                        title: post.title,
                        content: post.content,
                        video_url: post.video_url,
                        attachments: post.attachments ?? [],
                        poll: post.poll ?? null,
                    }}
                    topics={topicsList}
                    slug={slug}
                    user={user}
                />
            </Card>
        </div>
    )
}