"use client"

import { SystemRoles } from "@/enums/SystemRoles"
import { createContext, useContext, ReactNode } from "react"

interface RoleContextType {
    role: SystemRoles | null
    isLoading: boolean
}

const RoleContext = createContext<RoleContextType>({
    role: null,
    isLoading: false
})

interface RoleProviderProps {
    children: ReactNode
    initialRole: SystemRoles | null
}

export function RoleProvider({ children, initialRole }: RoleProviderProps) {
    // We use the initialRole passed from the server, so no loading state needed on client
    // if we were fetching here, we would need state and effect.
    
    return (
        <RoleContext.Provider value={{ role: initialRole, isLoading: false }}>
            {children}
        </RoleContext.Provider>
    )
}

export function useUserRole() {
    const context = useContext(RoleContext)
    if (context === undefined) {
        throw new Error("useUserRole must be used within a RoleProvider")
    }
    return context
}

