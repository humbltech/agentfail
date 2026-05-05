import path from "path";
import { describe, it, expect } from "vitest";
import {
  getPatternGroups,
  getRootCauseClusters,
} from "@/lib/content/relationships";

// Tests run against the REAL relationships/graph.md, not fixtures.
const RELATIONSHIPS_PATH = path.resolve(__dirname, "../../../../relationships");

describe("getPatternGroups", () => {
  it("returns 4 groups", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    expect(groups).toHaveLength(4);
  });

  it("every group has slug, name, description, and incidentIds", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    for (const g of groups) {
      expect(g.slug.length, `slug empty`).toBeGreaterThan(0);
      expect(g.name.length, `name empty for ${g.slug}`).toBeGreaterThan(0);
      expect(g.description.length, `description empty for ${g.slug}`).toBeGreaterThan(0);
      expect(g.incidentIds.length, `no incidentIds for ${g.slug}`).toBeGreaterThan(0);
    }
  });

  it("all slugs are kebab-case", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    for (const g of groups) {
      expect(g.slug, `invalid slug: ${g.slug}`).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("runaway-context-loop group has exactly 2 incident IDs", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    const group = groups.find((g) => g.slug === "runaway-context-loop");
    expect(group).toBeDefined();
    expect(group!.incidentIds).toHaveLength(2);
    expect(group!.incidentIds).toContain("AAGF-2026-001");
    expect(group!.incidentIds).toContain("AAGF-2026-003");
  });

  it("billing-path-opacity group has exactly 3 incident IDs", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    const group = groups.find((g) => g.slug === "billing-path-opacity");
    expect(group).toBeDefined();
    expect(group!.incidentIds).toHaveLength(3);
    expect(group!.incidentIds).toContain("AAGF-2026-002");
    expect(group!.incidentIds).toContain("AAGF-2026-004");
    expect(group!.incidentIds).toContain("AAGF-2026-005");
  });

  it("autonomous-infrastructure-destruction group has 1 incident", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    const group = groups.find((g) => g.slug === "autonomous-infrastructure-destruction");
    expect(group).toBeDefined();
    expect(group!.incidentIds).toHaveLength(1);
    expect(group!.incidentIds).toContain("AAGF-2026-007");
  });

  it("wrong-cost-estimate group has 1 incident", () => {
    const groups = getPatternGroups(RELATIONSHIPS_PATH);
    const group = groups.find((g) => g.slug === "wrong-cost-estimate");
    expect(group).toBeDefined();
    expect(group!.incidentIds).toHaveLength(1);
    expect(group!.incidentIds).toContain("AAGF-2026-006");
  });
});

describe("getRootCauseClusters", () => {
  it("returns at least 5 clusters", () => {
    const clusters = getRootCauseClusters(RELATIONSHIPS_PATH);
    expect(clusters.length).toBeGreaterThanOrEqual(5);
  });

  it("every cluster has a name and incidentCount > 0", () => {
    const clusters = getRootCauseClusters(RELATIONSHIPS_PATH);
    for (const c of clusters) {
      expect(c.name.length, `name empty`).toBeGreaterThan(0);
      expect(c.incidentCount, `count 0 for ${c.name}`).toBeGreaterThan(0);
    }
  });

  it("No default spending cap cluster references 5 incidents", () => {
    const clusters = getRootCauseClusters(RELATIONSHIPS_PATH);
    const cluster = clusters.find((c) =>
      c.name.toLowerCase().includes("no default spending cap"),
    );
    expect(cluster).toBeDefined();
    expect(cluster!.incidentCount).toBe(5);
  });
});
