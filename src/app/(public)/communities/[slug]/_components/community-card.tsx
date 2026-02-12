import { getCommunityBySlug } from "@/action/communities";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobeIcon, LockIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { CoverImageUpload } from "./cover-image-upload";
import AccessControl from "../../../../../components/access-control";
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import Link from "next/link";
import JoinOrBannedMessage from "./join-or-banned-message";
import { InviteMemberLinkModal } from "@/components/invite-member-link";

export default async function CommunityCard({ slug }: { slug: string }) {
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) {
        return notFound();
    }

    return (
        <div className="sticky top-20 w-full sm:border sm:border-grey-200 sm:shadow-[0px_3px_6px_0px_#00000014] rounded-[20px] flex flex-col gap-5">

            <div>
                <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                    <CoverImageUpload
                        coverImage={community.cover_image}
                        commSlug={slug}
                    />
                </AccessControl>
                <AccessControl allowedAccess={[UserAccess.NOT_MEMBER, UserAccess.ANONYMOUS, UserAccess.MEMBER]}>
                    {
                        community.cover_image ? (
                            <img
                                key={community.cover_image}
                                src={community.cover_image}
                                alt="Community cover"
                                className="h-56 w-full object-cover rounded-t-[20px]"
                            />
                        ) : (
                            <div className="h-56 w-full object-cover rounded-t-[20px] bg-grey-200" />
                        )
                    }
                </AccessControl>
            </div>

            <div className="p-6 flex flex-col gap-6">
                <div>
                    <h1 className="font-semibold text-lg">
                        About
                    </h1>
                    <span className="font-semibold text-grey-700 text-sm">
                        thecollege.co.in/{slug}
                    </span>
                </div>

                <div className="flex items-center justify-between px-4">
                    <div className="flex flex-col text-center">
                        <span className="text-lg font-bold">{community.member_count}</span>
                        <span className="text-grey-600">members</span>
                    </div>
                    <div className="flex flex-col text-center">
                        <span className="text-lg font-bold">10</span>
                        <span className="text-grey-600">online</span>
                    </div>
                    <div className="flex flex-col text-center">
                        <span className="text-lg font-bold">{community.posts_count[0].count}</span>
                        <span className="text-grey-600">posts</span>
                    </div>
                </div>

                <div className="w-full">
                    <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN]}>
                        <Link href={`/communities/${slug}/settings`}>
                            <Button
                                variant="secondary"
                                className="w-full py-7"
                            >
                                CONFIGURE
                            </Button>
                        </Link>
                    </AccessControl>

                    <AccessControl allowedAccess={[UserAccess.NOT_MEMBER]}>
                        <JoinOrBannedMessage
                            questions={community.community_questions ?? []}
                            communityId={community.id}
                            communityName={community.name}
                            slug={slug}
                            isPublic={community.is_public ?? false}
                            isFree={community.is_free ?? false}
                            amountPerMonth={community.amount_per_month ?? null}
                            amountPerYear={community.amount_per_year ?? null}
                            amountOneTime={community.amount_one_time ?? null}
                            billingCycle={community.billing_cycle ?? null}
                        />
                    </AccessControl>

                    <AccessControl allowedAccess={[UserAccess.MEMBER]} allowedStatus={[CommunityMemberStatus.ACTIVE, CommunityMemberStatus.LEAVING_SOON]}>
                        <InviteMemberLinkModal slug={slug}>
                            <Button
                                variant="secondary"
                                className="w-full py-7"
                            >
                                Invite Members
                            </Button>
                        </InviteMemberLinkModal>
                    </AccessControl>

                    <AccessControl allowedAccess={[UserAccess.MEMBER]} allowedStatus={[CommunityMemberStatus.PENDING]}>
                        <Button
                            disabled
                            variant="secondary"
                            className="w-full py-7"
                        >
                            Request sent
                        </Button>
                    </AccessControl>

                    <AccessControl allowedAccess={[UserAccess.ANONYMOUS]}>
                        <Link href={`/signup`}>
                            <Button
                                variant="default"
                                className="w-full py-7"
                            >
                                Sign Up
                            </Button>
                        </Link>
                    </AccessControl>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                    {
                        community.is_public ? (
                            <>
                                <div className="flex justify-center items-center">
                                    <GlobeIcon className="w-6 h-6 text-grey-700" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm">Public Community</span>
                                    <span className="text-xs">This community is visible to everyone</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center items-center">
                                    <LockIcon className="w-6 h-6 text-grey-700" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm">Private Community</span>
                                    <span className="text-xs">This community is visible to members only</span>
                                </div>
                            </>
                        )
                    }
                </div>
            </div >
        </div >
    )
}

export function CommunityCardSkeleton() {
    return (
        <Skeleton className="w-full min-h-[600px] animate-pulse rounded-[20px] flex flex-col gap-5">
        </Skeleton>
    )
}