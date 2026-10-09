import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    baslik: { type: String, required: true, trim: true },
    aciklama: { type: String, required: true, trim: true },
    // Posts are linked to their author by e-mail address.
    email: { type: String, required: true, trim: true, index: true },
    rol: { type: String },
    resim: { type: String, default: null },
    kacAdim: { type: String, default: null },
    begenenler: [{ type: mongoose.Schema.Types.ObjectId, ref: "Kullanici" }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
