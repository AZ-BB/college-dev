import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Sans, } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getUserData } from "@/utils/get-user-data";
import Layout from "@/components/layout/layout";
import { Toaster } from "sonner";


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
  const userData = await getUserData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} antialiased font-instrumentSans text-grey-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <Layout userData={userData}>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
