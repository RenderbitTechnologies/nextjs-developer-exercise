import Link from "next/link";
import DeletePostButton from "@/components/delete-post-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPostsByAuthor } from "@/lib/db/queries/posts";
import { formatPostDate } from "@/lib/format";
import { getSession } from "@/lib/session";

export const instant = false;

export const metadata = {
  title: "Admin · Blogly",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const posts = await listPostsByAuthor(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Your posts
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and delete writing on your Blogly.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/new" />}>
          New post
        </Button>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You have not written anything yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-medium">{post.title}</h2>
                  <Badge variant="outline">{post.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  /{session.user.username}/{post.slug} ·{" "}
                  {formatPostDate(post.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {post.status === "published" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <Link href={`/${session.user.username}/${post.slug}`} />
                    }
                  >
                    View
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/admin/${post.id}/edit`} />}
                >
                  Edit
                </Button>
                <DeletePostButton postId={post.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
