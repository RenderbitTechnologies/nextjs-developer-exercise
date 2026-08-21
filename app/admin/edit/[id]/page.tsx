import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import PostForm from "@/components/post-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Story - StoryStream Admin",
  description: "Modify your article or draft details.",
};

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Enforce authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect(`/login?callbackUrl=/admin/edit/${id}`);
  }

  // 2. Fetch post
  const post = await prisma.post.findUnique({
    where: { id },
  });

  // 3. Perform existence and ownership validation checks
  if (!post) {
    notFound();
  }

  if (post.authorId !== currentUser.id) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 pb-6 border-b border-zinc-255 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit Story
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Make updates to your article or publish draft.
        </p>
      </div>

      <PostForm post={post} authorUsername={currentUser.username || "user"} />
    </div>
  );
}
