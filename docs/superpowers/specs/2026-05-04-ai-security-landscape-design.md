# AI Security Landscape Tracker — Design Spec

**Date:** 2026-05-04
**Status:** Approved
**Repo:** `ai-security-landscape` (separate from AgentFail)
**Visibility:** Private / internal only — no public publishing until deliberate decision

---

## Purpose

Internal intelligence database tracking movement in the AI security ecosystem: companies, fundings, acquisitions, product launches, partnerships, regulatory changes, talent moves, and breaches affecting security vendors.

### Goals

1. **Internal intelligence** — Track the AI security space to inform Rind's product/GTM strategy
2. **Future authority play** — Dataset can be published later if/when a clear strategy emerges for audience + conversion to Rind
3. **No dilution of AgentFail** — Kept separate to preserve AgentFail's sharp "incidents" identity

### Non-Goals (for now)

- No public website or content
- No publishing pipeline
- No database or CI/CD — just git + markdown
- No cross-referencing automation with AgentFail (manual links only)
- No local browsing website (future nice-to-have, after AgentFail site ships)

---

## Folder Structure

```
ai-security-landscape/
├── README.md                    # What this is, how to add entries
├── companies/                   # One file per entity
│   └── TEMPLATE.md
├── events/                      # One file per event
│   └── TEMPLATE.md
├── views/                       # Generated summaries
│   ├── timeline.md              # Chronological event feed
│   ├── by-category.md           # Events grouped by type
│   └── company-index.md         # All companies with key stats
├── taxonomy/
│   ├── categories.md            # Event types (funding, acquisition, etc.)
│   ├── segments.md              # Market segments (proxy, observability, guardrails, etc.)
│   └── stages.md                # Company stages (seed, series-a, acquired, dead)
└── scripts/
    └── generate-views.md        # Instructions for regenerating views
```

---

## Schemas

### Company File (`companies/{slug}.md`)

```markdown
---
name: Company Name
slug: company-name
website: https://example.com
segment: [guardrails, agent-security]
stage: series-a
founded: 2023
hq: City, Country
relevance_to_rind: direct-competitor | adjacent | potential-integration | customer-signal | acquirer | irrelevant
last_updated: 2026-05-04
---

## Overview
Brief description of what they do and positioning.

## Key People
- CEO: Name
- CTO: Name

## Funding History
| Date | Round | Amount | Lead Investor |
|------|-------|--------|---------------|

## Related Events
- [2026-03-15 — Series A](../events/2026-03-15-company-name-series-a.md)
```

### Event File (`events/{date}-{slug}.md`)

```markdown
---
date: 2026-03-15
type: funding
company: company-slug
title: Company Name raises $20M Series A
amount: 20000000
currency: USD
round: series-a
lead_investor: Sequoia
source: https://techcrunch.com/...
relevance: competitor-funding  # freeform — why this event matters to us
---

## Summary
One paragraph on what happened.

## Significance
Why this matters for the AI security space / for us / for Rind.

## Source Notes
Credibility, corroboration, any caveats.
```

---

## Taxonomies

### Event Types (`taxonomy/categories.md`)

| Type | Description |
|------|-------------|
| `funding` | Raises, grants, debt financing |
| `acquisition` | M&A activity |
| `launch` | New company or product announcement |
| `partnership` | Integrations, alliances, joint ventures |
| `regulatory` | Policy, standards, frameworks, compliance requirements |
| `breach` | Security tool/vendor compromised |
| `talent` | Key hires, departures, team changes |
| `shutdown` | Company or product death, pivots away |

### Market Segments (`taxonomy/segments.md`)

To be populated as companies are added. Initial segments:

- `proxy` — AI agent proxies / control planes (Rind's space)
- `guardrails` — Input/output filtering, content safety
- `observability` — Agent monitoring, logging, tracing
- `red-team` — AI security testing, pentesting
- `governance` — AI policy, compliance, risk management
- `identity` — Agent identity, auth, access control
- `data-security` — PII protection, data loss prevention for AI
- `mcp-security` — MCP-specific security tooling
- `llm-firewall` — Prompt injection defense, LLM-layer security

### Company Stages (`taxonomy/stages.md`)

- `pre-seed` / `seed` / `series-a` / `series-b` / `series-c+`
- `bootstrapped` — No external funding
- `acquired` — Bought by another company
- `public` — IPO'd
- `dead` — Shut down or pivoted away from AI security

### Relevance to Rind

Tagged on both companies and events:

| Tag | Meaning |
|-----|---------|
| `direct-competitor` | Does what Rind does |
| `adjacent` | Overlapping space, potential partner or competitor |
| `potential-integration` | Could integrate with Rind |
| `customer-signal` | Validates the market Rind is in |
| `acquirer` | Could acquire companies in this space |
| `irrelevant` | Tracked for completeness |

---

## View Generation

A script (or Claude command) reads all frontmatter and generates:

- **`views/timeline.md`** — All events reverse-chronological
- **`views/by-category.md`** — Events grouped by type
- **`views/company-index.md`** — Table of all companies: name, stage, segment, relevance, funding total, last event date

Views are regenerated on demand (not automated).

---

## Event File Naming Convention

`events/{YYYY-MM-DD}-{company-slug}-{brief-descriptor}.md`

Examples:
- `2026-03-15-invariant-labs-series-a.md`
- `2026-04-22-microsoft-acquires-promptshield.md`
- `2026-05-01-eu-ai-act-agent-provisions.md`

For events not tied to a single company (regulatory, market-wide):
- `2026-05-01-eu-ai-act-agent-provisions.md`

---

## Workflow

1. Discover event (news, social media, research)
2. Create event file from template
3. Create or update company file if new entity
4. Regenerate views (when needed)

---

## Future Considerations (parked, not in scope)

- Local website for browsing (after AgentFail website ships)
- Public publishing strategy (needs audience/conversion analysis first)
- Automated cross-referencing with AgentFail incidents
- Newsletter/digest generation from events
- Competitive positioning matrix auto-generation
