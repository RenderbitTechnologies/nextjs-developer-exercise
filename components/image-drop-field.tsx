"use client";

import { RiCloseLine, RiImageAddLine } from "@remixicon/react";
import { useDropzone } from "@uploadthing/react";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export default function ImageDropField({
  name,
  value,
  onChange,
  endpoint,
  label,
  emptyLabel,
  variant = "banner",
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  endpoint: keyof OurFileRouter;
  label: string;
  emptyLabel: string;
  variant?: "banner" | "avatar";
}) {
  const { startUpload, isUploading, routeConfig } = useUploadThing(endpoint, {
    onClientUploadComplete: (files) => {
      const url = files[0]?.ufsUrl ?? files[0]?.url;
      if (url) onChange(url);
    },
    onUploadError: (error) => {
      toast.add({
        type: "error",
        title: `Could not upload ${label.toLowerCase()}`,
        description: error.message,
      });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    disabled: isUploading,
    onDrop: (files) => {
      if (files[0]) void startUpload(files);
    },
    accept: (() => {
      const fileTypes = generatePermittedFileTypes(routeConfig).fileTypes;
      return fileTypes.length > 0
        ? generateClientDropzoneAccept(fileTypes)
        : { "image/*": [] };
    })(),
  });

  const isAvatar = variant === "avatar";

  return (
    <div className={cn("flex flex-col gap-2", isAvatar && "items-center")}>
      <input type="hidden" name={name} value={value} />
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed bg-muted/40 text-sm text-muted-foreground transition-colors",
          isAvatar ? "size-28 rounded-full" : "aspect-16/7 w-full rounded-2xl",
          isDragActive && "border-foreground bg-muted/70",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        <input {...getInputProps()} />
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="size-full object-cover"
            />
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Spinner />
              </div>
            ) : isAvatar ? null : (
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                aria-label={`Remove ${label.toLowerCase()}`}
                className="absolute top-2 right-2"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }}
              >
                <RiCloseLine />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 px-3 text-center">
            {isUploading ? (
              <Spinner />
            ) : (
              <RiImageAddLine className={isAvatar ? "size-6" : "size-8"} />
            )}
            {isAvatar ? null : (
              <span>
                {isUploading
                  ? "Uploading…"
                  : isDragActive
                    ? "Drop image to upload"
                    : emptyLabel}
              </span>
            )}
          </div>
        )}
      </div>
      {value && isAvatar && !isUploading ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange("")}
        >
          <RiCloseLine data-icon="inline-start" />
          Remove
        </Button>
      ) : null}
    </div>
  );
}
