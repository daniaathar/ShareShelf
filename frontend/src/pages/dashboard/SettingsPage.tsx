import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferences and privacy.</p>
      </div>

      <Section title="Notifications" description="Choose what you want to be notified about.">
        <Toggle label="Booking updates" defaultChecked />
        <Toggle label="New messages" defaultChecked />
        <Toggle label="Marketing emails" />
      </Section>

      <Section title="Privacy" description="Control what other renters can see.">
        <Toggle label="Show my area on listings" defaultChecked />
        <Toggle label="Allow reviews on my profile" defaultChecked />
      </Section>

      <Section title="Appearance" description="Theme and language preferences.">
        <div className="text-xs text-muted-foreground">Theme and language switching will be added in a later release.</div>
      </Section>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 text-sm">
      <span>{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}