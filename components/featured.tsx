import Link from "next/link";
import { RiChat3Line, RiTimer2Line } from "@remixicon/react";
import LikeButton from "@/components/like-button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { DEFAULT_COVER } from "@/lib/constants";
import { formatPostDate, initialsFromName } from "@/lib/format";
import type { PostListItem } from "@/lib/db/queries/posts";

function FeaturedCard({
  post,
  variant,
  className,
  signedIn,
  liked,
}: {
  post: PostListItem;
  variant: "main" | "side";
  className?: string;
  signedIn: boolean;
  liked: boolean;
}) {
  const isMain = variant === "main";
  const href = `/${post.authorUsername}/${post.slug}`;
  const cover = post.coverImage || DEFAULT_COVER;

  return (
    <article className={cn("flex h-full min-h-0 flex-col", className)}>
      <Link href={href} className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-muted",
            isMain
              ? "aspect-16/10 lg:aspect-auto lg:min-h-0 lg:flex-1"
              : "aspect-video lg:aspect-auto lg:min-h-0 lg:flex-1",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={post.title}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className={cn("shrink-0", isMain ? "pt-3" : "pt-2")}>
          <div className={cn("flex flex-col", isMain ? "gap-2" : "gap-1")}>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <RiTimer2Line size={17} aria-hidden />
              <span className="text-xs">{formatPostDate(post.createdAt)}</span>
            </span>
            <h2
              className={cn(
                "leading-tight",
                isMain
                  ? "line-clamp-2 text-2xl sm:text-3xl"
                  : "line-clamp-2 text-lg",
              )}
            >
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
        <Link
          href={`/${post.authorUsername}`}
          className="flex min-w-0 items-center gap-2"
        >
          <Avatar size="sm">
            {post.authorImage ? (
              <AvatarImage src={post.authorImage} alt={post.authorName} />
            ) : null}
            <AvatarFallback>
              {initialsFromName(post.authorName)}
            </AvatarFallback>
          </Avatar>
          <p className="truncate font-medium">{post.authorName}</p>
        </Link>
        <div className="flex items-center gap-1">
          <LikeButton
            postId={post.id}
            returnTo={href}
            liked={liked}
            count={post.likeCount}
            signedIn={signedIn}
            compact
          />
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <RiChat3Line size={17} aria-hidden />
            <span className="text-xs">{post.commentCount}</span>
            <span className="sr-only">comments</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Featured({
  posts,
  signedIn = false,
  likedIds = [],
}: {
  posts: PostListItem[];
  signedIn?: boolean;
  likedIds?: string[];
}) {
  if (posts.length === 0) return null;
  const [main, ...side] = posts;

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-[min(36rem,calc(100svh-12rem))] lg:grid-cols-3 lg:grid-rows-2">
      <FeaturedCard
        post={main}
        variant="main"
        className="min-h-0 lg:col-span-2 lg:row-span-2"
        signedIn={signedIn}
        liked={likedIds.includes(main.id)}
      />
      {side.map((post) => (
        <FeaturedCard
          key={post.id}
          post={post}
          variant="side"
          className="min-h-0"
          signedIn={signedIn}
          liked={likedIds.includes(post.id)}
        />
      ))}
    </div>
  );
}
