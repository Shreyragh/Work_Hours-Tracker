import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";
import ProtectedNavbar from "@/components/layout/protected-navbar";
import OpenNavbar from "@/components/layout/open-navbar";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Work Hours Tracker",
  description: "Track your work hours and earnings efficiently",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} h-full bg-background text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {!user?.id ? <OpenNavbar /> : <ProtectedNavbar />}
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
