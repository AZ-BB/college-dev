import { headers } from "next/headers"
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

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/auth",
  "/auth/callback",
  "/forget-password",
  "/auth/reset-password",
  "/communities",
  "/onboarding",
  "/verify-email",
  "/privacy",
]

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (pathname.startsWith("/auth/")) return true
  if (pathname.startsWith("/communities/")) return true
  return false
}

export async function getUserData(): Promise<UserData> {
  try {
    const pathname = (await headers()).get("x-pathname") ?? null
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      if (isPublicPath(pathname)) return {} as UserData
      return redirect("/login")
    }

    const { data: dbUser, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, avatar_url, username")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching user data:", error)
      return {} as UserData;
    }

    return dbUser as UserData
  } catch (error) {
    console.error("Error fetching user data:", error)
    return {} as UserData;
  }
}