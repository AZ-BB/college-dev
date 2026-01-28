"use server";

import { TopicWritePermissionType } from "@/enums/enums";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";


export async function createTopic(communityId: number, name: string, writePermissionType: TopicWritePermissionType) {
    const supabase = await createSupabaseServerClient();

    const { data: topic, error: topicError } = await supabase.from("topics").insert({
        community_id: communityId,
        name: name,
        write_permission_type: writePermissionType,
    }).select().single();

    if (topicError) {
        if (topicError.code === "23505") {
            return {
                error: "A topic with this name already exists in this community",
                message: "A topic with this name already exists in this community",
                statusCode: 409,
                errorCode: "UNIQUE_TOPIC_NAME",
            };
        }
        return {
            error: "Error creating topic",
            message: "Error creating topic",
            statusCode: 500,
        };
    }

    const { data: community, error: communityError } = await supabase.from("communities").select("slug").eq("id", communityId).single();
    if (communityError) {
        return {
            error: "Error getting community",
            message: "Error getting community",
            statusCode: 500,
        };
    }
    if (community) {
        revalidatePath(`/communities/${community.slug}/posts`);
    }

    return {
        data: topic,
        message: "Topic created successfully",
        statusCode: 200,
    };
}

export async function getTopics(communityId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: topics, error: topicsError } = await supabase.from("topics").select("*").eq("community_id", communityId).order("created_at", { ascending: false });
    if (topicsError) {
        return {
            error: "Error getting topics",
            message: "Error getting topics",
            statusCode: 500,
        };
    }
    return {
        data: topics,
        message: "Topics fetched successfully",
        statusCode: 200,
    };
}