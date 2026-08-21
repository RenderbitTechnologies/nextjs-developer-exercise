import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = ["/login", "/signup"].includes(nextUrl.pathname);
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isOnboardingRoute = nextUrl.pathname === "/onboarding";

      // Redirect to onboarding if logged in but user needs onboarding
      if (isLoggedIn && auth?.user?.needsOnboarding && !isOnboardingRoute) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      // Redirect away from onboarding if already onboarded
      if (isLoggedIn && !auth?.user?.needsOnboarding && isOnboardingRoute) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isAdminRoute || isOnboardingRoute) {
        if (isLoggedIn) return true;
        // Return false to redirect to the login page
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username;
      }
      return session;
    },
  },
  providers: [], // Empty array, we will populate this in auth.ts
} satisfies NextAuthConfig;
