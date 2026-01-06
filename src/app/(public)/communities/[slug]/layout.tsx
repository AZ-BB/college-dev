import CommunityTabs from "./_components/community-tabs";

export default async function CommunityLayout({ children, params }: { children: React.ReactNode, params: Promise<{ slug: string }> }) {
    const { slug } = await params

    return (
        <div className="w-full mx-auto">
            {/* Tabs Section */}
            <CommunityTabs tabs={[
                { label: "Community", value: "community", href: `/communities/${slug}/posts` },
                { label: "Classrooms", value: "classrooms", href: `/communities/${slug}/classrooms` },
                { label: "Members", value: "members", href: `/communities/${slug}/members` },
                { label: "About", value: "about", href: `/communities/${slug}` },
            ]} />

            <div className="flex pt-10">
                <div className="w-full sm:w-[70%]">
                    {children}
                </div>

                {/* Community Card */}
                <div className="w-full sm:w-[30%]">
                    <div className="h-96 w-full sm:border sm:border-gray-200 sm:shadow-[0px_3px_6px_0px_#00000014] p-6 rounded-[20px] flex flex-col gap-5">

                    </div>
                </div>
            </div>
        </div>
    )
}