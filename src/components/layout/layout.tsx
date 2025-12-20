'use client';
import { usePathname } from "next/navigation";
import Footer from "./footer";
import Header from "./header";
import { UserData } from "@/utils/get-user-data";

export default function Layout({
    children,
    userData
}: {
    children: React.ReactNode
    userData: UserData | null
}) {
    const pathname = usePathname();
    console.log("pathname", pathname);

    const noHeaderFooterRoutes = [
        '/login',
        '/signup',
        '/forget-password',
        '/onboarding',
        '/verify-email',
    ]

    // Todo: Add a better way to handle child routes
    const noFooterRoutes = [
        '/profile',
        '/profile/contribution',
        '/profile/ownerships',
        '/profile/memberships',
    ]

    return (
        <div className="min-h-screen bg-white text-neutral-900 relative pb-10">
            {noHeaderFooterRoutes.includes(pathname) ? null : <Header userData={userData} />}
            <div className="mx-auto max-w-6xl px-4">{children}</div>
            {noHeaderFooterRoutes.includes(pathname) || noFooterRoutes.includes(pathname) ? null : <Footer />}
        </div>
    );
}