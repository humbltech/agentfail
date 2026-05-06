// ─── Primitive union types ────────────────────────────────────────────────────

export type Severity = "Critical" | "High" | "Medium" | "Low";

export type IncidentStatus =
  | "published"
  | "draft"
  | "reviewed"
  | "fast-track"
  | "internal";

export type IncidentVisibility = "public" | "internal";

export type VendorResponse =
  | "none"
  | "acknowledged"
  | "fixed"
  | "refund_issued"
  | "disputed"
  | "disputed_then_refund_issued";

export type Scale =
  | "individual"
  | "team"
  | "organization"
  | "widespread"
  | "unknown";

export type PublicAttention = "low" | "medium" | "high" | "viral";

export type ContainmentMethod =
  | "manual_discovery"
  | "usage_limit"
  | "automatic_guardrail"
  | "third_party"
  | "none"
  | "extra_usage_pool_exhausted";

export type RefundStatus = "none" | "partial" | "full" | "unknown";

export type FullRecovery = "yes" | "partial" | "no" | "unknown";

export type BusinessScope =
  | "individual"
  | "team"
  | "department"
  | "organization"
  | "multi-org"
  | "unknown";

export type BusinessCriticality = "low" | "medium" | "high" | "existential";

// ─── Nested structs ───────────────────────────────────────────────────────────

export interface AffectedParties {
  count: number | null;
  scale: Scale;
  data_types_exposed: string[];
}

export interface FrameworkRefs {
  mitre_atlas: string[];
  owasp_llm: string[];
  owasp_agentic: string[];
  ttps_ai: string[];
}

// ─── Core incident frontmatter (44 fields, directly mirroring YAML) ──────────

export interface IncidentFrontmatter {
  // Identity
  id: string;
  title: string;
  status: IncidentStatus;

  // Dates
  date_occurred: string;
  date_discovered: string;
  date_reported: string;
  date_curated: string;
  date_council_reviewed: string;

  // Classification
  category: string[];
  severity: Severity;
  agent_type: string[];
  agent_name: string;
  platform: string;
  industry: string;

  // Financial impact
  financial_impact: string;
  financial_impact_usd: number | null;
  refund_status: RefundStatus;
  refund_amount_usd: number | null;
  affected_parties: AffectedParties;

  // Damage timing
  damage_speed: string;
  damage_duration: string;
  total_damage_window: string;

  // Recovery
  recovery_time: string;
  recovery_labor_hours: number | null;
  recovery_cost_usd: number | null;
  recovery_cost_notes: string;
  full_recovery_achieved: FullRecovery;

  // Business impact
  business_scope: BusinessScope;
  business_criticality: BusinessCriticality;
  business_criticality_notes: string;
  systems_affected: string[];

  // Vendor response
  vendor_response: VendorResponse;
  vendor_response_time: string;

  // Presentation
  headline_stat: string;
  operator_tldr: string;
  containment_method: ContainmentMethod;
  public_attention: PublicAttention;

  // Framework references
  framework_refs: FrameworkRefs;

  // Relationships
  related_incidents: string[];
  pattern_group: string;
  tags: string[];

  // Metadata
  sources: string[];
  researcher_notes: string;
  council_verdict: string;

  // Visibility control
  visibility: IncidentVisibility;
  internal_notes: string;
}

// ─── Derived incident shapes ──────────────────────────────────────────────────

/** Full incident with rendered content — used in detail pages. */
export interface Incident extends IncidentFrontmatter {
  /** URL slug derived from `id`, e.g. "aagf-2026-001" */
  slug: string;
  /** Raw markdown body (content after the frontmatter block) */
  content: string;
  /** Rendered HTML string from the markdown body */
  contentHtml: string;
  /** Markdown body split into individual H2 sections */
  sections: IncidentSection[];
}

/** Lightweight subset used in list/card views — never includes full markdown. */
export interface IncidentCard {
  id: string;
  title: string;
  slug: string;
  date_occurred: string;
  severity: Severity;
  category: string[];
  agent_type: string[];
  platform: string;
  headline_stat: string;
  operator_tldr: string;
  financial_impact_usd: number | null;
  vendor_response: VendorResponse;
  tags: string[];
  pattern_group: string;
  public_attention: PublicAttention;
}

/** A parsed section of the incident markdown body for in-page navigation. */
export interface IncidentSection {
  id: string;
  title: string;
  level: number;
  html: string;
}

// ─── Taxonomy types ───────────────────────────────────────────────────────────

export interface TaxonomyCategory {
  name: string;
  slug: string;
  description: string;
  examples: string;
}

export interface SeverityLevel {
  name: Severity;
  description: string;
  criteria: string[];
}

export interface AgentType {
  name: string;
  slug: string;
  description: string;
  products: string[];
  risks: string[];
}

export interface SolutionType {
  name: string;
  description: string;
  plausibilityRange: string;
  practicalityRange: string;
}

export interface PatternGroup {
  slug: string;
  name: string;
  description: string;
  incidentIds: string[];
}

export interface RootCauseCluster {
  name: string;
  description: string;
  incidentCount: number;
}
