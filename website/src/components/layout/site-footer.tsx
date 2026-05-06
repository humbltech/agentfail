import Link from "next/link";

/**
 * CONTRACT:
 * - WHAT: Server component rendering the site-wide footer.
 * - INPUTS: None
 * - OUTPUTS: <footer> with wordmark, description, nav links, and copyright
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: All text uses --text-muted; external GitHub link opens in new tab
 */
export function SiteFooter() {
  return (
    <footer
      className="border-t border-[var(--border-subtle)]"
      style={{ backgroundColor: "var(--bg-deep)" }}
    >
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 text-center"
        style={{ padding: "48px 1rem" }}
      >
        {/* Wordmark */}
        <span
          className="text-[var(--text-muted)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
          }}
        >
          AgentFail
        </span>

        {/* Tagline */}
        <p className="text-[var(--text-muted)] text-sm m-0">
          A curated database of real-world AI agent incidents.
        </p>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 list-none m-0 p-0 text-sm text-[var(--text-muted)]">
            <li>
              <Link
                href="/incidents"
                className="hover:text-[var(--text-secondary)] transition-colors duration-150"
              >
                Incidents
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <Link
                href="/patterns"
                className="hover:text-[var(--text-secondary)] transition-colors duration-150"
              >
                Patterns
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <Link
                href="/categories"
                className="hover:text-[var(--text-secondary)] transition-colors duration-150"
              >
                Categories
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <Link
                href="/about"
                className="hover:text-[var(--text-secondary)] transition-colors duration-150"
              >
                About
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <a
                href="https://github.com/agentfail/agentfail"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-secondary)] transition-colors duration-150"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-[var(--text-muted)] text-sm m-0">
          © 2026 AgentFail. Data is CC BY 4.0.
        </p>
      </div>
    </footer>
  );
}
