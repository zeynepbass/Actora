import { localStore, useLocalStore } from "@/lib/storage";

const EMPTY = [];
const storeFor = (userId) => localStore(`pinnedPosts:${userId}`, EMPTY);

/** Most recently pinned first. */
export function togglePinned(pinnedIds, id) {
  return pinnedIds.includes(id)
    ? pinnedIds.filter((pinned) => pinned !== id)
    : [id, ...pinnedIds];
}

/** Moves pinned posts to the front in pin order; the rest keep their order. */
export function sortPinned(posts, pinnedIds) {
  const rank = new Map(pinnedIds.map((id, index) => [id, index]));
  const pinned = posts
    .filter((post) => rank.has(post._id))
    .sort((a, b) => rank.get(a._id) - rank.get(b._id));
  return [...pinned, ...posts.filter((post) => !rank.has(post._id))];
}

export function usePinnedPosts(userId) {
  const store = storeFor(userId);
  const value = useLocalStore(store, EMPTY);
  const pinnedIds = Array.isArray(value) ? value : EMPTY;
  return [pinnedIds, (id) => store.write(togglePinned(pinnedIds, id))];
}

export function clearPinnedPosts(userId) {
  storeFor(userId).write(null);
}
