import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Prevent multiple instances of Prisma Client in development due to hot reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

let prisma: PrismaClient;
let pool: pg.Pool;

if (process.env.NODE_ENV === "production") {
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  pool = globalForPrisma.pool;
  const adapter = new PrismaPg(pool);
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
