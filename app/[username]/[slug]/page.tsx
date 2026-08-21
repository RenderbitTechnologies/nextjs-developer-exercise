import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CommentSection from "./CommentSection";

export default async function PostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) notFound();

  const post = await prisma.post.findFirst({
    where: { authorId: user.id, slug },
    include: {
      author: { select: { username: true, fullName: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, username: true, fullName: true } } },
      },
    },
  });

  if (!post) notFound();

  const currentUser = await getCurrentUser();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-600 mb-8">
        by {post.author.fullName} · {new Date(post.createdAt).toLocaleDateString()}
      </p>

      <div className="whitespace-pre-wrap mb-12">{post.content}</div>

      <CommentSection
        postId={post.id}
        postAuthorId={post.authorId}
        comments={post.comments}
        currentUserId={currentUser?.id ?? null}
      />
    </div>
  );
}