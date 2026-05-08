# AAGF-2026-075 Research: CVE-2026-32922 OpenClaw Privilege Escalation CVSS 9.9

**Research date:** 2026-05-08
**Researcher:** Stage 1 Agent
**Sources fetched:**

| URL | Status | Yield |
|-----|--------|-------|
| https://www.armosec.io/blog/cve-2026-32922-openclaw-privilege-escalation-cloud-security/ | Fetched (JS-heavy, article body not rendered) | No extractable article text |
| https://nflo.tech/knowledge-base/2026-03-29-cve-2026-32922-en/ | Fetched | Good — dates, mechanism, CVSS, patch info |
| https://www.thehackerwire.com/openclaw-privilege-escalation-to-rce-cve-2026-32922/ | 403 Forbidden | No data |
| https://blink.new/blog/cve-2026-32922-openclaw-privilege-escalation-fix-guide | Fetched | Excellent — full timeline, code file, exploitation chain, exposure stats |
| https://nvd.nist.gov/vuln/detail/CVE-2026-32922 | Fetched | Confirmed CVSS, CWE, dates, source attribution (VulnCheck) |
| https://github.com/advisories/GHSA-4jpw-hj22-2xmc | Fetched | Confirmed advisory text, affected versions, CVSS vector, reporter |
| https://github.com/openclaw/openclaw/security/advisories/GHSA-4jpw-hj22-2xmc | Fetched | Full advisory confirmed (tdjackey reporter) |
| https://github.com/openclaw/openclaw/issues/20702 | Fetched | Filed by @coygeek Feb 19, reproduction steps, code excerpt |
| https://github.com/openclaw/openclaw/pull/20703 | Fetched | Fix merged Feb 20 by mbelinky, code changes described |
| https://github.com/openclaw/openclaw/releases/tag/v2026.3.11 | Fetched | Release date March 12; WebSocket fix (GHSA-5wcw-8jjv-m286) — token.rotate fix NOT explicitly named in release notes |
| https://github.com/openclaw/openclaw/releases | Fetched | Only May 2026 releases visible |
| https://github.com/openclaw/openclaw/security/advisories | Fetched | 10 other advisories listed; GHSA-4jpw-hj22-2xmc not on first page |
| https://www.cve.org/CVERecord?id=CVE-2026-32922 | Fetched (JS required) | No extractable data |
| https://vulncheck.com/advisories/openclaw-privilege-escalation | 404 | No data |
| https://www.shodan.io/search?query=openclaw | Fetched | 159,462 instances detected (Shodan scan, date unclear) |

---

## Key Facts (with source attribution)

### Timeline

| Date | Event | Source |
|------|--------|--------|
| February 19, 2026 | GitHub Issue #20702 filed by @coygeek reporting the scope escalation bug | blink.new; GitHub Issue |
| February 20, 2026 | PR #20703 merged by mbelinky; fix committed to main | GitHub PR #20703 |
| March 12, 2026 | v2026.3.11 released (GHSA says this is the patched version; release notes name WebSocket fix GHSA-5wcw-8jjv-m286 but token.rotate fix not explicitly called out) | blink.new; GitHub release |
| March 13, 2026 | Fix merged + GHSA-4jpw-hj22-2xmc published (per blink.new; slight discrepancy with March 12 release date — likely both refer to same release window) | blink.new |
| March 16, 2026 | CVE-2026-32922 reserved by VulnCheck | blink.new |
| March 29, 2026 | CVE-2026-32922 published on cve.org | blink.new; nflo.tech; NVD |
| March 31, 2026 | NVD initial analysis published | NVD |
| April 1, 2026 | Related CVE-2026-33579 disclosed (details not obtained) | blink.new |

**Key ambiguity on date_occurred:** The vulnerable code was present in all versions ≤ 2026.3.8 (GHSA). The exact introduction date is unknown but the code existed prior to February 19, 2026 (Issue filing date).

**Discovery date:** February 19, 2026 — @coygeek filed Issue #20702. The issue notes "AI-assisted disclosure (GPT-5.3-Codex)" suggesting automated tooling may have found the pattern. Formal GHSA reporter credited as tdjackey (different handle — possibly ARMO researcher who did coordinated disclosure).

