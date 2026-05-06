/**
 * Patterns index page — server component.
 *
 * CONTRACT:
 * - WHAT: Renders a grid of all pattern groups parsed from relationships/graph.md.
 * - INPUTS: None (static rendering)
 * - OUTPUTS: PatternCard grid with PageHeader
 * - ERRORS: propagates content layer errors (filesystem read failures)
 * - SIDE EFFECTS: synchronous filesystem reads via content layer (build-time)
 * - INVARIANTS: Static rendering — no cookies, no headers, no runtime dynamic data
 */

import type { Metadata } from "next";
import { getPatternGroups } from "@/lib/content/relationships";
import { PatternCard } from "@/components/patterns/pattern-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Patterns | AgentFail",
  description: "Recurring failure patterns across AI agent incidents.",
};

export default function PatternsPage() {
  // getPatternGroups is synchronous — no await needed
  const patterns = getPatternGroups();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <PageHeader
        title="Patterns"
        description="Recurring failure patterns observed across documented AI agent incidents."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Patterns" }]}
        className="mb-10"
      />

      {patterns.length === 0 ? (
        <EmptyState
          title="No patterns found"
          description="Pattern groups will appear here once incidents are published."
          action={{ label: "Browse incidents", href: "/incidents" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.slug} pattern={pattern} />
          ))}
        </div>
      )}
    </div>
  );
}
