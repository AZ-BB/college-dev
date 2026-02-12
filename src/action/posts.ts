"use server";

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { GeneralResponse } from "@/utils/general-response";
import { getUserData } from "@/utils/get-user-data";
import { revalidatePath } from "next/cache";
import { Tables } from "@/database.types";


export interface CreatePostData {
    title: string;
    content: string;
    topicId: number;
    videoUrl?: string | null;
    pollOptions?: string[]; // Array of poll option texts
    links?: Array<{ url: string; name: string }>;
}

export interface CreatedPostData {
    postId: number;
}

export interface UpdatePostData {
    title: string;
    content: string;
    topicId: number;
    videoUrl?: string | null;
    links?: Array<{ url: string; name: string }>;
}

export async function updatePost(
    postId: number,
    postData: UpdatePostData
): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select(`
                id,
                author_id,
                community_id,
                community:communities!posts_community_id_fkey(id, slug)
            `)
            .eq("id", postId)
            .single();

        if (postError || !post) {
            console.error("Error fetching post:", postError);
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        if (post.author_id !== user.id) {
            const { data: member } = await supabase
                .from("community_members")
                .select("role")
                .eq("community_id", post.community_id)
                .eq("user_id", user.id)
                .eq("member_status", "ACTIVE")
                .single();

            if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
                return {
                    error: "Unauthorized",
                    message: "You can only edit your own posts or if you are an admin/owner",
                    statusCode: 403,
                };
            }
        }

        const { data: newTopic, error: topicError } = await supabase
            .from("topics")
            .select("id, write_permission_type, community_id")
            .eq("id", postData.topicId)
            .single();

        if (topicError || !newTopic) {
            return {
                error: "Topic not found",
                message: "Topic not found",
                statusCode: 404,
            };
        }

        if (newTopic.community_id !== post.community_id) {
            return {
                error: "Invalid topic",
                message: "Topic does not belong to this community",
                statusCode: 400,
            };
        }

        const { data: member } = await supabase
            .from("community_members")
            .select("role")
            .eq("community_id", post.community_id)
            .eq("user_id", user.id)
            .eq("member_status", "ACTIVE")
            .single();

        if (!member) {
            return {
                error: "Unauthorized",
                message: "You are not a member of this community",
                statusCode: 403,
            };
        }

        if (newTopic.write_permission_type === "ADMINS" && member.role === "MEMBER") {
            return {
                error: "Unauthorized",
                message: "You do not have write access to this topic",
                statusCode: 403,
            };
        }

        const { error: updateError } = await supabase
            .from("posts")
            .update({
                title: postData.title.trim(),
                content: postData.content.trim(),
                topic_id: postData.topicId,
                video_url: postData.videoUrl?.trim() || null,
            })
            .eq("id", postId);

        if (updateError) {
            console.error("Error updating post:", updateError);
            return {
                error: "Error updating post",
                message: "Error updating post",
                statusCode: 500,
            };
        }

        const { error: deleteLinksError } = await supabase
            .from("posts_attachments")
            .delete()
            .eq("post_id", postId)
            .eq("type", "LINK");

        if (deleteLinksError) {
            console.error("Error deleting link attachments:", deleteLinksError);
        }

        if (postData.links && postData.links.length > 0) {
            const linkAttachmentInserts = postData.links.map((link) => ({
                post_id: postId,
                url: link.url,
                name: link.name || link.url,
                type: "LINK" as const,
            }));

            const { error: linksError } = await supabase
                .from("posts_attachments")
                .insert(linkAttachmentInserts);

            if (linksError) {
                console.error("Error creating link attachments:", linksError);
            }
        }

        const community = post.community as { id: number; slug: string };
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts`);
            revalidatePath(`/communities/${community.slug}/posts/${postId}`);
        }

        return {
            data: undefined,
            message: "Post updated successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in updatePost:", error);
        return {
            error: "Error updating post",
            message: "Error updating post",
            statusCode: 500,
        };
    }
}

export async function deletePostImageAttachments(
    postId: number,
    attachmentIds: number[]
): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    if (attachmentIds.length === 0) {
        return {
            data: undefined,
            message: "No attachments to delete",
            statusCode: 200,
        };
    }

    try {
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select(`
                id,
                author_id,
                community_id,
                community:communities!posts_community_id_fkey(id, slug)
            `)
            .eq("id", postId)
            .single();

        if (postError || !post) {
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        if (post.author_id !== user.id) {
            const { data: member } = await supabase
                .from("community_members")
                .select("role")
                .eq("community_id", post.community_id)
                .eq("user_id", user.id)
                .eq("member_status", "ACTIVE")
                .single();

            if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
                return {
                    error: "Unauthorized",
                    message: "You can only delete attachments from your own posts or if you are an admin/owner",
                    statusCode: 403,
                };
            }
        }

        const { data: attachments } = await supabase
            .from("posts_attachments")
            .select("id, type")
            .eq("post_id", postId)
            .in("id", attachmentIds);

        const imageIds = (attachments ?? [])
            .filter((a) => a.type === "IMAGE")
            .map((a) => a.id);

        if (imageIds.length > 0) {
            const { error: deleteError } = await supabase
                .from("posts_attachments")
                .delete()
                .in("id", imageIds);

            if (deleteError) {
                console.error("Error deleting image attachments:", deleteError);
                return {
                    error: "Error deleting image attachments",
                    message: "Error deleting image attachments",
                    statusCode: 500,
                };
            }
        }

        const community = post.community as { id: number; slug: string };
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts`);
            revalidatePath(`/communities/${community.slug}/posts/${postId}`);
        }

        return {
            data: undefined,
            message: "Image attachments deleted successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in deletePostImageAttachments:", error);
        return {
            error: "Error deleting image attachments",
            message: "Error deleting image attachments",
            statusCode: 500,
        };
    }
}

