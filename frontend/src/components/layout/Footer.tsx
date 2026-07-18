import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
              <PackageOpen className="h-4 w-4" />
            </span>
            ShareShelf
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Rent what you need. Earn from what you already own.
          </p>
        </div>
        <FooterCol title="Product" links={[["Browse", "/"], ["How it works", "/about"], ["Pricing", "/about"]]} />
        <FooterCol title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Careers", "/about"]]} />
        <FooterCol title="Legal" links={[["Terms", "/about"], ["Privacy", "/about"], ["Cookies", "/about"]]} />
      </div>
      <div className="border-t border-border/60 py-5">
        <p className="mx-auto max-w-7xl px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} ShareShelf. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}