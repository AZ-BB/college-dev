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
        // Verify post exists and user is the author
        const { data: post, error: postError } = await supabase
            .from("posts")
            .select("id, author_id")
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
            // Cleanup: delete uploaded images
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
    users: Tables<"users">,
    poll: Tables<"poll"> | null,
    topic: Tables<"topics"> | null,
    attachments: Tables<"posts_attachments">[],
}

export async function getPosts(
    communityId: number,
    topic: string,
    sortBy: string,
    pagination: { limit: number; offset: number }
): Promise<GeneralResponse<Array<PostList>>> {
    const supabase = await createSupabaseServerClient();

    try {
        let query = supabase
            .from("posts")
            .select(`
                *,
                users!posts_author_id_fkey(*),
                poll!posts_poll_id_fkey(*),
                topic:topics!posts_topic_id_fkey(id, name),
                attachments:posts_attachments!posts_attachments_post_id_fkey(*)
            `)
            .eq("community_id", communityId)
            .range(pagination.offset, pagination.offset + pagination.limit - 1);

        // Filter by topic if not "all"
        if (topic !== "all") {
            const topicId = parseInt(topic, 10);
            if (!isNaN(topicId)) {
                query = query.eq("topic_id", topicId);
            }
        }

        // Apply sorting
        if (sortBy === "top") {
            query = query.order("likes_count", { ascending: false });
        } else {
            // "default" or "new" both sort by created_at descending
            query = query.order("created_at", { ascending: false });
        }

        const { data: posts, error: postsError } = await query;

        if (postsError) {
            console.error("Error fetching posts:", postsError);
            return {
                error: "Error fetching posts",
                message: "Error fetching posts",
                statusCode: 500,
            };
        }

        return {
            data: posts as unknown as Array<PostList> || [],
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