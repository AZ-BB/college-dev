import { CommunitySettingsModal } from "./_components/community-settings-modal"

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    return (
        <div>
            <CommunitySettingsModal
                slug={slug}
                asModal
            />
        </div>
    )
}
