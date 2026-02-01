"use server";
import { Tables } from "@/database.types";
import { CommunityMemberStatus, CommunityRole } from "@/enums/enums";
import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { revalidatePath } from "next/cache";

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

export async function acceptMember(memberShipId: number): Promise<GeneralResponse<{
    message: string
}>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: existingMembership, error: e1 } = await supabase.from("community_members").select("*, communities(slug)").eq("id", memberShipId).single();
        if (e1 || !existingMembership) {
            console.error("Membership not found:", e1)
            return {
                error: "Membership not found",
                message: "Membership not found",
                statusCode: 404
            }
        }

        const { data: updatedMembership, error: e2 } = await supabase.from("community_members")
            .update({
                member_status: CommunityMemberStatus.ACTIVE,
                joined_at: new Date().toISOString(),
            })
            .eq("id", memberShipId)
            .select()
            .single();

        if (e2 || !updatedMembership) {
            console.error("Error accepting member:", e2)
            return {
                error: "Error accepting member",
                message: "Error accepting member",
                statusCode: 500
            }
        }

        revalidatePath(`/communities/${existingMembership.communities.slug}/members/pending`)
        return {
            data: {
                message: "Member accepted successfully",
            },
            error: undefined,
            message: "Member accepted successfully",
            statusCode: 200
        }
    }
    catch (error) {
        console.error("Error accepting member:", error)
        return {
            error: "Error accepting member",
            message: "Error accepting member",
            statusCode: 500
        }
    }
}

export async function rejectMember(memberShipId: number): Promise<GeneralResponse<{
    message: string
}>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: existingMembership, error: e1 } = await supabase.from("community_members").select("*, communities(slug)").eq("id", memberShipId).single();
        if (e1 || !existingMembership) {
            console.error("Membership not found:", e1)
            return {
                error: "Membership not found",
                message: "Membership not found",
                statusCode: 404
            }
        }

        const { error: e2 } = await supabase.from("community_members")
            .delete()
            .eq("id", memberShipId)

        if (e2) {
            console.error("Error rejecting member:", e2)
            return {
                error: "Error rejecting member",
                message: "Error rejecting member",
                statusCode: 500
            }
        }
        revalidatePath(`/communities/${existingMembership.communities.slug}/members/pending`)
        
        return {
            data: {
                message: "Member rejected successfully",
            },
            error: undefined,
            message: "Member rejected successfully",
            statusCode: 200
        }
    }
    catch (error) {
        console.error("Error rejecting member:", error)
        return {
            error: "Error rejecting member",
            message: "Error rejecting member",
            statusCode: 500
        }
    }
}

export async function updateMemberRole(
    membershipId: number,
    newRole: CommunityRole
): Promise<GeneralResponse<{ message: string }>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                error: "Unauthorized",
                message: "You must be signed in to update member roles",
                statusCode: 401
            };
        }

        const { data: targetMembership, error: fetchError } = await supabase
            .from("community_members")
            .select("id, community_id, role, user_id, communities(slug)")
            .eq("id", membershipId)
            .single();

        if (fetchError || !targetMembership) {
            return {
                error: "Membership not found",
                message: "Membership not found",
                statusCode: 404
            };
        }

        const communityId = targetMembership.community_id as number;
        const communitySlug = (targetMembership.communities as { slug: string })?.slug;

        const { data: currentUserMembership, error: currentError } = await supabase
            .from("community_members")
            .select("role")
            .eq("community_id", communityId)
            .eq("user_id", user.id)
            .single();

        if (currentError || !currentUserMembership) {
            return {
                error: "Forbidden",
                message: "You are not a member of this community",
                statusCode: 403
            };
        }

        if (currentUserMembership.role !== CommunityRole.OWNER) {
            return {
                error: "Forbidden",
                message: "Only owners can change member roles",
                statusCode: 403
            };
        }

        if (targetMembership.role === CommunityRole.OWNER && newRole !== CommunityRole.OWNER) {
            const { count: ownerCount, error: countError } = await supabase
                .from("community_members")
                .select("*", { count: "exact", head: true })
                .eq("community_id", communityId)
                .eq("role", CommunityRole.OWNER);

            if (!countError && ownerCount !== null && ownerCount !== undefined && ownerCount < 2) {
                return {
                    error: "Cannot demote last owner",
                    message: "The community must have at least one owner",
                    statusCode: 400
                };
            }
        }

        const { error: updateError } = await supabase
            .from("community_members")
            .update({ role: newRole })
            .eq("id", membershipId);

        if (updateError) {
            console.error("Error updating member role:", updateError);
            return {
                error: "Error updating member role",
                message: "Error updating member role",
                statusCode: 500
            };
        }

        if (communitySlug) {
            revalidatePath(`/communities/${communitySlug}/members`);
        }

        return {
            data: { message: "Member role updated successfully" },
            error: undefined,
            message: "Member role updated successfully",
            statusCode: 200
        };
    } catch (error) {
        console.error("Error updating member role:", error);
        return {
            error: "Error updating member role",
            message: "Error updating member role",
            statusCode: 500
        };
    }
}

