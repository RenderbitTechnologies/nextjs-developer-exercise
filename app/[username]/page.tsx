import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const POSTS_PER_PAGE = 8;

export default async function UserBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) notFound();

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where: { authorId: user.id } }),
  ]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{user.fullName}</h1>
      <p className="text-gray-600 mb-8">@{user.username}</p>

      {posts.length === 0 && <p>No posts yet.</p>}

      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="border-b pb-4">
            <Link
              href={`/${user.username}/${post.slug}`}
              className="text-xl font-semibold hover:underline"
            >
              {post.title}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-4 mt-8 items-center">
          {page > 1 && (
            <Link href={`/${username}?page=${page - 1}`} className="underline">
              Previous
            </Link>
          )}
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/${username}?page=${page + 1}`} className="underline">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}