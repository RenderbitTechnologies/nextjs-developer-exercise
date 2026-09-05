CREATE TYPE "blog_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" text PRIMARY KEY,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"cover_image" text,
	"hash_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "blog_status" DEFAULT 'draft'::"blog_status" NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "blogs_author_slug_uidx" ON "blogs" ("author_id","slug");--> statement-breakpoint
CREATE INDEX "blogs_status_created_idx" ON "blogs" ("status","created_at");--> statement-breakpoint
CREATE INDEX "blogs_author_status_created_idx" ON "blogs" ("author_id","status","created_at");--> statement-breakpoint
CREATE INDEX "comments_post_created_idx" ON "comments" ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_author_idx" ON "comments" ("author_id");--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_blogs_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blogs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;