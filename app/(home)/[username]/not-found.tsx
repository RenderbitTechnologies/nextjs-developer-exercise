import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UsernameNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        No writer with that name
      </h1>
      <p className="text-muted-foreground">
        That username is not on Blogly yet.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Back to the homepage
      </Button>
    </div>
  );
}
