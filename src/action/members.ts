"use server";
import { Tables } from "@/database.types";
import { CommunityMemberStatus, CommunityRole } from "@/enums/enums";
import { GeneralResponse } from "@/utils/general-response";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { getUserData } from "@/utils/get-user-data";
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
        roles?: CommunityRole[],
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
            p_roles: filter?.roles || null,
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
    admins: number,
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

        const { count: admins, error: e5 } = await supabase.from("community_members")
            .select("*", { count: "exact", head: true })
            .eq("community_id", id)
            .in("role", [CommunityRole.ADMIN, CommunityRole.OWNER])

        if (e1 || e2 || e3 || e4 || e5) {
            console.error("Error fetching members counts:", e1 || e2 || e3 || e4 || e5)
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
                admins: admins || 0,
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

export async function joinCommunity(
    communityId: number,
    slug: string,
    options: { answers?: Record<number, string>; billingPlan?: "monthly" | "yearly" }
): Promise<GeneralResponse<{ memberId: number }>> {
    try {
        const supabase = await createSupabaseServerClient();

        // --- Auth ---
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return {
                error: "Not authenticated",
                message: "You must be signed in to join.",
                statusCode: 401,
            };
        }

        const { data: existing } = await supabase
            .from("community_members")
            .select("id")
            .eq("community_id", communityId)
            .eq("user_id", user.id)
            .maybeSingle();
        if (existing) {
            return {
                error: "Already a member",
                message: "You are already a member of this community.",
                statusCode: 400,
            };
        }

        // --- Community & questions ---
        const { data: community } = await supabase
            .from("communities")
            .select("is_free, is_public, amount_per_month, amount_per_year, amount_one_time, billing_cycle")
            .eq("id", communityId)
            .single();

        const { data: questions } = await supabase
            .from("community_questions")
            .select("id, type")
            .eq("community_id", communityId)
            .order("index", { ascending: true });

        const isFree = community?.is_free === true;
        const isPublic = community?.is_public === true;
        const questionIds = (questions ?? []).map((q) => q.id);
        const hasQuestions = questionIds.length > 0;
        const questionMap = new Map((questions ?? []).map((q) => [q.id, q.type]));

        // --- Join case: status + whether answers are required ---
        let status: CommunityMemberStatus;
        let requireAnswers: boolean;

        if (!isPublic && isFree) {
            // PRIVATE FREE: always PENDING (request to join)
            status = CommunityMemberStatus.PENDING;
            requireAnswers = hasQuestions;
        } else if (!isPublic && !isFree) {
            // PRIVATE PAID: ACTIVE after payment
            status = CommunityMemberStatus.ACTIVE;
            requireAnswers = hasQuestions;
        } else if (isPublic && !isFree) {
            // PUBLIC PAID: ACTIVE after payment
            status = CommunityMemberStatus.ACTIVE;
            requireAnswers = hasQuestions;
        } else {
            // PUBLIC FREE: PENDING if questions, ACTIVE if no questions
            status = hasQuestions ? CommunityMemberStatus.PENDING : CommunityMemberStatus.ACTIVE;
            requireAnswers = hasQuestions;
        }

        // --- Validate answers (required vs unexpected) ---
        if (requireAnswers) {
            const answers = options.answers ?? {};
            const missing = questionIds.filter((id) => {
                const answer = answers[id] ?? "";
                const questionType = questionMap.get(id);
                if (questionType === "MULTIPLE_CHOICE") {
                    // For MCQ, answer should be a JSON array string with at least one element
                    try {
                        const parsed = JSON.parse(answer);
                        return !Array.isArray(parsed) || parsed.length === 0;
                    } catch {
                        return true; // Invalid JSON or empty string
                    }
                }
                return !answer.trim();
            });
            if (missing.length > 0) {
                return {
                    error: "Answers required",
                    message: "Please answer all member questions.",
                    statusCode: 400,
                };
            }
        } else if (options.answers && Object.keys(options.answers).length > 0) {
            return {
                error: "Unexpected answers",
                message: "This community has no questions.",
                statusCode: 400,
            };
        }

        // --- Create membership ---
        const { data: newMember, error: insertError } = await supabase
            .from("community_members")
            .insert({
                community_id: communityId,
                user_id: user.id,
                role: CommunityRole.MEMBER,
                member_status: status,
                joined_at: status === CommunityMemberStatus.ACTIVE ? new Date().toISOString() : null,
            })
            .select("id")
            .single();

        if (insertError || !newMember) {
            console.error("Error joining community:", insertError);
            return {
                error: "Error joining community",
                message: insertError?.message ?? "Error joining community",
                statusCode: 500,
            };
        }

        // --- Save question answers when required ---
        if (requireAnswers && options.answers) {
            const answerRows = questionIds.map((questionId) => ({
                community_question_id: questionId,
                community_member_id: newMember.id,
                user_id: user.id,
                answer: String(options.answers![questionId] ?? "").trim(),
            }));
            const { error: answersError } = await supabase
                .from("community_questions_answers")
                .insert(answerRows);
            if (answersError) {
                console.error("Error saving answers:", answersError);
                await supabase.from("community_members").delete().eq("id", newMember.id);
                return {
                    error: "Error saving answers",
                    message: answersError.message,
                    statusCode: 500,
                };
            }
        }

        // --- Create payment record for paid communities ---
        if (!isFree && community) {
            let paymentType: "SUBSCRIPTION_MONTHLY_FEE" | "SUBSCRIPTION_YEARLY_FEE" | "SUBSCRIPTION_ONE_TIME_PAYMENT" | null = null;
            let paymentAmount: number = 0;

            if (community.billing_cycle === "ONE_TIME" && community.amount_one_time != null) {
                paymentType = "SUBSCRIPTION_ONE_TIME_PAYMENT";
                paymentAmount = Number(community.amount_one_time);
            } else if (community.billing_cycle === "MONTHLY" && community.amount_per_month != null) {
                paymentType = "SUBSCRIPTION_MONTHLY_FEE";
                paymentAmount = Number(community.amount_per_month);
            } else if (community.billing_cycle === "YEARLY" && community.amount_per_year != null) {
                paymentType = "SUBSCRIPTION_YEARLY_FEE";
                paymentAmount = Number(community.amount_per_year);
            } else if (community.billing_cycle === "MONTHLY_YEARLY") {
                // Use the billing plan selected by the user
                if (options.billingPlan === "yearly" && community.amount_per_year != null) {
                    paymentType = "SUBSCRIPTION_YEARLY_FEE";
                    paymentAmount = Number(community.amount_per_year);
                } else if (community.amount_per_month != null) {
                    // Default to monthly if not specified or if monthly selected
                    paymentType = "SUBSCRIPTION_MONTHLY_FEE";
                    paymentAmount = Number(community.amount_per_month);
                }
            }

            if (paymentType) {
                const { error: paymentError } = await (supabase as any)
                    .from("payments")
                    .insert({
                        user_id: user.id,
                        comm_id: communityId,
                        amount: paymentAmount,
                        type: paymentType,
                        status: "PAID",
                    });

                if (paymentError) {
                    console.error("Error creating payment record:", paymentError);
                    // Don't fail the join if payment record fails, just log it
                }
            }
        }

        // --- Revalidate & respond ---
        revalidatePath(`/communities/${slug}`);
        revalidatePath(`/communities/${slug}`, "layout");
        return {
            data: { memberId: newMember.id },
            error: undefined,
            message: "Joined successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error joining community:", error);
        return {
            error: "Error joining community",
            message: "Error joining community",
            statusCode: 500,
        };
    }
}

