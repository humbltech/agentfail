import fs from "fs";
import path from "path";
import type {
  TaxonomyCategory,
  SeverityLevel,
  AgentType,
  SolutionType,
  Severity,
} from "@/lib/content/types";
import { getCategorySlug, getAgentTypeSlug } from "@/lib/utils";

// ─── Default basePath ────────────────────────────────────────────────────────

const DEFAULT_TAXONOMY_PATH = path.resolve(process.cwd(), "..", "taxonomy");

// ─── Low-level helpers ────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Reads a markdown file under basePath and splits it into H3 sections.
 * - INPUTS: basePath (directory), filename (leaf name, e.g. "categories.md")
 * - OUTPUTS: Array of raw H3 block strings, each starting with "### …"
 * - ERRORS: throws if the file cannot be read
 * - SIDE EFFECTS: synchronous file I/O
 * - INVARIANTS: returned blocks preserve original whitespace within each block
 */
function readH3Sections(basePath: string, filename: string): string[] {
  const filepath = path.join(basePath, filename);
  const content = fs.readFileSync(filepath, "utf-8");
  // Split on H3 headings; keep the heading as the start of each block.
  const parts = content.split(/(?=^### )/m);
  return parts
    .map((s) => s.trim())
    .filter((s) => s.startsWith("### "));
}

/**
 * CONTRACT:
 * - WHAT: Strips a leading numeric prefix ("1. ", "12. ") from a heading string.
 * - INPUTS: heading — raw heading text possibly starting with "N. "
 * - OUTPUTS: heading with numeric prefix removed; trimmed
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: If no numeric prefix exists, returns the original trimmed string
 */
function stripNumericPrefix(heading: string): string {
  return heading.replace(/^\d+\.\s+/, "").trim();
}

/**
 * CONTRACT:
 * - WHAT: Extracts the first non-empty paragraph from a text block (lines after heading).
 * - INPUTS: block — text with the heading line still at the top
 * - OUTPUTS: First paragraph as a single space-joined string; empty string if none found
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Never returns null
 */
function extractFirstParagraph(block: string): string {
  // Drop the heading line (first line)
  const lines = block.split("\n").slice(1);
  const paragraphLines: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) break; // blank line ends the first paragraph
      continue;
    }
    // Stop at bold labels like **Examples:** or **Products:**
    if (/^\*\*[^*]+:\*\*/.test(trimmed)) break;
    // Stop at horizontal rules
    if (/^---+$/.test(trimmed)) break;
    paragraphLines.push(trimmed);
    inParagraph = true;
  }
  return paragraphLines.join(" ");
}

// ─── getCategories ────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Parses categories.md and returns structured TaxonomyCategory objects.
 * - INPUTS: basePath — directory containing taxonomy markdown files (optional)
 * - OUTPUTS: Array of TaxonomyCategory; one entry per H3 heading in the Primary Categories section
 * - ERRORS: throws if categories.md cannot be read
 * - SIDE EFFECTS: synchronous file I/O once per call
 * - INVARIANTS: returned slugs are always lowercase alphanumeric-hyphen strings
 */
