import { createSupabaseServerClient } from "@/utils/supabase-server"
import { redirect } from "next/navigation"

export interface UserData {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  username?: string
}

export async function getUserData(): Promise<UserData> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login");

    const { data: dbUser, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, avatar_url, username")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching user data:", error)
      return redirect("/login");
    }

    return dbUser as UserData
  } catch (error) {
    console.error("Error fetching user data:", error)
    return redirect("/login");
  }
}