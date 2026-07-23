import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { itemService } from "@/api";
import { extractErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Item } from "@/types/api";

const schema = z.object({
  title: z.string().min(3, "Min 3 characters").max(120),
  description: z.string().min(10, "Min 10 characters").max(2000),
  pricePerDay: z.number({ error: "Enter a price" }).positive("Enter a price"),
  deposit: z
    .number({ error: "Deposit can't be negative" })
    .nonnegative("Deposit can't be negative"),
  city: z.string().min(2),
  area: z.string().min(2),
});

export type ListingFormValues = z.infer<typeof schema>;

export function ListingForm({
  initial,
  submitLabel,
  onSubmitItem,
  itemForImages,
}: {
  initial?: Partial<ListingFormValues>;
  submitLabel: string;
  onSubmitItem: (values: ListingFormValues) => Promise<Item>;
  itemForImages?: Item;
}) {
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      pricePerDay: initial?.pricePerDay ?? 0,
      deposit: initial?.deposit ?? 0,
      city: initial?.city ?? "",
      area: initial?.area ?? "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [pendingItem, setPendingItem] = useState<Item | undefined>(
    itemForImages,
  );

  const onSubmit = async (values: ListingFormValues) => {
    setSubmitting(true);

    try {
      const item = await onSubmitItem(values);
      setPendingItem(item);
      toast.success("Listing saved");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Save failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border border-border bg-card p-6"
      >
        <div className="space-y-1.5">
          <Label>Title</Label>

          <Input
            placeholder="e.g. Cordless drill kit"
            {...form.register("title")}
          />

          {form.formState.errors.title && (
            <p className="text-xs text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>

          <Textarea
            rows={5}
            placeholder="What's included, condition, pickup notes…"
            {...form.register("description")}
          />

          {form.formState.errors.description && (
            <p className="text-xs text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Price per day (PKR)</Label>

            <Input
              type="number"
              min={0}
              step={1}
              {...form.register("pricePerDay", {
                valueAsNumber: true,
              })}
            />

            {form.formState.errors.pricePerDay && (
              <p className="text-xs text-destructive">
                {form.formState.errors.pricePerDay.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Refundable deposit (PKR)</Label>

            <Input
              type="number"
              min={0}
              step={1}
              {...form.register("deposit", {
                valueAsNumber: true,
              })}
            />

            {form.formState.errors.deposit && (
              <p className="text-xs text-destructive">
                {form.formState.errors.deposit.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>City</Label>

            <Input
              placeholder="Karachi"
              {...form.register("city")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Area</Label>

            <Input
              placeholder="Clifton"
              {...form.register("area")}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground"
        >
          {submitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          {submitLabel}
        </Button>
      </form>

      {pendingItem && (
        <ImageManager
          item={pendingItem}
          onChange={setPendingItem}
        />
      )}
    </div>
  );
}

function ImageManager({
  item,
  onChange,
}: {
  item: Item;
  onChange: (i: Item) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = 5 - item.images.length;

    // Reject the entire selection if it exceeds the remaining limit.
    if (files.length > remaining) {
      toast.error(
        `You can upload a maximum of ${remaining} more image${
          remaining === 1 ? "" : "s"
        }.`,
      );

      return;
    }

    setUploading(true);

    try {
      const toUpload = Array.from(files);

      for (const file of toUpload) {
        const img = await itemService.addImage(item.id, file);

        onChange({
          ...item,
          images: [...item.images, img],
        });

        item = {
          ...item,
          images: [...item.images, img],
        };
      }

      toast.success(
        `Uploaded ${toUpload.length} image${
          toUpload.length === 1 ? "" : "s"
        }`,
      );
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Upload failed"),
      );
    } finally {
      setUploading(false);
    }
  };

  const full = item.images.length >= 5;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">
            Photos
          </div>

          <div className="text-xs text-muted-foreground">
            Up to 5 images. First image is the cover.
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {item.images.length} / 5
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {item.images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <img
              src={img.url}
              alt=""
              className="h-full w-full object-cover"
            />

            <div className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium">
              #{img.position + 1}
            </div>
          </div>
        ))}

        {!full && (
          <label
            className={`grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-secondary/40 text-muted-foreground transition hover:border-primary hover:text-primary ${
              uploading
                ? "pointer-events-none opacity-60"
                : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-center text-xs">
                <ImagePlus className="h-5 w-5" />
                Add photo
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) =>
                handleFiles(e.target.files)
              }
            />
          </label>
        )}
      </div>

      {full && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <X className="h-3 w-3" />
          Maximum 5 photos reached.
        </div>
      )}
    </div>
  );
}