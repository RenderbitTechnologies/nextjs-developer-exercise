import {
  isHtmlContent,
  sanitizePostHtml,
} from "@/lib/html";

export default function PostBody({ content }: { content: string }) {
  if (isHtmlContent(content)) {
    return (
      <div
        className="typeset typeset-docs"
        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(content) }}
      />
    );
  }

  return (
    <div className="whitespace-pre-wrap text-base leading-relaxed">
      {content}
    </div>
  );
}
