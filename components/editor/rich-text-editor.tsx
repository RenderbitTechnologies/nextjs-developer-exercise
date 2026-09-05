"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  RiBold,
  RiItalic,
  RiUnderline,
  RiH2,
  RiDoubleQuotesL,
  RiListUnordered,
  RiImageLine,
  RiLink,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default function RichTextEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("postImage", {
    onClientUploadComplete: (files) => {
      const url = files[0]?.ufsUrl ?? files[0]?.url;
      if (!url) return;
      editor?.chain().focus().setImage({ src: url }).run();
    },
    onUploadError: (error) => {
      toast.add({
        type: "error",
        title: "Could not upload image",
        description: error.message,
      });
    },
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-2xl" },
      }),
      Placeholder.configure({
        placeholder: "Tell your story…",
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "tiptap typeset typeset-docs min-h-80 outline-none",
      },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter(
          (file) => file.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        void startUpload(files.slice(0, 1));
        return true;
      },
      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter(
          (file) => file.type.startsWith("image/"),
        );
        if (files.length === 0) return false;
        event.preventDefault();
        void startUpload(files.slice(0, 1));
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  function addLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", previous ?? "https://");
    if (href === null) return;
    const next = href.trim();
    if (next === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run();
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void startUpload([file]);
        }}
      />
      <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-muted/50 p-1">
        <ToolbarButton
          label="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <RiBold />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <RiItalic />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <RiUnderline />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <RiH2 />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <RiDoubleQuotesL />
        </ToolbarButton>
        <ToolbarButton
          label="List"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <RiListUnordered />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor?.isActive("link")} onClick={addLink}>
          <RiLink />
        </ToolbarButton>
        <ToolbarButton
          label="Insert image"
          onClick={() => imageInputRef.current?.click()}
        >
          {isUploading ? <Spinner /> : <RiImageLine />}
        </ToolbarButton>
      </div>
      {editor ? (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-1 rounded-2xl border bg-popover p-1 shadow-md"
        >
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <RiBold />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <RiItalic />
          </ToolbarButton>
          <ToolbarButton
            label="Heading"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <RiH2 />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <RiDoubleQuotesL />
          </ToolbarButton>
          <ToolbarButton
            label="Link"
            active={editor.isActive("link")}
            onClick={addLink}
          >
            <RiLink />
          </ToolbarButton>
        </BubbleMenu>
      ) : null}
      <EditorContent
        editor={editor}
        className={cn("rounded-2xl px-1 py-2", isUploading && "opacity-70")}
      />
    </div>
  );
}
