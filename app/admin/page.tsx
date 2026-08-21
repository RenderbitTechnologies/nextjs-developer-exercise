
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import DeletePostButton from "./DeletePostButton";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link
          href="/admin/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 && <p>You have no posts yet.</p>}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <Link
                href={`/${user.username}/${post.slug}`}
                className="font-semibold hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-600">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/edit/${post.id}`} className="underline">
                Edit
              </Link>
              <DeletePostButton postId={post.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}