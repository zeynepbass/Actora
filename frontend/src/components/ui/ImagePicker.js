"use client";

import { useId } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { IMAGE_TYPES } from "@/lib/media";

/** File input styled as a button; the native input stays focusable for keyboard users. */
export default function ImagePicker({ label, fileName, error, onSelect }) {
  const id = useId();

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <input
          id={id}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          onChange={(event) => {
            onSelect(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium transition-colors hover:bg-subtle peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-ink"
        >
          <PhotoIcon aria-hidden="true" className="size-5 text-ink-muted" />
          {label}
        </label>
        {fileName && <span className="min-w-0 truncate text-sm text-ink-muted">{fileName}</span>}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger-ink">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          JPEG, PNG, WebP veya GIF · en fazla 5 MB
        </p>
      )}
    </div>
  );
}
