import multer from "multer";

export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Kaynak bulunamadı" });
}

// Express identifies error handlers by their four-argument signature.
export function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res
      .status(error.status)
      .json({ message: error.message, ...(error.fields && { fields: error.fields }) });
  }
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "Görsel en fazla 5 MB olabilir" : "Dosya yüklenemedi",
    });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ message: "İstek çok büyük" });
  }
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Geçersiz istek gövdesi" });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: "Bu e-posta zaten kayıtlı" });
  }

  console.error(`${req.method} ${req.path} başarısız:`, error);
  res.status(500).json({ message: "Beklenmeyen bir hata oluştu" });
}
