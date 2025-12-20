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
        <div className="w-full pt-8 flex flex-col items-center">
            <div className="w-full max-w-4xl px-4">
                {/* Filter and Dropdown Header */}
                <div className="flex items-center justify-between mb-8 mt-12">
                    <div className="flex bg-[#F8F9FA] p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                activeFilter === "all"
                                    ? "bg-white text-[#FF6B00] shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All Posts And Comments
                        </button>
                        <button
                            onClick={() => setActiveFilter("posts")}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                activeFilter === "posts"
                                    ? "bg-white text-[#FF6B00] shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Only Posts
                        </button>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border bg-white cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                        <span className="text-sm font-semibold">Bots University</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Feed Item */}
                <Card className="border-none shadow-[0px_2px_12px_rgba(0,0,0,0.04)] rounded-[32px] overflow-hidden mb-12 bg-white">
                    <CardContent className="p-8">
                        {/* Post Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[17px] text-[#1A1A1A]">John Smith</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                                        <span>22h.</span>
                                        <span className="text-[#D1D5DB]">•</span>
                                        <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2 py-0.5 rounded-lg border border-[#E5E7EB]/50">
                                            <MessageCircle className="h-3.5 w-3.5 text-[#FF6B00]" />
                                            <span className="text-[13px] font-medium">Feedback Exchange</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-32 w-44 rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB]/30">
                                <img 
                                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400" 
                                    alt="Post thumbnail"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-6">
                            <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-2 leading-tight">Tried something once again</h3>
                            <p className="text-[#4B5563] text-[16px] leading-relaxed">Can i ask for your opinion / advice please 🙏</p>
                        </div>

                        {/* Post Actions/Stats */}
                        <div className="flex items-center gap-8 mb-8">
                            <div className="flex items-center gap-2.5 group cursor-pointer">
                                <div className="p-2 rounded-full group-hover:bg-[#F8F9FA] transition-colors">
                                    <ThumbsUp className="h-5 w-5 text-[#4B5563]" />
                                </div>
                                <span className="text-[15px] font-medium text-[#4B5563]">20</span>
                            </div>
                            <div className="flex items-center gap-2.5 group cursor-pointer">
                                <div className="p-2 rounded-full group-hover:bg-[#F8F9FA] transition-colors">
                                    <MessageSquare className="h-5 w-5 text-[#4B5563]" />
                                </div>
                                <span className="text-[15px] font-medium text-[#4B5563]">23</span>
                            </div>
                            <button className="text-[14px] text-[#3B82F6] font-semibold hover:underline decoration-2 underline-offset-4 ml-auto">
                                New comment 5m ago
                            </button>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 group">
                                    <Avatar className="h-11 w-11 mt-1 shrink-0 border border-white shadow-sm">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>JS</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-[#F1F3F5]/60 rounded-[24px] px-6 py-4 transition-colors group-hover:bg-[#F1F3F5]/80">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="font-bold text-[15px] text-[#1A1A1A]">John Smith</span>
                                            <span className="text-[#9CA3AF] text-[13px]">•</span>
                                            <span className="text-[#6B7280] text-[13px] font-medium">1 like</span>
                                            <span className="text-[#9CA3AF] text-[13px]">•</span>
                                            <span className="text-[#6B7280] text-[13px]">3h</span>
                                        </div>
                                        <p className="text-[15px] text-[#374151] leading-relaxed">
                                            <span className="text-[#3B82F6] font-semibold cursor-pointer hover:underline">@Sara yong</span> thanks so much for your feedback, much appreciated 😍🙏
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
