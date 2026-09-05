"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { follows, user } from "@/lib/db/schema";
import { revalidateFollows } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

export async function toggleFollow(followingId: string, returnTo: string) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/signin?next=${encodeURIComponent(returnTo)}`);
  }

  if (session.user.id === followingId) {
    return;
  }

  const target = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, followingId))
    .limit(1);
  if (!target[0]) return;

  const existing = await db
    .select({ id: follows.id })
    .from(follows)
    .where(
      and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, followingId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
  } else {
    await db.insert(follows).values({
      id: crypto.randomUUID(),
      followerId: session.user.id,
      followingId,
    });
  }

  revalidateFollows(session.user.id);
}
