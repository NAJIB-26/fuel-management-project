import axios from "axios";
import { useAuthStore } from "./authStore";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function parseApiError(err: any): { message: string; code?: string } {
  const data = err?.response?.data;
  return { message: data?.message || "حدث خطأ غير متوقع.", code: data?.code };
}
