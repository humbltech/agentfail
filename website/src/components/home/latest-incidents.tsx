import Link from "next/link";
import type { IncidentCard } from "@/lib/content/types";
import { IncidentCard as IncidentCardComponent } from "@/components/incidents/incident-card";

interface LatestIncidentsProps {
  incidents: IncidentCard[];
}

/**
 * CONTRACT:
 * - WHAT: Server component rendering the latest incidents section on the homepage.
 * - INPUTS: incidents array (caller passes the first 5, already sorted newest-first)
 * - OUTPUTS: Section with header row and a vertical list of incident cards
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS:
 *   - "View all →" always links to /incidents
 *   - Each IncidentCard links to /incidents/{slug}
 *   - Section is a no-op if incidents is empty (no empty-state shown here — homepage always has data)
 */
export function LatestIncidents({ incidents }: LatestIncidentsProps) {
  return (
    <section
      className="py-16"
      aria-labelledby="latest-incidents-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <h2
            id="latest-incidents-heading"
            className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
          >
            Latest Incidents
          </h2>
          <Link
            href="/incidents"
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-bright)] transition-colors duration-150"
          >
            View all →
          </Link>
        </div>

        {/* Incident list — single column for readability */}
        <div className="flex flex-col gap-4">
          {incidents.map((incident) => (
            <IncidentCardComponent key={incident.id} incident={incident} />
          ))}
        </div>
      </div>
    </section>
  );
}
