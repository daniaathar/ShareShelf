import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-8xl font-semibold tracking-tight bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">404</div>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button asChild className="mt-6 rounded-full bg-[image:var(--gradient-hero)] text-primary-foreground">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}