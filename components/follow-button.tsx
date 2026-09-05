"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { toggleFollow } from "@/app/actions/follows";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function FollowButton({
  userId,
  username,
  following,
  signedIn,
}: {
  userId: string;
  username: string;
  following: boolean;
  signedIn: boolean;
}) {
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    following,
    (_current, next: boolean) => next,
  );
  const [pending, startTransition] = useTransition();
  const returnTo = `/${username}`;

  if (!signedIn) {
    return (
      <Button
        nativeButton={false}
        render={
          <Link href={`/signin?next=${encodeURIComponent(returnTo)}`} />
        }
      >
        Follow
      </Button>
    );
  }

  return (
    <Button
      variant={optimisticFollowing ? "outline" : "default"}
      aria-pressed={optimisticFollowing}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          setOptimisticFollowing(!optimisticFollowing);
          await toggleFollow(userId, returnTo);
        });
      }}
    >
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {optimisticFollowing ? "Following" : "Follow"}
    </Button>
  );
}
