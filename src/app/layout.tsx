import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RoleProvider } from "@/contexts/role-context";
import { getUserRole } from "@/utils/get-user-role";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import Footer from "./components/footer";
import Header from "./components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js App Template",
  description:
    "A modern Next.js application template with shadcn/ui components",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userRole = await getUserRole();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RoleProvider initialRole={userRole}>
            <div className="min-h-screen bg-white text-neutral-900">
              <Header />
              <div className="mx-auto max-w-6xl px-4">{children}</div>
              <Footer />
            </div>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
