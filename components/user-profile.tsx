"use client";

import FollowButton from "@/components/follow-button";
import {
  RiCalendarLine,
  RiQuillPenLine,
} from "@remixicon/react";
import PostGrid from "@/components/post-grid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_COVER } from "@/lib/constants";
import type { PostListItem } from "@/lib/db/queries/posts";
import { formatPostDate, initialsFromName } from "@/lib/format";

export default function UserProfile({
  user,
  posts,
  page,
  pageCount,
  totalPosts,
  signedIn = false,
  likedIds = [],
  isFollowing = false,
  isOwner = false,
}: {
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    headerImage: string | null;
    createdAt: Date;
  };
  posts: PostListItem[];
  page: number;
  pageCount: number;
  totalPosts: number;
  signedIn?: boolean;
  likedIds?: string[];
  isFollowing?: boolean;
  isOwner?: boolean;
}) {
  const initials = initialsFromName(user.name);
  const cover = user.headerImage || DEFAULT_COVER;

  return (
    <div className="mx-auto min-h-svh w-full px-4 pb-10 sm:w-9/12 sm:px-0 mt-5">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col">
          <div className="overflow-hidden rounded-2xl bg-muted h-48 sm:h-64 md:h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={`${user.name}'s header image`}
              className="size-full object-cover"
            />
          </div>

          <div className="flex items-end justify-between gap-3 px-1">
            <Avatar className="size-24 sm:size-28 -mt-12 sm:-mt-14 ring-4 ring-background">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            {isOwner ? null : (
              <div className="mb-1 flex items-center gap-2">
                <FollowButton
                  userId={user.id}
                  username={user.username}
                  following={isFollowing}
                  signedIn={signedIn}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 px-1">
            <div className="flex flex-col">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {user.name}
              </h1>
              <p className="text-muted-foreground">{`@${user.username}`}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalPosts} {totalPosts === 1 ? "post" : "posts"} · Joined{" "}
              {formatPostDate(user.createdAt)}
            </p>
          </div>
        </header>

        <Tabs defaultValue="blogs" className="gap-4">
          <TabsList
            variant="line"
            className="h-10 w-full justify-start gap-4 bg-background"
          >
            <TabsTrigger value="home" className="flex-none px-3">
              Home
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex-none px-3">
              Blogs
            </TabsTrigger>
            <TabsTrigger value="about" className="flex-none px-3">
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-medium tracking-tight">
                Latest from {user.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Recent published posts on this blog.
              </p>
            </div>
            {posts.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <RiQuillPenLine />
                  </EmptyMedia>
                  <EmptyTitle>No posts yet</EmptyTitle>
                  <EmptyDescription>
                    {user.name} has not published anything on Blogly.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <PostGrid
                posts={posts.slice(0, 3)}
                page={1}
                pageCount={1}
                basePath={`/${user.username}`}
                hideAuthor
                signedIn={signedIn}
                likedIds={likedIds}
              />
            )}
          </TabsContent>

          <TabsContent value="blogs" className="flex flex-col gap-6">
            {posts.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <RiQuillPenLine />
                  </EmptyMedia>
                  <EmptyTitle>No posts yet</EmptyTitle>
                  <EmptyDescription>
                    {isOwner
                      ? "Write your first post from the admin panel."
                      : `${user.name} has not published anything yet.`}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <PostGrid
                posts={posts}
                page={page}
                pageCount={pageCount}
                basePath={`/${user.username}`}
                hideAuthor
                signedIn={signedIn}
                likedIds={likedIds}
              />
            )}
          </TabsContent>

          <TabsContent value="about" className="flex flex-col gap-6">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-heading text-lg font-medium tracking-tight">
                About {user.name}
              </h2>
              <p className="text-muted-foreground">
                Writing on Blogly at @{user.username}.
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RiCalendarLine size={17} aria-hidden />
                <span>Joined {formatPostDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <RiQuillPenLine size={17} aria-hidden />
                <span>
                  {totalPosts} {totalPosts === 1 ? "post" : "posts"} on Blogly
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
