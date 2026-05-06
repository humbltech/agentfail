import Link from "next/link";
import { HeaderNav } from "./header-nav";
import { MobileNav } from "./mobile-nav";

/**
 * CONTRACT:
 * - WHAT: Server component rendering the sticky site-wide header.
 * - INPUTS: None
 * - OUTPUTS: <header> with wordmark, desktop nav, search icon, and mobile nav trigger
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Header is always 64px tall, sticky at top with z-50;
 *               search icon links to /search route
 */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-subtle)]"
      style={{ backgroundColor: "var(--bg-deep)", height: "64px" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors duration-150"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px",
          }}
        >
          AgentFail
        </Link>

        {/* Desktop nav + search — hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
          <HeaderNav />
          <Link
            href="/search"
            aria-label="Search incidents"
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
        </div>

        {/* Mobile nav trigger — hidden on md+ */}
        <MobileNav />
      </div>
    </header>
  );
}
