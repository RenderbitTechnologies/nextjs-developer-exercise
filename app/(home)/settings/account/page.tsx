import { eq } from "drizzle-orm";
import AccountForm from "@/components/settings/account-form";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export const instant = false;

export default async function AccountSettingsPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const rows = await db
    .select({
      image: user.image,
      headerImage: user.headerImage,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">
          Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Your public name, username, avatar, and header image.
        </p>
      </div>
      <AccountForm
        name={session.user.name}
        username={session.user.username}
        email={session.user.email}
        image={rows[0]?.image ?? session.user.image ?? null}
        headerImage={rows[0]?.headerImage ?? null}
      />
    </div>
  );
}
