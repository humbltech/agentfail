import { formatUSDCompact } from "@/lib/utils";
import { StarTooltip } from "@/components/shared/star-tooltip";

interface StatsBarProps {
  stats: {
    total: number;
    categories: number;
    platforms: number;
    totalFinancialImpact: number;
    nearMissCount: number;
    totalAvertedDamage: number;
    totalCompositeDamage: number;
    incidentsThisYear: number;
    incidentsLastYear: number;
    nearMissThisYear: number;
    compositeDamageThisYear: number;
    earliestYear: number;
  };
}

interface StatItemProps {
  value: string;
  label: string;
  sub?: React.ReactNode;
}

/**
 * CONTRACT:
 * - WHAT: Renders a single plain stat item: large value, label, optional sub-note.
 * - INPUTS: value (formatted string), label, optional sub (ReactNode for styled content)
 * - OUTPUTS: A centred div
 * - INVARIANTS: value always above label; sub (if present) below label in muted text
 */
function StatItem({ value, label, sub }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      <span className="font-[family-name:var(--font-display)] text-[var(--text-secondary)] text-3xl mb-1">
        {value}
      </span>
      <span className="text-xs text-[var(--text-muted)] mb-1">{label}</span>
      {sub && (
        <span className="text-[11px] text-[var(--text-muted)]">{sub}</span>
      )}
    </div>
  );
}

/**
 * CONTRACT:
 * - WHAT: Server component rendering the aggregate stats bar — 4-column grid.
 *   Each plain stat has a "X in [year]" sub-note. The hero damage cell shows
 *   the cumulative composite figure with "since [earliestYear]" in the label
 *   and an interactive ★ tooltip for methodology. YoY delta lives on the
 *   Incidents card where it belongs.
 * - INPUTS: stats from getStats()
 * - OUTPUTS: A <section> with a 4-column stat grid
 * - INVARIANTS:
 *   - YoY arrow only renders when incidentsLastYear > 0 and delta !== 0
 *   - "since [year]" label only differs from "Estimated Damage Averted" when
 *     earliestYear < currentYear
 *   - StarTooltip is a client component; StatsBar stays server-rendered
 */
export function StatsBar({ stats }: StatsBarProps) {
  const currentYear = new Date().getFullYear();
  const delta = stats.incidentsThisYear - stats.incidentsLastYear;
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : null;
  const absDelta = Math.abs(delta);

  const incidentsSub = (
    <>
      <span style={{ color: "var(--text-secondary)" }}>{stats.incidentsThisYear}</span>
      {" in "}{currentYear}
      {stats.incidentsLastYear > 0 && arrow !== null && (
        <>
          {" · "}
          <span
            style={{
              color: delta > 0 ? "var(--accent)" : "var(--severity-low, #4ade80)",
              fontWeight: 600,
            }}
          >
            {arrow}{absDelta}
          </span>
          {" vs "}{currentYear - 1}
        </>
      )}
    </>
  );

  const nearMissSub = (
    <>
      <span style={{ color: "var(--text-secondary)" }}>{stats.nearMissThisYear}</span>
      {" in "}{currentYear}
    </>
  );

  const sinceYear = stats.earliestYear < currentYear ? stats.earliestYear : null;

  return (
    <section
      aria-label="Incident statistics"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--border-subtle)]">

          {/* ── Col 1: Incidents Analyzed (with YoY) ─────────────────── */}
          <StatItem
            value={String(stats.total)}
            label="Incidents Analyzed"
            sub={incidentsSub}
          />

          {/* ── Col 2: Hero — Estimated Damage Averted ────────────────── */}
          <div
            className="flex flex-col items-center text-center py-6 px-4"
            style={{
              background: "var(--accent-dim)",
              borderTop: "2px solid var(--accent)",
              marginTop: "-1px",
            }}
          >
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="font-[family-name:var(--font-display)] text-[var(--accent)] text-3xl leading-none">
                ~{formatUSDCompact(stats.totalCompositeDamage)}
              </span>
              <StarTooltip nearMissCount={stats.nearMissCount} />
            </div>
            <span className="text-xs text-[var(--text-muted)] mb-1">
              Estimated Damage Averted
              {sinceYear !== null && (
                <> since {sinceYear}</>
              )}
            </span>
            {stats.compositeDamageThisYear > 0 && (
              <span className="text-[11px] text-[var(--text-muted)]">
                <span style={{ color: "var(--text-secondary)" }}>
                  ~{formatUSDCompact(stats.compositeDamageThisYear)}
                </span>
                {" in "}{currentYear}
              </span>
            )}
          </div>

          {/* ── Col 3: Near-Miss Incidents ────────────────────────────── */}
          <StatItem
            value={String(stats.nearMissCount)}
            label="Near-Miss Incidents"
            sub={nearMissSub}
          />

          {/* ── Col 4: Platforms Covered ──────────────────────────────── */}
          <StatItem
            value={String(stats.platforms)}
            label="Platforms Covered"
          />

        </div>
      </div>
    </section>
  );
}
