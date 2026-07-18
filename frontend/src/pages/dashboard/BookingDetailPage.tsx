import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, CameraIcon, CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { bookingService, evidenceService } from "@/api";
import { extractErrorMessage, formatMoney } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { BookingTransition, EvidencePhase } from "@/api";

export function BookingDetailPage() {
  const { bookingId = "" } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingService.get(bookingId),
    enabled: !!bookingId,
  });

  const comparisonQ = useQuery({
    queryKey: ["booking", bookingId, "comparison"],
    queryFn: () => evidenceService.comparison(bookingId),
    enabled: !!bookingId && (booking?.status === "RETURNED" || booking?.status === "COMPLETED"),
    retry: false,
  });

  const payMutation = useMutation({
    mutationFn: () => bookingService.mockPay(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Payment confirmed");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Payment failed")),
  });

  const transitionMutation = useMutation({
    mutationFn: (status: BookingTransition) => bookingService.transition(bookingId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking updated");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Update failed")),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ phase, file }: { phase: EvidencePhase; file: File }) => evidenceService.upload(bookingId, phase, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
      qc.invalidateQueries({ queryKey: ["booking", bookingId, "comparison"] });
      toast.success("Evidence uploaded");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Upload failed")),
  });

  if (isLoading || !booking) {
    return <div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-40 w-full rounded-2xl" /></div>;
  }

  const isRenter = booking.renterId === user?.id;
  const isOwner = booking.item?.ownerId === user?.id;
  const item = booking.item;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to={isOwner ? "/dashboard/bookings/owner" : "/dashboard/bookings/renter"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-4 p-4">
              <img src={item?.images?.[0]?.url ?? ""} alt="" className="h-20 w-20 rounded-xl bg-secondary object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold">{item?.title}</div>
                <div className="text-xs text-muted-foreground">{item?.area}, {item?.city}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {booking.startDate.slice(0, 10)} → {booking.endDate.slice(0, 10)}
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </div>

          {/* Transitions */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Progress</div>
            <Timeline status={booking.status} />

            {/* Owner: pickup evidence + mark picked up */}
            {isOwner && booking.status === "CONFIRMED" && (
              <EvidenceUpload
                title="Pickup photo"
                description="Take a clear photo of the item at handover. This is compared to the return photo."
                onFile={(file) => uploadMutation.mutate({ phase: "PICKUP", file })}
                pending={uploadMutation.isPending}
              />
            )}
            {isOwner && booking.status === "CONFIRMED" && (
              <Button
                onClick={() => transitionMutation.mutate("PICKED_UP")}
                disabled={transitionMutation.isPending}
                className="mt-3 w-full rounded-xl"
              >
                Mark as picked up
              </Button>
            )}

            {/* Owner/renter: return evidence + mark returned */}
            {(isOwner || isRenter) && booking.status === "PICKED_UP" && (
              <>
                <EvidenceUpload
                  title="Return photo"
                  description="Snap a photo of the item on return. We'll compare it to the pickup photo."
                  onFile={(file) => uploadMutation.mutate({ phase: "RETURN", file })}
                  pending={uploadMutation.isPending}
                />
                <Button
                  onClick={() => transitionMutation.mutate("RETURNED")}
                  disabled={transitionMutation.isPending}
                  className="mt-3 w-full rounded-xl"
                  variant="outline"
                >
                  Mark as returned
                </Button>
              </>
            )}

            {isOwner && booking.status === "RETURNED" && (
              <Button
                onClick={() => transitionMutation.mutate("COMPLETED")}
                disabled={transitionMutation.isPending}
                className="mt-3 w-full rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground"
              >
                Release deposit & complete
              </Button>
            )}
          </div>

          {/* Comparison result */}
          {comparisonQ.data && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Condition comparison</div>
                <StatusBadge status={comparisonQ.data.verdict} />
              </div>
              {comparisonQ.data.similarityScore !== null && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Similarity score: <span className="font-medium text-foreground">
                    {(Number(comparisonQ.data.similarityScore) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">Powered by {comparisonQ.data.provider}</div>
            </div>
          )}
        </div>

        {/* Sidebar: summary + payment */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Summary</div>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Rental total" value={formatMoney(booking.totalRentalMinor)} />
              <Row label="Refundable deposit" value={formatMoney(booking.depositMinor)} />
              <div className="border-t border-border/60 pt-2">
                <Row label="Total" value={formatMoney(booking.totalRentalMinor + booking.depositMinor)} bold />
              </div>
            </div>
          </div>

          {isRenter && booking.status === "PENDING_PAYMENT" && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-primary" /> Payment
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pay via secure mock provider to confirm your booking. Deposit is held and refunded on return.
              </p>
              <Button
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
                className="mt-4 w-full rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground"
              >
                {payMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay {formatMoney(booking.totalRentalMinor + booking.depositMinor)}
              </Button>
            </div>
          )}

          {booking.payment && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Payment</span>
                <StatusBadge status={booking.payment.status} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {booking.payment.provider} · {booking.payment.currency}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const steps: { key: string; label: string }[] = [
  { key: "PENDING_PAYMENT", label: "Pending payment" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PICKED_UP", label: "Picked up" },
  { key: "RETURNED", label: "Returned" },
  { key: "COMPLETED", label: "Completed" },
];

function Timeline({ status }: { status: string }) {
  const activeIdx = steps.findIndex((s) => s.key === status);
  return (
    <ol className="mt-4 grid grid-cols-5 gap-1">
      {steps.map((s, i) => {
        const done = i <= activeIdx;
        return (
          <li key={s.key} className="flex flex-col items-center gap-1.5 text-center">
            <div className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <div className={`text-[10px] leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
          </li>
        );
      })}
    </ol>
  );
}

function EvidenceUpload({
  title, description, onFile, pending,
}: { title: string; description: string; onFile: (file: File) => void; pending: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CameraIcon className="h-4 w-4 text-primary" /> {title}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <Button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={pending}
        variant="outline"
        size="sm"
        className="mt-3 rounded-lg"
      >
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Upload photo
      </Button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}