export async function createPost(
    postData: CreatePostData
): Promise<GeneralResponse<CreatedPostData>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Get community_id from topic_id
        const { data: topic, error: topicError } = await supabase
            .from("topics")
            .select("community_id")
            .eq("id", postData.topicId)
            .single();

        if (topicError || !topic) {
            console.error("Error fetching topic:", topicError);
            return {
                error: "Topic not found",
                message: "Topic not found",
                statusCode: 404,
            };
        }

        const communityId = topic.community_id;

        // Create the post
        const { data: post, error: postError } = await supabase
            .from("posts")
            .insert({
                title: postData.title,
                content: postData.content,
                topic_id: postData.topicId,
                community_id: communityId,
                author_id: user.id,
                video_url: postData.videoUrl || null,
            })
            .select('id')
            .single();

        if (postError || !post) {
            console.error("Error creating post:", postError);
            return {
                error: "Error creating post",
                message: "Error creating post",
                statusCode: 500,
            };
        }

        const postId = post.id;

        // Create poll and poll options if poll options exist
        if (postData.pollOptions && postData.pollOptions.length > 0) {
            // Filter out empty poll options
            const validPollOptions = postData.pollOptions.filter(
                (option) => option.trim().length > 0
            );

            if (validPollOptions.length > 0) {
                // Create poll
                const { data: poll, error: pollError } = await supabase
                    .from("poll")
                    .insert({
                        post_id: postId,
                    })
                    .select()
                    .single();

                if (pollError || !poll) {
                    console.error("Error creating poll:", pollError);
                    // Rollback: delete post
                    await supabase.from("posts").delete().eq("id", postId);
                    return {
                        error: "Error creating poll",
                        message: "Error creating poll",
                        statusCode: 500,
                    };
                }

                // Create poll options
                const pollOptionInserts = validPollOptions.map((text) => ({
                    poll_id: poll.id,
                    text: text.trim(),
                }));

                const { error: pollOptionsError } = await supabase
                    .from("poll_options")
                    .insert(pollOptionInserts);

                if (pollOptionsError) {
                    console.error("Error creating poll options:", pollOptionsError);
                    // Rollback: delete poll and post
                    await supabase.from("poll").delete().eq("id", poll.id);
                    await supabase.from("posts").delete().eq("id", postId);
                    return {
                        error: "Error creating poll options",
                        message: "Error creating poll options",
                        statusCode: 500,
                    };
                }

                await supabase.from("posts").update({
                    poll_id: poll.id,
                }).eq("id", postId);
            }
        }

        // Create post attachments for links
        if (postData.links && postData.links.length > 0) {
            const linkAttachmentInserts = postData.links.map((link) => ({
                post_id: postId,
                url: link.url,
                name: link.name || link.url,
                type: "LINK" as const,
            }));

            const { error: linksError } = await supabase
                .from("posts_attachments")
                .insert(linkAttachmentInserts);

            if (linksError) {
                console.error("Error creating link attachments:", linksError);
                // Note: We continue even if link attachments fail
                // The post is already created successfully
            }
        }

        return {
            data: {
                postId: postId,
            },
            message: "Post created successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in createPost:", error);
        return {
            error: "Error creating post",
            message: "Error creating post",
            statusCode: 500,
        };
    }
}

