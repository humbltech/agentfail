# AgentFail Analysis Pipeline

## Pipeline Architecture

The pipeline has three layers. Each serves a distinct purpose — never collapse them.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: SCRIPTS (deterministic, programmatic)                 │
│  Fetch URLs → Extract markdown → Validate schema → Update graph │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: SKILLS (reusable expertise, loaded into agents)       │
│  Research skill → Analysis skill → Council skill → Publish skill│
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: AGENTS (focused, isolated, cognitive work only)       │
│  Stage 1 → Stage 2 → Stage 3 → Stage 4                         │
└─────────────────────────────────────────────────────────────────┘
```

### Core Isolation Principle
Each agent receives **only what it needs** — never the previous agent's conversation, never the full codebase. Context contamination degrades analysis quality. Isolation enforces quality.

| Agent | Gets | Does NOT get |
|-------|------|-------------|
| Research Agent | Source URLs, fetched markdown (if pre-fetched), research skill | Previous agent conversations |
| Analysis Agent | research.md, TEMPLATE.md, taxonomy files | Research agent's conversation |
| Council Agent | draft.md ONLY | Research doc, analysis reasoning |
| Publisher Agent | Reviewed draft, relationships/graph.md | All prior conversations |
| Retrofill Agent | Existing incident file, list of missing fields | New research, other incidents |

### Scripts Layer (Phase 2+, see Optimization Roadmap)
Deterministic work never belongs in an agent. Scripts handle:
- **Source fetch**: Download URLs, strip HTML, extract clean markdown
- **Schema validation**: Parse YAML frontmatter, check required fields, validate enum values
- **Relationship graph updates**: Programmatic adds to graph.md after publish
- **Aggregate stats**: Calculate home page stats from all published incidents

### Optimization Roadmap

| Phase | What | Why | Trigger |
|-------|------|-----|---------|
| **1 — Now** | All in agents, manual execution | Speed and accuracy, no premature optimization | Today |
| **2** | Schema validator script | Catches missing/invalid fields before publish; runs after Stage 2 and Stage 4 | When we have 10+ incidents |
| **3** | Source fetch script | Pre-fetches URLs, strips HTML, passes clean markdown to Stage 1 agent — saves tokens, improves accuracy | When sources regularly exceed 5 URLs or require login |
| **4** | Basic RAG for large source sets | Chunks + semantic search over fetched content — agent queries rather than receives everything | When individual source sets exceed ~50K tokens |

**Rule**: Don't build Phase 3 until Phase 2 is running. Don't build Phase 4 until Phase 3 is running.

---

## Stage 0: Schema Validation (run after Stage 2 and Stage 4)

**Goal:** Catch missing or invalid frontmatter fields before council review or publication.

Until the validator script exists (Phase 2), run this manually by reading the draft and checking against the required fields list.

**Required fields checklist:**
```
Core:          id, title, status, date_occurred, date_discovered, date_reported, date_curated
Classification: category (min 1), severity, agent_type (min 1), agent_name, platform, industry
Impact:        financial_impact, financial_impact_usd OR null, refund_status, full_recovery_achieved
Damage Timing: damage_speed, damage_duration, total_damage_window, recovery_time, business_scope, business_criticality
Vendor:        vendor_response, vendor_response_time
Presentation:  headline_stat, operator_tldr, containment_method, public_attention
Framework:     framework_refs.mitre_atlas (min 1), framework_refs.owasp_llm or owasp_agentic (min 1)
Metadata:      sources (min 2), researcher_notes, council_verdict (after Stage 3)
```

**Valid enum values:**
```
severity:              Critical | High | Medium | Low
refund_status:         none | partial | full | unknown
full_recovery_achieved: yes | partial | no | unknown
vendor_response:       none | acknowledged | fixed | refund_issued | disputed
vendor_response_time:  none | <24h | 1-7 days | 7-30 days | 30+ days
damage_speed:          [free text — be specific: "9 seconds", "26 hours", "instantaneous"]
business_scope:        individual | team | department | organization | multi-org | unknown
business_criticality:  low | medium | high | existential
containment_method:    manual_discovery | usage_limit | automatic_guardrail | third_party | none
public_attention:      low | medium | high | viral
actual_vs_potential:   actual | partial | near-miss
```

---

## Stage 1: Research Agent

**Goal:** Gather all available information about the incident. Produce a structured research document — not a report, just organized facts with attribution.

**Inputs:**
- URL(s) or description of the incident
- (Phase 3+) Pre-fetched and cleaned markdown from source fetch script

**Isolation:** Fresh agent context. No prior conversation. No other incident files.

**Prompt template:**

```
You are a deep research agent for AgentFail — a curated database of real-world AI agent incidents.

