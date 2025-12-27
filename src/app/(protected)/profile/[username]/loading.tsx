import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

export default function ProfileLoading() {
    return (
        <div className="py-20 flex items-center justify-center">
            <Loader className="w-10 h-10 animate-spin text-[#F7670E]" />
        </div>
    )
}