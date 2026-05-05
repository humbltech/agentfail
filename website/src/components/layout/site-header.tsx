import Link from "next/link";
import { HeaderNav } from "./header-nav";
import { MobileNav } from "./mobile-nav";

/**
 * CONTRACT:
 * - WHAT: Server component rendering the sticky site-wide header.
 * - INPUTS: None
 * - OUTPUTS: <header> with wordmark, desktop nav, and mobile nav trigger
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Header is always 64px tall, sticky at top with z-50
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
            fontFamily: "var(--font-instrument-serif)",
            fontSize: "20px",
          }}
        >
          AgentFail
        </Link>

        {/* Desktop nav — hidden on small screens */}
        <div className="hidden md:flex">
          <HeaderNav />
        </div>

        {/* Mobile nav trigger — hidden on md+ */}
        <MobileNav />
      </div>
    </header>
  );
}
