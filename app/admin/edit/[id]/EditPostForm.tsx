"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPostForm({
  post,
}: {
  post: { id: string; title: string; content: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      <div className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 h-64"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}