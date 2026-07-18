// Shared API types — aligned to the real backend (Prisma schema + Express routes).
// Backend envelope: every success response is `{ data: <payload> }`.
// Money is stored in minor units (e.g. PKR paisa). Convert with `fromMinor`.

export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiError {
  code?: string;
  message: string;
  details?: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  area?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}

export type ItemStatus = "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";

export interface ItemImage {
  id: string;
  itemId: string;
  url: string;
  storagePublicId: string;
  position: number;
  createdAt?: string;
}

export interface ItemOwner {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  ownerId: string;
  owner?: ItemOwner;
  title: string;
  description: string;
  pricePerDayMinor: number;
  depositMinor: number;
  city: string;
  area: string;
  status: ItemStatus;
  images: ItemImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedItems {
  items: Item[];
  pagination: Pagination;
}

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PICKED_UP"
  | "RETURNED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "HELD" | "RELEASED" | "FAILED";

export interface Payment {
  id: string;
  bookingId: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerReference?: string | null;
}

export interface Booking {
  id: string;
  itemId: string;
  item?: Item;
  renterId: string;
  startDate: string;
  endDate: string;
  totalRentalMinor: number;
  depositMinor: number;
  status: BookingStatus;
  payment?: Payment | null;
  createdAt: string;
  updatedAt: string;
}