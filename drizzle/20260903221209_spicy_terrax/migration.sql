CREATE TABLE "likes" (
	"id" text PRIMARY KEY,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "likes_post_user_uidx" ON "likes" ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "likes_user_idx" ON "likes" ("user_id");--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_blogs_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blogs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;