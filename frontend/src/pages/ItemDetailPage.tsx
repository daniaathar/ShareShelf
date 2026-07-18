import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { bookingService, itemService } from "@/api";
import { extractErrorMessage, formatMoney } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return 0;
  return Math.floor((e - s) / 86400000) + 1;
}

export function ItemDetailPage() {
  const { itemId = "" } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemService.get(itemId),
    enabled: !!itemId,
  });

  const days = daysBetween(start, end);
  const rentalTotal = useMemo(() => (item ? item.pricePerDayMinor * days : 0), [item, days]);

  const bookMutation = useMutation({
    mutationFn: () => bookingService.create(itemId, { startDate: start, endDate: end }),
    onSuccess: (booking) => {
      toast.success("Booking created — proceed to payment");
      navigate(`/dashboard/bookings/detail/${booking.id}`);
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Could not create booking")),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-lg font-semibold">Item not found</div>
        <Button asChild variant="link" className="mt-2"><Link to="/browse">Back to browse</Link></Button>
      </div>
    );
  }

  const isOwner = user?.id === item.ownerId;
  const today = new Date().toISOString().slice(0, 10);

  const handleBook = () => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/items/${itemId}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    if (!start || !end) return toast.error("Pick your rental dates");
    bookMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="aspect-[4/3] w-full bg-secondary">
              {item.images[active] ? (
                <img src={item.images[active].url} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">No image</div>
              )}
            </div>
          </div>
          {item.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {item.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActive(i)}
                  className={`aspect-square overflow-hidden rounded-xl border transition ${i === active ? "border-primary" : "border-border"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {item.area}, {item.city}
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{item.description}</p>

            {item.owner && (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {item.owner.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">Owned by {item.owner.name}</div>
                  <div className="text-xs text-muted-foreground">Usually replies within a day</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking box */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-semibold">{formatMoney(item.pricePerDayMinor)}</div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                Deposit
                <div className="text-sm font-medium text-foreground">{formatMoney(item.depositMinor)}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start</Label>
                <Input type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">End</Label>
                <Input type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-secondary/60 p-4 text-sm">
              <Row label={`${formatMoney(item.pricePerDayMinor)} × ${days} day${days === 1 ? "" : "s"}`} value={formatMoney(rentalTotal)} />
              <Row label="Refundable deposit" value={formatMoney(item.depositMinor)} />
              <div className="border-t border-border/60 pt-2">
                <Row label="Total due at checkout" value={formatMoney(rentalTotal + item.depositMinor)} bold />
              </div>
            </div>

            <Button
              onClick={handleBook}
              disabled={isOwner || bookMutation.isPending || item.status !== "AVAILABLE"}
              className="mt-5 w-full rounded-xl bg-[image:var(--gradient-hero)] py-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
            >
              {bookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isOwner ? "You own this listing" : item.status !== "AVAILABLE" ? "Not available" : "Request to book"}
            </Button>

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              You'll pay via secure mock payment. Deposit is held and refunded on return.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );
}