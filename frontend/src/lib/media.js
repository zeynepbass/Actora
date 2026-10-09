export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Resolves a stored image reference to a URL the browser can load, or null. */
export function mediaUrl(value, apiUrl) {
  if (typeof value !== "string" || value === "") return null;
  if (value.startsWith("data:image/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes(":")) return null;
  if (value.startsWith("/uploads/")) return `${apiUrl}${value}`;
  // Older records stored only the file name.
  return `${apiUrl}/uploads/${value.replace(/^\/+/, "")}`;
}

/** Returns a user-facing message when the file cannot be uploaded, otherwise null. */
export function validateImageFile(file) {
  if (!file) return "Lütfen bir görsel seçin";
  if (!IMAGE_TYPES.includes(file.type)) return "JPEG, PNG, WebP veya GIF bir görsel seçin";
  if (file.size > MAX_IMAGE_BYTES) return "Görsel en fazla 5 MB olabilir";
  return null;
}
