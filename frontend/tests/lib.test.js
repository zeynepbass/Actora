import { describe, expect, it } from "vitest";
import { getErrorMessage, getFieldErrors } from "@/lib/apiClient";
import { formatRelativeDate, getInitials } from "@/lib/format";
import { MAX_IMAGE_BYTES, mediaUrl, validateImageFile } from "@/lib/media";

const API = "https://api.example.com";

describe("mediaUrl", () => {
  it("resolves upload paths and legacy bare file names against the API", () => {
    expect(mediaUrl("/uploads/a.jpg", API)).toBe(`${API}/uploads/a.jpg`);
    expect(mediaUrl("a.jpg", API)).toBe(`${API}/uploads/a.jpg`);
  });

  it("passes through absolute and inline image URLs", () => {
    expect(mediaUrl("https://cdn.example.com/a.png", API)).toBe("https://cdn.example.com/a.png");
    expect(mediaUrl("data:image/png;base64,AAAA", API)).toBe("data:image/png;base64,AAAA");
  });

  it("rejects empty values and unsafe schemes", () => {
    expect(mediaUrl(null, API)).toBeNull();
    expect(mediaUrl("", API)).toBeNull();
    expect(mediaUrl("javascript:alert(1)", API)).toBeNull();
    expect(mediaUrl("data:text/html,<script>", API)).toBeNull();
  });
});

describe("validateImageFile", () => {
  it("accepts supported images within the size limit", () => {
    expect(validateImageFile({ type: "image/png", size: 1024 })).toBeNull();
  });

  it("explains why a file is rejected", () => {
    expect(validateImageFile(null)).toMatch(/seçin/);
    expect(validateImageFile({ type: "image/svg+xml", size: 10 })).toMatch(/JPEG/);
    expect(validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES + 1 })).toMatch(/5 MB/);
  });
});

describe("getErrorMessage", () => {
  it("prefers the message sent by the API", () => {
    const error = { response: { data: { message: "Bu e-posta zaten kayıtlı" } } };
    expect(getErrorMessage(error, "fallback")).toBe("Bu e-posta zaten kayıtlı");
  });

  it("describes network failures", () => {
    expect(getErrorMessage({ request: {} })).toMatch(/Sunucuya ulaşılamıyor/);
  });

  it("falls back for unknown errors", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });

  it("exposes field errors when present", () => {
    expect(getFieldErrors({ response: { data: { fields: { email: "x" } } } })).toEqual({ email: "x" });
    expect(getFieldErrors(undefined)).toEqual({});
  });
});

describe("format helpers", () => {
  it("builds initials with Turkish casing", () => {
    expect(getInitials("ışıl irmak")).toBe("Iİ");
    expect(getInitials("Ada")).toBe("A");
    expect(getInitials("  ")).toBe("?");
  });

  it("formats recent dates relatively", () => {
    const now = new Date("2026-03-10T12:00:00Z");
    expect(formatRelativeDate("2026-03-10T11:59:40Z", now)).toBe("az önce");
    expect(formatRelativeDate("2026-03-10T09:00:00Z", now)).toBe("3 saat önce");
    expect(formatRelativeDate("2026-03-08T12:00:00Z", now)).toBe("2 gün önce");
    expect(formatRelativeDate("invalid", now)).toBe("");
  });
});
