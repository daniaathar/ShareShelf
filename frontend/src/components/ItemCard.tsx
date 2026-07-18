import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Item } from "@/types/api";
import { formatMoney } from "@/api/client";

export function ItemCard({ item }: { item: Item }) {
  const cover = item.images?.[0]?.url;
  return (
    <Link
      to={`/items/${item.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="line-clamp-1 text-sm font-semibold">{item.title}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {item.area}, {item.city}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-base font-semibold">
            {formatMoney(item.pricePerDayMinor)}
            <span className="text-xs font-normal text-muted-foreground"> / day</span>
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            {item.status}
          </span>
        </div>
      </div>
    </Link>
  );
}