export async function removeMember(membershipId: number): Promise<GeneralResponse<{ message: string }>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                error: "Unauthorized",
                message: "You must be signed in to remove members",
                statusCode: 401
            };
        }

        const { data: targetMembership, error: fetchError } = await supabase
            .from("community_members")
            .select("id, community_id, role, user_id, communities(slug)")
            .eq("id", membershipId)
            .single();

        if (fetchError || !targetMembership) {
            return {
                error: "Membership not found",
                message: "Membership not found",
                statusCode: 404
            };
        }

        const communityId = targetMembership.community_id as number;
        const communitySlug = (targetMembership.communities as { slug: string })?.slug;

        const { data: currentUserMembership, error: currentError } = await supabase
            .from("community_members")
            .select("role")
            .eq("community_id", communityId)
            .eq("user_id", user.id)
            .single();

        if (currentError || !currentUserMembership) {
            return {
                error: "Forbidden",
                message: "You are not a member of this community",
                statusCode: 403
            };
        }

        const isOwner = currentUserMembership.role === CommunityRole.OWNER;
        const isAdmin = currentUserMembership.role === CommunityRole.ADMIN;
        const targetIsOwner = targetMembership.role === CommunityRole.OWNER;

        if (!isOwner && !isAdmin) {
            return {
                error: "Forbidden",
                message: "Only admins and owners can remove members",
                statusCode: 403
            };
        }

        if (targetIsOwner && !isOwner) {
            return {
                error: "Forbidden",
                message: "Only owners can remove an owner from the community",
                statusCode: 403
            };
        }

        const { error: deleteError } = await supabase
            .from("community_members")
            .delete()
            .eq("id", membershipId);

        if (deleteError) {
            console.error("Error removing member:", deleteError);
            return {
                error: "Error removing member",
                message: "Error removing member",
                statusCode: 500
            };
        }

        if (communitySlug) {
            revalidatePath(`/communities/${communitySlug}/members`);
        }

        return {
            data: { message: "Member removed successfully" },
            error: undefined,
            message: "Member removed successfully",
            statusCode: 200
        };
    } catch (error) {
        console.error("Error removing member:", error);
        return {
            error: "Error removing member",
            message: "Error removing member",
            statusCode: 500
        };
    }
}

export async function inviteMemberByEmail(
    communityId: number,
    slug: string,
    email: string,
    role: CommunityRole
): Promise<GeneralResponse<{ message: string }>> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
            return {
                error: "Unauthorized",
                message: "You must be signed in to invite members",
                statusCode: 401
            };
        }

        const trimmedEmail = email?.trim().toLowerCase();
        if (!trimmedEmail) {
            return {
                error: "Invalid email",
                message: "Please enter a valid email address",
                statusCode: 400
            };
        }

        const { data: inviterMembership, error: inviterError } = await supabase
            .from("community_members")
            .select("role")
            .eq("community_id", communityId)
            .eq("user_id", currentUser.id)
            .single();

        if (inviterError || !inviterMembership) {
            return {
                error: "Forbidden",
                message: "You are not a member of this community",
                statusCode: 403
            };
        }

        const isOwner = inviterMembership.role === CommunityRole.OWNER;
        const isAdmin = inviterMembership.role === CommunityRole.ADMIN;
        if (!isOwner && !isAdmin) {
            return {
                error: "Forbidden",
                message: "Only owners and admins can invite members",
                statusCode: 403
            };
        }

        const { data: inviteeUser, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", trimmedEmail)
            .maybeSingle();

        if (userError) {
            console.error("Error looking up user by email:", userError);
            return {
                error: "Error looking up user",
                message: "Could not find user with this email",
                statusCode: 500
            };
        }

        if (!inviteeUser) {
            return {
                error: "User not found",
                message: "No account found with this email. They need to sign up first.",
                statusCode: 404
            };
        }

        if (inviteeUser.id === currentUser.id) {
            return {
                error: "Invalid invite",
                message: "You cannot invite yourself",
                statusCode: 400
            };
        }

        const { data: existingMembership, error: existingError } = await supabase
            .from("community_members")
            .select("id, member_status")
            .eq("community_id", communityId)
            .eq("user_id", inviteeUser.id)
            .maybeSingle();

        if (existingError) {
            console.error("Error checking existing membership:", existingError);
            return {
                error: "Error checking membership",
                message: "Could not verify membership status",
                statusCode: 500
            };
        }

        if (existingMembership) {
            const alreadyInvited = existingMembership.member_status === CommunityMemberStatus.PENDING;
            return {
                error: alreadyInvited ? "Already invited" : "Already a member",
                message: alreadyInvited
                    ? "This user has already been invited to the community."
                    : "This user is already a member of the community.",
                statusCode: 400
            };
        }

        const { error: insertError } = await supabase
            .from("community_members")
            .insert({
                community_id: communityId,
                user_id: inviteeUser.id,
                role,
                member_status: CommunityMemberStatus.PENDING,
                invited_at: new Date().toISOString(),
                invited_by: currentUser.id
            });

        if (insertError) {
            console.error("Error creating invite:", insertError);
            return {
                error: "Error sending invitation",
                message: "Failed to send invitation",
                statusCode: 500
            };
        }

        revalidatePath(`/communities/${slug}/members`);
        revalidatePath(`/communities/${slug}/settings`);

        return {
            data: { message: "Invitation sent successfully" },
            error: undefined,
            message: "Invitation sent successfully",
            statusCode: 200
        };
    } catch (error) {
        console.error("Error inviting member:", error);
        return {
            error: "Error sending invitation",
            message: "Error sending invitation",
            statusCode: 500
        };
    }
}