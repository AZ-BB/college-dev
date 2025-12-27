'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProfileTabsProps {
    username: string;
    ownershipsCount: number;
    membershipsCount: number;
}

export default function ProfileTabs({ username, ownershipsCount, membershipsCount }: ProfileTabsProps) {
    const pathname = usePathname();

    const getCurrentTab = () => {
        if (pathname === `/profile/${username}/contribution`) return 'contribution';
        if (pathname === `/profile/${username}/ownerships`) return 'ownerships';
        if (pathname === `/profile/${username}/memberships`) return 'memberships';
        return 'activity';
    };

    return (
        <Tabs value={getCurrentTab()} className="w-full lg:overflow-hidden overflow-x-scroll">
            <TabsList variant="underline">
                <TabsTrigger value="activity">
                    <Link href={`/profile/${username}`}>
                        Activity
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="contribution">
                    <Link href={`/profile/${username}/contribution`} >
                        Contribution
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="ownerships">
                    <Link href={`/profile/${username}/ownerships`}>
                        Ownerships
                        <span className="ml-2 px-1.5 py-0.5 text-sm font-semibold bg-[#F1F5F9] text-[#64748B] rounded-md">
                            {ownershipsCount}
                        </span>
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="memberships">
                    <Link href={`/profile/${username}/memberships`}>
                        Memberships
                        <span className="ml-2 px-1.5 py-0.5 text-sm font-semibold bg-[#F1F5F9] text-[#64748B] rounded-md">
                            {membershipsCount}
                        </span>
                    </Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}