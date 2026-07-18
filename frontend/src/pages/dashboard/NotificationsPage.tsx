import { Bell } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Booking updates and messages will show up here.</p>
      </div>
      <EmptyState
        icon={Bell}
        title="You're all caught up"
        description="We'll ping you when someone requests to book your items or when a rental status changes."
      />
    </div>
  );
}