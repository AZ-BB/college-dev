'use client';

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function CommunityTabs({ tabs }: { tabs: { label: string, value: string, href: string, count?: number }[] }) {
    const pathname = usePathname();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const getCurrentTab = () => {
        return tabs.find(tab => pathname === tab.href)?.value || 'activity';
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const checkScroll = () => {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        };

        // Initial check
        checkScroll();

        // Add scroll event listener
        container.addEventListener('scroll', checkScroll);

        // Check on window resize
        window.addEventListener('resize', checkScroll);

        return () => {
            container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    return (
        <div className="relative w-full lg:overflow-hidden">
            {/* Left overlay */}
            <div
                className={`absolute -left-px top-0 bottom-0 w-8 bg-linear-to-r from-gray-100/70 to-transparent pointer-events-none transition-opacity duration-200 lg:hidden ${canScrollLeft ? 'opacity-100' : 'opacity-0'
                    }`}
                aria-hidden="true"
            />

            {/* Right overlay */}
            <div
                className={`absolute -right-px top-0 bottom-0 w-8 bg-linear-to-l from-gray-100/70 to-transparent pointer-events-none transition-opacity duration-200 lg:hidden ${canScrollRight ? 'opacity-100' : 'opacity-0'
                    }`}
                aria-hidden="true"
            />

            <Tabs
                value={getCurrentTab()}
                className="w-full lg:overflow-hidden overflow-x-auto scrollbar-hide"
                ref={scrollContainerRef}
            >
                <TabsList variant="underline">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            <Link href={tab.href}>
                                {tab.label}
                            </Link>
                            {tab.count !== undefined && (
                                <span className="ml-2 px-1.5 py-0.5 text-sm font-semibold bg-gray-200 text-gray-600 rounded-md">
                                    {tab.count}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}