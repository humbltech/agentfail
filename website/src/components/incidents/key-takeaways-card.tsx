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
        padding: "28px 32px",
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
          marginBottom: "20px",
        }}
      >
        Key Takeaways
      </div>
      <MarkdownContent
        html={html}
        className="prose-li:mb-6 prose-ol:space-y-2 prose-p:mb-3"
      />
    </div>
  );
}