export function getCategories(basePath: string = DEFAULT_TAXONOMY_PATH): TaxonomyCategory[] {
  const sections = readH3Sections(basePath, "categories.md");
  return sections.map((block): TaxonomyCategory => {
    const headingMatch = /^### (.+)/.exec(block);
    const rawHeading = headingMatch ? headingMatch[1].trim() : "";
    const name = stripNumericPrefix(rawHeading);
    const slug = getCategorySlug(name);
    const description = extractFirstParagraph(block);

    // Extract examples: text after "**Examples:**" up to the next blank line or "---"
    const examplesMatch = /\*\*Examples:\*\*\s*(.+?)(?:\n\n|\n---|\n###|$)/s.exec(block);
    const examples = examplesMatch ? examplesMatch[1].trim() : "";

    return { name, slug, description, examples };
  });
}

// ─── getSeverityLevels ────────────────────────────────────────────────────────

// The four valid severity names as defined in the Severity union type.
const SEVERITY_NAMES: Set<string> = new Set(["Critical", "High", "Medium", "Low"]);

/**
 * CONTRACT:
 * - WHAT: Parses severity.md and returns structured SeverityLevel objects.
 * - INPUTS: basePath — directory containing taxonomy markdown files (optional)
 * - OUTPUTS: Array of SeverityLevel ordered as they appear in the file
 * - ERRORS: throws if severity.md cannot be read
 * - SIDE EFFECTS: synchronous file I/O once per call
 * - INVARIANTS: only sections whose heading matches the Severity union are returned
 */
export function getSeverityLevels(basePath: string = DEFAULT_TAXONOMY_PATH): SeverityLevel[] {
  const sections = readH3Sections(basePath, "severity.md");
  const result: SeverityLevel[] = [];

  for (const block of sections) {
    const headingMatch = /^### (.+)/.exec(block);
    if (!headingMatch) continue;
    const name = headingMatch[1].trim();
    if (!SEVERITY_NAMES.has(name)) continue;

    // Description: text after "**Definition:**" label, or first paragraph if no label
    let description = "";
    const defMatch = /\*\*Definition:\*\*\s*(.+?)(?:\n\n|\n\*\*|\n---|\n###|$)/s.exec(block);
    if (defMatch) {
      description = defMatch[1].trim();
    } else {
      description = extractFirstParagraph(block);
    }

    // Criteria: bullet list under "**Criteria**" or "**Criteria (any one qualifies):**" etc.
    // Use a flexible label match.
    const criteriaMatch = /\*\*Criteria[^*]*:\*\*\s*\n((?:[-*]\s.+\n?)+)/s.exec(block);
    let criteria: string[] = [];
    if (criteriaMatch) {
      criteria = criteriaMatch[1]
        .split("\n")
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean);
    }

    result.push({ name: name as Severity, description, criteria });
  }

  return result;
}

// ─── getAgentTypes ────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Parses agent-types.md and returns structured AgentType objects.
 * - INPUTS: basePath — directory containing taxonomy markdown files (optional)
 * - OUTPUTS: Array of AgentType; one per H3 heading in the Agent Types section
 * - ERRORS: throws if agent-types.md cannot be read
 * - SIDE EFFECTS: synchronous file I/O once per call
 * - INVARIANTS: slugs are always lowercase alphanumeric-hyphen strings
 */
export function getAgentTypes(basePath: string = DEFAULT_TAXONOMY_PATH): AgentType[] {
  const sections = readH3Sections(basePath, "agent-types.md");
  return sections.map((block): AgentType => {
    const headingMatch = /^### (.+)/.exec(block);
    const rawHeading = headingMatch ? headingMatch[1].trim() : "";
    const name = stripNumericPrefix(rawHeading);
    const slug = getAgentTypeSlug(name);
    const description = extractFirstParagraph(block);

    // Products: comma-separated text after "**Products:**"
    const productsMatch = /\*\*Products:\*\*\s*(.+?)(?:\n|$)/.exec(block);
    const products = productsMatch
      ? productsMatch[1]
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

    // Risks: comma-separated on the "**Key risks:**" line (not a bullet list in this file)
    const risksMatch = /\*\*Key risks?:\*\*\s*(.+?)(?:\n|$)/i.exec(block);
    const risks = risksMatch
      ? risksMatch[1]
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [];

    return { name, slug, description, products, risks };
  });
}

// ─── getSolutionTypes ────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Parses solution-types.md and returns structured SolutionType objects.
 * - INPUTS: basePath — directory containing taxonomy markdown files (optional)
 * - OUTPUTS: Array of SolutionType; one per H3 heading in the Solution Types section
 * - ERRORS: throws if solution-types.md cannot be read
 * - SIDE EFFECTS: synchronous file I/O once per call
 * - INVARIANTS: all names are non-empty strings
 */
export function getSolutionTypes(basePath: string = DEFAULT_TAXONOMY_PATH): SolutionType[] {
  const sections = readH3Sections(basePath, "solution-types.md");
  // Exclude template/example H3s that start with "[" — these are documentation scaffolding.
  const realSections = sections.filter((block) => !/^### \[/.test(block));
  return realSections.map((block): SolutionType => {
    const headingMatch = /^### (.+)/.exec(block);
    const rawHeading = headingMatch ? headingMatch[1].trim() : "";
    const name = stripNumericPrefix(rawHeading);
    const description = extractFirstParagraph(block);

    // solution-types.md does not have plausibility/practicality values in the taxonomy
    // definition itself — those appear per-incident. Use empty strings as placeholders.
    return {
      name,
      description,
      plausibilityRange: "",
      practicalityRange: "",
    };
  });
}
