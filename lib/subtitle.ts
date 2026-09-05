import { SUBTITLE_MAX_CHARS, SUBTITLE_MAX_WORDS } from "@/lib/constants";

export function countSubtitleWords(text: string) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export function clipSubtitle(text: string) {
  let next = text.length > SUBTITLE_MAX_CHARS ? text.slice(0, SUBTITLE_MAX_CHARS) : text;
  const words = next.trim() ? next.trim().split(/\s+/) : [];
  if (words.length > SUBTITLE_MAX_WORDS) {
    next = words.slice(0, SUBTITLE_MAX_WORDS).join(" ");
  }
  return next;
}
