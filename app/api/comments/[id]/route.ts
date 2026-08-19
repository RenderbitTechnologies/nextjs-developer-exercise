import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { authorId: true } } },
  });

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isCommentAuthor = comment.authorId === user.id;
  const isPostAuthor = comment.post.authorId === user.id;

  if (!isCommentAuthor && !isPostAuthor) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}