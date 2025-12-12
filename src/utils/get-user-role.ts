import { db } from "@/db"
import { users } from "@/db/schema/schema"
import { eq } from "drizzle-orm"
import { createSupabaseServerClient } from "@/utils/supabase-server"
import { SystemRole } from "@/db/enums"

export async function getUserRole(): Promise<SystemRole | null> {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: {
                role: true
            }
        })

        return (dbUser?.role as SystemRole) || null
    } catch (error) {
        console.error("Error fetching user role:", error)
        return null
    }
}

