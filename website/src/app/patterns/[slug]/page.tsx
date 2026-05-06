/**
 * Pattern group detail page — server component.
 *
 * CONTRACT:
 * - WHAT: Renders all incidents belonging to a given pattern group.
 * - INPUTS: params.slug — pattern group slug from URL
 * - OUTPUTS: PageHeader + grid of IncidentCards for incidents in this pattern
 * - ERRORS: calls notFound() if slug does not match any pattern group
 * - SIDE EFFECTS: filesystem reads via content layer (build-time / ISR)
 * - INVARIANTS: Static rendering via generateStaticParams; all paths pre-rendered at build time
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPatternGroups } from "@/lib/content/relationships";
import { getIncidentsByPatternGroup } from "@/lib/content/incidents";
import { IncidentCard } from "@/components/incidents/incident-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams(): Array<{ slug: string }> {
  const patterns = getPatternGroups();
  return patterns.map((p) => ({ slug: p.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const patterns = getPatternGroups();
  const pattern = patterns.find((p) => p.slug === slug);

  if (!pattern) {
    return { title: "Pattern Not Found | AgentFail" };
  }

  return {
    title: `${pattern.name} | Patterns | AgentFail`,
    description:
      pattern.description ||
      `AI agent incidents matching the ${pattern.name} failure pattern.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const patterns = getPatternGroups();
  const pattern = patterns.find((p) => p.slug === slug);

  if (!pattern) {
    notFound();
  }

  const incidents = await getIncidentsByPatternGroup(pattern.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title={pattern.name}
        description={pattern.description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Patterns", href: "/patterns" },
          { label: pattern.name },
        ]}
        className="mb-10"
      />

      {incidents.length === 0 ? (
        <EmptyState
          title="No incidents in this pattern yet"
          description="Incidents are added as new cases are curated and published."
          action={{ label: "Browse all incidents", href: "/incidents" }}
        />
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {incidents.length} {incidents.length === 1 ? "incident" : "incidents"} in this pattern
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
