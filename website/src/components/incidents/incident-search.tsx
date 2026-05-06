"use client";

/**
 * Debounced search input for the incidents list page.
 *
 * CONTRACT:
 * - WHAT: Renders a search input with icon and clear button, debouncing query
 *   changes by 300ms before propagating to parent.
 * - INPUTS: query (current search string), onQueryChange (callback)
 * - OUTPUTS: <div> containing an input with search icon and optional clear button
 * - ERRORS: None
 * - SIDE EFFECTS: Sets/clears a 300ms debounce timer on each keystroke
 * - INVARIANTS: onQueryChange is never called with the intermediate keystroke
 *   value — only after 300ms of inactivity
 */

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function IncidentSearch({ query, onQueryChange }: IncidentSearchProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onQueryChange(value);
    }, 300);
  }

  function handleClear() {
    if (timerRef.current) clearTimeout(timerRef.current);
    onQueryChange("");
    // Reset the input's display value by using a key trick — we use defaultValue
    // so we need to force a re-render. The parent controls `query` and passes it
    // back, so we just call onQueryChange("").
  }

  return (
    <div className="relative flex items-center w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        key={query === "" ? "empty" : "filled"}
        defaultValue={query}
        onChange={handleChange}
        placeholder="Search incidents..."
        className={cn(
          "w-full rounded-sm border bg-[var(--bg-surface)] text-[var(--text-primary)]",
          "border-[var(--border-subtle)] placeholder:text-[var(--text-muted)]",
          "pl-9 pr-9 py-2.5 text-sm outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:border-[var(--accent)]",
          "transition-colors",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
        aria-label="Search incidents"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "flex items-center justify-center rounded-sm",
            "min-h-[44px] min-w-[44px] text-[var(--text-muted)]",
            "hover:text-[var(--text-secondary)] transition-colors",
          )}
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
