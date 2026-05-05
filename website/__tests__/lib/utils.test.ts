import { describe, it, expect } from "vitest";
import {
  slugify,
  formatDate,
  formatUSD,
  getCategorySlug,
  getAgentTypeSlug,
  cn,
} from "@/lib/utils";

describe("slugify", () => {
  it("converts a category string to a URL-safe slug", () => {
    expect(slugify("Financial loss (unauthorized transactions, billing errors)")).toBe(
      "financial-loss-unauthorized-transactions-billing-errors"
    );
  });

  it("handles simple strings", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("handles strings with leading/trailing hyphens", () => {
    expect(slugify("  some text  ")).toBe("some-text");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("collapses multiple consecutive non-alphanumeric chars into one hyphen", () => {
    expect(slugify("foo--bar___baz")).toBe("foo-bar-baz");
  });

  it("lowercases all characters", () => {
    expect(slugify("UPPERCASE")).toBe("uppercase");
  });
});

describe("formatDate", () => {
  it('formats "2026-04-02" to "Apr 2, 2026"', () => {
    expect(formatDate("2026-04-02")).toBe("Apr 2, 2026");
  });

  it('formats "2026-01-15" to "Jan 15, 2026"', () => {
    expect(formatDate("2026-01-15")).toBe("Jan 15, 2026");
  });

  it('formats "2026-12-31" correctly', () => {
    expect(formatDate("2026-12-31")).toBe("Dec 31, 2026");
  });
});

describe("formatUSD", () => {
  it('formats 6000 to "$6,000"', () => {
    expect(formatUSD(6000)).toBe("$6,000");
  });

  it('formats 1818 to "$1,818"', () => {
    expect(formatUSD(1818)).toBe("$1,818");
  });

  it('formats 0 to "$0"', () => {
    expect(formatUSD(0)).toBe("$0");
  });

  it('returns "Unknown" for null', () => {
    expect(formatUSD(null)).toBe("Unknown");
  });

  it("truncates decimals (no cents)", () => {
    expect(formatUSD(1500.99)).toBe("$1,501");
  });
});

describe("getCategorySlug", () => {
  it("returns the mapped slug for a known category (exact match)", () => {
    expect(getCategorySlug("Financial loss (unauthorized transactions, billing errors)")).toBe(
      "financial-loss"
    );
  });

  it("returns the mapped slug for another known category", () => {
    expect(getCategorySlug("Hallucinated actions")).toBe("hallucinated-actions");
  });

  it("returns the mapped slug case-insensitively", () => {
    expect(getCategorySlug("financial loss (unauthorized transactions, billing errors)")).toBe(
      "financial-loss"
    );
  });

  it("falls back to slugify for an unknown category", () => {
    expect(getCategorySlug("Some Brand New Category")).toBe("some-brand-new-category");
  });

  it("handles empty string", () => {
    expect(getCategorySlug("")).toBe("");
  });
});

describe("getAgentTypeSlug", () => {
  it("returns the mapped slug for a known agent type (exact match)", () => {
    expect(
      getAgentTypeSlug("Coding assistants (Copilot, Claude Code, Cursor, Devin)")
    ).toBe("coding-assistants");
  });

  it("returns the mapped slug for another known agent type", () => {
    expect(getAgentTypeSlug("Customer service bots")).toBe("customer-service");
  });

  it("returns the mapped slug case-insensitively", () => {
    expect(
      getAgentTypeSlug("coding assistants (copilot, claude code, cursor, devin)")
    ).toBe("coding-assistants");
  });

  it("falls back to slugify for an unknown agent type", () => {
    expect(getAgentTypeSlug("Some Custom Agent")).toBe("some-custom-agent");
  });

  it("handles empty string", () => {
    expect(getAgentTypeSlug("")).toBe("");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts (later class wins)", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "nope", "yes")).toBe("base yes");
  });

  it("handles undefined and null values gracefully", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("handles empty call", () => {
    expect(cn()).toBe("");
  });
});
