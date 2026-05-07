import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DamageBreakdownCard } from "@/components/incidents/damage-breakdown-card";
import type { Incident } from "@/lib/content/types";

// ─── Base fixture (no damage estimate) ───────────────────────────────────────

const baseIncident: Incident = {
  id: "AAGF-2026-001",
  title: "Test Incident",
  status: "published",
  date_occurred: "2026-04-02",
  date_discovered: "2026-04-02",
  date_reported: "2026-04-03",
  date_curated: "2026-05-01",
  date_council_reviewed: "2026-05-01",
  slug: "AAGF-2026-001",
  content: "# Test",
  contentHtml: "<h1>Test</h1>",
  category: ["Financial loss (unauthorized transactions, billing errors)"],
  severity: "High",
  agent_type: ["Coding assistants (Claude Code)"],
  agent_name: "Claude Code",
  platform: "Anthropic",
  industry: "Software Development",
  financial_impact: "$6,000 USD",
  financial_impact_usd: 6000,
  refund_status: "none",
  refund_amount_usd: null,
  affected_parties: { count: 1, scale: "individual", data_types_exposed: ["financial"] },
  damage_speed: "26 hours",
  damage_duration: "26 hours",
  total_damage_window: "26 hours",
  recovery_time: "2 hours",
  recovery_labor_hours: 2,
  recovery_cost_usd: null,
  recovery_cost_notes: "",
  full_recovery_achieved: "yes",
  business_scope: "individual",
  business_criticality: "medium",
  business_criticality_notes: "",
  systems_affected: ["billing"],
  vendor_response: "none",
  vendor_response_time: "none",
  headline_stat: "$6,000 in 26 hours",
  operator_tldr: "Set a spending cap.",
  containment_method: "usage_limit",
  public_attention: "viral",
  framework_refs: { mitre_atlas: [], owasp_llm: [], owasp_agentic: [], ttps_ai: [] },
  related_incidents: [],
  pattern_group: "",
  tags: [],
  sources: [],
  researcher_notes: "",
  council_verdict: "",
  actual_vs_potential: null,
  potential_damage: null,
  intervention: null,
  damage_estimate: null,
  visibility: "public",
  internal_notes: "",
  sections: [],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DamageBreakdownCard", () => {
  it("renders nothing when damage_estimate is null", () => {
    const { container } = render(<DamageBreakdownCard incident={baseIncident} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when all damage values are null", () => {
    const incident: Incident = {
      ...baseIncident,
      damage_estimate: {
        confirmed_loss_usd: null,
        recovery_cost_usd: null,
        averted_damage_usd: null,
        averted_range_low: null,
        averted_range_high: null,
        composite_damage_usd: null,
        confidence: "",
        probability_weight: null,
        methodology: "",
        methodology_detail: {
          per_unit_cost_usd: null,
          unit_count: null,
          unit_type: "",
          multiplier: null,
          benchmark_source: "",
        },
        estimation_date: "",
        human_override: false,
        notes: "",
      },
    };
    const { container } = render(<DamageBreakdownCard incident={incident} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the card when confirmed_loss_usd is present", () => {
    const incident: Incident = {
      ...baseIncident,
      damage_estimate: {
        confirmed_loss_usd: 6000,
        recovery_cost_usd: null,
        averted_damage_usd: null,
        averted_range_low: null,
        averted_range_high: null,
        composite_damage_usd: 6000,
        confidence: "cited",
        probability_weight: 1.0,
        methodology: "$6,000 direct API billing loss — cited in source reporting",
        methodology_detail: {
          per_unit_cost_usd: null,
          unit_count: null,
          unit_type: "",
          multiplier: null,
          benchmark_source: "Direct citation",
        },
        estimation_date: "2026-05-06",
        human_override: false,
        notes: "",
      },
    };
    render(<DamageBreakdownCard incident={incident} />);
    expect(screen.getByText("Damage Quantification")).toBeInTheDocument();
    // $6,000 appears in both the confirmed loss row and composite total
    expect(screen.getAllByText("$6,000").length).toBeGreaterThanOrEqual(1);
  });

  it("renders averted damage with star badge for 'estimated' confidence", () => {
    const incident: Incident = {
      ...baseIncident,
      damage_estimate: {
        confirmed_loss_usd: null,
        recovery_cost_usd: null,
        averted_damage_usd: 96400000,
        averted_range_low: 9640000,
        averted_range_high: 9640000000,
        composite_damage_usd: 96400000,
        confidence: "estimated",
        probability_weight: 0.01,
        methodology: "964K installs × $10K/machine × 1% exploitation",
        methodology_detail: {
          per_unit_cost_usd: 10000,
          unit_count: 964000,
          unit_type: "machine",
          multiplier: null,
          benchmark_source: "SANS 2024 IR Report",
        },
        estimation_date: "2026-05-06",
        human_override: false,
        notes: "PoC had syntax error — averted by accident.",
      },
    };
    render(<DamageBreakdownCard incident={incident} />);
    expect(screen.getByText("Damage Quantification")).toBeInTheDocument();
    // probability note
    expect(screen.getByText("1% exploitation probability")).toBeInTheDocument();
    // methodology
    expect(screen.getByText("964K installs × $10K/machine × 1% exploitation")).toBeInTheDocument();
    // benchmark source
    expect(screen.getByText("Benchmark: SANS 2024 IR Report")).toBeInTheDocument();
    // notes
    expect(screen.getByText("PoC had syntax error — averted by accident.")).toBeInTheDocument();
  });

  it("shows 'Documented total' label for cited confidence", () => {
    const incident: Incident = {
      ...baseIncident,
      damage_estimate: {
        confirmed_loss_usd: 6000,
        recovery_cost_usd: null,
        averted_damage_usd: null,
        averted_range_low: null,
        averted_range_high: null,
        composite_damage_usd: 6000,
        confidence: "cited",
        probability_weight: 1.0,
        methodology: "",
        methodology_detail: {
          per_unit_cost_usd: null,
          unit_count: null,
          unit_type: "",
          multiplier: null,
          benchmark_source: "",
        },
        estimation_date: "2026-05-06",
        human_override: false,
        notes: "",
      },
    };
    render(<DamageBreakdownCard incident={incident} />);
    expect(screen.getByText("Documented total")).toBeInTheDocument();
  });

  it("shows 'Estimated exposure ★★' label for order-of-magnitude confidence", () => {
    const incident: Incident = {
      ...baseIncident,
      damage_estimate: {
        confirmed_loss_usd: null,
        recovery_cost_usd: null,
        averted_damage_usd: 2475000,
        averted_range_low: 495000,
        averted_range_high: 247500000,
        composite_damage_usd: 2475000,
        confidence: "order-of-magnitude",
        probability_weight: 0.05,
        methodology: "50K deployments × $50K/org × 1% = $25M; no PoC, conservative",
        methodology_detail: {
          per_unit_cost_usd: 50000,
          unit_count: 50000,
          unit_type: "organization",
          multiplier: null,
          benchmark_source: "IBM CODB 2024",
        },
        estimation_date: "2026-05-06",
        human_override: false,
        notes: "",
      },
    };
    render(<DamageBreakdownCard incident={incident} />);
    expect(screen.getByText("Estimated exposure ★★")).toBeInTheDocument();
  });

  it("renders '—' for null recovery cost", () => {
    const incident: Incident = {
      ...baseIncident,
      damage_estimate: {
        confirmed_loss_usd: 6000,
        recovery_cost_usd: null,
        averted_damage_usd: null,
        averted_range_low: null,
        averted_range_high: null,
        composite_damage_usd: 6000,
        confidence: "cited",
        probability_weight: 1.0,
        methodology: "",
        methodology_detail: {
          per_unit_cost_usd: null,
          unit_count: null,
          unit_type: "",
          multiplier: null,
          benchmark_source: "",
        },
        estimation_date: "2026-05-06",
        human_override: false,
        notes: "",
      },
    };
    render(<DamageBreakdownCard incident={incident} />);
    // Recovery Cost row should show "—"
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
