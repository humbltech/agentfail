interface TimelineEntry {
  date: string;
  event: string;
}

interface VisualTimelineProps {
  html: string;
}

/** Parses a timeline HTML table and renders as a vertical timeline. */
export function VisualTimeline({ html }: VisualTimelineProps) {
  const entries = parseTimelineTable(html);

  if (entries.length === 0) {
    return (
      <div
        className="prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-td:text-[var(--text-secondary)] prose-th:text-[var(--text-primary)] prose-th:bg-[var(--bg-surface)] prose-table:border-collapse prose-th:border prose-th:border-[var(--border-visible)] prose-td:border prose-td:border-[var(--border-subtle)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      style={{
        borderLeft: "2px solid var(--border-visible)",
        paddingLeft: "24px",
      }}
    >
      {entries.map((entry, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            marginBottom: i < entries.length - 1 ? "20px" : "0",
          }}
        >
          {/* Dot */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-29px",
              top: "5px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
            }}
          />
          <div
            className="font-mono"
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "2px",
            }}
          >
            {entry.date}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: "1.5",
            }}
            dangerouslySetInnerHTML={{ __html: entry.event }}
          />
        </div>
      ))}
    </div>
  );
}

function parseTimelineTable(html: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  // Match table rows, skipping the header row (first <tr> with <th>)
  const rowRegex = /<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(html)) !== null) {
    const date = match[1].replace(/<[^>]+>/g, "").trim();
    const event = match[2].trim();
    if (date && event) {
      entries.push({ date, event });
    }
  }
  return entries;
}
