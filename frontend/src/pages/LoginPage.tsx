import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PackageOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/api/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login({ email: values.email, password: values.password });
      toast.success("Welcome back");
      navigate(redirect);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Login failed"));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue renting and listing on ShareShelf."
      alt={{ label: "Don't have an account?", href: "/register", cta: "Create account" }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="current-password" placeholder="••••••••" {...form.register("password")} />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <Checkbox
              checked={form.watch("remember")}
              onCheckedChange={(v) => form.setValue("remember", !!v)}
            />
            Remember me
          </label>
          <Link to="/login" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-xl bg-[image:var(--gradient-hero)] py-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
        >
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  alt,
  children,
}: {
  title: string;
  subtitle: string;
  alt: { label: string; href: string; cta: string };
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center bg-background px-4 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-elegant)]">
              <PackageOpen className="h-5 w-5" />
            </span>
            ShareShelf
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {alt.label}{" "}
            <Link to={alt.href} className="font-medium text-primary hover:underline">
              {alt.cta}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right: art */}
      <div className="relative hidden overflow-hidden bg-[image:var(--gradient-hero)] lg:block">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_35%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="text-sm font-medium opacity-80">A community-powered shelf</div>
          <div className="space-y-6">
            <div className="text-4xl font-semibold leading-tight tracking-tight">
              Borrow what you need. Earn from what you already own.
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["10k+ items", "180 cities", "4.9★ rated"].map((s) => (
                <div key={s} className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur">
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}