"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";

// Normalize slug: lowercase letters, numbers, and hyphens only
export async function normalizeSlug(s: string): Promise<string> {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createPostAction(data: {
  title: string;
  slug: string;
  content: string;
  published: boolean;
}) {
  try {
    // 1. Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "You must be logged in to create a post." };
    }

    // 2. Validate input fields
    const { title, slug, content, published } = data;
    if (!title.trim()) {
      return { success: false, errors: { title: "Title is required." } };
    }
    if (!content.trim()) {
      return { success: false, errors: { content: "Content is required." } };
    }

    // 3. Normalize slug and check uniqueness per author
    const normalizedSlug = await normalizeSlug(slug || title);
    if (!normalizedSlug) {
      return { success: false, errors: { slug: "A valid URL slug is required." } };
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        authorId_slug: {
          authorId: currentUser.id,
          slug: normalizedSlug,
        },
      },
    });

    if (existingPost) {
      return {
        success: false,
        errors: { slug: "You already have a post with this slug. Slugs must be unique per author." },
      };
    }

    // 4. Create post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        content: content.trim(),
        published,
        authorId: currentUser.id,
      },
    });

    // 5. Revalidate caches
    revalidatePath("/");
    revalidatePath(`/${currentUser.username}`);
    revalidatePath("/admin");

    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function updatePostAction(
  postId: string,
  data: {
    title: string;
    slug: string;
    content: string;
    published: boolean;
  }
) {
  try {
    // 1. Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "You must be logged in to update a post." };
    }

    // 2. Fetch post to verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    if (post.authorId !== currentUser.id) {
      return { success: false, error: "You are not authorized to edit this post." };
    }

    // 3. Validate input fields
    const { title, slug, content, published } = data;
    if (!title.trim()) {
      return { success: false, errors: { title: "Title is required." } };
    }
    if (!content.trim()) {
      return { success: false, errors: { content: "Content is required." } };
    }

    // 4. Normalize slug and check uniqueness (excluding this post)
    const normalizedSlug = await normalizeSlug(slug || title);
    if (!normalizedSlug) {
      return { success: false, errors: { slug: "A valid URL slug is required." } };
    }

    const existingPostWithSlug = await prisma.post.findFirst({
      where: {
        authorId: currentUser.id,
        slug: normalizedSlug,
        id: { not: postId },
      },
    });

    if (existingPostWithSlug) {
      return {
        success: false,
        errors: { slug: "You already have a post with this slug. Slugs must be unique per author." },
      };
    }

    // 5. Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        content: content.trim(),
        published,
      },
    });

    // 6. Revalidate caches
    revalidatePath("/");
    revalidatePath(`/${currentUser.username}`);
    revalidatePath(`/${currentUser.username}/${post.slug}`); // old slug path
    revalidatePath(`/${currentUser.username}/${normalizedSlug}`); // new slug path
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deletePostAction(postId: string) {
  try {
    // 1. Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "You must be logged in to delete a post." };
    }

    // 2. Fetch post to verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    if (post.authorId !== currentUser.id) {
      return { success: false, error: "You are not authorized to delete this post." };
    }

    // 3. Delete post (PostgreSQL Cascade rule deletes comments automatically)
    await prisma.post.delete({
      where: { id: postId },
    });

    // 4. Revalidate caches
    revalidatePath("/");
    revalidatePath(`/${currentUser.username}`);
    revalidatePath(`/${currentUser.username}/${post.slug}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
