import type { Severity } from "@/lib/content/types";
import { SEVERITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a pill-shaped badge displaying an incident severity level.
 * - INPUTS: severity (one of Critical/High/Medium/Low), optional className
 * - OUTPUTS: A <span> element with colored dot, severity text, severity-keyed colors
 * - ERRORS: None — all severity values are typed exhaustively
 * - SIDE EFFECTS: None
 * - INVARIANTS: Dot and text always use the same severity color token
 */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-[4px]", className)}
      style={{
        color: SEVERITY_COLORS[severity].text,
        backgroundColor: SEVERITY_COLORS[severity].bg,
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: SEVERITY_COLORS[severity].text,
          flexShrink: 0,
        }}
      />
      {severity}
    </span>
  );
}
