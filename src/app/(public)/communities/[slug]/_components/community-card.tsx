import { getCommunityBySlug } from "@/action/communities";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobeIcon, LockIcon, UploadIcon } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function CommunityCard({ slug }: { slug: string }) {
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    console.log(community);

    if (communityError || !community) {
        return notFound();
    }

    return (
        <div className="sticky top-20 w-full sm:border sm:border-gray-200 sm:shadow-[0px_3px_6px_0px_#00000014] rounded-[20px] flex flex-col gap-5">

            <div>
                {
                    community.cover_image ? (
                        <div className="group relative">
                            <Image
                                src={community.cover_image}
                                alt={community.name}
                                className="h-56 w-auto object-cover rounded-t-[20px]"
                                width={400}
                                height={200}
                            />

                            <div className="absolute inset-0 bg-black/10 hover:bg-black/30 cursor-pointer flex items-center justify-center gap-2 group-hover:opacity-100 transition-all duration-300 rounded-t-[20px]">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <UploadIcon className="w-6 h-6 stroke-white" />
                                    <span className="font-semibold text-white">
                                        Upload Cover Photo
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-56 bg-gray-200 rounded-t-[20px] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-300 transition-all duration-300">
                            <UploadIcon className="w-6 h-6 stroke-gray-700" />
                            <span className="font-semibold text-gray-600">
                                Upload Cover Photo
                            </span>
                        </div>
                    )
                }
            </div>

            <div className="p-6 flex flex-col gap-6">
                <div>
                    <h1 className="font-semibold text-lg">
                        About
                    </h1>
                    <span className="font-semibold text-gray-700 text-sm">
                        thecollege.co.in/{slug}
                    </span>
                </div>

                <div className="flex items-center justify-between px-4">
                    <div className="flex flex-col text-center">
                        <span className="text-lg font-bold">{community.member_count}</span>
                        <span className="text-gray-600">members</span>
                    </div>
                    <div className="flex flex-col text-center">
                        <span className="text-lg font-bold">10</span>
                        <span className="text-gray-600">online</span>
                    </div>
                    <div className="flex flex-col text-center">
                        <span className="text-lg font-bold">{community.posts_count[0].count}</span>
                        <span className="text-gray-600">posts</span>
                    </div>
                </div>

                <div className="w-full">
                    <Button
                        variant="secondary"
                        className="w-full py-7"
                    >
                        Configure
                    </Button>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                    {
                        community.is_public ? (
                            <>
                                <div className="flex justify-center items-center">
                                    <GlobeIcon className="w-6 h-6 text-gray-700" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm">Public Community</span>
                                    <span className="text-xs">This community is visible to everyone</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center items-center">
                                    <LockIcon className="w-6 h-6 text-gray-700" />
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