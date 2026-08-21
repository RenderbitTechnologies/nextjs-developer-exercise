import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import EditPostForm from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post || post.authorId !== user.id) notFound();

  return <EditPostForm post={post} />;
}   