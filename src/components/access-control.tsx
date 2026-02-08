"use client";
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import { useUserAccess } from "../contexts/access-context";

export default function AccessControl({
    children,
    allowedAccess = [],
    allowedUserId = undefined,
    allowedStatus = [],
    fallback = null
}: {
    children: React.ReactNode,
    allowedAccess: UserAccess[],
    allowedUserId?: string,
    allowedStatus?: CommunityMemberStatus[]
    fallback?: React.ReactNode
}) {
    const { userAccess, userId, userStatus } = useUserAccess();

    const isAllowedByUserId = allowedUserId !== undefined && userId === allowedUserId;
    const isAllowedByAccess = allowedAccess.includes(userAccess);
    const isAllowedByStatus = allowedStatus.length === 0 || userStatus === null || allowedStatus.includes(userStatus);
    const isAllowed = isAllowedByUserId || (isAllowedByAccess && isAllowedByStatus);


    if (!isAllowed) return fallback ?? null;

    return (
        <div>
            {children}
        </div>
    )
}