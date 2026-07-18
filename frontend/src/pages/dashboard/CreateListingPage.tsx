import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { itemService } from "@/api";
import { ListingForm } from "./ListingForm";

export function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create a listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the basics, then upload photos below.</p>
      </div>
      <ListingForm
        submitLabel="Save & continue"
        onSubmitItem={async (values) => {
          const item = await itemService.create({
            title: values.title,
            description: values.description,
            pricePerDayMinor: Math.round(values.pricePerDay * 100),
            depositMinor: Math.round(values.deposit * 100),
            city: values.city,
            area: values.area,
          });
          qc.invalidateQueries({ queryKey: ["items"] });
          return item;
        }}
      />
      <div className="text-right">
        <button
          onClick={() => navigate("/dashboard/listings")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Done → Back to my listings
        </button>
      </div>
    </div>
  );
}