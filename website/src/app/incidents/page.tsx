/**
 * Incidents list page — server component.
 *
 * CONTRACT:
 * - WHAT: Fetches all incident cards and filter option arrays at build time,
 *   then passes them to the client IncidentListPage component.
 * - INPUTS: None (no dynamic route params; static rendering)
 * - OUTPUTS: IncidentListPage with all data pre-fetched
 * - ERRORS: propagates content layer errors (filesystem read failures)
 * - SIDE EFFECTS: synchronous filesystem reads via content layer (build-time)
 * - INVARIANTS: Static rendering — no cookies, no headers, no runtime dynamic data
 */

import {
  getAllIncidentCards,
  getUniqueCategories,
  getUniquePlatforms,
  getUniqueAgentTypes,
} from "@/lib/content/incidents";
import { IncidentListPage } from "@/components/incidents/incident-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incidents | AgentFail",
  description:
    "Browse all documented AI agent incidents with search, filters, and sorting.",
};

export default async function IncidentsPage() {
  const [cards, categories, platforms, agentTypes] = await Promise.all([
    getAllIncidentCards(),
    getUniqueCategories(),
    getUniquePlatforms(),
    getUniqueAgentTypes(),
  ]);

  return (
    <IncidentListPage
      incidents={cards}
      categories={categories}
      platforms={platforms}
      agentTypes={agentTypes}
    />
  );
}
