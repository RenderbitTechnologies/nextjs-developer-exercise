import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getSession } from "@/lib/session";

export const instant = false;

export const metadata = {
  title: "Sign up · Blogly",
  description: "Create a Blogly account and claim your username.",
};

export default async function SignUpPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/");
  }

  return <SignUpForm />;
}
