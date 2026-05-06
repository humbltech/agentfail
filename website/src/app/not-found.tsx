import Link from "next/link";

/**
 * CONTRACT:
 * - WHAT: Styled 404 page rendered when Next.js cannot match a route.
 * - INPUTS: None (rendered automatically by Next.js on 404)
 * - OUTPUTS: Centered layout with 404 display number, heading, description, and nav links
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Always renders; links back to home and /incidents
 */
export default function NotFound() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center text-center min-h-[60vh]">
      {/* 404 display number */}
      <p
        className="text-6xl text-[var(--accent)] mb-4 font-[family-name:var(--font-display)]"
        aria-hidden="true"
      >
        404
      </p>

      {/* Heading */}
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
        Page not found
      </h1>

      {/* Description */}
      <p className="text-base text-[var(--text-secondary)] max-w-sm mb-10 leading-relaxed">
        The incident you&rsquo;re looking for doesn&rsquo;t exist or may have been removed.
      </p>

      {/* Navigation links */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-sm bg-[var(--accent)] text-[var(--bg-deep)] text-sm font-medium hover:bg-[var(--accent-bright)] transition-colors duration-150"
        >
          Back to home
        </Link>
        <Link
          href="/incidents"
          className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-sm border border-[var(--border-visible)] bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-150"
        >
          Browse incidents
        </Link>
      </div>
    </main>
  );
}
