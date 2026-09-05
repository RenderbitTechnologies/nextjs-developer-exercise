import SecurityForm from "@/components/settings/security-form";

export const instant = false;

export default function SecuritySettingsPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">
          Security
        </h2>
        <p className="text-sm text-muted-foreground">
          Change the password you use to sign in to Blogly.
        </p>
      </div>
      <SecurityForm />
    </div>
  );
}
