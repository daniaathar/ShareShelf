import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarCheck, PackageOpen, Plus, ShoppingBag, Wallet } from "lucide-react";
import { bookingService, itemService } from "@/api";
import { formatMoney } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHomePage() {
  const { user } = useAuth();

  const myItems = useQuery({
    queryKey: ["items", "mine", user?.id],
    queryFn: () => itemService.list({ limit: 50 }),
  });
  const mine = myItems.data?.items.filter((i) => i.ownerId === user?.id) ?? [];

  const renterBookings = useQuery({
    queryKey: ["bookings", "renter"],
    queryFn: () => bookingService.list({ role: "renter" }),
  });
  const ownerBookings = useQuery({
    queryKey: ["bookings", "owner"],
    queryFn: () => bookingService.list({ role: "owner" }),
  });

  const revenueMinor = (ownerBookings.data ?? [])
    .filter((b) => b.status === "COMPLETED")
    .reduce((s, b) => s + b.totalRentalMinor, 0);

  const stats = [
    { icon: PackageOpen, label: "My listings", value: mine.length },
    { icon: ShoppingBag, label: "Active rentals", value: renterBookings.data?.filter((b) => !["COMPLETED", "CANCELLED"].includes(b.status)).length ?? 0 },
    { icon: CalendarCheck, label: "Pending requests", value: ownerBookings.data?.filter((b) => b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED").length ?? 0 },
    { icon: Wallet, label: "Lifetime earnings", value: formatMoney(revenueMinor) },
  ];

  const recent = (ownerBookings.data ?? []).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-primary">Dashboard</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back, {user?.name?.split(" ")[0]}</h1>
        </div>
        <Button asChild className="rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground">
          <Link to="/dashboard/listings/new"><Plus className="mr-1 h-4 w-4" /> New listing</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Recent booking requests"
          empty="No requests yet"
          loading={ownerBookings.isLoading}
          href="/dashboard/bookings/owner"
        >
          {recent.length === 0 ? null : (
            <ul className="divide-y divide-border/60">
              {recent.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-3">
                  <img
                    src={b.item?.images?.[0]?.url ?? ""}
                    alt=""
                    className="h-12 w-12 rounded-lg bg-secondary object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link to={`/dashboard/bookings/detail/${b.id}`} className="line-clamp-1 text-sm font-medium hover:underline">
                      {b.item?.title ?? "Booking"}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {b.startDate.slice(0, 10)} → {b.endDate.slice(0, 10)} · {formatMoney(b.totalRentalMinor)}
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="My latest listings"
          empty="You haven't listed anything yet"
          loading={myItems.isLoading}
          href="/dashboard/listings"
        >
          {mine.length === 0 ? null : (
            <ul className="divide-y divide-border/60">
              {mine.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <img
                    src={i.images?.[0]?.url ?? ""}
                    alt=""
                    className="h-12 w-12 rounded-lg bg-secondary object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link to={`/items/${i.id}`} className="line-clamp-1 text-sm font-medium hover:underline">
                      {i.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {formatMoney(i.pricePerDayMinor)} / day · {i.area}, {i.city}
                    </div>
                  </div>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title, href, loading, empty, children,
}: { title: string; href: string; loading: boolean; empty: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link to={href} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : children ? children : (
          <div className="py-6 text-center text-sm text-muted-foreground">{empty}</div>
        )}
      </div>
    </div>
  );
}