import { getCommunityBySlug } from "@/action/communities";
import { getTopics } from "@/action/topics";
import { getPostReports } from "@/action/posts-reports";
import { Tables } from "@/database.types";
import ReportedPostCard from "../_components/reported-post-card";
import AccessControl from "@/components/access-control";
import { UserAccess } from "@/enums/enums";

export default async function ReportsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const { data: community, error: communityError } = await getCommunityBySlug(slug);
    if (communityError || !community) return null;

    const { data: topics, error: topicsError } = await getTopics(community.id);
    if (topicsError || !topics) return null;

    const { data: reports, error: reportsError } = await getPostReports(community.id);

    if (reportsError) {
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading reports: {reportsError}</p>
            </div>
        );
    }

    return (
        <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
            <div className="w-full space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Reported Posts</h1>
                </div>

                {!reports || reports.length === 0 ? (
                    <div className="text-center py-12 text-grey-600">
                        <p className="text-lg font-medium">No reported posts</p>
                        <p className="text-sm mt-2">All posts are in good standing.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <ReportedPostCard
                                key={report.id}
                                report={report}
                                topics={topics}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AccessControl>
    );
}
