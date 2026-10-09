export const sameEmail = (a, b) =>
  typeof a === "string" && typeof b === "string" && a.toLowerCase() === b.toLowerCase();

export function toPublicUser(user) {
  return {
    id: String(user._id),
    adSoyad: user.adSoyad ?? "",
    email: user.email,
    kullaniciAdi: user.kullaniciAdi ?? "",
    weight: user.weight ?? null,
    height: user.height ?? null,
    hedefKg: user.hedefKg ?? null,
    kacGun: user.kacGun ?? null,
    baslangicTarihi: user.baslangicTarihi ?? null,
    deneyim: user.deneyim ?? "",
    rol: user.rol ?? "",
    resim: user.resim ?? null,
    durum: user.durum ?? null,
  };
}

// Author e-mail addresses and the list of users who liked a post stay on the server.
export function toPublicPost(post, viewer, author) {
  const likes = post.begenenler ?? [];
  return {
    _id: String(post._id),
    baslik: post.baslik,
    aciklama: post.aciklama,
    rol: post.rol ?? "",
    resim: post.resim ?? null,
    kacAdim: post.kacAdim ?? null,
    createdAt: post.createdAt,
    benim: sameEmail(post.email, viewer.email),
    begeniSayisi: likes.length,
    begendi: likes.some((id) => String(id) === String(viewer._id)),
    yazar: {
      adSoyad: author?.adSoyad || "Actora üyesi",
      // Legacy avatars were stored inline as data URLs and are too large for a feed.
      resim: author?.resim?.startsWith("/uploads/") ? author.resim : null,
    },
  };
}
