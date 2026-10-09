import { cn } from "@/lib/cn";

export default function Logo({ className, inverted = false }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-lg font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0">
        <rect width="32" height="32" rx="8" className={inverted ? "fill-white" : "fill-brand"} />
        <path
          d="M9 23 16 8l7 15M12 18h8"
          fill="none"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={inverted ? "stroke-[#8a1538]" : "stroke-white"}
        />
      </svg>
      Actora
    </span>
  );
}
