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
import { UserAccess } from "@/enums/enums";

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

    const { data: posts, error: postsError } = await getPosts(community.id, initialTopic, initialSortBy, { limit: 10, offset: 0 });

    console.log(posts);

    return (
        <div className="w-full space-y-5">
            <PostsFilters
                topics={topics}
                communityId={community.id}
                initialSelectedTopic={initialTopic}
                initialSortBy={initialSortBy}
            />


            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                <CreatePostModal user={user} topics={topics.map((topic) => ({ id: topic.id, name: topic.name }))} />
            </AccessControl>

            <FirstSteps community={community} />

            <PostsList
                initalPosts={posts || []}
                communityId={community.id}
                topic={initialTopic}
                sortBy={initialSortBy}
            />
        </div >
    )
}   