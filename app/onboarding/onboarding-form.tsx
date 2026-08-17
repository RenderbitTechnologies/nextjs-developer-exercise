"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";

import { AvatarImage } from "@/components/avatar-image";

interface OnboardingFormProps {
  defaultUsername: string;
  avatarUrl: string | null;
  name: string;
}

export function OnboardingForm({ defaultUsername, avatarUrl, name }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(completeOnboarding, null);
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <AvatarImage
          src={avatarUrl || ""}
          alt={name || "User avatar"}
          initial={initial}
          className="w-20 h-20 border-2 border-zinc-200 dark:border-zinc-800"
          fallbackClassName="w-20 h-20 text-2xl border-2 border-zinc-200 dark:border-zinc-700"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome, {name}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Choose a unique username for your profile and URL.
          </p>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {state.error}
        </div>
      )}

      <Field data-invalid={state?.error ? "true" : undefined}>
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
              defaultValue={defaultUsername}
              placeholder="username"
              className="pl-8"
              disabled={isPending}
              required
            />
          </div>
          <FieldError>{state?.error}</FieldError>
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Completing setup..." : "Finish Setup"}
      </Button>
    </form>
  );
}
