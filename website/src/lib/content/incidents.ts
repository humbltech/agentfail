/**
 * Incident content parser.
 *
 * Reads all `.md` files from the incidents directory, parses YAML frontmatter
 * via gray-matter, filters to published incidents, and exposes query functions
 * for the rest of the application.
 *
 * CONTRACT (module-level):
 * - All functions filter to `status === "published"` and exclude TEMPLATE.md.
 * - All list results are sorted by `date_occurred` descending (newest first).
 * - `basePath` defaults to `<repo-root>/incidents/` relative to cwd.
 * - Functions never throw on missing/malformed incidents — they skip silently.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

import type { Incident, IncidentCard, IncidentFrontmatter } from "@/lib/content/types";
import { renderMarkdown, splitIntoSections } from "@/lib/content/markdown";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function defaultBasePath(): string {
  return path.resolve(process.cwd(), "..", "incidents");
}

/**
 * Reads all `.md` files in `basePath` and returns parsed gray-matter results,
 * skipping TEMPLATE.md and any file whose frontmatter `status !== "published"`.
 *
 * CONTRACT:
 * - Input: absolute directory path
 * - Output: array of { data: IncidentFrontmatter; content: string } sorted by date_occurred desc
 * - Errors: propagates fs errors; skips individual files that fail to parse
 * - Side effects: synchronous filesystem reads (build-time only, not per-request)
 * - Invariants: all returned items have status === "published"
 */
function readPublishedFrontmatter(
  basePath: string,
): Array<{ data: IncidentFrontmatter; content: string; filename: string }> {
  const filenames = fs.readdirSync(basePath).filter((f) => f.endsWith(".md"));

  const parsed: Array<{ data: IncidentFrontmatter; content: string; filename: string }> = [];

  for (const filename of filenames) {
    if (filename.toUpperCase() === "TEMPLATE.MD") continue;

    const raw = fs.readFileSync(path.join(basePath, filename), "utf-8");
    const { data, content } = matter(raw);

    if (data.status !== "published") continue;

    parsed.push({
      data: data as IncidentFrontmatter,
      content,
      filename,
    });
  }

  // Sort by date_occurred descending (newest first)
  parsed.sort((a, b) => {
    const da = a.data.date_occurred ?? "";
    const db = b.data.date_occurred ?? "";
    return db.localeCompare(da);
  });

  return parsed;
}

/**
 * Maps a raw frontmatter + content pair to an IncidentCard (lightweight, no HTML).
 *
 * CONTRACT:
 * - Input: parsed frontmatter data and filename (unused, kept for tracing)
 * - Output: IncidentCard — only the subset of fields needed for list/card views
 * - Side effects: none (no async I/O, no markdown rendering)
 * - Invariants: slug === data.id
 */
function toIncidentCard(data: IncidentFrontmatter): IncidentCard {
  return {
    id: data.id,
    title: data.title,
    slug: data.id,
    date_occurred: data.date_occurred,
    severity: data.severity,
    category: data.category ?? [],
    agent_type: data.agent_type ?? [],
    platform: data.platform ?? "",
    headline_stat: data.headline_stat ?? "",
    operator_tldr: data.operator_tldr ?? "",
    financial_impact_usd: data.financial_impact_usd ?? null,
    vendor_response: data.vendor_response,
    tags: data.tags ?? [],
    pattern_group: data.pattern_group ?? "",
    public_attention: data.public_attention,
  };
}

/**
 * Maps a raw frontmatter + content pair to a full Incident with rendered HTML.
 *
 * CONTRACT:
 * - Input: parsed frontmatter, raw markdown content
 * - Output: Incident with contentHtml populated
 * - Errors: propagates renderMarkdown errors
 * - Side effects: invokes the unified markdown pipeline (async)
 * - Invariants: slug === data.id
 */
async function toIncident(data: IncidentFrontmatter, content: string): Promise<Incident> {
  const [contentHtml, sections] = await Promise.all([
    renderMarkdown(content),
    splitIntoSections(content),
  ]);
  return {
    ...(data as IncidentFrontmatter),
    slug: data.id,
    content,
    contentHtml,
    sections,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get all published incidents, sorted by date_occurred descending.
 *
 * CONTRACT:
 * - Output: Incident[] — full objects with rendered HTML
 * - Invariants: all items have status === "published"; sorted newest-first
 */
export async function getAllIncidents(basePath?: string): Promise<Incident[]> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);
  return Promise.all(parsed.map(({ data, content }) => toIncident(data, content)));
}

