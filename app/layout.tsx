import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StoryStream",
  description: "Create and share your stories",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-250">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto flex max-w-5xl h-16 items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-black tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-650 bg-clip-text text-transparent dark:from-zinc-50 dark:to-zinc-350 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
            >
              StoryStream
            </Link>
            <UserMenu />
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <Toaster closeButton richColors position="bottom-right" />
      </body>
    </html>
  );
}
