import { clearFavourites } from "@/features/posts/favourites";
import { clearPinnedPosts } from "@/features/posts/pins";
import { clearSession, getSession } from "./session";

/** Ends the session. `forgetDevice` also removes saved and pinned posts stored on this device. */
export function signOut(queryClient, { forgetDevice = false } = {}) {
  const userId = getSession()?.kullanici?.id;
  if (forgetDevice) {
    clearFavourites();
    if (userId) clearPinnedPosts(userId);
  }
  clearSession();
  queryClient.clear();
}