Incident to research:
[INCIDENT URL(S) / DESCRIPTION]

## Research Tasks

1. Fetch and analyze the primary source in full detail
2. Web search for additional coverage, technical writeups, vendor responses, and community discussion
3. Search for similar past incidents (same agent type, platform, attack vector)
4. Find any follow-up reporting: was it patched? what was the final impact? did the vendor respond?
5. Identify the specific technical mechanism of failure

## Extract and Document (with source attribution for every claim)

### Dates (three separate values if they differ)
- `date_occurred`: when the incident actually happened
- `date_discovered`: when the victim/affected party became aware (may be days/weeks later)
- `date_reported`: when publicly disclosed (first credible source date)

### Damage (new — document all types that apply)
- **Direct financial**: API charges, unauthorized transactions, fines — quote figure + source confidence
- **Operational**: systems destroyed, data deleted, processes halted — be specific (what system, how much data)
- **Data exposure**: what types of data, volume if known
- **Reputational**: public-facing harm, user trust damage
- **Damage speed**: how fast did the damage unfold? (e.g. "9 seconds", "ran overnight", "across 5 sessions over 2 days")
- **Damage duration**: how long did the harmful event run?
- **Recovery**: how long did recovery take? how many people were involved? was full recovery achieved?
- **Business scope**: was this one person, a team, an entire organization? was the business critically impacted or disrupted?
- **Business criticality**: was this do-or-die for the business (production down, data unrecoverable) or painful but recoverable?

### Technical Detail
- Agent framework/platform/version
- What tools, permissions, or integrations the agent had
- The exact mechanism of failure (not just "it went wrong" — the specific technical chain)
- Code or config snippets if available

### Vendor Response
- Did the vendor acknowledge, fix, or refund?
- Timeline of response (or non-response)
- Any platform changes made post-incident

### Affected Parties
- Who was affected (individuals, orgs, count)
- What industry/context
- What data types were exposed if any

## Output Format
A structured research document, organized by the sections above. Every claim attributed to a source URL. Note source credibility (High/Medium/Low per AgentFail framework).

## Classification Assessment (at end of document)
Suggest:
- Likely AgentFail categories (from taxonomy/categories.md)
- Likely severity level with brief justification
- Likely ATLAS techniques (check taxonomy/framework-mapping.md)
- `actual_vs_potential`: is this "actual" harm, "partial" (near-miss that partially materialized), or "near-miss" (stopped before harm)?

Save output as: `drafts/AAGF-[YYYY]-[NNN]-research.md`
```

**Output:** `drafts/AAGF-YYYY-NNN-research.md`

---

## Stage 2: Analysis Agent

**Goal:** Transform the research document into a complete incident report. Deep analysis, not summarization.

**Inputs:**
- `drafts/AAGF-YYYY-NNN-research.md` (Stage 1 output)
- `incidents/TEMPLATE.md`
- `taxonomy/categories.md`, `taxonomy/severity.md`, `taxonomy/agent-types.md`, `taxonomy/solution-types.md`
- `taxonomy/framework-mapping.md`
- `relationships/graph.md` (to check for existing connections)

**Isolation:** Fresh agent context. Does not receive the Stage 1 agent's conversation — only the output file.

**Prompt template:**

```
You are an incident analyst for AgentFail — a curated database of real-world AI agent incidents.

I have a research document for a new incident. Analyze it deeply and produce a complete structured incident report.

Research document: [paste drafts/AAGF-YYYY-NNN-research.md]

