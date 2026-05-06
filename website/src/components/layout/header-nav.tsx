"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Incidents", href: "/incidents" },
  { label: "Patterns", href: "/patterns" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
] as const;

interface HeaderNavProps {
  onLinkClick?: () => void;
  /** When true, renders links stacked vertically (used in mobile sheet) */
  vertical?: boolean;
}

/**
 * CONTRACT:
 * - WHAT: Renders navigation links with active-path highlighting.
 * - INPUTS: optional onLinkClick callback (used by mobile sheet to close on navigate),
 *           optional vertical flag for stacked mobile layout
 * - OUTPUTS: <nav> with links; active link has teal accent
 * - ERRORS: None
 * - SIDE EFFECTS: Calls onLinkClick when provided and a link is clicked
 * - INVARIANTS: Active link always has aria-current="page"
 */
export function HeaderNav({ onLinkClick, vertical = false }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <ul
        className={cn(
          "list-none m-0 p-0",
          vertical ? "flex flex-col gap-2" : "flex items-center gap-6"
        )}
      >
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={onLinkClick}
                className={cn(
                  "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm",
                  vertical
                    ? cn(
                        "block text-base py-2 px-3 rounded-[4px]",
                        isActive
                          ? "text-[var(--accent)] bg-[var(--bg-raised)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                      )
                    : cn(
                        "text-sm pb-0.5 border-b-2",
                        isActive
                          ? "text-[var(--text-primary)] border-[var(--accent)]"
                          : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                      )
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { NAV_LINKS };