export async function createPostImageAttachments(
    postId: number,
    attachments: Array<{ url: string; name: string; path: string }>
): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const bucketName = "posts";
    const uploadedPaths: string[] = attachments.map((att) => att.path);

    try {
        // Verify post exists and user is the author or admin/owner
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("id, author_id, community_id")
            .eq("id", postId)
            .single();

        if (postError || !post) {
            // Cleanup: delete uploaded images
            await Promise.all(
                uploadedPaths.map((path) =>
                    supabase.storage.from(bucketName).remove([path])
                )
            );
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        if (post.author_id !== user.id) {
            const { data: member } = await supabase
                .from("community_members")
                .select("role")
                .eq("community_id", post.community_id)
                .eq("user_id", user.id)
                .eq("member_status", "ACTIVE")
                .single();

            if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
                await Promise.all(
                    uploadedPaths.map((path) =>
                        supabase.storage.from(bucketName).remove([path])
                    )
                );
                return {
                    error: "Unauthorized",
                    message: "Unauthorized",
                    statusCode: 403,
                };
            }
        }

        // Create post attachments for images
        const imageAttachmentInserts = attachments.map((attachment) => ({
            post_id: postId,
            url: attachment.url,
            name: attachment.name,
            type: "IMAGE" as const,
        }));

        const { error: attachmentsError } = await supabase
            .from("posts_attachments")
            .insert(imageAttachmentInserts);

        if (attachmentsError) {
            console.error("Error creating image attachments:", attachmentsError);
            // Cleanup: delete uploaded images from storage
            await Promise.all(
                uploadedPaths.map((path) =>
                    supabase.storage.from(bucketName).remove([path])
                )
            );
            return {
                error: "Error creating image attachments",
                message: "Error creating image attachments",
                statusCode: 500,
            };
        }

        return {
            data: undefined,
            message: "Image attachments created successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in createPostImageAttachments:", error);
        // Cleanup: delete uploaded images from storage
        await Promise.all(
            uploadedPaths.map((path) =>
                supabase.storage.from(bucketName).remove([path])
            )
        );
        return {
            error: "Error creating image attachments",
            message: "Error creating image attachments",
            statusCode: 500,
        };
    }
}

export type PostList = Tables<"posts"> & {
    users: Pick<Tables<"users">, "id" | "username" | "first_name" | "last_name" | "avatar_url">;
    attachments: Tables<"posts_attachments">[];
    comment_count: number;
    likes_count?: number;
    /** Set when p_user_id is passed to get_posts */
    is_liked?: boolean | null;
    /** Optional; not returned by get_posts list RPC */
    poll?: Tables<"poll"> | null;
};

export async function getPosts(
    communityId: number,
    topic: string,
    sortBy: string,
    pagination: { limit: number; offset: number },
    userId?: string | null
): Promise<GeneralResponse<Array<PostList>>> {
    const supabase = await createSupabaseServerClient();

    try {
        const topicId =
            topic == null || topic === "" || topic.toLowerCase().trim() === "all"
                ? null
                : parseInt(topic, 10);
        const validTopicId = Number.isNaN(topicId) ? null : topicId;

        const rpcParams: Record<string, unknown> = {
            p_community_id: communityId,
            p_topic_id: validTopicId,
            p_sort_by: sortBy === "new" || sortBy === "top" ? sortBy : "default",
            p_limit: pagination.limit,
            p_offset: pagination.offset,
        };
        if (userId != null && userId !== "") {
            rpcParams.p_user_id = userId;
        }

        const { data, error } = await (supabase.rpc as any)("get_posts", rpcParams);

        if (error) {
            console.error("Error fetching posts:", error);
            return {
                error: "Error fetching posts",
                message: "Error fetching posts",
                statusCode: 500,
            };
        }

        let posts: Array<PostList> = [];
        if (typeof data === "string") {
            try {
                posts = JSON.parse(data) || [];
            } catch {
                posts = [];
            }
        } else {
            posts = (data as Array<PostList>) || [];
        }

        return {
            data: posts,
            message: "Posts fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in getPosts:", error);
        return {
            error: "Error fetching posts",
            message: "Error fetching posts",
            statusCode: 500,
        };
    }
}


