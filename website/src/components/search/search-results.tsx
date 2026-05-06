"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useEffect } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import type { IncidentCard } from "@/lib/content/types";
import { IncidentCard as IncidentCardComponent } from "@/components/incidents/incident-card";
import { EmptyState } from "@/components/shared/empty-state";

/**
 * CONTRACT:
 * - WHAT: Client-side full-text search over incident cards using Fuse.js.
 * - INPUTS: incidents — pre-fetched array from the server component
 * - OUTPUTS: Search input + result list (IncidentCard grid) filtered by ?q= URL param
 * - ERRORS: None — renders empty state when no results
 * - SIDE EFFECTS: Reads ?q= from URL search params; auto-focuses input on mount
 * - INVARIANTS: Input always reflects the current ?q= value; result count shown when query non-empty
 */

interface SearchResultsProps {
  incidents: IncidentCard[];
}

const FUSE_OPTIONS: IFuseOptions<IncidentCard> = {
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
  includeScore: false,
};

export function SearchResults({ incidents }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fuse = useMemo(() => new Fuse(incidents, FUSE_OPTIONS), [incidents]);

  const results = useMemo<IncidentCard[]>(() => {
    if (!query.trim()) return incidents;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query, incidents]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const params = new URLSearchParams(searchParams.toString());
    const value = input.value.trim();
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    // Navigate by updating URL
    const newUrl = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    window.history.pushState({}, "", newUrl);
    // Force re-render is handled by useSearchParams reactive update
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="space-y-8">
      {/* ── Search input ──────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} role="search">
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">
            Search incidents
          </label>
          <input
            ref={inputRef}
            id="search-input"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search incidents, patterns, platforms…"
            autoComplete="off"
            className="w-full rounded-sm border border-[var(--border-visible)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors duration-150"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-0 top-0 h-full min-w-[44px] flex items-center justify-center px-3 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </form>

      {/* ── Result count ─────────────────────────────────────────────── */}
      {query.trim() && (
        <p className="text-sm text-[var(--text-muted)]">
          Found{" "}
          <span className="text-[var(--text-primary)] font-medium">
            {results.length}
          </span>{" "}
          {results.length === 1 ? "result" : "results"} for{" "}
          <span className="text-[var(--accent)]">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {/* ── Results grid ─────────────────────────────────────────────── */}
      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((incident) => (
            <IncidentCardComponent key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        query.trim() && (
          <EmptyState
            title="No incidents match your search."
            description="Try a different keyword, category, or platform name."
            action={{ label: "Browse all incidents", href: "/incidents" }}
          />
        )
      )}
    </div>
  );
}
