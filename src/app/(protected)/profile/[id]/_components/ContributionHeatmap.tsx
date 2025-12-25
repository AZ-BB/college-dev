"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const colors = [
    "#FEF0E7",
    "#FDD0B4",
    "#FBB990",
    "#F9853E",
    "#E15E0D",
];

const emptyColor = "#F4F4F6"; // Very light grey for no activity

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];

const getDaysInMonth = (monthIndex: number, year: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
};

const ContributionHeatmap = () => {
    const year = 2025;
    const [isExpanded, setIsExpanded] = useState(false);

    // Generate mock data for each day of the year
    const generateMockActivity = (monthIndex: number, day: number) => {
        // Random level between 0 and 5
        // 0 means no activity (emptyColor)
        // 1-5 means levels from the colors array
        const random = Math.random();
        if (random < 0.3) return 0; // 30% chance of no activity
        return Math.floor(Math.random() * 5) + 1;
    };

    return (
        <div className="w-full flex flex-col-reverse sm:flex-col">
            {!isExpanded && (
                <div className="sm:hidden mt-4">
                    <button
                        className="text-sm font-semibold text-[#F9853E] border-[#F9853E] hover:bg-[#FEF0E7] hover:text-[#E15E0D] h-11"
                        onClick={() => setIsExpanded(true)}>
                        Show More
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-12 gap-y-8">
                {months.map((month, monthIndex) => {
                    const daysInMonth = getDaysInMonth(monthIndex, year);
                    const isHiddenOnMobile = !isExpanded && monthIndex >= 2;

                    return (
                        <div key={month} className={cn("flex flex-col gap-3", isHiddenOnMobile ? "hidden sm:flex" : "flex")}>
                            <span className="text-sm font-semibold text-[#0F172A] font-generalSans">{month}</span>
                            <div className="grid grid-cols-7 gap-1 w-fit">
                                {/* Squares for each day of the month */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const level = generateMockActivity(monthIndex, day);
                                    const backgroundColor = level === 0 ? emptyColor : colors[level - 1];

                                    return (
                                        <div
                                            key={day}
                                            className="w-[16px] h-[16px] rounded-[6px] transition-colors hover:ring-1 hover:ring-orange-300 cursor-default"
                                            style={{ backgroundColor }}
                                            title={`${month} ${day}, ${year}: ${level === 0 ? 'No' : level} contributions`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="sm:mt-12 mb-4 sm:mb-0 space-y-2 sm:space-y-0 flex-col sm:flex items-start justify-between text-sm text-[#94A3B8]">
                <div className="font-medium text-[#64748B]">
                    Comments and posts by John
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">Less</span>
                    <div className="flex gap-1">
                        <div className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: emptyColor }} />
                        {colors.map((color) => (
                            <div
                                key={color}
                                className="w-3.5 h-3.5 rounded-[3px]"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <span className="text-[#64748B]">More</span>
                </div>
            </div>
        </div>
    );
};

export default ContributionHeatmap;

