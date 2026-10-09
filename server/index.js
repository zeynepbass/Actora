import { loadEnv } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { createApp } from "./app.js";

async function start() {
  const env = loadEnv();
  await connectDatabase(env.mongoUri);

  createApp(env).listen(env.port, () => {
    console.info(`Actora API ${env.port} portunda çalışıyor`);
  });
}

start().catch((error) => {
  console.error("Sunucu başlatılamadı:", error.message);
  process.exit(1);
});