Reference files provided:
- incidents/TEMPLATE.md
- taxonomy/categories.md, severity.md, agent-types.md, solution-types.md
- taxonomy/framework-mapping.md
- relationships/graph.md

## Your Tasks

### 1. Fill the YAML Frontmatter Completely

Every field must be populated or explicitly set to null. No empty strings on required fields.

**Damage Timing (new — required):**
- `damage_speed`: how fast the damage unfolded — be specific ("9 seconds", "26 hours", "instantaneous")
- `damage_duration`: how long the harmful event ran (may equal damage_speed for instantaneous events)
- `total_damage_window`: full window from first sign to containment
- `recovery_time`: total time to recovery ("2 hours", "3 days", "not required", "unrecoverable", "unknown")
- `recovery_labor_hours`: estimated person-hours spent recovering (null if unknown)
- `recovery_cost_usd`: estimated recovery cost beyond direct financial loss (null if unknown)
- `recovery_cost_notes`: narrative if applicable ("3 engineers × 2 days to restore DB from backup")
- `full_recovery_achieved`: "yes" | "partial" | "no" | "unknown"

**Business Impact (new — required):**
- `business_scope`: "individual" | "team" | "department" | "organization" | "multi-org" | "unknown"
- `business_criticality`: "low" | "medium" | "high" | "existential"
- `business_criticality_notes`: 1 sentence — what made it critical or not (e.g. "Production DB deleted — entire company blocked until restored")
- `systems_affected`: list of systems impacted (e.g. ["production-database", "billing"])

**Standard fields:**
- `date_occurred`, `date_discovered`, `date_reported`
- `financial_impact` (free text + source confidence), `financial_impact_usd` (numeric or null)
- `refund_status`, `refund_amount_usd`
- `affected_parties.count`, `affected_parties.scale`, `affected_parties.data_types_exposed`
- `actual_vs_potential`: "actual" | "partial" | "near-miss"
- `potential_damage` (if partial/near-miss): what would have happened
- `intervention` (if partial/near-miss): what stopped it
- `vendor_response`, `vendor_response_time`
- `headline_stat`: THE single most shareable hook — most visceral damage fact regardless of type (financial OR operational OR data)
- `operator_tldr`: one actionable sentence for a practitioner on this platform
- `containment_method`, `public_attention`
- `framework_refs` — REQUIRED: use taxonomy/framework-mapping.md to populate all four sub-fields with inline comments

### 2. Write Each Report Section in Full

- **Timeline**: chronological table, specific timestamps where known
- **What Happened**: narrative for a practitioner audience — tell the story with specifics
- **Technical Analysis**: mechanism of failure, architecture that enabled it, code/config if available
- **Root Cause Analysis**: 5 Whys — push past symptoms to the systemic cause. The root cause should feel non-obvious.
- **Impact Assessment**: quantify everything quantifiable. Separate direct financial, recovery cost, operational, data, and reputational impact.
- **Prevention**: specific controls, not generic advice ("set a $50 spending cap in Anthropic console" not "implement better monitoring")
- **Fix**: actual remediation taken + recommended additional steps
- **Solutions Analysis**: 3-5 solutions, each rated plausibility (1-5) and practicality (1-5) with justification and limitations
- **Related Incidents**: check relationships/graph.md for connections

### 3. Analysis Standards

- Write for a practitioner who will take action based on this
- In Root Cause Analysis, the chain should end at a systemic issue (process, platform design, incentive) not a proximate technical trigger
- In Solutions Analysis, be honest about limitations — a solution that's 5/5 plausible but 2/5 practical is more useful than overclaiming
- Flag uncertainty explicitly — "this is inferred from X" not stated as fact
- `headline_stat` picks the most visceral damage signal regardless of type — "9 seconds to delete a production database" beats "$152 in charges"

Save output as: `drafts/AAGF-YYYY-NNN-draft.md`
```

**Output:** `drafts/AAGF-YYYY-NNN-draft.md`

**After Stage 2:** Run Stage 0 schema validation before proceeding to Stage 3.

---

## Stage 3: Strategic Council Review

**Goal:** Stress-test the analysis through three dialectic phases. Find what the analyst missed or overclaimed.

**Inputs:**
- `drafts/AAGF-YYYY-NNN-draft.md` ONLY

**Isolation:** Fresh agent context. Does not receive the research doc or the Stage 2 analyst's reasoning — only the output report. An analyst who knows the reasoning can't challenge it cleanly.

**Prompt template:**

```
You are running a Strategic Council review for an AgentFail incident report.

