import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Plus,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/listings", label: "My listings", icon: PackageOpen },
  { to: "/dashboard/bookings/renter", label: "My rentals", icon: ShoppingBag },
  { to: "/dashboard/bookings/owner", label: "Requests", icon: CalendarClock },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border/60 bg-card/40 md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <PackageOpen className="h-4 w-4" />
          </span>
          ShareShelf
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Button
            onClick={() => navigate("/dashboard/listings/new")}
            className="w-full rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" /> New listing
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="text-sm text-muted-foreground">
            <NavLink to="/" className="hover:text-foreground">← Back to site</NavLink>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <div className="font-medium text-foreground">{user?.name}</div>
              <div className="text-muted-foreground">{user?.city}{user?.area ? `, ${user.area}` : ""}</div>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex overflow-x-auto border-b border-border/60 bg-card/40 px-3 py-2 md:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}