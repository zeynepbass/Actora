import { localStore, useLocalStore } from "@/lib/storage";

// Saved posts are kept on this device as snapshots of the post at the time it was saved.
const EMPTY = [];
const store = localStore("favourite", EMPTY);

const read = () => (Array.isArray(store.read()) ? store.read() : EMPTY);

export function addFavourite(post) {
  const current = read();
  if (current.some((item) => item._id === post._id)) return;
  store.write([...current, post]);
}

export function removeFavourite(id) {
  store.write(read().filter((item) => item._id !== id));
}

export function clearFavourites() {
  store.write(null);
}

export function useFavourites() {
  const value = useLocalStore(store, EMPTY);
  return Array.isArray(value) ? value : EMPTY;
}
