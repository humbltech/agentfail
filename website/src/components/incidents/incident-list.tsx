"use client";

/**
 * Incidents list page — client component.
 *
 * CONTRACT:
 * - WHAT: Orchestrates search, filter, and sort state for the incidents list
 *   page. Receives all data as props from the server page component.
 * - INPUTS: incidents (all cards), categories, platforms, agentTypes (filter options)
 * - OUTPUTS: Full page layout with search bar, filter sidebar, incident cards
 * - ERRORS: None thrown — empty results show EmptyState
 * - SIDE EFFECTS: Updates URL search params for shareable filtered views
 * - INVARIANTS:
 *   - Pipeline order: search → filter → sort
 *   - URL params stay in sync with UI state
 *   - Fuse.js instance is memoized and never recreated unless incidents changes
 */

import { useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { SlidersHorizontal, X } from "lucide-react";

import { IncidentCard } from "@/components/incidents/incident-card";
import { IncidentFilters } from "@/components/incidents/incident-filters";
import { IncidentSearch } from "@/components/incidents/incident-search";
import { IncidentSort } from "@/components/incidents/incident-sort";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { IncidentCard as IncidentCardType, Severity, VendorResponse } from "@/lib/content/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IncidentListPageProps {
  incidents: IncidentCardType[];
  categories: string[];
  platforms: string[];
  agentTypes: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const ALL_SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];
const ALL_VENDOR_RESPONSES: VendorResponse[] = [
  "none",
  "acknowledged",
  "fixed",
  "refund_issued",
  "disputed",
  "disputed_then_refund_issued",
];

// ─── URL param helpers ────────────────────────────────────────────────────────

