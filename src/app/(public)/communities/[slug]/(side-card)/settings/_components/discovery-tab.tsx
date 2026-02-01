export function DiscoveryTab() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-lg font-bold text-grey-900">Discovery (Coming Soon)</h1>
                <p className="mt-1 text-sm text-grey-600">
                    To help high-quality communities get organically discovered on the platform, over time.
                </p>
            </div>

            <section>
                <h2 className="text-base font-bold text-grey-900">The Future</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-grey-600">
                    <li>Discovery is how communities on thecollege will reach new members in the future.</li>
                    <li>In the early stages, discovery is invite-only and manually curated.</li>
                    <li>As thecollege grows, communities with strong engagement, retention, and active creators will become eligible for discovery.</li>
                    <li>For now, the best way to grow your community is by inviting and sharing with your audience.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-base font-bold text-grey-900">Eligibility</h2>
                <p className="mt-1 text-sm text-grey-600">
                    Communities may be eligible for discovery based on:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-grey-600">
                    <li>Clear community description</li>
                    <li>High-quality cover image</li>
                    <li>Active creator participation</li>
                    <li>Consistent member engagement</li>
                    <li>Healthy retention over time</li>
                </ul>
                <p className="mt-2 text-sm text-grey-600">
                    Discovery will prioritize outcomes and quality, not spam or volume.
                </p>
            </section>

            <section>
                <h2 className="text-base font-bold text-grey-900">Important Note</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-grey-600">
                    <li>Discovery does not guarantee member growth.</li>
                    <li>Early communities grow primarily through creator-led sharing and invites.</li>
                    <li>Discovery is designed to reward strong communities, not replace creator effort.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-base font-bold text-grey-900">What&apos;s Next</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-grey-600">
                    <li>Discovery will roll out in phases as thecollege grows.</li>
                    <li>Creators will be notified when their community becomes eligible.</li>
                </ul>
            </section>
        </div>
    )
}
