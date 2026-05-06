import path from "path";
import { describe, it, expect } from "vitest";
import {
  getAllIncidents,
  getIncidentBySlug,
  getAllIncidentCards,
  getUniqueCategories,
  getIncidentsByCategory,
  getIncidentsByPatternGroup,
  getStats,
} from "@/lib/content/incidents";

const FIXTURES_PATH = path.resolve(__dirname, "../../fixtures");

describe("getAllIncidents", () => {
  it("returns only published incidents — draft is excluded", async () => {
    const incidents = await getAllIncidents(FIXTURES_PATH);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].id).toBe("TEST-2026-001");
  });

  it("excludes TEMPLATE.md if present in the directory", async () => {
    const incidents = await getAllIncidents(FIXTURES_PATH);
    const ids = incidents.map((i) => i.id);
    expect(ids).not.toContain("TEMPLATE");
    expect(ids.some((id) => id.toUpperCase().includes("TEMPLATE"))).toBe(false);
  });

  it("sorts results by date_occurred descending (newest first)", async () => {
    const incidents = await getAllIncidents(FIXTURES_PATH);
    // Only one incident in fixtures; verify it has the expected date
    expect(incidents[0].date_occurred).toBe("2026-04-15");
  });

  it("parses scalar frontmatter fields correctly", async () => {
    const [incident] = await getAllIncidents(FIXTURES_PATH);
    expect(incident.id).toBe("TEST-2026-001");
    expect(incident.title).toBe("Test Incident: Agent Did Something Bad");
    expect(incident.severity).toBe("High");
    expect(incident.platform).toBe("Test Platform");
    expect(incident.financial_impact_usd).toBe(1000);
  });

  it("parses array frontmatter fields correctly", async () => {
    const [incident] = await getAllIncidents(FIXTURES_PATH);
    expect(incident.category).toEqual([
      "Financial loss (unauthorized transactions, billing errors)",
      "Tool misuse / unintended tool execution",
    ]);
  });

  it("parses nested affected_parties object correctly", async () => {
    const [incident] = await getAllIncidents(FIXTURES_PATH);
    expect(incident.affected_parties).toEqual({
      count: 1,
      scale: "individual",
      data_types_exposed: ["financial"],
    });
  });

  it("parses nested framework_refs object correctly", async () => {
    const [incident] = await getAllIncidents(FIXTURES_PATH);
    expect(incident.framework_refs).toEqual({
      mitre_atlas: ["AML.T0034"],
      owasp_llm: ["LLM06:2025"],
      owasp_agentic: [],
      ttps_ai: [],
    });
  });

  it("includes rendered contentHtml", async () => {
    const [incident] = await getAllIncidents(FIXTURES_PATH);
    expect(typeof incident.contentHtml).toBe("string");
    expect(incident.contentHtml.length).toBeGreaterThan(0);
    expect(incident.contentHtml).toContain("Executive Summary");
  });

  it("sets slug to the id value", async () => {
    const [incident] = await getAllIncidents(FIXTURES_PATH);
    expect(incident.slug).toBe("TEST-2026-001");
  });
});

describe("getIncidentBySlug", () => {
  it("returns the correct incident when slug matches", async () => {
    const incident = await getIncidentBySlug("TEST-2026-001", FIXTURES_PATH);
    expect(incident).not.toBeNull();
    expect(incident?.id).toBe("TEST-2026-001");
    expect(incident?.title).toBe("Test Incident: Agent Did Something Bad");
  });

  it("returns null for a non-existent slug", async () => {
    const incident = await getIncidentBySlug("NONEXISTENT", FIXTURES_PATH);
    expect(incident).toBeNull();
  });

  it("does not return a draft incident by slug", async () => {
    const incident = await getIncidentBySlug("TEST-2026-002", FIXTURES_PATH);
    expect(incident).toBeNull();
  });
});

describe("getAllIncidentCards", () => {
  it("returns lightweight card objects without contentHtml", async () => {
    const cards = await getAllIncidentCards(FIXTURES_PATH);
    expect(cards).toHaveLength(1);

    const card = cards[0];
    expect(card.id).toBe("TEST-2026-001");
    expect(card.title).toBe("Test Incident: Agent Did Something Bad");
    expect(card.slug).toBe("TEST-2026-001");
    expect(card.severity).toBe("High");

    // IncidentCard must NOT contain contentHtml
    expect("contentHtml" in card).toBe(false);
    expect("content" in card).toBe(false);
  });

  it("includes all required IncidentCard fields", async () => {
    const [card] = await getAllIncidentCards(FIXTURES_PATH);
    expect(card.date_occurred).toBe("2026-04-15");
    expect(card.platform).toBe("Test Platform");
    expect(card.headline_stat).toBe("$1,000 in 5 minutes");
    expect(card.operator_tldr).toBe("Set spending caps before running agents.");
    expect(card.financial_impact_usd).toBe(1000);
    expect(card.vendor_response).toBe("none");
    expect(card.tags).toEqual(["billing", "test"]);
    expect(card.pattern_group).toBe("test-pattern");
    expect(card.public_attention).toBe("medium");
  });
});

describe("getUniqueCategories", () => {
  it("returns deduplicated categories from published incidents", async () => {
    const categories = await getUniqueCategories(FIXTURES_PATH);
    expect(categories).toContain("Financial loss (unauthorized transactions, billing errors)");
    expect(categories).toContain("Tool misuse / unintended tool execution");
    // No duplicates
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });
});

describe("getIncidentsByCategory", () => {
  it("returns incidents with a case-insensitive partial category match", async () => {
    const cards = await getIncidentsByCategory("financial loss", FIXTURES_PATH);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe("TEST-2026-001");
  });

  it("returns empty array for a non-matching category", async () => {
    const cards = await getIncidentsByCategory("nonexistent category xyz", FIXTURES_PATH);
    expect(cards).toHaveLength(0);
  });

  it("is case-insensitive — uppercase query matches", async () => {
    const cards = await getIncidentsByCategory("FINANCIAL LOSS", FIXTURES_PATH);
    expect(cards).toHaveLength(1);
  });
});

describe("getIncidentsByPatternGroup", () => {
  it("returns incidents matching the pattern group", async () => {
    const cards = await getIncidentsByPatternGroup("test-pattern", FIXTURES_PATH);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe("TEST-2026-001");
  });

  it("returns empty array for non-matching pattern group", async () => {
    const cards = await getIncidentsByPatternGroup("no-such-group", FIXTURES_PATH);
    expect(cards).toHaveLength(0);
  });
});

describe("getStats", () => {
  it("returns correct aggregate stats from fixtures", async () => {
    const stats = await getStats(FIXTURES_PATH);
    expect(stats.total).toBe(1);
    expect(stats.totalFinancialImpact).toBe(1000);
    // Categories from the one published incident
    expect(stats.categories).toBeGreaterThan(0);
    expect(stats.platforms).toBeGreaterThan(0);
  });
});
