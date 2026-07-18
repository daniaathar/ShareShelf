import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, AuthPayload, User } from "@/types/api";

// Aligned to backend routes:
//   POST /auth/register  → { data: { user, accessToken } }
//   POST /auth/login     → { data: { user, accessToken } }
//   GET  /me             → { data: { user } }

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  city: string;
  area?: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthPayload> => {
    const res = await apiClient.post<ApiEnvelope<AuthPayload>>("/auth/login", payload);
    return unwrap(res);
  },
  register: async (payload: RegisterPayload): Promise<AuthPayload> => {
    const res = await apiClient.post<ApiEnvelope<AuthPayload>>("/auth/register", payload);
    return unwrap(res);
  },
  me: async (): Promise<User> => {
    const res = await apiClient.get<ApiEnvelope<{ user: User }>>("/me");
    return unwrap(res).user;
  },
};