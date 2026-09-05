import { eq } from "drizzle-orm";

export const instant = false;
import ManageAccount from "@/components/settings/manage-account";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export default async function ManageAccountPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const rows = await db
    .select({ disabled: user.disabled })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">
          Manage account
        </h2>
        <p className="text-sm text-muted-foreground">
          Disable your public profile or permanently delete this account.
        </p>
      </div>
      <ManageAccount
        username={session.user.username}
        disabled={rows[0]?.disabled ?? false}
      />
    </div>
  );
}
