import { Badge } from "@/components/ui/badge";
import type { BookingStatus, PaymentStatus, ItemStatus } from "@/types/api";
import type { ComparisonVerdict } from "@/api/evidenceService";

type AnyStatus = BookingStatus | PaymentStatus | ItemStatus | ComparisonVerdict;

const styles: Record<string, string> = {
  // Bookings
  PENDING_PAYMENT: "bg-amber-100 text-amber-900 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-900 border-blue-200",
  PICKED_UP: "bg-indigo-100 text-indigo-900 border-indigo-200",
  RETURNED: "bg-violet-100 text-violet-900 border-violet-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-900 border-rose-200",
  // Payments
  PENDING: "bg-amber-100 text-amber-900 border-amber-200",
  HELD: "bg-blue-100 text-blue-900 border-blue-200",
  RELEASED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  FAILED: "bg-rose-100 text-rose-900 border-rose-200",
  // Items
  AVAILABLE: "bg-emerald-100 text-emerald-900 border-emerald-200",
  UNAVAILABLE: "bg-slate-200 text-slate-800 border-slate-300",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
  // Comparison
  PASS: "bg-emerald-100 text-emerald-900 border-emerald-200",
  REVIEW_REQUIRED: "bg-amber-100 text-amber-900 border-amber-200",
};

const label = (s: string) => s.replace(/_/g, " ").toLowerCase();

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-secondary text-secondary-foreground"}`}
    >
      {label(status)}
    </Badge>
  );
}