**Patch date:** PR merged February 20; GHSA advisory published March 13; CVE published March 29. The patch was available approximately 37 days before public CVE disclosure.

### Exposure Statistics

- **135,000+ publicly exposed instances** — cited across nflo.tech, blink.new, and triage brief; attributed to ARMO research
- **63% running without authentication** — attributed to ARMO's Shodan analysis; meaning approximately 85,000+ instances were fully unauthenticated (zero credential barrier)
- **Shodan independent check** (this research, date unclear): 159,462 instances detected; geographic breakdown: US 28.6%, China 21.1%, Germany 9.8%, Singapore 9.1%, UK 6.1%; Linode, Aliyun, DigitalOcean, Hetzner as top hosters. Note: Shodan figure (159K) is higher than ARMO's February figure (135K) — likely reflects growth in deployed instances between ARMO's scan and current date.
- **340,000+ GitHub stars** — from triage brief; attests to massive install base

### CVSS Scores

- **CVSS v3.1: 9.9 CRITICAL** — Vector: `AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H` (NVD, GHSA)
- **CVSS v4.0: 9.4 CRITICAL** — Vector: `AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H` (NVD)
- **Note:** GitHub Issue #20702 filed with CVSS 8.1/8.6 (High) — the reporter's initial assessment was upgraded to 9.9 by VulnCheck during formal CVE assignment. This is significant: the original reporter may have underestimated severity.

### CWE Classification

- **CWE-269: Improper Privilege Management** (NVD)
- **CWE-266: Incorrect Privilege Assignment** (NVD alternate; both cited across sources)
- GHSA lists CWE-269

---

## Technical Analysis

### The Vulnerable Component

**File:** `openclaw/src/infra/device-pairing.ts`, lines 289–312
**Function:** `rotateDeviceToken` (exposed as the `device.token.rotate` API endpoint)

### Root Cause

The `rotateDeviceToken` function accepts a caller-supplied `scopes` parameter and validates those scopes against the **target device's approved scopes**, but crucially does NOT validate them against the **caller's own current scope set**.

