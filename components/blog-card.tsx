import Link from "next/link";
import { RiChat3Line, RiTimer2Line } from "@remixicon/react";
import LikeButton from "@/components/like-button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { DEFAULT_COVER } from "@/lib/constants";
import { initialsFromName } from "@/lib/format";
import { searchHref } from "@/lib/search";

export type BlogCardProps = {
  className?: string;
  href: string;
  title: string;
  excerpt?: string | null;
  date: string;
  image?: string | null;
  author?: string;
  authorHref?: string;
  avatar?: string | null;
  comments?: number;
  likes?: number;
  liked?: boolean;
  signedIn?: boolean;
  postId?: string;
  tags?: string[];
  hideAuthor?: boolean;
};

export default function BlogCard({
  className,
  href,
  title,
  excerpt,
  date,
  image,
  author,
  authorHref,
  avatar,
  comments = 0,
  likes = 0,
  liked = false,
  signedIn = false,
  postId,
  tags = [],
  hideAuthor = false,
}: BlogCardProps) {
  const cover = image || DEFAULT_COVER;
  const initials = author ? initialsFromName(author) : "";

  return (
    <article
      className={cn(
        "hover:bg-muted/20 transition-colors ease-linear p-2 rounded-2xl",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="relative rounded-2xl overflow-hidden w-full h-75 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={title} className="object-cover size-full" />
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <RiTimer2Line size={17} aria-hidden />
            <span className="text-xs">{date}</span>
          </span>
          <h2 className="text-xl font-medium">{title}</h2>
          {excerpt ? (
            <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
          ) : null}
        </div>
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              render={<Link href={searchHref({ tag, type: "posts" })} />}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {postId ? (
            <LikeButton
              postId={postId}
              returnTo={href}
              liked={liked}
              count={likes}
              signedIn={signedIn}
              compact
            />
          ) : null}
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <RiChat3Line size={18} aria-hidden />
            <span className="text-xs">{comments}</span>
            <span className="sr-only">comments</span>
          </span>
        </div>
      </div>
      {hideAuthor || !author ? null : (
        <div className="mt-3 flex items-center gap-2">
          <Avatar size="sm">
            {avatar ? <AvatarImage src={avatar} alt={author} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {authorHref ? (
            <Link href={authorHref} className="font-medium hover:underline">
              {author}
            </Link>
          ) : (
            <p className="font-medium">{author}</p>
          )}
        </div>
      )}
    </article>
  );
}
