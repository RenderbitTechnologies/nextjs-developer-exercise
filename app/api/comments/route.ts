import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { postId, content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { content, postId, authorId: user.id },
  });

  return NextResponse.json(comment);
}