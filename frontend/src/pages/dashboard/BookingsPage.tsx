import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { bookingService } from "@/api";
import { formatMoney } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import type { BookingRole } from "@/api/bookingService";

export function BookingsPage() {
  const { role: roleParam } = useParams();
  const role: BookingRole = roleParam === "owner" ? "owner" : "renter";
  const isOwner = role === "owner";

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", role],
    queryFn: () => bookingService.list({ role }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isOwner ? "Booking requests" : "My rentals"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwner ? "People renting your items." : "Items you've rented from others."}
        </p>
      </div>

      <div className="flex gap-2">
        <TabLink to="/dashboard/bookings/renter" active={!isOwner}>As renter</TabLink>
        <TabLink to="/dashboard/bookings/owner" active={isOwner}>As owner</TabLink>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={isOwner ? "No requests yet" : "No rentals yet"}
          description={isOwner ? "Bookings from renters will appear here." : "Browse items to make your first booking."}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((b) => (
            <li key={b.id}>
              <Link
                to={`/dashboard/bookings/detail/${b.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
              >
                <img src={b.item?.images?.[0]?.url ?? ""} alt="" className="h-16 w-16 rounded-xl bg-secondary object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold">{b.item?.title ?? "Item"}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.startDate.slice(0, 10)} → {b.endDate.slice(0, 10)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Rental {formatMoney(b.totalRentalMinor)} · Deposit {formatMoney(b.depositMinor)}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? "bg-primary text-primary-foreground shadow-[var(--shadow-elegant)]" : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}