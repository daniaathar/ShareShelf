import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, Item, ItemImage, ItemStatus, PaginatedItems } from "@/types/api";

export interface ListItemsQuery {
  page?: number;
  limit?: number;
  city?: string;
  area?: string;
  q?: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  pricePerDayMinor: number;
  depositMinor: number;
  city: string;
  area: string;
  status?: ItemStatus;
}

export type UpdateItemPayload = Partial<CreateItemPayload>;

export const itemService = {
  list: async (query: ListItemsQuery = {}): Promise<PaginatedItems> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedItems>>("/items", { params: query });
    return unwrap(res);
  },
  get: async (itemId: string): Promise<Item> => {
    const res = await apiClient.get<ApiEnvelope<Item>>(`/items/${itemId}`);
    return unwrap(res);
  },
  create: async (payload: CreateItemPayload): Promise<Item> => {
    const res = await apiClient.post<ApiEnvelope<Item>>("/items", payload);
    return unwrap(res);
  },
  update: async (itemId: string, payload: UpdateItemPayload): Promise<Item> => {
    const res = await apiClient.patch<ApiEnvelope<Item>>(`/items/${itemId}`, payload);
    return unwrap(res);
  },
  archive: async (itemId: string): Promise<Item> => {
  const res = await apiClient.delete<ApiEnvelope<Item>>(`/items/${itemId}`);
  return unwrap(res);
  },
  addImage: async (itemId: string, file: File): Promise<ItemImage> => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await apiClient.post<ApiEnvelope<ItemImage>>(
      `/items/${itemId}/images`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },
};