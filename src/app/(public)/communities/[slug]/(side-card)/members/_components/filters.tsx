'use client';
import AddUserIcon from "@/components/icons/add-user";
import ExportIcon from "@/components/icons/export";
import { InviteMemberLinkModal } from "@/components/invite-member-link";
import SecondaryTabs from "@/components/secondery-tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommunityMemberStatus } from "@/enums/enums";
import { ChevronDownIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, startTransition } from "react";

export default function Filters({
    counts,
    communitySlug
}: {
    counts: {
        all: number,
        leavingSoon: number,
        churned: number,
        banned: number,
    }
    communitySlug: string
}) {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", tab);
            // Use replace instead of push to avoid adding to history and make it faster
            router.replace(`?${params.toString()}`);
        }
    }, []);

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="min-w-0 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
            <SecondaryTabs
                defaultValue={searchParams.get("tab") || "all"}
                onTabChange={(value: string) => {
                    // Use startTransition to make navigation non-blocking
                    // React will show Suspense fallback immediately while navigation happens
                    startTransition(() => {
                        if (value === "all") {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete("tab");
                            router.push(`?${params.toString()}`);
                            return;
                        }
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("tab", value);
                        router.push(`?${params.toString()}`);
                    });
                }}
                tabs={[
                    { label: "All", value: "all", count: counts.all },
                    { label: "Leaving Soon", value: CommunityMemberStatus.LEAVING_SOON, count: counts.leavingSoon },
                    { label: "Churned", value: CommunityMemberStatus.CHURNED, count: counts.churned },
                    { label: "Banned", value: CommunityMemberStatus.BANNED, count: counts.banned },
                ]}
            />
            </div>

            <div className="flex gap-1 flex-shrink-0">
                <InviteMemberLinkModal slug={communitySlug}>
                    <Button variant={'ghost'} className="text-sm font-semibold text-orange-500 px-1.5 hover:bg-orange-50">
                        <AddUserIcon className="size-5 stroke-orange-500" />
                        Invite
                    </Button>
                </InviteMemberLinkModal>
                <Button variant={'ghost'} className="text-sm font-semibold text-grey-600 px-1.5">
                    <ExportIcon className="size-5 stroke-grey-600" />
                    Export
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="outline" className="text-sm font-semibold px-1.5">
                            Filter
                            <ChevronDownIcon className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Filter</DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}