import { createPost } from "@/app/actions/posts";
import PostForm from "@/components/post-form";

export const instant = false;

export const metadata = {
  title: "New post · Blogly",
};

export default function NewPostPage() {
  return <PostForm action={createPost} submitLabel="Publish" />;
}
