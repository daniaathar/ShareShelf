import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your public identity on ShareShelf.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[image:var(--gradient-hero)] text-2xl font-semibold text-primary-foreground shadow-[var(--shadow-elegant)]">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={user?.name ?? ""} />
          <Field label="Email" value={user?.email ?? ""} />
          <Field label="City" value={user?.city ?? ""} />
          <Field label="Area" value={user?.area ?? ""} />
        </div>

        {/* PLACEHOLDER: backend has no profile-update endpoint yet. */}
        <div className="mt-6 rounded-xl bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
          Editing profile info will be available once the backend exposes a profile-update endpoint.
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-card p-6">
        <div className="text-sm font-semibold text-destructive">Danger zone</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Deleting your account is permanent. This action is not yet wired to the backend.
        </p>
        <Button variant="outline" disabled className="mt-4 border-destructive/40 text-destructive">
          Delete account
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} readOnly />
    </div>
  );
}