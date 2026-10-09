import { localStore, useLocalStore } from "@/lib/storage";

// Shape: { token, kullanici: { id, adSoyad, email, rol, ... } }
const store = localStore("token");

export const getSession = () => store.read();
export const setSession = (session) => store.write(session);
export const clearSession = () => store.write(null);

export function updateSessionUser(kullanici) {
  const session = getSession();
  if (session) setSession({ ...session, kullanici: { ...session.kullanici, ...kullanici } });
}

/** `undefined` while the stored session has not been read yet, `null` when signed out. */
export function useSession() {
  return useLocalStore(store, undefined);
}
