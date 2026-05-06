/**
 * Category detail page — server component.
 *
 * CONTRACT:
 * - WHAT: Renders all incidents belonging to a given category slug.
 * - INPUTS: params.slug — category slug derived from CATEGORY_SLUGS values
 * - OUTPUTS: PageHeader + category description + grid of IncidentCards
 * - ERRORS: calls notFound() if slug does not match any known category
 * - SIDE EFFECTS: filesystem reads via content layer (build-time)
 * - INVARIANTS: Static rendering via generateStaticParams; all paths pre-rendered at build time
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/content/taxonomy";
import { getIncidentsByCategory } from "@/lib/content/incidents";
import { IncidentCard } from "@/components/incidents/incident-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams(): Array<{ slug: string }> {
  const categories = getCategories();
  // Deduplicate slugs (multiple category names can map to same slug)
  const slugs = [...new Set(categories.map((c) => c.slug))];
  return slugs.map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Category Not Found | AgentFail" };
  }

  return {
    title: `${category.name} | Categories | AgentFail`,
    description:
      category.description ||
      `AI agent incidents in the ${category.name} category.`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categories = getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Use the category name as the search key (partial match, case-insensitive)
  const incidents = await getIncidentsByCategory(category.name);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title={category.name}
        description={category.description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
        className="mb-10"
      />

      {incidents.length === 0 ? (
        <EmptyState
          title="No incidents in this category yet"
          description="Incidents are added as new cases are curated and published."
          action={{ label: "Browse all incidents", href: "/incidents" }}
        />
      ) : (
        <>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {incidents.length} {incidents.length === 1 ? "incident" : "incidents"} in this category
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
