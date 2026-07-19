import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Drill,
  Search,
  Sparkles,
  Tent,
  Wrench,
  ShieldCheck,
  Zap,
  HandCoins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const categories = [
  { icon: Drill, name: "Tools" },
  { icon: Tent, name: "Camping" },
  { icon: Camera, name: "Cameras" },
  { icon: Wrench, name: "Home & Garden" },
  { icon: Sparkles, name: "Party" },
  { icon: HandCoins, name: "Kids" },
];

const featured = [
  {
    title: "Cordless drill kit",
    price: 1500,
    city: "Lahore, Pakistan",
    img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "4-person camping tent",
    price: 2200,
    city: "Karachi, Pakistan",
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Sony A7 III camera",
    price: 2300,
    city: "Faisalabad, Pakistan",
    img: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Party sound system",
    price: 1800,
    city: "Islamabad, Pakistan",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60",
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const handleListItem = () => {
    if (isAuthenticated) {
      navigate("/dashboard/listings/new");
    } else {
      navigate("/register");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (query) {
      navigate(`/browse?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/browse");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[image:var(--gradient-subtle)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              New — 10,000+ items available in your city
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Rent anything, from{" "}
              <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
                the people next door
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              ShareShelf is a peer-to-peer marketplace for tools, gear, and
              everyday items. Skip the store — borrow it from a neighbor.
            </p>

            {/* WORKING SEARCH BAR */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-[var(--shadow-elegant)]"
            >
              <div className="flex flex-1 items-center gap-2 pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />

                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try 'drill', 'camping tent', 'projector'…"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>

              <Button
                type="submit"
                className="rounded-full bg-[image:var(--gradient-hero)] px-6 text-primary-foreground"
              >
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {[
                "Drill",
                "Projector",
                "Stroller",
                "Pressure washer",
                "Party lights",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Browse" title="Popular categories" />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((c, i) => (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                <c.icon className="h-5 w-5" />
              </span>

              <span className="text-sm font-medium">{c.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <SectionHeader eyebrow="Featured" title="Items people are loving" />

          <Link
            to="/browse"
            className="hidden text-sm font-medium text-primary hover:underline sm:block"
          >
            View all <ArrowRight className="inline h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={f.img}
                  alt={f.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <div className="text-sm font-semibold">{f.title}</div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {f.city}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-lg font-semibold">
                    PKR {f.price}
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      / day
                    </span>
                  </span>

                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Available
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps to rent (or earn)"
          center
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Find it nearby",
              desc: "Search for the item you need in your city and neighborhood.",
            },
            {
              icon: ShieldCheck,
              title: "Book with trust",
              desc: "Verified profiles, secure deposits, and transparent reviews.",
            },
            {
              icon: Zap,
              title: "Pick up & go",
              desc: "Coordinate pickup with the owner — usually the same day.",
            },
          ].map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-3xl border border-border bg-card p-8"
            >
              <div className="absolute -top-4 left-8 grid h-8 w-8 place-items-center rounded-full bg-[image:var(--gradient-hero)] text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)]">
                {i + 1}
              </div>

              <s.icon className="h-6 w-6 text-primary" />

              <div className="mt-4 text-lg font-semibold">{s.title}</div>

              <p className="mt-2 text-sm text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] p-10 text-primary-foreground sm:p-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-semibold sm:text-3xl">
                Turn your shelf into income
              </h3>

              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
                List your unused items in minutes and earn every time a
                neighbor borrows.
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleListItem}
              className="rounded-full bg-background text-foreground hover:bg-background/90"
            >
              List an item
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  center,
}: {
  eyebrow: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className="text-xs font-medium uppercase tracking-wider text-primary">
        {eyebrow}
      </div>

      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}