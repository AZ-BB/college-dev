import { getUserData } from "@/utils/get-user-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default async function SavedPosts({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUserData();
    const isCurrentUser = user?.username === username;

    if (!user || user?.username !== username) {
        return notFound();
    }

    return (
        <div className="pt-8">
            {isCurrentUser && (
                <div className="text-center text-sm text-grey-600 font-medium w-full gap-8 flex flex-col items-center justify-center">
                    <Image
                        src="/placeholders/saved-posts.png"
                        alt="Empty state"
                        width={900}
                        height={900}
                        className="w-[300px] h-[300px] object-cover"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <span className="text-xl font-medium text-grey-900">Join a community to save posts that matter.</span>
                        <Button variant="default" className=" bg-orange-500 hover:bg-orange-600 text-white text-base">
                            Discover Communities
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}