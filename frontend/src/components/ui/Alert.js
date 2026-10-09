import { cn } from "@/lib/cn";

const TONES = {
  error: "bg-danger-soft text-danger-ink",
  success: "bg-success-soft text-success-ink",
};

export default function Alert({ tone = "error", className, children }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg px-3 py-2.5 text-sm", TONES[tone], className)}
    >
      {children}
    </p>
  );
}
