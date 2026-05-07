import type { Incident } from "@/lib/content/types";
import { formatUSD, formatUSDCompact } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";

interface DamageBreakdownCardProps {
  incident: Incident;
}

interface DamageLayerProps {
  label: string;
  value: string | null;
  sub?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders one row in the damage breakdown (label + value, optional sub-label).
 * - INPUTS: label string, value (null renders "—"), optional sub text
 * - OUTPUTS: A div with label, value, and optional sub in muted text
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Null value always renders as "—"
 */
function DamageLayer({ label, value, sub }: DamageLayerProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
      <span
        className="font-mono"
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: value ? "var(--text-primary)" : "var(--text-muted)",
        }}
      >
        {value ?? "—"}
      </span>
      {sub && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</span>
      )}
    </div>
  );
}

/**
 * CONTRACT:
 * - WHAT: Renders the full damage quantification card for an incident detail page.
 *   Shows three damage layers (confirmed, recovery, averted), the composite total,
 *   confidence badge, and methodology disclosure.
 * - INPUTS: Incident (full type with damage_estimate)
 * - OUTPUTS: A visually distinct card; renders nothing if damage_estimate is null
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Returns null when damage_estimate is null
 *   - Averted damage row only renders when averted_damage_usd is non-null
 *   - Methodology section only renders when methodology string is non-empty
 *   - "cited" confidence shows no badge; "order-of-magnitude" shows ★★
 */
export function DamageBreakdownCard({ incident }: DamageBreakdownCardProps) {
  const est = incident.damage_estimate;
  if (!est) return null;

  const hasAnyValue =
    est.confirmed_loss_usd !== null ||
    est.recovery_cost_usd !== null ||
    est.averted_damage_usd !== null;

  if (!hasAnyValue) return null;

  const compositeLabel =
    est.confidence === "cited"
      ? "Documented total"
      : est.confidence === "order-of-magnitude"
        ? "Estimated exposure ★★"
        : est.confidence === "estimated"
          ? "Estimated exposure ★"
          : "Calculated total";

  return (
    <section
      aria-label="Damage quantification"
      style={{
        background: "var(--accent-dim)",
        border: "1px solid var(--border-visible)",
        borderRadius: "6px",
        padding: "24px",
        marginBottom: "36px",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "20px",
        }}
      >
        Damage Quantification
      </div>

      {/* Three-layer grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <DamageLayer
          label="Confirmed Loss"
          value={est.confirmed_loss_usd !== null ? formatUSD(est.confirmed_loss_usd) : null}
          sub="Cited from sources"
        />
        <DamageLayer
          label="Recovery Cost"
          value={est.recovery_cost_usd !== null ? formatUSD(est.recovery_cost_usd) : null}
          sub="Containment & remediation"
        />
        <div className="flex flex-col gap-0.5">
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Averted Damage{" "}
            {est.confidence !== "cited" && (
              <ConfidenceBadge confidence={est.confidence} />
            )}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: est.averted_damage_usd !== null ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {est.averted_damage_usd !== null
              ? formatUSDCompact(est.averted_damage_usd)
              : "—"}
          </span>
          {est.averted_damage_usd !== null && est.probability_weight !== null && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {Math.round(est.probability_weight * 100)}% exploitation probability
            </span>
          )}
        </div>
      </div>

      {/* Composite total */}
      {est.composite_damage_usd !== null && (
        <div
          style={{
            borderTop: "1px solid var(--border-visible)",
            paddingTop: "16px",
            marginBottom: est.methodology ? "16px" : "0",
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {compositeLabel}
          </span>
          <span
            className="font-mono font-[family-name:var(--font-display)]"
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {formatUSDCompact(est.composite_damage_usd)}
          </span>
          {(est.confidence === "order-of-magnitude" || est.confidence === "estimated") && (
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
              probability-weighted
            </span>
          )}
        </div>
      )}

      {/* Methodology disclosure */}
      {est.methodology && (
        <div
          style={{
            borderTop: "1px solid var(--border-visible)",
            paddingTop: "14px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Methodology
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>
            {est.methodology}
          </p>
          {est.methodology_detail?.benchmark_source && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Benchmark: {est.methodology_detail.benchmark_source}
            </p>
          )}
          {est.notes && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "6px 0 0 0", fontStyle: "italic" }}>
              {est.notes}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