/**
 * Get a single published incident by its ID (slug), e.g. "AAGF-2026-001".
 *
 * CONTRACT:
 * - Input: slug string, optional basePath
 * - Output: Incident | null — null when not found or not published
 * - Side effects: reads filesystem synchronously, renders markdown async
 */
export async function getIncidentBySlug(
  slug: string,
  basePath?: string,
): Promise<Incident | null> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);
  const match = parsed.find(({ data }) => data.id === slug);
  if (!match) return null;
  return toIncident(match.data, match.content);
}

/**
 * Get lightweight card data for all published incidents.
 *
 * CONTRACT:
 * - Output: IncidentCard[] — no markdown rendering, suitable for list pages
 * - Invariants: sorted newest-first; no contentHtml field present
 */
export async function getAllIncidentCards(basePath?: string): Promise<IncidentCard[]> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);
  return parsed.map(({ data }) => toIncidentCard(data));
}

/**
 * Get incident cards filtered by category (case-insensitive partial match).
 *
 * CONTRACT:
 * - Input: category string to search for (partial, case-insensitive)
 * - Output: IncidentCard[] matching incidents where any category contains the query
 */
export async function getIncidentsByCategory(
  category: string,
  basePath?: string,
): Promise<IncidentCard[]> {
  const cards = await getAllIncidentCards(basePath);
  const query = category.toLowerCase();
  return cards.filter((c) =>
    c.category.some((cat) => cat.toLowerCase().includes(query)),
  );
}

/**
 * Get incident cards filtered by exact pattern_group match.
 *
 * CONTRACT:
 * - Input: group string (exact match against pattern_group field)
 * - Output: IncidentCard[] with matching pattern_group
 */
export async function getIncidentsByPatternGroup(
  group: string,
  basePath?: string,
): Promise<IncidentCard[]> {
  const cards = await getAllIncidentCards(basePath);
  return cards.filter((c) => c.pattern_group === group);
}

/**
 * Get incident cards filtered by agent type (case-insensitive partial match).
 *
 * CONTRACT:
 * - Input: agentType string to search for (partial, case-insensitive)
 * - Output: IncidentCard[] where any agent_type contains the query
 */
export async function getIncidentsByAgentType(
  agentType: string,
  basePath?: string,
): Promise<IncidentCard[]> {
  const cards = await getAllIncidentCards(basePath);
  const query = agentType.toLowerCase();
  return cards.filter((c) =>
    c.agent_type.some((at) => at.toLowerCase().includes(query)),
  );
}

/**
 * Get all unique categories across published incidents.
 *
 * CONTRACT:
 * - Output: string[] — deduplicated, sorted alphabetically
 */
export async function getUniqueCategories(basePath?: string): Promise<string[]> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);
  const all = parsed.flatMap(({ data }) => data.category ?? []);
  return [...new Set(all)].sort();
}

/**
 * Get all unique platforms across published incidents.
 *
 * CONTRACT:
 * - Output: string[] — deduplicated, sorted alphabetically
 */
export async function getUniquePlatforms(basePath?: string): Promise<string[]> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);
  const all = parsed.map(({ data }) => data.platform).filter(Boolean);
  return [...new Set(all)].sort();
}

/**
 * Get all unique agent types across published incidents.
 *
 * CONTRACT:
 * - Output: string[] — deduplicated, sorted alphabetically
 */
export async function getUniqueAgentTypes(basePath?: string): Promise<string[]> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);
  const all = parsed.flatMap(({ data }) => data.agent_type ?? []);
  return [...new Set(all)].sort();
}

/**
 * Get aggregate statistics across all published incidents.
 *
 * CONTRACT:
 * - Output: { total, categories, platforms, totalFinancialImpact }
 * - Invariants:
 *   - total === number of published incidents
 *   - categories === count of unique category strings
 *   - platforms === count of unique platform strings
 *   - totalFinancialImpact === sum of all non-null financial_impact_usd values
 */
export async function getStats(basePath?: string): Promise<{
  total: number;
  categories: number;
  platforms: number;
  totalFinancialImpact: number;
}> {
  const resolvedPath = basePath ?? defaultBasePath();
  const parsed = readPublishedFrontmatter(resolvedPath);

  const uniqueCategories = new Set(parsed.flatMap(({ data }) => data.category ?? []));
  const uniquePlatforms = new Set(
    parsed.map(({ data }) => data.platform).filter(Boolean),
  );
  const totalFinancialImpact = parsed.reduce((sum, { data }) => {
    return sum + (data.financial_impact_usd ?? 0);
  }, 0);

  return {
    total: parsed.length,
    categories: uniqueCategories.size,
    platforms: uniquePlatforms.size,
    totalFinancialImpact,
  };
}
