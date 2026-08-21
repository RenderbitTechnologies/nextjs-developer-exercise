import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  // Redirect users who don't need onboarding to the admin area
  if (!user.needsOnboarding) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <OnboardingForm
          defaultUsername={user.username || ""}
          avatarUrl={user.avatarUrl || null}
          name={user.name || ""}
        />
      </div>
    </div>
  );
}
