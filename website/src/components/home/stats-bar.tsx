import { formatUSD, formatUSDCompact } from "@/lib/utils";

interface StatsBarProps {
  stats: {
    total: number;
    categories: number;
    platforms: number;
    totalFinancialImpact: number;
    nearMissCount: number;
    totalAvertedDamage: number;
    totalCompositeDamage: number;
  };
}

interface StatItemProps {
  value: string;
  label: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a single stat item with a large numeric value and a label.
 * - INPUTS: value (formatted string), label (display string)
 * - OUTPUTS: A div with value in muted color and label in muted text
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: value is always displayed above label
 */
function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center py-5 px-4">
      <span
        className="font-[family-name:var(--font-display)] text-[var(--text-secondary)] text-3xl mb-1"
      >
        {value}
      </span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

/**
 * CONTRACT:
 * - WHAT: Server component rendering the aggregate stats section.
 *   Leads with a prominent damage callout contrasting confirmed losses vs.
 *   probability-weighted estimated exposure, then the 4-column detail grid.
 * - INPUTS: stats object with total, categories, platforms, totalFinancialImpact,
 *   nearMissCount, totalAvertedDamage, totalCompositeDamage
 * - OUTPUTS: Section with damage callout + 4-column stat grid
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Damage callout always renders above the stat grid
 *   - Financial impact uses formatUSD; composite uses formatUSDCompact
 *   - All values are non-negative integers or sums
 */
export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section
      aria-label="Incident statistics"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Damage callout: the contrast IS the story ── */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-0 py-8 border-b border-[var(--border-subtle)]">

          {/* Confirmed losses — intentionally muted */}
          <div className="flex flex-col items-center sm:items-end text-center sm:text-right px-6">
            <span className="font-[family-name:var(--font-display)] text-[var(--text-secondary)] text-4xl sm:text-5xl leading-none mb-2">
              {formatUSD(stats.totalFinancialImpact)}
            </span>
            <span className="text-sm text-[var(--text-muted)] max-w-[16rem]">
              confirmed financial losses across {stats.total} incidents
            </span>
          </div>

          {/* Separator */}
          <div
            aria-hidden="true"
            className="hidden sm:flex flex-col items-center gap-2 px-8"
          >
            <div className="h-12 w-px bg-[var(--border-visible)]" />
            <span className="text-xs font-[family-name:var(--font-display)] text-[var(--text-muted)] tracking-widest uppercase">
              vs
            </span>
            <div className="h-12 w-px bg-[var(--border-visible)]" />
          </div>
          <div aria-hidden="true" className="sm:hidden flex items-center gap-3 my-4 px-6">
            <div className="flex-1 h-px bg-[var(--border-visible)]" />
            <span className="text-xs font-[family-name:var(--font-display)] text-[var(--text-muted)] tracking-widest uppercase">vs</span>
            <div className="flex-1 h-px bg-[var(--border-visible)]" />
          </div>

          {/* Estimated exposure — alarming, prominent */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-6">
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-display)] text-[var(--accent)] text-4xl sm:text-5xl leading-none mb-2">
                ~{formatUSDCompact(stats.totalCompositeDamage)}
              </span>
              <span className="text-[var(--accent)] text-xl leading-none mb-2" aria-hidden="true">★</span>
            </div>
            <span className="text-sm text-[var(--text-muted)] max-w-[20rem]">
              probability-weighted estimated exposure —{" "}
              {stats.nearMissCount} incidents where full damage was averted
            </span>
            <span className="text-xs text-[var(--text-muted)] max-w-[20rem] mt-1 italic">
              ★ Estimated using industry benchmarks weighted by exploitation probability.
            </span>
          </div>
        </div>

        {/* ── Detail stat grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--border-subtle)]">
          <StatItem
            value={String(stats.total)}
            label="Incidents Analyzed"
          />
          <StatItem
            value={formatUSD(stats.totalFinancialImpact)}
            label="Documented Direct Loss"
          />
          <StatItem
            value={`~${formatUSDCompact(stats.totalAvertedDamage)} ★`}
            label="Estimated Damage Averted"
          />
          <StatItem
            value={String(stats.platforms)}
            label="Platforms Covered"
          />
        </div>
      </div>
    </section>
  );
}
