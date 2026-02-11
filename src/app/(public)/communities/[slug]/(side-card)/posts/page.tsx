import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FirstSteps from "./_components/first-steps";
import PostsFilters from "./_components/posts-filters";
import { getCommunityBySlug } from "@/action/communities";
import { getTopics } from "@/action/topics";
import { getPosts } from "@/action/posts";
import {
    buildPostsQueryString,
    validateSortBy,
    validateTopic,
} from "./_components/posts-filters.utils";
import { Tables } from "@/database.types";
import CreatePostModal from "./_components/create-post-modal";
import { getUserData } from "@/utils/get-user-data";
import PostCard from "./_components/post-card";
import PostsList from "./_components/posts-list";
import AccessControl from "../../../../../../components/access-control";
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import Link from "next/link";

function validateSearchParams(sp: { topic?: string; sortBy?: string }, topics: Tables<"topics">[], slug: string) {
    const validTopicIds = new Set(topics.map((t) => t.id.toString()));
    const initialTopic = validateTopic(sp.topic, validTopicIds);
    const initialSortBy = validateSortBy(sp.sortBy);

    const desiredQs = buildPostsQueryString(initialTopic, initialSortBy);

    // Redirect when URL is not canonical (invalid params, or "all"/"default" in URL)
    const hasTopic = sp.topic != null && String(sp.topic).trim() !== "";
    const hasSortBy = sp.sortBy != null && String(sp.sortBy).trim() !== "";
    const shouldRedirect =
        (initialTopic === "all" && hasTopic) ||
        (initialTopic !== "all" && sp.topic !== initialTopic) ||
        (initialSortBy === "default" && hasSortBy) ||
        (initialSortBy !== "default" && sp.sortBy !== initialSortBy);

    if (shouldRedirect) {
        redirect(`/communities/${slug}/posts${desiredQs ? `?${desiredQs}` : ""}`);
    }

    return { initialTopic, initialSortBy };
}

export default async function PostsPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ topic?: string; sortBy?: string }>;
}) {
    const { slug } = await params;
    const sp = await searchParams;

    const { data: community, error: communityError } = await getCommunityBySlug(slug);
    if (communityError || !community) return null;

    const { data: topics, error: topicsError } = await getTopics(community.id);
    if (topicsError || !topics) return null;

    const { initialTopic, initialSortBy } = validateSearchParams(sp, topics, slug);

    const user = await getUserData();

    const { data: posts } = await getPosts(community.id, initialTopic, initialSortBy, { limit: 10, offset: 0 }, user?.id);


    const supabase = await createSupabaseServerClient();
    const { count: pendingMembersCount } = await supabase.from("community_members")
        .select("id", { count: "exact", head: true })
        .eq("community_id", community.id)
        .eq("member_status", CommunityMemberStatus.PENDING);

    const hasPendingMembers = pendingMembersCount ? pendingMembersCount > 0 : false;

    const { count: reportedPostsCount } = await supabase.from("posts_reports")
        .select("id", { count: "exact", head: true })
        .eq("community_id", community.id);

    const hasReportedPosts = reportedPostsCount ? reportedPostsCount > 0 : false;

    return (
        <div className="w-full space-y-5">
            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                {
                    (hasReportedPosts || hasPendingMembers) && (
                        <div className="flex justify-start items-center gap-2">
                            {
                                hasReportedPosts && (
                                    <Link href={`/communities/${slug}/posts/reports`}
                                        className="hover:bg-grey-300 transition-all duration-300 w-1/2 flex items-center justify-start gap-2 bg-grey-200 rounded-lg p-2">
                                        <div className="text-base bg-red-600 w-8 h-8 flex items-center justify-center text-white rounded-lg font-semibold p-1">
                                            {reportedPostsCount}
                                        </div>

                                        <div className="text-base font-medium text-grey-900">
                                            Posts reported by members
                                        </div>
                                    </Link>
                                )
                            }

                            {
                                hasPendingMembers && (
                                    <Link href={`/communities/${slug}/members/pending`}
                                        className="hover:bg-grey-300 transition-all duration-300 w-1/2 flex items-center justify-start gap-2 bg-grey-200 rounded-lg p-2">
                                        <div className="text-base bg-red-600 w-8 h-8 flex items-center justify-center text-white rounded-lg font-semibold p-1">
                                            {pendingMembersCount}
                                        </div>

                                        <div className="text-base font-medium text-grey-900">
                                            Pending memebership requests
                                        </div>
                                    </Link>
                                )
                            }
                        </div>
                    )
                }
            </AccessControl>

            <PostsFilters
                topics={topics}
                communityId={community.id}
                initialSelectedTopic={initialTopic}
                initialSortBy={initialSortBy}
            />

            <AccessControl allowedStatus={[CommunityMemberStatus.ACTIVE]} allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                <CreatePostModal user={user} topics={topics} />
            </AccessControl>

            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                <FirstSteps community={community} />
            </AccessControl>

            <PostsList
                initalPosts={posts || []}
                communityId={community.id}
                topic={initialTopic}
                sortBy={initialSortBy}
                topics={topics}
                userId={user?.id}
            />
        </div >
    )
}