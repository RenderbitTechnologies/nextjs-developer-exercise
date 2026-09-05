"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAccount,
  setAccountDisabled,
  type SettingsFormState,
} from "@/app/actions/settings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

export default function ManageAccount({
  username,
  disabled,
}: {
  username: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pendingDisable, startDisable] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [state, formAction, pendingDelete] = useActionState(
    deleteAccount,
    {} as SettingsFormState,
  );

  useEffect(() => {
    if (state.error) {
      toast.add({ type: "error", title: state.error });
    }
  }, [state]);

  function onToggleDisabled() {
    startDisable(async () => {
      try {
        await setAccountDisabled(!disabled);
        router.refresh();
        toast.add({
          type: "success",
          title: disabled ? "Account enabled." : "Account disabled.",
        });
      } catch {
        toast.add({
          type: "error",
          title: "Could not update your account.",
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{disabled ? "Enable account" : "Disable account"}</CardTitle>
          <CardDescription>
            {disabled
              ? "Your profile and posts are hidden. Enable the account to make them public again."
              : "Hide your profile and posts without deleting anything. You can enable the account later."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            type="button"
            variant={disabled ? "default" : "outline"}
            disabled={pendingDisable}
            onClick={onToggleDisabled}
          >
            {pendingDisable ? <Spinner data-icon="inline-start" /> : null}
            {pendingDisable
              ? "Updating"
              : disabled
                ? "Enable account"
                : "Disable account"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently delete your Blogly account, posts, comments, and likes.
            This cannot be undone.
          </CardDescription>
        </CardHeader>
        {state.error ? (
          <CardContent>
            <FieldError>{state.error}</FieldError>
          </CardContent>
        ) : null}
        <CardFooter>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger
              render={<Button variant="destructive" />}
            >
              Delete account
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes @{username} and every post attached to it. Type
                  your username and password to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form action={formAction} className="flex flex-col gap-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="confirmation">Username</FieldLabel>
                    <Input
                      id="confirmation"
                      name="confirmation"
                      autoComplete="off"
                      required
                    />
                    <FieldDescription>
                      Type <span className="text-foreground">{username}</span>{" "}
                      to confirm.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </Field>
                </FieldGroup>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    type="submit"
                    variant="destructive"
                    disabled={pendingDelete}
                  >
                    {pendingDelete ? <Spinner data-icon="inline-start" /> : null}
                    {pendingDelete ? "Deleting" : "Delete account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
