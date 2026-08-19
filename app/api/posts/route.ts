import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { title, content } = await request.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  let slug = slugify(title);
  let counter = 1;

  while (
    await prisma.post.findFirst({
      where: { authorId: user.id, slug },
    })
  ) {
    slug = `${slugify(title)}-${counter}`;
    counter++;
  }

  const post = await prisma.post.create({
    data: { title, content, slug, authorId: user.id },
  });

  return NextResponse.json(post);
}