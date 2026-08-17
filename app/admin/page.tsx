import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helper";
import { formatRelativeTime } from "@/lib/date-helper";
import DeletePostButton from "@/components/delete-post-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Settings } from "lucide-react";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: Date;
}

export const metadata = {
  title: "Dashboard - StoryStream Admin",
  description: "Manage your published stories and drafts.",
};

export default async function AdminDashboardPage() {
  // 1. Enforce authentication
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?callbackUrl=/admin");
  }

  // 2. Fetch all posts owned by this user
  const posts = (await prisma.post.findMany({
    where: {
      authorId: currentUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as PostListItem[];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Hello, {currentUser.name}. Manage and publish your articles here.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/profile" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Settings className="h-4 w-4 text-zinc-500" />
              <span>Edit Profile</span>
            </Button>
          </Link>
          <Link href="/admin/new" className="flex-1 sm:flex-initial">
            <Button className="w-full">Write New Story</Button>
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 p-16 text-center dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            No stories yet
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
            You haven&apos;t written any stories or drafts on StoryStream. Click below to write your first story!
          </p>
          <Link href="/admin/new">
            <Button>Write Your First Post</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/20 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50/55 dark:bg-zinc-900/60">
                <TableRow>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold w-32">Status</TableHead>
                  <TableHead className="font-semibold w-40">Created</TableHead>
                  <TableHead className="text-right font-semibold w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post: PostListItem) => (
                  <TableRow key={post.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30">
                    <TableCell className="font-medium">
                      {post.published ? (
                        <Link
                          href={`/${currentUser.username}/${post.slug}`}
                          className="text-zinc-900 hover:text-primary dark:text-zinc-100 hover:underline leading-relaxed font-semibold block max-w-md truncate"
                        >
                          {post.title}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-800 dark:text-zinc-250 leading-relaxed font-semibold max-w-xs truncate">
                            {post.title}
                          </span>
                          <span className="text-[11px] text-zinc-450 italic">(Preview draft on edit)</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.published ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-250 hover:bg-emerald-50">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-650 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-250 hover:bg-zinc-100">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {formatRelativeTime(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/edit/${post.id}`}>
                          <Button variant="ghost" size="icon" title="Edit Post">
                            <Edit className="h-4 w-4 text-zinc-500 hover:text-zinc-900" />
                          </Button>
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="grid gap-4 md:hidden">
            {posts.map((post: PostListItem) => (
              <Card key={post.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      {post.published ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-250 hover:bg-emerald-50">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-650 dark:bg-zinc-800/60 dark:text-zinc-400 border border-zinc-250 hover:bg-zinc-100">
                          Draft
                        </Badge>
                      )}
                      <span className="text-xs text-zinc-500">{formatRelativeTime(post.createdAt)}</span>
                    </div>
                    {post.published ? (
                      <Link
                        href={`/${currentUser.username}/${post.slug}`}
                        className="text-base font-bold text-zinc-900 hover:text-primary dark:text-zinc-100 hover:underline leading-snug block"
                      >
                        {post.title}
                      </Link>
                    ) : (
                      <span className="text-base font-bold text-zinc-850 dark:text-zinc-200 leading-snug block">
                        {post.title} <span className="text-xs font-normal text-zinc-400 italic ml-1">(Draft)</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 mt-1">
                    <Link href={`/admin/edit/${post.id}`} className="flex-1 max-w-[100px]">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5 focus-visible:ring-primary">
                        <Edit className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Edit</span>
                      </Button>
                    </Link>
                    <DeletePostButton postId={post.id} postTitle={post.title} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
