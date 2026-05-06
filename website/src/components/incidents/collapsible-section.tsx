"use client";

import { ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  id: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}

/** Collapsible content section using native details/summary. */
export function CollapsibleSection({
  title,
  id,
  defaultOpen,
  children,
}: CollapsibleSectionProps) {
  return (
    <details id={id} open={defaultOpen} className="group" style={{ paddingTop: "32px", paddingBottom: "32px" }}>
      <summary
        className="list-none"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          borderLeft: "4px solid var(--accent)",
          paddingLeft: "12px",
          userSelect: "none",
        }}
      >
        <ChevronRight
          size={18}
          className="transition-transform duration-200 group-open:rotate-90"
          style={{ color: "var(--text-muted)", flexShrink: 0 }}
          aria-hidden="true"
        />
        <h2
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </summary>
      <div style={{ marginTop: "20px" }}>{children}</div>
    </details>
  );
}
