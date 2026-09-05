import { connection } from "next/server";
import { redirect } from "next/navigation";
import SettingsNav from "@/components/settings/settings-nav";
import { getSession } from "@/lib/session";

export const instant = false;

export const metadata = {
  title: "Settings · Blogly",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getSession();
  if (!session?.user) {
    redirect("/signin?next=/settings");
  }

  return (
    <div className="mx-auto min-h-svh w-full px-4 pb-10 sm:w-9/12 sm:px-0 mt-5">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your Blogly profile, password, and account.
          </p>
        </div>
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <SettingsNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
