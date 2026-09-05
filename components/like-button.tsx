"use client";

import { useOptimistic } from "react";
import Link from "next/link";
import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import { toggleLike } from "@/app/actions/likes";
import { Button } from "@/components/ui/button";

export default function LikeButton({
  postId,
  returnTo,
  liked,
  count,
  signedIn,
  compact = false,
}: {
  postId: string;
  returnTo: string;
  liked: boolean;
  count: number;
  signedIn: boolean;
  compact?: boolean;
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    { liked, count },
    (current, nextLiked: boolean) => ({
      liked: nextLiked,
      count: Math.max(0, current.count + (nextLiked ? 1 : -1)),
    }),
  );

  const label = optimistic.liked ? "Unlike" : "Like";
  const countLabel = `${optimistic.count} ${optimistic.count === 1 ? "like" : "likes"}`;

  if (!signedIn) {
    return (
      <Button
        variant="ghost"
        size={compact ? "xs" : "sm"}
        nativeButton={false}
        render={
          <Link href={`/signin?next=${encodeURIComponent(returnTo)}`} />
        }
        aria-label={`Sign in to like this post. ${countLabel}`}
      >
        <RiHeartLine data-icon="inline-start" />
        {compact ? optimistic.count : countLabel}
      </Button>
    );
  }

  return (
    <form
      action={async () => {
        addOptimistic(!optimistic.liked);
        await toggleLike(postId, returnTo);
      }}
    >
      <Button
        type="submit"
        variant={compact ? "ghost" : optimistic.liked ? "secondary" : "outline"}
        size={compact ? "xs" : "sm"}
        aria-pressed={optimistic.liked}
        aria-label={`${label}. ${countLabel}`}
      >
        {optimistic.liked ? (
          <RiHeartFill data-icon="inline-start" />
        ) : (
          <RiHeartLine data-icon="inline-start" />
        )}
        {compact ? optimistic.count : optimistic.liked ? "Liked" : "Like"}
        {compact ? null : (
          <span className="text-muted-foreground">{optimistic.count}</span>
        )}
      </Button>
    </form>
  );
}
