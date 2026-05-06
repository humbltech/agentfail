Run the full AgentFail 4-stage analysis pipeline on one or more incident URLs.

Arguments: $ARGUMENTS

The arguments are one or more URLs (space-separated) pointing to source material for a single incident. If the argument is an AAGF ID (e.g., `AAGF-2026-008`), check `drafts/candidates-*.md` files for matching URLs.

---

## Pipeline Overview

This pipeline has 4 stages. Each stage runs as an **isolated subagent** (using the Agent tool) that receives ONLY its specified inputs — never prior agent conversations. This isolation is critical for analysis quality.

```
Stage 1: Research → drafts/AAGF-YYYY-NNN-research.md
Stage 2: Analysis → drafts/AAGF-YYYY-NNN-draft.md
Stage 3: Council Review → updates draft with council section
Stage 4: Publish → incidents/AAGF-YYYY-NNN.md + updates relationships/graph.md
```

---

## Before Starting

1. **Determine the next incident ID**: Read filenames in `incidents/` and `drafts/` to find the highest `AAGF-YYYY-NNN` number for the current year. Increment by 1. This is the ID for this incident.

2. **Read these reference files** (you'll pass relevant parts to subagents):
   - `incidents/TEMPLATE.md`
   - `taxonomy/categories.md`
   - `taxonomy/severity.md`
   - `taxonomy/agent-types.md`
   - `taxonomy/solution-types.md`
   - `taxonomy/framework-mapping.md`
   - `relationships/graph.md`
   - `scripts/analyze-incident.md` (for the detailed stage prompts)

3. **Tell the user**: "Starting pipeline for [ID]. Source URLs: [list]. Running Stage 1 (Research)..."

---

## Stage 1: Research Agent

Spawn an **isolated subagent** (Agent tool) with these instructions:

**What the subagent receives:**
- The source URL(s)
- The triage criteria from `sources/monitoring.md`

**What the subagent does:**
- Fetch and analyze the primary source(s) in full detail using WebFetch
- Web search for additional coverage, technical writeups, vendor responses, community discussion
- Search for similar past incidents (same agent type, platform, attack vector)
- Find follow-up reporting: was it patched? vendor response? final impact?
- Identify the specific technical mechanism of failure

**What the subagent extracts (with source attribution for every claim):**
- **Dates**: date_occurred, date_discovered, date_reported (three separate values — `date_reported` = date of **first public disclosure**, NOT the date of vendor notification or HackerOne/bug-bounty report)
- **Source bias flag**: If the primary source is the disclosing researcher or a security vendor, explicitly note this and flag any quantitative claims (user counts, exposure counts, affected deployment counts) that lack independent corroboration from a third-party source
- **Damage**: direct financial, operational, data exposure, reputational, damage speed, damage duration, recovery details, business scope, business criticality
- **Technical detail**: agent framework/platform/version, tools/permissions/integrations, exact mechanism of failure, code/config snippets
- **Vendor response**: acknowledged? fixed? refunded? timeline of response or non-response
- **Affected parties**: who, how many, what industry, what data types exposed
- **Classification assessment**: likely categories, severity, ATLAS techniques, actual vs potential harm

**What the subagent saves:**
- Output file: `drafts/{ID}-research.md`

After Stage 1 completes, read the output file. Tell the user: "Stage 1 complete. Research saved. Running Stage 2 (Analysis)..."

---

## Stage 2: Analysis Agent

Spawn an **isolated subagent** with these instructions:

**What the subagent receives:**
- The full content of `drafts/{ID}-research.md` (Stage 1 output)
- The full content of `incidents/TEMPLATE.md`
- The full content of `taxonomy/categories.md`, `taxonomy/severity.md`, `taxonomy/agent-types.md`, `taxonomy/solution-types.md`
- The full content of `taxonomy/framework-mapping.md`
- The current `relationships/graph.md` content (for checking existing connections)

**What the subagent does:**
- Fill the YAML frontmatter completely — every field populated or explicitly null. Use the TEMPLATE.md as the schema reference.
- **`date_reported` must be the date of first public disclosure** (first credible public source: news article, CVE publication, researcher blog post, GitHub Advisory). It is NOT the date the vulnerability was reported to the vendor or submitted via HackerOne/bug bounty. If both dates exist, use the public disclosure date.
- **Category names must match the taxonomy exactly** — no spaces around slashes. Use `"Prompt Injection/Jailbreak Exploitation"` not `"Prompt Injection / Jailbreak Exploitation"`. Valid categories are in taxonomy/categories.md; copy them verbatim.
- Write each report section in full:
  - **Timeline**: chronological table with specific timestamps
  - **What Happened**: detailed narrative for practitioners
  - **Technical Analysis**: mechanism of failure, architecture that enabled it
  - **Root Cause Analysis**: 5 Whys — push past symptoms to systemic cause. Root cause should feel non-obvious.
  - **Impact Assessment**: quantify everything quantifiable. Separate direct financial, recovery, operational, data, reputational.
  - **Prevention**: specific controls, not generic advice
  - **Fix**: actual remediation + recommended additional steps
  - **Solutions Analysis**: 3-5 solutions, each rated plausibility (1-5) and practicality (1-5) with justification and limitations
  - **Related Incidents**: check graph.md for connections
- `headline_stat` picks the most visceral damage signal regardless of type
- `operator_tldr` must be specific and actionable
- Framework refs must be populated using framework-mapping.md with inline comments

**What the subagent saves:**
- Output file: `drafts/{ID}-draft.md`

After Stage 2 completes, read the draft. Do a quick **schema validation** — check that all required frontmatter fields are populated per the enum lists in `scripts/analyze-incident.md` Stage 0. If anything is missing, note it and tell the user. Then: "Stage 2 complete. Draft saved. Running Stage 3 (Council Review)..."

---

## Stage 3: Strategic Council Review Agent

Spawn an **isolated subagent** with these instructions:

**What the subagent receives:**
- The full content of `drafts/{ID}-draft.md` ONLY
- It does NOT receive the research document or the Stage 2 reasoning

**What the subagent does — three phases:**

**PHASE 1 — CHALLENGER**: Find weaknesses. Not trying to be fair.
- Are root causes actual root causes or symptoms?
- Is severity justified by evidence or speculation?
- Are damage figures estimated or documented? Is the basis clear?
- Are damage_speed and business_criticality justified?
- What alternative explanations exist?
- Are solutions actually feasible?
- What biases in source reporting?
- What claims lack sufficient evidence?
- Output: 4-6 specific challenge points with evidence or reasoning.

**PHASE 2 — STEELMAN**: Defend the strongest version.
- Most defensible interpretation of evidence
- Additional evidence supporting conclusions
- Why proposed solutions are right for this incident
- Strongest case for severity, damage, criticality ratings
- Output: 3-5 defense points with supporting evidence.

**PHASE 3 — SYNTHESIS**: Reconcile.
- Which challenger points require report updates?
- Which were addressed by steelman?
- Final balanced verdict on analysis quality
- Confidence level (High/Medium/Low) and why
- Unresolved uncertainties — what would resolve each
- Output: 2-3 paragraph synthesis + confidence level + uncertainties list.

**What the subagent updates:**
- Add the Strategic Council Review section (all three phases) to the draft
- Write a one-sentence `council_verdict` for the YAML frontmatter
- Update `status` to `"reviewed"` and set `date_council_reviewed` to today's date
- Save the updated file back to `drafts/{ID}-draft.md`

After Stage 3 completes, read the updated draft. Tell the user: "Stage 3 complete. Council review added. Running Stage 4 (Publish)..."

---

## Stage 4: Publisher Agent

Spawn an **isolated subagent** with these instructions:

**What the subagent receives:**
- The full content of `drafts/{ID}-draft.md` (council-reviewed)
- The full content of `relationships/graph.md`
- The list of filenames in `incidents/` (for cross-reference checks)
- The enum lists from `scripts/analyze-incident.md` Stage 0 (for schema validation)

**What the subagent does:**
1. **Final formatting pass**: all sections complete, consistent, professional. No orphaned placeholders.
2. **Schema validation**: verify every required frontmatter field has a valid value per the enum lists. Flag any gaps.
3. **Cross-reference check**: related_incidents IDs exist in incidents/; taxonomy terms match categories.md; framework_refs match framework-mapping.md.
4. **headline_stat check**: is this the most visceral/shareable damage fact?
5. **operator_tldr check**: is this specific and actionable?
6. **business_criticality check**: does business_criticality_notes explain the rating?
7. Set `status: "published"` and `date_curated` to today's date.
8. **Relationship graph updates**: Does it belong to an existing pattern_group? Warrant a new one? Update root cause clusters, platform clusters, industry clusters. Add to the Relationship Log.
9. Save the finalized report to `incidents/{ID}.md`
10. Save the updated `relationships/graph.md`

**What the subagent outputs:**
- `incidents/{ID}.md` (final published report)
- `relationships/graph.md` (updated)
- A publish note: ID, title, severity, headline_stat, key takeaway (3-5 lines)

---

## After Pipeline Completes

1. Read the published incident file and the updated graph to confirm they were saved correctly
2. Report to the user:
   - Published incident ID and title
   - Severity and headline_stat
   - Council confidence level
   - Pattern group (new or existing)
   - The publish note
   - Any schema validation warnings from Stage 2 or Stage 4
3. Remind the user to review before committing: "Review the published report at `incidents/{ID}.md` and the updated graph at `relationships/graph.md`. When ready, ask me to commit."

---

## Error Handling

- If a subagent fails or produces incomplete output, do NOT proceed to the next stage. Tell the user what failed and why.
- If Stage 1 research finds fewer than 300 words of substance, stop and tell the user: "Insufficient source material — park this in drafts and return when more information emerges."
- If Stage 2 schema validation finds critical missing fields, pause and fix them before Stage 3.
- If the incident appears to be a duplicate of an existing one, stop after Stage 1 and tell the user — suggest adding it as a related incident entry instead.
