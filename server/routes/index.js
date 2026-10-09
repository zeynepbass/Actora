import express from "express";
import rateLimit from "express-rate-limit";
import * as post from "../controllers/postController.js";
import * as kullanici from "../controllers/kullaniciController.js";
import { attachUser, requireAuth, requireSelf } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { uploadImage } from "../middleware/upload.js";

export function createRouter() {
  const router = express.Router();

  const credentialLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin" },
  });
  const signedIn = [requireAuth, attachUser];
  const accountOwner = [requireAuth, requireSelf, attachUser];

  router.post("/login", credentialLimiter, asyncHandler(kullanici.login));
  router.post("/kayit", credentialLimiter, asyncHandler(kullanici.kayitOl));

  router.get("/kullanici/:id", accountOwner, asyncHandler(kullanici.kullaniciDetay));
  router.delete("/kullanici/:id", accountOwner, asyncHandler(kullanici.deleteUser));
  router.put(
    "/hesap/:id",
    accountOwner,
    uploadImage("resim"),
    asyncHandler(kullanici.kullaniciGuncelle)
  );

  router.get("/post", signedIn, asyncHandler(post.give));
  router.post("/post", signedIn, uploadImage("resim"), asyncHandler(post.create));
  router.get("/post/:id", signedIn, asyncHandler(post.details));
  router.put("/post/:id", signedIn, asyncHandler(post.updated));
  router.delete("/post/:id", signedIn, asyncHandler(post.deleted));
  router.post("/post/:id/begen", signedIn, asyncHandler(post.toggleLike));

  return router;
}
