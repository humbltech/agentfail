import { ExternalLink } from "lucide-react";
import type { FrameworkRefs } from "@/lib/content/types";
import { FRAMEWORK_URLS } from "@/lib/constants";

const FRAMEWORK_LABELS: Record<keyof FrameworkRefs, string> = {
  mitre_atlas: "MITRE ATLAS",
  owasp_llm: "OWASP LLM Top 10",
  owasp_agentic: "OWASP Agentic",
  ttps_ai: "TTPs.AI",
} satisfies Record<keyof FrameworkRefs, string>;

interface FrameworkSectionProps {
  label: string;
  ids: string[];
  urlBuilder: (id: string) => string;
}

/** Renders a labelled section of framework reference pills. */
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
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {ids.map((id) => (
          <a
            key={id}
            href={urlBuilder(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="framework-pill inline-flex items-center gap-1"
          >
            {id}
            <ExternalLink
              size={10}
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

interface FrameworkRefsProps {
  refs: FrameworkRefs;
}

/** Renders framework reference sections as horizontal pill tags. */
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
