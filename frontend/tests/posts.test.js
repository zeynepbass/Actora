import { describe, expect, it } from "vitest";
import { sortPinned, togglePinned } from "@/features/posts/pins";
import { filterPosts } from "@/features/posts/search";

const posts = [
  { _id: "a", baslik: "Sabah koşusu", aciklama: "5 km", rol: "Eğitmen", yazar: { adSoyad: "Ada Işık" } },
  { _id: "b", baslik: "Protein tarifi", aciklama: "Yulaf ve süt", rol: "Eğitici", yazar: { adSoyad: "Can Öz" } },
  { _id: "c", baslik: "Esneme", aciklama: "Koşu sonrası", rol: "Eğitmen", yazar: { adSoyad: "Elif Su" } },
];
const ids = (list) => list.map((post) => post._id);

describe("filterPosts", () => {
  it("returns everything without filters", () => {
    expect(filterPosts(posts)).toHaveLength(3);
  });

  it("filters by role", () => {
    expect(ids(filterPosts(posts, { role: "Eğitici" }))).toEqual(["b"]);
  });

  it("matches title, description and author", () => {
    expect(ids(filterPosts(posts, { query: "koşu" }))).toEqual(["a", "c"]);
    expect(ids(filterPosts(posts, { query: "can" }))).toEqual(["b"]);
  });

  it("uses Turkish casing rules", () => {
    expect(ids(filterPosts(posts, { query: "IŞIK" }))).toEqual(["a"]);
  });

  it("combines role and text and ignores surrounding whitespace", () => {
    expect(ids(filterPosts(posts, { query: "  koşu ", role: "Eğitmen" }))).toEqual(["a", "c"]);
    expect(filterPosts(posts, { query: "koşu", role: "Eğitici" })).toEqual([]);
  });
});

describe("pinned posts", () => {
  it("adds new pins to the front and removes existing ones", () => {
    expect(togglePinned(["a"], "c")).toEqual(["c", "a"]);
    expect(togglePinned(["c", "a"], "a")).toEqual(["c"]);
  });

  it("orders pinned posts first and keeps the rest in feed order", () => {
    expect(ids(sortPinned(posts, ["c", "b"]))).toEqual(["c", "b", "a"]);
  });

  it("ignores pins for posts that no longer exist", () => {
    expect(ids(sortPinned(posts, ["deleted"]))).toEqual(["a", "b", "c"]);
  });
});
