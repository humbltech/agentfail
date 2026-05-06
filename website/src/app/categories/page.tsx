/**
 * Categories index page — server component.
 *
 * CONTRACT:
 * - WHAT: Renders a grid of all taxonomy categories with incident counts.
 * - INPUTS: None (static rendering)
 * - OUTPUTS: Category cards grid with PageHeader
 * - ERRORS: propagates content layer errors (filesystem read failures)
 * - SIDE EFFECTS: filesystem reads via content layer (build-time)
 * - INVARIANTS: Static rendering — no cookies, no headers, no runtime dynamic data
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/content/taxonomy";
import { getAllIncidentCards } from "@/lib/content/incidents";
import { PageHeader } from "@/components/shared/page-header";
import { getCategorySlug } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categories | AgentFail",
  description: "Browse AI agent incidents by failure category.",
};

export default async function CategoriesPage() {
  const [categories, allCards] = await Promise.all([
    Promise.resolve(getCategories()),
    getAllIncidentCards(),
  ]);

  // Build a count map: slug → incident count
  const countBySlug = new Map<string, number>();
  for (const card of allCards) {
    for (const cat of card.category) {
      const slug = getCategorySlug(cat);
      countBySlug.set(slug, (countBySlug.get(slug) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title="Categories"
        description="Browse documented AI agent incidents organized by failure category."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
        className="mb-10"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const count = countBySlug.get(category.slug) ?? 0;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={cn(
                "group block rounded-sm border transition-all duration-150",
                "border-[var(--border-subtle)] bg-[var(--bg-surface)]",
                "hover:border-[var(--border-visible)] hover:bg-[var(--bg-raised)] hover:-translate-y-px",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                "p-6",
              )}
            >
              {/* Category name */}
              <h3
                className={cn(
                  "text-lg font-semibold text-[var(--text-primary)] mb-1 leading-snug",
                  "font-[family-name:var(--font-display)]",
                )}
              >
                {category.name}
              </h3>

              {/* Incident count */}
              <p className="text-sm text-[var(--text-muted)] mb-3">
                {count} {count === 1 ? "incident" : "incidents"}
              </p>

              {/* Description */}
              {category.description && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {category.description}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
