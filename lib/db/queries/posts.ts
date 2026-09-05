import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { db } from "@/lib/db";
import { blogs, user } from "@/lib/db/schema";

export const postSelect = {
  id: blogs.id,
  title: blogs.title,
  slug: blogs.slug,
  excerpt: blogs.excerpt,
  content: blogs.content,
  coverImage: blogs.coverImage,
  hashTags: blogs.hashTags,
  status: blogs.status,
  isFeatured: blogs.isFeatured,
  createdAt: blogs.createdAt,
  updatedAt: blogs.updatedAt,
  authorId: user.id,
  authorName: user.name,
  authorUsername: user.username,
  authorImage: user.image,
  commentCount: sql<number>`cast((select count(*) from comments where comments.post_id = ${blogs.id}) as int)`.mapWith(
    Number,
  ),
  likeCount: sql<number>`cast((select count(*) from likes where likes.post_id = ${blogs.id}) as int)`.mapWith(
    Number,
  ),
};

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  hashTags: string[];
  createdAt: Date;
  authorName: string;
  authorUsername: string;
  authorImage: string | null;
  commentCount: number;
  likeCount: number;
};

export async function listPublishedPosts(page: number) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(cacheTags.posts);

  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * POSTS_PER_PAGE;

  const publicPublished = and(
    eq(blogs.status, "published"),
    eq(user.disabled, false),
  );

  const [items, totalRows] = await Promise.all([
    db
      .select(postSelect)
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(publicPublished)
      .orderBy(desc(blogs.createdAt))
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(publicPublished),
  ]);

  return {
    items,
    total: totalRows[0]?.value ?? 0,
    page: safePage,
    pageCount: Math.max(1, Math.ceil((totalRows[0]?.value ?? 0) / POSTS_PER_PAGE)),
  };
}

export async function listPublishedPostsByUsername(
  username: string,
  page: number,
) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(cacheTags.posts, cacheTags.userPosts(username));

  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * POSTS_PER_PAGE;
  const handle = username.toLowerCase();

  const [items, totalRows] = await Promise.all([
    db
      .select(postSelect)
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(
        and(
          eq(blogs.status, "published"),
          eq(user.disabled, false),
          sql`lower(${user.username}) = ${handle}`,
        ),
      )
      .orderBy(desc(blogs.createdAt))
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(
        and(
          eq(blogs.status, "published"),
          eq(user.disabled, false),
          sql`lower(${user.username}) = ${handle}`,
        ),
      ),
  ]);

  return {
    items,
    total: totalRows[0]?.value ?? 0,
    page: safePage,
    pageCount: Math.max(1, Math.ceil((totalRows[0]?.value ?? 0) / POSTS_PER_PAGE)),
  };
}

export async function getFeaturedPosts() {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(cacheTags.posts, cacheTags.featured);

  const featured = await db
    .select(postSelect)
    .from(blogs)
    .innerJoin(user, eq(blogs.authorId, user.id))
    .where(
      and(
        eq(blogs.status, "published"),
        eq(blogs.isFeatured, true),
        eq(user.disabled, false),
      ),
    )
    .orderBy(desc(blogs.createdAt))
    .limit(3);

  if (featured.length >= 1) {
    return featured;
  }

  return db
    .select(postSelect)
    .from(blogs)
    .innerJoin(user, eq(blogs.authorId, user.id))
    .where(and(eq(blogs.status, "published"), eq(user.disabled, false)))
    .orderBy(desc(blogs.createdAt))
    .limit(3);
}

export async function getPublishedPost(username: string, slug: string) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(
    cacheTags.posts,
    cacheTags.userPosts(username),
    cacheTags.post(username, slug),
  );

  const rows = await db
    .select(postSelect)
    .from(blogs)
    .innerJoin(user, eq(blogs.authorId, user.id))
    .where(
      and(
        eq(blogs.status, "published"),
        eq(user.disabled, false),
        sql`lower(${user.username}) = ${username.toLowerCase()}`,
        eq(blogs.slug, slug),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getPostByIdForAuthor(postId: string, authorId: string) {
  const rows = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.id, postId), eq(blogs.authorId, authorId)))
    .limit(1);

  return rows[0] ?? null;
}

export async function listPostsByAuthor(authorId: string) {
  return db
    .select()
    .from(blogs)
    .where(eq(blogs.authorId, authorId))
    .orderBy(desc(blogs.updatedAt));
}

export async function slugExistsForAuthor(
  authorId: string,
  slug: string,
  excludeId?: string,
) {
  const rows = await db
    .select({ id: blogs.id })
    .from(blogs)
    .where(and(eq(blogs.authorId, authorId), eq(blogs.slug, slug)))
    .limit(1);

  if (!rows[0]) return false;
  if (excludeId && rows[0].id === excludeId) return false;
  return true;
}

export async function listPublishedPostsByAuthorIds(
  authorIds: string[],
  page: number,
) {
  const safePage = Math.max(1, page);
  if (authorIds.length === 0) {
    return { items: [], total: 0, page: safePage, pageCount: 1 };
  }

  const offset = (safePage - 1) * POSTS_PER_PAGE;
  const publicFromFollowed = and(
    eq(blogs.status, "published"),
    eq(user.disabled, false),
    inArray(blogs.authorId, authorIds),
  );

  const [items, totalRows] = await Promise.all([
    db
      .select(postSelect)
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(publicFromFollowed)
      .orderBy(desc(blogs.createdAt))
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(publicFromFollowed),
  ]);

  return {
    items,
    total: totalRows[0]?.value ?? 0,
    page: safePage,
    pageCount: Math.max(
      1,
      Math.ceil((totalRows[0]?.value ?? 0) / POSTS_PER_PAGE),
    ),
  };
}
