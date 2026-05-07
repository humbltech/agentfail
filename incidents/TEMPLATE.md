---
id: "AAGF-YYYY-NNN"
title: ""
status: "draft"
date_occurred: ""        # When the incident actually happened (YYYY-MM-DD; use approximate if exact unknown)
date_discovered: ""      # When the victim/affected party became aware of it (may differ from date_occurred)
date_reported: ""        # When it was publicly disclosed (first credible source date)
date_curated: ""
date_council_reviewed: ""

# Classification
category: []
severity: ""
agent_type: []
agent_name: ""
platform: ""
industry: ""

# Impact
financial_impact: ""     # Direct financial loss if known (e.g. "$6,000 USD — per secondary reporting"; "Not quantified")
financial_impact_usd: null       # Numeric USD value for sorting/filtering (lower bound if range; null if unknown)
refund_status: ""                # "none" | "partial" | "full" | "unknown"
refund_amount_usd: null          # Numeric USD if partial/full refund issued; null otherwise
affected_parties:
  count: null                    # Number of known affected users/orgs (null if unknown)
  scale: ""                      # "individual" | "team" | "organization" | "widespread" | "unknown"
  data_types_exposed: []         # "PII" | "credentials" | "source_code" | "financial" | "none"

# Damage Timing
damage_speed: ""           # How fast the damage unfolded: "instantaneous" | "9 seconds" | "5 minutes" | "26 hours" | "2 days"
damage_duration: ""        # How long the harmful event ran: same format — distinct from speed if event was ongoing
total_damage_window: ""    # Full window from first sign to containment: "26 hours" | "3 days" | "unknown"

# Recovery
recovery_time: ""          # Time to full or partial recovery: "2 hours" | "3 days" | "not required" | "unrecoverable" | "unknown"
recovery_labor_hours: null # Estimated person-hours spent on recovery (null if unknown)
recovery_cost_usd: null    # Estimated recovery cost beyond direct financial loss in USD (null if unknown)
recovery_cost_notes: ""    # e.g. "3 engineers × 2 days to restore DB from last good backup"
full_recovery_achieved: "" # "yes" | "partial" | "no" | "unknown"

# Business Impact
business_scope: ""         # "individual" | "team" | "department" | "organization" | "multi-org" | "unknown"
business_criticality: ""   # "low" | "medium" | "high" | "existential"
business_criticality_notes: "" # e.g. "Production DB deleted — entire company blocked until restored"
systems_affected: []       # e.g. ["production-database", "ci-cd", "billing", "customer-data", "source-code", "deployment"]

# Vendor Response
vendor_response: ""              # "none" | "acknowledged" | "fixed" | "refund_issued" | "disputed"
vendor_response_time: ""         # "none" | "<24h" | "1-7 days" | "7-30 days" | "30+ days"

# Damage Quantification (populated by /estimate-damage agent; human_override: true to lock)
damage_estimate:
  confirmed_loss_usd: null       # Same as financial_impact_usd — canonical alias in this block
  recovery_cost_usd: null        # Same as recovery_cost_usd — what it cost to contain/fix the damage
  averted_damage_usd: null       # Probability-weighted potential damage that was averted
  averted_range_low: null        # Lower bound before probability weighting
  averted_range_high: null       # Upper bound before probability weighting
  composite_damage_usd: null     # confirmed_loss + recovery_cost + averted_damage (the roll-up figure)
  confidence: ""                 # "cited" | "calculated" | "estimated" | "order-of-magnitude"
  probability_weight: null       # 0.0–1.0 — likelihood averted damage would have materialized
  methodology: ""                # One-line: "964K users × $10K/machine × 1% exploitation rate"
  methodology_detail:
    per_unit_cost_usd: null      # e.g. 10000 (per machine)
    unit_count: null             # e.g. 964000
    unit_type: ""                # "machine" | "record" | "credential" | "order" | "hour" | "user"
    multiplier: null             # Supply chain or downstream multiplier (e.g. 3.0)
    benchmark_source: ""         # "IBM 2024 CODB" | "SANS 2024" | "Gartner" | "Public filings"
  estimation_date: ""            # ISO date of last estimation run
  human_override: false          # Set true to lock — agent skips on re-runs
  notes: ""                      # Calibration notes, caveats, or override rationale

# Presentation
headline_stat: ""                # THE shareable hook: "$6,000 in 26 hours" or "9 seconds to delete production DB"
operator_tldr: ""                # One sentence action for someone running this platform: "Set spending caps before..."
containment_method: ""           # "manual_discovery" | "usage_limit" | "automatic_guardrail" | "third_party" | "none"
public_attention: ""             # "low" | "medium" | "high" | "viral"

# Framework References
# Look up applicable IDs in taxonomy/framework-mapping.md using this incident's categories.
framework_refs:
  mitre_atlas: []    # e.g. ["AML.T0053", "AML.T0101"] — see taxonomy/framework-mapping.md
  owasp_llm: []      # e.g. ["LLM06:2025"]
  owasp_agentic: []  # e.g. ["ASI02:2026", "ASI10:2026"]
  ttps_ai: []        # e.g. ["2.5.4", "2.16"]

