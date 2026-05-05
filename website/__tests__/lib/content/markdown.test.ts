import { describe, it, expect } from "vitest";
import { renderMarkdown, splitIntoSections } from "@/lib/content/markdown";

// ─── renderMarkdown ────────────────────────────────────────────────────────────

describe("renderMarkdown — GFM tables", () => {
  it("renders a markdown table to HTML table elements", async () => {
    const input = `
| Date | Event |
|------|-------|
| Apr 2 | Loop started |
`.trim();
    const html = await renderMarkdown(input);
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
    expect(html).toContain("Loop started");
  });
});

describe("renderMarkdown — heading slugs", () => {
  it("adds slug id to H2 headings", async () => {
    const input = "## Executive Summary";
    const html = await renderMarkdown(input);
    expect(html).toContain('id="executive-summary"');
    expect(html).toContain("<h2");
  });

  it("adds slug id to H3 headings", async () => {
    const input = "### Technical Detail";
    const html = await renderMarkdown(input);
    expect(html).toContain('id="technical-detail"');
    expect(html).toContain("<h3");
  });
});

describe("renderMarkdown — code blocks", () => {
  it("renders fenced code blocks as pre > code", async () => {
    const input = "```\nconsole.log('hello');\n```";
    const html = await renderMarkdown(input);
    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("console.log");
  });
});

describe("renderMarkdown — links", () => {
  it("renders inline links to anchor elements", async () => {
    const input = "[AgentFail](https://agentfail.com)";
    const html = await renderMarkdown(input);
    expect(html).toContain('<a href="https://agentfail.com"');
    expect(html).toContain("AgentFail");
  });
});

// ─── splitIntoSections ─────────────────────────────────────────────────────────

const SAMPLE_MARKDOWN = `## Executive Summary

This is the summary.

## Timeline

| Date | Event |
|------|-------|
| Apr 2 | Loop started |

## What Happened

The agent ran a loop.

### Technical Detail

More detail here.
`.trim();

describe("splitIntoSections — basic splitting", () => {
  it("returns 3 sections for markdown with 3 H2 headings", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    expect(sections).toHaveLength(3);
  });

  it("first section has correct id, title, and level", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    expect(sections[0].id).toBe("executive-summary");
    expect(sections[0].title).toBe("Executive Summary");
    expect(sections[0].level).toBe(2);
  });

  it("second section has correct id, title, and level", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    expect(sections[1].id).toBe("timeline");
    expect(sections[1].title).toBe("Timeline");
    expect(sections[1].level).toBe(2);
  });

  it("third section has correct id, title, and level", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    expect(sections[2].id).toBe("what-happened");
    expect(sections[2].title).toBe("What Happened");
    expect(sections[2].level).toBe(2);
  });

  it("each section has an html string", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    for (const section of sections) {
      expect(typeof section.html).toBe("string");
      expect(section.html.length).toBeGreaterThan(0);
    }
  });
});

describe("splitIntoSections — section content", () => {
  it("first section html contains summary text", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    expect(sections[0].html).toContain("This is the summary");
  });

  it("second section html contains the GFM table", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    expect(sections[1].html).toContain("<table");
    expect(sections[1].html).toContain("Loop started");
  });

  it("H3 subsections stay inside the parent H2 section html", async () => {
    const sections = await splitIntoSections(SAMPLE_MARKDOWN);
    const whatHappened = sections[2];
    // The H3 "Technical Detail" should be rendered inside the third section
    expect(whatHappened.html).toContain("Technical Detail");
    expect(whatHappened.html).toContain("More detail here");
    // There should still be only 3 top-level sections (H3 does not create a new section)
    expect(sections).toHaveLength(3);
  });
});

describe("splitIntoSections — edge cases", () => {
  it("returns empty array for empty content", async () => {
    const sections = await splitIntoSections("");
    expect(sections).toHaveLength(0);
  });

  it("returns empty array for content with no H2 headings", async () => {
    const sections = await splitIntoSections("Just a paragraph.\n\nAnother paragraph.");
    expect(sections).toHaveLength(0);
  });

  it("returns empty array for whitespace-only content", async () => {
    const sections = await splitIntoSections("   \n\n   ");
    expect(sections).toHaveLength(0);
  });
});
