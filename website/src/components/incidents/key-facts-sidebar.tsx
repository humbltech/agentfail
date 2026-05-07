import type { Incident, VendorResponse } from "@/lib/content/types";
import { formatUSD, formatUSDCompact } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";

const VENDOR_RESPONSE_LABELS: Record<VendorResponse, string> = {
  none: "No response",
  acknowledged: "Acknowledged",
  fixed: "Fixed",
  refund_issued: "Refund issued",
  disputed: "Disputed",
  disputed_then_refund_issued: "Disputed, then refunded",
} satisfies Record<VendorResponse, string>;

const VENDOR_RESPONSE_DOT_COLORS: Record<VendorResponse, string> = {
  none: "var(--severity-critical)",
  acknowledged: "var(--severity-medium)",
  fixed: "var(--severity-low)",
  refund_issued: "var(--severity-low)",
  disputed: "var(--severity-high)",
  disputed_then_refund_issued: "var(--severity-medium)",
} satisfies Record<VendorResponse, string>;

interface FactRowProps {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
  mono?: boolean;
}

/** Renders a single label/value pair. */
function FactRow({ label, value, valueStyle, mono }: FactRowProps) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div
        className={mono ? "font-mono" : undefined}
        style={{
          fontSize: mono ? "15px" : "14px",
          color: "var(--text-primary)",
          fontWeight: 500,
          ...valueStyle,
        }}
      >
        {value}
      </div>
    </div>
  );
}

interface KeyFactsSidebarProps {
  incident: Incident;
}

/**
 * CONTRACT:
 * - WHAT: Sticky sidebar showing key quantitative facts in a 2-column grid.
 *   Includes an averted damage row (full-width, accent-tinted) when the
 *   incident has a non-null averted_damage_usd estimate.
 * - INPUTS: Incident (full type)
 * - OUTPUTS: A sticky aside with Key Facts section; layout is stable regardless
 *   of whether averted damage is present.
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Averted damage row only renders when averted_damage_usd is non-null.
 *   All other rows always render.
 */
export function KeyFactsSidebar({ incident }: KeyFactsSidebarProps) {
  const vendorLabel = VENDOR_RESPONSE_LABELS[incident.vendor_response];
  const vendorDotColor = VENDOR_RESPONSE_DOT_COLORS[incident.vendor_response];

  const recoveryValue =
    incident.full_recovery_achieved === "yes"
      ? incident.recovery_time
      : incident.full_recovery_achieved === "partial"
        ? `${incident.recovery_time} (partial)`
        : incident.full_recovery_achieved === "no"
          ? "No full recovery"
          : incident.recovery_time || "Unknown";

  const recoveryValueStyle: React.CSSProperties =
    incident.full_recovery_achieved === "no"
      ? { color: "var(--severity-critical)" }
      : {};

  const publicAttentionLabels: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    viral: "Viral",
  };

  const containmentLabels: Record<string, string> = {
    manual_discovery: "Manual discovery",
    usage_limit: "Usage limit hit",
    automatic_guardrail: "Automatic guardrail",
    third_party: "Third party",
    none: "None",
    extra_usage_pool_exhausted: "Usage pool exhausted",
  };

  const avertedDamage = incident.damage_estimate?.averted_damage_usd ?? null;
  const avertedConfidence = incident.damage_estimate?.confidence ?? "";

  return (
    <aside
      style={{
        position: "sticky",
        top: "80px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "16px",
        }}
      >
        Key Facts
      </div>

      {/* 2-column grid of fact rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {/* Row 1: Financial Impact | Damage Speed */}
        <FactRow
          label="Financial Impact"
          value={formatUSD(incident.financial_impact_usd)}
          mono
        />
        <FactRow
          label="Damage Speed"
          value={incident.damage_speed || "Unknown"}
        />

        {/* Averted Damage row — full width, only when present */}
        {avertedDamage !== null && (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-visible)",
              borderRadius: "4px",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "3px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Averted Damage
              {avertedConfidence !== "cited" && avertedConfidence !== "" && (
                <ConfidenceBadge confidence={avertedConfidence} />
              )}
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--accent)",
              }}
            >
              {formatUSDCompact(avertedDamage)}
            </div>
          </div>
        )}

        {/* Row 2: Damage Window | Recovery */}
        <FactRow
          label="Total Damage Window"
          value={incident.total_damage_window || "Unknown"}
        />
        <FactRow
          label="Recovery"
          value={recoveryValue}
          valueStyle={recoveryValueStyle}
        />

        {/* Row 3: Vendor Response | Containment */}
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "2px",
            }}
          >
            Vendor Response
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "var(--text-primary)",
              fontWeight: 500,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: vendorDotColor,
                flexShrink: 0,
              }}
            />
            {vendorLabel}
          </div>
        </div>
        <FactRow
          label="Containment"
          value={
            containmentLabels[incident.containment_method] ??
            incident.containment_method
          }
        />

        {/* Row 4: Public Attention (full width) */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FactRow
            label="Public Attention"
            value={
              publicAttentionLabels[incident.public_attention] ??
              incident.public_attention
            }
          />
        </div>
      </div>
    </aside>
  );
}