# Relationships
related_incidents: []
pattern_group: ""
tags: []

# Metadata
sources: []
researcher_notes: ""
council_verdict: ""
---

# [Incident Title]

## Executive Summary

*2-3 sentences. What happened, who was affected, what was the outcome. Write for someone who will read only this section.*

---

## Timeline

| Date/Time | Event |
|-----------|-------|
| YYYY-MM-DD | [Event description] |
| YYYY-MM-DD | [Event description] |
| YYYY-MM-DD | Incident discovered / disclosed |
| YYYY-MM-DD | Remediation completed |

---

## What Happened

*Detailed narrative of the incident. Tell the story chronologically. Include: who was using the agent, what they were trying to do, what the agent did instead, how it was discovered. Use specifics where known.*

---

## Technical Analysis

*How did the agent's architecture enable this failure? What technical decisions — intentional or accidental — made this possible? Include:*
- *Agent framework/platform details*
- *What tools/permissions the agent had*
- *The specific technical mechanism of failure*
- *Code or configuration snippets if available/relevant*

---

## Root Cause Analysis

*Apply 5 Whys or equivalent methodology. The goal is the fundamental cause, not just the proximate trigger.*

**Proximate cause:** [What directly triggered the incident]

**Why 1:** [Why did that happen?]
**Why 2:** [Why did that happen?]
**Why 3:** [Why did that happen?]
**Why 4:** [Why did that happen?]
**Why 5 / Root cause:** [The fundamental systemic issue]

**Root cause summary:** [One sentence]

---

## Impact Assessment

**Severity:** [Critical / High / Medium / Low]

**Who was affected:**
- [Users / organizations / individuals]

**What was affected:**
- [Data, systems, finances, reputation]

**Quantified impact (where known):**
- Users affected: [number or estimate]
- Data exposed: [type and volume]
- Financial impact: [dollar amount or estimate]
- Recovery time: [hours/days]

**Containment:** [How was the incident contained? Was it caught early or did it run to completion?]

---

## How It Could Have Been Prevented

*What controls, if in place before the incident, would have prevented it? Be specific — not just "better security" but exactly what.*

1. [Specific preventive control]
2. [Specific preventive control]
3. [Specific preventive control]

---

## How It Was / Could Be Fixed

**Actual remediation taken:**
[What the affected party actually did to fix the issue]

**Additional recommended fixes:**
[What else should have been done, or what should be done if this happened to someone else]

---

## Solutions Analysis

*Evaluate each applicable solution type. See `taxonomy/solution-types.md` for definitions and rating criteria.*

### [Solution 1 Name]
- **Type:** [from taxonomy]
- **Plausibility:** X/5 — [justification]
- **Practicality:** X/5 — [justification]
- **How it applies:** [specific to this incident]
- **Limitations:** [gaps in this solution]

### [Solution 2 Name]
- **Type:** [from taxonomy]
- **Plausibility:** X/5 — [justification]
- **Practicality:** X/5 — [justification]
- **How it applies:** [specific to this incident]
- **Limitations:** [gaps in this solution]

### [Solution 3 Name]
*(repeat as needed)*

---

## Related Incidents

*Links to other AgentFail incidents that share root causes, attack vectors, or affected systems.*

| Incident | Connection |
|----------|------------|
| [[AAGF-YYYY-NNN]] | [What links them] |

---

## Strategic Council Review

### Challenger Findings
*What claims in this analysis are questionable? What evidence is weak? What alternative explanations exist? What assumptions were made that might not hold?*

1. [Challenge point + evidence or reasoning]
2. [Challenge point + evidence or reasoning]
3. [Challenge point + evidence or reasoning]

### Steelman Defense
*What is the strongest case for the analysis as written? What additional evidence supports the conclusions? Why are the proposed solutions the right ones?*

1. [Defense point + supporting evidence]
2. [Defense point + supporting evidence]
3. [Defense point + supporting evidence]

### Synthesis
*Reconcile the challenger and steelman findings. What is the final assessment? Flag unresolved uncertainties with confidence levels.*

**Final assessment:** [Paragraph]

**Confidence level:** [High / Medium / Low] — [justification]

**Unresolved uncertainties:**
- [Uncertainty 1] — [why it matters and what would resolve it]
- [Uncertainty 2]

---

## Key Takeaways

*3-5 actionable lessons. Written for practitioners — developers, security teams, product managers deploying agents.*

1. **[Takeaway title]:** [Explanation and specific action]
2. **[Takeaway title]:** [Explanation and specific action]
3. **[Takeaway title]:** [Explanation and specific action]

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| [Source name] | [URL] | YYYY-MM-DD | [High/Medium/Low — note if primary source, vendor disclosure, independent analysis, etc.] |
