'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsTabsProps {
    ownershipsCount: number;
    membershipsCount: number;
}

export default function SettingsTabs({ ownershipsCount, membershipsCount }: SettingsTabsProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-full sm:w-[80%]">
            <h1 className="text-4xl font-bold font-generalSans mb-8 hidden sm:block">Settings</h1>
            
            {/* Mobile: Horizontal tabs */}
            <div className="flex gap-2 sm:hidden overflow-x-auto pb-2 -mx-10 px-0">
                <Link
                    href="/settings/ownership"
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        isActive('/settings/ownership')
                            ? "bg-orange-primary text-white"
                            : "text-gray-600"
                    )}
                >
                    <span>Ownership</span>
                    <span className={cn(
                        "px-1.5 py-0.5 text-xs font-semibold rounded-md",
                        isActive('/settings/ownership')
                            ? "bg-white/20 text-white"
                            : "bg-[#F1F5F9] text-[#64748B]"
                    )}>
                        {ownershipsCount}
                    </span>
                </Link>
                <Link
                    href="/settings/memberships"
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        isActive('/settings/memberships')
                            ? "bg-orange-primary text-white"
                            : "text-gray-600"
                    )}
                >
                    <span>Memberships</span>
                    <span className={cn(
                        "px-1.5 py-0.5 text-xs font-semibold rounded-md",
                        isActive('/settings/memberships')
                            ? "bg-white/20 text-white"
                            : "bg-[#F1F5F9] text-[#64748B]"
                    )}>
                        {membershipsCount}
                    </span>
                </Link>
                <Link
                    href="/settings/details"
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        isActive('/settings/details')
                            ? "bg-orange-primary text-white"
                            : "text-gray-600"
                    )}
                >
                    <span>Details</span>
                </Link>
                <Link
                    href="/settings/account"
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        isActive('/settings/account')
                            ? "bg-orange-primary text-white"
                            : "text-gray-600"
                    )}
                >
                    <span>Account</span>
                </Link>
                <Link
                    href="/settings/payouts"
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        isActive('/settings/payouts')
                            ? "bg-orange-primary text-white"
                            : "text-gray-600"
                    )}
                >
                    <span>Payouts</span>
                </Link>
                <Link
                    href="/settings/payments"
                    className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        isActive('/settings/payments')
                            ? "bg-orange-primary text-white"
                            : "text-gray-600"
                    )}
                >
                    <span>Payments</span>
                </Link>
            </div>

            {/* Desktop: Vertical sidebar */}
            <div className="hidden sm:flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">COMMUNITY</p>
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/settings/ownership"
                            className={cn(
                                "flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive('/settings/ownership')
                                    ? "bg-white text-gray-900"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <span>Ownership</span>
                            <span className="px-1.5 py-0.5 text-xs font-semibold bg-[#F1F5F9] text-[#64748B] rounded-md">
                                {ownershipsCount}
                            </span>
                        </Link>
                        <Link
                            href="/settings/memberships"
                            className={cn(
                                "flex items-center justify-start gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive('/settings/memberships')
                                    ? "bg-orange-primary text-white"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <span>Memberships</span>
                            <span className={cn(
                                "px-1.5 py-0.5 text-xs font-semibold rounded-md",
                                isActive('/settings/memberships')
                                    ? "bg-white/20 text-white"
                                    : "bg-[#F1F5F9] text-[#64748B]"
                            )}>
                                {membershipsCount}
                            </span>
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">PROFILE</p>
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/settings/details"
                            className={cn(
                                "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive('/settings/details')
                                    ? "bg-orange-primary text-white"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Details
                        </Link>
                        <Link
                            href="/settings/account"
                            className={cn(
                                "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive('/settings/account')
                                    ? "bg-orange-primary text-white"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Account
                        </Link>
                        <Link
                            href="/settings/payouts"
                            className={cn(
                                "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive('/settings/payouts')
                                    ? "bg-orange-primary text-white"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Payouts
                        </Link>
                        <Link
                            href="/settings/payments"
                            className={cn(
                                "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive('/settings/payments')
                                    ? "bg-orange-primary text-white"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            Payments
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

