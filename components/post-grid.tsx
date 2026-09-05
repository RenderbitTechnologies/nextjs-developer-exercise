import BlogCard from "@/components/blog-card";
import PostPagination from "@/components/post-pagination";
import { formatPostDate } from "@/lib/format";
import type { PostListItem } from "@/lib/db/queries/posts";

export default function PostGrid({
  posts,
  page,
  pageCount,
  basePath,
  hideAuthor = false,
  signedIn = false,
  likedIds = [],
}: {
  posts: PostListItem[];
  page: number;
  pageCount: number;
  basePath: string;
  hideAuthor?: boolean;
  signedIn?: boolean;
  likedIds?: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            className="w-full"
            href={`/${post.authorUsername}/${post.slug}`}
            title={post.title}
            excerpt={post.excerpt}
            date={formatPostDate(post.createdAt)}
            image={post.coverImage}
            author={post.authorName}
            authorHref={`/${post.authorUsername}`}
            avatar={post.authorImage}
            comments={post.commentCount}
            likes={post.likeCount}
            liked={likedIds.includes(post.id)}
            signedIn={signedIn}
            postId={post.id}
            tags={post.hashTags}
            hideAuthor={hideAuthor}
          />
        ))}
      </div>
      <PostPagination basePath={basePath} page={page} pageCount={pageCount} />
    </div>
  );
}
