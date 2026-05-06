"use client";

/**
 * Collapsible filter sidebar for the incidents list page.
 *
 * CONTRACT:
 * - WHAT: Renders collapsible filter sections for severity, category, agent type,
 *   platform, and vendor response. Computes option counts from the full incident
 *   list for cross-filter reactivity.
 * - INPUTS: all filter state arrays + callbacks, incidents list for counts
 * - OUTPUTS: <aside> or plain <div> with collapsible sections
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - Counts reflect incidents passing ALL OTHER active filters (not this section)
 *   - Clear all button only shows when at least one filter is active
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { IncidentCard, Severity, VendorResponse } from "@/lib/content/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];

const ALL_VENDOR_RESPONSES: VendorResponse[] = [
  "none",
  "acknowledged",
  "fixed",
  "refund_issued",
  "disputed",
  "disputed_then_refund_issued",
];

const VENDOR_RESPONSE_LABELS: Record<VendorResponse, string> = {
  none: "No response",
  acknowledged: "Acknowledged",
  fixed: "Fixed",
  refund_issued: "Refund issued",
  disputed: "Disputed",
  disputed_then_refund_issued: "Disputed → refunded",
} satisfies Record<VendorResponse, string>;

// ─── FilterSection ────────────────────────────────────────────────────────────

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-subtle)] py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-between w-full",
          "min-h-[44px] text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
          "rounded-sm px-1 -mx-1",
        )}
        aria-expanded={open}
      >
        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-[var(--text-muted)] transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-2 flex flex-col gap-1">{children}</div>}
    </div>
  );
}

// ─── FilterCheckbox ───────────────────────────────────────────────────────────

interface FilterCheckboxProps {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function FilterCheckbox({ id, label, count, checked, onCheckedChange }: FilterCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center justify-between gap-2 cursor-pointer",
        "min-h-[44px] md:min-h-[32px] rounded-sm px-1 -mx-1",
        "hover:bg-[var(--bg-raised)] transition-colors group",
      )}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          className="border-[var(--border-visible)] data-checked:bg-[var(--accent)] data-checked:border-[var(--accent)]"
        />
        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors select-none">
          {label}
        </span>
      </div>
      <span className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">
        {count}
      </span>
    </label>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface IncidentFiltersProps {
  categories: string[];
  platforms: string[];
  agentTypes: string[];
  selectedSeverities: Severity[];
  selectedCategories: string[];
  selectedAgentTypes: string[];
  selectedPlatforms: string[];
  selectedVendorResponses: VendorResponse[];
  onSeverityChange: (severity: Severity) => void;
  onCategoryChange: (category: string) => void;
  onAgentTypeChange: (agentType: string) => void;
  onPlatformChange: (platform: string) => void;
  onVendorResponseChange: (vendorResponse: VendorResponse) => void;
  onClearAll: () => void;
  /** Full incidents list — used to compute per-option counts reactively. */
  incidents: IncidentCard[];
}

// ─── Count helpers ────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Filters incidents excluding the named dimension so counts stay reactive
 *   as other filters change.
 * - INPUTS: incidents, all active filters, and the dimension to exclude
 * - OUTPUTS: filtered IncidentCard[]
 */
function filterExcluding(
  incidents: IncidentCard[],
  opts: {
    excludeDimension: "severity" | "category" | "agentType" | "platform" | "vendorResponse";
    selectedSeverities: Severity[];
    selectedCategories: string[];
    selectedAgentTypes: string[];
    selectedPlatforms: string[];
    selectedVendorResponses: VendorResponse[];
  },
): IncidentCard[] {
  const {
    excludeDimension,
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
  } = opts;

  return incidents.filter((inc) => {
    if (excludeDimension !== "severity" && selectedSeverities.length > 0) {
      if (!selectedSeverities.includes(inc.severity)) return false;
    }
    if (excludeDimension !== "category" && selectedCategories.length > 0) {
      if (!inc.category.some((c) => selectedCategories.includes(c))) return false;
    }
    if (excludeDimension !== "agentType" && selectedAgentTypes.length > 0) {
      if (!inc.agent_type.some((a) => selectedAgentTypes.includes(a))) return false;
    }
    if (excludeDimension !== "platform" && selectedPlatforms.length > 0) {
      if (!selectedPlatforms.includes(inc.platform)) return false;
    }
    if (excludeDimension !== "vendorResponse" && selectedVendorResponses.length > 0) {
      if (!selectedVendorResponses.includes(inc.vendor_response)) return false;
    }
    return true;
  });
}

