"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { useUserAccess } from "@/contexts/access-context"
import JoinCommunityModal from "./join-community-modal"
import { Tables } from "@/database.types"
import { useCallback } from "react"
import { toast } from "sonner"

type BillingCycle = "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY" | "ONE_TIME" | null;

interface JoinOrBannedMessageProps {
    questions: Tables<"community_questions">[]
    communityId: number
    communityName: string
    slug: string
    isPublic: boolean
    isFree: boolean
    amountPerMonth: number | null
    amountPerYear: number | null
    amountOneTime: number | null
    billingCycle: BillingCycle
}

export default function JoinOrBannedMessage(props: JoinOrBannedMessageProps) {
    const { isBanned } = useUserAccess();

    const handleShare = useCallback(() => {
        const link = `${window.location.origin}/communities/${props.slug}`;
        navigator.clipboard
            .writeText(link)
            .then(() => toast.success("Community link copied to clipboard"))
            .catch(() => toast.error("Failed to copy link"));
    }, [props.slug]);

    if (isBanned) {
        return (
            <div className="flex flex-col gap-3 w-full">
                <Button
                    variant="default"
                    className="w-full py-7"
                    disabled
                >
                    Join
                </Button>
                <p className="text-sm text-destructive font-medium">
                    You are banned from this community
                </p>
                <Button
                    variant="secondary"
                    className="w-full py-7"
                    onClick={handleShare}
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                </Button>
            </div>
        );
    }

    return (
        <JoinCommunityModal
            questions={props.questions}
            communityId={props.communityId}
            communityName={props.communityName}
            slug={props.slug}
            isPublic={props.isPublic}
            isFree={props.isFree}
            amountPerMonth={props.amountPerMonth}
            amountPerYear={props.amountPerYear}
            amountOneTime={props.amountOneTime}
            billingCycle={props.billingCycle}
        />
    );
}
