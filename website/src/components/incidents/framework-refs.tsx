import { ExternalLink } from "lucide-react";
import type { FrameworkRefs } from "@/lib/content/types";
import { FRAMEWORK_URLS } from "@/lib/constants";

// ─── Display labels for each framework ───────────────────────────────────────

const FRAMEWORK_LABELS: Record<keyof FrameworkRefs, string> = {
  mitre_atlas: "MITRE ATLAS",
  owasp_llm: "OWASP LLM Top 10",
  owasp_agentic: "OWASP Agentic",
  ttps_ai: "TTPs.AI",
} satisfies Record<keyof FrameworkRefs, string>;

// ─── FrameworkSection ─────────────────────────────────────────────────────────

interface FrameworkSectionProps {
  label: string;
  ids: string[];
  urlBuilder: (id: string) => string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a labelled section of framework reference links.
 * - INPUTS: label (display name), ids (ref IDs), urlBuilder (maps ID → URL)
 * - OUTPUTS: A section with a label heading and a list of external links
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Only rendered when ids.length > 0
 */
function FrameworkSection({ label, ids, urlBuilder }: FrameworkSectionProps) {
  if (ids.length === 0) return null;

  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {ids.map((id) => (
          <li key={id}>
            <a
              href={urlBuilder(id)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent-mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              {id}
              <ExternalLink
                size={11}
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── FrameworkRefs ────────────────────────────────────────────────────────────

interface FrameworkRefsProps {
  refs: FrameworkRefs;
}

/**
 * CONTRACT:
 * - WHAT: Renders all non-empty framework reference sections for an incident.
 * - INPUTS: FrameworkRefs object with arrays for each framework
 * - OUTPUTS: A styled card with sections grouped by framework; empty sections omitted
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - If all arrays are empty, returns null (no card rendered)
 *   - Only sections with at least one ID are shown
 *   - All links open in a new tab with noopener noreferrer
 */
export function FrameworkRefsCard({ refs }: FrameworkRefsProps) {
  const hasAny =
    refs.mitre_atlas.length > 0 ||
    refs.owasp_llm.length > 0 ||
    refs.owasp_agentic.length > 0 ||
    refs.ttps_ai.length > 0;

  if (!hasAny) return null;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "16px",
        }}
      >
        Framework References
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <FrameworkSection
          label={FRAMEWORK_LABELS.mitre_atlas}
          ids={refs.mitre_atlas}
          urlBuilder={FRAMEWORK_URLS.mitre_atlas}
        />
        <FrameworkSection
          label={FRAMEWORK_LABELS.owasp_llm}
          ids={refs.owasp_llm}
          urlBuilder={FRAMEWORK_URLS.owasp_llm}
        />
        <FrameworkSection
          label={FRAMEWORK_LABELS.owasp_agentic}
          ids={refs.owasp_agentic}
          urlBuilder={FRAMEWORK_URLS.owasp_agentic}
        />
        <FrameworkSection
          label={FRAMEWORK_LABELS.ttps_ai}
          ids={refs.ttps_ai}
          urlBuilder={FRAMEWORK_URLS.ttps_ai}
        />
      </div>
    </div>
  );
}
