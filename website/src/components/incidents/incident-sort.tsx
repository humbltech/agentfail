"use client";

/**
 * Sort dropdown for the incidents list page.
 *
 * CONTRACT:
 * - WHAT: Renders a <select> dropdown with three sort options.
 * - INPUTS: sort (current sort key), onSortChange (callback)
 * - OUTPUTS: <select> element with three options
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: sort value is always one of "date" | "severity" | "impact"
 */

import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "date", label: "Newest first" },
  { value: "severity", label: "Severity" },
  { value: "impact", label: "Financial Impact" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface IncidentSortProps {
  sort: string;
  onSortChange: (sort: string) => void;
}

export function IncidentSort({ sort, onSortChange }: IncidentSortProps) {
  const safeSort: SortValue =
    (SORT_OPTIONS.find((o) => o.value === sort)?.value as SortValue | undefined) ??
    "date";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <label
        htmlFor="incident-sort"
        className="text-xs text-[var(--text-muted)] whitespace-nowrap"
      >
        Sort by
      </label>
      <select
        id="incident-sort"
        value={safeSort}
        onChange={(e) => onSortChange(e.target.value)}
        className={cn(
          "rounded-sm border bg-[var(--bg-surface)] text-[var(--text-secondary)]",
          "border-[var(--border-subtle)] text-sm px-3 py-2 outline-none cursor-pointer",
          "focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
          "transition-colors min-h-[44px]",
        )}
        aria-label="Sort incidents by"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
