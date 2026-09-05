import { getLikedPostIds } from "@/lib/db/queries/likes";
import { getSession } from "@/lib/session";

type Session = Awaited<ReturnType<typeof getSession>>;

export async function getViewerLikeState(
  postIds: string[],
  session?: Session,
) {
  const current = session === undefined ? await getSession() : session;
  if (!current?.user) {
    return { signedIn: false, likedIds: [] as string[] };
  }

  const liked = await getLikedPostIds(current.user.id, postIds);
  return { signedIn: true, likedIds: [...liked] };
}
