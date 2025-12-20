import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserProfileCard from "./_components/UserProfileCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-20 pt-14">
            <div className="w-[calc(100%-420px)]">
                <h1 className="text-6xl font-bold font-generalSans mb-8">
                    John Smith
                </h1>

                <Tabs defaultValue="activity" className="w-full">
                    <TabsList variant="underline">
                        <TabsTrigger value="activity">
                            <Link href="/profile">
                                Activity
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="contribution">
                            <Link href="/profile/contribution">
                                Contribution
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="ownerships">
                            <Link href="/profile/ownerships">
                                Ownerships
                                <span className="ml-2 px-1.5 py-0.5 text-sm font-semibold bg-[#F1F5F9] text-[#64748B] rounded-md">
                                    62
                                </span>
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="memberships">
                            <Link href="/profile/memberships">
                                Memberships
                                <span className="ml-2 px-1.5 py-0.5 text-sm font-semibold bg-[#F1F5F9] text-[#64748B] rounded-md">
                                    62
                                </span>
                            </Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                {children}
            </div>

            <div className="w-[420px]">
                <UserProfileCard />
            </div>
        </div>
    )
}