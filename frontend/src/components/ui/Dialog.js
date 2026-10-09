"use client";

import { useEffect, useId, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

const SIZES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-3xl" };

/**
 * Modal built on the native <dialog>, which provides the focus trap, Escape
 * handling and inert background.
 */
export default function Dialog({ open, onClose, title, description, size = "md", children }) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Escape is routed through the owner so it can refuse to close, e.g. while saving.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-ink shadow-overlay backdrop:bg-black/60 open:animate-fade-up",
        SIZES[size]
      )}
    >
      {open && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
