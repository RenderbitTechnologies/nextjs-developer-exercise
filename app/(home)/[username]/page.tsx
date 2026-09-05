import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UserProfile from "@/components/user-profile";
import { isFollowing } from "@/lib/db/queries/follows";
import { listPublishedPostsByUsername } from "@/lib/db/queries/posts";
import { getUserByUsername } from "@/lib/db/queries/users";
import { getSession } from "@/lib/session";
import { getViewerLikeState } from "@/lib/viewer-likes";

type UserPageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
};

function profileHandle(username: string) {
  return decodeURIComponent(username).replace(/^@/, "");
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const handle = profileHandle(username);
  const profile = await getUserByUsername(handle);

  if (!profile || profile.disabled) {
    return { title: `${handle} · Blogly` };
  }

  return {
    title: `${profile.name} · Blogly`,
    description: `Read writing by ${profile.name} on Blogly.`,
  };
}

export default async function UserPage({ params, searchParams }: UserPageProps) {
  const { username } = await params;
  const handle = profileHandle(username);
  const page = Math.max(1, Number((await searchParams).page) || 1);

  const [profile, feed, session] = await Promise.all([
    getUserByUsername(handle),
    listPublishedPostsByUsername(handle, page),
    getSession(),
  ]);

  if (!profile || profile.disabled) {
    notFound();
  }

  const [likeState, following] = await Promise.all([
    getViewerLikeState(
      feed.items.map((post) => post.id),
      session,
    ),
    session?.user
      ? isFollowing(session.user.id, profile.id)
      : Promise.resolve(false),
  ]);

  return (
    <UserProfile
      user={profile}
      posts={feed.items}
      page={feed.page}
      pageCount={feed.pageCount}
      totalPosts={feed.total}
      signedIn={likeState.signedIn}
      likedIds={likeState.likedIds}
      isFollowing={following}
      isOwner={session?.user.id === profile.id}
    />
  );
}
