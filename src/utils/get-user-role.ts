import { SystemRoles } from "@/enums/SystemRoles"
import { createSupabaseServerClient } from "@/utils/supabase-server"

export async function getUserRole(): Promise<SystemRoles | null> {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const { data: dbUser, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()
            

        if (error) {
            console.error("Error fetching user role:", error)
            return null
        }

        return (dbUser?.role as SystemRoles) || null
    } catch (error) {
        console.error("Error fetching user role:", error)
        return null
    }
}