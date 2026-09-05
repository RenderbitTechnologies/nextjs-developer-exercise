import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/safe-next";
import { getSession } from "@/lib/session";

export const instant = false;

export const metadata = {
  title: "Sign in · Blogly",
  description: "Sign in to write and publish on Blogly.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const nextPath = safeNextPath((await searchParams).next);
  if (session?.user) {
    redirect(nextPath);
  }

  return <SignInForm nextPath={nextPath} />;
}
