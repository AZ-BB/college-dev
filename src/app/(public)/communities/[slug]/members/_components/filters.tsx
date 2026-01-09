'use client';
import SecondaryTabs from "@/components/secondery-tabs";
import { CommunityMemberStatus } from "@/enums/enums";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Filters({
    counts
}: {
    counts: {
        all: number,
        leavingSoon: number,
        churned: number,
        banned: number,
    }
}) {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", tab);
            router.push(`?${params.toString()}`);
        }
    }, []);

    return (
        <div className="flex gap-4 items-center">
            <SecondaryTabs
                defaultValue={searchParams.get("tab") || "all"}
                onTabChange={(value: string) => {
                    if (value === "all") {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("tab");
                        router.push(`?${params.toString()}`);
                        return;
                    }
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("tab", value);
                    router.push(`?${params.toString()}`);
                }}
                tabs={[
                    { label: "All", value: "all", count: counts.all },
                    { label: "Leaving Soon", value: CommunityMemberStatus.LEAVING_SOON, count: counts.leavingSoon },
                    { label: "Churned", value: CommunityMemberStatus.CHURNED, count: counts.churned },
                    { label: "Banned", value: CommunityMemberStatus.BANNED, count: counts.banned },
                ]}
            />
        </div>
    )
}