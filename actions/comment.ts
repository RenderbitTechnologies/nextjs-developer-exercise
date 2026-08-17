"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import { canDeleteComment } from "@/lib/comment-auth";

export async function addCommentAction(postId: string, content: string) {
  try {
    // 1. Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "You must be logged in to comment." };
    }

    // 2. Validate input
    const cleanContent = content.trim();
    if (!cleanContent) {
      return { success: false, error: "Comment content cannot be empty." };
    }

    // 3. Confirm post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    // 4. Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: cleanContent,
        postId,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // 5. Revalidate paths to refresh page data
    revalidatePath(`/${post.author.username}/${post.slug}`);
    revalidatePath("/");

    return { success: true, comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function deleteCommentAction(commentId: string) {
  try {
    // 1. Authenticate user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "You must be logged in." };
    }

    // 2. Fetch the comment and its parent post author details
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    // 3. Authorize the deletion request
    const isAuthorized = canDeleteComment(
      currentUser.id,
      comment.authorId,
      comment.post.authorId
    );

    if (!isAuthorized) {
      return { success: false, error: "You are not authorized to delete this comment." };
    }

    // 4. Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // 5. Revalidate paths to refresh page data
    revalidatePath(`/${comment.post.author.username}/${comment.post.slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
