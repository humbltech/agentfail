import Link from "next/link";
import type { IncidentCard } from "@/lib/content/types";
import type { VendorResponse } from "@/lib/content/types";
import { SeverityBadge } from "@/components/incidents/severity-badge";
import { cn, formatDate, getCategorySlug } from "@/lib/utils";

// ─── Vendor response labels ───────────────────────────────────────────────────

const VENDOR_RESPONSE_LABELS: Record<VendorResponse, string> = {
  none: "No response",
  acknowledged: "Acknowledged",
  fixed: "Fixed",
  refund_issued: "Refund issued",
  disputed: "Disputed",
  disputed_then_refund_issued: "Disputed, then refunded",
} satisfies Record<VendorResponse, string>;

// ─── CategorySpan ─────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Renders a category name as a styled span (not a link) for use inside
 *   a card that is itself a link — avoids nested anchor elements.
 * - INPUTS: category string (full frontmatter form), optional className
 * - OUTPUTS: <span> styled as a pill showing the display name before "("
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Never renders a nested <a> element
 */
function CategorySpan({ category }: { category: string }) {
  const parenIndex = category.indexOf("(");
  const displayName =
    parenIndex !== -1 ? category.slice(0, parenIndex).trim() : category;

  // Keep slug computed to keep the value consistent with CategoryTag, even though
  // we don't use it for linking here.
  void getCategorySlug(category);

  return (
    <span
      className={cn(
        "inline-block rounded-[4px]",
        "bg-[var(--bg-overlay)] text-[var(--text-secondary)]",
      )}
      style={{ padding: "2px 8px", fontSize: "12px" }}
    >
      {displayName}
    </span>
  );
}

// ─── IncidentCard ─────────────────────────────────────────────────────────────

interface IncidentCardProps {
  incident: IncidentCard;
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders an incident summary card. The entire card is a clickable link
 *   to the incident detail page.
 * - INPUTS: incident (IncidentCard), optional className override
 * - OUTPUTS: A <Link>-wrapped card with severity, date, ID, title,
 *   headline_stat, operator_tldr, category pills, and meta row.
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Card href is always /incidents/{incident.slug}
 *   - Category tags inside the card are spans (not links) to avoid nested anchors
 *   - headline_stat is the visual anchor — largest, accent-colored text
 *   - At most 2 category pills are shown; remainder shown as "+N more"
 */
export function IncidentCard({ incident, className }: IncidentCardProps) {
  const displayedCategories = incident.category.slice(0, 2);
  const extraCount = incident.category.length - displayedCategories.length;
  const vendorLabel = VENDOR_RESPONSE_LABELS[incident.vendor_response];

  return (
    <Link
      href={`/incidents/${incident.slug}`}
      className={cn(
        "group block rounded-[6px] border transition-all duration-150",
        "border-[var(--border-subtle)] bg-[var(--bg-surface)]",
        "hover:border-[var(--border-visible)] hover:bg-[var(--bg-raised)] hover:-translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        className,
      )}
      style={{ padding: "24px" }}
    >
      {/* ── Top row: severity badge | date | incident ID ─────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <SeverityBadge severity={incident.severity} />
          <span
            className="text-[var(--text-muted)] shrink-0"
            style={{ fontSize: "12px" }}
          >
            {formatDate(incident.date_occurred)}
          </span>
        </div>
        <span
          className="text-[var(--text-muted)] font-mono shrink-0"
          style={{ fontSize: "12px" }}
        >
          {incident.id}
        </span>
      </div>

      {/* ── Title ────────────────────────────────────────────────────────── */}
      <h2
        className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2 mb-2 leading-snug"
      >
        {incident.title}
      </h2>

      {/* ── Headline stat — visual anchor ────────────────────────────────── */}
      <p
        className={cn(
          "font-[family-name:var(--font-instrument-serif)] text-[var(--accent)] mb-2",
        )}
        style={{ fontSize: "24px", lineHeight: "1.2" }}
      >
        {incident.headline_stat}
      </p>

      {/* ── Operator TL;DR ───────────────────────────────────────────────── */}
      <p
        className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4"
      >
        {incident.operator_tldr}
      </p>

      {/* ── Category pills ───────────────────────────────────────────────── */}
      {incident.category.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {displayedCategories.map((cat) => (
            <CategorySpan key={cat} category={cat} />
          ))}
          {extraCount > 0 && (
            <span
              className="inline-block rounded-[4px] bg-[var(--bg-overlay)] text-[var(--text-muted)]"
              style={{ padding: "2px 8px", fontSize: "12px" }}
            >
              +{extraCount} more
            </span>
          )}
        </div>
      )}

      {/* ── Meta row: platform | vendor response ─────────────────────────── */}
      <div
        className="flex items-center gap-4 text-[var(--text-muted)]"
        style={{ fontSize: "12px" }}
      >
        <span>
          <span className="text-[var(--text-muted)]">Platform: </span>
          {incident.platform}
        </span>
        <span>
          <span className="text-[var(--text-muted)]">Vendor: </span>
          {vendorLabel}
        </span>
      </div>
    </Link>
  );
}
