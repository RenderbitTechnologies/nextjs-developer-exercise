"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogs, comments } from "@/lib/db/schema";
import { revalidateComments, revalidatePublicPosts } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

export type CommentFormState = {
  error?: string;
};

export async function createComment(
  postId: string,
  returnTo: string,
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/signin?next=${encodeURIComponent(returnTo)}`);
  }

  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 2) {
    return { error: "Write a comment before posting." };
  }
  if (content.length > 2000) {
    return { error: "Comments can be at most 2,000 characters." };
  }

  const post = await db
    .select({
      id: blogs.id,
      slug: blogs.slug,
      authorId: blogs.authorId,
    })
    .from(blogs)
    .where(eq(blogs.id, postId))
    .limit(1);

  if (!post[0]) {
    return { error: "That post is gone." };
  }

  await db.insert(comments).values({
    id: crypto.randomUUID(),
    postId,
    authorId: session.user.id,
    content,
  });

  revalidateComments(postId);
  revalidatePublicPosts(session.user.username, post[0].slug);
  return {};
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/signin");
  }

  const rows = await db
    .select({
      id: comments.id,
      authorId: comments.authorId,
      postId: comments.postId,
      postAuthorId: blogs.authorId,
      slug: blogs.slug,
    })
    .from(comments)
    .innerJoin(blogs, eq(comments.postId, blogs.id))
    .where(eq(comments.id, commentId))
    .limit(1);

  const comment = rows[0];
  if (!comment) return;

  const canDelete =
    comment.authorId === session.user.id ||
    comment.postAuthorId === session.user.id;

  if (!canDelete) {
    return;
  }

  await db
    .delete(comments)
    .where(and(eq(comments.id, commentId)));

  revalidateComments(comment.postId);
  revalidatePublicPosts(session.user.username, comment.slug);
}
