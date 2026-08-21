export function canDeleteComment(
  currentUserId: string | undefined | null,
  commentAuthorId: string,
  postAuthorId: string
): boolean {
  if (!currentUserId) return false;
  return currentUserId === commentAuthorId || currentUserId === postAuthorId;
}
