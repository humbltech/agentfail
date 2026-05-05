import path from "path";
import { describe, it, expect } from "vitest";
import {
  getCategories,
  getSeverityLevels,
  getAgentTypes,
  getSolutionTypes,
} from "@/lib/content/taxonomy";

// Tests run against the REAL taxonomy files, not fixtures.
// Path: from this test file (__tests__/lib/content/), go up 4 levels to project root,
// then into taxonomy/.
const TAXONOMY_PATH = path.resolve(__dirname, "../../../../taxonomy");

describe("getCategories", () => {
  it("returns 13 items", () => {
    const cats = getCategories(TAXONOMY_PATH);
    expect(cats).toHaveLength(13);
  });

  it("first category has name, slug, description, examples", () => {
    const cats = getCategories(TAXONOMY_PATH);
    const first = cats[0];
    expect(first.name).toBeTruthy();
    expect(first.slug).toBeTruthy();
    expect(first.description).toBeTruthy();
    expect(first.examples).toBeTruthy();
  });

  it("first category name strips the numeric prefix", () => {
    const cats = getCategories(TAXONOMY_PATH);
    // Should be "Unauthorized Data Access / Exfiltration" — not "1. Unauthorized..."
    expect(cats[0].name).not.toMatch(/^\d+\./);
  });

  it("first category slug is url-safe lowercase", () => {
    const cats = getCategories(TAXONOMY_PATH);
    expect(cats[0].slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("every category has a non-empty name, slug, description, and examples", () => {
    const cats = getCategories(TAXONOMY_PATH);
    for (const cat of cats) {
      expect(cat.name.length, `name empty for ${cat.slug}`).toBeGreaterThan(0);
      expect(cat.slug.length, `slug empty for ${cat.name}`).toBeGreaterThan(0);
      expect(cat.description.length, `description empty for ${cat.name}`).toBeGreaterThan(0);
      expect(cat.examples.length, `examples empty for ${cat.name}`).toBeGreaterThan(0);
    }
  });
});

describe("getSeverityLevels", () => {
  it("returns 4 items", () => {
    const levels = getSeverityLevels(TAXONOMY_PATH);
    expect(levels).toHaveLength(4);
  });

  it("names match the Severity union type", () => {
    const levels = getSeverityLevels(TAXONOMY_PATH);
    const names = levels.map((l) => l.name);
    expect(names).toContain("Critical");
    expect(names).toContain("High");
    expect(names).toContain("Medium");
    expect(names).toContain("Low");
  });

  it("every level has at least one criterion", () => {
    const levels = getSeverityLevels(TAXONOMY_PATH);
    for (const level of levels) {
      expect(level.criteria.length, `no criteria for ${level.name}`).toBeGreaterThan(0);
    }
  });

  it("every level has a non-empty description", () => {
    const levels = getSeverityLevels(TAXONOMY_PATH);
    for (const level of levels) {
      expect(level.description.length, `no description for ${level.name}`).toBeGreaterThan(0);
    }
  });
});

describe("getAgentTypes", () => {
  it("returns 12 items", () => {
    const types = getAgentTypes(TAXONOMY_PATH);
    expect(types).toHaveLength(12);
  });

  it("every agent type has name, slug, description, products, risks", () => {
    const types = getAgentTypes(TAXONOMY_PATH);
    for (const t of types) {
      expect(t.name.length, `name empty for ${t.slug}`).toBeGreaterThan(0);
      expect(t.slug.length, `slug empty for ${t.name}`).toBeGreaterThan(0);
      expect(t.description.length, `description empty for ${t.name}`).toBeGreaterThan(0);
      expect(t.products.length, `no products for ${t.name}`).toBeGreaterThan(0);
      expect(t.risks.length, `no risks for ${t.name}`).toBeGreaterThan(0);
    }
  });

  it("slug is url-safe lowercase for all types", () => {
    const types = getAgentTypes(TAXONOMY_PATH);
    for (const t of types) {
      expect(t.slug, `invalid slug: ${t.slug}`).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("getSolutionTypes", () => {
  it("returns 10 items", () => {
    const solutions = getSolutionTypes(TAXONOMY_PATH);
    expect(solutions).toHaveLength(10);
  });

  it("every solution type has name and description", () => {
    const solutions = getSolutionTypes(TAXONOMY_PATH);
    for (const s of solutions) {
      expect(s.name.length, `name empty`).toBeGreaterThan(0);
      expect(s.description.length, `description empty for ${s.name}`).toBeGreaterThan(0);
    }
  });
});
