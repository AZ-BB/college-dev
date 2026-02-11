"use server";

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { GeneralResponse } from "@/utils/general-response";
import { getUserData } from "@/utils/get-user-data";
import { Tables } from "@/database.types";
import { PostList } from "./posts";
import { revalidatePath } from "next/cache";

export interface CreatePostReportData {
    postId: number;
    rulesIds: number[];
    additionalNotes?: string | null;
}

export type PostReportWithDetails = Tables<"posts_reports"> & {
    posts: PostList;
    users: Pick<Tables<"users">, "id" | "username" | "first_name" | "last_name" | "avatar_url">;
};

export async function createPostReport(
    reportData: CreatePostReportData
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

    if (!reportData.rulesIds || reportData.rulesIds.length === 0) {
        return {
            error: "At least one rule violation must be selected",
            message: "At least one rule violation must be selected",
            statusCode: 400,
        };
    }

    // Check if user has already reported this post
    const { data: existingReport, error: checkError } = await supabase
        .from("posts_reports")
        .select("id")
        .eq("post_id", reportData.postId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (checkError) {
        console.error("Error checking existing report:", checkError);
        return {
            error: "Error checking existing report",
            message: "Error checking existing report",
            statusCode: 500,
        };
    }

    if (existingReport) {
        return {
            error: "You have already reported this post",
            message: "You have already reported this post",
            statusCode: 400,
        };
    }

    // Get the post to retrieve community_id
    const { data: post, error: postError } = await supabase
        .from("posts")
        .select("community_id")
        .eq("id", reportData.postId)
        .single();

    if (postError || !post) {
        console.error("Error fetching post:", postError);
        return {
            error: "Post not found",
            message: "Post not found",
            statusCode: 404,
        };
    }

    // Convert rulesIds array to comma-separated string
    const rulesIdsString = reportData.rulesIds.join(",");

    const { error } = await supabase.from("posts_reports").insert({
        post_id: reportData.postId,
        user_id: user.id,
        community_id: post.community_id,
        rules_ids: rulesIdsString,
        description: reportData.additionalNotes?.trim() || null,
    });

    if (error) {
        console.error("Error creating post report:", error);
        return {
            error: "Error creating report",
            message: "Error creating report",
            statusCode: 500,
        };
    }

    return {
        data: undefined,
        message: "Report submitted successfully",
        statusCode: 200,
    };
}

export async function getPostReports(
    communityId: number
): Promise<GeneralResponse<PostReportWithDetails[]>> {
    const supabase = await createSupabaseServerClient();

    // First, get all post IDs in this community
    const { data: communityPosts, error: postsError } = await supabase
        .from("posts")
        .select("id")
        .eq("community_id", communityId);

    if (postsError) {
        console.error("Error fetching community posts:", postsError);
        return {
            error: "Error fetching reports",
            message: "Error fetching reports",
            statusCode: 500,
        };
    }

    const postIds = (communityPosts || []).map((p) => p.id);
    if (postIds.length === 0) {
        return {
            data: [],
            message: "No reports found",
            statusCode: 200,
        };
    }

    // Get all reports for these posts
    const { data: reports, error } = await supabase
        .from("posts_reports")
        .select(`
            *,
            posts (
                *,
                users (
                    id,
                    username,
                    first_name,
                    last_name,
                    avatar_url
                )
            ),
            users (
                id,
                username,
                first_name,
                last_name,
                avatar_url
            )
        `)
        .in("post_id", postIds)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching post reports:", error);
        return {
            error: "Error fetching reports",
            message: "Error fetching reports",
            statusCode: 500,
        };
    }

    // Fetch attachments and poll data separately for each post
    const reportsWithDetails: PostReportWithDetails[] = await Promise.all(
        (reports || []).map(async (report: any) => {
            const post = report.posts;
            
            // Fetch attachments
            const { data: attachments } = await supabase
                .from("posts_attachments")
                .select("*")
                .eq("post_id", post.id);

            // Fetch poll if exists
            const { data: poll } = await supabase
                .from("poll")
                .select("*")
                .eq("post_id", post.id)
                .maybeSingle();

            // Fetch comment count
            const { count: commentCount } = await supabase
                .from("comments")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id);

            // Fetch likes count
            const { count: likesCount } = await supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id);

            return {
                ...report,
                posts: {
                    ...post,
                    comment_count: commentCount || 0,
                    likes_count: likesCount || 0,
                    attachments: attachments || [],
                    poll: poll || null,
                } as PostList,
                users: report.users,
            };
        })
    );

    return {
        data: reportsWithDetails,
        message: "Reports fetched successfully",
        statusCode: 200,
    };
}

export async function deletePostReport(reportId: number): Promise<GeneralResponse<void>> {
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
        // Get the report to check community and verify admin/owner access
        const { data: report, error: reportError } = await supabase
            .from("posts_reports")
            .select(`
                id,
                post_id,
                posts!inner (
                    community_id,
                    communities!inner (
                        id,
                        slug
                    )
                )
            `)
            .eq("id", reportId)
            .single();

        if (reportError || !report) {
            console.error("Error fetching report:", reportError);
            return {
                error: "Report not found",
                message: "Report not found",
                statusCode: 404,
            };
        }

        const communityId = (report.posts as any).community_id;
        const community = (report.posts as any).communities;

        // Verify user is admin or owner
        const { data: member } = await supabase
            .from("community_members")
            .select("role")
            .eq("community_id", communityId)
            .eq("user_id", user.id)
            .eq("member_status", "ACTIVE")
            .single();

        if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
            return {
                error: "Unauthorized",
                message: "Only admins and owners can delete reports",
                statusCode: 403,
            };
        }

        // Delete the report
        const { error: deleteError } = await supabase
            .from("posts_reports")
            .delete()
            .eq("id", reportId);

        if (deleteError) {
            console.error("Error deleting report:", deleteError);
            return {
                error: "Error deleting report",
                message: "Error deleting report",
                statusCode: 500,
            };
        }

        // Revalidate the reports page
        if (community?.slug) {
            revalidatePath(`/communities/${community.slug}/posts/reports`);
        }

        return {
            data: undefined,
            message: "Report deleted successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error in deletePostReport:", error);
        return {
            error: "Error deleting report",
            message: "Error deleting report",
            statusCode: 500,
        };
    }
}
