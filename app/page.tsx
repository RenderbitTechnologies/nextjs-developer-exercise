import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/date-helper";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Pagination from "@/components/pagination";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    username: string;
  };
}

export const metadata: Metadata = {
  title: "StoryStream - Share Your Stories",
  description: "A clean, modern blogging platform for sharing ideas, thoughts, and stories.",
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageNum = Math.max(1, parseInt(params.page || "1", 10));
  const take = 8;
  const skip = (pageNum - 1) * take;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    }),
    prisma.post.count({
      where: { published: true },
    }),
  ]);

  const totalPages = Math.ceil(totalPosts / take);
  const hasMore = pageNum < totalPages;
  const hasPrev = pageNum > 1;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Featured Stories
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Explore the latest posts and articles written by our community.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            No stories published yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post: PostListItem) => {
            const plainText = stripHtml(post.content);
            const excerpt =
              plainText.length > 200
                ? `${plainText.substring(0, 200)}...`
                : plainText;

            return (
              <Card key={post.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Link
                      href={`/${post.author.username}`}
                      className="font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 hover:underline"
                    >
                      {post.author.name}
                    </Link>
                    <span>•</span>
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatRelativeTime(post.createdAt)}
                    </time>
                  </div>
                  <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    <Link
                      href={`/${post.author.username}/${post.slug}`}
                      className="hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 dark:text-zinc-350 line-clamp-3 leading-relaxed">
                    {excerpt}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/${post.author.username}/${post.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Read full article →
                  </Link>
                </CardFooter>
              </Card>
            );
          })}

          <Pagination
            currentPage={pageNum}
            totalPages={totalPages}
            baseUrl=""
            totalItems={totalPosts}
          />
        </div>
      )}
    </div>
  );
}
