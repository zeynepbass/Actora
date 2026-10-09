import jwt from "jsonwebtoken";
import Kullanici from "../models/kullanici.js";
import { asyncHandler, HttpError } from "./errorHandler.js";

export function signToken(user, secret) {
  return jwt.sign({ id: String(user._id) }, secret, { expiresIn: "1d" });
}

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Oturum açmanız gerekiyor"));
  }

  try {
    const payload = jwt.verify(token, req.app.get("jwtSecret"));
    req.userId = payload.id;
    next();
  } catch {
    next(new HttpError(401, "Oturumunuzun süresi doldu, lütfen tekrar giriş yapın"));
  }
}

// Account routes carry the user id in the URL; only the account owner may use them.
export function requireSelf(req, res, next) {
  if (req.params.id !== req.userId) {
    return next(new HttpError(403, "Bu işlem için yetkiniz yok"));
  }
  next();
}

// Loads the signed-in account so handlers can rely on current data rather than token claims.
export const attachUser = asyncHandler(async (req, res, next) => {
  const user = await Kullanici.findById(req.userId).select("-parola");
  if (!user) throw new HttpError(401, "Oturum açmanız gerekiyor");
  req.user = user;
  next();
});
