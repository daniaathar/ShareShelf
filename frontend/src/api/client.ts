import axios, { AxiosError } from "axios";
import type { ApiEnvelope } from "@/types/api";

const AUTH_STORAGE_KEY = "shareshelf.auth.token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  else window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

// Backend wraps every success response in { data: ... }.
// Axios also wraps under `.data`, so payload lives at `response.data.data`.
export const unwrap = <T,>(response: { data: ApiEnvelope<T> }): T => response.data.data;

export const extractErrorMessage = (err: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as
      | { message?: string; error?: { message?: string } }
      | undefined;
    return body?.error?.message ?? body?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

// Money helpers — backend stores minor units (PKR paisa by default).
export const fromMinor = (minor: number) => minor / 100;
export const formatMoney = (minor: number, currency = "PKR") =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    fromMinor(minor),
  );