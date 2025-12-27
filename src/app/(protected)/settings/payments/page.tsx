import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";

export default async function SettingsPaymentsPage() {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold text-gray-900 font-generalSans mb-6">
                Payments
            </h1>
            <p className="text-gray-500">Payments settings page coming soon.</p>
        </div>
    );
}

