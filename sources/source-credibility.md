# Source Credibility Framework

Not all sources are equal. Each source cited in an incident report gets a credibility rating. This is recorded in the References table of each report.

---

## Credibility Levels

### High
Sources where the information is first-hand, verified, or from a trusted technical authority.

**Qualifies as:**
- Official vendor security advisory or post-mortem
- Primary research paper (peer-reviewed or from credible institution)
- Direct technical writeup from the affected organization
- CVE entry with technical details
- First-party disclosure from the person/org that discovered it
- Code or logs published as evidence

**Treat as:** Assume accurate unless contradicted by other High sources.

---

### Medium
Sources that are credible but second-hand, aggregated, or partially verified.

**Qualifies as:**
- Reputable security journalism (Wired, Ars Technica, The Register, TechCrunch)
- AI safety research blogs (Simon Willison, Embrace The Red, Adversa AI)
- Aggregator databases (AIID, AIAAIC) — they curate but don't always verify
- GitHub issue reports with technical detail
- Reddit posts with specific technical claims and no contradicting evidence

**Treat as:** Verify the most critical claims against High sources where possible.

---

### Low
Sources that report on incidents without primary evidence, or have credibility limitations.

**Qualifies as:**
- News articles without direct quotes or technical detail
- Social media posts (unless from the discoverer directly)
- Company blog posts downplaying their own incidents (potential minimization bias)
- Anonymous reports
- Secondhand accounts ("I heard that...")

**Treat as:** Useful for leads and context; do not rely on for technical claims without corroboration.

---

## Source Flags

Add these flags in the References table when relevant:

| Flag | Meaning |
|------|---------|
| `[PRIMARY]` | First-hand source — directly from the discoverer or affected party |
| `[VENDOR]` | From the company whose product was involved — watch for minimization bias |
| `[ACADEMIC]` | Peer-reviewed or academic research |
| `[PAYWALLED]` | Source is behind a paywall — note what was accessible |
| `[DELETED]` | Source has been removed — cite with archive.org link if available |
| `[CONTESTED]` | Claims in this source are disputed by other sources — note the dispute |
| `[TRANSLATED]` | Content was translated — translation quality may affect accuracy |

---

## Handling Conflicting Sources

When sources disagree on facts:

1. **Give weight to higher credibility sources** — High > Medium > Low
2. **Note the conflict in the report** — Don't silently pick one version
3. **Describe both versions** in What Happened if the conflict is material
4. **Flag in Council Review** — The Challenger phase should surface source conflicts
5. **Note unresolved** in the Synthesis — mark confidence level accordingly

---

## Minimum Source Requirement

No incident should be published with:
- Fewer than 2 sources total
- Zero High or Medium credibility sources
- Only Low credibility sources (unless flagged as unverified/preliminary and kept in drafts)
