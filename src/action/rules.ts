"use server";

import { createSupabaseServerClient } from "@/utils/supabase-server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";

const RULE_MAX_LENGTH = 30;

export async function getRules(communityId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: rules, error } = await supabase
        .from("community_rules")
        .select("*")
        .eq("community_id", communityId)
        .order("index", { ascending: true });
    if (error) {
        console.error(error);
        return {
            error: "Error getting rules",
            message: "Error getting rules",
            statusCode: 500,
        };
    }
    return {
        data: rules,
        message: "Rules fetched successfully",
        statusCode: 200,
    };
}

export async function createRule(communityId: number, rule: string) {
    const supabase = await createSupabaseServerClient();
    const trimmed = rule.trim();
    if (!trimmed) {
        return {
            error: "Rule is required",
            message: "Rule is required",
            statusCode: 400,
        };
    }
    if (trimmed.length > RULE_MAX_LENGTH) {
        return {
            error: `Rule must be at most ${RULE_MAX_LENGTH} characters`,
            message: `Rule must be at most ${RULE_MAX_LENGTH} characters`,
            statusCode: 400,
        };
    }
    const { data: row, error } = await supabase
        .from("community_rules")
        .insert({ community_id: communityId, rule: trimmed })
        .select()
        .single();
    if (error) {
        console.error(error);
        return {
            error: "Error creating rule",
            message: "Error creating rule",
            statusCode: 500,
        };
    }
    const { data: community } = await supabase
        .from("communities")
        .select("slug")
        .eq("id", communityId)
        .single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return {
        data: row,
        message: "Rule created successfully",
        statusCode: 200,
    };
}

export async function updateRule(
    ruleId: number,
    communityId: number,
    rule: string
) {
    const supabase = await createSupabaseServerClient();
    const trimmed = rule.trim();
    if (!trimmed) {
        return {
            error: "Rule is required",
            message: "Rule is required",
            statusCode: 400,
        };
    }
    if (trimmed.length > RULE_MAX_LENGTH) {
        return {
            error: `Rule must be at most ${RULE_MAX_LENGTH} characters`,
            message: `Rule must be at most ${RULE_MAX_LENGTH} characters`,
            statusCode: 400,
        };
    }
    const { data: row, error } = await supabase
        .from("community_rules")
        .update({ rule: trimmed })
        .eq("id", ruleId)
        .eq("community_id", communityId)
        .select()
        .single();
    if (error) {
        console.error(error);
        return {
            error: "Error updating rule",
            message: "Error updating rule",
            statusCode: 500,
        };
    }
    const { data: community } = await supabase
        .from("communities")
        .select("slug")
        .eq("id", communityId)
        .single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return {
        data: row,
        message: "Rule updated successfully",
        statusCode: 200,
    };
}

export async function deleteRule(ruleId: number, communityId: number) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("community_rules")
        .delete()
        .eq("id", ruleId)
        .eq("community_id", communityId);
    if (error) {
        console.error(error);
        return {
            error: "Error deleting rule",
            message: "Error deleting rule",
            statusCode: 500,
        };
    }
    const { data: community } = await supabase
        .from("communities")
        .select("slug")
        .eq("id", communityId)
        .single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return {
        data: null,
        message: "Rule deleted successfully",
        statusCode: 200,
    };
}

export async function moveRuleUp(ruleId: number, communityId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: rule, error: ruleError } = await supabase
        .from("community_rules")
        .select("id, index")
        .eq("id", ruleId)
        .eq("community_id", communityId)
        .single();
    if (ruleError || !rule) {
        return {
            error: "Rule not found",
            message: "Rule not found",
            statusCode: 404,
        };
    }
    const { data: prevRule, error: prevError } = await supabase
        .from("community_rules")
        .select("id, index")
        .eq("community_id", communityId)
        .eq("index", rule.index - 1)
        .maybeSingle();
    if (prevError || !prevRule) {
        return {
            error: "Cannot move up",
            message: "Rule is already first",
            statusCode: 400,
        };
    }
    const { data: maxRow } = await supabase
        .from("community_rules")
        .select("index")
        .eq("community_id", communityId)
        .order("index", { ascending: false })
        .limit(1)
        .single();
    const tempIndex = (maxRow?.index ?? rule.index) + 1;
    const { error: err1 } = await supabase
        .from("community_rules")
        .update({ index: tempIndex })
        .eq("id", ruleId)
        .eq("community_id", communityId);
    if (err1) {
        return {
            error: "Error moving rule",
            message: "Error moving rule",
            statusCode: 500,
        };
    }
    const { error: err2 } = await supabase
        .from("community_rules")
        .update({ index: rule.index })
        .eq("id", prevRule.id)
        .eq("community_id", communityId);
    if (err2) {
        return {
            error: "Error moving rule",
            message: "Error moving rule",
            statusCode: 500,
        };
    }
    const { error: err3 } = await supabase
        .from("community_rules")
        .update({ index: prevRule.index })
        .eq("id", ruleId)
        .eq("community_id", communityId);
    if (err3) {
        return {
            error: "Error moving rule",
            message: "Error moving rule",
            statusCode: 500,
        };
    }
    const { data: community } = await supabase
        .from("communities")
        .select("slug")
        .eq("id", communityId)
        .single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return { data: null, message: "Rule moved up", statusCode: 200 };
}

export async function moveRuleDown(ruleId: number, communityId: number) {
    const supabase = await createSupabaseServerClient();
    const { data: rule, error: ruleError } = await supabase
        .from("community_rules")
        .select("id, index")
        .eq("id", ruleId)
        .eq("community_id", communityId)
        .single();
    if (ruleError || !rule) {
        return {
            error: "Rule not found",
            message: "Rule not found",
            statusCode: 404,
        };
    }
    const { data: nextRule, error: nextError } = await supabase
        .from("community_rules")
        .select("id, index")
        .eq("community_id", communityId)
        .eq("index", rule.index + 1)
        .maybeSingle();
    if (nextError || !nextRule) {
        return {
            error: "Cannot move down",
            message: "Rule is already last",
            statusCode: 400,
        };
    }
    const { data: maxRow } = await supabase
        .from("community_rules")
        .select("index")
        .eq("community_id", communityId)
        .order("index", { ascending: false })
        .limit(1)
        .single();
    const tempIndex = (maxRow?.index ?? rule.index) + 1;
    const { error: err1 } = await supabase
        .from("community_rules")
        .update({ index: tempIndex })
        .eq("id", ruleId)
        .eq("community_id", communityId);
    if (err1) {
        return {
            error: "Error moving rule",
            message: "Error moving rule",
            statusCode: 500,
        };
    }
    const { error: err2 } = await supabase
        .from("community_rules")
        .update({ index: rule.index })
        .eq("id", nextRule.id)
        .eq("community_id", communityId);
    if (err2) {
        return {
            error: "Error moving rule",
            message: "Error moving rule",
            statusCode: 500,
        };
    }
    const { error: err3 } = await supabase
        .from("community_rules")
        .update({ index: nextRule.index })
        .eq("id", ruleId)
        .eq("community_id", communityId);
    if (err3) {
        return {
            error: "Error moving rule",
            message: "Error moving rule",
            statusCode: 500,
        };
    }
    const { data: community } = await supabase
        .from("communities")
        .select("slug")
        .eq("id", communityId)
        .single();
    if (community) {
        revalidatePath(`/communities/${community.slug}/settings`);
    }
    return { data: null, message: "Rule moved down", statusCode: 200 };
}
