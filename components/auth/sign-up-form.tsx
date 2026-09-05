"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
import { reservedUsernameSet } from "@/lib/constants";

const SPECIAL_CHAR = /[^A-Za-z0-9]/;
const USERNAME = /^[a-zA-Z0-9_]{3,24}$/;

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(values: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    const next: Record<string, string> = {};
    if (values.name.length < 2)
      next.name = "Name must be at least 2 characters.";
    if (!USERNAME.test(values.username)) {
      next.username = "Use 3–24 letters, numbers, or underscores.";
    } else if (reservedUsernameSet.has(values.username.toLowerCase())) {
      next.username = "That username is reserved.";
    }
    if (!values.email.includes("@")) next.email = "Enter a valid email.";
    if (values.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    } else if (!SPECIAL_CHAR.test(values.password)) {
      next.password = "Include at least one special character.";
    }
    if (values.password !== values.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      name: String(form.get("name") ?? "").trim(),
      username: String(form.get("username") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    };

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      username: values.username.toLowerCase(),
      callbackURL: "/",
    });
    setPending(false);

    if (error) {
      setErrors({ form: error.message ?? "Could not create your account." });
      toast.add({
        type: "error",
        title: "Sign up failed",
        description: error.message ?? "Try a different email or username.",
      });
      return;
    }

    toast.add({ type: "success", title: "Account created." });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-svh w-full flex items-center justify-center">
      <div className="flex w-sm flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a username. It becomes your public blog address.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Mira Chen"
                required
                aria-invalid={errors.name ? true : undefined}
              />
              {errors.name ? <FieldError>{errors.name}</FieldError> : null}
            </Field>
            <Field data-invalid={errors.username ? true : undefined}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="mira"
                required
                aria-invalid={errors.username ? true : undefined}
              />
              <FieldDescription>
                blogly.com/<span className="text-foreground">username</span>
              </FieldDescription>
              {errors.username ? (
                <FieldError>{errors.username}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-invalid={errors.email ? true : undefined}
              />
              {errors.email ? <FieldError>{errors.email}</FieldError> : null}
            </Field>
            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  aria-invalid={errors.password ? true : undefined}
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
              <FieldDescription>
                At least 8 characters, with one special character.
              </FieldDescription>
              {errors.password ? (
                <FieldError>{errors.password}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                aria-invalid={errors.confirmPassword ? true : undefined}
              />
              {errors.confirmPassword ? (
                <FieldError>{errors.confirmPassword}</FieldError>
              ) : null}
            </Field>
            {errors.form ? <FieldError>{errors.form}</FieldError> : null}
          </FieldGroup>
          <Button type="submit" className="w-full" disabled={pending} size="lg">
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Creating account" : "Create account"}
          </Button>
        </form>
        <FieldDescription>
          Already writing here? <Link href="/signin">Sign in</Link>
        </FieldDescription>
      </div>
    </div>
  );
}
