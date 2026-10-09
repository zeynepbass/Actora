import mongoose from "mongoose";

export async function connectDatabase(uri) {
  const { connection } = await mongoose.connect(uri);
  console.info(`MongoDB bağlantısı kuruldu: ${connection.name}`);
}
