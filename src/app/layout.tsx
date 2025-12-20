import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans, } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RoleProvider } from "@/contexts/role-context";
import { getUserRole } from "@/utils/get-user-role";
import { getUserData } from "@/utils/get-user-data";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import Footer from "../components/layout/footer";
import Header from "../components/layout/header";
import { headers } from "next/headers";
import Layout from "@/components/layout/layout";


const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "The College",
  description:
    "Host your free or paid communities, courses, conversations and payments all in one place. No ads, no algorithms, no monthly fees. You fully own and control everything.",
  keywords: [
    "creator programs",
    "community platform",
    "online courses",
    "paid communities",
    "creator economy",
    "community hosting",
    "course platform",
    "creator tools",
    "no ads platform",
    "owned community",
  ],
  openGraph: {
    title: "The Better Place To Run Creator Programs",
    description:
      "Host your free or paid communities, courses, conversations and payments all in one place. No ads, no algorithms, no monthly fees.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Better Place To Run Creator Programs",
    description:
      "Host your free or paid communities, courses, conversations and payments all in one place. No ads, no algorithms, no monthly fees.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userRole = await getUserRole();
  const userData = await getUserData();


  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} antialiased font-instrumentSans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RoleProvider initialRole={userRole}>
            <Layout userData={userData}>
              {children}
            </Layout>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
