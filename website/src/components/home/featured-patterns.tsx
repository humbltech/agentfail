import Link from "next/link";
import type { PatternGroup } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface FeaturedPatternsProps {
  patterns: PatternGroup[];
}

/**
 * CONTRACT:
 * - WHAT: Server component rendering the featured incident patterns section.
 * - INPUTS: patterns array (PatternGroup[])
 * - OUTPUTS: Section with editorial header and a 2-column grid of pattern cards
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Each pattern card links to /patterns/{pattern.slug}
 *   - incidentIds.length is displayed as the incident count
 *   - Section renders nothing meaningful if patterns is empty (grid is empty)
 */
export function FeaturedPatterns({ patterns }: FeaturedPatternsProps) {
  return (
    <section
      className="py-16 border-t border-[var(--border-subtle)]"
      aria-labelledby="patterns-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8">
          <h2
            id="patterns-heading"
            className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2"
          >
            Incident Patterns
          </h2>
          <p className="text-[var(--text-secondary)]">
            These aren&apos;t isolated failures. They cluster.
          </p>
        </div>

        {/* Pattern cards — 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <Link
              key={pattern.slug}
              href={`/patterns/${pattern.slug}`}
              className={cn(
                "group block rounded-[6px] border transition-all duration-150",
                "border-[var(--border-subtle)] bg-[var(--bg-surface)]",
                "hover:border-[var(--border-visible)] hover:bg-[var(--bg-raised)] hover:-translate-y-px",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
              )}
              style={{ padding: "24px" }}
            >
              {/* Pattern name + count */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                  {pattern.name}
                </h3>
                <span
                  className="text-sm text-[var(--text-muted)] shrink-0"
                >
                  {pattern.incidentIds.length}{" "}
                  {pattern.incidentIds.length === 1 ? "incident" : "incidents"}
                </span>
              </div>

              {/* Description */}
              {pattern.description && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {pattern.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
