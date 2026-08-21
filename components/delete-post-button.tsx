"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePostAction } from "@/actions/post";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deletePostAction(postId);
        if (result.success) {
          toast.success("Story deleted successfully.");
          setOpen(false);
          router.refresh();
        } else {
          const errMsg = result.error || "Failed to delete post.";
          setError(errMsg);
          toast.error(errMsg);
        }
      } catch (err) {
        console.error(err);
        const errMsg = "An unexpected error occurred.";
        setError(errMsg);
        toast.error(errMsg);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the post <strong>&ldquo;{postTitle}&rdquo;</strong> and all of its associated comments. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive mt-2">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent closing automatically before transition completes
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending ? "Deleting..." : "Delete Post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
