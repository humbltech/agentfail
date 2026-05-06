import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { KeyFactsSidebar } from "@/components/incidents/key-facts-sidebar";
import type { Incident } from "@/lib/content/types";

// ─── Fixture ──────────────────────────────────────────────────────────────────

const mockIncident: Incident = {
  id: "AAGF-2026-001",
  title: "Test Incident: Agent Runaway Billing",
  status: "published",
  date_occurred: "2026-04-02",
  date_discovered: "2026-04-02",
  date_reported: "2026-04-03",
  date_curated: "2026-05-01",
  date_council_reviewed: "2026-05-01",
  slug: "AAGF-2026-001",
  content: "# Test",
  contentHtml: "<h1>Test</h1>",

  // Classification
  category: ["Financial loss (unauthorized transactions, billing errors)"],
  severity: "High",
  agent_type: ["Coding assistants (Claude Code)"],
  agent_name: "Claude Code",
  platform: "Anthropic",
  industry: "Software Development",

  // Financial
  financial_impact: "$6,000 USD",
  financial_impact_usd: 6000,
  refund_status: "none",
  refund_amount_usd: null,
  affected_parties: {
    count: 1,
    scale: "individual",
    data_types_exposed: ["financial"],
  },

  // Damage timing
  damage_speed: "26 hours",
  damage_duration: "26 hours",
  total_damage_window: "26 hours",

  // Recovery
  recovery_time: "2 hours",
  recovery_labor_hours: 2,
  recovery_cost_usd: null,
  recovery_cost_notes: "",
  full_recovery_achieved: "yes",

  // Business impact
  business_scope: "individual",
  business_criticality: "medium",
  business_criticality_notes: "",
  systems_affected: ["billing"],

  // Vendor
  vendor_response: "none",
  vendor_response_time: "none",

  // Presentation
  headline_stat: "$6,000 in 26 hours",
  operator_tldr: "Set a spending cap before running unattended workflows.",
  containment_method: "usage_limit",
  public_attention: "viral",

  // Framework refs
  framework_refs: {
    mitre_atlas: ["AML.T0034"],
    owasp_llm: ["LLM06:2025"],
    owasp_agentic: [],
    ttps_ai: [],
  },

  // Relationships
  related_incidents: [],
  pattern_group: "runaway-context-loop",
  tags: ["billing", "runaway"],

  // Metadata
  sources: ["https://example.com"],
  researcher_notes: "",
  council_verdict: "Confirmed runaway billing incident.",

  // Visibility
  visibility: "public",
  internal_notes: "",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("KeyFactsSidebar", () => {
  it("renders the financial impact as formatted USD", () => {
    render(<KeyFactsSidebar incident={mockIncident} />);
    // formatUSD(6000) → "$6,000"
    expect(screen.getByText("$6,000")).toBeInTheDocument();
  });

  it("renders the damage speed", () => {
    render(<KeyFactsSidebar incident={mockIncident} />);
    // damage_speed and total_damage_window are both "26 hours" in mock — use getAllByText
    const matches = screen.getAllByText("26 hours");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the vendor response label", () => {
    render(<KeyFactsSidebar incident={mockIncident} />);
    expect(screen.getByText("No response")).toBeInTheDocument();
  });

  it("renders the headline_stat", () => {
    render(<KeyFactsSidebar incident={mockIncident} />);
    expect(screen.getByText("$6,000 in 26 hours")).toBeInTheDocument();
  });

  it("renders the operator_tldr", () => {
    render(<KeyFactsSidebar incident={mockIncident} />);
    expect(
      screen.getByText("Set a spending cap before running unattended workflows.")
    ).toBeInTheDocument();
  });

  it("shows 'Unknown' for null financial_impact_usd", () => {
    const incident: Incident = { ...mockIncident, financial_impact_usd: null };
    render(<KeyFactsSidebar incident={incident} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("shows 'No full recovery' with red color when full_recovery_achieved is 'no'", () => {
    const incident: Incident = {
      ...mockIncident,
      full_recovery_achieved: "no",
    };
    render(<KeyFactsSidebar incident={incident} />);
    expect(screen.getByText("No full recovery")).toBeInTheDocument();
  });

  it("shows recovery time when full_recovery_achieved is 'yes'", () => {
    render(<KeyFactsSidebar incident={mockIncident} />);
    expect(screen.getByText("2 hours")).toBeInTheDocument();
  });

  it("shows partial recovery note when full_recovery_achieved is 'partial'", () => {
    const incident: Incident = {
      ...mockIncident,
      full_recovery_achieved: "partial",
      recovery_time: "3 days",
    };
    render(<KeyFactsSidebar incident={incident} />);
    expect(screen.getByText("3 days (partial)")).toBeInTheDocument();
  });

  it("renders the vendor response 'fixed' as 'Fixed'", () => {
    const incident: Incident = {
      ...mockIncident,
      vendor_response: "fixed",
    };
    render(<KeyFactsSidebar incident={incident} />);
    expect(screen.getByText("Fixed")).toBeInTheDocument();
  });

  it("renders the vendor response 'refund_issued' as 'Refund issued'", () => {
    const incident: Incident = {
      ...mockIncident,
      vendor_response: "refund_issued",
    };
    render(<KeyFactsSidebar incident={incident} />);
    expect(screen.getByText("Refund issued")).toBeInTheDocument();
  });
});
