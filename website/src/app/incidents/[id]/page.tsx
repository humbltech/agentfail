import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllIncidentCards, getAllIncidents, getIncidentBySlug } from "@/lib/content/incidents";
import { SITE_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { SeverityBadge } from "@/components/incidents/severity-badge";
import { CategoryTag } from "@/components/incidents/category-tag";
import { KeyFactsSidebar } from "@/components/incidents/key-facts-sidebar";
import { FrameworkRefsCard } from "@/components/incidents/framework-refs";
import { RelatedIncidents } from "@/components/incidents/related-incidents";
import { MarkdownContent } from "@/components/incidents/markdown-content";
import { JsonLd } from "@/components/shared/json-ld";

// ─── Static params ────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Pre-generates static routes for all published incidents at build time.
 * - OUTPUT: Array of { id } param objects — one per published incident
 * - SIDE EFFECTS: Filesystem reads via getAllIncidents (build-time only)
 */
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  const incidents = await getAllIncidents();
  return incidents.map((incident) => ({ id: incident.id }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Generates per-incident metadata for SEO and OG.
 * - INPUT: params.id → slug string
 * - OUTPUT: Metadata object with title, description, OG tags
 * - ERRORS: Returns fallback metadata if incident not found (notFound() handles the page)
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const incident = await getIncidentBySlug(id);

  if (!incident) {
    return { title: "Incident Not Found — AgentFail" };
  }

  const title = `${incident.id}: ${incident.title} — AgentFail`;
  const description = incident.operator_tldr || incident.headline_stat;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_META.url}/incidents/${incident.id}`,
      siteName: SITE_META.name,
      type: "article",
      publishedTime: incident.date_reported,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Renders the full detail page for a single published incident.
 * - INPUT: params.id — incident ID (e.g. "AAGF-2026-001")
 * - OUTPUT: Full incident layout: header, two-column body, related incidents, sources
 * - ERRORS: Calls notFound() when incident is null (renders 404)
 * - SIDE EFFECTS: Filesystem reads at build time (static generation)
 * - INVARIANTS:
 *   - Page is always statically generated (no dynamic data fetching)
 *   - Sidebar is sticky on desktop, stacked above content on mobile
 */
export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [incident, allCards] = await Promise.all([
    getIncidentBySlug(id),
    getAllIncidentCards(),
  ]);

  if (!incident) {
    notFound();
  }

  // JSON-LD: Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: incident.title,
    description: incident.operator_tldr,
    datePublished: incident.date_reported,
    dateModified: incident.date_reported,
    publisher: {
      "@type": "Organization",
      name: SITE_META.name,
      url: SITE_META.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_META.url}/incidents/${incident.id}`,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "20px" }}>
          <ol
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "4px",
              listStyle: "none",
              margin: 0,
              padding: 0,
              fontSize: "13px",
              color: "var(--text-muted)",
            }}
          >
            <li>
              <Link href="/incidents" className="link-muted">
                Incidents
              </Link>
            </li>
            <li aria-hidden="true" style={{ color: "var(--text-muted)" }}>
              /
            </li>
            <li>
              <span
                aria-current="page"
                className="font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {incident.id}
              </span>
            </li>
          </ol>
        </nav>

        {/* ── Top header row ───────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Left: severity badge */}
          <SeverityBadge severity={incident.severity} />

          {/* Right: date */}
          <span
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            {formatDate(incident.date_occurred)}
          </span>
        </div>

        {/* ── Title ────────────────────────────────────────────────────────── */}
        <h1
          className="font-[family-name:var(--font-bricolage)]"
          style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: "1.2",
            marginBottom: "16px",
          }}
        >
          {incident.title}
        </h1>

        {/* ── Category tags ─────────────────────────────────────────────────── */}
        {incident.category.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {incident.category.map((cat) => (
              <CategoryTag key={cat} category={cat} />
            ))}
          </div>
        )}

        {/* ── Meta line ─────────────────────────────────────────────────────── */}
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "28px",
          }}
        >
          <span>Agent: {incident.agent_name}</span>
          <span style={{ margin: "0 6px", color: "var(--text-muted)" }}>·</span>
          <span>Platform: {incident.platform}</span>
          <span style={{ margin: "0 6px", color: "var(--text-muted)" }}>·</span>
          <span>Industry: {incident.industry}</span>
        </p>

        {/* ── Accent divider ────────────────────────────────────────────────── */}
        <div
          role="separator"
          aria-hidden="true"
          style={{
            height: "2px",
            background: "var(--accent)",
            marginBottom: "36px",
            borderRadius: "1px",
          }}
        />

        {/* ── Mobile: sidebar facts above content ───────────────────────────── */}
        <div className="lg:hidden" style={{ marginBottom: "32px" }}>
          <MobileSummary incident={incident} />
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "40px",
          }}
          className="lg:[grid-template-columns:minmax(0,2fr)_320px]"
        >
          {/* LEFT: Main markdown content */}
          <div style={{ minWidth: 0 }}>
            <MarkdownContent html={incident.contentHtml} />
          </div>

          {/* RIGHT: Sticky sidebar (desktop only) */}
          <div className="hidden lg:block">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <KeyFactsSidebar incident={incident} />
              <FrameworkRefsCard refs={incident.framework_refs} />
            </div>
          </div>
        </div>

        {/* ── Mobile: framework refs below content ──────────────────────────── */}
        <div className="lg:hidden" style={{ marginTop: "32px" }}>
          <FrameworkRefsCard refs={incident.framework_refs} />
        </div>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div
          role="separator"
          aria-hidden="true"
          style={{
            height: "1px",
            background: "var(--border-subtle)",
            margin: "48px 0",
          }}
        />

        {/* ── Related incidents ─────────────────────────────────────────────── */}
        {incident.related_incidents.length > 0 && (
          <div style={{ marginBottom: "48px" }}>
            <RelatedIncidents
              incidentIds={incident.related_incidents}
              allCards={allCards}
            />
          </div>
        )}

        {/* ── Sources ───────────────────────────────────────────────────────── */}
        {incident.sources.length > 0 && (
          <section aria-labelledby="sources-heading">
            <h2
              id="sources-heading"
              className="font-[family-name:var(--font-bricolage)]"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "12px",
              }}
            >
              Sources
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {incident.sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent"
                    style={{ fontSize: "13px" }}
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

// ─── MobileSummary ────────────────────────────────────────────────────────────

/**
 * CONTRACT:
 * - WHAT: Compact horizontal summary of key facts for mobile screens.
 * - INPUT: Full Incident object
 * - OUTPUT: A scrollable row of key fact chips
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Only shown on mobile (lg:hidden)
 */
function MobileSummary({ incident }: { incident: Awaited<ReturnType<typeof getIncidentBySlug>> & object }) {
  const chips: Array<{ label: string; value: string }> = [
    { label: "Impact", value: incident.financial_impact || "Unknown" },
    { label: "Speed", value: incident.damage_speed || "Unknown" },
    { label: "Recovery", value: incident.recovery_time || "Unknown" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        paddingBottom: "4px",
      }}
    >
      {chips.map(({ label, value }) => (
        <div
          key={label}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "10px 14px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "2px",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
