import { getCommunityBySlug } from "@/action/communities";
import Filters from "./_components/filters";
import { getCommunityMembersCounts } from "@/action/members";
import PaginationControl from "@/components/pagination-control";
import { CommunityMemberStatus } from "@/enums/enums";
import { Suspense } from "react";
import MembersList from "./_components/members-list";
import { Skeleton } from "@/components/ui/skeleton";

export default async function MembersPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{
        page?: string,
        tab?: CommunityMemberStatus,
    }>
}) {
    const { slug } = await params;
    const { page, tab } = await searchParams;

    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) return null;

    // Only fetch counts here - members will be fetched in MembersList component
    const { data: counts, error: countsError } = await getCommunityMembersCounts(community.id);

    const currentPage = page ? parseInt(page) : 1;
    const currentTab = (tab && ['LEAVING_SOON', 'CHURNED', 'BANNED'].includes(tab)) ? tab : CommunityMemberStatus.ACTIVE;

    // Calculate total count based on current tab for pagination
    const totalCount = currentTab === CommunityMemberStatus.ACTIVE ? (counts?.all || 0)
        : currentTab === CommunityMemberStatus.LEAVING_SOON ? (counts?.leavingSoon || 0)
            : currentTab === CommunityMemberStatus.CHURNED ? (counts?.churned || 0)
                : currentTab === CommunityMemberStatus.BANNED ? (counts?.banned || 0)
                    : (counts?.all || 0);

    return (
        <div className="space-y-6">
            <Filters counts={{
                all: counts?.all || 0,
                leavingSoon: counts?.leavingSoon || 0,
                churned: counts?.churned || 0,
                banned: counts?.banned || 0,
            }} />

            <Suspense
                key={`${community.id}-${currentPage}-${currentTab}`}
                fallback={
                    <div className="space-y-6">
                        <div className="animate-pulse space-y-8">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-8 rounded-[10px] w-1/2" />
                                    <Skeleton className="h-32 rounded-[10px] w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                }
            >
                <MembersList
                    communityId={community.id}
                    page={currentPage}
                    tab={currentTab}
                    community={{
                        pricing: community.pricing,
                        billing_cycle: community.billing_cycle,
                        amount_per_month: community.amount_per_month,
                        amount_per_year: community.amount_per_year,
                        amount_one_time: community.amount_one_time,
                    }}
                />
            </Suspense>

            {
                totalCount > 10 && (
                    <PaginationControl currentPage={currentPage} maxPages={Math.ceil(totalCount / 10)} />
                )
            }
        </div>
    )
}