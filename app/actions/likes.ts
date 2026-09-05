"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogs, likes, user } from "@/lib/db/schema";
import { revalidatePublicPosts } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

export async function toggleLike(postId: string, returnTo: string) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/signin?next=${encodeURIComponent(returnTo)}`);
  }

  const post = await db
    .select({
      id: blogs.id,
      slug: blogs.slug,
      status: blogs.status,
      authorUsername: user.username,
    })
    .from(blogs)
    .innerJoin(user, eq(blogs.authorId, user.id))
    .where(eq(blogs.id, postId))
    .limit(1);

  if (!post[0] || post[0].status !== "published") {
    return;
  }

  const existing = await db
    .select({ id: likes.id })
    .from(likes)
    .where(and(eq(likes.postId, postId), eq(likes.userId, session.user.id)))
    .limit(1);

  if (existing[0]) {
    await db.delete(likes).where(eq(likes.id, existing[0].id));
  } else {
    await db
      .insert(likes)
      .values({
        id: crypto.randomUUID(),
        postId,
        userId: session.user.id,
      })
      .onConflictDoNothing({
        target: [likes.postId, likes.userId],
      });
  }

  revalidatePublicPosts(post[0].authorUsername, post[0].slug);
}
