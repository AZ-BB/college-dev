import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/action/profile";
import EditIcon from "@/components/icons/edit";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminServerClient, createSupabaseServerClient } from "@/utils/supabase-server";
import SignOutEveryWhereButton from "./_components/SignOutEveryWhereButton";
import { PasswordSection } from "./_components/PasswordSection";

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


            <div className="space-y-10">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-bold">Email</span>
                        <span className="text-base font-medium">{result.data.email}</span>
                    </div>

                    <div className="p-1.5 hover:bg-gray-100 rounded-lg cursor-not-allowed opacity-50 transition-colors duration-200">
                        <EditIcon />
                    </div>
                </div>

                <PasswordSection />

                <div className="flex sm:items-center gap-2 sm:flex-row flex-col justify-start items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-bold">Log out of all devices</span>
                        <span className="text-base font-medium">Log out of all active sessions on all devices.</span>
                    </div>

                    <SignOutEveryWhereButton />
                </div>

            </div>



        </div>
    );
}

