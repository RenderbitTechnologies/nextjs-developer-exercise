import { defineRelations } from "drizzle-orm";
import {
  account,
  session,
  user,
  verification,
} from "./schemas/auth-schema";
import { blogs, comments, likes, follows } from "./schemas/blogs-schema";

export {
  account,
  session,
  user,
  verification,
} from "./schemas/auth-schema";
export {
  blogs,
  comments,
  likes,
  follows,
  blogStatusEnum,
} from "./schemas/blogs-schema";

export const authSchema = {
  user,
  session,
  account,
  verification,
};

export const appSchema = {
  user,
  session,
  account,
  verification,
  blogs,
  comments,
  likes,
  follows,
};

export const appRelations = defineRelations(appSchema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    blogs: r.many.blogs({
      from: r.user.id,
      to: r.blogs.authorId,
    }),
    comments: r.many.comments({
      from: r.user.id,
      to: r.comments.authorId,
    }),
    likes: r.many.likes({
      from: r.user.id,
      to: r.likes.userId,
    }),
    following: r.many.follows({
      from: r.user.id,
      to: r.follows.followerId,
    }),
    followers: r.many.follows({
      from: r.user.id,
      to: r.follows.followingId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  blogs: {
    author: r.one.user({
      from: r.blogs.authorId,
      to: r.user.id,
    }),
    comments: r.many.comments({
      from: r.blogs.id,
      to: r.comments.postId,
    }),
    likes: r.many.likes({
      from: r.blogs.id,
      to: r.likes.postId,
    }),
  },
  comments: {
    post: r.one.blogs({
      from: r.comments.postId,
      to: r.blogs.id,
    }),
    author: r.one.user({
      from: r.comments.authorId,
      to: r.user.id,
    }),
  },
  likes: {
    post: r.one.blogs({
      from: r.likes.postId,
      to: r.blogs.id,
    }),
    user: r.one.user({
      from: r.likes.userId,
      to: r.user.id,
    }),
  },
  follows: {
    follower: r.one.user({
      from: r.follows.followerId,
      to: r.user.id,
    }),
    following: r.one.user({
      from: r.follows.followingId,
      to: r.user.id,
    }),
  },
}));

/** @deprecated Use appRelations. Kept so older imports keep type-checking. */
export const authRelations = appRelations;
