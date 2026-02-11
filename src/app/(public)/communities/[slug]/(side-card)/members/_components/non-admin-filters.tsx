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

export default function NonAdminFilters({
    counts,
    communitySlug
}: {
    counts: {
        all: number,
        admins: number,
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
        <div className="flex gap-4 items-center justify-between">
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
                    { label: "Admins", value: "admins", count: counts.admins },
                ]}
            />

            <div className="flex gap-1">
                <InviteMemberLinkModal slug={communitySlug}>
                    <Button variant={'ghost'} className="text-sm font-semibold text-orange-500 px-1.5 hover:bg-orange-50">
                        <AddUserIcon className="size-5 stroke-orange-500" />
                        Invite
                    </Button>
                </InviteMemberLinkModal>
            </div>
        </div>
    )
}