'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProfileTabsProps {
    userId: string;
    ownershipsCount: number;
    membershipsCount: number;
}

export default function ProfileTabs({ userId, ownershipsCount, membershipsCount }: ProfileTabsProps) {
    const pathname = usePathname();

    const getCurrentTab = () => {
        if (pathname === `/profile/${userId}/contribution`) return 'contribution';
        if (pathname === `/profile/${userId}/ownerships`) return 'ownerships';
        if (pathname === `/profile/${userId}/memberships`) return 'memberships';
        return 'activity';
    };

    return (
        <Tabs value={getCurrentTab()} className="w-full lg:overflow-hidden overflow-x-scroll">
            <TabsList variant="underline">
                <TabsTrigger value="activity">
                    <Link href={`/profile/${userId}`}>
                        Activity
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="contribution">
                    <Link href={`/profile/${userId}/contribution`} >
                        Contribution
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="ownerships">
                    <Link href={`/profile/${userId}/ownerships`}>
                        Ownerships
                        <span className="ml-2 px-1.5 py-0.5 text-sm font-semibold bg-[#F1F5F9] text-[#64748B] rounded-md">
                            {ownershipsCount}
                        </span>
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="memberships">
                    <Link href={`/profile/${userId}/memberships`}>
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