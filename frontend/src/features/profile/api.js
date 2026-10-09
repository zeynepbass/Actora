import { api } from "@/lib/apiClient";

export const fetchUser = (id) => api.get(`/kullanici/${id}`).then((res) => res.data);

/** `data` may be a plain object or FormData when a profile photo is attached. */
export const updateUser = (id, data) => api.put(`/hesap/${id}`, data).then((res) => res.data);

export const resetGoal = (id) => updateUser(id, { hedefKg: 0, kacGun: 0 });

export const freezeUser = (id) => updateUser(id, { durum: "dondurulmuştur" });

export const deleteUser = (id) => api.delete(`/kullanici/${id}`).then((res) => res.data);
