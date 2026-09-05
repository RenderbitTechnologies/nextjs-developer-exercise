"use client";

import { useActionState, useEffect, useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { updatePassword, type SettingsFormState } from "@/app/actions/settings";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  show,
  onToggle,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={onToggle}
          >
            {show ? <RiEyeOffLine /> : <RiEyeLine />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

export default function SecurityForm() {
  const [show, setShow] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [state, formAction, pending] = useActionState(
    updatePassword,
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
      <input
        type="hidden"
        name="revokeOtherSessions"
        value={revokeOtherSessions ? "on" : "off"}
      />
      <FieldGroup>
        <PasswordField
          id="currentPassword"
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          show={show}
          onToggle={() => setShow((value) => !value)}
        />
        <PasswordField
          id="newPassword"
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          show={show}
          onToggle={() => setShow((value) => !value)}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          show={show}
          onToggle={() => setShow((value) => !value)}
        />
        <FieldDescription>
          At least 8 characters, with one special character.
        </FieldDescription>
        <Field orientation="horizontal">
          <Checkbox
            id="revokeOtherSessions"
            checked={revokeOtherSessions}
            onCheckedChange={(checked) =>
              setRevokeOtherSessions(checked === true)
            }
          />
          <FieldLabel htmlFor="revokeOtherSessions" className="font-normal">
            Sign out of other devices
          </FieldLabel>
        </Field>
        {state.error ? <FieldError>{state.error}</FieldError> : null}
      </FieldGroup>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? <Spinner data-icon="inline-start" /> : null}
        {pending ? "Updating" : "Update password"}
      </Button>
    </form>
  );
}
