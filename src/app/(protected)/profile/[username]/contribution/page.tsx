"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ChevronDown,
    MessageCircle,
    MessageSquare,
    ThumbsUp,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import ContributionHeatmap from "../_components/ContributionHeatmap";

export default function Contribution() {
    const [activeFilter, setActiveFilter] = useState("all")

    return (
        <div className="w-full min-h-screen  pt-8 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                {/* Filter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={cn(
                                "px-6 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all",
                                activeFilter === "all"
                                    ? "bg-[#FFF1E7] text-[#FF6B00]"
                                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                            )}
                        >
                            All Posts And Comments
                        </button>
                        <button
                            onClick={() => setActiveFilter("posts")}
                            className={cn(
                                "px-6 py-3 rounded-full text-sm cursor-pointer font-semibold transition-all",
                                activeFilter === "posts"
                                    ? "bg-[#FFF1E7] text-[#FF6B00]"
                                    : "text-[#6B7280] hover:text-[#1A1A1A]"
                            )}
                        >
                            Only Posts
                        </button>
                    </div>

                    <div className="w-[200px] sm:w-fit flex items-center gap-2 px-4 py-2 rounded-[16px] border border-transparent sm:border-[#F1F3F5] bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-bold text-[#1A1A1A]">Bots University</span>
                        <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                    </div>
                </div>

                {/* Feed Item */}
                <Card className="shadow-none border border-[#F4F4F6] rounded-[24px] overflow-hidden mb-12 bg-white">
                    <CardContent className="p-6 md:p-10">
                        {/* Post Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-3 md:gap-4">
                                <Avatar className="h-12 w-12 md:h-14 md:w-14 rounded-2xl shrink-0">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h2 className="font-bold text-[17px] md:text-[19px] text-[#1A1A1A] leading-none">John Smith</h2>
                                    <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-[#6B7280]">
                                        <span>22h.</span>
                                        <div className="flex items-center gap-1">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.4035 4.7845C13.8685 4.94031 14.2727 5.23824 14.5592 5.63623C14.8456 6.03421 14.9998 6.51214 15 7.0025C15 8.0385 14.3245 8.909 13.388 9.2205C13.408 9.3465 13.428 9.477 13.428 9.613C13.428 10.9105 12.382 11.962 11.091 11.962C10.54 11.962 10.0445 11.7605 9.6445 11.4435C9.49819 11.7586 9.26497 12.0255 8.97224 12.2126C8.67951 12.3998 8.33944 12.4995 7.992 12.5C7.261 12.5 6.6355 12.0675 6.34 11.4435C5.93194 11.7778 5.42099 11.9609 4.8935 11.962C3.6025 11.962 2.556 10.9105 2.556 9.613C2.556 9.482 2.575 9.36 2.594 9.234L2.596 9.2205C2.13114 9.06461 1.72699 8.76664 1.44062 8.36866C1.15425 7.97068 1.00012 7.4928 1 7.0025C1 5.9665 1.6705 5.0965 2.6015 4.7795C2.57785 4.64992 2.56447 4.51868 2.5615 4.387C2.5615 3.0895 3.608 2.038 4.899 2.038C5.4495 2.038 5.9455 2.2395 6.3455 2.556C6.49188 2.24096 6.72513 1.97424 7.01786 1.78718C7.31058 1.60012 7.65061 1.50049 7.998 1.5C8.734 1.5 9.3595 1.9325 9.66 2.5615C10.0681 2.22723 10.579 2.04408 11.1065 2.043C12.3975 2.043 13.444 3.0945 13.444 4.392C13.444 4.523 13.425 4.645 13.406 4.771L13.4035 4.7845ZM3.5 13.25C3.5 13.5815 3.3683 13.8995 3.13388 14.1339C2.89946 14.3683 2.58152 14.5 2.25 14.5C1.91848 14.5 1.60054 14.3683 1.36612 14.1339C1.1317 13.8995 1 13.5815 1 13.25C1 12.9185 1.1317 12.6005 1.36612 12.3661C1.60054 12.1317 1.91848 12 2.25 12C2.58152 12 2.89946 12.1317 3.13388 12.3661C3.3683 12.6005 3.5 12.9185 3.5 13.25Z" fill="#E1D8EC" />
                                            </svg>

                                            <span className="text-[#E5E7EB]">|</span>
                                            <span className="font-medium text-[#6B7280]">Feedback Exchange</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:block h-24 w-32 md:h-28 md:w-40 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400"
                                    alt="Post thumbnail"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-6">
                            <h3 className="text-[22px] md:text-[24px] font-bold text-[#1A1A1A] mb-2 leading-tight">Tried something once again</h3>
                            <p className="text-[#4B5563] text-[16px] md:text-[17px] leading-relaxed">Can i ask for your opinion / advice please 🙏</p>
                        </div>

                        {/* Mobile Thumbnail */}
                        <div className="sm:hidden mb-6 h-48 w-full rounded-xl overflow-hidden shadow-sm">
                            <img
                                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400"
                                alt="Post thumbnail"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Post Actions/Stats */}
                        <div className="flex items-center gap-6 md:gap-8 mb-8">
                            <div className="flex items-center gap-2.5 cursor-pointer group">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.48047 18.35L10.5805 20.75C10.9805 21.15 11.8805 21.35 12.4805 21.35H16.2805C17.4805 21.35 18.7805 20.45 19.0805 19.25L21.4805 11.95C21.9805 10.55 21.0805 9.34997 19.5805 9.34997H15.5805C14.9805 9.34997 14.4805 8.84997 14.5805 8.14997L15.0805 4.94997C15.2805 4.04997 14.6805 3.04997 13.7805 2.74997C12.9805 2.44997 11.9805 2.84997 11.5805 3.44997L7.48047 9.54997" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" />
                                    <path d="M2.38086 18.3499V8.5499C2.38086 7.1499 2.98086 6.6499 4.38086 6.6499H5.38086C6.78086 6.6499 7.38086 7.1499 7.38086 8.5499V18.3499C7.38086 19.7499 6.78086 20.2499 5.38086 20.2499H4.38086C2.98086 20.2499 2.38086 19.7499 2.38086 18.3499Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <span className="text-[16px] font-medium text-[#1A1A1A]">20</span>
                            </div>
                            <div className="flex items-center gap-2.5 cursor-pointer group">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68999 8.28985 2 13.1698 2C18.0498 2 21.9998 5.68999 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13 15.2298C13 16.4198 12.56 17.5198 11.82 18.3898C10.83 19.5898 9.26 20.3598 7.5 20.3598L4.89 21.9098C4.45 22.1798 3.89 21.8098 3.95 21.2998L4.2 19.3298C2.86 18.3998 2 16.9098 2 15.2298C2 13.4698 2.94 11.9198 4.38 10.9998C5.27 10.4198 6.34 10.0898 7.5 10.0898C10.54 10.0898 13 12.3898 13 15.2298Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <span className="text-[16px] font-medium text-[#1A1A1A]">23</span>
                            </div>
                            <button className="text-[14px] md:text-[15px] text-[#3B82F6] font-bold hover:underline ml-2">
                                New comment 5m ago
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[#F4F4F6] w-full mb-8" />

                        {/* Comments Section */}
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3 md:gap-4">
                                    <Avatar className="h-9 w-9 md:h-11 md:w-11 rounded-2xl shrink-0">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>JS</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-[#F1F3F5] rounded-[24px] px-6 py-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-[15px] text-[#1A1A1A]">John Smith</span>
                                            <span className="text-[#6B7280] text-[13px]">1 like</span>
                                            <div className="w-[6px] h-[6px] rounded-full bg-[#CBCFD4] mx-1" />
                                            <span className="text-[#6B7280] text-[13px]">3h</span>
                                        </div>
                                        <p className="text-[15px] text-[#485057] leading-relaxed">
                                            <span className=" font-semibold cursor-pointer hover:underline">@Sara yong</span> thanks so much for your feedback, much appreciated 😍🙏
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
