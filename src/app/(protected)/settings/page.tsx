import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "@/action/profile"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const result = await getCurrentUserProfile()

  if (result.error || !result.data) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <SettingsForm user={result.data} />
    </div>
  )
}

