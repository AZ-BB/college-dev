"use client";
import { UserAccess } from "@/enums/enums";
import { useUserAccess } from "./access-context";

export default function AccessControl({
    children,
    allowedAccess = [],
    allowedUserId = undefined
}: {
    children: React.ReactNode,
    allowedAccess: UserAccess[],
    allowedUserId?: string
}) {
    const { userAccess, userId } = useUserAccess();

    const isAllowedByUserId = allowedUserId !== undefined && userId === allowedUserId;
    const isAllowedByAccess = allowedAccess.includes(userAccess);
    const isAllowed = isAllowedByUserId || isAllowedByAccess;

    if (!isAllowed) return null;

    return (
        <div>
            {children}
        </div>
    )
}