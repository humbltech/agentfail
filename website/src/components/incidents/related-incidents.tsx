import Link from "next/link";
import type { IncidentCard } from "@/lib/content/types";
import { SeverityBadge } from "@/components/incidents/severity-badge";
import { formatDate } from "@/lib/utils";

interface RelatedIncidentsProps {
  incidentIds: string[];
  allCards: IncidentCard[];
}

/**
 * CONTRACT:
 * - WHAT: Renders compact cards for incidents related to the current one.
 * - INPUTS: incidentIds (IDs to look up), allCards (the full published card list)
 * - OUTPUTS: A 3-col grid of compact incident link cards; nothing if no matches
 * - ERRORS: None — missing IDs are silently skipped (graceful degradation)
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Only shows cards whose IDs are present in allCards
 *   - Each card links to /incidents/{slug}
 *   - Returns null when no matching cards are found
 */
export function RelatedIncidents({
  incidentIds,
  allCards,
}: RelatedIncidentsProps) {
  const cards = incidentIds
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is IncidentCard => c !== undefined);

  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="related-incidents-heading">
      <h2
        id="related-incidents-heading"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          color: "var(--text-primary)",
          marginBottom: "16px",
          fontWeight: 600,
        }}
      >
        Related Incidents
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.id}
            href={`/incidents/${card.slug}`}
            className="incident-related-card"
            style={{
              display: "block",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "16px",
              textDecoration: "none",
            }}
          >
            {/* Top row: severity + ID */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                gap: "8px",
              }}
            >
              <SeverityBadge severity={card.severity} />
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                }}
              >
                {card.id}
              </span>
            </div>

            {/* Title */}
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: "1.35",
                margin: "0 0 6px 0",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {card.title}
            </p>

            {/* Date */}
            <span
              style={{ fontSize: "12px", color: "var(--text-muted)" }}
            >
              {formatDate(card.date_occurred)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
