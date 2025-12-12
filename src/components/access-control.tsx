"use client"

import { SystemRole } from "@/db/enums"
import { useUserRole } from "@/contexts/role-context"

interface AccessControlProps {
    children: React.ReactNode
    allowedRoles: SystemRole[]
}

export default function AccessControl({
    children,
    allowedRoles
}: AccessControlProps) {
    const { role } = useUserRole()

    if (!role || !allowedRoles.includes(role)) {
        return null
    }
    
    return <>{children}</>
}
