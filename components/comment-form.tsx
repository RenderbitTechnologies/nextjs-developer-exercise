"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createComment, type CommentFormState } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function CommentForm({
  postId,
  returnTo,
  signedIn,
}: {
  postId: string;
  returnTo: string;
  signedIn: boolean;
}) {
  const action = createComment.bind(null, postId, returnTo);
  const [state, formAction, pending] = useActionState(
    action,
    {} as CommentFormState,
  );

  if (!signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href={`/signin?next=${encodeURIComponent(returnTo)}`} className="underline">
          Sign in
        </Link>{" "}
        to leave a comment.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field data-invalid={state.error ? true : undefined}>
        <FieldLabel htmlFor="content">Add a comment</FieldLabel>
        <Textarea
          id="content"
          name="content"
          rows={4}
          required
          placeholder="Write a short note for the author."
          aria-invalid={state.error ? true : undefined}
        />
        {state.error ? <FieldError>{state.error}</FieldError> : null}
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Posting" : "Post comment"}
      </Button>
    </form>
  );
}
