"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tables } from "@/database.types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { voteOnPoll } from "@/action/posts";
import { toast } from "sonner";
import { UserAccess } from "@/enums/enums";
import AccessControl from "../../../../../../../../components/access-control";

export default function Poll({ poll }: { poll: Tables<'poll'> & { poll_options: Tables<'poll_options'>[] } }) {

    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const handleOptionClick = (option: number) => {
        setSelectedOption(option);
    }

    const handleVote = async () => {
        if (!selectedOption) {
            return;
        }

        const response = await voteOnPoll(poll.id, selectedOption);

        if (response.error) {
            toast.error(response.message);
            return;
        }

        toast.success(response.message);
    }

    return (
        <Card className="shadow-none border-grey-200 px-6">
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Poll</h3>
                {poll?.poll_options?.map((option) => (
                    <div key={option.id}
                        className={cn("py-4 px-4 bg-grey-200 rounded-lg border border-transparent hover:border-orange-500 transition-all duration-300", selectedOption === option.id && "border-orange-500")}
                        onClick={() => handleOptionClick(option.id)}>
                        <p className="text-sm text-grey-600 font-medium">{option.text}</p>
                    </div>
                ))}
            </div>

            <AccessControl allowedAccess={[UserAccess.OWNER, UserAccess.ADMIN, UserAccess.MEMBER]}>
                <div className="flex items-center justify-end">
                    <Button onClick={handleVote} disabled={!selectedOption} variant="default" className="rounded-[10px] py-5 text-sm font-semibold px-6">
                        Vote
                    </Button>
                </div>
            </AccessControl>
        </Card>
    )
}