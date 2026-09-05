"use server";

import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { auth } from "@/lib/auth";
import { reservedUsernameSet } from "@/lib/constants";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { revalidatePublicPosts } from "@/lib/revalidate";
import { getSession } from "@/lib/session";

export type SettingsFormState = {
  error?: string;
  success?: string;
};

const USERNAME = /^[a-zA-Z0-9_]{3,24}$/;
const SPECIAL_CHAR = /[^A-Za-z0-9]/;

function authErrorMessage(error: unknown, fallback: string) {
  if (error instanceof APIError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

async function requireUser(nextPath: string) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  }
  return session.user;
}

export async function updateAccount(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const current = await requireUser("/settings/account");
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const image = String(formData.get("image") ?? "").trim();
  const headerImage = String(formData.get("headerImage") ?? "").trim();

  if (name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }
  if (!USERNAME.test(username)) {
    return { error: "Use 3–24 letters, numbers, or underscores." };
  }
  if (reservedUsernameSet.has(username)) {
    return { error: "That username is reserved." };
  }
  if (image && !/^https:\/\//i.test(image)) {
    return { error: "Avatar must be an uploaded https image." };
  }
  if (headerImage && !/^https:\/\//i.test(headerImage)) {
    return { error: "Header image must be an uploaded https image." };
  }

  const taken = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.username}) = ${username}`)
    .limit(1);
  if (taken[0] && taken[0].id !== current.id) {
    return { error: "That username is already taken." };
  }

  try {
    await auth.api.updateUser({
      body: {
        name,
        username,
        image: image || null,
        headerImage: headerImage || null,
      },
      headers: await headers(),
    });
  } catch (error) {
    return { error: authErrorMessage(error, "Could not update your account.") };
  }

  await db
    .update(user)
    .set({
      headerImage: headerImage || null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, current.id));

  if (current.username && current.username.toLowerCase() !== username) {
    revalidatePublicPosts(current.username);
  }
  revalidatePublicPosts(username);
  revalidatePath("/settings/account");
  return { success: "Account saved." };
}

export async function updatePassword(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireUser("/settings/security");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const revokeOtherSessions = formData.get("revokeOtherSessions") === "on";

  if (currentPassword.length < 1) {
    return { error: "Enter your current password." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (!SPECIAL_CHAR.test(newPassword)) {
    return { error: "Include at least one special character." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions,
      },
      headers: await headers(),
    });
  } catch (error) {
    return {
      error: authErrorMessage(error, "Could not change your password."),
    };
  }

  return { success: "Password updated." };
}

export async function setAccountDisabled(disabled: boolean) {
  const current = await requireUser("/settings/manage");

  await db
    .update(user)
    .set({ disabled, updatedAt: new Date() })
    .where(eq(user.id, current.id));

  revalidatePublicPosts(current.username);
  revalidatePath("/settings/manage");
}

export async function deleteAccount(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const current = await requireUser("/settings/manage");
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== current.username) {
    return { error: `Type ${current.username} to confirm deletion.` };
  }
  if (password.length < 1) {
    return { error: "Enter your password to delete this account." };
  }

  try {
    await auth.api.deleteUser({
      body: { password },
      headers: await headers(),
    });
  } catch (error) {
    return {
      error: authErrorMessage(error, "Could not delete your account."),
    };
  }

  revalidatePublicPosts(current.username);
  redirect("/");
}
