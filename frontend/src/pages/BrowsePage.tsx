import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PackageSearch, Search, X } from "lucide-react";
import { itemService } from "@/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const area = searchParams.get("area") ?? "";

  const [qDraft, setQDraft] = useState(q);
  const [cityDraft, setCityDraft] = useState(city);
  const [areaDraft, setAreaDraft] = useState(area);

  useEffect(() => {
    setQDraft(q);
    setCityDraft(city);
    setAreaDraft(area);
  }, [q, city, area]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", { page, q, city, area }],

    queryFn: () =>
      itemService.list({
        page,
        limit: 12,
        q: q || undefined,
        city: city || undefined,
        area: area || undefined,
      }),

    placeholderData: keepPreviousData,
  });

  const applyFilters = () => {
    const next = new URLSearchParams();

    if (qDraft.trim()) {
      next.set("q", qDraft.trim());
    }

    if (cityDraft.trim()) {
      next.set("city", cityDraft.trim());
    }

    if (areaDraft.trim()) {
      next.set("area", areaDraft.trim());
    }

    // Always start search results from page 1
    next.delete("page");

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const total = data?.pagination.total ?? 0;
  const limit = data?.pagination.limit ?? 12;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);

    if (p <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(p));
    }

    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-primary">
          Browse
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Find something to rent
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Search by keyword, city, and area. Results are limited to available
          items.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto]"
      >
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" />

          <Input
            value={qDraft}
            onChange={(e) => setQDraft(e.target.value)}
            placeholder="Search items…"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <Input
          value={cityDraft}
          onChange={(e) => setCityDraft(e.target.value)}
          placeholder="City"
        />

        <Input
          value={areaDraft}
          onChange={(e) => setAreaDraft(e.target.value)}
          placeholder="Area"
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            className="rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground"
          >
            Apply
          </Button>

          {(q || city || area) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              title="Clear"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Skeleton className="aspect-[4/3] w-full" />

                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={PackageSearch}
            title="Couldn't load items"
            description="Check your connection and try again."
          />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {data.items.length} of {total} item
              {total === 1 ? "" : "s"}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Math.max(1, page - 1));
                      }}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages })
                    .slice(0, 5)
                    .map((_, i) => {
                      const p = i + 1;

                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Math.min(totalPages, page + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No items match"
            description="Try widening your filters or clearing the search."
          />
        )}
      </div>
    </div>
  );
}