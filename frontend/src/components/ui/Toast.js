"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/cn";

const ToastContext = createContext(null);
const DISMISS_AFTER_MS = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, type, message }]);
      window.setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map(({ id, type, message }) => {
          const Icon = type === "error" ? ExclamationCircleIcon : CheckCircleIcon;
          return (
            <div
              key={id}
              role={type === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border border-line bg-surface p-3 shadow-overlay"
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  type === "error" ? "text-danger-ink" : "text-success-ink"
                )}
              />
              <p className="min-w-0 flex-1 break-words text-sm">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Bildirimi kapat"
                className="-m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-subtle hover:text-ink"
              >
                <XMarkIcon aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
