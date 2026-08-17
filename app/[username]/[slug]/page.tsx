import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import { formatRelativeTime } from "@/lib/date-helper";
import CommentsSection from "@/components/comments-section";
import DOMPurify from "isomorphic-dompurify";

interface PostAuthor {
  id: string;
  name: string;
  username: string;
  bio: string | null;
}

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  author: PostAuthor;
}

interface CommentAuthor {
  id: string;
  name: string;
  username: string;
}

interface CommentDetail {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  author: CommentAuthor;
}

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const post = (await prisma.post.findFirst({
    where: {
      slug,
      author: {
        username,
      },
    },
  })) as { title: string; content: string } | null;

  if (!post) {
    return {
      title: "Story Not Found - StoryStream",
    };
  }

  // Strip HTML for metadata description
  const plainText = post.content.replace(/<[^>]*>/g, "");
  const description =
    plainText.length > 160 ? `${plainText.substring(0, 160)}...` : plainText;

  return {
    title: `${post.title} by ${username} - StoryStream`,
    description,
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { username, slug } = await params;

  // 1. Fetch post with author information
  const post = (await prisma.post.findFirst({
    where: {
      slug,
      author: {
        username,
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
        },
      },
    },
  })) as PostDetail | null;

  if (!post) {
    notFound();
  }

  // 2. Fetch session user details
  const currentUser = await getCurrentUser();

  // 3. Check draft (unpublished) visibility
  if (!post.published) {
    // Block draft if not signed in or not the post author
    if (!currentUser || currentUser.id !== post.authorId) {
      notFound();
    }
  }

  // 4. Fetch comments of the post
  const comments = (await prisma.comment.findMany({
    where: {
      postId: post.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  })) as CommentDetail[];

  const serializedUser = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name || "User",
        username: currentUser.username || "user",
      }
    : null;

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      {/* Draft Badge warning */}
      {!post.published && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400">
          <strong>Draft Mode:</strong> You are viewing an unpublished draft. Only you (the author) can see this page.
        </div>
      )}

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl leading-tight">
          {post.title}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-md font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/${post.author.username}`}
              className="text-sm font-semibold text-zinc-800 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-zinc-50 hover:underline"
            >
              {post.author.name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>@{post.author.username}</span>
              <span>•</span>
              <time dateTime={post.createdAt.toISOString()}>
                {formatRelativeTime(post.createdAt)}
              </time>
            </div>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <div
        className="prose dark:prose-invert max-w-none mt-8"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Author Card Info */}
      <div className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:gap-6 items-center sm:items-start text-center sm:text-left">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-2xl font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
          {post.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href={`/${post.author.username}`}
            className="text-md font-bold text-zinc-900 hover:text-primary dark:text-zinc-50"
          >
            Written by {post.author.name}
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            @{post.author.username}
          </p>
          {post.author.bio && (
            <p className="mt-2 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-xl">
              {post.author.bio}
            </p>
          )}
        </div>
      </div>

      <CommentsSection
        postId={post.id}
        postAuthorId={post.authorId}
        postUrl={`/${username}/${slug}`}
        currentUser={serializedUser}
        initialComments={comments}
      />
    </article>
  );
}
