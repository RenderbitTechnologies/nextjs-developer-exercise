"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  author: { id: string; username: string; fullName: string };
};

export default function CommentSection({
  postId,
  postAuthorId,
  comments,
  currentUserId,
}: {
  postId: string;
  postAuthorId: string;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!content.trim()) return;
    setLoading(true);

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content }),
    });

    setContent("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="border-t pt-8">
      <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>

      {currentUserId ? (
        <div className="mb-8">
          <textarea
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="mt-2 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <p className="mb-8 text-sm">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}

      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-gray-600">No comments yet.</p>
        )}

        {comments.map((comment) => {
          const canDelete =
            currentUserId !== null &&
            (comment.authorId === currentUserId ||
              postAuthorId === currentUserId);

          return (
            <div key={comment.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold">
                  {comment.author.fullName}{" "}
                  <span className="font-normal text-gray-600">
                    @{comment.author.username}
                  </span>
                </p>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-sm underline text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}