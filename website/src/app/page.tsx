import { getAllIncidentCards, getStats } from "@/lib/content/incidents";
import { getPatternGroups } from "@/lib/content/relationships";
import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { LatestIncidents } from "@/components/home/latest-incidents";
import { FeaturedPatterns } from "@/components/home/featured-patterns";
import { JsonLd } from "@/components/shared/json-ld";
import { SITE_META } from "@/lib/constants";

/**
 * CONTRACT:
 * - WHAT: Server-rendered homepage. Fetches incident data, stats, and pattern
 *   groups in parallel and composes them into the full homepage.
 * - INPUTS: None (no dynamic route params)
 * - OUTPUTS: Full homepage with hero, stats bar, latest incidents, and patterns
 * - ERRORS: propagates content layer errors (filesystem read failures)
 * - SIDE EFFECTS: synchronous filesystem reads via content layer (build-time)
 * - INVARIANTS:
 *   - JSON-LD WebSite schema is always present
 *   - Latest incidents section shows at most 5, newest-first
 *   - Static rendering — no cookies, no headers, no runtime dynamic data
 */
export default async function HomePage() {
  const [incidents, stats, patterns] = await Promise.all([
    getAllIncidentCards(),
    getStats(),
    // getPatternGroups is synchronous but wrapped in Promise.all for consistency;
    // Promise.resolve handles the sync return value seamlessly.
    Promise.resolve(getPatternGroups()),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_META.name,
    description: SITE_META.description,
    url: SITE_META.url,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <StatsBar stats={stats} />
      <LatestIncidents incidents={incidents.slice(0, 5)} />
      <FeaturedPatterns patterns={patterns} />
    </>
  );
}