Pseudocode of the vulnerability (reconstructed from Issue #20702 and PR #20703):

```typescript
// VULNERABLE CODE (pre-patch)
const requestedScopes = normalizeDeviceAuthScopes(
  params.scopes ?? existing?.scopes ?? device.scopes
);
// Validates: requestedScopes ⊆ targetDevice.approvedScopes   ✓
// Missing:   requestedScopes ⊆ callerToken.scopes            ✗
```

The function checked "is this scope allowed for the target device?" but not "does the caller have the right to grant these scopes?" A device with `operator.pairing` scope could rotate a token for any already-paired admin device and receive back `operator.admin` scope by simply requesting it.

The `scopesAllow()` validation function existed in the codebase but was never invoked during the token rotation path. (Source: GitHub Issue #20702)

### The Fix (PR #20703)

The patch introduces an immutable `approvedScopes` field on paired device metadata, tracking scopes approved at pairing time:

1. **Scope subsetting enforced:** `requestedScopes` must now be a subset of the **caller's own approved scopes** (not just the target device's scopes)
2. **Hierarchical scope validation:** Added `expandScopeImplications` and `scopesAllowWithImplications` helpers to handle scope hierarchy (e.g., `operator.admin` implies `operator.read`)
3. **Response redaction:** `approvedScopes` field removed from API responses to prevent scope enumeration
4. **Metadata protection:** `updatePairedDeviceMetadata` cannot modify `approvedScopes` post-pairing

Files modified: `src/infra/device-pairing.ts` (+43/-6), `src/infra/device-pairing.test.ts` (+23/-2), `src/gateway/server-methods/devices.ts` (+1/-1)

### Exploitation Chain (Operator.Pairing → RCE)

**Step 1 — Initial Access (two sub-paths):**
- *Path A (authenticated):* Attacker legitimately pairs a device with the OpenClaw gateway, receiving a low-privilege `operator.pairing` token. This is standard onboarding functionality.
- *Path B (unauthenticated):* On the 63% of instances running without authentication, attacker calls the pairing endpoint without any credentials. Zero barrier to initial token acquisition.

**Step 2 — Privilege Escalation:**
```
POST /api/device.token.rotate
Authorization: Bearer <operator.pairing token>
Body: { "scopes": ["operator.admin"] }
```
Response: valid `operator.admin` token. No additional validation, no MFA, no admin approval.

**Step 3 — Lateral Movement to All Nodes:**
With `operator.admin` token, attacker gains unauthorized gateway-admin access across all devices registered to that OpenClaw instance, including connected agent nodes (companion apps, worker nodes, external integrations).

**Step 4 — Remote Code Execution:**
On nodes/systems exposing `system.run`, the attacker calls:
```
system.run("<arbitrary shell command>")
```
OpenClaw has native shell access, file management, email, and calendar capabilities as core features. The `system.run` primitive executes arbitrary commands on the node host. This is not a secondary exploit — it is built-in agent functionality accessible to any admin-scoped token holder.

**Blast radius:** All connected agent nodes across the compromised instance. On a multi-node OpenClaw deployment, a single `operator.pairing` token yields shell access to every connected node.

### Why CVSS Is 9.9 (Not 9.8)

The `S:C` (Scope: Changed) component in the CVSS vector explains why the score reaches 9.9. The vulnerability's impact extends beyond the vulnerable component (the gateway) to all connected nodes — a textbook scope change. The only missing element from a perfect 10.0 would be zero privileges required; `PR:L` (Low privileges required) drops it fractionally below maximum.

### Related CVE

**CVE-2026-33579** — disclosed April 1, 2026; no details obtained. Likely related to the same release cycle given the one-day gap from CVE-2026-32922's NVD analysis.

---

## Vendor Response

**OpenClaw's response was fast on the technical side but slow on public disclosure:**

| Action | Date | Notes |
|--------|------|-------|
| Fix merged (PR #20703) | February 20, 2026 | ~1 day after issue filed |
| v2026.3.11 released | March 12–13, 2026 | 21 days after fix merge |
| GHSA published | March 13, 2026 | Same day as release |
| CVE reserved | March 16, 2026 | VulnCheck, not OpenClaw directly |
| CVE published | March 29, 2026 | 37 days after patch available |

The gap between patch merge (Feb 20) and public release (March 12) — 20 days — suggests OpenClaw may have staged the release or waited to bundle multiple security fixes. v2026.3.11 release notes also include WebSocket origin validation fix (GHSA-5wcw-8jjv-m286, `system.run` approval enforcement, plugin route scoping, session-tree isolation hardening — suggesting a coordinated security batch release.

The community-recommended safe baseline is **v2026.3.21** (includes additional hardening beyond the minimum fix). Source: blink.new.

**No public statement or security blog post from OpenClaw was identified.** Public disclosure appears driven by ARMO (external researcher) and VulnCheck (CVE assigner), not by the vendor itself.

---

## Relationship to Prior OpenClaw Incidents in AgentFail

| Incident | CVE | Mechanism | Relationship |
|----------|-----|-----------|--------------|
| AAGF-2026-010 | ClawHavoc, ClawBleed, ClawJacked (partial), 137 advisories | Multiple; 21,639 exposed instances | Same project, earlier crisis wave |
| AAGF-2026-017 | N/A | MJ Rathbun autonomous retaliation | Same project, different failure mode (behavior) |
| AAGF-2026-028 | CVE-2026-28472 | WebSocket hijacking (ClawJacked) | Adjacent — WebSocket issue fixed in same v2026.3.11 release batch as CVE-2026-32922 |
| **AAGF-2026-075** | **CVE-2026-32922** | **device.token.rotate scope escalation → RCE** | **New, distinct vulnerability** |

**Pattern observation:** OpenClaw has a systemic authorization boundary problem. CVE-2026-28472 (WebSocket) and CVE-2026-32922 (token rotation) both involve the gateway failing to enforce caller identity/privilege constraints. The root cause at the architectural level appears to be an assumption that callers within the gateway perimeter are trusted — a design error compounded by the absence of defense-in-depth on the token issuance path.

The exposure count also grew between incidents: AAGF-2026-010 documented 21,639 exposed instances; AAGF-2026-075's 135,000+ represents roughly a 6x increase in the attack surface, consistent with OpenClaw's rapid adoption growth (340K GitHub stars).

---

## Source Quality Assessment

**High confidence sources:**
- NVD entry (authoritative; VulnCheck as CNA; CVSS vector confirmed)
- GHSA-4jpw-hj22-2xmc (GitHub official advisory; confirmed CVSS, affected versions, reporter)
- GitHub Issue #20702 (primary disclosure; code-level detail; coygeek as filer)
- GitHub PR #20703 (fix confirmed; code changes specific; merged Feb 20)
- blink.new writeup (most technically detailed; includes timeline, file paths, code logic, exposure stats; appears to aggregate primary sources accurately)
- nflo.tech (corroborates core facts; brief but consistent)

**Lower confidence / unverifiable:**
- thehackerwire.com: 403 — no data obtained; cannot assess quality
- ARMO blog (armosec.io): Page rendered as JavaScript-only; article body not extractable. ARMO is the credited researcher organization; their blog is the authoritative source for exposure statistics (135K, 63% unauthenticated) but these figures could not be directly verified from the page
- Shodan data (159K instances): This research's Shodan fetch reflects current state (May 2026), not February 2026 ARMO scan. The ~24K difference is directionally consistent with growth over ~3 months
- CVE-2026-33579: Referenced in blink.new as "April 1, 2026 related CVE" — no details obtainable; relationship to CVE-2026-32922 unknown

**Conflicting data points:**
1. **CVSS severity:** Issue #20702 filed at 8.1/8.6 (High); official CVE is 9.9/9.4 (Critical). The upgrade was applied during VulnCheck's CVE assignment, likely reflecting the `S:C` scope change across connected nodes that the original reporter may not have fully modeled.
2. **Reporter identity:** Issue filed by @coygeek; GHSA credits tdjackey. Possibly the same person with different handles, or coordinated disclosure involving a second researcher (potentially ARMO).
3. **Fix date vs. release date:** PR merged Feb 20; GHSA says March 13; v2026.3.11 release page shows March 12. One-day rounding artifact; effectively same event.
4. **v2026.3.11 release notes:** The release notes fetched describe a WebSocket fix (GHSA-5wcw-8jjv-m286) as the security headline, not the token.rotate fix. This may indicate OpenClaw deliberately led with the WebSocket fix in user-facing notes while quietly bundling the privilege escalation fix — a potentially concerning disclosure practice.

---

## Classification Assessment

**Likely categories:**
- `privilege-escalation` (primary — scope escalation via broken authorization)
- `remote-code-execution` (consequence — via system.run on connected nodes)
- `broken-authorization` (mechanism — caller scope not validated against token scope)
- `supply-chain-risk` / `lateral-movement` (reach — all connected agent nodes compromised)

**Likely severity:** CRITICAL
- CVSS 9.9 with network attack vector, low privileges required, no user interaction, scope changed
- 135K+ exposed instances, 63% unauthenticated
- RCE on autonomous agents with shell, file, email, calendar access
- Real-world exploitation likelihood elevated by absence of public PoC combined with detailed reproduction in a public GitHub issue

**actual_vs_potential:** `near-miss`
- **Justification:** No confirmed exploitation in the wild identified across all sources. The CVE was published 37 days after the patch, and no public PoC exists beyond GitHub Issue #20702's reproduction steps. However, the issue was public from February 19 — a 37-day window between public issue disclosure and CVE publication during which exploitation was possible. Given 85,000+ unauthenticated instances, exploitation cannot be ruled out; it is simply unconfirmed. Classification as `near-miss` reflects: (a) no known breaches documented, (b) actual capability for mass-scale compromise existed for weeks, (c) the gap between documented harm ($0 confirmed) and potential harm (shell access across 135K deployments) is extreme.

**Potential damage (if exploited at scale):**
- Shell command execution on all connected OpenClaw agent nodes
- File system exfiltration or destruction
- Email account access and impersonation (OpenClaw has native email integration)
- Calendar manipulation
- Lateral movement to any systems accessible from agent nodes
- Complete takeover of autonomous agent infrastructure for enterprises, developers, and AI-powered applications relying on OpenClaw

**intervention:** Patch (PR #20703) merged February 20 before CVE public disclosure. The ~20 day gap between fix merge and release, and 37-day gap to CVE publication, served as a partial containment window. No evidence of coordinated responsible disclosure embargo beyond the standard VulnCheck CVE reservation process.

**ATLAS Techniques (MITRE ATLAS):**
- **AML.T0012 — Valid Accounts:** Attacker uses legitimately obtained `operator.pairing` token as initial access
- **AML.T0007 — Discover ML Artifacts:** Admin token enables discovery of all connected nodes and their capabilities
- **AML.T0047 — Exfiltrate Data via ML Inference API:** Elevated token enables arbitrary data access via agent capabilities
- Closest overall ATLAS tactic: **ML Supply Chain Compromise** (compromising the agent infrastructure layer)

**OWASP LLM/Agentic (OWASP Top 10 for LLM Apps 2025):**
- **LLM08: Excessive Agency** — OpenClaw's broad capabilities (shell, files, email, calendar) become the blast radius amplifier once authorization is bypassed
- **LLM06: Sensitive Information Disclosure** — Admin token access exposes all data accessible to the agent
- **Agentic OWASP (emerging):** Agent Authorization Bypass — broken scope validation on credential issuance in an agentic context

**CWE:**
- CWE-269: Improper Privilege Management (NVD primary)
- CWE-266: Incorrect Privilege Assignment (NVD alternate)
- CWE-863: Incorrect Authorization (conceptually applicable — caller authorization check missing)

---

## Open Questions

1. **Was CVE-2026-32922 actively exploited?** No evidence found either way. The 37-day window between public issue (#20702, Feb 19) and CVE publication (March 29) with 85K+ unauthenticated instances makes this a critical unknown. Should check threat intel feeds, OpenClaw community Discord/forums, and any CISA KEV additions.

2. **What is CVE-2026-33579?** Disclosed April 1, referenced only in blink.new. Likely related (same release cycle) but could be a distinct component. Needs investigation.

3. **ARMO discovery vs. @coygeek filing:** Did ARMO independently discover this, or did ARMO researchers file as tdjackey after seeing @coygeek's issue? The GHSA reporter (tdjackey) differs from the issue filer (coygeek). ARMO is the credited researcher in press coverage — clarifying the discovery chain matters for credit and for understanding whether this was found by an AI tool (the issue noted "AI-assisted disclosure (GPT-5.3-Codex)").

4. **Vulnerable code introduction date:** When was `rotateDeviceToken` without the scope intersection check first shipped? This determines `date_occurred` for the incident record. Not findable without git blame on the affected lines.

5. **Enterprise impact:** Were any production enterprises running unpatched instances post-March 13 release? Given 135K exposed instances, even a 1% exploitation rate would mean 1,350 compromised deployments. No breach reports found.

6. **v2026.3.11 release note discrepancy:** Why does the release headline a WebSocket fix while the token.rotate fix (higher CVSS) is not prominently mentioned? This may reflect a deliberate or inadvertent disclosure gap. The community-recommended v2026.3.21 "additional hardening" baseline suggests the fix may have been incomplete or had edge cases.

7. **63% unauthenticated figure:** What exactly does "no authentication" mean in OpenClaw's context — is it the gateway itself running with `auth: false`, or is it that the `operator.pairing` endpoint is publicly accessible? The distinction matters for exploitation difficulty on the "unauthenticated" 63%.

8. **The ARMO blog article:** Could not extract article body (JavaScript-required rendering). Should re-attempt with a JS-capable browser/tool. This is the primary research publication and likely contains additional technical depth, the exposure methodology, and comparison to prior OpenClaw CVEs.
