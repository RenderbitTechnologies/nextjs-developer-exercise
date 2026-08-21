import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helper";
import PostForm from "@/components/post-form";

export const metadata = {
  title: "Write Story - StoryStream Admin",
  description: "Create a new article or story.",
};

export default async function NewPostPage() {
  // 1. Enforce authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?callbackUrl=/admin/new");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 pb-6 border-b border-zinc-255 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create New Story
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Draft your ideas or publish articles immediately.
        </p>
      </div>

      <PostForm post={null} authorUsername={currentUser.username || "user"} />
    </div>
  );
}
