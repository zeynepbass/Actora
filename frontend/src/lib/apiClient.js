import axios from "axios";
import { clearSession, getSession } from "@/features/auth/session";

export const API_URL = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = getSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A rejected token means the session is no longer usable; the app shell redirects to sign-in.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Bir şeyler ters gitti. Lütfen tekrar deneyin.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.request && !error.response) {
    return "Sunucuya ulaşılamıyor. Bağlantınızı kontrol edip tekrar deneyin.";
  }
  return fallback;
}

export const getFieldErrors = (error) => error?.response?.data?.fields ?? {};
