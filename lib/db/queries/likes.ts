import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";

export async function getLikedPostIds(userId: string, postIds: string[]) {
  if (postIds.length === 0) return new Set<string>();

  const rows = await db
    .select({ postId: likes.postId })
    .from(likes)
    .where(and(eq(likes.userId, userId), inArray(likes.postId, postIds)));

  return new Set(rows.map((row) => row.postId));
}

export async function hasLikedPost(userId: string, postId: string) {
  const rows = await db
    .select({ id: likes.id })
    .from(likes)
    .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
    .limit(1);

  return Boolean(rows[0]);
}
