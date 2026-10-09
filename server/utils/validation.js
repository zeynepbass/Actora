export const ROLES = ["Eğitmen", "Eğitici"];
export const FROZEN_STATUS = "dondurulmuştur";
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isBlank = (value) => value === undefined || value === null || value === "";
const asText = (value) => (typeof value === "string" ? value.trim() : "");

export const normalizeEmail = (value) => asText(value).toLowerCase();

function result(value, errors) {
  return { value, errors, valid: Object.keys(errors).length === 0 };
}

function readNumber(raw, { min, max, integer = false, allowZero = false }) {
  const number = typeof raw === "number" ? raw : Number(asText(raw));
  if (!Number.isFinite(number)) return { error: "Geçerli bir sayı girin" };
  if (integer && !Number.isInteger(number)) return { error: "Tam sayı girin" };
  if (allowZero && number === 0) return { number };
  if (number < min || number > max) return { error: `${min} ile ${max} arasında olmalı` };
  return { number };
}

export function validateCredentials(body = {}) {
  const errors = {};
  const email = normalizeEmail(body.email);
  if (!EMAIL_PATTERN.test(email)) errors.email = "Geçerli bir e-posta girin";
  if (typeof body.parola !== "string" || body.parola.length === 0) {
    errors.parola = "Parola gerekli";
  }
  return result({ email, parola: body.parola }, errors);
}

export function validateRegistration(body = {}) {
  const { value, errors } = validateCredentials(body);
  const adSoyad = asText(body.adSoyad);

  if (adSoyad.length < 2 || adSoyad.length > 80) {
    errors.adSoyad = "Ad soyad 2-80 karakter olmalı";
  }
  if (!errors.parola && value.parola.length < MIN_PASSWORD_LENGTH) {
    errors.parola = `Parola en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
  }
  // bcrypt only hashes the first 72 bytes; reject longer input instead of truncating silently.
  if (!errors.parola && Buffer.byteLength(value.parola) > 72) {
    errors.parola = "Parola çok uzun";
  }
  if (!ROLES.includes(body.rol)) errors.rol = "Geçerli bir rol seçin";

  return result({ ...value, adSoyad, rol: body.rol }, errors);
}

const PROFILE_NUMBERS = {
  weight: { min: 20, max: 400 },
  height: { min: 50, max: 260 },
  hedefKg: { min: 20, max: 400, allowZero: true },
  kacGun: { min: 1, max: 3650, integer: true, allowZero: true },
};
const PROFILE_TEXTS = { kullaniciAdi: 40, deneyim: 1000 };

// Only fields present in the body are validated and returned, so a partial
// update never clears data the client did not send.
export function validateProfileUpdate(body = {}) {
  const errors = {};
  const value = {};

  if (body.adSoyad !== undefined) {
    const adSoyad = asText(body.adSoyad);
    if (adSoyad.length < 2 || adSoyad.length > 80) {
      errors.adSoyad = "Ad soyad 2-80 karakter olmalı";
    } else {
      value.adSoyad = adSoyad;
    }
  }

  if (body.email !== undefined) {
    const email = normalizeEmail(body.email);
    if (!EMAIL_PATTERN.test(email)) errors.email = "Geçerli bir e-posta girin";
    else value.email = email;
  }

  for (const [field, maxLength] of Object.entries(PROFILE_TEXTS)) {
    if (body[field] === undefined) continue;
    const text = asText(body[field]);
    if (text.length > maxLength) errors[field] = `En fazla ${maxLength} karakter olabilir`;
    else value[field] = text;
  }

  for (const [field, rules] of Object.entries(PROFILE_NUMBERS)) {
    if (body[field] === undefined) continue;
    if (isBlank(body[field])) {
      value[field] = null;
      continue;
    }
    const { number, error } = readNumber(body[field], rules);
    if (error) errors[field] = error;
    else value[field] = number;
  }

  return result(value, errors);
}

export function validatePost(body = {}) {
  const errors = {};
  const baslik = asText(body.baslik);
  const aciklama = asText(body.aciklama);
  const value = { baslik, aciklama, kacAdim: null };

  if (baslik.length === 0 || baslik.length > 120) errors.baslik = "Başlık 1-120 karakter olmalı";
  if (aciklama.length === 0 || aciklama.length > 2000) {
    errors.aciklama = "Açıklama 1-2000 karakter olmalı";
  }
  if (!isBlank(body.kacAdim)) {
    const { number, error } = readNumber(body.kacAdim, { min: 0, max: 200000, integer: true });
    if (error) errors.kacAdim = error;
    else value.kacAdim = String(number);
  }

  return result(value, errors);
}
