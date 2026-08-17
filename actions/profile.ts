"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const username = (formData.get("username") as string).toLowerCase().trim();
  const bio = formData.get("bio") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  const parsed = ProfileSchema.safeParse({ name, username, bio, avatarUrl });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    // Check username uniqueness if they changed it
    const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    if (existing && existing.id !== session.user.id) {
      return { error: "Username is already taken" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
        bio: parsed.data.bio || null,
        avatarUrl: parsed.data.avatarUrl || null,
      } as any,
    });

    revalidatePath("/admin");
    revalidatePath(`/${parsed.data.username}`);
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  return { success: true };
}
