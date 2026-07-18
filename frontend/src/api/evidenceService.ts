import { apiClient, unwrap } from "./client";
import type { ApiEnvelope } from "@/types/api";

export type EvidencePhase = "PICKUP" | "RETURN";
export type ComparisonVerdict = "PASS" | "REVIEW_REQUIRED" | "UNAVAILABLE";

export interface Evidence {
  id: string;
  bookingId: string;
  phase: EvidencePhase;
  url: string;
  storagePublicId: string;
  uploadedById: string;
  createdAt: string;
}

export interface Comparison {
  id: string;
  bookingId: string;
  similarityScore: number | null;
  verdict: ComparisonVerdict;
  provider: string;
  createdAt: string;
}

export const evidenceService = {
  upload: async (bookingId: string, phase: EvidencePhase, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await apiClient.post<ApiEnvelope<{ evidence: Evidence; comparison?: Comparison }>>(
      `/bookings/${bookingId}/evidence/${phase.toLowerCase()}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return unwrap(res);
  },
  comparison: async (bookingId: string): Promise<Comparison> => {
    const res = await apiClient.get<ApiEnvelope<Comparison>>(`/bookings/${bookingId}/comparison`);
    return unwrap(res);
  },
};