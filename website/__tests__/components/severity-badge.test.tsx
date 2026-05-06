import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SeverityBadge } from "@/components/incidents/severity-badge";
import { SEVERITY_COLORS } from "@/lib/constants";
import type { Severity } from "@/lib/content/types";

describe("SeverityBadge", () => {
  const severities: Severity[] = ["Critical", "High", "Medium", "Low"];

  severities.forEach((severity) => {
    it(`renders "${severity}" severity label`, () => {
      render(<SeverityBadge severity={severity} />);
      expect(screen.getByText(severity)).toBeInTheDocument();
    });

    it(`applies correct text color for "${severity}"`, () => {
      const { container } = render(<SeverityBadge severity={severity} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.color).toBe(SEVERITY_COLORS[severity].text);
    });

    it(`applies correct background color for "${severity}"`, () => {
      const { container } = render(<SeverityBadge severity={severity} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.backgroundColor).toBe(SEVERITY_COLORS[severity].bg);
    });

    it(`renders the colored dot for "${severity}"`, () => {
      const { container } = render(<SeverityBadge severity={severity} />);
      // The dot is a span with aria-hidden="true" and a borderRadius style
      const dot = container.querySelector("span[aria-hidden='true']");
      expect(dot).toBeInTheDocument();
      expect((dot as HTMLElement).style.borderRadius).toBe("50%");
    });
  });

  it("passes custom className through to the badge element", () => {
    const { container } = render(
      <SeverityBadge severity="High" className="custom-test-class" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.classList.contains("custom-test-class")).toBe(true);
  });
});
