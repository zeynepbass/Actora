import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateCredentials,
  validatePost,
  validateProfileUpdate,
  validateRegistration,
} from "../utils/validation.js";

describe("validateCredentials", () => {
  it("normalizes the e-mail address", () => {
    const { valid, value } = validateCredentials({ email: "  Ada@Example.COM ", parola: "x" });
    assert.equal(valid, true);
    assert.equal(value.email, "ada@example.com");
  });

  it("rejects query operators passed instead of strings", () => {
    const { valid, errors } = validateCredentials({ email: { $gt: "" }, parola: { $gt: "" } });
    assert.equal(valid, false);
    assert.deepEqual(Object.keys(errors).sort(), ["email", "parola"]);
  });
});

describe("validateRegistration", () => {
  const base = { adSoyad: "Ada Yılmaz", email: "ada@example.com", parola: "gizli-parola", rol: "Eğitmen" };

  it("accepts a complete registration", () => {
    assert.equal(validateRegistration(base).valid, true);
  });

  it("requires a known role", () => {
    assert.ok(validateRegistration({ ...base, rol: "admin" }).errors.rol);
    assert.ok(validateRegistration({ ...base, rol: undefined }).errors.rol);
  });

  it("enforces password length limits", () => {
    assert.ok(validateRegistration({ ...base, parola: "kisa" }).errors.parola);
    assert.ok(validateRegistration({ ...base, parola: "a".repeat(73) }).errors.parola);
  });

  it("requires a name", () => {
    assert.ok(validateRegistration({ ...base, adSoyad: " " }).errors.adSoyad);
  });
});

describe("validateProfileUpdate", () => {
  it("returns only the fields that were sent", () => {
    const { valid, value } = validateProfileUpdate({ weight: "72.5" });
    assert.equal(valid, true);
    assert.deepEqual(value, { weight: 72.5 });
  });

  it("ignores fields a client must not set", () => {
    const { value } = validateProfileUpdate({ rol: "Eğitmen", durum: "x", parola: "y", resim: "z" });
    assert.deepEqual(value, {});
  });

  it("clears optional numbers sent as empty strings", () => {
    assert.deepEqual(validateProfileUpdate({ height: "" }).value, { height: null });
  });

  it("allows zero to reset a goal but rejects out-of-range values", () => {
    assert.deepEqual(validateProfileUpdate({ hedefKg: 0, kacGun: 0 }).value, { hedefKg: 0, kacGun: 0 });
    const { errors } = validateProfileUpdate({ hedefKg: 5, kacGun: 1.5, weight: "abc" });
    assert.deepEqual(Object.keys(errors).sort(), ["hedefKg", "kacGun", "weight"]);
  });

  it("rejects an empty name or invalid e-mail when they are sent", () => {
    const { errors } = validateProfileUpdate({ adSoyad: "", email: "not-an-email" });
    assert.ok(errors.adSoyad);
    assert.ok(errors.email);
  });
});

describe("validatePost", () => {
  it("trims text and keeps the step count as a string", () => {
    const { valid, value } = validatePost({ baslik: " Koşu ", aciklama: " 5 km ", kacAdim: "8000" });
    assert.equal(valid, true);
    assert.deepEqual(value, { baslik: "Koşu", aciklama: "5 km", kacAdim: "8000" });
  });

  it("requires a title and description", () => {
    const { errors } = validatePost({ baslik: "", aciklama: "   " });
    assert.ok(errors.baslik);
    assert.ok(errors.aciklama);
  });

  it("rejects invalid step counts", () => {
    assert.ok(validatePost({ baslik: "a", aciklama: "b", kacAdim: "-4" }).errors.kacAdim);
    assert.ok(validatePost({ baslik: "a", aciklama: "b", kacAdim: "çok" }).errors.kacAdim);
  });
});
