"use client";

import { useRef } from "react";
import { RiImageAddLine, RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useUploadThing } from "@/lib/uploadthing";

export default function CoverField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("coverImage", {
    onClientUploadComplete: (files) => {
      const url = files[0]?.ufsUrl ?? files[0]?.url;
      if (url) onChange(url);
    },
    onUploadError: (error) => {
      toast.add({
        type: "error",
        title: "Could not upload cover image",
        description: error.message,
      });
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void startUpload([file]);
        }}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-2xl bg-muted aspect-16/9">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover" className="size-full object-cover" />
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? <Spinner data-icon="inline-start" /> : null}
              Change
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label="Remove cover image"
              onClick={() => onChange("")}
            >
              <RiCloseLine />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-16/9 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted/70"
        >
          {isUploading ? (
            <Spinner />
          ) : (
            <RiImageAddLine className="size-8" />
          )}
          {isUploading ? "Uploading cover…" : "Add a cover image"}
        </button>
      )}
    </div>
  );
}
