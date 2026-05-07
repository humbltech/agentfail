import type { DamageConfidence } from "@/lib/content/types";

interface ConfidenceBadgeProps {
  confidence: DamageConfidence;
  /** When true, renders the label text alongside the star badge. */
  showLabel?: boolean;
}

const CONFIDENCE_LABELS: Record<DamageConfidence, string> = {
  cited: "Cited",
  calculated: "Calculated",
  estimated: "Estimated",
  "order-of-magnitude": "Order of magnitude",
  "": "",
} satisfies Record<DamageConfidence, string>;

/**
 * CONTRACT:
 * - WHAT: Renders a visual confidence indicator for a damage estimate.
 *   cited → no badge; calculated → (i) icon; estimated → ★; order-of-magnitude → ★★
 * - INPUTS: confidence level (DamageConfidence union); optional showLabel flag
 * - OUTPUTS: A span with aria-label describing the confidence level
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - "cited" renders nothing (empty span) — direct sourcing needs no qualification
 *   - "estimated" and "order-of-magnitude" always render a star character in accent color
 */
export function ConfidenceBadge({ confidence, showLabel = false }: ConfidenceBadgeProps) {
  if (!confidence || confidence === "cited") {
    return null;
  }

  const label = CONFIDENCE_LABELS[confidence];

  if (confidence === "calculated") {
    return (
      <span
        aria-label={`Confidence: ${label}`}
        title={label}
        className="inline-flex items-center gap-1"
        style={{ color: "var(--text-muted)", fontSize: "inherit" }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: "1px solid var(--border-visible)",
            fontSize: "9px",
            lineHeight: 1,
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          i
        </span>
        {showLabel && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</span>
        )}
      </span>
    );
  }

  if (confidence === "estimated") {
    return (
      <span
        aria-label={`Confidence: ${label}`}
        title={label}
        className="inline-flex items-center gap-1"
      >
        <span
          aria-hidden="true"
          style={{ color: "var(--accent)", fontSize: "inherit" }}
        >
          ★
        </span>
        {showLabel && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</span>
        )}
      </span>
    );
  }

  // order-of-magnitude
  return (
    <span
      aria-label={`Confidence: ${label}`}
      title={label}
      className="inline-flex items-center gap-1"
    >
      <span
        aria-hidden="true"
        style={{ color: "var(--accent)", fontSize: "inherit" }}
      >
        ★★
      </span>
      {showLabel && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</span>
      )}
    </span>
  );
}
