import DeleteCommentButton from "@/components/delete-comment-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPostDate, initialsFromName } from "@/lib/format";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorImage: string | null;
};

export default function CommentList({
  comments,
  postAuthorId,
  currentUserId,
}: {
  comments: Comment[];
  postAuthorId: string;
  currentUserId?: string;
}) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No comments yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {comments.map((comment) => {
        const canDelete =
          currentUserId === comment.authorId ||
          currentUserId === postAuthorId;

        return (
          <li key={comment.id} className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  {comment.authorImage ? (
                    <AvatarImage
                      src={comment.authorImage}
                      alt={comment.authorName}
                    />
                  ) : null}
                  <AvatarFallback>
                    {initialsFromName(comment.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    @{comment.authorUsername} · {formatPostDate(comment.createdAt)}
                  </span>
                </div>
              </div>
              {canDelete ? <DeleteCommentButton commentId={comment.id} /> : null}
            </div>
            <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
          </li>
        );
      })}
    </ol>
  );
}
