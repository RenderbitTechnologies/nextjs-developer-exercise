"use client";

import { useRouter } from "next/navigation";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;

    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="underline text-red-600">
      Delete
    </button>
  );
}