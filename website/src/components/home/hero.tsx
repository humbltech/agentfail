import Link from "next/link";

/**
 * CONTRACT:
 * - WHAT: Server component rendering the homepage hero section.
 * - INPUTS: None
 * - OUTPUTS: A full-width hero with headline, subtext, and two CTA buttons.
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Primary CTA links to /incidents
 *   - Secondary CTA links to /patterns
 *   - No JavaScript shipped (pure Server Component)
 */
export function Hero() {
  return (
    <section
      className="py-16 sm:py-24"
      aria-labelledby="hero-headline"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1
          id="hero-headline"
          className={[
            "font-[family-name:var(--font-display)]",
            "text-4xl sm:text-5xl lg:text-6xl",
            "text-[var(--text-primary)]",
            "leading-tight",
            "mb-6",
          ].join(" ")}
        >
          When AI Agents Fail
        </h1>

        <p
          className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl"
        >
          Root cause analysis of real-world AI agent incidents. Not what could
          go wrong — what already did.
        </p>

        <div className="flex flex-wrap gap-4">
          {/* Primary CTA */}
          <Link
            href="/incidents"
            className={[
              "inline-flex items-center justify-center",
              "rounded-sm font-semibold text-white",
              "bg-[var(--accent)] hover:bg-[var(--accent-bright)]",
              "transition-colors duration-150",
              "min-h-[44px] px-6",
            ].join(" ")}
          >
            Browse Incidents →
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/patterns"
            className={[
              "inline-flex items-center justify-center",
              "rounded-sm font-semibold",
              "border border-[var(--border-visible)]",
              "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              "hover:border-[var(--border-visible)]",
              "transition-colors duration-150",
              "min-h-[44px] px-6",
            ].join(" ")}
          >
            View Patterns →
          </Link>
        </div>
      </div>
    </section>
  );
}
