import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";

export default async function SettingsPayoutsPage() {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold text-grey-900 font-generalSans mb-6">
                Payouts
            </h1>
            <p className="text-grey-500">Payouts settings page coming soon.</p>
        </div>
    );
}

