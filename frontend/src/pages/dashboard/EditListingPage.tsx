import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { itemService } from "@/api";
import { fromMinor } from "@/api/client";
import { ListingForm } from "./ListingForm";

export function EditListingPage() {
  const { itemId = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemService.get(itemId),
    enabled: !!itemId,
  });

  if (isLoading || !item) {
    return <div className="grid h-96 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your item details and photos.</p>
      </div>
      <ListingForm
        submitLabel="Save changes"
        itemForImages={item}
        initial={{
          title: item.title,
          description: item.description,
          pricePerDay: fromMinor(item.pricePerDayMinor),
          deposit: fromMinor(item.depositMinor),
          city: item.city,
          area: item.area,
        }}
        onSubmitItem={async (values) => {
          const updated = await itemService.update(item.id, {
            title: values.title,
            description: values.description,
            pricePerDayMinor: Math.round(values.pricePerDay * 100),
            depositMinor: Math.round(values.deposit * 100),
            city: values.city,
            area: values.area,
          });
          qc.invalidateQueries({ queryKey: ["items"] });
          qc.invalidateQueries({ queryKey: ["item", item.id] });
          return updated;
        }}
      />
      <div className="text-right">
        <button onClick={() => navigate("/dashboard/listings")} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to my listings
        </button>
      </div>
    </div>
  );
}