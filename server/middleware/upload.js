import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { HttpError } from "./errorHandler.js";
import { detectImageType } from "../utils/imageType.js";

export const UPLOAD_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "uploads"
);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(UPLOAD_DIR, { recursive: true }).then(
      () => cb(null, UPLOAD_DIR),
      (error) => cb(error)
    );
  },
  // The original filename is user input, so it is never used on disk.
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, name + EXTENSIONS[file.mimetype]);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new HttpError(400, "Yalnızca JPEG, PNG, WebP veya GIF görseller yüklenebilir"));
  },
});

export async function removeUpload(publicPath) {
  if (typeof publicPath !== "string" || !publicPath.startsWith("/uploads/")) return;
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(publicPath))).catch(() => {});
}

// The declared MIME type comes from the client, so the stored bytes are checked as well.
async function verifyImageContent(req, res, next) {
  if (!req.file) return next();
  try {
    const handle = await fs.open(req.file.path, "r");
    const { buffer } = await handle.read(Buffer.alloc(12), 0, 12, 0);
    await handle.close();

    if (detectImageType(buffer) !== req.file.mimetype) {
      await fs.unlink(req.file.path).catch(() => {});
      return next(new HttpError(400, "Dosya geçerli bir görsel değil"));
    }
    req.file.publicPath = `/uploads/${req.file.filename}`;
    next();
  } catch (error) {
    next(error);
  }
}

export const uploadImage = (field) => [upload.single(field), verifyImageContent];
