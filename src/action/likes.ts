"use server";

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { GeneralResponse } from "@/utils/general-response";
import { getUserData } from "@/utils/get-user-data";

export async function likePost(communityId: number, postId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const { error } = await supabase.from("likes").insert({
        community_id: communityId,
        post_id: postId,
        user_id: user.id,
    });

    if (error) {
        if (error.code === "23505") {
            return { data: undefined, message: "Already liked", statusCode: 200 };
        }
        return {
            error: error.message,
            message: error.message,
            statusCode: 500,
        };
    }

    return { data: undefined, message: "Post liked", statusCode: 200 };
}

export async function unlikePost(postId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const { data: like } = await supabase
        .from("likes")
        .select("id, community_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!like) {
        return { data: undefined, message: "Not liked", statusCode: 200 };
    }

    const { error } = await supabase.from("likes").delete().eq("id", like.id);

    if (error) {
        return {
            error: error.message,
            message: error.message,
            statusCode: 500,
        };
    }

    return { data: undefined, message: "Post unliked", statusCode: 200 };
}

export async function getLikedPostIds(postIds: number[]): Promise<GeneralResponse<number[]>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user || postIds.length === 0) {
        return { data: [], statusCode: 200 };
    }

    const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);

    if (error) {
        return { error: error.message, statusCode: 500 };
    }
    return { data: (data ?? []).map((r) => r.post_id), statusCode: 200 };
}

export async function isPostLiked(postId: number): Promise<GeneralResponse<boolean>> {
    const { data: ids } = await getLikedPostIds([postId]);
    return { data: (ids ?? []).includes(postId), statusCode: 200 };
}

export async function likeComment(communityId: number, commentId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const { error } = await supabase.from("comments_likes").insert({
        community_id: communityId,
        comment_id: commentId,
        user_id: user.id,
    });

    if (error) {
        if (error.code === "23505") {
            return { data: undefined, message: "Already liked", statusCode: 200 };
        }
        return {
            error: error.message,
            message: error.message,
            statusCode: 500,
        };
    }

    return { data: undefined, message: "Comment liked", statusCode: 200 };
}

export async function unlikeComment(commentId: number): Promise<GeneralResponse<void>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user) {
        return {
            error: "User not authenticated",
            message: "User not authenticated",
            statusCode: 401,
        };
    }

    const { data: like } = await supabase
        .from("comments_likes")
        .select("id, community_id")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!like) {
        return { data: undefined, message: "Not liked", statusCode: 200 };
    }

    const { error } = await supabase.from("comments_likes").delete().eq("id", like.id);

    if (error) {
        return {
            error: error.message,
            message: error.message,
            statusCode: 500,
        };
    }

    return { data: undefined, message: "Comment unliked", statusCode: 200 };
}

export async function getLikedCommentIds(commentIds: number[]): Promise<GeneralResponse<number[]>> {
    const supabase = await createSupabaseServerClient();
    const user = await getUserData();

    if (!user || commentIds.length === 0) {
        return { data: [], statusCode: 200 };
    }

    const { data, error } = await supabase
        .from("comments_likes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", commentIds);

    if (error) {
        return { error: error.message, statusCode: 500 };
    }
    return { data: (data ?? []).map((r) => r.comment_id), statusCode: 200 };
}
