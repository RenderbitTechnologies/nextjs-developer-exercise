"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import { slugExistsForAuthor } from "@/lib/db/queries/posts";
import { revalidatePublicPosts } from "@/lib/revalidate";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { SUBTITLE_MAX_CHARS, SUBTITLE_MAX_WORDS } from "@/lib/constants";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/html";
import { clipSubtitle, countSubtitleWords } from "@/lib/subtitle";

export type PostFormState = {
  error?: string;
};

function parseTags(raw: string) {
  return raw
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/signin?next=/admin");
  }
  return session.user;
}

async function uniqueSlug(authorId: string, title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await slugExistsForAuthor(authorId, slug, excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function parsePostFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = sanitizePostHtml(String(formData.get("content") ?? "").trim());
  const excerpt = clipSubtitle(String(formData.get("excerpt") ?? "").trim());
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const hashTags = parseTags(String(formData.get("hashTags") ?? ""));
  const bodyText = plainTextFromHtml(content);
  return {
    title,
    content,
    excerpt: clipSubtitle(excerpt || bodyText.slice(0, SUBTITLE_MAX_CHARS)),
    coverImage,
    status,
    requestedSlug,
    hashTags,
    bodyText,
  };
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const user = await requireUser();
  const {
    title,
    content,
    excerpt,
    coverImage,
    status,
    requestedSlug,
    hashTags,
    bodyText,
  } = parsePostFields(formData);

  if (title.length < 3) return { error: "Title must be at least 3 characters." };
  if (bodyText.length < 20) {
    return { error: "Write a bit more before saving this post." };
  }
  if (
    countSubtitleWords(excerpt) > SUBTITLE_MAX_WORDS ||
    excerpt.length > SUBTITLE_MAX_CHARS
  ) {
    return {
      error: `Subtitle must be at most ${SUBTITLE_MAX_WORDS} words or ${SUBTITLE_MAX_CHARS} characters.`,
    };
  }
  if (status !== "draft" && status !== "published") {
    return { error: "Invalid status." };
  }

  const slug = requestedSlug
    ? slugify(requestedSlug)
    : await uniqueSlug(user.id, title);

  if (await slugExistsForAuthor(user.id, slug)) {
    return { error: "That slug is already used on one of your posts." };
  }

  const id = crypto.randomUUID();
  await db.insert(blogs).values({
    id,
    authorId: user.id,
    title,
    slug,
    content,
    excerpt,
    coverImage: coverImage || null,
    hashTags,
    status,
    isFeatured: false,
  });

  revalidatePublicPosts(user.username, slug);
  redirect("/admin");
}

export async function updatePost(
  postId: string,
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const user = await requireUser();
  const {
    title,
    content,
    excerpt,
    coverImage,
    status,
    requestedSlug,
    hashTags,
    bodyText,
  } = parsePostFields(formData);

  if (title.length < 3) return { error: "Title must be at least 3 characters." };
  if (bodyText.length < 20) {
    return { error: "Write a bit more before saving this post." };
  }
  if (
    countSubtitleWords(excerpt) > SUBTITLE_MAX_WORDS ||
    excerpt.length > SUBTITLE_MAX_CHARS
  ) {
    return {
      error: `Subtitle must be at most ${SUBTITLE_MAX_WORDS} words or ${SUBTITLE_MAX_CHARS} characters.`,
    };
  }
  if (status !== "draft" && status !== "published" && status !== "archived") {
    return { error: "Invalid status." };
  }

  const slug = requestedSlug ? slugify(requestedSlug) : slugify(title);
  if (await slugExistsForAuthor(user.id, slug, postId)) {
    return { error: "That slug is already used on one of your posts." };
  }

  const updated = await db
    .update(blogs)
    .set({
      title,
      slug,
      content,
      excerpt,
      coverImage: coverImage || null,
      hashTags,
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(blogs.id, postId), eq(blogs.authorId, user.id)))
    .returning({ id: blogs.id });

  if (updated.length === 0) {
    return { error: "Post not found." };
  }

  revalidatePublicPosts(user.username, slug);
  redirect("/admin");
}

export async function deletePost(postId: string) {
  const user = await requireUser();
  const rows = await db
    .delete(blogs)
    .where(and(eq(blogs.id, postId), eq(blogs.authorId, user.id)))
    .returning({ slug: blogs.slug });

  if (rows[0]) {
    revalidatePublicPosts(user.username, rows[0].slug);
  }
}
