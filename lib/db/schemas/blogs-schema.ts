import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const blogStatusEnum = pgEnum("blog_status", [
  "draft",
  "published",
  "archived",
]);

export const blogs = pgTable(
  "blogs",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    hashTags: text("hash_tags").array().notNull().default([]),
    status: blogStatusEnum("status").default("draft").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("blogs_author_slug_uidx").on(table.authorId, table.slug),
    index("blogs_status_created_idx").on(table.status, table.createdAt),
    index("blogs_author_status_created_idx").on(
      table.authorId,
      table.status,
      table.createdAt,
    ),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => blogs.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_created_idx").on(table.postId, table.createdAt),
    index("comments_author_idx").on(table.authorId),
  ],
);

export const likes = pgTable(
  "likes",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => blogs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("likes_post_user_uidx").on(table.postId, table.userId),
    index("likes_user_idx").on(table.userId),
  ],
);

export const follows = pgTable(
  "follows",
  {
    id: text("id").primaryKey(),
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("follows_follower_following_uidx").on(
      table.followerId,
      table.followingId,
    ),
    index("follows_following_idx").on(table.followingId),
  ],
);

export const blogsSchema = {
  blogs,
  comments,
  likes,
  follows,
};