export async function getMemberAnswers(
    communityMemberId: number
): Promise<GeneralResponse<{
    answers: Array<{
        id: number;
        question: string;
        answer: string;
        questionType: string;
    }>;
}>> {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: answers, error } = await supabase
            .from("community_questions_answers")
            .select(`
                id,
                answer,
                community_questions (
                    id,
                    content,
                    type
                )
            `)
            .eq("community_member_id", communityMemberId)
            .order("id", { ascending: true });

        if (error) {
            console.error("Error fetching member answers:", error);
            return {
                error: "Error fetching answers",
                message: error.message,
                statusCode: 500,
            };
        }

        const formattedAnswers = (answers || []).map((a: any) => {
            const question = a.community_questions;
            let questionText = question?.content || "Question";
            let answerText = a.answer;

            // For multiple choice, extract the question text and convert answer IDs to option texts
            if (question?.type === "MULTIPLE_CHOICE") {
                try {
                    const parsed = JSON.parse(question.content);
                    questionText = parsed.question || question.content;

                    // Try parsing answer as JSON array (multi-select) first
                    try {
                        const answerIndices = JSON.parse(a.answer);
                        if (Array.isArray(answerIndices) && parsed.options) {
                            // Multi-select: map all indices to option texts
                            const selectedOptions = answerIndices
                                .map((idx: string | number) => {
                                    const index = typeof idx === "string" ? parseInt(idx) : idx;
                                    return !isNaN(index) && parsed.options[index] ? parsed.options[index] : null;
                                })
                                .filter((opt: string | null) => opt !== null);
                            answerText = selectedOptions.length > 0 ? selectedOptions.join(", ") : a.answer;
                        } else {
                            // Fallback to single index (backward compatibility)
                            const answerIndex = typeof answerIndices === "number" ? answerIndices : parseInt(a.answer);
                            if (!isNaN(answerIndex) && parsed.options && parsed.options[answerIndex]) {
                                answerText = parsed.options[answerIndex];
                            }
                        }
                    } catch {
                        // Not JSON, try as single index string (backward compatibility)
                        const answerIndex = parseInt(a.answer);
                        if (!isNaN(answerIndex) && parsed.options && parsed.options[answerIndex]) {
                            answerText = parsed.options[answerIndex];
                        }
                    }
                } catch {
                    questionText = question.content;
                }
            }

            return {
                id: a.id,
                question: questionText,
                answer: answerText,
                questionType: question?.type || "TEXT",
            };
        });

        return {
            data: { answers: formattedAnswers },
            error: undefined,
            message: "Answers fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error fetching member answers:", error);
        return {
            error: "Error fetching answers",
            message: "Error fetching answers",
            statusCode: 500,
        };
    }
}

