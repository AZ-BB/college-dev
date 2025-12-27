import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsDetailsPage() {
    const result = await getCurrentUserProfile();

    if (result.error || !result.data) {
        redirect("/login");
    }

    return (
        <div className="w-full ">
            <SettingsForm 
                user={result.data} 
                contributionsCount={result.data.contributions_count || 0} 
            />
        </div>
    );
}

