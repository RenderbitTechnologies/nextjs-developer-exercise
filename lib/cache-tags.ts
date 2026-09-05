export const cacheTags = {
  posts: "posts",
  featured: "featured",
  userPosts: (username: string) => `posts:${username}`,
  post: (username: string, slug: string) => `post:${username}:${slug}`,
  comments: (postId: string) => `comments:${postId}`,
  follows: (userId: string) => `follows:${userId}`,
} as const;
