import { MarkdownContent } from "@/components/incidents/markdown-content";

interface KeyTakeawaysCardProps {
  html: string;
}

/** Accent callout card for key takeaways extracted from the incident. */
export function KeyTakeawaysCard({ html }: KeyTakeawaysCardProps) {
  if (!html) return null;

  return (
    <div
      style={{
        background: "var(--accent-dim)",
        borderLeft: "4px solid var(--accent)",
        padding: "24px 28px",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "12px",
        }}
      >
        Key Takeaways
      </div>
      <MarkdownContent html={html} />
    </div>
  );
}
