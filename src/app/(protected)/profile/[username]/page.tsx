import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContributionHeatmap from "./_components/ContributionHeatmap";
import LikeIcon from "@/components/icons/like";
import DocumentIcon from "@/components/icons/document";
import CommentIcon from "@/components/icons/comment";
import PollIcon from "@/components/icons/poll";
import { getUserData } from "@/utils/get-user-data";

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUserData();

    return (
        <div className="w-full">

            <div className="items-center gap-12 py-7 hidden sm:flex">
                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-orange-50 rounded-[8px] flex items-center justify-center">
                        <LikeIcon />
                    </div>

                    <div className="space-x-1">
                        <span className="text-base font-semibold text-grey-900 font-generalSans">89</span>
                        <span className="text-base font-medium text-grey-700 font-generalSans">Likes</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-orange-50 rounded-[8px] flex items-center justify-center">
                        <DocumentIcon />
                    </div>

                    <div className="space-x-1">
                        <span className="text-base font-semibold text-grey-900 font-generalSans">89</span>
                        <span className="text-base font-medium text-grey-700 font-generalSans">Posts</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-orange-50 rounded-[8px] flex items-center justify-center">
                        <CommentIcon />
                    </div>

                    <div className="space-x-1">
                        <span className="text-base font-semibold text-grey-900 font-generalSans">89</span>
                        <span className="text-base font-medium text-grey-700 font-generalSans">Comments</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-[32px] h-[32px] bg-orange-50 rounded-[8px] flex items-center justify-center">
                        <PollIcon />
                    </div>

                    <div className="space-x-1">
                        <span className="text-base font-semibold text-grey-900 font-generalSans">89</span>
                        <span className="text-base font-medium text-grey-700 font-generalSans">Poll Votes</span>
                    </div>
                </div>

            </div>

            <div className="w-full flex items-center gap-3 pb-4 pt-6 sm:pt-0">
                <span className="text-sm font-semibold text-grey-900">{new Date().getFullYear()}</span>

                <div className="h-px bg-grey-200 w-full flex-1">

                </div>

                <span className="block sm:hidden text-sm font-medium text-grey-500">*Comments and posts by you</span>
            </div>

            <ContributionHeatmap username={username === user?.username ? 'you' : username || ''} />
        </div>
    )
}
