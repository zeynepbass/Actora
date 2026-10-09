import { api } from "@/lib/apiClient";

export const loginUser = (credentials) => api.post("/login", credentials).then((res) => res.data);

export const registerUser = (data) => api.post("/kayit", data).then((res) => res.data);
