import Link from "next/link";
import type { PatternGroup } from "@/lib/content/types";
import { cn } from "@/lib/utils";

interface PatternCardProps {
  pattern: PatternGroup;
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a pattern group summary card linking to /patterns/[slug].
 * - INPUTS: pattern (PatternGroup), optional className
 * - OUTPUTS: A <Link>-wrapped card showing name, incident count, and description.
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Entire card is a link to /patterns/{pattern.slug}
 *   - Description is line-clamped to 2 lines
 *   - Incident count derived from pattern.incidentIds.length
 */
export function PatternCard({ pattern, className }: PatternCardProps) {
  const count = pattern.incidentIds.length;

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className={cn(
        "group block rounded-sm border transition-all duration-150",
        "border-[var(--border-subtle)] bg-[var(--bg-surface)]",
        "hover:border-[var(--border-visible)] hover:bg-[var(--bg-raised)] hover:-translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        "p-6",
        className,
      )}
    >
      {/* Name */}
      <h3
        className={cn(
          "text-lg font-semibold text-[var(--text-primary)] mb-1 leading-snug",
          "font-[family-name:var(--font-display)]",
        )}
      >
        {pattern.name}
      </h3>

      {/* Incident count */}
      <p className="text-sm text-[var(--text-muted)] mb-3">
        {count} {count === 1 ? "incident" : "incidents"}
      </p>

      {/* Description */}
      {pattern.description && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
          {pattern.description}
        </p>
      )}
    </Link>
  );
}
