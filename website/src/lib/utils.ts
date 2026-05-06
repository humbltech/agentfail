import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORY_SLUGS, AGENT_TYPE_SLUGS } from "./constants";

// ─── Tailwind class merge ─────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Merges class name inputs into a single deduplicated Tailwind-aware string.
 * - INPUTS: Variadic ClassValue[] (strings, arrays, objects, undefined, null, false)
 * - OUTPUTS: Single merged class string; empty string when no inputs produce classes
 * - ERRORS: None — clsx/twMerge are total functions
 * - SIDE EFFECTS: None
 * - INVARIANTS: Tailwind conflicts are resolved in favor of the later argument
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── String utilities ─────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Converts an arbitrary string into a lowercase, URL-safe slug.
 * - INPUTS: Any string (including empty)
 * - OUTPUTS: Lowercase alphanumeric string with non-alphanumeric sequences collapsed
 *   into single hyphens; leading/trailing hyphens stripped
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: return value contains only [a-z0-9-]; never starts or ends with "-"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Date / number formatting ─────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Formats an ISO date string (YYYY-MM-DD) into a human-readable date.
 * - INPUTS: ISO date string, e.g. "2026-04-02"
 * - OUTPUTS: Formatted string, e.g. "Apr 2, 2026" (en-US locale, no timezone shift)
 * - ERRORS: Returns "Invalid Date" string if input is not a valid date (browser/Node native)
 * - SIDE EFFECTS: None
 * - INVARIANTS: Appends "T00:00:00" to prevent UTC-to-local timezone shift
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * CONTRACT:
 * - WHAT: Formats a USD amount into a locale-aware currency string, or "Unknown" for null.
 * - INPUTS: number (any finite value) or null
 * - OUTPUTS: "$X,XXX" formatted string with no decimal places, or "Unknown" for null
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Returns exactly "Unknown" (not "unknown" or "") when input is null/undefined
 */
export function formatUSD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Unknown";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Taxonomy slug lookups ────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Returns the canonical URL slug for an incident category string.
 * - INPUTS: Category string as it appears in incident frontmatter
 * - OUTPUTS: Mapped slug from CATEGORY_SLUGS if a case-insensitive match exists;
 *   otherwise falls back to slugify(category)
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Return value is always a non-null string; never throws
 */
export function getCategorySlug(category: string): string {
  const lowerCategory = category.toLowerCase();
  for (const [key, slug] of Object.entries(CATEGORY_SLUGS)) {
    if (key.toLowerCase() === lowerCategory) return slug;
  }
  return slugify(category);
}

/**
 * CONTRACT:
 * - WHAT: Returns the canonical URL slug for an agent type string.
 * - INPUTS: Agent type string as it appears in incident frontmatter
 * - OUTPUTS: Mapped slug from AGENT_TYPE_SLUGS if a case-insensitive match exists;
 *   otherwise falls back to slugify(agentType)
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Return value is always a non-null string; never throws
 */
export function getAgentTypeSlug(agentType: string): string {
  const lowerType = agentType.toLowerCase();
  for (const [key, slug] of Object.entries(AGENT_TYPE_SLUGS)) {
    if (key.toLowerCase() === lowerType) return slug;
  }
  return slugify(agentType);
}
