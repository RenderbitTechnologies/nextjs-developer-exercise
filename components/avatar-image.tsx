"use client";

import { useState } from "react";

interface AvatarImageProps {
  src: string;
  alt: string;
  initial: string;
  className?: string;
  fallbackClassName?: string;
}

export function AvatarImage({
  src,
  alt,
  initial,
  className = "h-7 w-7",
  fallbackClassName,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400 ${
          fallbackClassName || className
        }`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`rounded-full object-cover border border-zinc-200 dark:border-zinc-800 ${className}`}
    />
  );
}
