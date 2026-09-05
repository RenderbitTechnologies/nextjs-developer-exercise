"use client";

import { useActionState, useEffect, useState } from "react";
import { updateAccount, type SettingsFormState } from "@/app/actions/settings";
import ImageDropField from "@/components/image-drop-field";
import { Button } from "@/components/ui/button";
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

export default function AccountForm({
  name,
  username,
  email,
  image,
  headerImage,
}: {
  name: string;
  username: string;
  email: string;
  image: string | null;
  headerImage: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(image ?? "");
  const [headerUrl, setHeaderUrl] = useState(headerImage ?? "");
  const [state, formAction, pending] = useActionState(
    updateAccount,
    {} as SettingsFormState,
  );

  useEffect(() => {
    if (state.success) {
      toast.add({ type: "success", title: state.success });
    }
    if (state.error) {
      toast.add({ type: "error", title: state.error });
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Header image</FieldLabel>
          <ImageDropField
            name="headerImage"
            value={headerUrl}
            onChange={setHeaderUrl}
            endpoint="headerImage"
            label="Header image"
            emptyLabel="Drag and drop a header image, or click to browse"
            variant="banner"
          />
          <FieldDescription>
            Shown at the top of your public profile.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Avatar</FieldLabel>
          <ImageDropField
            name="image"
            value={avatarUrl}
            onChange={setAvatarUrl}
            endpoint="avatarImage"
            label="Avatar"
            emptyLabel="Drop a photo"
            variant="avatar"
          />
          <FieldDescription>
            This appears next to your name on posts and comments.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            autoComplete="name"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            autoComplete="username"
            required
          />
          <FieldDescription>
            blogly.com/<span className="text-foreground">{username}</span>
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            readOnly
          />
          <FieldDescription>Email cannot be changed.</FieldDescription>
        </Field>
        {state.error ? <FieldError>{state.error}</FieldError> : null}
      </FieldGroup>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? <Spinner data-icon="inline-start" /> : null}
        {pending ? "Saving" : "Save changes"}
      </Button>
    </form>
  );
}
