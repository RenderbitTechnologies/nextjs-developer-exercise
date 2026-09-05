import { notFound } from "next/navigation";
import { updatePost } from "@/app/actions/posts";
import PostForm from "@/components/post-form";
import { getPostByIdForAuthor } from "@/lib/db/queries/posts";
import { getSession } from "@/lib/session";

type EditPageProps = {
  params: Promise<{ postId: string }>;
};

export const instant = false;

export const metadata = {
  title: "Edit post · Blogly",
};

export default async function EditPostPage({ params }: EditPageProps) {
  const session = await getSession();
  if (!session?.user) return null;
  const { postId } = await params;
  const post = await getPostByIdForAuthor(postId, session.user.id);
  if (!post) notFound();

  const action = updatePost.bind(null, post.id);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Editing “{post.title}”</p>
      <PostForm
        action={action}
        submitLabel="Save post"
        defaults={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          hashTags: post.hashTags,
          status: post.status,
        }}
      />
    </div>
  );
}
