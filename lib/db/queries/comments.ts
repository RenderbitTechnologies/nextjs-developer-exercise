import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { db } from "@/lib/db";
import { comments, user } from "@/lib/db/schema";

export async function listCommentsForPost(postId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.comments(postId));

  return db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: user.id,
      authorName: user.name,
      authorUsername: user.username,
      authorImage: user.image,
    })
    .from(comments)
    .innerJoin(user, eq(comments.authorId, user.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));
}
