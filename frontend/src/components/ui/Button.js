import Link from "next/link";
import { cn } from "@/lib/cn";
import Spinner from "./Spinner";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-subtle",
  ghost: "text-ink-muted hover:bg-subtle hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
  dangerOutline: "border border-danger-ink bg-surface text-danger-ink hover:bg-danger-soft",
};

const SIZES = {
  sm: "min-h-9 gap-1.5 px-3 text-sm",
  md: "min-h-11 gap-2 px-4 text-sm",
  icon: "size-11",
};

const BASE =
  "inline-flex select-none items-center justify-center rounded-lg font-medium transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

export const buttonClass = ({ variant = "primary", size = "md", fullWidth, className } = {}) =>
  cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);

export default function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, fullWidth, className, ...props }) {
  return <Link className={buttonClass({ variant, size, fullWidth, className })} {...props} />;
}
