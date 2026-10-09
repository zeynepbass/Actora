import mongoose from "mongoose";
import Kullanici from "../models/kullanici.js";
import Post from "../models/post.js";
import { HttpError } from "../middleware/errorHandler.js";
import { removeUpload } from "../middleware/upload.js";
import { sameEmail, toPublicPost } from "../utils/serializers.js";
import { FROZEN_STATUS, validatePost } from "../utils/validation.js";

const FEED_LIMIT = 200;

async function findPost(id) {
  const post = mongoose.isValidObjectId(id) ? await Post.findById(id) : null;
  if (!post) throw new HttpError(404, "Post bulunamadı");
  return post;
}

async function findOwnPost(id, user) {
  const post = await findPost(id);
  if (!sameEmail(post.email, user.email)) {
    throw new HttpError(403, "Bu gönderi size ait değil");
  }
  return post;
}

function validated(body) {
  const { valid, value, errors } = validatePost(body);
  if (!valid) throw new HttpError(400, Object.values(errors)[0], errors);
  return value;
}

export const create = async (req, res) => {
  try {
    const post = await Post.create({
      ...validated(req.body),
      email: req.user.email,
      rol: req.user.rol,
      resim: req.file?.publicPath ?? null,
    });
    res.status(201).json(toPublicPost(post, req.user, req.user));
  } catch (error) {
    await removeUpload(req.file?.publicPath);
    throw error;
  }
};

export const give = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(FEED_LIMIT);

  const emails = [...new Set(posts.map((post) => post.email).filter(Boolean))];
  const authors = await Kullanici.find({ email: { $in: emails } }).select(
    "adSoyad email resim durum"
  );
  const authorByEmail = new Map(authors.map((author) => [author.email.toLowerCase(), author]));
  const authorOf = (post) => authorByEmail.get(post.email?.toLowerCase());

  res.status(200).json(
    posts
      .filter((post) => authorOf(post)?.durum !== FROZEN_STATUS)
      .map((post) => toPublicPost(post, req.user, authorOf(post)))
  );
};

export const details = async (req, res) => {
  const post = await findPost(req.params.id);
  const author = await Kullanici.findOne({ email: post.email }).select("adSoyad resim");
  res.status(200).json(toPublicPost(post, req.user, author));
};

export const updated = async (req, res) => {
  const post = await findOwnPost(req.params.id, req.user);
  const { baslik, aciklama } = validated({ ...req.body, kacAdim: undefined });

  post.set({ baslik, aciklama });
  await post.save();
  res.status(200).json(toPublicPost(post, req.user, req.user));
};

export const deleted = async (req, res) => {
  const post = await findOwnPost(req.params.id, req.user);
  await post.deleteOne();
  await removeUpload(post.resim);
  res.status(200).json({ message: "Post başarıyla silindi" });
};

export const toggleLike = async (req, res) => {
  const post = await findPost(req.params.id);
  const liked = post.begenenler.some((id) => id.equals(req.user._id));

  const result = await Post.findByIdAndUpdate(
    post._id,
    liked
      ? { $pull: { begenenler: req.user._id } }
      : { $addToSet: { begenenler: req.user._id } },
    { new: true, timestamps: false }
  );
  res.status(200).json({ begendi: !liked, begeniSayisi: result.begenenler.length });
};
