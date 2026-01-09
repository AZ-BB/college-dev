"use server";
import { Tables } from "@/database.types";
import { CommunityMemberStatus, CommunityRole } from "@/enums/enums";
import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export type MemberWithUser = Tables<"community_members"> & {
    users: {
        id: string
        bio: string | null
        email: string
        username: string
        first_name: string
        last_name: string
        avatar_url: string | null
    }
}

export async function getCommunityMembers(id: number, {
    page = 1,
    limit = 10,
    search = "",
    filter,
    sortBy = "role",
    sortOrder = "asc"
}: {
    page?: number,
    limit?: number,
    search?: string,
    filter?: {
        status?: CommunityMemberStatus,
        role?: CommunityRole,
    },
    sortBy?: keyof Tables<"community_members"> | keyof Tables<"users">,
    sortOrder?: "asc" | "desc",
}): Promise<GeneralResponse<{
    members: MemberWithUser[],
    totalCount: number
}>> {
    try {
        console.log("filter", filter);
        const supabase = await createSupabaseServerClient();

        const { data, error } = await (supabase.rpc as any)('get_community_members', {
            p_community_id: id,
            p_page: page,
            p_limit: limit,
            p_search: search?.trim() || null,
            p_status: filter?.status || null,
            p_role: filter?.role || null,
            p_sort_by: sortBy,
            p_sort_order: sortOrder
        });

        if (error) {
            console.error("Error fetching members:", error)
            return {
                error: "Error fetching members",
                message: "Error fetching members",
                statusCode: 500
            }
        }

        const result = data as { members: MemberWithUser[], total_count: number } | null;

        if (!result) {
            return {
                error: "Error fetching members",
                message: "No data returned",
                statusCode: 500
            }
        }

        return {
            data: {
                members: result.members || [],
                totalCount: result.total_count || 0
            },
            error: undefined,
            message: "Members fetched successfully",
            statusCode: 200
        }
    }
    catch (error) {
        console.error("Error fetching members:", error)
        return {
            error: "Error fetching members",
            message: "Error fetching members",
            statusCode: 500
        }
    }
}

export async function getInvitedByUser(id: string): Promise<GeneralResponse<{
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
} | null>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", id)
            .single();

        if (error || !data) {
            return {
                data: null,
                error: undefined,
                message: "User not found",
                statusCode: 200
            }
        }

        return {
            data,
            error: undefined,
            message: "User fetched successfully",
            statusCode: 200
        }
    } catch (error) {
        console.error("Error fetching invited by user:", error)
        return {
            data: null,
            error: "Error fetching user",
            message: "Error fetching user",
            statusCode: 500
        }
    }
}

export async function getCommunityMembersCounts(id: number): Promise<GeneralResponse<{
    all: number,
    leavingSoon: number,
    churned: number,
    banned: number,
}>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { count: activeMembers, error: e1 } = await supabase.from("community_members")
            .select("*", { count: "exact", head: true })
            .eq("community_id", id)
            .eq("member_status", CommunityMemberStatus.ACTIVE)

        const { count: leavingSoonMembers, error: e2 } = await supabase.from("community_members")
            .select("*", { count: "exact", head: true })
            .eq("community_id", id)
            .eq("member_status", CommunityMemberStatus.LEAVING_SOON)

        const { count: churnedMembers, error: e3 } = await supabase.from("community_members")
            .select("*", { count: "exact", head: true })
            .eq("community_id", id)
            .eq("member_status", CommunityMemberStatus.CHURNED)

        const { count: bannedMembers, error: e4 } = await supabase.from("community_members")
            .select("*", { count: "exact", head: true })
            .eq("community_id", id)
            .eq("member_status", CommunityMemberStatus.BANNED)

        if (e1 || e2 || e3 || e4) {
            console.error("Error fetching members counts:", e1 || e2 || e3 || e4)
            return {
                error: "Error fetching members counts",
                message: "Error fetching members counts",
                statusCode: 500
            }
        }

        return {
            data: {
                all: activeMembers || 0,
                leavingSoon: leavingSoonMembers || 0,
                churned: churnedMembers || 0,
                banned: bannedMembers || 0,
            },
            error: undefined,
            message: "Members counts fetched successfully",
            statusCode: 200
        }
    } catch (error) {
        console.error("Error fetching members counts:", error)
        return {
            error: "Error fetching members counts",
            message: "Error fetching members counts",
            statusCode: 500
        }
    }
}