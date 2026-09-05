import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function getUserByUsername(username: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`user:${username.toLowerCase()}`);

  const handle = username.toLowerCase();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      headerImage: user.headerImage,
      disabled: user.disabled,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(sql`lower(${user.username}) = ${handle}`)
    .limit(1);

  return rows[0] ?? null;
}
