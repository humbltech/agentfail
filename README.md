# AgentFail

**A curated database of real-world AI agent incidents, failures, and breaches.**

AgentFail documents autonomous AI agent mishaps — not theoretical risks, but things that actually happened. Each incident is deeply researched, root-cause analyzed, and stress-tested through a strategic review process before publication.

---

## Why This Exists

AI agents are being deployed at scale. They execute code, manage files, send emails, make purchases, call APIs, and act autonomously on behalf of humans. When they fail, the consequences are real: data leaks, financial losses, infrastructure damage, privacy violations.

No comprehensive resource exists for AI agent incidents specifically. The major AI incident databases (AIID, AIAAIC) track broad AI harms — bias, discrimination, surveillance — but don't focus on agentic AI failures. This is that resource.

---

## What We Track

Any incident involving an AI agent acting autonomously in the world:
- Coding assistants that introduced vulnerabilities or deleted files
- Customer service bots that disclosed confidential data
- Autonomous agents that exceeded their intended permissions
- MCP/tool-using agents exploited via prompt injection
- Multi-agent systems with emergent harmful behavior
- RAG/memory systems poisoned or manipulated
- Financial agents that made unauthorized transactions

See `taxonomy/categories.md` for the full incident category list.

---

## How an Incident Gets Published

Every incident goes through a 4-stage pipeline:

1. **Research** — Deep investigation of the source + related coverage, technical details, vendor responses
2. **Analysis** — Root cause analysis (5 Whys), impact assessment, solutions rated by plausibility and practicality
3. **Strategic Council** — Three-phase review: Challenge (stress-test claims) → Steelman (defend strongest interpretation) → Synthesis (final assessment with confidence levels)
4. **Publish** — Final formatted report, tagged, linked to related incidents, relationship graph updated

See `scripts/analyze-incident.md` for the full pipeline workflow.

---

## Incident IDs

Format: `AAGF-YYYY-NNN`
- `AAGF` = AgentFail
- `YYYY` = Year
- `NNN` = Sequential number (001, 002, ...)

---

## Folder Structure

```
agentfail/
├── README.md                    # This file
├── incidents/                   # Published incident reports
│   └── TEMPLATE.md              # Incident report template
├── drafts/                      # In-progress analysis (pre-council review)
├── taxonomy/
│   ├── categories.md            # Incident categories with definitions
│   ├── severity.md              # Severity framework with criteria
│   ├── agent-types.md           # Agent type taxonomy
│   └── solution-types.md        # Solution/prevention taxonomy
├── relationships/
│   └── graph.md                 # Incident relationship map (patterns, clusters, connections)
├── sources/
│   ├── monitoring.md            # Where to find incidents (feeds, alerts, keywords)
│   └── source-credibility.md    # Source reliability framework
└── scripts/
    └── analyze-incident.md      # Pipeline instructions for each analysis stage
```

---

## Who This Is For

**Operators and security teams** running AI agents — the primary audience. Every incident includes an *Operator TL;DR*: one sentence telling you what to do right now if you use the affected platform.

**Researchers and journalists** who need deep, evidence-backed incident analysis with documented root causes and source credibility ratings.

**The general public** who wants to understand what AI agents actually do in the real world when things go wrong.

---

## What Makes AgentFail Different

Every other AI incident database (AIID, AIAAIC, MIT, OECD) stops at "here's what happened." AgentFail goes further:

| Feature | AgentFail | AIID | AIAAIC | MIT |
|---------|-----------|------|--------|-----|
| Root Cause Analysis (5 Whys) | ✅ | ❌ | ❌ | ❌ |
| Operator Action (what to do) | ✅ | ❌ | ❌ | ❌ |
| Solutions rated plausibility/practicality | ✅ | ❌ | ❌ | ❌ |
| Dialectical quality control (Challenger/Steelman) | ✅ | ❌ | ❌ | ❌ |
| Source credibility framework | ✅ | Partial | ❌ | ❌ |
| Vendor response tracking | ✅ | ❌ | ❌ | ❌ |
| Pattern group clustering | ✅ | ❌ | ❌ | ❌ |

---

## Roadmap

**Phase 1 (now):** Content curation — deep analysis pipeline, 10–20 published incidents across agent types and platforms.

**Phase 2 (building):** Public website — searchable/filterable incident database, pattern pages, operator prevention checklists, OG-optimized per-incident pages.

**Phase 3 (community):** Public incident submission, newsletter/RSS, API access, open dataset downloads for researchers.

---

## Related Resources

- [AI Incident Database](https://incidentdatabase.ai/) — Broad AI incidents (not agent-specific)
- [AIAAIC Repository](https://www.aiaaic.org/) — Broad AI/algorithm incidents
- [MITRE ATLAS](https://atlas.mitre.org/) — ATT&CK-style framework for AI threats
- [ttps.ai](https://ttps.ai/) — AI agent attack technique taxonomy
- [OWASP Agentic AI Threat Taxonomy](https://owasp.org/) — 15 threat categories for agentic AI
