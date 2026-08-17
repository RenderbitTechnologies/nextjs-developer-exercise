import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Generates a unique username from an email address for OAuth users.
 * e.g. "john.doe@gmail.com" → "johndoe", or "johndoe2" if taken.
 */
async function generateUniqueUsername(email: string): Promise<string> {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20) || "user";

  let username = base;
  let i = 2;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${i++}`;
  }
  return username;
}

/**
 * Custom PrismaAdapter that auto-generates a username for OAuth users,
 * since Google doesn't provide one.
 */
function buildAdapter() {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (data: any) => {
      const username = await generateUniqueUsername(data.email as string);
      const created = await prisma.user.create({
        // Cast as any: editor TS server has stale Prisma types (pre-migration).
        // `npm run build` passes clean — this is safe.
        // password is intentionally absent (nullable after migration for OAuth users).
        data: {
          name: (data.name as string | null) || username,
          email: data.email as string,
          username,
          avatarUrl: (data.image as string | null) ?? null,
          needsOnboarding: true, // Google signups need to confirm username
        } as any,
      });
      return {
        ...created,
        // Source emailVerified from data (same value we just wrote) to avoid
        // stale editor-type squiggle on `created.emailVerified`.
        emailVerified: (data.emailVerified as Date | null) ?? null,
        image: created.avatarUrl ?? null,
      };
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: buildAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state"],
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatarUrl: (user as any).avatarUrl,
          needsOnboarding: (user as any).needsOnboarding,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // If the adapter failed to produce a user id, redirect to signup
      if (account?.provider === "google" && !user?.id) {
        return "/signup?error=google";
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On first sign-in, user object is populated
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.avatarUrl = (user as any).avatarUrl;
        token.needsOnboarding = (user as any).needsOnboarding;
      }
      // For Google OAuth, fields aren't in the user object — fetch from DB
      if (account?.provider === "google" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true, avatarUrl: true, needsOnboarding: true } as any,
        });
        if (dbUser) {
          token.username = (dbUser as any).username;
          token.avatarUrl = (dbUser as any).avatarUrl;
          token.needsOnboarding = (dbUser as any).needsOnboarding;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
        session.user.avatarUrl = token.avatarUrl as string | null | undefined;
        session.user.needsOnboarding = token.needsOnboarding as boolean | undefined;
      }
      return session;
    },
  },
});
