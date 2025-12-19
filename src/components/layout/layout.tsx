'use client';
import { usePathname } from "next/navigation";
import Footer from "./footer";
import Header from "./header";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const noHeaderFooterRoutes = [
        '/login',
        '/signup',
        '/forget-password',
        '/onboarding',
        '/verify-email',
    ]

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            {noHeaderFooterRoutes.includes(pathname) ? null : <Header />}
            <div className="mx-auto max-w-6xl px-4">{children}</div>
            {noHeaderFooterRoutes.includes(pathname) ? null : <Footer />}
        </div>
    );
}