// Poll
export async function voteOnPoll(pollId: number, optionId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    const { data: voteExists, error: voteExistsError } = await supabase
        .from("poll_votes")
        .select("id")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)

    if (voteExists && voteExists.length > 0) {
        console.error("Error checking if vote exists:", voteExistsError);
        return {
            error: "You have already voted on this poll",
            message: "You have already voted on this poll",
            statusCode: 400,
        };
    }

    const { data: poll, error: pollError } = await supabase
        .from("poll")
        .select("id, post_id, poll_options(id, text)")
        .eq("id", pollId)
        .single();

    if (pollError || !poll) {
        console.error("Error fetching poll:", pollError);
        return {
            error: "Poll not found",
            message: "Poll not found",
            statusCode: 404,
        };
    }

    if (!poll.poll_options.some((option) => option.id === optionId)) {
        return {
            error: "Invalid poll option",
            message: "Invalid poll option",
            statusCode: 400,
        };
    }

    if (!poll.post_id) {
        return {
            error: "Poll not associated with a post",
            message: "Poll not associated with a post",
            statusCode: 400,
        };
    }

    const { data: vote, error: voteError } = await supabase
        .from("poll_votes")
        .insert({
            poll_id: pollId,
            poll_option_id: optionId,
            user_id: user.id,
            post_id: poll.post_id,
        })
        .select()

    if (voteError || !vote) {
        console.error("Error voting on poll:", voteError);
        return {
            error: "Error voting on poll",
            message: "Error voting on poll",
            statusCode: 500,
        };
    }

    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("id, community:communities!posts_community_id_fkey(id, slug)")
        .eq("id", poll.post_id)
        .single();

    if (postError || !post) {
        console.error("Error fetching post:", postError);
        return {
            error: "Post not found",
            message: "Post not found",
            statusCode: 404,
        };
    }

    revalidatePath(`/communities/${post.community.slug}/posts/${post.id}`);

    return {
        data: undefined,
        message: "Poll voted successfully",
        statusCode: 200,
    };
}

export async function getIsUserVotedOnPoll(postId: number): Promise<GeneralResponse<boolean>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    const { data: voteExists, error: voteExistsError } = await supabase
        .from("poll_votes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)

    if (voteExists && voteExists.length > 0) {
        return {
            data: true,
            message: "User has voted on this poll",
            statusCode: 200,
        };
    }

    return {
        data: false,
        message: "User has not voted on this poll",
        statusCode: 200,
    };
}

export async function createComment(formData: FormData): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    const postId = parseInt(formData.get("post_id") as string);

    // Check if comments are disabled for this post
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("id, comments_disabled, community:communities!posts_community_id_fkey(id, slug)")
        .eq("id", postId)
        .single();

    if (postError || !post) {
        console.error("Error fetching post:", postError);
        return;
    }

    // Prevent comment creation if comments are disabled
    if (post.comments_disabled) {
        console.error("Comments are disabled for this post");
        return;
    }

    await supabase.from("comments").insert({
        author_id: user.id,
        content: formData.get("comment_content") as string,
        post_id: postId,
    });

    if (!post.community) {
        console.error("Error fetching community");
        return;
    }

    revalidatePath(`/communities/${post.community.slug}/posts/${post.id}`);
    return
}

export async function createReply(formData: FormData): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    const commentId = parseInt(formData.get("comment_id") as string);
    const postId = parseInt(formData.get("post_id") as string);

    // Check if comments are disabled for this post
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("id, comments_disabled, community:communities!posts_community_id_fkey(id, slug)")
        .eq("id", postId)
        .single();

    if (postError || !post) {
        console.error("Error fetching post:", postError);
        return;
    }

    // Prevent reply creation if comments are disabled
    if (post.comments_disabled) {
        console.error("Comments are disabled for this post");
        return;
    }

    await supabase.from("comments").insert({
        author_id: user.id,
        content: formData.get("reply_content") as string,
        post_id: postId,
        reply_to_comment_id: commentId,
    });

    if (!post.community) {
        console.error("Error fetching community");
        return;
    }

    revalidatePath(`/communities/${post.community.slug}/posts/${post.id}`);
    return
}

export interface CommentReply {
    id: number;
    post_id: number;
    author_id: string;
    content: string;
    reply_to_comment_id: number | null;
    created_at: string;
    updated_at: string;
    likes_count?: number;
    is_liked?: boolean | null;
    users: {
        id: string;
        username: string;
        avatar_url: string | null;
        first_name: string;
        last_name: string;
    };
}