function parseCommaSplit(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

function toCommaSplit(values: string[]): string {
  return values.join(",");
}

// ─── Inner component (needs useSearchParams) ──────────────────────────────────

function IncidentListInner({
  incidents,
  categories,
  platforms,
  agentTypes,
}: IncidentListPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Read state from URL ──────────────────────────────────────────────────
  const query = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "date";
  const selectedSeverities = parseCommaSplit(searchParams.get("severity")) as Severity[];
  const selectedCategories = parseCommaSplit(searchParams.get("category"));
  const selectedAgentTypes = parseCommaSplit(searchParams.get("agentType"));
  const selectedPlatforms = parseCommaSplit(searchParams.get("platform"));
  const selectedVendorResponses = parseCommaSplit(
    searchParams.get("vendorResponse"),
  ) as VendorResponse[];

  // ── URL update helper ────────────────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  // ── Toggle helpers ───────────────────────────────────────────────────────
  function toggleFilter<T extends string>(
    current: T[],
    value: T,
    paramKey: string,
    allValid: T[],
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    // Validate against known values
    const validated = next.filter((v): v is T => allValid.includes(v));
    updateParams({ [paramKey]: validated.length > 0 ? toCommaSplit(validated) : null });
  }

  const handleSeverityChange = (sev: Severity) =>
    toggleFilter(selectedSeverities, sev, "severity", ALL_SEVERITIES);

  const handleCategoryChange = (cat: string) =>
    toggleFilter(selectedCategories, cat, "category", categories);

  const handleAgentTypeChange = (at: string) =>
    toggleFilter(selectedAgentTypes, at, "agentType", agentTypes);

  const handlePlatformChange = (p: string) =>
    toggleFilter(selectedPlatforms, p, "platform", platforms);

  const handleVendorResponseChange = (vr: VendorResponse) =>
    toggleFilter(selectedVendorResponses, vr, "vendorResponse", ALL_VENDOR_RESPONSES);

  const handleClearAll = () => {
    updateParams({
      severity: null,
      category: null,
      agentType: null,
      platform: null,
      vendorResponse: null,
    });
  };

  const handleQueryChange = (q: string) => {
    updateParams({ q: q || null });
  };

  const handleSortChange = (s: string) => {
    updateParams({ sort: s === "date" ? null : s });
  };

  // ── Fuse.js ───────────────────────────────────────────────────────────────
  const fuse = useMemo(
    () =>
      new Fuse(incidents, {
        keys: [
          "title",
          "category",
          "agent_type",
          "platform",
          "headline_stat",
          "operator_tldr",
          "tags",
        ],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [incidents],
  );

  // ── Search → Filter → Sort pipeline ──────────────────────────────────────
  const results = useMemo(() => {
    // 1. Search
    let list: IncidentCardType[] = query
      ? fuse.search(query).map((r) => r.item)
      : [...incidents];

    // 2. Filter
    if (selectedSeverities.length > 0) {
      list = list.filter((i) => selectedSeverities.includes(i.severity));
    }
    if (selectedCategories.length > 0) {
      list = list.filter((i) =>
        i.category.some((c) => selectedCategories.includes(c)),
      );
    }
    if (selectedAgentTypes.length > 0) {
      list = list.filter((i) =>
        i.agent_type.some((a) => selectedAgentTypes.includes(a)),
      );
    }
    if (selectedPlatforms.length > 0) {
      list = list.filter((i) => selectedPlatforms.includes(i.platform));
    }
    if (selectedVendorResponses.length > 0) {
      list = list.filter((i) =>
        selectedVendorResponses.includes(i.vendor_response),
      );
    }

    // 3. Sort
    if (sort === "severity") {
      list.sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      );
    } else if (sort === "impact") {
      list.sort(
        (a, b) => (b.financial_impact_usd ?? 0) - (a.financial_impact_usd ?? 0),
      );
    } else {
      // Default: date descending
      list.sort((a, b) =>
        b.date_occurred.localeCompare(a.date_occurred),
      );
    }

    return list;
  }, [
    query,
    fuse,
    incidents,
    selectedSeverities,
    selectedCategories,
    selectedAgentTypes,
    selectedPlatforms,
    selectedVendorResponses,
    sort,
  ]);

  // ── Active filter pills ───────────────────────────────────────────────────
  type Pill = { key: string; label: string; onRemove: () => void };
  const activePills: Pill[] = [
    ...selectedSeverities.map((sev) => ({
      key: `sev-${sev}`,
      label: sev,
      onRemove: () => handleSeverityChange(sev),
    })),
    ...selectedCategories.map((cat) => ({
      key: `cat-${cat}`,
      label: cat,
      onRemove: () => handleCategoryChange(cat),
    })),
    ...selectedAgentTypes.map((at) => ({
      key: `at-${at}`,
      label: at,
      onRemove: () => handleAgentTypeChange(at),
    })),
    ...selectedPlatforms.map((p) => ({
      key: `plat-${p}`,
      label: p,
      onRemove: () => handlePlatformChange(p),
    })),
    ...selectedVendorResponses.map((vr) => ({
      key: `vr-${vr}`,
      label: vr.replace(/_/g, " "),
      onRemove: () => handleVendorResponseChange(vr),
    })),
  ];

  const uniquePlatforms = useMemo(
    () => [...new Set(incidents.map((i) => i.platform))].sort(),
    [incidents],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--text-primary)] mb-2">
          Incidents
        </h1>
        <p className="text-[var(--text-secondary)] text-base">
          {incidents.length} documented incident{incidents.length !== 1 ? "s" : ""} across{" "}
          {uniquePlatforms.length} platform{uniquePlatforms.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <IncidentSearch query={query} onQueryChange={handleQueryChange} />
        </div>
        <IncidentSort sort={sort} onSortChange={handleSortChange} />
        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                className={cn(
                  "md:hidden flex items-center gap-2 rounded-sm border px-3 shrink-0",
                  "border-[var(--border-subtle)] bg-[var(--bg-surface)]",
                  "text-[var(--text-secondary)] text-sm hover:border-[var(--border-visible)]",
                  "transition-colors min-h-[44px]",
                )}
                aria-label="Open filters"
              />
            }
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span>Filters</span>
            {activePills.length > 0 && (
              <span className="rounded-full bg-[var(--accent)] text-white text-xs w-5 h-5 flex items-center justify-center font-semibold">
                {activePills.length}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="bg-[var(--bg-surface)] border-[var(--border-subtle)] w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-[var(--text-primary)]">Filters</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <IncidentFilters
                categories={categories}
                platforms={platforms}
                agentTypes={agentTypes}
                selectedSeverities={selectedSeverities}
                selectedCategories={selectedCategories}
                selectedAgentTypes={selectedAgentTypes}
                selectedPlatforms={selectedPlatforms}
                selectedVendorResponses={selectedVendorResponses}
                onSeverityChange={handleSeverityChange}
                onCategoryChange={handleCategoryChange}
                onAgentTypeChange={handleAgentTypeChange}
                onPlatformChange={handlePlatformChange}
                onVendorResponseChange={handleVendorResponseChange}
                onClearAll={handleClearAll}
                incidents={incidents}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter pills + result count */}
      {(activePills.length > 0 || query) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">
            Showing {results.length} of {incidents.length} incidents
          </span>
          {activePills.map((pill) => (
            <span
              key={pill.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[4px]",
                "bg-[var(--bg-overlay)] border border-[var(--border-visible)]",
                "text-xs text-[var(--text-secondary)] px-2 py-1",
              )}
            >
              {pill.label}
              <button
                type="button"
                onClick={pill.onRemove}
                className={cn(
                  "inline-flex items-center justify-center rounded-sm",
                  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  "transition-colors min-h-[20px] min-w-[20px]",
                )}
                aria-label={`Remove filter: ${pill.label}`}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          {activePills.length > 1 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-[var(--accent)] hover:text-[var(--accent-bright)] transition-colors underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden md:block w-60 shrink-0" aria-label="Filter incidents">
          <IncidentFilters
            categories={categories}
            platforms={platforms}
            agentTypes={agentTypes}
            selectedSeverities={selectedSeverities}
            selectedCategories={selectedCategories}
            selectedAgentTypes={selectedAgentTypes}
            selectedPlatforms={selectedPlatforms}
            selectedVendorResponses={selectedVendorResponses}
            onSeverityChange={handleSeverityChange}
            onCategoryChange={handleCategoryChange}
            onAgentTypeChange={handleAgentTypeChange}
            onPlatformChange={handlePlatformChange}
            onVendorResponseChange={handleVendorResponseChange}
            onClearAll={handleClearAll}
            incidents={incidents}
          />
        </aside>

        {/* Incident list */}
        <div className="flex-1 min-w-0">
          {results.length === 0 ? (
            <EmptyState
              hasFilters={activePills.length > 0 || !!query}
              onClearFilters={() => {
                handleClearAll();
                handleQueryChange("");
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--text-muted)] mb-3">
        No incidents found
      </p>
      <p className="text-[var(--text-muted)] text-sm mb-6">
        {hasFilters
          ? "No incidents match your current filters or search query."
          : "No incidents have been published yet."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={cn(
            "rounded-sm border border-[var(--border-visible)]",
            "bg-[var(--bg-surface)] text-[var(--text-secondary)]",
            "px-4 py-2 text-sm hover:border-[var(--accent)] hover:text-[var(--text-primary)]",
            "transition-colors min-h-[44px]",
          )}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Public export (wrapped in Suspense for useSearchParams) ──────────────────

export function IncidentListPage(props: IncidentListPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 w-48 rounded-sm bg-[var(--bg-raised)] animate-pulse mb-8" />
          <div className="flex gap-8">
            <div className="hidden md:block w-60 shrink-0">
              <div className="h-96 rounded-sm bg-[var(--bg-raised)] animate-pulse" />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-sm bg-[var(--bg-raised)] animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <IncidentListInner {...props} />
    </Suspense>
  );
}
