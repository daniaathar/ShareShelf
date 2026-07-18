import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/api/client";
import { AuthShell } from "./LoginPage";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  city: z.string().min(2, "Enter your city"),
  area: z.string().min(2, "Enter your area").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", city: "", area: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        city: values.city,
        area: values.area ? values.area : undefined,
      });
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join ShareShelf to rent from neighbors or list your own items."
      alt={{ label: "Already have an account?", href: "/login", cta: "Sign in" }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={form.formState.errors.name?.message}>
          <Input placeholder="Jane Doe" {...form.register("name")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
        </Field>
        <Field label="Password" error={form.formState.errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder="At least 8 characters" {...form.register("password")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" error={form.formState.errors.city?.message}>
            <Input placeholder="Karachi" {...form.register("city")} />
          </Field>
          <Field label="Area (optional)" error={form.formState.errors.area?.message}>
            <Input placeholder="Clifton" {...form.register("area")} />
          </Field>
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-xl bg-[image:var(--gradient-hero)] py-6 text-primary-foreground shadow-[var(--shadow-elegant)]"
        >
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our Terms and Privacy Policy.
        </p>
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