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
    earliestYear: number;
  };
}

interface StatItemProps {
  value: string;
  label: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a single plain stat item: large value + small label.
 * - INPUTS: value (formatted string), label (display string)
 * - OUTPUTS: A centred div with the value prominent and label muted
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: value is always displayed above label
 */
function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      <span className="font-[family-name:var(--font-display)] text-[var(--text-secondary)] text-3xl mb-1">
        {value}
      </span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

/**
 * CONTRACT:
 * - WHAT: Server component rendering the aggregate stats bar — a single-row grid
 *   of four stat cells. The "Estimated Damage" cell is the visual hero: accent-
 *   tinted background, composite figure prominent, confirmed losses shown as a
 *   sub-note, and an interactive ★ that reveals methodology on hover/tap.
 * - INPUTS: stats object with total, categories, platforms, totalFinancialImpact,
 *   nearMissCount, totalAvertedDamage, totalCompositeDamage
 * - OUTPUTS: A <section> with a 4-column stat grid
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Hero cell always renders in the second column position
 *   - StarTooltip is a client component; StatsBar stays server-rendered
 *   - Direct loss sub-note only renders when totalFinancialImpact > 0
 */
export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section
      aria-label="Incident statistics"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--border-subtle)]">

          {/* ── Col 1: Incidents Analyzed ─────────────────────────────── */}
          <StatItem
            value={String(stats.total)}
            label="Incidents Analyzed"
          />

          {/* ── Col 2: Hero — Estimated Damage ────────────────────────── */}
          <div
            className="flex flex-col items-center text-center py-6 px-4"
            style={{
              background: "var(--accent-dim)",
              borderTop: "2px solid var(--accent)",
              marginTop: "-1px",
            }}
          >
            {/* Main figure + star */}
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="font-[family-name:var(--font-display)] text-[var(--accent)] text-3xl leading-none">
                ~{formatUSDCompact(stats.totalCompositeDamage)}
              </span>
              <StarTooltip nearMissCount={stats.nearMissCount} />
            </div>

            {/* Label */}
            <span className="text-xs text-[var(--text-muted)] mb-1.5">
              Estimated Damage Averted
            </span>

            {/* Year-over-year comparison sub-note */}
            {(() => {
              const currentYear = new Date().getFullYear();
              const delta = stats.incidentsThisYear - stats.incidentsLastYear;
              const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : null;
              const absDelta = Math.abs(delta);
              return (
                <span className="text-[11px] text-[var(--text-muted)]">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {stats.incidentsThisYear}
                  </span>
                  {" incidents in "}{currentYear}
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
                </span>
              );
            })()}
          </div>

          {/* ── Col 3: Near-Miss Incidents ────────────────────────────── */}
          <StatItem
            value={String(stats.nearMissCount)}
            label="Near-Miss Incidents"
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
