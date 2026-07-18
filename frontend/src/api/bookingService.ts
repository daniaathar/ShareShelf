import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, Booking, BookingStatus, Payment } from "@/types/api";

export interface CreateBookingPayload {
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate: string;
}

export type BookingRole = "owner" | "renter";
export type BookingTransition = "PICKED_UP" | "RETURNED" | "COMPLETED";

export const bookingService = {
  create: async (itemId: string, payload: CreateBookingPayload): Promise<Booking> => {
    const res = await apiClient.post<ApiEnvelope<Booking>>(`/items/${itemId}/bookings`, payload);
    return unwrap(res);
  },
  list: async (params: { role?: BookingRole; status?: BookingStatus } = {}): Promise<Booking[]> => {
    const res = await apiClient.get<ApiEnvelope<{ bookings: Booking[] }>>("/bookings", { params });
    return unwrap(res).bookings;
  },
  get: async (bookingId: string): Promise<Booking> => {
    const res = await apiClient.get<ApiEnvelope<Booking>>(`/bookings/${bookingId}`);
    return unwrap(res);
  },
  mockPay: async (bookingId: string): Promise<{ booking: Booking; payment: Payment }> => {
    const res = await apiClient.post<ApiEnvelope<{ booking: Booking; payment: Payment }>>(
      `/bookings/${bookingId}/mock-payment`,
    );
    return unwrap(res);
  },
  transition: async (bookingId: string, status: BookingTransition): Promise<Booking> => {
    const res = await apiClient.post<ApiEnvelope<Booking>>(
      `/bookings/${bookingId}/transition`,
      { status },
    );
    return unwrap(res);
  },
};