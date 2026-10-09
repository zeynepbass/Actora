const DAY = 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const relativeFormatter = new Intl.RelativeTimeFormat("tr-TR", { numeric: "always" });
const numberFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

export const formatNumber = (value) => numberFormatter.format(value);

export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

/** "3 gün önce" for recent dates, a full date once it is more than a week old. */
export function formatRelativeDate(value, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const elapsed = now - date;
  if (elapsed < 60 * 1000) return "az önce";
  if (elapsed < 60 * 60 * 1000) return relativeFormatter.format(-Math.floor(elapsed / 60000), "minute");
  if (elapsed < DAY) return relativeFormatter.format(-Math.floor(elapsed / 3600000), "hour");
  if (elapsed < 7 * DAY) return relativeFormatter.format(-Math.floor(elapsed / DAY), "day");
  return formatDate(date);
}

export function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length === 1 ? [parts[0][0]] : [parts[0][0], parts[parts.length - 1][0]];
  return letters.join("").toLocaleUpperCase("tr");
}
