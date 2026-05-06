import type { MetadataRoute } from "next";
import { SITE_META } from "@/lib/constants";

// Required for `output: "export"` — this route has no dynamic data
export const dynamic = "force-static";

/**
 * CONTRACT:
 * - WHAT: Generates the robots.txt for agentfail.org.
 * - INPUTS: None
 * - OUTPUTS: MetadataRoute.Robots allowing all crawlers, pointing to sitemap
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: sitemap URL always matches SITE_META.url
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_META.url}/sitemap.xml`,
  };
}
