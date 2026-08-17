import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config"; // Ensure env variables are loaded

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding test users and posts...");

  // Clear existing posts/users
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password!123", 12);

  // Create Alice
  const alice = await prisma.user.create({
    data: {
      name: "Alice Smith",
      email: "alice@example.com",
      username: "alice",
      password: passwordHash,
      bio: "Software Engineer. Writing about web dev, design systems, and TypeScript.",
    },
  });

  // Create Bob
  const bob = await prisma.user.create({
    data: {
      name: "Bob Johnson",
      email: "bob@example.com",
      username: "bob",
      password: passwordHash,
      bio: "Outdoor enthusiast and writer. Sharing stories from the trail.",
    },
  });

  console.log(`Users created: ${alice.name} and ${bob.name}`);

  // Create Bob's posts (1 published, 1 draft)
  await prisma.post.create({
    data: {
      title: "My First Mountain Climb",
      slug: "my-first-mountain-climb",
      content: "Climbing Mount Whitney was the hardest thing I have ever done. It taught me about persistence, preparation, and pacing. In this article, I outline my preparation, gear checklist, and the timeline of the summit push.",
      published: true,
      authorId: bob.id,
      createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
    },
  });

  await prisma.post.create({
    data: {
      title: "Hiking in the Rain (Draft)",
      slug: "hiking-in-the-rain",
      content: "This is a draft post about hiking in the rain. Hiking during heavy rainfall requires careful waterproofing, appropriate layers, and a plan for emergencies. This should only be visible to Bob.",
      published: false,
      authorId: bob.id,
      createdAt: new Date(),
    },
  });

  // Create Alice's posts (10 posts to test pagination - 8 per page)
  for (let i = 1; i <= 10; i++) {
    const timeOffsetMs = 3600000 * 2 * i; // Each post is created 2 hours apart
    await prisma.post.create({
      data: {
        title: `Alice's Story Number ${i}`,
        slug: `alice-story-number-${i}`,
        content: `This is the full content for Alice's article number ${i}. It covers a variety of tech topics including Next.js, React 19, Tailwind v4, and Prisma 7 database integrations. Reading through this article series will help you master modern web development stacks.`,
        published: true,
        authorId: alice.id,
        createdAt: new Date(Date.now() - timeOffsetMs),
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
