"use client"
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { redirect } from "next/navigation";

export default function SignOutEveryWhereButton() {
    const supabase = createSupabaseBrowserClient();
    return (
        <Button
            onClick={() => {
                supabase.auth.signOut({
                    scope: 'global'
                });
                redirect("/login");
            }}
            className="bg-grey-200 px-4 py-6 hover:bg-grey-300 transition-colors duration-200 text-grey-900 font-semibold text-sm">
            Log Out Everywhere
        </Button>
    )
}