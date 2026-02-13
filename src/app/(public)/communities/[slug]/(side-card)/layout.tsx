import { Separator } from "@/components/ui/separator";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadIcon from "@/components/icons/upload";
import { notFound } from "next/navigation";
import { getCommunityBySlug } from "@/action/communities";
import CommunityTabs from "../_components/community-tabs";
import { Suspense } from "react";
import CommunityCard, { CommunityCardSkeleton } from "../_components/community-card";
import { getUserMembership } from "@/utils/get-user-membership";

export default async function CommunityLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <div className="w-full mx-auto">
            {/* Tabs Section */}
            <CommunityTabs slug={slug} />

            <div className="flex pt-10 gap-10">
                <div className="w-full px-4 sm:px-0 sm:w-[70%]">
                    {children}
                </div>

                {/* Community Card */}
                <div className="hidden sm:block sm:w-[30%]">
                    <Suspense fallback={<CommunityCardSkeleton />}>
                        <CommunityCard slug={slug} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}