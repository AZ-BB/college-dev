'use client';

import GroupIcon from "@/components/icons/group";
import Tabs from "../../../../components/tabs";
import { use } from "react";
import BookIcon from "@/components/icons/book";
import MemberIcon from "@/components/icons/member";
import InfoIcon from "@/components/icons/info";
import { Separator } from "@/components/ui/separator";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadIcon from "@/components/icons/upload";

export default function CommunityLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    return (
        <div className="w-full mx-auto">
            {/* Tabs Section */}
            <Tabs tabs={[
                { label: "Community", value: "community", href: `/communities/${slug}/posts`, icon: GroupIcon },
                { label: "Classrooms", value: "classrooms", href: `/communities/${slug}/classrooms`, icon: BookIcon },
                { label: "Members", value: "members", href: `/communities/${slug}/members`, icon: MemberIcon },
                { label: "About", value: "about", href: `/communities/${slug}`, icon: InfoIcon }
            ]} />

            <div className="flex pt-10">
                <div className="w-full sm:w-[70%]">
                    {children}
                </div>

                {/* Community Card */}
                <div className="w-full sm:w-[30%]">
                    <div className="w-full sm:border sm:border-gray-200 sm:shadow-[0px_3px_6px_0px_#00000014] rounded-[20px] flex flex-col gap-5">

                        <div className="h-56 bg-gray-200 rounded-t-[20px] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-300 transition-all duration-300">
                            <UploadIcon className="w-6 h-6 stroke-gray-700" />
                            <span className="font-semibold text-gray-600">
                                Upload Cover Photo
                            </span>
                        </div>

                        <div className="p-6 flex flex-col gap-6">
                            <div>
                                <h1 className="font-semibold text-lg">
                                    About
                                </h1>
                                <span className="font-semibold text-gray-700 text-sm">
                                    thecollege.co.in/{'test-123'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between px-4">
                                <div className="flex flex-col text-center">
                                    <span className="text-lg font-bold">120K</span>
                                    <span className="text-gray-600">members</span>
                                </div>
                                <div className="flex flex-col text-center">
                                    <span className="text-lg font-bold">13</span>
                                    <span className="text-gray-600">online</span>
                                </div>
                                <div className="flex flex-col text-center">
                                    <span className="text-lg font-bold">12</span>
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
                                <div className="flex justify-center items-center">
                                    <LockIcon className="w-6 h-6 text-gray-700" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-sm">Private Community</span>
                                    <span className="text-xs">This community is visible to members only</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}