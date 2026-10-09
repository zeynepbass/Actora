import dotenv from "dotenv";

dotenv.config();

const MIN_SECRET_LENGTH = 32;

export function loadEnv(source = process.env) {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !source[key]);
  if (missing.length > 0) {
    throw new Error(
      `Eksik ortam değişkenleri: ${missing.join(", ")}. server/.env.example dosyasına bakın.`
    );
  }
  if (source.JWT_SECRET.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET en az ${MIN_SECRET_LENGTH} karakter olmalıdır.`);
  }

  return {
    mongoUri: source.MONGO_URI,
    jwtSecret: source.JWT_SECRET,
    port: Number(source.PORT) || 5233,
    trustProxy: Number(source.TRUST_PROXY) || 0,
    clientOrigins: (source.CLIENT_ORIGIN || "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
