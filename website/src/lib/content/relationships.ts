import fs from "fs";
import path from "path";
import type { PatternGroup, RootCauseCluster } from "@/lib/content/types";

// ─── Default basePath ────────────────────────────────────────────────────────

const DEFAULT_RELATIONSHIPS_PATH = path.resolve(process.cwd(), "..", "relationships");

// ─── Low-level helpers ────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Reads graph.md and returns its full text content.
 * - INPUTS: basePath — directory containing graph.md
 * - OUTPUTS: Raw string content of the file
 * - ERRORS: throws if the file cannot be read
 * - SIDE EFFECTS: synchronous file I/O
 * - INVARIANTS: returned string is the exact bytes of the file
 */
function readGraphFile(basePath: string): string {
  return fs.readFileSync(path.join(basePath, "graph.md"), "utf-8");
}

/**
 * CONTRACT:
 * - WHAT: Extracts text between two H2 headings (or end of file) from a markdown string.
 * - INPUTS: content — full markdown text; sectionTitle — exact H2 title to find
 * - OUTPUTS: Substring from just after "## {sectionTitle}" to the next "## " or EOF
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Returns empty string if the section is not found
 */
function extractH2Section(content: string, sectionTitle: string): string {
  const start = content.indexOf(`## ${sectionTitle}`);
  if (start === -1) return "";
  const afterHeading = content.indexOf("\n", start) + 1;
  const nextH2 = content.indexOf("\n## ", afterHeading);
  return nextH2 === -1
    ? content.slice(afterHeading)
    : content.slice(afterHeading, nextH2);
}

/**
 * CONTRACT:
 * - WHAT: Splits a section into H3 blocks; returns each block starting with "### ".
 * - INPUTS: section — text chunk that may contain H3 headings
 * - OUTPUTS: Array of raw H3 block strings
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Every returned string starts with "### "
 */
function splitH3Blocks(section: string): string[] {
  return section
    .split(/(?=^### )/m)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("### "));
}

/**
 * CONTRACT:
 * - WHAT: Extracts all [[AAGF-YYYY-NNN]] incident IDs from a text block.
 * - INPUTS: block — any string that may contain [[...]] references
 * - OUTPUTS: Deduplicated array of incident ID strings (e.g. ["AAGF-2026-001"])
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: IDs are uppercase; no duplicates in the returned array
 */
function extractIncidentIds(block: string): string[] {
  const matches = [...block.matchAll(/\[\[([A-Z]+-\d{4}-\d{3})\]\]/g)];
  const ids = matches.map((m) => m[1]);
  return [...new Set(ids)];
}

/**
 * CONTRACT:
 * - WHAT: Extracts all bare AAGF-YYYY-NNN IDs (not bracketed) from a text block.
 * - INPUTS: block — any string that may contain bare incident IDs
 * - OUTPUTS: Deduplicated array of incident ID strings
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: IDs are uppercase; no duplicates
 */
function extractBareIncidentIds(block: string): string[] {
  const matches = [...block.matchAll(/\b([A-Z]+-\d{4}-\d{3})\b/g)];
  const ids = matches.map((m) => m[1]);
  return [...new Set(ids)];
}

/**
 * CONTRACT:
 * - WHAT: Converts a kebab-case slug into a Title Case display name.
 * - INPUTS: slug — hyphen-separated lowercase string
 * - OUTPUTS: Each word capitalised, joined with spaces
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Return value has at least one word; never empty if slug is non-empty
 */
function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/**
 * CONTRACT:
 * - WHAT: Extracts the first non-empty paragraph from a block (lines after the H3 heading).
 * - INPUTS: block — H3 section text with heading on line 1
 * - OUTPUTS: First paragraph as space-joined string; empty string if none
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Never returns null
 */
function extractFirstParagraph(block: string): string {
  const lines = block.split("\n").slice(1);
  const paragraphLines: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) break;
      continue;
    }
    // Stop at bullet lists (incident entries) or horizontal rules
    if (/^[-*]\s/.test(trimmed) || /^---+$/.test(trimmed)) break;
    paragraphLines.push(trimmed);
    inParagraph = true;
  }
  return paragraphLines.join(" ");
}

// ─── getPatternGroups ────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Parses the "Pattern Groups" section of graph.md into structured PatternGroup objects.
 * - INPUTS: basePath — directory containing graph.md (optional)
 * - OUTPUTS: Array of PatternGroup; one per H3 heading under "## Pattern Groups"
 * - ERRORS: throws if graph.md cannot be read
 * - SIDE EFFECTS: synchronous file I/O once per call
 * - INVARIANTS: slug is the raw H3 text; incidentIds contains only [[AAGF-...]] refs
 */
export function getPatternGroups(basePath: string = DEFAULT_RELATIONSHIPS_PATH): PatternGroup[] {
  const content = readGraphFile(basePath);
  const section = extractH2Section(content, "Pattern Groups");
  const blocks = splitH3Blocks(section);

  return blocks.map((block): PatternGroup => {
    const headingMatch = /^### (.+)/.exec(block);
    const slug = headingMatch ? headingMatch[1].trim() : "";
    const name = titleCaseSlug(slug);
    const description = extractFirstParagraph(block);
    const incidentIds = extractIncidentIds(block);

    return { slug, name, description, incidentIds };
  });
}

// ─── getRootCauseClusters ─────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Parses the "Root Cause Clusters" section of graph.md into structured objects.
 * - INPUTS: basePath — directory containing graph.md (optional)
 * - OUTPUTS: Array of RootCauseCluster; one per H3 heading under "## Root Cause Clusters"
 * - ERRORS: throws if graph.md cannot be read
 * - SIDE EFFECTS: synchronous file I/O once per call
 * - INVARIANTS: incidentCount equals the count of unique bare AAGF IDs in the cluster block
 */
export function getRootCauseClusters(
  basePath: string = DEFAULT_RELATIONSHIPS_PATH,
): RootCauseCluster[] {
  const content = readGraphFile(basePath);
  const section = extractH2Section(content, "Root Cause Clusters");
  const blocks = splitH3Blocks(section);

  return blocks.map((block): RootCauseCluster => {
    const headingMatch = /^### (.+)/.exec(block);
    const name = headingMatch ? headingMatch[1].trim() : "";

    // Use bare IDs since root cause entries list them without [[]] brackets
    const incidentIds = extractBareIncidentIds(block);

    return {
      name,
      description: "",
      incidentCount: incidentIds.length,
    };
  });
}
