import { UserData } from "@/utils/get-user-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tables } from "@/database.types";

export default function UserAvatar({ user, className }: { user: UserData | Partial<Tables<"users">>, className?: string }) {
    return (
        <Avatar className={cn("rounded-lg w-11 h-11", className)}>
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className={cn("text-xl font-semibold rounded-lg w-11 h-11", className)}>{user.first_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
    )
}