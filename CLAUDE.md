# AgentFail — Claude Context

## What This Project Is

AgentFail is a curated database of real-world AI agent incidents. Primary audience: security teams and operators running AI agents in production. The differentiator is depth: 5 Whys root cause analysis, operator-actionable TL;DRs, solutions rated by plausibility AND practicality, and dialectical quality control (Challenger → Steelman → Synthesis).

## How to Run the Pipeline

Use `/run-pipeline [URL or AAGF-ID]`. The full prompt is in `.claude/commands/run-pipeline.md`.

To determine the next incident ID: check `incidents/` for the highest AAGF-2026-NNN filename and increment by 1.

AAGF-2026-018 is intentionally skipped — it was a duplicate of AAGF-2026-012.

## Candidate Backlog

`drafts/candidates-2026-05-05-comprehensive.md` — comprehensive Tier 1/2/3 candidate list. Check `incidents/` to see which have already been published.

---

## Website Design Decisions

### Visual Identity — Non-Negotiable

**Accent color:** Warm terracotta/clay — take cues from Claude/Anthropic's `#d97757` orange. Do NOT use teal (`#14b8a6`) or any cool-toned accent. The aesthetic is "intelligence briefing from inside the AI ecosystem," not a generic security dashboard.

**Typography:** Premium geometric sans-serif. JetBrains Mono is used for the display/terminal aesthetic on the current branch. Do NOT use Instrument Serif. The font should feel precise and technical, not editorial.

**Backgrounds:** Warm-tinted darks (warm neutrals, not pure neutral black/grey).

### Potential Damage — Must Be Prominent

This is the single most important UX requirement for the website.

Documented financial losses across all incidents are small (~$8-9K). But near-miss potential (incidents where a vulnerability existed but wasn't exploited, or where only one person was affected but thousands were at risk) is orders of magnitude larger.

**Required on the main dashboard:**
- A callout showing documented losses vs. near-miss potential as contrasting figures
- Not buried in a stats grid — this contrast IS the story

**Required on per-incident pages:**
- The `actual_vs_potential`, `potential_damage`, and `intervention` frontmatter fields must render as a visually distinct warning block
- Should visually contrast with the actual damage section (different color treatment, different visual weight)
- The "what could have been" story must not be buried in metadata

The three relevant frontmatter fields per incident:
- `actual_vs_potential`: `"actual"` | `"partial"` | `"near-miss"`
- `potential_damage`: free text describing the worst-case if not caught
- `intervention`: what stopped the full damage from occurring

### Incident Visibility

Incidents can be marked internal/not-published with an explicit reason field. This is an editorial exclusion decision — different from `status: draft`. The reason should be documented (e.g. "illustrative scenario, not a real production incident").

---

## PromptIntel Cross-Reference

Nova Hunting's PromptIntel (promptintel.novahunting.ai) is a complementary database — attack/detection side where AgentFail is failure/consequence side. Their taxonomy (especially "Agentic Misuse" and "Multi-Agent Collusion" subcategories) maps to AgentFail failure modes. Natural cross-referencing and potential partnership opportunity. Their NOVA framework uses YARA-style rules for prompt classification.
