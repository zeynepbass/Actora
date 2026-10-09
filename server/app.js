import express from "express";
import cors from "cors";
import { createRouter } from "./routes/index.js";
import { UPLOAD_DIR } from "./middleware/upload.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp(env) {
  const app = express();

  app.disable("x-powered-by");
  app.set("jwtSecret", env.jwtSecret);
  // Needed behind a reverse proxy so rate limiting sees the real client address.
  if (env.trustProxy) app.set("trust proxy", env.trustProxy);

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });
  app.use(cors({ origin: env.clientOrigins }));
  app.use(express.json({ limit: "100kb" }));

  // Uploaded files are user-controlled: never let the browser execute them,
  // but allow the web app on another origin to embed them as images.
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      index: false,
      maxAge: "7d",
      setHeaders: (res) => {
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );

  app.use("/", createRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
