import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import { ProfileForm } from "./profile-form";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Profile Settings - StoryStream",
  description: "Edit your name, username, bio, and profile picture.",
};

export default async function ProfileSettingsPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/login?callbackUrl=/admin/profile");
  }

  // Load fresh user data directly from the DB to populate settings form
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors group mb-3"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit Profile
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
          Update your personal details, biography, and profile image.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20 sm:p-8">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