export async function getCommentReplies(commentId: number): Promise<GeneralResponse<CommentReply[]>> {
    const supabase = await createSupabaseServerClient();

    try {
        const { data: replies, error: repliesError } = await supabase
            .from("comments")
            .select(`
                *,
                users!comments_author_id_fkey(id, username, avatar_url, first_name, last_name)
            `)
            .eq("reply_to_comment_id", commentId)
            .order("created_at", { ascending: true });

        if (repliesError) {
            console.error("Error fetching comment replies:", repliesError);
            return {
                error: "Error fetching comment replies",
                message: "Error fetching comment replies",
                statusCode: 500,
            };
        }

        // Transform the data to match the CommentReply interface
        const formattedReplies: CommentReply[] = (replies || []).map((reply) => ({
            id: reply.id,
            post_id: reply.post_id,
            author_id: reply.author_id,
            content: reply.content,
            reply_to_comment_id: reply.reply_to_comment_id,
            created_at: reply.created_at,
            updated_at: reply.updated_at,
            likes_count: reply.likes_count ?? 0,
            users: reply.users as CommentReply["users"],
        }));

        return {
            data: formattedReplies,
            message: "Comment replies fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in getCommentReplies:", error);
        return {
            error: "Error fetching comment replies",
            message: "Error fetching comment replies",
            statusCode: 500,
        };
    }
}

export type CommentWithReplies = Tables<"comments"> & {
    users: {
        id: string;
        username: string;
        avatar_url: string | null;
        first_name: string;
        last_name: string;
    };
    replies_count: number;
    replies?: Array<Tables<"comments"> & {
        users: {
            id: string;
            username: string;
            avatar_url: string | null;
            first_name: string;
            last_name: string;
        };
        replies_count: number;
    }>;
};

export async function deleteComment(commentId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // First, check if the comment exists and user is the author
        const { data: comment, error: commentError } = await supabase
            .from("comments")
            .select("id, author_id, post_id")
            .eq("id", commentId)
            .single();

        if (commentError || !comment) {
            console.error("Error fetching comment:", commentError);
            return {
                error: "Comment not found",
                message: "Comment not found",
                statusCode: 404,
            };
        }

        // Check if user is the author
        if (comment.author_id !== user.id) {
            return {
                error: "Unauthorized",
                message: "You can only delete your own comments",
                statusCode: 403,
            };
        }

        // Get post to find community slug for revalidation
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("id, community:communities!posts_community_id_fkey(id, slug)")
            .eq("id", comment.post_id)
            .single();

        // Delete the comment (cascade will handle replies)
        const { error: deleteError } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (deleteError) {
            console.error("Error deleting comment:", deleteError);
            return {
                error: "Error deleting comment",
                message: "Error deleting comment",
                statusCode: 500,
            };
        }

        // Revalidate the post page
        if (post && !postError) {
            const community = post.community as any;
            if (community?.slug) {
                revalidatePath(`/communities/${community.slug}/posts/${comment.post_id}`);
            }
        }

        return {
            data: undefined,
            message: "Comment deleted successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in deleteComment:", error);
        return {
            error: "Error deleting comment",
            message: "Error deleting comment",
            statusCode: 500,
        };
    }
}

