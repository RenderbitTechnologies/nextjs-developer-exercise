"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const UsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, hyphens, and underscores"
  );

export async function completeOnboarding(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const username = formData.get("username") as string;
  const parsed = UsernameSchema.safeParse(username);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cleanUsername = parsed.data.toLowerCase();

  try {
    // Check if the username is already taken by someone else
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing && existing.id !== session.user.id) {
      return { error: "Username is already taken" };
    }

    // Update user in DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: cleanUsername,
        needsOnboarding: false,
      } as any,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  redirect("/admin");
}