export async function getMemberPayments(
    userId: string,
    communityId: number
): Promise<GeneralResponse<{
    payments: Array<{
        id: number;
        amount: number;
        type: string;
        status: string;
        paid_at: string;
        classroom_name: string | null;
    }>;
}>> {
    try {
        const supabase = await createSupabaseServerClient();
        const currentUser = await getUserData();

        if (!currentUser) {
            return {
                error: "User not authenticated",
                message: "User not authenticated",
                statusCode: 401,
            };
        }

        // Fetch payments for this user in this community
        const { data: payments, error: paymentsError } = await (supabase as any)
            .from("payments")
            .select(`
                id,
                amount,
                type,
                status,
                paid_at,
                community_member_classrooms_id
            `)
            .eq("user_id", userId)
            .eq("comm_id", communityId)
            .order("paid_at", { ascending: false });

        if (paymentsError) {
            console.error("Error fetching payments:", paymentsError);
            return {
                error: "Error fetching payments",
                message: "Error fetching payments",
                statusCode: 500,
            };
        }

        // For each payment with a classroom reference, fetch the classroom name
        const paymentsWithClassrooms = await Promise.all(
            (payments || []).map(async (payment: any) => {
                let classroomName = null;
                
                if (payment.community_member_classrooms_id) {
                    const { data: memberClassroom } = await supabase
                        .from("community_member_classrooms")
                        .select("classroom_id")
                        .eq("id", payment.community_member_classrooms_id)
                        .single();

                    if (memberClassroom) {
                        const { data: classroom } = await supabase
                            .from("classrooms")
                            .select("name")
                            .eq("id", memberClassroom.classroom_id)
                            .single();

                        if (classroom) {
                            classroomName = classroom.name;
                        }
                    }
                }

                return {
                    id: payment.id,
                    amount: payment.amount,
                    type: payment.type,
                    status: payment.status,
                    paid_at: payment.paid_at,
                    classroom_name: classroomName,
                };
            })
        );

        return {
            data: { payments: paymentsWithClassrooms },
            error: undefined,
            message: "Payments fetched successfully",
            statusCode: 200,
        };
    } catch (error) {
        console.error("Error fetching member payments:", error);
        return {
            error: "Error fetching payments",
            message: "Error fetching payments",
            statusCode: 500,
        };
    }
}