export async function getCommentWithReplies(commentId: number): Promise<GeneralResponse<CommentWithReplies>> {
    const supabase = await createSupabaseServerClient();

    try {
        // Fetch the comment
        const { data: comment, error: commentError } = await supabase
            .from("comments")
            .select(`
                *,
                users!comments_author_id_fkey(id, username, avatar_url, first_name, last_name)
            `)
            .eq("id", commentId)
            .single();

        if (commentError || !comment) {
            console.error("Error fetching comment:", commentError);
            return {
                error: "Comment not found",
                message: "Comment not found",
                statusCode: 404,
            };
        }

        // Fetch all replies for this comment
        const { data: replies, error: repliesError } = await supabase
            .from("comments")
            .select(`
                *,
                users!comments_author_id_fkey(id, username, avatar_url, first_name, last_name)
            `)
            .eq("reply_to_comment_id", commentId)
            .order("created_at", { ascending: true });

        if (repliesError) {
            console.error("Error fetching comment replies:", repliesError);
            // Continue even if replies fail, just return empty array
        }

        // Get replies count
        const { count: repliesCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("reply_to_comment_id", commentId);

        // Transform the data - replies need to match Comment type structure
        const formattedReplies = (replies || []).map((reply) => ({
            id: reply.id,
            post_id: reply.post_id,
            author_id: reply.author_id,
            content: reply.content,
            reply_to_comment_id: reply.reply_to_comment_id,
            created_at: reply.created_at,
            updated_at: reply.updated_at,
            likes_count: reply.likes_count ?? 0,
            users: reply.users as CommentWithReplies["users"],
            replies_count: 0, // Replies don't have nested replies
        }));

        const result: CommentWithReplies = {
            id: comment.id,
            post_id: comment.post_id,
            author_id: comment.author_id,
            content: comment.content,
            reply_to_comment_id: comment.reply_to_comment_id,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            likes_count: comment.likes_count ?? 0,
            users: comment.users as CommentWithReplies["users"],
            replies_count: repliesCount || 0,
            replies: formattedReplies,
        };

        return {
            data: result,
            message: "Comment with replies fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in getCommentWithReplies:", error);
        return {
            error: "Error fetching comment with replies",
            message: "Error fetching comment with replies",
            statusCode: 500,
        };
    }
}

export async function togglePinPost(postId: number): Promise<GeneralResponse<{ is_pinned: boolean }>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Get post with community info for revalidation
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select(`
                id,
                is_pinned,
                community:communities!posts_community_id_fkey(id, slug)
            `)
            .eq("id", postId)
            .single();

        if (postError || !post) {
            console.error("Error fetching post:", postError);
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        // Toggle the is_pinned value
        const newIsPinnedValue = !post.is_pinned;

        const { error: updateError } = await supabase
            .from("posts")
            .update({ is_pinned: newIsPinnedValue })
            .eq("id", postId);

        if (updateError) {
            console.error("Error toggling pin status:", updateError);
            return {
                error: "Error toggling pin status",
                message: "Error toggling pin status",
                statusCode: 500,
            };
        }

        // Revalidate the posts page
        const community = post.community as any;
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts`);
        }

        return {
            data: { is_pinned: newIsPinnedValue },
            message: newIsPinnedValue ? "Post pinned successfully" : "Post unpinned successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in togglePinPost:", error);
        return {
            error: "Error toggling pin status",
            message: "Error toggling pin status",
            statusCode: 500,
        };
    }
}

export async function updatePostTopic(postId: number, newTopicId: number): Promise<GeneralResponse<{ topic_id: number }>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Get post with community info
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select(`
                id,
                topic_id,
                community_id,
                community:communities!posts_community_id_fkey(id, slug)
            `)
            .eq("id", postId)
            .single();

        if (postError || !post) {
            console.error("Error fetching post:", postError);
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        // Check if user is the author or admin/owner
        const { data: postAuthor } = await supabase
            .from("posts")
            .select("author_id")
            .eq("id", postId)
            .single();

        if (!postAuthor || postAuthor.author_id !== user.id) {
            // Check if user is admin or owner
            const { data: member } = await supabase
                .from("community_members")
                .select("role")
                .eq("community_id", post.community_id)
                .eq("user_id", user.id)
                .eq("member_status", "ACTIVE")
                .single();

            if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
                return {
                    error: "Unauthorized",
                    message: "You can only change the topic of your own posts or if you are an admin/owner",
                    statusCode: 403,
                };
            }
        }

        // Get the new topic to check write permissions
        const { data: newTopic, error: topicError } = await supabase
            .from("topics")
            .select("id, write_permission_type, community_id")
            .eq("id", newTopicId)
            .single();

        if (topicError || !newTopic) {
            console.error("Error fetching topic:", topicError);
            return {
                error: "Topic not found",
                message: "Topic not found",
                statusCode: 404,
            };
        }

        // Verify topic belongs to the same community
        if (newTopic.community_id !== post.community_id) {
            return {
                error: "Invalid topic",
                message: "Topic does not belong to this community",
                statusCode: 400,
            };
        }

        // Check write permissions for the new topic
        const { data: member } = await supabase
            .from("community_members")
            .select("role")
            .eq("community_id", post.community_id)
            .eq("user_id", user.id)
            .eq("member_status", "ACTIVE")
            .single();

        if (!member) {
            return {
                error: "Unauthorized",
                message: "You are not a member of this community",
                statusCode: 403,
            };
        }

        // If topic requires admin access and user is only a member, deny
        if (newTopic.write_permission_type === "ADMINS" && member.role === "MEMBER") {
            return {
                error: "Unauthorized",
                message: "You do not have write access to this topic",
                statusCode: 403,
            };
        }

        // Update the post topic
        const { error: updateError } = await supabase
            .from("posts")
            .update({ topic_id: newTopicId })
            .eq("id", postId);

        if (updateError) {
            console.error("Error updating post topic:", updateError);
            return {
                error: "Error updating post topic",
                message: "Error updating post topic",
                statusCode: 500,
            };
        }

        // Revalidate the posts page
        const community = post.community as any;
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts`);
            revalidatePath(`/communities/${community.slug}/posts/${postId}`);
        }

        return {
            data: { topic_id: newTopicId },
            message: "Post topic updated successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in updatePostTopic:", error);
        return {
            error: "Error updating post topic",
            message: "Error updating post topic",
            statusCode: 500,
        };
    }
}

