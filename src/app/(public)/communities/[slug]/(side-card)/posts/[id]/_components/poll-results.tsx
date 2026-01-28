"use client";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatart";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PollResultUser {
    first_name: string;
    last_name: string;
    avatar: string | null;
    username: string;
}

interface PollResultOption {
    id: number;
    poll_id: number;
    text: string;
    vote_count: number;
    users: PollResultUser[];
}

interface PollResultsData {
    total_votes: number;
    options: PollResultOption[];
}

export default function PollResults({ pollResults }: { pollResults: PollResultsData }) {
    const { total_votes, options } = pollResults;

    const calculatePercentage = (voteCount: number): number => {
        if (total_votes === 0) return 0;
        return Math.round((voteCount / total_votes) * 100);
    };

    return (
        <Card className="shadow-none border-grey-200 px-6">
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Poll</h3>
                {options.map((option) => {
                    const percentage = calculatePercentage(option.vote_count);
                    return (
                        <div
                            key={option.id}
                            className="relative h-13 px-4 bg-white rounded-xl border border-orange-500 overflow-hidden"
                        >
                            {/* Percentage bar */}
                            <div
                                className="absolute inset-0 bg-orange-50 rounded-lg transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />

                            {/* Content */}
                            <div className="relative h-full flex items-center justify-between gap-4">
                                {/* Option text */}
                                <p className="text-sm text-grey-600 font-medium flex-1 z-10">
                                    {option.text}
                                </p>

                                {/* Right side: Avatars and vote count */}
                                <div className="flex flex-col items-end gap-0.5 z-10">
                                    {/* User avatars */}
                                    {option.users && option.users.length > 0 && (
                                        <div className="flex items-center -space-x-2">
                                            {option.users.slice(0, 4).map((user, index) => (
                                                <Link href={`/profile/${user.username}`} key={`${user.username}-${index}`}
                                                    className="relative hover:scale-120 transition-all duration-300"
                                                    style={{ zIndex: option.users.length - index }}
                                                >
                                                    <UserAvatar
                                                        user={{
                                                            avatar_url: user.avatar,
                                                            first_name: user.first_name,
                                                            last_name: user.last_name,
                                                            username: user.username,
                                                        }}
                                                        className="w-5 h-5 rounded-full text-xs border-2 border-white"
                                                    />
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Vote count */}
                                    <span className="text-xs font-semibold text-grey-600">
                                        {option.vote_count} {option.vote_count === 1 ? 'Vote' : 'Votes'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
