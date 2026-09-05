import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { follows } from "@/lib/db/schema";

export async function isFollowing(followerId: string, followingId: string) {
  const rows = await db
    .select({ id: follows.id })
    .from(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId),
      ),
    )
    .limit(1);

  return Boolean(rows[0]);
}

export async function listFollowingIds(followerId: string) {
  const rows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, followerId));

  return rows.map((row) => row.followingId);
}
