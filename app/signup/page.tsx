"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/register";
import { uploadAvatarAction } from "@/actions/upload";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SignupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
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

type SignupInput = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error") === "google";
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      bio: "",
    },
  });

  const onSubmit = (data: SignupInput) => {
    setFormError(null);
    startTransition(async () => {
      const response = await registerUser({
        ...data,
        avatarUrl: avatarUrl || undefined,
      });
      if (response.success) {
        toast.success("Account created successfully! Please log in.");
        router.push("/login?signup=success");
      } else {
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, message]) => {
            if (field === "form") {
              setFormError(message);
              toast.error(message);
            } else {
              setError(field as keyof SignupInput, {
                type: "server",
                message,
              });
            }
          });
          toast.error("Please fix the validation errors below.");
        } else {
          toast.error("Failed to create account.");
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create your account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Start writing and sharing your stories
          </p>
        </div>

        {googleError && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400">
            <strong>Google sign-in failed.</strong> Please create an account below, or try again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {formError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}

          {/* Drag & Drop Avatar Uploader */}
          <div className="flex flex-col items-center space-y-2 pb-4">
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
                  : "border-zinc-200 hover:border-zinc-350 dark:border-zinc-800 dark:hover:border-zinc-700"
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
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold rounded-full"
                  >
                    Remove
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
                    <span className="text-[10px] text-zinc-505 dark:text-zinc-400 font-medium animate-pulse">Uploading...</span>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5 text-zinc-400 group-hover:text-zinc-500 transition-colors"
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
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500 text-center font-medium mt-1">
                        Drag & Drop or Click
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <Field data-invalid={errors.name ? "true" : undefined}>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                disabled={isPending}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </FieldContent>
          </Field>

          <Field data-invalid={errors.email ? "true" : undefined}>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                disabled={isPending}
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </FieldContent>
          </Field>

          <Field data-invalid={errors.username ? "true" : undefined}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <FieldContent>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                disabled={isPending}
                {...register("username")}
              />
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                Your profile URL: /username (will be normalized to URL-safe format)
              </span>
              <FieldError>{errors.username?.message}</FieldError>
            </FieldContent>
          </Field>

          <Field data-invalid={errors.password ? "true" : undefined}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </FieldContent>
          </Field>

          <Field data-invalid={errors.bio ? "true" : undefined}>
            <FieldLabel htmlFor="bio">Bio (Optional)</FieldLabel>
            <FieldContent>
              <Input
                id="bio"
                type="text"
                placeholder="A brief bio about yourself"
                disabled={isPending}
                {...register("bio")}
              />
              <FieldError>{errors.bio?.message}</FieldError>
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">or</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