The draft report is the only thing you have: [paste drafts/AAGF-YYYY-NNN-draft.md]

Run three phases:

## PHASE 1 — CHALLENGER
Challenge the analysis. Your job is to find weaknesses, not to be fair.

- Are the root causes actual root causes, or symptoms of something deeper?
- Is the severity rating justified by the evidence, or is it speculation?
- Are the damage figures (financial, operational, recovery) estimated or documented? Is the basis clear?
- Are the `damage_speed` and `business_criticality` ratings justified by the evidence or inferred?
- What alternative explanations for the incident exist that the analyst didn't consider?
- Are the solutions actually feasible, or do they ignore real-world constraints?
- What biases might be present in the source reporting?
- What claims are asserted without sufficient evidence?

Output: 4-6 specific challenge points with evidence or reasoning.

## PHASE 2 — STEELMAN
Defend the strongest version of the analysis.

- What is the most defensible interpretation of the evidence?
- What additional evidence in the report supports the conclusions?
- Why are the proposed solutions the right ones for this incident?
- What is the strongest case for the severity, damage, and business criticality ratings?

Output: 3-5 defense points with supporting evidence.

## PHASE 3 — SYNTHESIS
Reconcile challenger and steelman findings.

- Which challenger points were valid and require report updates?
- Which were addressed by the steelman?
- Final balanced verdict on the analysis quality.
- Confidence level (High/Medium/Low) and why.
- Unresolved uncertainties — what would resolve each.

Output: 2-3 paragraph synthesis + confidence level + unresolved uncertainties list.

Add the Strategic Council Review section to the draft with all three phases.
Provide a one-sentence `council_verdict` for the YAML frontmatter.
Update `status` to "reviewed" and set `date_council_reviewed` to today.
```

**Output:** `drafts/AAGF-YYYY-NNN-draft.md` (updated with council review section + reviewed status)

---

## Stage 4: Publisher

**Goal:** Final QA, publish, and update the relationship graph.

**Inputs:**
- `drafts/AAGF-YYYY-NNN-draft.md` (council-reviewed)
- `relationships/graph.md`

**Isolation:** Fresh agent context. No prior conversation.

**Prompt template:**

```
You are the publisher for AgentFail. A draft incident report has completed all review stages.

Draft: [paste drafts/AAGF-YYYY-NNN-draft.md]
Relationship graph: [paste relationships/graph.md]

## Your Tasks

1. **Final formatting pass**: all sections complete, consistent, professional. No orphaned placeholders.

2. **Schema validation** (manual until Phase 2 script): verify every required field in the frontmatter is populated with a valid value. Use the enum list from scripts/analyze-incident.md Stage 0. Flag any gaps.

3. **Cross-reference check**: related_incidents IDs exist in incidents/ folder; taxonomy terms match categories.md; framework_refs IDs match taxonomy/framework-mapping.md.

4. **`headline_stat` check**: is this genuinely the most visceral/shareable damage fact for this incident? If financial and operational damage both exist, is the more compelling one chosen?

5. **`operator_tldr` check**: is this specific and actionable? "Set X in Y before doing Z" is good. "Be careful with agents" is not.

6. **`business_criticality` check**: does the `business_criticality_notes` field provide enough context for a reader to understand why this criticality level was assigned?

7. Set `status: "published"` and `date_curated` to today's date.

8. **Relationship graph updates**:
   - Does this incident belong to an existing pattern_group?
   - Does it warrant a new pattern_group?
   - Update root cause clusters, platform clusters, industry clusters
   - Add to the Relationship Log
   - If `actual_vs_potential` is "near-miss" or "partial", note this in the graph

9. Move the finalized report to `incidents/AAGF-YYYY-NNN.md`
10. Update `relationships/graph.md`

