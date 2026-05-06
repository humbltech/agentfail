/**
 * Agent type detail page — server component.
 *
 * CONTRACT:
 * - WHAT: Renders all incidents matching a given agent type slug.
 * - INPUTS: params.slug — agent type slug derived from AGENT_TYPE_SLUGS values
 * - OUTPUTS: PageHeader + agent type metadata (products, risks) + incident cards
 * - ERRORS: calls notFound() if slug does not match any known agent type
 * - SIDE EFFECTS: filesystem reads via content layer (build-time)
 * - INVARIANTS: Static rendering via generateStaticParams; all paths pre-rendered at build time
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentTypes } from "@/lib/content/taxonomy";
import { getIncidentsByAgentType } from "@/lib/content/incidents";
import { IncidentCard } from "@/components/incidents/incident-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams(): Array<{ slug: string }> {
  const agentTypes = getAgentTypes();
  // Deduplicate slugs (multiple agent type names can map to same slug)
  const slugs = [...new Set(agentTypes.map((a) => a.slug))];
  return slugs.map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agentTypes = getAgentTypes();
  const agentType = agentTypes.find((a) => a.slug === slug);

  if (!agentType) {
    return { title: "Agent Type Not Found | AgentFail" };
  }

  return {
    title: `${agentType.name} | Agent Types | AgentFail`,
    description:
      agentType.description ||
      `AI agent incidents involving ${agentType.name}.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AgentTypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const agentTypes = getAgentTypes();
  const agentType = agentTypes.find((a) => a.slug === slug);

  if (!agentType) {
    notFound();
  }

  // Use the agent type name as the search key (partial match, case-insensitive)
  const incidents = await getIncidentsByAgentType(agentType.name);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title={agentType.name}
        description={agentType.description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Agent Types" },
        ]}
        className="mb-8"
      />

      {/* Products and risks metadata */}
      {(agentType.products.length > 0 || agentType.risks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-6 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {agentType.products.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Example Products
              </h2>
              <div className="flex flex-wrap gap-2">
                {agentType.products.map((product) => (
                  <span
                    key={product}
                    className={cn(
                      "inline-block rounded-[4px] text-xs py-0.5 px-2",
                      "bg-[var(--bg-overlay)] text-[var(--text-secondary)]",
                    )}
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          )}

          {agentType.risks.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Key Risks
              </h2>
              <div className="flex flex-wrap gap-2">
                {agentType.risks.map((risk) => (
                  <span
                    key={risk}
                    className={cn(
                      "inline-block rounded-[4px] text-xs py-0.5 px-2",
                      "bg-[var(--bg-overlay)] text-[var(--accent)]",
                    )}
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {incidents.length === 0 ? (
        <EmptyState
          title="No incidents for this agent type yet"
          description="Incidents are added as new cases are curated and published."
          action={{ label: "Browse all incidents", href: "/incidents" }}
        />
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {incidents.length} {incidents.length === 1 ? "incident" : "incidents"} involving this agent type
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
