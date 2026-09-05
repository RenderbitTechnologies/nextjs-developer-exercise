import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, blogs, comments, follows, likes, user } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";
import { SEED_AUTHORS, SEED_PASSWORD } from "@/lib/db/seed-data";

const CREDENTIAL_ISSUER = "local:credential";

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(14, 0, 0, 0);
  return date;
}

async function slugForAuthor(authorId: string, title: string) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  const existing = await db
    .select({ slug: blogs.slug })
    .from(blogs)
    .where(eq(blogs.authorId, authorId));
  const taken = new Set(existing.map((row) => row.slug));
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

async function ensureCredentialAccount(userId: string) {
  const existing = await db
    .select({ id: account.id })
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1);

  const password = await hashPassword(SEED_PASSWORD);
  const now = new Date();

  if (existing[0]) {
    await db
      .update(account)
      .set({
        issuer: CREDENTIAL_ISSUER,
        providerId: "credential",
        accountId: userId,
        password,
        updatedAt: now,
      })
      .where(eq(account.id, existing[0].id));
    return;
  }

  await db.insert(account).values({
    id: crypto.randomUUID(),
    issuer: CREDENTIAL_ISSUER,
    accountId: userId,
    providerId: "credential",
    userId,
    password,
    createdAt: now,
    updatedAt: now,
  });
}

