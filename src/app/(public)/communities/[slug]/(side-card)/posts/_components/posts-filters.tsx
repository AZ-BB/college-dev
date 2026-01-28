"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { Tables } from "@/database.types";
import { Button } from "@/components/ui/button";
import SecondaryTabs from "@/components/secondery-tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { buildPostsQueryString, formatSortByLabel } from "./posts-filters.utils";
import AddTopicButton from "./add-topic-button";
import { UserAccess } from "@/enums/enums";
import AccessControl from "../../../../../../../components/access-control";

export default function PostsFilters({
    topics,
    communityId,
    initialSelectedTopic,
    initialSortBy,
}: {
    topics: Tables<"topics">[];
    communityId: number;
    initialSelectedTopic: string;
    initialSortBy: string;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [selectedTopic, setSelectedTopic] = useState(initialSelectedTopic);
    const [selectedSortBy, setSelectedSortBy] = useState(initialSortBy);
    const isFirstRun = useRef(true);

    // Sync state from server when URL (props) change after navigation or redirect
    useEffect(() => {
        setSelectedTopic(initialSelectedTopic);
        setSelectedSortBy(initialSortBy);
    }, [initialSelectedTopic, initialSortBy]);

    // Sync filters to URL: replace (no history spam), canonical shape, skip on mount
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const qs = buildPostsQueryString(selectedTopic, selectedSortBy);
        startTransition(() => {
            router.replace(qs ? `${pathname}?${qs}` : pathname);
        });
    }, [selectedTopic, selectedSortBy, pathname, router]);


    return (
        <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
                <div className="max-w-xl overflow-x-auto">
                    <SecondaryTabs
                        value={selectedTopic || "all"}
                        onTabChange={(value) => setSelectedTopic(value.toLowerCase().replaceAll(" ", "_"))}
                        tabs={[
                            { label: "All", value: "all" },
                            ...topics.map((topic) => ({ label: topic.name, value: topic.id.toString() })),
                        ]}
                    />

                </div>
                <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                    <AddTopicButton communityId={communityId} />
                </AccessControl>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"outline"} className="h-full text-sm font-semibold px-1.5 rounded-[14px]">
                        {formatSortByLabel(selectedSortBy)}
                        <ChevronDownIcon className="size-5" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedSortBy("default")}>
                        Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedSortBy("new")}>
                        New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedSortBy("top")}>
                        Top
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}