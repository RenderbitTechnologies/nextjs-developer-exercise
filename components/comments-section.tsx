"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/date-helper";
import { canDeleteComment } from "@/lib/comment-auth";
import { addCommentAction, deleteCommentAction } from "@/actions/comment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CommentAuthor {
  id: string;
  name: string;
  username: string;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  author: CommentAuthor;
}

interface CommentsSectionProps {
  postId: string;
  postAuthorId: string;
  postUrl: string;
  currentUser: {
    id: string;
    name: string;
    username: string;
  } | null;
  initialComments: CommentItem[];
}

type OptimisticAction =
  | { type: "ADD"; comment: CommentItem }
  | { type: "DELETE"; commentId: string };

export default function CommentsSection({
  postId,
  postAuthorId,
  postUrl,
  currentUser,
  initialComments,
}: CommentsSectionProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic UI state
  const [optimisticComments, setOptimisticComments] = useOptimistic<
    CommentItem[],
    OptimisticAction
  >(initialComments, (state, action) => {
    switch (action.type) {
      case "ADD":
        return [action.comment, ...state];
      case "DELETE":
        return state.filter((c) => c.id !== action.commentId);
      default:
        return state;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const cleanContent = content.trim();
    if (!cleanContent) return;

    setError(null);
    setContent(""); // Clear input immediately

    // Create optimistic comment
    const tempComment: CommentItem = {
      id: `temp-${Date.now()}`,
      content: cleanContent,
      createdAt: new Date(),
      authorId: currentUser.id,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
      },
    };

    startTransition(async () => {
      // 1. Optimistic Add
      setOptimisticComments({ type: "ADD", comment: tempComment });

      // 2. Perform server action
      const result = await addCommentAction(postId, cleanContent);
      if (result.success) {
        toast.success("Comment posted successfully.");
      } else {
        const errMsg = result.error || "Failed to add comment.";
        setError(errMsg);
        toast.error(errMsg);
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      setError(null);
      startTransition(async () => {
        // 1. Optimistic Delete
        setOptimisticComments({ type: "DELETE", commentId });

        // 2. Perform server action
        const result = await deleteCommentAction(commentId);
        if (result.success) {
          toast.success("Comment deleted successfully.");
        } else {
          const errMsg = result.error || "Failed to delete comment.";
          setError(errMsg);
          toast.error(errMsg);
        }
      });
    }
  };

  return (
    <section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
      <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
        Comments ({optimisticComments.length})
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Add Comment Form / Log in CTA */}
      <div className="mb-8">
        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Join the conversation..."
              disabled={isPending}
              rows={3}
              className="resize-none focus-visible:ring-primary"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending || !content.trim()}>
                {isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <Card className="border-dashed bg-zinc-50/50 dark:bg-zinc-900/30">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                Log in to post a comment and participate in the community.
              </p>
              <Link href={`/login?callbackUrl=${encodeURIComponent(postUrl)}`}>
                <Button variant="outline" size="sm">
                  Log in to comment
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comments Thread */}
      {optimisticComments.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/30 p-12 text-center dark:border-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No comments yet. Share your thoughts above!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {optimisticComments.map((comment) => {
            const showDelete = canDeleteComment(
              currentUser?.id,
              comment.authorId,
              postAuthorId
            );
            const isOptimisticTemp = comment.id.startsWith("temp-");

            return (
              <div
                key={comment.id}
                className={`flex gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-900/40 transition-opacity ${
                  isOptimisticTemp ? "opacity-60" : "opacity-100"
                }`}
              >
                {/* Author Avatar Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-150 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 shrink-0">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>

                {/* Comment Content block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={`/${comment.author.username}`}
                        className="text-sm font-bold text-zinc-900 hover:text-primary dark:text-zinc-100"
                      >
                        {comment.author.name}
                      </Link>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-550">
                        @{comment.author.username}
                      </span>
                      <span className="text-[10px] text-zinc-400">•</span>
                      <time className="text-xs text-zinc-500">
                        {formatRelativeTime(comment.createdAt)}
                      </time>
                    </div>

                    {showDelete && !isOptimisticTemp && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-zinc-400 hover:text-destructive dark:text-zinc-650 dark:hover:text-destructive p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-zinc-850 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
