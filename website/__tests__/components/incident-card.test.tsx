import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IncidentCard } from "@/components/incidents/incident-card";
import type { IncidentCard as IncidentCardType } from "@/lib/content/types";

// ─── Fixture ──────────────────────────────────────────────────────────────────

const mockIncident: IncidentCardType = {
  id: "AAGF-2026-001",
  title: "Test Incident Title",
  slug: "AAGF-2026-001",
  date_occurred: "2026-04-02",
  severity: "High",
  category: [
    "Financial loss (unauthorized transactions, billing errors)",
    "Tool misuse / unintended tool execution",
    "Autonomous escalation (exceeded intended scope)",
  ],
  agent_type: ["Coding assistants (Claude Code)"],
  platform: "Anthropic",
  headline_stat: "$6,000 in 26 hours",
  operator_tldr: "Set a spending cap before running unattended workflows.",
  financial_impact_usd: 6000,
  vendor_response: "none",
  tags: ["billing", "runaway"],
  pattern_group: "runaway-context-loop",
  public_attention: "viral",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("IncidentCard", () => {
  it("renders the incident title", () => {
    render(<IncidentCard incident={mockIncident} />);
    expect(screen.getByText("Test Incident Title")).toBeInTheDocument();
  });

  it("renders the severity badge", () => {
    render(<IncidentCard incident={mockIncident} />);
    // SeverityBadge renders the severity text
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders the formatted date", () => {
    render(<IncidentCard incident={mockIncident} />);
    // formatDate("2026-04-02") → "Apr 2, 2026"
    expect(screen.getByText("Apr 2, 2026")).toBeInTheDocument();
  });

  it("renders the incident ID", () => {
    render(<IncidentCard incident={mockIncident} />);
    expect(screen.getByText("AAGF-2026-001")).toBeInTheDocument();
  });

  it("renders the headline_stat", () => {
    render(<IncidentCard incident={mockIncident} />);
    expect(screen.getByText("$6,000 in 26 hours")).toBeInTheDocument();
  });

  it("renders the operator_tldr", () => {
    render(<IncidentCard incident={mockIncident} />);
    expect(
      screen.getByText("Set a spending cap before running unattended workflows.")
    ).toBeInTheDocument();
  });

  it("links to /incidents/[slug]", () => {
    render(<IncidentCard incident={mockIncident} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/incidents/AAGF-2026-001");
  });

  it("shows only first 2 category tags when more than 2 categories exist", () => {
    render(<IncidentCard incident={mockIncident} />);
    // First category display name (before "(") → "Financial loss"
    expect(screen.getByText("Financial loss")).toBeInTheDocument();
    // Second category has no parens → full string displayed
    expect(
      screen.getByText("Tool misuse / unintended tool execution")
    ).toBeInTheDocument();
    // Third category should NOT be visible as a pill
    expect(screen.queryByText("Autonomous escalation")).not.toBeInTheDocument();
  });

  it("shows '+N more' pill when there are more than 2 categories", () => {
    render(<IncidentCard incident={mockIncident} />);
    // 3 categories total, 2 shown → "+1 more"
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("does not show '+N more' when there are 2 or fewer categories", () => {
    const incident: IncidentCardType = {
      ...mockIncident,
      category: [
        "Financial loss (unauthorized transactions, billing errors)",
        "Tool misuse / unintended tool execution",
      ],
    };
    render(<IncidentCard incident={incident} />);
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it("formats vendor_response 'none' as 'No response'", () => {
    render(<IncidentCard incident={mockIncident} />);
    expect(screen.getByText("No response")).toBeInTheDocument();
  });

  it("formats vendor_response 'acknowledged' as 'Acknowledged'", () => {
    const incident: IncidentCardType = {
      ...mockIncident,
      vendor_response: "acknowledged",
    };
    render(<IncidentCard incident={incident} />);
    expect(screen.getByText("Acknowledged")).toBeInTheDocument();
  });

  it("formats vendor_response 'fixed' as 'Fixed'", () => {
    const incident: IncidentCardType = { ...mockIncident, vendor_response: "fixed" };
    render(<IncidentCard incident={incident} />);
    expect(screen.getByText("Fixed")).toBeInTheDocument();
  });

  it("formats vendor_response 'refund_issued' as 'Refund issued'", () => {
    const incident: IncidentCardType = {
      ...mockIncident,
      vendor_response: "refund_issued",
    };
    render(<IncidentCard incident={incident} />);
    expect(screen.getByText("Refund issued")).toBeInTheDocument();
  });

  it("formats vendor_response 'disputed' as 'Disputed'", () => {
    const incident: IncidentCardType = {
      ...mockIncident,
      vendor_response: "disputed",
    };
    render(<IncidentCard incident={incident} />);
    expect(screen.getByText("Disputed")).toBeInTheDocument();
  });

  it("formats vendor_response 'disputed_then_refund_issued' as 'Disputed, then refunded'", () => {
    const incident: IncidentCardType = {
      ...mockIncident,
      vendor_response: "disputed_then_refund_issued",
    };
    render(<IncidentCard incident={incident} />);
    expect(screen.getByText("Disputed, then refunded")).toBeInTheDocument();
  });

  it("passes custom className through to the card element", () => {
    const { container } = render(
      <IncidentCard incident={mockIncident} className="custom-test-class" />
    );
    const link = container.firstChild as HTMLElement;
    expect(link.classList.contains("custom-test-class")).toBe(true);
  });

  it("renders the platform in the meta row", () => {
    render(<IncidentCard incident={mockIncident} />);
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
  });
});
