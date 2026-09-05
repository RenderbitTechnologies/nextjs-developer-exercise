import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { db } from "@/lib/db";
import { blogs, user } from "@/lib/db/schema";
import { postSelect } from "@/lib/db/queries/posts";
import {
  likePattern,
  type SearchQuery,
  type SearchSort,
  type SearchWhen,
} from "@/lib/search";

function withinWhen(column: typeof blogs.createdAt | typeof user.createdAt, when: SearchWhen) {
  if (when === "week") return sql`${column} > now() - interval '7 days'`;
  if (when === "month") return sql`${column} > now() - interval '30 days'`;
  if (when === "year") return sql`${column} > now() - interval '365 days'`;
  return null;
}

function postOrder(sort: SearchSort, q: string) {
  const likeCount = sql`(select count(*) from likes where likes.post_id = ${blogs.id})`;
  const commentCount = sql`(select count(*) from comments where comments.post_id = ${blogs.id})`;

  if (sort === "oldest") return [asc(blogs.createdAt)] as const;
  if (sort === "popular") return [desc(likeCount), desc(blogs.createdAt)] as const;
  if (sort === "discussed") {
    return [desc(commentCount), desc(blogs.createdAt)] as const;
  }
  if (sort === "relevant" && q) {
    const pattern = likePattern(q);
    return [
      sql`case
        when ${blogs.title} ilike ${pattern} then 0
        when coalesce(${blogs.excerpt}, '') ilike ${pattern} then 1
        when ${user.name} ilike ${pattern} or ${user.username} ilike ${pattern} then 2
        else 3
      end`,
      desc(blogs.createdAt),
    ] as const;
  }
  return [desc(blogs.createdAt)] as const;
}

export async function searchPublishedPosts(query: SearchQuery) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(cacheTags.posts);

  const safePage = Math.max(1, query.page);
  const offset = (safePage - 1) * POSTS_PER_PAGE;
  const filters = [
    eq(blogs.status, "published"),
    eq(user.disabled, false),
  ];

  if (query.q) {
    const pattern = likePattern(query.q);
    filters.push(
      or(
        ilike(blogs.title, pattern),
        ilike(blogs.excerpt, pattern),
        ilike(blogs.content, pattern),
        ilike(user.name, pattern),
        ilike(user.username, pattern),
        sql`array_to_string(${blogs.hashTags}, ' ') ilike ${pattern}`,
      )!,
    );
  }

  if (query.tag) {
    filters.push(sql`${query.tag} = any(${blogs.hashTags})`);
  }

  const postedWithin = withinWhen(blogs.createdAt, query.when);
  if (postedWithin) filters.push(postedWithin);

  const where = and(...filters);
  const orderBy = postOrder(query.sort, query.q);

  const [items, totalRows] = await Promise.all([
    db
      .select(postSelect)
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db
      .select({ value: count() })
      .from(blogs)
      .innerJoin(user, eq(blogs.authorId, user.id))
      .where(where),
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

export type SearchPerson = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: Date;
  postCount: number;
};

function peopleOrder(sort: SearchSort, q: string) {
  const postCount = sql`(select count(*) from blogs where blogs.author_id = ${user.id} and blogs.status = 'published')`;
  if (sort === "oldest") return [asc(user.createdAt)] as const;
  if (sort === "popular") return [desc(postCount), desc(user.createdAt)] as const;
  if (sort === "relevant" && q) {
    const pattern = likePattern(q);
    return [
      sql`case
        when ${user.username} ilike ${pattern} then 0
        when ${user.name} ilike ${pattern} then 1
        else 2
      end`,
      desc(postCount),
    ] as const;
  }
  return [desc(user.createdAt)] as const;
}

export async function searchPeople(query: SearchQuery) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(cacheTags.posts);

  const safePage = Math.max(1, query.page);
  const offset = (safePage - 1) * POSTS_PER_PAGE;
  const filters = [eq(user.disabled, false)];

  if (query.q) {
    const pattern = likePattern(query.q);
    filters.push(or(ilike(user.name, pattern), ilike(user.username, pattern))!);
  }

  const joinedWithin = withinWhen(user.createdAt, query.when);
  if (joinedWithin) filters.push(joinedWithin);

  const where = and(...filters);
  const orderBy = peopleOrder(query.sort, query.q);
  const postCount = sql<number>`cast((select count(*) from blogs where blogs.author_id = ${user.id} and blogs.status = 'published') as int)`.mapWith(
    Number,
  );

  const [items, totalRows] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        createdAt: user.createdAt,
        postCount,
      })
      .from(user)
      .where(where)
      .orderBy(...orderBy)
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db.select({ value: count() }).from(user).where(where),
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

export async function listPopularTags(limit = 12) {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 3600 });
  cacheTag(cacheTags.posts);

  const rows = await db
    .select({ hashTags: blogs.hashTags })
    .from(blogs)
    .innerJoin(user, eq(blogs.authorId, user.id))
    .where(and(eq(blogs.status, "published"), eq(user.disabled, false)));

  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const tag of row.hashTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}
