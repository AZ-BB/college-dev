export function PricingTab() {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-lg font-bold text-grey-900">Pricing Model</p>
            <p>Choose how members can join and access this community</p>

            <div className="flex gap-2">
                <div className="p-4 border border-grey-300 rounded-lg w-1/2 opacity-50">
                    <p className="text-base font-bold text-grey-900">Earning Community</p>
                    <p className="text-sm text-grey-600">You can add one-time payment, monthly, yearly, or both options, and members will select one.</p>
                </div>

                <div className="p-4 border border-grey-300 rounded-lg bg-grey-200 w-1/2">
                    <p className="text-base font-bold text-grey-900">Free Community</p>
                    <p className="text-sm text-grey-600">Members can join for free and access all features.</p>
                </div>
            </div>
        </div>
    )
}