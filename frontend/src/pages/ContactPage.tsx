import { Mail, MapPin, Phone } from "lucide-react";

export function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-xs font-medium uppercase tracking-wider text-primary">Contact</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Get in touch</h1>
      <p className="mt-4 text-muted-foreground">We usually reply within one business day.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: "hello@shareshelf.app" },
          { icon: Phone, label: "Phone", value: "+1 (555) 010-2040" },
          { icon: MapPin, label: "HQ", value: "Brooklyn, NY" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <c.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-sm font-medium">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}