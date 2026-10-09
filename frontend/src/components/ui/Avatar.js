/* eslint-disable @next/next/no-img-element -- avatars may be inline data URLs, which next/image cannot optimize */
import { API_URL } from "@/lib/apiClient";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

const SIZES = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-20 text-2xl",
};

/** `src` may be a stored image reference or an already resolved blob/data URL. */
export default function Avatar({ name, src, size = "md", className }) {
  const url = src?.startsWith("blob:") ? src : mediaUrl(src, API_URL);
  const shape = cn("shrink-0 rounded-full", SIZES[size], className);

  if (url) {
    return <img src={url} alt="" className={cn(shape, "bg-subtle object-cover")} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        shape,
        "inline-flex items-center justify-center bg-brand-soft font-semibold text-brand-ink"
      )}
    >
      {getInitials(name)}
    </span>
  );
}
