import { Button } from "@/components/ui/button"
import { getUserData } from "@/utils/get-user-data"
import Image from "next/image";

export default async function Contribution({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUserData();
    const isCurrentUser = user?.username === username;


    return (
        <div className="pt-8">
            {isCurrentUser && (
                <div className="text-center text-sm text-grey-600 font-medium w-full gap-8 flex flex-col items-center justify-center">
                    <Image
                        src="/placeholders/contribution.png"
                        alt="Empty state"
                        width={900}
                        height={900}
                        className="w-[300px] h-[300px] object-cover"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                        <span className="text-xl font-medium text-grey-900">You don’t grow alone. <br /> Join a community and contribute.</span>
                        <Button variant="default" className=" bg-orange-500 hover:bg-orange-600 text-white text-base">
                            Discover Communities
                        </Button>
                    </div>
                </div>
            )}

            {(!isCurrentUser) && (
                <div className="text-center w-full gap-8 flex flex-col items-center justify-center">
                    <span className="text-base font-medium text-grey-600">No Contribution Found</span>
                </div>
            )}
        </div>
    )
}
