import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";

describe("ConfidenceBadge", () => {
  it("renders nothing for 'cited' confidence", () => {
    const { container } = render(<ConfidenceBadge confidence="cited" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for empty string confidence", () => {
    const { container } = render(<ConfidenceBadge confidence="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders (i) icon for 'calculated' confidence", () => {
    render(<ConfidenceBadge confidence="calculated" />);
    const badge = screen.getByLabelText("Confidence: Calculated");
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain("i");
  });

  it("renders ★ for 'estimated' confidence", () => {
    render(<ConfidenceBadge confidence="estimated" />);
    const badge = screen.getByLabelText("Confidence: Estimated");
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain("★");
  });

  it("renders ★★ for 'order-of-magnitude' confidence", () => {
    render(<ConfidenceBadge confidence="order-of-magnitude" />);
    const badge = screen.getByLabelText("Confidence: Order of magnitude");
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain("★★");
  });

  it("does not render label text by default (showLabel=false)", () => {
    render(<ConfidenceBadge confidence="estimated" />);
    expect(screen.queryByText("Estimated")).not.toBeInTheDocument();
  });

  it("renders label text when showLabel=true", () => {
    render(<ConfidenceBadge confidence="estimated" showLabel />);
    expect(screen.getByText("Estimated")).toBeInTheDocument();
  });

  it("renders label text for 'calculated' when showLabel=true", () => {
    render(<ConfidenceBadge confidence="calculated" showLabel />);
    expect(screen.getByText("Calculated")).toBeInTheDocument();
  });

  it("renders label text for 'order-of-magnitude' when showLabel=true", () => {
    render(<ConfidenceBadge confidence="order-of-magnitude" showLabel />);
    expect(screen.getByText("Order of magnitude")).toBeInTheDocument();
  });
});
