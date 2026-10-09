"use client";

import { useId } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/cn";

function FieldShell({ id, label, hint, error, className, children }) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function useFieldProps({ id, hint, error }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return {
    id: fieldId,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined,
  };
}

export function InputField({ label, hint, error, className, id, ...props }) {
  const field = useFieldProps({ id, hint, error });
  return (
    <FieldShell id={field.id} label={label} hint={hint} error={error} className={className}>
      <input className="field-control" {...field} {...props} />
    </FieldShell>
  );
}

export function TextareaField({ label, hint, error, className, id, rows = 4, ...props }) {
  const field = useFieldProps({ id, hint, error });
  return (
    <FieldShell id={field.id} label={label} hint={hint} error={error} className={className}>
      <textarea className="field-control resize-y" rows={rows} {...field} {...props} />
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, className, id, options, ...props }) {
  const field = useFieldProps({ id, hint, error });
  return (
    <FieldShell id={field.id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <select className="field-control appearance-none pr-10" {...field} {...props}>
          {options.map(({ value, label: optionLabel }) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </FieldShell>
  );
}