Output:
- `incidents/AAGF-YYYY-NNN.md` (final published report)
- `relationships/graph.md` (updated)
- **Publish note** (3-5 lines): ID, title, severity, headline_stat, key takeaway — for changelog/newsletter use
```

**Output:**
- `incidents/AAGF-YYYY-NNN.md`
- `relationships/graph.md` (updated)
- Publish note

---

## Stage 5: Retrofill Agent

**Goal:** Backfill new or missing frontmatter fields in existing published incidents using only the information already in the incident file. No new research.

**Use when:** New fields are added to TEMPLATE.md and existing incidents need to be updated.

**Inputs:**
- The existing incident file (e.g. `incidents/AAGF-2026-001.md`)
- The list of fields to fill

**Isolation:** One agent per incident. Does not see other incidents. Derives values from the report body — does not invent or estimate beyond what the text supports.

**Prompt template:**

```
You are updating an existing AgentFail incident report to add missing frontmatter fields.

Existing incident: [paste incidents/AAGF-YYYY-NNN.md]

## Fields to Add

Add the following fields to the YAML frontmatter. Derive all values from information already present in the report body. Do not invent, assume, or research new information. If a value cannot be determined from the existing text, use null or "unknown" — never guess.

Fields to populate:
- `damage_speed`: how fast the damage unfolded (look in Timeline, What Happened, Technical Analysis)
- `damage_duration`: how long the harmful event ran
- `total_damage_window`: full window from first sign to containment
- `recovery_time`: how long recovery took (look in Impact Assessment, Fix sections)
- `recovery_labor_hours`: person-hours on recovery (null if not in text)
- `recovery_cost_usd`: recovery cost beyond direct loss (null if not in text)
- `recovery_cost_notes`: any narrative about recovery effort
- `full_recovery_achieved`: was full recovery achieved (look at Fix section)
- `business_scope`: scope of business impact (individual/team/department/organization)
- `business_criticality`: how critical was this to the business (look at Impact Assessment)
- `business_criticality_notes`: one sentence explaining why
- `systems_affected`: list of systems impacted

## Rules
- Derive from the report text, not from general knowledge
- Use the valid enum values from TEMPLATE.md comments
- For `damage_speed` and `damage_duration`, be specific: "9 seconds" not "fast"
- If the report says "the loop ran for 26 hours", damage_speed is "26 hours"
- If the report doesn't mention recovery labor, recovery_labor_hours is null — not an estimate
- Place the new fields in the correct section (after `full_recovery_achieved: ""` in the Damage Timing and Recovery section)

Output: The complete updated YAML frontmatter block only (from --- to ---). I will apply it manually.
```

---

## Fast-Track Mode (for trending incidents)

When an incident is getting attention and speed matters more than completeness:

1. Run Stage 1 (Research Agent) as normal
2. Skip Stage 2 full analysis — write a **minimal publish** instead:
   - Fill all frontmatter fields (required)
   - Write Executive Summary (3 sentences)
   - Write Timeline
   - Write operator_tldr and headline_stat
   - Mark sections "Full analysis in progress"
3. Skip Stage 3 (Council Review) — add `council_reviewed: false` to frontmatter
4. Publish directly
5. **Within 7 days**: run Stages 2-4 to complete the full analysis and update the published file

Fast-track incidents are flagged with `status: "fast-track"` until full analysis is complete.

---

## Incident ID Assignment

Format: `AAGF-YYYY-NNN`

Check `incidents/` for the highest NNN in the current year. Increment by 1.
First incident of a year: `AAGF-YYYY-001`.
Reserved IDs (in `relationships/graph.md`): treat as assigned even if not yet published.

---

## Stage Skip Guidelines

| Situation | Action |
|-----------|--------|
| Only 1 low-credibility source | Don't start — wait for corroboration |
| Stage 1 research < 300 words of substance | Park in drafts with a note, return later |
| Clearly Low severity | Run all stages — Low incidents matter for patterns |
| Duplicate of existing incident | Add as a related incident entry only; no new report |
| Trending incident, speed matters | Use Fast-Track Mode |
| Borderline whether it qualifies | Start Stage 1 only; decide after research |
