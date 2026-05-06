import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

import type { IncidentSection } from "@/lib/content/types";

// ─── Rendering pipeline ────────────────────────────────────────────────────────

/**
 * Renders a markdown string to an HTML string.
 *
 * CONTRACT:
 * - Input: raw markdown string (may be empty)
 * - Output: HTML string (may be empty string for empty input)
 * - Errors: propagates any unified processor errors
 * - Side effects: none
 * - Invariants: output is always a string; GFM features and heading slugs are applied
 */
export async function renderMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return String(file);
}

// ─── Section splitter ──────────────────────────────────────────────────────────

/**
 * Splits a markdown body into sections at H2 (`## `) boundaries.
 *
 * CONTRACT:
 * - Input: raw markdown string (may be empty or contain no H2 headings)
 * - Output: array of IncidentSection (empty array when there are no H2 headings)
 * - Errors: propagates any renderMarkdown errors
 * - Side effects: none
 * - Invariants:
 *   - Each section.level === 2
 *   - Each section.id is the slugified heading text
 *   - H3+ headings inside an H2 section remain in that section's html
 */
export async function splitIntoSections(content: string): Promise<IncidentSection[]> {
  if (!content.trim()) {
    return [];
  }

  // Split on lines that start a new H2 heading.
  // We keep the delimiter at the start of each chunk by using a lookahead.
  const H2_BOUNDARY = /^(?=## )/m;
  const rawChunks = content.split(H2_BOUNDARY);

  // Filter to only chunks that actually start with an H2
  const h2Chunks = rawChunks.filter((chunk) => chunk.trimStart().startsWith("## "));

  if (h2Chunks.length === 0) {
    return [];
  }

  const sections: IncidentSection[] = await Promise.all(
    h2Chunks.map(async (chunk): Promise<IncidentSection> => {
      // First line is the H2 heading: "## Heading Text\n..."
      const firstNewline = chunk.indexOf("\n");
      const headingLine = firstNewline === -1 ? chunk : chunk.slice(0, firstNewline);
      const bodyContent = firstNewline === -1 ? "" : chunk.slice(firstNewline + 1);

      // Extract heading text (strip leading "## " and trim)
      const title = headingLine.replace(/^##\s+/, "").trim();

      // Slugify: lowercase, replace non-alphanumeric runs with hyphens, trim hyphens
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Render the body content (everything after the H2 line) to HTML
      const html = await renderMarkdown(bodyContent.trim());

      return { id, title, level: 2, html };
    }),
  );

  return sections;
}
