"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // replace non-alphanumerics with hyphens
    .replace(/-+/g, "-")         // collapse consecutive hyphens
    .replace(/^-+|-+$/g, "");    // remove leading/trailing hyphens
}

const RegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .refine(
      (val) => /^[a-z0-9-]+$/.test(val),
      "Username can only contain lowercase letters, numbers, and hyphens"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
      "Password must contain at least one special character"
    ),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export async function registerUser(data: {
  name: string;
  email: string;
  username: string;
  password?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  try {
    // 1. Normalize the username
    const normalizedUsername = normalizeUsername(data.username);

    // 2. Validate input using Zod schema
    const validation = RegisterSchema.safeParse({
      ...data,
      username: normalizedUsername,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors: fieldErrors };
    }

    const { name, email, username, password, bio } = validation.data;

    // 3. Check if email is already registered
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return {
        success: false,
        errors: { email: "This email address is already registered" },
      };
    }

    // 4. Check if username is already taken
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return {
        success: false,
        errors: { username: "This username is already taken" },
      };
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create the user in database
    await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        bio: bio || null,
        avatarUrl: data.avatarUrl || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      errors: { form: "An unexpected error occurred. Please try again." },
    };
  }
}
