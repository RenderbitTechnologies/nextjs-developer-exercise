"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteComment } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteComment(commentId);
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting" : "Delete"}
    </Button>
  );
}
