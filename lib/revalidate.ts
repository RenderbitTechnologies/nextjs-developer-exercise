import { refresh, revalidatePath, updateTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";

export function revalidatePublicPosts(username: string, slug?: string) {
  updateTag(cacheTags.posts);
  updateTag(cacheTags.featured);
  updateTag(cacheTags.userPosts(username));
  updateTag(`user:${username.toLowerCase()}`);
  if (slug) {
    updateTag(cacheTags.post(username, slug));
  }

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/${username}`);
  if (slug) {
    revalidatePath(`/${username}/${slug}`);
  }
  revalidatePath("/", "layout");
  refresh();
}

export function revalidateFollows(userId: string) {
  updateTag(cacheTags.follows(userId));
  revalidatePath("/");
  refresh();
}

export function revalidateComments(postId: string) {
  updateTag(cacheTags.comments(postId));
  updateTag(cacheTags.posts);
  refresh();
}