// ─── IncidentFilters ──────────────────────────────────────────────────────────

export function IncidentFilters({
  categories,
  platforms,
  agentTypes,
  selectedSeverities,
  selectedCategories,
  selectedAgentTypes,
  selectedPlatforms,
  selectedVendorResponses,
  onSeverityChange,
  onCategoryChange,
  onAgentTypeChange,
  onPlatformChange,
  onVendorResponseChange,
  onClearAll,
  incidents,
}: IncidentFiltersProps) {
  const hasActiveFilters =
    selectedSeverities.length > 0 ||
    selectedCategories.length > 0 ||
    selectedAgentTypes.length > 0 ||
    selectedPlatforms.length > 0 ||
    selectedVendorResponses.length > 0;

  // Per-dimension base sets for reactive counts
  const baseSeverity = filterExcluding(incidents, {
    excludeDimension: "severity",
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
  });
  const baseCategory = filterExcluding(incidents, {
    excludeDimension: "category",
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
  });
  const baseAgentType = filterExcluding(incidents, {
    excludeDimension: "agentType",
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
  });
  const basePlatform = filterExcluding(incidents, {
    excludeDimension: "platform",
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
  });
  const baseVendor = filterExcluding(incidents, {
    excludeDimension: "vendorResponse",
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
  });

  return (
    <div className="w-full">
      {/* Clear all */}
      {hasActiveFilters && (
        <div className="mb-2">
          <button
            type="button"
            onClick={onClearAll}
            className={cn(
              "text-xs text-[var(--accent)] hover:text-[var(--accent-bright)]",
              "transition-colors underline underline-offset-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-sm",
            )}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Severity */}
      <FilterSection title="Severity">
        {ALL_SEVERITIES.map((sev) => {
          const count = baseSeverity.filter((i) => i.severity === sev).length;
          return (
            <FilterCheckbox
              key={sev}
              id={`filter-severity-${sev}`}
              label={sev}
              count={count}
              checked={selectedSeverities.includes(sev)}
              onCheckedChange={() => onSeverityChange(sev)}
            />
          );
        })}
      </FilterSection>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category" defaultOpen={false}>
          {categories.map((cat) => {
            const count = baseCategory.filter((i) => i.category.includes(cat)).length;
            return (
              <FilterCheckbox
                key={cat}
                id={`filter-category-${cat}`}
                label={cat}
                count={count}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => onCategoryChange(cat)}
              />
            );
          })}
        </FilterSection>
      )}

      {/* Agent Type */}
      {agentTypes.length > 0 && (
        <FilterSection title="Agent Type" defaultOpen={false}>
          {agentTypes.map((at) => {
            const count = baseAgentType.filter((i) => i.agent_type.includes(at)).length;
            return (
              <FilterCheckbox
                key={at}
                id={`filter-agent-${at}`}
                label={at}
                count={count}
                checked={selectedAgentTypes.includes(at)}
                onCheckedChange={() => onAgentTypeChange(at)}
              />
            );
          })}
        </FilterSection>
      )}

      {/* Platform */}
      {platforms.length > 0 && (
        <FilterSection title="Platform" defaultOpen={false}>
          {platforms.map((p) => {
            const count = basePlatform.filter((i) => i.platform === p).length;
            return (
              <FilterCheckbox
                key={p}
                id={`filter-platform-${p}`}
                label={p}
                count={count}
                checked={selectedPlatforms.includes(p)}
                onCheckedChange={() => onPlatformChange(p)}
              />
            );
          })}
        </FilterSection>
      )}

      {/* Vendor Response */}
      <FilterSection title="Vendor Response" defaultOpen={false}>
        {ALL_VENDOR_RESPONSES.map((vr) => {
          const count = baseVendor.filter((i) => i.vendor_response === vr).length;
          return (
            <FilterCheckbox
              key={vr}
              id={`filter-vendor-${vr}`}
              label={VENDOR_RESPONSE_LABELS[vr]}
              count={count}
              checked={selectedVendorResponses.includes(vr)}
              onCheckedChange={() => onVendorResponseChange(vr)}
            />
          );
        })}
      </FilterSection>
    </div>
  );
}
