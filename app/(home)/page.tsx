import { Suspense } from "react";
import Link from "next/link";
import Featured from "@/components/featured";
import HomeTabs from "@/components/home-tabs";
import PostGrid from "@/components/post-grid";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { RiEmotionSadLine } from "@remixicon/react";
import { listFollowingIds } from "@/lib/db/queries/follows";
import {
  getFeaturedPosts,
  listPublishedPosts,
  listPublishedPostsByAuthorIds,
} from "@/lib/db/queries/posts";
import { getSession } from "@/lib/session";
import { getViewerLikeState } from "@/lib/viewer-likes";

async function FeaturedWithLikes({
  posts,
}: {
  posts: Awaited<ReturnType<typeof getFeaturedPosts>>;
}) {
  const likeState = await getViewerLikeState(posts.map((post) => post.id));
  return (
    <Featured
      posts={posts}
      signedIn={likeState.signedIn}
      likedIds={likeState.likedIds}
    />
  );
}

async function FeaturedSection() {
  const posts = await getFeaturedPosts();
  return (
    <Suspense
      fallback={<Featured posts={posts} signedIn={false} likedIds={[]} />}
    >
      <FeaturedWithLikes posts={posts} />
    </Suspense>
  );
}

async function PublishedFeed({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const feed = await listPublishedPosts(page);

  if (feed.items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No published posts yet. Be the first to write one.
      </p>
    );
  }

  return (
    <Suspense
      fallback={
        <PostGrid
          posts={feed.items}
          page={feed.page}
          pageCount={feed.pageCount}
          basePath="/"
        />
      }
    >
      <PublishedFeedWithLikes feed={feed} />
    </Suspense>
  );
}

async function PublishedFeedWithLikes({
  feed,
}: {
  feed: Awaited<ReturnType<typeof listPublishedPosts>>;
}) {
  const likeState = await getViewerLikeState(feed.items.map((post) => post.id));
  return (
    <PostGrid
      posts={feed.items}
      page={feed.page}
      pageCount={feed.pageCount}
      basePath="/"
      signedIn={likeState.signedIn}
      likedIds={likeState.likedIds}
    />
  );
}

async function FollowingFeed({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "following" ? "following" : "for-you";
  const page = Math.max(1, Number(params.page) || 1);
  const followingPage = tab === "following" ? page : 1;
  const session = await getSession();

  if (!session?.user) {
    return (
      <Empty className="min-h-80">
        <EmptyMedia variant="icon">
          <RiEmotionSadLine />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Sign in to follow writers</EmptyTitle>
          <EmptyDescription>
            <Link href="/signin?next=/?tab=following" className="underline">
              Sign in
            </Link>{" "}
            and follow a few people to fill this timeline.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const authorIds = await listFollowingIds(session.user.id);
  if (authorIds.length === 0) {
    return (
      <Empty className="min-h-80">
        <EmptyMedia variant="icon">
          <RiEmotionSadLine />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Nothing to show here</EmptyTitle>
          <EmptyDescription>
            You are not following anyone yet. Follow a few writers to curate
            this timeline.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const feed = await listPublishedPostsByAuthorIds(authorIds, followingPage);
  if (feed.items.length === 0) {
    return (
      <Empty className="min-h-80">
        <EmptyMedia variant="icon">
          <RiEmotionSadLine />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No posts from people you follow</EmptyTitle>
          <EmptyDescription>
            The writers you follow have not published anything yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const likeState = await getViewerLikeState(
    feed.items.map((post) => post.id),
    session,
  );

  return (
    <PostGrid
      posts={feed.items}
      page={feed.page}
      pageCount={feed.pageCount}
      basePath="/?tab=following"
      signedIn={likeState.signedIn}
      likedIds={likeState.likedIds}
    />
  );
}

function FeedFallback() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2 p-2">
          <div className="h-75 rounded-2xl bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-6 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const defaultTab = params.tab === "following" ? "following" : "for-you";

  return (
    <div className="mx-auto min-h-svh w-full px-4 pb-10 sm:w-9/12 sm:px-0 mt-5">
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 lg:h-[min(36rem,calc(100svh-12rem))] lg:grid-cols-3 lg:grid-rows-2">
            <div className="h-56 rounded-2xl bg-muted lg:col-span-2 lg:row-span-2 lg:h-auto" />
            <div className="h-40 rounded-2xl bg-muted lg:h-auto" />
            <div className="h-40 rounded-2xl bg-muted lg:h-auto" />
          </div>
        }
      >
        <FeaturedSection />
      </Suspense>
      <Separator className="my-8" />
      <HomeTabs defaultTab={defaultTab} following={
        <Suspense fallback={<FeedFallback />}>
          <FollowingFeed searchParams={searchParams} />
        </Suspense>
      }>
        <Suspense fallback={<FeedFallback />}>
          <PublishedFeed searchParams={searchParams} />
        </Suspense>
      </HomeTabs>
    </div>
  );
}
