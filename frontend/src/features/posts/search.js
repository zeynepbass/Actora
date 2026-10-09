const normalize = (text) => (text || "").toLocaleLowerCase("tr");

/** Filters posts by role and by a free-text match on title, description and author. */
export function filterPosts(posts, { query = "", role = "" } = {}) {
  const needle = normalize(query.trim());
  return posts.filter((post) => {
    if (role && post.rol !== role) return false;
    if (!needle) return true;
    return [post.baslik, post.aciklama, post.yazar?.adSoyad].some((field) =>
      normalize(field).includes(needle)
    );
  });
}
