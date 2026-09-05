import { parseDocument, DomUtils } from "htmlparser2";
import type { AnyNode, Element } from "domhandler";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "a",
  "h2",
  "h3",
  "blockquote",
  "ul",
  "ol",
  "li",
  "img",
  "code",
  "pre",
  "hr",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt"]),
};

function isElement(node: AnyNode): node is Element {
  return node.type === "tag";
}

function isSafeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return true;
  }
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }
  return (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    trimmed.startsWith("//")
  );
}

function sanitizeAttribs(tag: string, attribs: Record<string, string>) {
  const allowed = ALLOWED_ATTRS[tag];
  const next: Record<string, string> = {};
  if (!allowed) return next;

  for (const [name, value] of Object.entries(attribs)) {
    const attr = name.toLowerCase();
    if (!allowed.has(attr)) continue;
    if ((attr === "href" || attr === "src") && !isSafeUrl(value)) continue;
    next[attr] = value;
  }

  if (tag === "a") {
    next.target = "_blank";
    next.rel = "noopener noreferrer";
  }

  return next;
}

function sanitizeNodes(nodes: AnyNode[]): AnyNode[] {
  const out: AnyNode[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      out.push(node);
      continue;
    }
    if (!isElement(node)) continue;

    const tag = node.tagName.toLowerCase();
    const children = sanitizeNodes(node.children);

    if (!ALLOWED_TAGS.has(tag)) {
      out.push(...children);
      continue;
    }

    node.attribs = sanitizeAttribs(tag, node.attribs ?? {});
    node.children = children;
    for (const child of children) {
      child.parent = node;
    }
    out.push(node);
  }

  return out;
}

export function isHtmlContent(content: string) {
  return /<(p|h[1-6]|img|blockquote|ul|ol|pre|strong|em)\b/i.test(content);
}

export function plainTextFromHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizePostHtml(html: string) {
  const document = parseDocument(html, {
    decodeEntities: true,
  });
  const children = sanitizeNodes(document.children);
  return children.map((node) => DomUtils.getOuterHTML(node)).join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlFromPlainText(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function editorHtmlFromStored(content: string) {
  if (!content) return "";
  if (isHtmlContent(content)) return content;
  return htmlFromPlainText(content);
}
