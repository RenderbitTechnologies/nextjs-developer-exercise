"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePost } from "@/app/actions/posts";
import { Button } from "@/components/ui/button";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        startTransition(async () => {
          await deletePost(postId);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting" : "Delete"}
    </Button>
  );
}
