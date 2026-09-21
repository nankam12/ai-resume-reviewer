const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const navItems = [
  { href: "#analyzer", label: "Analyzer" },
  { href: "#preview", label: "Review" },
];

export function SiteHeader() {
  return (
    <header id="top" className="sticky top-0 z-20 border-b border-line bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 sm:px-8">
        <a href="#top" className={`flex items-center gap-3 ${focusRing} rounded-md`}>
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent font-mono text-xs font-medium tracking-tight text-accent-foreground">
            RL
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              ResumeLens
            </span>
            <span className="block text-xs text-muted">AI Resume Reviewer</span>
          </span>
        </a>

        <nav aria-label="Page" className="flex items-center gap-5 text-sm">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-muted transition-colors hover:text-foreground ${focusRing} rounded-sm`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <p className="rounded-full border border-line bg-card px-3 py-1 text-xs text-muted sm:ml-auto">
          Built for job seekers
        </p>
      </div>
    </header>
  );
}
