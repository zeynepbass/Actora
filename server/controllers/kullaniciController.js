import bcrypt from "bcryptjs";
import Kullanici from "../models/kullanici.js";
import Post from "../models/post.js";
import { signToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { removeUpload } from "../middleware/upload.js";
import { toPublicUser } from "../utils/serializers.js";
import {
  FROZEN_STATUS,
  validateCredentials,
  validateProfileUpdate,
  validateRegistration,
} from "../utils/validation.js";

const CASE_INSENSITIVE = { locale: "en", strength: 2 };
// Compared against when the e-mail is unknown so both failure paths cost the same.
const PLACEHOLDER_HASH = bcrypt.hashSync("actora-placeholder", 10);

const findByEmail = (email) => Kullanici.findOne({ email }).collation(CASE_INSENSITIVE);

function assertValid({ valid, errors }) {
  if (!valid) throw new HttpError(400, Object.values(errors)[0], errors);
}

export const login = async (req, res) => {
  const validation = validateCredentials(req.body);
  assertValid(validation);
  const { email, parola } = validation.value;

  const kullanici = await findByEmail(email);
  const match = await bcrypt.compare(parola, kullanici?.parola ?? PLACEHOLDER_HASH);
  if (!kullanici || !match) {
    throw new HttpError(401, "E-posta veya parola hatalı");
  }

  // Signing in again is how a frozen account is reactivated.
  const reactivated = kullanici.durum === FROZEN_STATUS;
  if (reactivated) {
    kullanici.durum = null;
    await kullanici.save();
  }

  res.status(200).json({
    message: reactivated ? "Hesabın yeniden etkinleştirildi" : "Giriş başarılı",
    kullanici: toPublicUser(kullanici),
    token: signToken(kullanici, req.app.get("jwtSecret")),
  });
};

export const kayitOl = async (req, res) => {
  const validation = validateRegistration(req.body);
  assertValid(validation);
  const { adSoyad, email, parola, rol } = validation.value;

  if (await findByEmail(email)) {
    throw new HttpError(409, "Bu e-posta zaten kayıtlı", { email: "Bu e-posta zaten kayıtlı" });
  }

  const kullanici = await Kullanici.create({
    adSoyad,
    email,
    parola: await bcrypt.hash(parola, 10),
    rol,
  });

  res.status(201).json({
    message: "Kullanıcı başarıyla oluşturuldu",
    kullanici: toPublicUser(kullanici),
  });
};

export const kullaniciDetay = async (req, res) => {
  res.status(200).json(toPublicUser(req.user));
};

function applyGoalStart(update, current) {
  if (!("hedefKg" in update) && !("kacGun" in update)) return;

  const hedefKg = update.hedefKg ?? (("hedefKg" in update) ? null : current.hedefKg);
  const kacGun = update.kacGun ?? (("kacGun" in update) ? null : current.kacGun);
  const changed = hedefKg !== (current.hedefKg ?? null) || kacGun !== (current.kacGun ?? null);

  if (!hedefKg || !kacGun) update.baslangicTarihi = null;
  else if (changed || !current.baslangicTarihi) update.baslangicTarihi = new Date();
}

export const kullaniciGuncelle = async (req, res) => {
  const current = req.user;
  const uploaded = req.file?.publicPath;

  try {
    if (req.body.durum === FROZEN_STATUS) {
      current.durum = FROZEN_STATUS;
      await current.save();
      await removeUpload(uploaded);
      return res.status(200).json({
        message: "Kullanıcı hesabı donduruldu",
        kullanici: toPublicUser(current),
      });
    }

    const validation = validateProfileUpdate(req.body);
    assertValid(validation);
    const update = validation.value;

    const previousEmail = current.email;
    const emailChanged =
      update.email !== undefined && update.email !== previousEmail.toLowerCase();
    if (emailChanged) {
      const owner = await findByEmail(update.email);
      if (owner && String(owner._id) !== String(current._id)) {
        throw new HttpError(409, "Bu e-posta zaten kayıtlı", {
          email: "Bu e-posta zaten kayıtlı",
        });
      }
    } else {
      delete update.email;
    }

    applyGoalStart(update, current);
    const previousImage = current.resim;
    if (uploaded) update.resim = uploaded;

    current.set(update);
    await current.save();

    if (emailChanged) {
      await Post.updateMany({ email: previousEmail }, { email: current.email });
    }
    if (uploaded) await removeUpload(previousImage);

    res.status(200).json({
      message: "Kullanıcı başarıyla güncellendi",
      kullanici: toPublicUser(current),
    });
  } catch (error) {
    await removeUpload(uploaded);
    throw error;
  }
};

export const deleteUser = async (req, res) => {
  const { _id, email, resim } = req.user;

  const posts = await Post.find({ email }).select("resim");
  await Post.deleteMany({ email });
  await Post.updateMany({ begenenler: _id }, { $pull: { begenenler: _id } });
  await Kullanici.deleteOne({ _id });
  await Promise.all([resim, ...posts.map((post) => post.resim)].map(removeUpload));

  res.status(200).json({ message: "Kullanıcı başarıyla silindi" });
};
