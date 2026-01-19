import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <Skeleton className="h-8 w-40 rounded-md" />

            {/* Post */}
            <div className="flex flex-col gap-4">
                {/* Post Header */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-4 w-32 rounded-md" />
                        <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                </div>

                {/* Post Title */}
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-1/2 rounded-md" />
                </div>

                {/* Post Content */}
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
            </div>

            {/* Post */}
            <div className="flex flex-col gap-4">
                {/* Post Header */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex flex-col gap-2 flex-1">
                        <Skeleton className="h-4 w-32 rounded-md" />
                        <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                </div>

                {/* Post Title */}
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-1/2 rounded-md" />
                </div>

                {/* Post Content */}
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
            </div>
        </div>
    )
}