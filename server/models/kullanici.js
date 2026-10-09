import mongoose from "mongoose";

const kullaniciSchema = new mongoose.Schema(
  {
    adSoyad: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parola: { type: String, required: true },
    kullaniciAdi: { type: String, trim: true },
    weight: { type: Number },
    height: { type: Number },
    hedefKg: { type: Number },
    kacGun: { type: Number },
    // Set whenever the weight goal changes; the goal period is counted from here.
    baslangicTarihi: { type: Date, default: null },
    deneyim: { type: String },
    rol: { type: String, default: "" },
    resim: { type: String, default: null },
    durum: { type: String, default: null },
  },
  { timestamps: true }
);

const Kullanici = mongoose.model("Kullanici", kullaniciSchema);

export default Kullanici;
