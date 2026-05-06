import { formatUSD } from "@/lib/utils";

interface StatsBarProps {
  stats: {
    total: number;
    categories: number;
    platforms: number;
    totalFinancialImpact: number;
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
 * - OUTPUTS: A div with value in accent color and label in muted text
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: value is always displayed above label
 */
function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      <span
        className="font-[family-name:var(--font-bricolage)] text-[var(--accent)] text-4xl mb-1"
      >
        {value}
      </span>
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

/**
 * CONTRACT:
 * - WHAT: Server component rendering the aggregate stats bar across all incidents.
 * - INPUTS: stats object with total, categories, platforms, totalFinancialImpact
 * - OUTPUTS: A 4-column (2x2 on mobile) grid of stat cards
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Always renders exactly 4 stat items
 *   - Financial impact uses formatUSD (returns "Unknown" for null, never null here)
 */
export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section
      aria-label="Incident statistics"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[var(--border-subtle)]">
          <StatItem
            value={String(stats.total)}
            label="Incidents Analyzed"
          />
          <StatItem
            value={formatUSD(stats.totalFinancialImpact)}
            label="Total Loss Documented"
          />
          <StatItem
            value={String(stats.categories)}
            label="Categories Tracked"
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
