"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

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

const ContributionHeatmap = ({ username }: { username: string }) => {
    const year = 2025;
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine the 4 months to show by default based on current quarter
    const getCurrentMonthRange = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-11
        const currentQuarter = Math.floor(currentMonth / 3); // 0-3

        // Show 4 months centered around the current quarter
        // Q1 (Jan-Mar): show Jan, Feb, Mar, Apr (0, 1, 2, 3)
        // Q2 (Apr-Jun): show Apr, May, Jun, Jul (3, 4, 5, 6)
        // Q3 (Jul-Sep): show Jul, Aug, Sep, Oct (6, 7, 8, 9)
        // Q4 (Oct-Dec): show Sep, Oct, Nov, Dec (8, 9, 10, 11)
        const quarterStartMonth = currentQuarter * 3;
        let startMonth: number;

        if (currentQuarter === 0) {
            startMonth = 0;
        } else if (currentQuarter === 3) {
            startMonth = 8; // Q4: start from September to include 4 months
        } else {
            startMonth = quarterStartMonth; // Q2: start from April, Q3: start from July
        }

        return [startMonth, startMonth + 1, startMonth + 2, startMonth + 3];
    };

    const visibleMonthRange = getCurrentMonthRange();

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
        <div className="w-full flex flex-col sm:flex-col">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-12 gap-y-8">
                {months.map((month, monthIndex) => {
                    const daysInMonth = getDaysInMonth(monthIndex, year);
                    const isHiddenOnMobile = !isExpanded && monthIndex >= 2;
                    const isHiddenOnDesktop = !isExpanded && !visibleMonthRange.includes(monthIndex);

                    return (
                        <div key={month} className={cn(
                            "flex flex-col gap-3",
                            isHiddenOnMobile ? "hidden sm:flex" : "flex",
                            isHiddenOnDesktop ? "lg:hidden" : ""
                        )}>
                            <span className="text-base font-semibold text-gray-900">{month}</span>
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


            <div className='flex justify-between items-center sm:pt-4'>
                {isExpanded ? (
                    <button
                        className="flex my-4 items-center gap-2 w-fit text-base font-semibold text-orange-500 hover:text-orange-600 hover:underline cursor-pointer"
                        onClick={() => setIsExpanded(false)}>
                        <ChevronUpIcon className="w-6 h-6" />
                        Show Less
                    </button>
                ) : (
                    <button
                        className="flex my-4 items-center gap-2 w-fit text-base font-semibold text-orange-500 hover:text-orange-600 hover:underline cursor-pointer"
                        onClick={() => setIsExpanded(true)}>
                        <ChevronDownIcon className="w-6 h-6" />
                        Show More
                    </button>
                )
                }

                <div className="flex items-center gap-2 sm:hidden">
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

            <div className="hidden mt-4 sm:mb-0 space-y-2 sm:space-y-0 flex-col sm:flex sm:flex-row items-start justify-between text-sm text-[#94A3B8]">
                <div className="font-medium text-[#64748B] flex items-center gap-2">
                    <span className='w-[18px] h-[18px] bg-gray-200 rounded-[4px] flex items-center justify-center' /> - Comments and posts by {username}
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