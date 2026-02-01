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
        console.error(topicError);
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
    const { data: topics, error: topicsError } = await supabase.from("topics").select("*").eq("community_id", communityId).order("index", { ascending: true });
    if (topicsError) {
        console.error(topicsError);
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

export async function updateTopic(
    topicId: number,
    communityId: number,
    name: string,
    writePermissionType: TopicWritePermissionType
) {
    const supabase = await createSupabaseServerClient();

    const { data: topic, error: topicError } = await supabase
        .from("topics")
        .update({ name, write_permission_type: writePermissionType })
        .eq("id", topicId)
        .eq("community_id", communityId)
        .select()
        .single();

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
            error: "Error updating topic",
            message: "Error updating topic",
            statusCode: 500,
        };
    }

    const { data: community } = await supabase.from("communities").select("slug").eq("id", communityId).single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/posts`);
        revalidatePath(`/communities/${community.slug}/settings`);
    }

    return {
        data: topic,
        message: "Topic updated successfully",
        statusCode: 200,
    };
}

export async function deleteTopic(topicId: number, communityId: number) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", topicId)
        .eq("community_id", communityId);

    if (error) {
        return {
            error: "Error deleting topic",
            message: "Error deleting topic",
            statusCode: 500,
        };
    }

    const { data: community } = await supabase.from("communities").select("slug").eq("id", communityId).single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/posts`);
        revalidatePath(`/communities/${community.slug}/settings`);
    }

    return {
        data: null,
        message: "Topic deleted successfully",
        statusCode: 200,
    };
}

export async function moveTopicUp(topicId: number, communityId: number) {
    const supabase = await createSupabaseServerClient();

    const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id, index")
        .eq("id", topicId)
        .eq("community_id", communityId)
        .single();

    if (topicError || !topic) {
        return {
            error: "Topic not found",
            message: "Topic not found",
            statusCode: 404,
        };
    }

    const { data: prevTopic, error: prevError } = await supabase
        .from("topics")
        .select("id, index")
        .eq("community_id", communityId)
        .eq("index", topic.index - 1)
        .maybeSingle();

    if (prevError || !prevTopic) {
        return {
            error: "Cannot move up",
            message: "Topic is already first",
            statusCode: 400,
        };
    }

    const { data: maxRow } = await supabase
        .from("topics")
        .select("index")
        .eq("community_id", communityId)
        .order("index", { ascending: false })
        .limit(1)
        .single();
    const tempIndex = (maxRow?.index ?? topic.index) + 1;

    const { error: err1 } = await supabase
        .from("topics")
        .update({ index: tempIndex })
        .eq("id", topicId)
        .eq("community_id", communityId);
    if (err1) {
        return { error: "Error moving topic", message: "Error moving topic", statusCode: 500 };
    }
    const { error: err2 } = await supabase
        .from("topics")
        .update({ index: topic.index })
        .eq("id", prevTopic.id)
        .eq("community_id", communityId);
    if (err2) {
        return { error: "Error moving topic", message: "Error moving topic", statusCode: 500 };
    }
    const { error: err3 } = await supabase
        .from("topics")
        .update({ index: prevTopic.index })
        .eq("id", topicId)
        .eq("community_id", communityId);
    if (err3) {
        return { error: "Error moving topic", message: "Error moving topic", statusCode: 500 };
    }

    const { data: community } = await supabase.from("communities").select("slug").eq("id", communityId).single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/posts`);
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return { data: null, message: "Topic moved up", statusCode: 200 };
}

export async function moveTopicDown(topicId: number, communityId: number) {
    const supabase = await createSupabaseServerClient();

    const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id, index")
        .eq("id", topicId)
        .eq("community_id", communityId)
        .single();

    if (topicError || !topic) {
        return {
            error: "Topic not found",
            message: "Topic not found",
            statusCode: 404,
        };
    }

    const { data: nextTopic, error: nextError } = await supabase
        .from("topics")
        .select("id, index")
        .eq("community_id", communityId)
        .eq("index", topic.index + 1)
        .maybeSingle();

    if (nextError || !nextTopic) {
        return {
            error: "Cannot move down",
            message: "Topic is already last",
            statusCode: 400,
        };
    }

    const { data: maxRow } = await supabase
        .from("topics")
        .select("index")
        .eq("community_id", communityId)
        .order("index", { ascending: false })
        .limit(1)
        .single();
    const tempIndex = (maxRow?.index ?? topic.index) + 1;

    const { error: err1 } = await supabase
        .from("topics")
        .update({ index: tempIndex })
        .eq("id", topicId)
        .eq("community_id", communityId);
    if (err1) {
        return { error: "Error moving topic", message: "Error moving topic", statusCode: 500 };
    }
    const { error: err2 } = await supabase
        .from("topics")
        .update({ index: topic.index })
        .eq("id", nextTopic.id)
        .eq("community_id", communityId);
    if (err2) {
        return { error: "Error moving topic", message: "Error moving topic", statusCode: 500 };
    }
    const { error: err3 } = await supabase
        .from("topics")
        .update({ index: nextTopic.index })
        .eq("id", topicId)
        .eq("community_id", communityId);
    if (err3) {
        return { error: "Error moving topic", message: "Error moving topic", statusCode: 500 };
    }

    const { data: community } = await supabase.from("communities").select("slug").eq("id", communityId).single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/posts`);
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return { data: null, message: "Topic moved down", statusCode: 200 };
}