async function ensureAuthor(author: (typeof SEED_AUTHORS)[number]) {
  const existing = await db
    .select()
    .from(user)
    .where(or(eq(user.email, author.email), eq(user.username, author.username)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(user)
      .set({
        name: author.name,
        username: author.username,
        image: author.image,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existing[0].id));
    await ensureCredentialAccount(existing[0].id);
    console.log(`Updated @${author.username} (${author.email})`);
    return existing[0].id;
  }

  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(user).values({
    id,
    name: author.name,
    username: author.username,
    email: author.email,
    emailVerified: true,
    image: author.image,
    createdAt: now,
    updatedAt: now,
  });

  await ensureCredentialAccount(id);
  console.log(`Created @${author.username} (${author.email})`);
  return id;
}

async function ensurePosts(
  authorId: string,
  username: string,
  posts: (typeof SEED_AUTHORS)[number]["posts"],
) {
  const existing = await db
    .select({ id: blogs.id, title: blogs.title })
    .from(blogs)
    .where(eq(blogs.authorId, authorId));
  const byTitle = new Map(existing.map((row) => [row.title, row]));

  for (const post of posts) {
    const already = byTitle.get(post.title);
    if (already) {
      await db
        .update(blogs)
        .set({
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          hashTags: [...post.tags],
          isFeatured: post.featured === true,
          updatedAt: new Date(),
        })
        .where(eq(blogs.id, already.id));
      console.log(`Updated "${post.title}" for @${username}`);
      continue;
    }

    const slug = await slugForAuthor(authorId, post.title);
    const createdAt = daysAgo(post.daysAgo);

    await db.insert(blogs).values({
      id: crypto.randomUUID(),
      authorId,
      title: post.title,
      slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      hashTags: [...post.tags],
      status: "published",
      isFeatured: post.featured === true,
      createdAt,
      updatedAt: createdAt,
    });
    console.log(`Published "${post.title}" for @${username}`);
  }
}

const SEED_COMMENTS: {
  postTitle: string;
  fromUsername: string;
  content: string;
}[] = [
  {
    postTitle: "The city that taught me how to look",
    fromUsername: "elena",
    content:
      "The 4:17 brick wall got me. I have a creek version of that appointment now. Looking as a muscle is exactly right.",
  },
  {
    postTitle: "The first meal that made me stay",
    fromUsername: "mira",
    content:
      "Being allowed to sit inside someone else's Tuesday — I have been turning that sentence over all morning. Thank you for writing the soup instead of reviewing it.",
  },
  {
    postTitle: "The hour before the birds start",
    fromUsername: "julian",
    content:
      "I made coffee in the dark after this and walked to the market the long way. The first stall was still setting up. Felt like being let in early.",
  },
  {
    postTitle: "How to cook for one without making it a ritual of loneliness",
    fromUsername: "mira",
    content:
      "I put water on before I decided what the meal was. It worked. The plate-not-the-container rule is going on a card above my stove.",
  },
  {
    postTitle: "A notebook is not a second brain",
    fromUsername: "elena",
    content:
      "Recurrence as a ranking algorithm is the most useful writing advice I have read this year. The field notebook agrees.",
  },
  {
    postTitle: "Markets as a kind of map",
    fromUsername: "elena",
    content:
      "Prices as a diary — I started doing this with roadside stands. The numbers bring back the heat better than my photos do.",
  },
];

async function ensureComments(authorsByUsername: Map<string, string>) {
  const published = await db.select({ id: blogs.id, title: blogs.title }).from(blogs);
  const postsByTitle = new Map(published.map((row) => [row.title, row.id]));

  for (const comment of SEED_COMMENTS) {
    const postId = postsByTitle.get(comment.postTitle);
    const authorId = authorsByUsername.get(comment.fromUsername);
    if (!postId || !authorId) continue;

    const already = await db
      .select({ id: comments.id, content: comments.content })
      .from(comments)
      .where(eq(comments.postId, postId));
    if (already.some((row) => row.content === comment.content)) continue;

    await db.insert(comments).values({
      id: crypto.randomUUID(),
      postId,
      authorId,
      content: comment.content,
    });
    console.log(`Commented on "${comment.postTitle}" as @${comment.fromUsername}`);
  }
}

const SEED_LIKES: { postTitle: string; fromUsername: string }[] = [
  { postTitle: "The city that taught me how to look", fromUsername: "julian" },
  { postTitle: "The city that taught me how to look", fromUsername: "elena" },
  { postTitle: "The first meal that made me stay", fromUsername: "mira" },
  { postTitle: "The first meal that made me stay", fromUsername: "elena" },
  { postTitle: "The hour before the birds start", fromUsername: "mira" },
  { postTitle: "The hour before the birds start", fromUsername: "julian" },
  { postTitle: "A notebook is not a second brain", fromUsername: "julian" },
  { postTitle: "Markets as a kind of map", fromUsername: "mira" },
  { postTitle: "What a river remembers", fromUsername: "mira" },
  { postTitle: "How to cook for one without making it a ritual of loneliness", fromUsername: "elena" },
];

async function ensureLikes(authorsByUsername: Map<string, string>) {
  const published = await db.select({ id: blogs.id, title: blogs.title }).from(blogs);
  const postsByTitle = new Map(published.map((row) => [row.title, row.id]));

  for (const like of SEED_LIKES) {
    const postId = postsByTitle.get(like.postTitle);
    const userId = authorsByUsername.get(like.fromUsername);
    if (!postId || !userId) continue;

    const already = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
      .limit(1);
    if (already[0]) continue;

    await db.insert(likes).values({
      id: crypto.randomUUID(),
      postId,
      userId,
    });
    console.log(`Liked "${like.postTitle}" as @${like.fromUsername}`);
  }
}

const SEED_FOLLOWS: { follower: string; following: string }[] = [
  { follower: "mira", following: "julian" },
  { follower: "mira", following: "elena" },
  { follower: "julian", following: "mira" },
  { follower: "julian", following: "elena" },
  { follower: "elena", following: "mira" },
];

async function ensureFollows(authorsByUsername: Map<string, string>) {
  for (const edge of SEED_FOLLOWS) {
    const followerId = authorsByUsername.get(edge.follower);
    const followingId = authorsByUsername.get(edge.following);
    if (!followerId || !followingId) continue;

    const already = await db
      .select({ id: follows.id })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId),
        ),
      )
      .limit(1);
    if (already[0]) continue;

    await db.insert(follows).values({
      id: crypto.randomUUID(),
      followerId,
      followingId,
    });
    console.log(`@${edge.follower} followed @${edge.following}`);
  }
}

async function main() {
  const authorsByUsername = new Map<string, string>();

  for (const author of SEED_AUTHORS) {
    const authorId = await ensureAuthor(author);
    authorsByUsername.set(author.username, authorId);
    await ensurePosts(authorId, author.username, author.posts);
  }

  await ensureComments(authorsByUsername);
  await ensureLikes(authorsByUsername);
  await ensureFollows(authorsByUsername);

  console.log("");
  console.log("Sign in with any seed account:");
  for (const author of SEED_AUTHORS) {
    console.log(`  ${author.email}  /  ${SEED_PASSWORD}`);
  }
}

main()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
