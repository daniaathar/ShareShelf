import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { itemService } from "@/api";
import { extractErrorMessage, formatMoney } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import type { Item, ItemStatus } from "@/types/api";

export function MyListingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["items", "all"],
    queryFn: () => itemService.list({ limit: 50 }),
  });

  const mine = (data?.items ?? []).filter(
    (i) => i.ownerId === user?.id,
  );

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ItemStatus;
    }) => itemService.update(id, { status }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Listing updated");
    },

    onError: (err) =>
      toast.error(extractErrorMessage(err, "Update failed")),
  });

  const archiveMutation = useMutation({
    mutationFn: (itemId: string) =>
      itemService.archive(itemId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast.success("Listing archived successfully");
    },

    onError: (err) =>
      toast.error(
        extractErrorMessage(err, "Failed to archive listing"),
      ),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            My listings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage what you rent out.
          </p>
        </div>

        <Button
          asChild
          className="rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground"
        >
          <Link to="/dashboard/listings/new">
            <Plus className="mr-1 h-4 w-4" />
            New listing
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-56 rounded-2xl"
            />
          ))}
        </div>
      ) : mine.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No listings yet"
          description="Turn your unused items into income. Create your first listing in under a minute."
          action={
            <Button
              asChild
              className="rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground"
            >
              <Link to="/dashboard/listings/new">
                Create listing
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((item) => (
            <ListingRow
              key={item.id}
              item={item}
              onToggle={(status) =>
                toggleMutation.mutate({
                  id: item.id,
                  status,
                })
              }
              onArchive={(id) =>
                archiveMutation.mutate(id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingRow({
  item,
  onToggle,
  onArchive,
}: {
  item: Item;
  onToggle: (status: ItemStatus) => void;
  onArchive: (id: string) => void;
}) {
  const handleArchive = () => {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${item.title}"?`,
    );

    if (confirmed) {
      onArchive(item.id);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] bg-secondary">
        {item.images[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="line-clamp-1 text-sm font-semibold">
              {item.title}
            </div>

            <div className="text-xs text-muted-foreground">
              {item.area}, {item.city}
            </div>
          </div>

          <StatusBadge status={item.status} />
        </div>

        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">
            {formatMoney(item.pricePerDayMinor)}

            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              / day
            </span>
          </span>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Available

            <Switch
              checked={item.status === "AVAILABLE"}
              onCheckedChange={(v) =>
                onToggle(
                  v ? "AVAILABLE" : "UNAVAILABLE",
                )
              }
            />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link
              to={`/dashboard/listings/${item.id}/edit`}
            >
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            <Link to={`/items/${item.id}`}>
              View
            </Link>
          </Button>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleArchive}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Archive Listing
        </Button>
      </div>
    </div>
  );
}