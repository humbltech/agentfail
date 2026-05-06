import type { Incident, VendorResponse } from "@/lib/content/types";
import { formatUSD } from "@/lib/utils";

// ─── Vendor response display ──────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FactRowProps {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
  mono?: boolean;
}

/**
 * CONTRACT:
 * - WHAT: Renders a single label/value pair with optional mono font and color overrides.
 * - INPUTS: label, value, optional valueStyle, optional mono flag
 * - OUTPUTS: A <div> pair with consistent spacing and a separator below
 * - ERRORS: None
 * - SIDE EFFECTS: None
 */
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

// ─── KeyFactsSidebar ──────────────────────────────────────────────────────────

interface KeyFactsSidebarProps {
  incident: Incident;
}

/**
 * CONTRACT:
 * - WHAT: Sticky sidebar showing key quantitative facts and framing for an incident.
 * - INPUTS: Full Incident object
 * - OUTPUTS: A styled card with fact rows, headline stat, and operator TL;DR
 * - ERRORS: None — all nullable fields have fallback rendering
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - financial_impact_usd null → "Unknown"
 *   - full_recovery_achieved "no" → red text
 *   - All values are derived from the incident object, never hardcoded
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

  return (
    <aside
      style={{
        position: "sticky",
        top: "80px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
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

      {/* Fact rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <FactRow
          label="Financial Impact"
          value={formatUSD(incident.financial_impact_usd)}
          mono
        />

        <FactRow
          label="Damage Speed"
          value={incident.damage_speed || "Unknown"}
        />

        <FactRow
          label="Total Damage Window"
          value={incident.total_damage_window || "Unknown"}
        />

        <FactRow
          label="Recovery"
          value={recoveryValue}
          valueStyle={recoveryValueStyle}
        />

        {/* Vendor response — with colored dot */}
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

        <FactRow
          label="Public Attention"
          value={
            publicAttentionLabels[incident.public_attention] ??
            incident.public_attention
          }
        />
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "var(--border-subtle)",
          margin: "20px 0",
        }}
        role="separator"
        aria-hidden="true"
      />

      {/* Headline stat */}
      {incident.headline_stat && (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Headline
          </div>
          <p
            className="font-[family-name:var(--font-bricolage)]"
            style={{
              fontSize: "18px",
              color: "var(--accent)",
              lineHeight: "1.3",
              margin: 0,
              fontWeight: 600,
            }}
          >
            {incident.headline_stat}
          </p>
        </div>
      )}

      {/* Operator TL;DR */}
      {incident.operator_tldr && (
        <div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Operator Action
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              fontStyle: "italic",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            {incident.operator_tldr}
          </p>
        </div>
      )}
    </aside>
  );
}
