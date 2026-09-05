"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

export function SignInForm({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setPending(true);
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: nextPath,
    });
    setPending(false);

    if (signInError) {
      setError(signInError.message ?? "Could not sign in.");
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: signInError.message ?? "Check your email and password.",
      });
      return;
    }

    toast.add({ type: "success", title: "Welcome back." });
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex w-sm flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use your Blogly email and password to continue writing.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-invalid={error ? true : undefined}
              />
            </Field>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  aria-invalid={error ? true : undefined}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <FieldLabel htmlFor="rememberMe" className="font-normal">
                Remember me
              </FieldLabel>
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={pending} size="lg">
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Signing in" : "Sign in"}
          </Button>
        </form>
        <FieldDescription>
          New here? <Link href="/signup">Create an account</Link>
        </FieldDescription>
      </div>
    </div>
  );
}
