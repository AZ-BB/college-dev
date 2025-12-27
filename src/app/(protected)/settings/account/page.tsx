import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";

export default async function SettingsAccountPage() {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold text-gray-900 font-generalSans mb-6">
                Account
            </h1>
            <p className="text-gray-500">Account settings page coming soon.</p>
        </div>
    );
}

