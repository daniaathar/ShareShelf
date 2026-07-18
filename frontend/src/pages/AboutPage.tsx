export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-xs font-medium uppercase tracking-wider text-primary">About</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Why ShareShelf</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        We believe most of what you need is already owned by someone on your street.
        ShareShelf makes it effortless to borrow, lend, and earn — turning idle stuff
        into a shared community shelf.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-semibold">Our mission</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Reduce waste by helping people rent instead of buy things they use once.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-semibold">Built on trust</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified profiles, secure deposits, and honest reviews on every rental.
          </p>
        </div>
      </div>
    </div>
  );
}