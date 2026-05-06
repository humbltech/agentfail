import type { MetadataRoute } from "next";

// Required for `output: "export"` — sitemap is fully static at build time
export const dynamic = "force-static";

import { getAllIncidentCards } from "@/lib/content/incidents";
import { getPatternGroups } from "@/lib/content/relationships";
import { getCategories } from "@/lib/content/taxonomy";
import { SITE_META } from "@/lib/constants";

/**
 * CONTRACT:
 * - WHAT: Generates the full XML sitemap for agentfail.org.
 * - INPUTS: None
 * - OUTPUTS: MetadataRoute.Sitemap covering static pages + all incident/pattern/category pages
 * - ERRORS: propagates if content layer throws (build-time only)
 * - SIDE EFFECTS: reads incident markdown, relationships, and taxonomy files from disk
 * - INVARIANTS: every published incident, pattern group, and category has an entry
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_META.url;

  const incidents = await getAllIncidentCards();
  const patterns = getPatternGroups();
  const categories = getCategories();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/incidents`, lastModified: new Date() },
    { url: `${baseUrl}/patterns`, lastModified: new Date() },
    { url: `${baseUrl}/categories`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
  ];

  const incidentPages: MetadataRoute.Sitemap = incidents.map((i) => ({
    url: `${baseUrl}/incidents/${i.slug}`,
    lastModified: new Date(),
  }));

  const patternPages: MetadataRoute.Sitemap = patterns.map((p) => ({
    url: `${baseUrl}/patterns/${p.slug}`,
    lastModified: new Date(),
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...incidentPages, ...patternPages, ...categoryPages];
}
