"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/actions/profile";
import { uploadAvatarAction } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { AvatarImage } from "@/components/avatar-image";

interface ProfileFormProps {
  user: {
    name: string;
    username: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    // Append the current avatar URL state so it gets saved correctly
    formData.append("avatarUrl", avatarUrl || "");
    const res = await updateProfile(prevState, formData);
    if (res?.success) {
      toast.success("Profile updated successfully!");
    } else if (res?.error) {
      toast.error(res.error);
    }
    return res;
  }, null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleAvatarUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleAvatarUpload(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAvatarAction(formData);
      if (res.success && res.url) {
        setAvatarUrl(res.url);
        toast.success("Avatar uploaded successfully!");
      } else {
        toast.error(res.error || "Failed to upload avatar.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during avatar upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <form action={formAction} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-3 border-b border-zinc-150 pb-6 dark:border-zinc-800">
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-350">
          Profile Picture
        </label>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-750"
          } bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden group`}
        >
          {avatarUrl ? (
            <>
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAvatarUrl(null);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold rounded-full"
              >
                Remove Image
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer p-2">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading ? (
                <span className="text-[10px] text-zinc-500 font-medium animate-pulse">Uploading...</span>
              ) : (
                <>
                  <svg
                    className="h-6 w-6 text-zinc-400 group-hover:text-zinc-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center font-medium mt-1">
                    Drag & Drop or Click
                  </span>
                </>
              )}
            </label>
          )}
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      )}

      {/* Read-only Email Field */}
      <Field>
        <FieldLabel htmlFor="email">Email Address</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-zinc-50 text-zinc-500 cursor-not-allowed dark:bg-zinc-950"
          />
          <p className="text-[11px] text-zinc-450 dark:text-zinc-500 mt-1.5">
            Your email address is managed via your account provider.
          </p>
        </FieldContent>
      </Field>

      {/* Full Name */}
      <Field data-invalid={state?.error && state?.error.includes("Name") ? "true" : undefined}>
        <FieldLabel htmlFor="name">Full Name</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name}
            placeholder="John Doe"
            disabled={isPending}
            required
          />
        </FieldContent>
      </Field>

      {/* Username */}
      <Field data-invalid={state?.error && state?.error.includes("Username") ? "true" : undefined}>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <FieldContent>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-medium">
              @
            </span>
            <Input
              id="username"
              name="username"
              type="text"
              defaultValue={user.username}
              placeholder="username"
              className="pl-8"
              disabled={isPending}
              required
            />
          </div>
        </FieldContent>
      </Field>

      {/* Bio */}
      <Field data-invalid={state?.error && state?.error.includes("Bio") ? "true" : undefined}>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <FieldContent>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio || ""}
            placeholder="A brief bio about yourself"
            rows={4}
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-350 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-550 dark:placeholder:text-zinc-600 focus:dark:border-zinc-700 transition-colors"
          />
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving changes..." : "Save Profile"}
      </Button>
    </form>
  );
}
