import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllIncidentCards } from "@/lib/content/incidents";
import { PageHeader } from "@/components/shared/page-header";
import { SearchResults } from "@/components/search/search-results";

/**
 * CONTRACT:
 * - WHAT: Search page — fetches all incident cards at build time, renders client search component.
 * - INPUTS: None (no dynamic params; query is read client-side from ?q=)
 * - OUTPUTS: Full-page search layout with PageHeader + SearchResults
 * - ERRORS: None
 * - SIDE EFFECTS: Reads incident markdown files from disk (build-time)
 * - INVARIANTS: All incidents are pre-fetched; client filters them with Fuse.js
 */

export const metadata: Metadata = {
  title: "Search | AgentFail",
  description: "Search all documented AI agent incidents.",
};

export default async function SearchPage() {
  const incidents = await getAllIncidentCards();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <PageHeader
          title="Search"
          description="Search all documented AI agent incidents by keyword, category, platform, or pattern."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />
      </div>

      <Suspense
        fallback={
          <div className="text-sm text-[var(--text-muted)]">Loading search…</div>
        }
      >
        <SearchResults incidents={incidents} />
      </Suspense>
    </main>
  );
}