export async function toggleCommentsDisabled(postId: number): Promise<GeneralResponse<{ comments_disabled: boolean }>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Get post with community info
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select(`
                id,
                comments_disabled,
                author_id,
                community:communities!posts_community_id_fkey(id, slug)
            `)
            .eq("id", postId)
            .single();

        if (postError || !post) {
            console.error("Error fetching post:", postError);
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        // Check if user is the author or admin/owner
        if (post.author_id !== user.id) {
            // Check if user is admin or owner
            const { data: member } = await supabase
                .from("community_members")
                .select("role")
                .eq("community_id", (post.community as any).id)
                .eq("user_id", user.id)
                .eq("member_status", "ACTIVE")
                .single();

            if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
                return {
                    error: "Unauthorized",
                    message: "You can only toggle comments on your own posts or if you are an admin/owner",
                    statusCode: 403,
                };
            }
        }

        // Toggle the comments_disabled value
        const newCommentsDisabledValue = !post.comments_disabled;

        const { error: updateError } = await supabase
            .from("posts")
            .update({ comments_disabled: newCommentsDisabledValue })
            .eq("id", postId);

        if (updateError) {
            console.error("Error toggling comments disabled status:", updateError);
            return {
                error: "Error toggling comments disabled status",
                message: "Error toggling comments disabled status",
                statusCode: 500,
            };
        }

        // Revalidate the posts page
        const community = post.community as any;
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts`);
            revalidatePath(`/communities/${community.slug}/posts/${postId}`);
        }

        return {
            data: { comments_disabled: newCommentsDisabledValue },
            message: newCommentsDisabledValue ? "Comments disabled successfully" : "Comments enabled successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in toggleCommentsDisabled:", error);
        return {
            error: "Error toggling comments disabled status",
            message: "Error toggling comments disabled status",
            statusCode: 500,
        };
    }
}

export async function deletePost(postId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    try {
        // Get post with community info
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select(`
                id,
                author_id,
                community:communities!posts_community_id_fkey(id, slug)
            `)
            .eq("id", postId)
            .single();

        if (postError || !post) {
            console.error("Error fetching post:", postError);
            return {
                error: "Post not found",
                message: "Post not found",
                statusCode: 404,
            };
        }

        // Check if user is the author or admin/owner
        if (post.author_id !== user.id) {
            // Check if user is admin or owner
            const { data: member } = await supabase
                .from("community_members")
                .select("role")
                .eq("community_id", (post.community as any).id)
                .eq("user_id", user.id)
                .eq("member_status", "ACTIVE")
                .single();

            if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
                return {
                    error: "Unauthorized",
                    message: "You can only delete your own posts or if you are an admin/owner",
                    statusCode: 403,
                };
            }
        }

        // Delete the post (cascade will handle related data like comments, attachments, etc.)
        const { error: deleteError } = await supabase
            .from("posts")
            .delete()
            .eq("id", postId);

        if (deleteError) {
            console.error("Error deleting post:", deleteError);
            return {
                error: "Error deleting post",
                message: "Error deleting post",
                statusCode: 500,
            };
        }

        // Revalidate the posts page and reports page
        const community = post.community as any;
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts`);
            revalidatePath(`/communities/${community.slug}/posts/reports`);
        }

        return {
            data: undefined,
            message: "Post deleted successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in deletePost:", error);
        return {
            error: "Error deleting post",
            message: "Error deleting post",
            statusCode: 500,
        };
    }
}