import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-svh bg-background">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          Blogly.
        </Link>
        <ModeToggle />
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
