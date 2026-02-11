import { Community } from "@/action/communities"
import { Globe, LockIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/utils/communities"
import UsersIcon from "@/components/icons/users"
import MoneyIcon from "@/components/icons/money"
import UserAvatar from "@/components/user-avatart"

export default function CommunityDetails({ community }: { community: Community }) {
    return (
        <div className="flex gap-12 font-semibold">
            {community.is_public ? (
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>Public</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <LockIcon className="w-5 h-5" />
                    <span>Private</span>
                </div>
            )}

            <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 stroke-grey-900" />
                <span>
                    {community.member_count >= 1000
                        ? `${(community.member_count / 1000).toFixed(community.member_count >= 100000 ? 0 : 1)}K`
                        : community.member_count}{" "}
                    members
                </span>
            </div>

            {community.is_free ? (
                <div className="flex items-center gap-2">
                    <MoneyIcon className="w-5 h-5 stroke-grey-900" />
                    <span>Free</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <MoneyIcon className="w-5 h-5 stroke-grey-900" />
                    <span>{formatPrice(Number(community.price), "INR")}</span>
                </div>
            )}

            <div className="flex items-center gap-2">
                <UserAvatar className="w-6 h-6 rounded-full" user={community.created_by} />
                <span className="">
                    By {community.created_by?.first_name || "Unknown"} {community.created_by?.last_name || ""}
                </span>
            </div>
        </div>
    )
}