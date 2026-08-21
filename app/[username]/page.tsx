import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/date-helper";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Pagination from "@/components/pagination";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface BlogUser {
  id: string;
  name: string;
  username: string;
  bio: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: Date;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = (await prisma.user.findUnique({
    where: { username },
  })) as BlogUser | null;

  if (!user) {
    return {
      title: "Author Not Found - StoryStream",
    };
  }

  return {
    title: `${user.name} (@${user.username}) - Stories`,
    description: user.bio || `Read articles and stories by ${user.name} on StoryStream.`,
  };
}

export default async function UserBlogPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const search = await searchParams;
  const pageNum = Math.max(1, parseInt(search.page || "1", 10));
  const take = 8;
  const skip = (pageNum - 1) * take;

  // 1. Fetch user to confirm they exist
  const user = (await prisma.user.findUnique({
    where: { username },
  })) as BlogUser | null;

  if (!user) {
    notFound();
  }

  // 2. Fetch user's published posts paginated
  const [postsResult, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: user.id,
        published: true,
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.post.count({
      where: {
        authorId: user.id,
        published: true,
      },
    }),
  ]);

  const posts = postsResult as BlogPost[];

  const totalPages = Math.ceil(totalPosts / take);
  const hasMore = pageNum < totalPages;
  const hasPrev = pageNum > 1;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Author Header */}
      <div className="mb-12 border-b border-zinc-200 pb-10 dark:border-zinc-800 text-center sm:text-left">
        <div className="flex flex-col items-center sm:flex-row sm:gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 text-3xl font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="mt-4 sm:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              {user.name}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              @{user.username}
            </p>
            {user.bio && (
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scoped Posts List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
          Published Stories
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              @{user.username} hasn&apos;t published any stories yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: BlogPost) => {
              const plainText = stripHtml(post.content);
              const excerpt =
                plainText.length > 200
                  ? `${plainText.substring(0, 200)}...`
                  : plainText;

              return (
                <Card key={post.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      <time dateTime={post.createdAt.toISOString()}>
                        {formatRelativeTime(post.createdAt)}
                      </time>
                    </div>
                    <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      <Link
                        href={`/${user.username}/${post.slug}`}
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
                      href={`/${user.username}/${post.slug}`}
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
              baseUrl={`/${user.username}`}
              totalItems={totalPosts}
            />
          </div>
        )}
      </div>
    </div>
  );
}
