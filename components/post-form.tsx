"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { PostFormState } from "@/app/actions/posts";
import CoverField from "@/components/editor/cover-field";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SUBTITLE_MAX_CHARS } from "@/lib/constants";
import { editorHtmlFromStored } from "@/lib/html";
import { clipSubtitle } from "@/lib/subtitle";

type PostFormValues = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  hashTags?: string[];
  status?: "draft" | "published" | "archived";
};

export default function PostForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: PostFormState, formData: FormData) => Promise<PostFormState>;
  defaults?: PostFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as PostFormState,
  );
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [excerpt, setExcerpt] = useState(clipSubtitle(defaults?.excerpt ?? ""));
  const [coverImage, setCoverImage] = useState(defaults?.coverImage ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(
    editorHtmlFromStored(defaults?.content ?? ""),
  );
  const [intent, setIntent] = useState<"draft" | "published" | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const statusIntent = useRef(defaults?.status ?? "draft");

  function resizeField(element: HTMLTextAreaElement | null) {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }

  useEffect(() => {
    resizeField(titleRef.current);
    resizeField(excerptRef.current);
  }, [title, excerpt]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formData.set("status", statusIntent.current);
        formAction(formData);
      }}
      className="flex flex-col gap-8"
    >
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="excerpt" value={excerpt} />
      <input type="hidden" name="coverImage" value={coverImage} />
      <input type="hidden" name="content" value={content} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails((value) => !value)}
        >
          {showDetails ? "Hide details" : "Slug and tags"}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              statusIntent.current = "draft";
              setIntent("draft");
              formRef.current?.requestSubmit();
            }}
          >
            {pending && intent === "draft" ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Save draft
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              statusIntent.current = "published";
              setIntent("published");
              formRef.current?.requestSubmit();
            }}
          >
            {pending && intent === "published" ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {defaults?.status === "published" ? submitLabel : "Publish"}
          </Button>
        </div>
      </div>

      {showDetails ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-4">
          <Input
            id="slug"
            name="slug"
            defaultValue={defaults?.slug}
            placeholder="URL slug (optional)"
          />
          <Input
            id="hashTags"
            name="hashTags"
            defaultValue={defaults?.hashTags?.join(" ")}
            placeholder="#essays #writing"
          />
        </div>
      ) : (
        <input
          type="hidden"
          name="hashTags"
          defaultValue={defaults?.hashTags?.join(" ") ?? ""}
        />
      )}

      <CoverField value={coverImage} onChange={setCoverImage} />

      <textarea
        ref={titleRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        rows={1}
        required
        placeholder="Title"
        className="w-full resize-none overflow-hidden bg-transparent font-heading text-4xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/60 sm:text-5xl"
      />
      <div className="flex flex-col gap-1">
        <textarea
          ref={excerptRef}
          value={excerpt}
          onChange={(event) => setExcerpt(clipSubtitle(event.target.value))}
          rows={1}
          maxLength={SUBTITLE_MAX_CHARS}
          placeholder="A short subtitle that appears in previews"
          className="w-full resize-none overflow-hidden bg-transparent text-xl text-muted-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">
          {excerpt.length}/{SUBTITLE_MAX_CHARS}
        </p>
      </div>

      <RichTextEditor initialHtml={content} onChange={setContent} />

      {state.error ? <FieldError>{state.error}</FieldError> : null}
    </form>
  );
}
