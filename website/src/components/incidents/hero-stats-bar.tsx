import type { Incident, VendorResponse } from "@/lib/content/types";
import { formatUSD } from "@/lib/utils";

const VENDOR_RESPONSE_LABELS: Record<VendorResponse, string> = {
  none: "No response",
  acknowledged: "Acknowledged",
  fixed: "Fixed",
  refund_issued: "Refund issued",
  disputed: "Disputed",
  disputed_then_refund_issued: "Disputed, then refunded",
};

const VENDOR_RESPONSE_DOT_COLORS: Record<VendorResponse, string> = {
  none: "var(--severity-critical)",
  acknowledged: "var(--severity-medium)",
  fixed: "var(--severity-low)",
  refund_issued: "var(--severity-low)",
  disputed: "var(--severity-high)",
  disputed_then_refund_issued: "var(--severity-medium)",
};

const PUBLIC_ATTENTION_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  viral: "Viral",
};

interface StatCardProps {
  label: string;
  value: string;
  mono?: boolean;
  dot?: { color: string };
  valueColor?: string;
}

/** Single stat card in the hero bar. */
function StatCard({ label, value, mono, dot, valueColor }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "calc(var(--radius) * 0.6)",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
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
          fontSize: "16px",
          fontWeight: 600,
          color: valueColor || "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {dot && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: dot.color,
              flexShrink: 0,
            }}
          />
        )}
        {value}
      </div>
    </div>
  );
}

interface HeroStatsBarProps {
  incident: Incident;
}

/** Responsive grid of 5 key stats displayed below the header. */
export function HeroStatsBar({ incident }: HeroStatsBarProps) {
  const recoveryValue =
    incident.full_recovery_achieved === "yes"
      ? incident.recovery_time
      : incident.full_recovery_achieved === "partial"
        ? `${incident.recovery_time} (partial)`
        : incident.full_recovery_achieved === "no"
          ? "No full recovery"
          : incident.recovery_time || "Unknown";

  const recoveryColor =
    incident.full_recovery_achieved === "no"
      ? "var(--severity-critical)"
      : undefined;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px",
      }}
    >
      <StatCard
        label="Financial Impact"
        value={formatUSD(incident.financial_impact_usd)}
        mono
      />
      <StatCard
        label="Damage Speed"
        value={incident.damage_speed || "Unknown"}
      />
      <StatCard
        label="Recovery"
        value={recoveryValue}
        valueColor={recoveryColor}
      />
      <StatCard
        label="Vendor Response"
        value={VENDOR_RESPONSE_LABELS[incident.vendor_response]}
        dot={{ color: VENDOR_RESPONSE_DOT_COLORS[incident.vendor_response] }}
      />
      <StatCard
        label="Public Attention"
        value={
          PUBLIC_ATTENTION_LABELS[incident.public_attention] ??
          incident.public_attention
        }
      />
    </div>
  );
}
