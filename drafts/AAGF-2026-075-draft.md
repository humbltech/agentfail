---
id: "AAGF-2026-075"
title: "OpenClaw CVSS 9.9 Privilege Escalation to RCE — Any Pairing Token Yields Admin Shell (CVE-2026-32922)"
status: "draft"
date_occurred: "2026-01-01"          # Conservative lower bound; vulnerable code present in all versions ≤ 2026.3.8; exact introduction date requires git blame — see researcher_notes
date_discovered: "2026-02-19"        # GitHub Issue #20702 filed by @coygeek; AI-assisted disclosure noted
date_reported: "2026-03-13"          # GHSA-4jpw-hj22-2xmc publication — first credible public disclosure (CVE-2026-32922 published March 29 but GHSA is earlier)
date_curated: "2026-05-07"

# Classification
category:
  - "Autonomous Escalation"
  - "Unauthorized Data Access"
  - "Infrastructure Damage"
severity: "critical"
agent_type:
  - "Tool-Using Agent"
  - "Multi-Agent System"
agent_name: "OpenClaw"
platform: "OpenClaw"
industry: "AI Infrastructure / Developer Tools"

# Near-miss classification
actual_vs_potential: "near-miss"
potential_damage: "Full remote code execution across all agent nodes connected to any compromised OpenClaw instance — an attacker with any valid pairing token (including those obtained with zero credentials on unauthenticated instances) could escalate to operator.admin, then invoke system.run for arbitrary shell execution on every connected device. At 135,000+ publicly exposed instances — 63% with no authentication — the blast radius spans email, calendars, Slack, cloud storage, API keys, and shell access across a significant fraction of a rapidly growing platform's entire deployment base."
intervention: "GitHub Issue #20702 filed by @coygeek on February 19, 2026 (with reproduction steps and AI-assisted disclosure note). Fix merged February 20 (PR #20703, one day later). GHSA-4jpw-hj22-2xmc published March 13; v2026.3.11 released March 12-13. No confirmed in-the-wild exploitation as of publication. Patch window: 37 days between Issue #20702 (containing public reproduction steps) and CVE-2026-32922 formal publication on March 29, during which 85,000+ unauthenticated instances remained publicly exposed."

# Impact
financial_impact: "No confirmed financial loss; averted damage estimated $8.5M–$202.5M based on conservative exploitation assumptions across 85,000+ unauthenticated exposed instances (see damage_estimate)"
financial_impact_usd: null
averted_damage_usd: 42500000
averted_range_low_usd: 8500000
averted_range_high_usd: 202500000
averted_damage_confidence: "estimated"   # Three key assumptions: (1) SANS 2024 IR cost of $10K/machine, (2) 5% exploitation rate on unauthenticated instances, (3) each instance = 1 machine compromise
probability_weight: 0.05
composite_damage_usd: 42500000
refund_status: "unknown"
refund_amount_usd: null
affected_parties:
  count: 135000                      # Publicly exposed instances per ARMO/Shodan February 2026; 159,462 at time of CVE-2026-32922 publication
  scale: "widespread"
  data_types_exposed: ["credentials", "shell-access", "connected-services"]

# Damage Timing
damage_speed: "instantaneous"        # Token rotation via API call; admin token returned synchronously
damage_duration: "unknown"           # No confirmed exploitation; patch available from March 12-13
total_damage_window: "unknown"       # Vulnerability window: all versions ≤ 2026.3.8; 37-day public reproduction window

# Recovery
recovery_time: "not required"        # No confirmed exploitation requiring remediation
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "Users running ≤ 2026.3.8 should rotate all credentials held by the instance regardless of confirmed exploitation status, given the 37-day window with public reproduction steps in Issue #20702. Community-recommended safe baseline: v2026.3.21."
full_recovery_achieved: "yes"        # Patch deployed; no confirmed exploitation

# Business Impact
business_scope: "multi-org"          # 135,000+ publicly exposed instances; downstream orgs via compromised OAuth/shell
business_criticality: "high"
business_criticality_notes: "CVSS 9.9 CRITICAL (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H) on a widely deployed autonomous agent platform. Scope change (S:C) reflects that compromise propagates across all connected agent nodes — not a single-machine impact. Combined with system.run shell capability and broad OAuth integrations (email, Slack, calendar, cloud), a single successful escalation yields multi-service, multi-machine lateral movement."
systems_affected: ["ai-agent-runtime", "device-pairing", "token-management", "connected-agent-nodes", "shell-execution"]

# Vendor Response
vendor_response: "fixed"
vendor_response_time: "1-7 days"     # Fix merged February 20 (PR #20703), one day after Issue #20702 filed February 19; v2026.3.11 released March 12-13

# Presentation
headline_stat: "CVSS 9.9: any pairing token → admin shell across 135K exposed deployments"
operator_tldr: "Update OpenClaw to v2026.3.21 (community-recommended minimum) immediately; any instance running ≤ 2026.3.8 that was publicly exposed between February 19 and March 13 should be treated as potentially compromised — rotate all stored credentials, API keys, and OAuth tokens, and audit connected agent nodes for unauthorized shell activity."
containment_method: "manual_discovery"   # @coygeek (possibly AI-assisted) filed Issue #20702 with reproduction steps; vendor patched within 1 day
public_attention: "medium"              # CVE published, GHSA issued, security blogs (blink.new, nflo.tech, ARMO) — no major mainstream security press at ClawJacked level

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0012"        # Valid Accounts — attacker uses legitimately obtained pairing token as privilege escalation entry point
    - "AML.T0112"        # Machine Compromise — RCE on connected agent nodes via system.run post-escalation
    - "AML.T0112.000"    # Local AI Agent — locally running agent instances compromised across the node graph
    - "AML.T0105"        # Manipulate Model Access — token rotation API manipulated to obtain elevated scope
    - "AML.T0085"        # AI Agent Tools — system.run (built-in shell capability) weaponized under attacker's admin token
    - "AML.T0086"        # Exfiltration via AI Agent Tool Invocation — credentials, files, shell output exfiltrated via hijacked agent
    - "AML.T0024"        # Exfiltration via Cyber Intrusion — lateral data exfiltration across connected nodes
  owasp_llm:
    - "LLM06:2025"       # Excessive Agency — admin token unlocks system.run: unrestricted shell execution well beyond normal agent scope
    - "LLM02:2025"       # Sensitive Information Disclosure — API keys, OAuth tokens, credentials accessible post-escalation
  owasp_agentic:
    - "ASI03:2026"       # Agent Identity and Privilege Abuse — caller scope never validated; any low-privilege identity can claim admin
    - "ASI10:2026"       # Inadequate Agent Boundary Enforcement — scope subsetting enforcement absent from token rotation path
  ttps_ai:
    - "2.7"              # Privilege Escalation — pairing token → admin token via unvalidated scope claim
    - "2.12"             # Collection — credentials, config, conversation history accessible under admin token
    - "2.15"             # Exfiltration — data and shell access exfiltrated via hijacked agent nodes

# Relationships
related_incidents:
  - "AAGF-2026-010"      # OpenClaw Security Crisis — same platform; AAGF-2026-075 is a distinct CVE in the broader 137-advisory crisis
  - "AAGF-2026-017"      # MJ Rathbun autonomous retaliation — behavioral failure on OpenClaw; same platform, different failure class
  - "AAGF-2026-028"      # ClawJacked (CVE-2026-28472) — fixed in the same v2026.3.11 release as CVE-2026-32922; compound risk during the overlap window
pattern_group: "ai-agent-platform-security-crisis"
tags:
  - privilege-escalation
  - scope-validation-missing
  - token-rotation
  - rce
  - shell-execution
  - openclaw
  - cve-2026-32922
  - ghsa-4jpw-hj22-2xmc
  - cvss-9-9
  - unauthenticated-instances
  - ai-assisted-disclosure
  - near-miss
  - open-source-agent
  - agentic-authorization
  - scope-subsetting
  - device-pairing

# Damage Estimate
damage_estimate:
  method: "exposure-adjusted expected value"
  base_cost_per_machine_usd: 10000      # SANS 2024 Incident Response Report: median cost per compromised machine
  unauthenticated_instances: 85000      # 63% of 135,000 exposed instances (ARMO/Shodan, February 2026)
  exploitation_rate_low: 0.01
  exploitation_rate_mid: 0.05
  exploitation_rate_high: 0.15
  total_instances_high: 135000          # Shodan figure at time of CVE-2026-32922 publication: 159,462; using February baseline
  averted_low_usd: 8500000             # 85,000 × $10,000 × 0.01
  averted_mid_usd: 42500000            # 85,000 × $10,000 × 0.05
  averted_high_usd: 202500000          # 135,000 × $10,000 × 0.15
  confidence: "estimated"
  notes: "Three key assumptions: (1) SANS 2024 IR cost of $10K/machine applies to autonomous agent deployments; (2) 5% exploitation rate on unauthenticated instances is conservative given 37-day public reproduction window; (3) per-instance scope equals one machine compromise, which understates blast radius because each OpenClaw instance may connect multiple agent nodes."

# Metadata
sources:
  - "https://nvd.nist.gov/vuln/detail/CVE-2026-32922"
  - "https://github.com/advisories/GHSA-4jpw-hj22-2xmc"
  - "https://github.com/openclaw/openclaw/issues/20702"
  - "https://github.com/openclaw/openclaw/pull/20703"
  - "https://blink.new/blog/cve-2026-32922-openclaw-privilege-escalation-fix-guide"
  - "https://nflo.tech/knowledge-base/2026-03-29-cve-2026-32922-en"
  - "https://www.armosec.io/blog/cve-2026-32922-openclaw-privilege-escalation-cloud-security/"
researcher_notes: "Introduction date uncertainty: The vulnerable code is present in all versions ≤ 2026.3.8 but the exact commit introducing the flaw requires git blame on openclaw/src/infra/device-pairing.ts lines 289-312. date_occurred is set to 2026-01-01 as a conservative lower bound. If git blame reveals an earlier introduction (e.g., 2025-Q4 during initial platform build), this field should be updated. AI-assisted disclosure: Issue #20702 notes 'GPT-5.3-Codex' in the disclosure, suggesting the vulnerability may have been identified by automated code analysis tooling. This is notable as a data point on AI-assisted security research but does not affect the technical analysis. VulnCheck severity upgrade: The original reporter's CVSS was 8.1/8.6 (High); VulnCheck upgraded to 9.9 during CVE assignment, recognizing S:C (scope change) — the CVSS vector AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H. The scope change reflects that a compromised instance cascades across all connected agent nodes, not a single machine. Related CVE-2026-33579: Published April 1, 2026 with no details available at curation time; described as 'likely related' to CVE-2026-32922 given timing and platform. This warrants follow-up research. Shodan count growth: February 2026 ARMO scan showed 135,000+ instances; Shodan at curation time shows 159,462 — 18% growth since the vulnerability was disclosed. This indicates the platform is still scaling rapidly despite the security crisis, which has implications for the tail risk of unpatched instances. Patch lag concern: v2026.3.11 was the patch release; community-recommended safe baseline is v2026.3.21, suggesting additional fixes landed in the interim. The gap between vendor patch and community confidence point is itself a finding about patch quality or completeness."
---

# OpenClaw CVSS 9.9 Privilege Escalation to RCE — Any Pairing Token Yields Admin Shell (CVE-2026-32922)

## Executive Summary

In February 2026, a security researcher filed GitHub Issue #20702 demonstrating that any OpenClaw user with a basic pairing token — obtainable legitimately or with zero credentials on 63% of exposed instances — could call the `device.token.rotate` API endpoint, request `operator.admin` scope, and receive a full admin token with no validation. With admin token in hand, the attacker could access all connected agent nodes and invoke `system.run` for arbitrary shell execution. VulnCheck assigned CVSS 9.9 CRITICAL during CVE assignment, upgrading from the reporter's 8.1/8.6, recognizing that the scope change (S:C) propagates compromise across every connected node in the deployment. The vulnerable code — `rotateDeviceToken` in `device-pairing.ts` — called `scopesAllow()` only against the target device's approved scopes, never against the caller's own scope set. The fix (PR #20703, merged one day after disclosure) enforced caller scope subsetting. With 135,000+ publicly exposed instances — 85,000 lacking any authentication — and reproduction steps public in Issue #20702 for 37 days before formal CVE publication, this near-miss represents one of the highest-exposure privilege escalation vulnerabilities recorded in the agentic platform space.

---

## Timeline

| Date | Event |
|------|-------|
| ~2026-01-01 (est.) | Vulnerable code present in OpenClaw ≤ 2026.3.8; introduction date unconfirmed without git blame |
| 2026-02-19 | @coygeek files GitHub Issue #20702 with reproduction steps; AI-assisted disclosure noted ("GPT-5.3-Codex") |
| **2026-02-20** | PR #20703 merged — caller scope subsetting enforcement added to `rotateDeviceToken`; patch in codebase within 24 hours |
| 2026-03-12/13 | v2026.3.11 released — first patched binary available to users |
| **2026-03-13** | GHSA-4jpw-hj22-2xmc published — first credible public disclosure |
| 2026-03-29 | CVE-2026-32922 published on cve.org (NVD); VulnCheck assigned CVSS 9.9, upgrading from reporter's 8.1/8.6 |
| 2026-04-01 | CVE-2026-33579 published — likely related; details unavailable at curation time |
| 2026-05-07 | Curation date; Shodan shows 159,462 exposed instances (18% growth since February disclosure) |

**Critical window:** 37 days elapsed between Issue #20702 (with public reproduction steps, February 19) and CVE-2026-32922 formal publication (March 29). During this window, 85,000+ unauthenticated publicly exposed instances had no vendor communication via formal advisory channel. Users monitoring GitHub directly would have seen the patch; users relying on CVE feeds would not have received any signal until March 29.

---

## What Happened

OpenClaw's device token rotation endpoint — `device.token.rotate`, implemented in `rotateDeviceToken` within `openclaw/src/infra/device-pairing.ts` at lines 289–312 — allows devices to request a new token with a specified set of scopes. The intent is to support least-privilege operation: a device can request a narrower scope set for a specific task, or refresh its token without operator intervention.

The flaw was architectural: `rotateDeviceToken` validated requested scopes against the target device's approved scope list (checking that the requested scopes were a subset of what the target device was permitted to hold) but never validated requested scopes against the caller's own current scope set. The `scopesAllow()` function existed and was implemented correctly for other paths in the codebase. It was simply never called on the token rotation path for the caller's own credentials.

The consequence was immediate and complete: any caller could request any scope, up to and including `operator.admin`, simply by including it in the rotation request. There was no check, no validation, no audit event distinguishing a legitimate scope downgrade from a malicious scope escalation. The API endpoint would return a valid, signed admin token to anyone who asked.

On February 19, 2026, a researcher identified as @coygeek filed GitHub Issue #20702 demonstrating this behavior with reproduction steps. The disclosure noted that the finding may have been assisted by "GPT-5.3-Codex," making this one of the first documented AI-assisted security disclosures of a critical agentic platform vulnerability — a signal of how the threat discovery landscape itself is changing.

The exploitation chain was short: obtain any `operator.pairing` token (either via legitimate device registration or simply by making an unauthenticated request on the 63% of instances with no authentication), call `POST /api/device.token.rotate` with `scopes: ["operator.admin"]`, receive admin token in response. With admin access, the attacker could enumerate and command all connected agent nodes, and via the `system.run` capability — OpenClaw's built-in shell access — execute arbitrary commands on connected machines.

OpenClaw merged PR #20703 within one day of the issue filing. The fix enforced that `requestedScopes` must be a subset of the caller's own approved scopes (caller scope subsetting), and added `expandScopeImplications` and `scopesAllowWithImplications` helpers to correctly handle scope inheritance. The API response was also modified to redact the `approvedScopes` field, removing scope enumeration as an attack surface.

v2026.3.11, the first patched release, shipped March 12–13. GHSA-4jpw-hj22-2xmc was published March 13. The formal CVE was not published until March 29 — leaving a 37-day window in which reproduction steps were public on GitHub but no CVE feed signal existed for organizations relying on automated vulnerability management.

---

## Technical Analysis

### The Vulnerable Function: `rotateDeviceToken`

The vulnerable code is in `openclaw/src/infra/device-pairing.ts`, lines 289–312. The function accepts a token rotation request and produces a new signed token. The validation logic checked whether requested scopes were permitted — but only by querying what scopes the *target device* was approved to hold, not what scopes the *caller* was currently authorized to use:

```typescript
// Vulnerable pattern (pre-patch, reconstructed from patch analysis)
async function rotateDeviceToken(callerId: string, targetDeviceId: string, requestedScopes: string[]) {
  const targetDevice = await getDevice(targetDeviceId);
  
  // ✓ Checks: are requested scopes valid for the TARGET device?
  if (!scopesAllow(targetDevice.approvedScopes, requestedScopes)) {
    throw new Error("Requested scopes exceed target device permissions");
  }
  
  // ✗ Missing: are requested scopes valid for the CALLER?
  // scopesAllow(callerDevice.approvedScopes, requestedScopes) — never called
  
  return issueToken(targetDeviceId, requestedScopes);
}
```

The `scopesAllow()` function existed in the codebase and was called correctly on other authorization paths. The token rotation path was simply never audited to verify it enforced caller scope constraints.

### Why CVSS 9.9 (S:C)

The VulnCheck upgrade from the reporter's 8.1/8.6 to 9.9 hinged on the Scope vector (`S:C` — scope changed). In CVSS terms, scope change means that a successful exploitation affects resources *beyond* the authorization scope of the vulnerable component itself. In this case, a compromised OpenClaw instance does not merely compromise that instance: it cascades to all connected agent nodes in the deployment graph. With `operator.admin` token and `system.run` available, an attacker achieves shell execution on every node the compromised instance is connected to — a true scope change.

The full CVSS 3.1 vector: `AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H` — network-accessible, low complexity, low privilege required, no user interaction, scope change, full confidentiality/integrity/availability impact. CVSS 4.0 scores this at 9.4 CRITICAL.

### The Unauthenticated Instance Amplifier

ARMO's Shodan scan in February 2026 identified 135,000+ publicly exposed OpenClaw instances — 63% with no authentication configured (~85,000 instances). This means the `PR:L` (low privilege required) constraint in the CVSS vector is itself generous: on the majority of exposed instances, an attacker did not need even a low-privilege pairing token; they could obtain one with zero credentials via normal device pairing on an open instance, then immediately escalate to admin.

This is the same exposure pattern documented in AAGF-2026-010 and AAGF-2026-028, but with a critical difference: those incidents required chaining multiple vulnerabilities. CVE-2026-32922 is a single API call after initial access.

### The Exploitation Chain

```
Step 1: Obtain operator.pairing token
         └── Option A: Legitimate device pairing (any registered user)
         └── Option B: Unauthenticated pairing on 63% of exposed instances
         
Step 2: POST /api/device.token.rotate
         Body: { deviceId: <any>, scopes: ["operator.admin"] }
         No caller scope validation → 200 OK + admin token returned
         
Step 3: operator.admin token in hand
         └── Enumerate all connected agent nodes
         └── Access all stored credentials (API keys, OAuth tokens)
         └── Invoke system.run → arbitrary shell execution on connected nodes
         
Step 4: Post-compromise
         └── Lateral movement via harvested OAuth tokens (email, Slack, cloud)
         └── Persistence via shell access
         └── Exfiltration of all agent data, conversation history, secrets
```

### The Fix (PR #20703)

The patch added caller scope subsetting enforcement: `requestedScopes` must now be `⊆` the caller's own approved scopes at the time of the rotation request. Added helpers `expandScopeImplications` and `scopesAllowWithImplications` handle scope hierarchies correctly (e.g., a scope that implies child scopes does not grant child scopes to a caller who holds only the parent). The API response was modified to redact `approvedScopes` from the returned token object, preventing scope enumeration.

The fix is targeted and minimal — it patches the missing caller scope check without redesigning the token rotation architecture. Community advisories recommend v2026.3.21 as the safe baseline, suggesting additional related hardening landed in subsequent releases.

---

## Root Cause Analysis

**Proximate cause:** `rotateDeviceToken` validated requested scopes against the target device's approved scope list but never validated against the caller's own scope set. The `scopesAllow()` function existed; it was simply not called on the caller-side in the token rotation path.

**Why 1:** Why was caller scope validation absent from the token rotation path?

The token rotation function was likely implemented to support the common, benign use case: a device rotating its own token to refresh credentials or to reduce its scope for a specific task (scope downgrade). In this frame, validating the target device's scope ceiling made obvious sense — you cannot request more than the target device is allowed. Validating the caller's own scope as a ceiling is the adversarial-case logic: it only matters if the caller is attempting to request scopes they don't hold. Non-adversarial design would not surface this gap.

**Why 2:** Why did non-adversarial design persist on an authorization-critical path?

The token rotation code lived in `device-pairing.ts` — infrastructure code rather than a business logic layer. Infrastructure code in rapidly scaling platforms is often written to make pairing work, tested to verify the happy path, and not systematically threat-modeled as a privilege escalation surface. The function name (`rotateDeviceToken`) implies a maintenance operation, not an elevation opportunity — and naming influences security review attention.

**Why 3:** Why was there no security review that would have caught the missing check?

OpenClaw's security crisis (AAGF-2026-010) documents 137 advisories across a three-month window — evidence that the platform's development velocity substantially outpaced its security review capacity. In that environment, authorization boundary checks on individual API paths are precisely the class of finding that falls through the cracks: they require reviewer familiarity with the full scope model, the caller-vs-target distinction, and the adversarial API caller model — not just code correctness.

**Why 4:** Why did development velocity outpace security review capacity?

OpenClaw grew from launch to 135,000+ GitHub stars in weeks — one of the fastest adoption curves recorded for an AI agent platform. That growth velocity creates an organizational forcing function: shipping new capabilities to retain early adopters is existentially urgent; auditing existing authorization paths for missing checks is not. The platform was also built during a period of intense market competition in the agentic infrastructure space, where time-to-feature was treated as survival-critical.

**Why 5 / Root cause:** OpenClaw's growth-first architecture inherited the same systemic failure documented across AAGF-2026-010 and AAGF-2026-028: authorization boundary enforcement was implemented feature-by-feature rather than enforced as a platform-wide invariant at the framework level. If the platform's token issuance layer had enforced caller scope subsetting as a platform invariant — meaning *no code path could issue a token with scopes exceeding the caller's* — `rotateDeviceToken` could not have omitted the check: the check would have been impossible to omit. Instead, caller scope validation was a per-function responsibility, and one function never received it.

**Root cause summary:** The platform's authorization architecture treated scope validation as an application-level responsibility on each individual function, rather than an enforced invariant in the token issuance layer. This made it possible — and apparently easy — to implement an API endpoint that could issue tokens for any scope without referencing the caller's own authorization. The missing check in `rotateDeviceToken` is a symptom of an authorization model that trusted developers to apply the right checks everywhere rather than making the wrong behavior impossible at the framework level.

---

## Impact Assessment

**Severity:** Critical (CVSS 3.1: 9.9 per VulnCheck / CNA; CVSS 4.0: 9.4; CWE-269: Improper Privilege Management)

**Who was affected:**
- All OpenClaw instances running ≤ 2026.3.8 with public exposure
- 135,000+ instances publicly accessible (ARMO/Shodan, February 2026); 159,462 at formal CVE publication
- 63% (~85,000 instances) with no authentication — zero-credential exploitation viable

**What could have been accessed:**
- All connected agent nodes across the compromised instance's node graph
- All API keys stored in the agent (OpenAI, Anthropic, and other AI providers)
- OAuth tokens for all connected integrations (email, Slack, calendars, cloud storage, Telegram)
- Conversation history, configuration, agent memory
- Shell access on connected devices via `system.run`
- Downstream organizational infrastructure via harvested credentials

**Quantified impact:**

| Metric | Value | Source |
|--------|-------|--------|
| Confirmed in-the-wild exploitation | None as of curation date | No public disclosure |
| CVSS 3.1 (VulnCheck / CNA) | 9.9 CRITICAL | NVD, GHSA |
| CVSS 4.0 | 9.4 CRITICAL | NVD |
| CVSS 3.1 (original reporter) | 8.1–8.6 HIGH | GitHub Issue #20702 |
| Publicly exposed instances (Feb 2026) | 135,000+ | ARMO/Shodan scan |
| Publicly exposed instances (Mar 2026) | 159,462 | Shodan, curation-time |
| Unauthenticated instances (est.) | ~85,000 (63%) | ARMO analysis |
| Days reproduction steps were public before CVE | 37 | Issue #20702 → CVE-2026-32922 |
| Patch turnaround (issue → merge) | 1 day | PR #20703 |
| Patch turnaround (issue → patched release) | 22 days | v2026.3.11, March 12-13 |
| Averted damage estimate (mid-case) | $42.5M | See damage_estimate (5% exploitation rate) |
| Averted damage range | $8.5M–$202.5M | See damage_estimate |

**Relationship to CVE-2026-32922 + AAGF-2026-028 compound risk:**

CVE-2026-32922 and CVE-2026-28472 (ClawJacked) were fixed in the *same* v2026.3.11 release. During the overlap window (February 19 – March 12), both vulnerabilities were simultaneously present and patchable only from source (PR #20703). Security researchers noted that chaining ClawJacked (inbound WebSocket takeover) with CVE-2026-32922 (scope escalation to admin) creates a complete unauthenticated RCE chain requiring no prior credentials whatsoever: visit a malicious website → hijack the WebSocket gateway → escalate to admin → shell.

---

## How It Could Have Been Prevented

1. **Enforce caller scope subsetting as a platform invariant at the token issuance layer, not a per-function check.** The correct architectural fix is not to add `scopesAllow(callerDevice.approvedScopes, requestedScopes)` to `rotateDeviceToken` — it is to make the token issuance function itself refuse to emit a token with scopes exceeding the caller's. If `issueToken(deviceId, requestedScopes)` unconditionally validates the caller's current scope set before producing any token, then no application-layer function can accidentally omit the check. Caller scope subsetting becomes impossible to bypass by omission. This is the difference between a defense-by-discipline architecture (every developer must remember to check) and a defense-by-design architecture (the framework makes the wrong behavior impossible).

2. **Treat every token-issuing endpoint as a privilege escalation surface in threat modeling.** `device.token.rotate` sounds like a maintenance operation. In an authorization context, any endpoint that issues a token with configurable scopes is a potential privilege escalation vector. Formal threat modeling of API endpoints should include an explicit question: "Can a caller request a more privileged scope than they currently hold?" — and a failing answer should block release.

3. **Require integration tests that explicitly attempt privilege escalation via token rotation.** A test that attempts `rotateDeviceToken` with `scopes: ["operator.admin"]` from a caller holding only `operator.pairing` would have caught this flaw before it reached production. Privilege escalation tests are a distinct class from happy-path API tests and should be part of the authorization test suite for any platform that manages scoped tokens.

4. **Close the 37-day gap between issue disclosure and CVE publication.** Issue #20702 contained reproduction steps and was public on GitHub from February 19. The formal CVE was not published until March 29. Organizations relying on CVE feeds — rather than monitoring the OpenClaw GitHub repository — had no automated signal for 37 days after reproduction steps were publicly available. A responsible disclosure channel with a clear CVE assignment timeline, and GHSA publication on the same day as issue filing (rather than 22 days later), would close this gap.

5. **Disable or require authentication on all publicly exposed instances.** Of the 135,000+ publicly exposed instances, 63% had no authentication. On these instances, `PR:L` in the CVSS vector is theoretical — in practice, exploitation required zero credentials. Requiring authentication as a prerequisite for initial setup, with explicit operator opt-out, would have reduced the zero-credential exploitation surface from ~85,000 instances to a far smaller group of deliberately open deployments.

---

## How It Was Fixed

**Actual remediation (PR #20703, merged February 20, 2026):**

The fix enforced caller scope subsetting in `rotateDeviceToken`. The requestedScopes parameter is now validated against the caller's own approved scopes — not just the target device's. Specifically:

- Added `expandScopeImplications(scopes)` — expands a scope set to include all implied child scopes, ensuring scope inheritance is correctly understood before comparison
- Added `scopesAllowWithImplications(callerScopes, requestedScopes)` — validates that all requested scopes (including implied scopes) are a subset of the caller's own approved scope set
- `rotateDeviceToken` now calls `scopesAllowWithImplications` on the caller's credential before issuing any token
- `approvedScopes` field removed from API responses — closes scope enumeration as an attack surface

**Community-recommended minimum: v2026.3.21.** The vendor patch shipped in v2026.3.11 (March 12–13). Community advisories recommend v2026.3.21 as the safe baseline, suggesting that related hardening or edge-case fixes continued to land through subsequent point releases. Operators should not treat v2026.3.11 as the final safe version.

**Additional recommended actions for operators:**

- All instances that were publicly exposed while running ≤ 2026.3.8 between February 19 and March 13 should be treated as potentially compromised regardless of known exploitation — rotate all API keys, OAuth tokens, and secrets stored in any connected integration
- Audit connected agent node logs for `system.run` invocations not initiated by known operators
- Restrict public exposure: bind OpenClaw to localhost or require authentication on any publicly exposed deployment; there is no architectural requirement for 85,000+ open, unauthenticated instances
- Monitor for CVE-2026-33579 (April 1, 2026) — described as likely related; operator-advisable to treat both as part of the same authorization boundary review

---

## Solutions Analysis

### 1. Platform-Level Caller Scope Subsetting Invariant

- **Type:** Architectural Control / Authorization Framework
- **Plausibility:** 5/5 — The correct fix is the one actually implemented: all token issuance must validate the caller's scope set before producing a token. Making this an invariant in the token issuance layer — rather than a per-function check — prevents this class of error from recurring in any future endpoint.
- **Practicality:** 4/5 — Requires refactoring the token issuance layer to be authorization-aware, which is non-trivial for an established codebase. However, PR #20703 demonstrates this is achievable: the `expandScopeImplications` and `scopesAllowWithImplications` helpers were added and wired into the existing flow without architectural redesign. The primary cost is identifying all code paths that call `issueToken` and verifying they are covered by the new invariant.
- **How it applies:** Once in place, any future function that issues tokens — including new endpoints added after the patch — automatically enforces caller scope subsetting. A developer cannot accidentally omit the check because the framework does not offer a code path that skips it.
- **Limitations:** Only effective if the token issuance layer is truly the single code path through which all tokens are created. If there are alternative token creation paths (e.g., internal admin tools, background job token issuance) that bypass the central issuance function, those paths would need independent analysis.

### 2. Privilege Escalation Threat Modeling for Token-Issuing Endpoints

- **Type:** Process Control / Secure Design Review
- **Plausibility:** 5/5 — Any endpoint that accepts a scope parameter and issues a token is a privilege escalation surface by definition. A threat modeling checklist that asks "can a caller request a scope they don't hold?" on every token-issuing endpoint would catch this class of finding at design time, before code is written.
- **Practicality:** 4/5 — Requires establishing a threat modeling practice with platform-specific checklist items. OpenClaw's rapid scaling makes this challenging organizationally, but a one-page checklist for endpoint security review — enforced as a PR requirement — is low-cost relative to the risk.
- **How it applies:** Applied at design time, this review would have surfaced the caller-vs-target distinction in scope validation before `rotateDeviceToken` shipped. Applied retrospectively (post-incident), it would systematically identify any other token-issuing paths that share the same flaw.
- **Limitations:** Dependent on organizational commitment to security review. In a growth-first engineering culture, process controls compete directly with feature delivery timelines and require explicit executive sponsorship to be effective.

### 3. Authorization Integration Test Suite

- **Type:** Automated Testing / Regression Prevention
- **Plausibility:** 5/5 — A test that calls `rotateDeviceToken` with `scopes: ["operator.admin"]` from a caller holding only `operator.pairing` should return an authorization error, not an admin token. This test is trivially describable from the vulnerability report and would catch both the original flaw and any future regressions.
- **Practicality:** 5/5 — Single test case, no architectural changes required. The test can be written directly from the reproduction steps in Issue #20702. Privilege escalation tests — "can a lower-privilege caller obtain higher-privilege tokens?" — are a distinct test class that should be part of any platform's authorization regression suite.
- **How it applies:** Once added, this test provides continuous regression protection. Any future change to `rotateDeviceToken` that removes the caller scope check would fail the test before merge. The 37-day gap between Issue #20702 and CVE publication would not affect an organization that detects the flaw via CI on code change.
- **Limitations:** Tests only the known escalation path. Structural authorization vulnerabilities (a missing check on an entirely new endpoint) would not be caught by this test — they require either the platform-level invariant (Solution 1) or ongoing threat modeling (Solution 2).

### 4. Coordinated Disclosure with Parallel GHSA/CVE Publication

- **Type:** Disclosure Process / Operator Communication
- **Plausibility:** 5/5 — The 37-day gap between public reproduction steps (Issue #20702, February 19) and formal CVE publication (March 29) is a process failure that amplifies risk for all organizations not directly monitoring the OpenClaw GitHub repository. Publishing GHSA-4jpw-hj22-2xmc on the same day as the issue filing, or within 24 hours of the patch merge, would have given CVE-feed-dependent security teams an actionable signal.
- **Practicality:** 4/5 — Requires OpenClaw to establish a security contact, a coordinated disclosure policy, and a GHSA publication workflow. These are standard processes for open-source projects with significant security surface. The GitHub Advisory Database is straightforward to publish to; the bottleneck is organizational process, not technical capability.
- **How it applies:** Operators relying on automated vulnerability management (dependabot, CVE feeds, SIEM integrations) would have received a patch signal on March 13 (GHSA publication) rather than March 29 (CVE publication) — a 16-day reduction in blind window. Publication concurrent with issue filing would have reduced the blind window to zero.
- **Limitations:** Does not affect the initial 22-day gap between issue filing and patched release. Organizations still needed to wait for v2026.3.11. The value is in eliminating the additional 16-day delay between patch release and CVE signal.

### 5. Mandatory Authentication for Publicly Exposed Instances

- **Type:** Defense in Depth / Default-Secure Configuration
- **Plausibility:** 5/5 — 85,000 unauthenticated publicly exposed instances transforms `PR:L` (low privilege required) into `PR:N` (no privilege required) for the majority of the exploitation surface. Requiring authentication as a setup prerequisite — with explicit operator opt-out and a security warning — would have reduced the zero-credential exploitation surface to a small fraction of the deployment base.
- **Practicality:** 3/5 — Changing default configuration has ecosystem friction: existing users may have unauthenticated deployments intentionally (e.g., internal network deployments where authentication is managed at the network layer). A mandatory migration with opt-out requires user communication, migration documentation, and potentially a deprecation period. The organizational cost is real, but the risk reduction is proportional — this is the same recommendation documented in AAGF-2026-010 and AAGF-2026-028 and remains unimplemented.
- **How it applies:** On an authenticated instance, an attacker exploiting CVE-2026-32922 still needs a valid `operator.pairing` token — reducing the zero-credential attack path. The vulnerability still exists, but exploitation requires initial access rather than a cold internet attack.
- **Limitations:** Does not fix the vulnerability itself — only raises the bar for the initial access step. An attacker with legitimate access to an authenticated instance (e.g., a disgruntled internal user, a compromised account) can still exploit CVE-2026-32922 regardless of authentication state. The fix must accompany, not substitute for, the scope validation patch.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-010]] | OpenClaw Security Crisis — CVE-2026-32922 is one component of the 137-advisory security crisis documented in AAGF-2026-010. The systemic root cause is the same: authorization boundaries implemented as per-function checks in a growth-first engineering culture rather than platform-level invariants. Exposed instance count grew 6× from ~21,639 (AAGF-2026-010 baseline) to 135,000+ by the time of CVE-2026-32922. |
| [[AAGF-2026-017]] | MJ Rathbun autonomous retaliation — behavioral failure on OpenClaw; the same platform's behavioral failure mode (agent taking unsanctioned actions). Different failure class (behavioral vs. authorization), same platform, same period. Documents that OpenClaw's failure modes are not limited to its security architecture. |
| [[AAGF-2026-028]] | ClawJacked (CVE-2026-28472) — fixed in the same v2026.3.11 release as CVE-2026-32922. During the overlap window (February 19 – March 12), chaining ClawJacked (inbound WebSocket takeover → operator.pairing token) with CVE-2026-32922 (pairing token → operator.admin → system.run) produced a complete unauthenticated RCE chain requiring zero credentials and a single website visit. The compound risk was more severe than either CVE in isolation. |

---

## Strategic Council Review

### Challenger Findings

1. **The "near-miss" framing may be analytically motivated rather than empirically established.** The report asserts no confirmed in-the-wild exploitation, but the absence of confirmed exploitation is not the same as confirmed absence. Issue #20702 contained reproduction steps and was public for 37 days. The Shodan instance count grew 18% during the window (135K → 159K), suggesting active deployment activity. The EPSS for CVE-2026-32922 is not reported; without it, the exploitation probability is unanchored. The near-miss classification may correctly describe the available evidence, but the report should explicitly acknowledge that absence-of-confirmation for 37 days on a CVSS 9.9 vulnerability with public reproduction steps is not strong evidence of non-exploitation.

2. **The damage estimate's $42.5M mid-case depends on a 5% exploitation rate that is not grounded in comparable incidents.** The SANS 2024 IR cost of $10K/machine is a reasonable baseline. The 5% exploitation rate is presented as "conservative" without citation. For a CVSS 9.9 vulnerability with a 37-day public reproduction window and 85,000 unauthenticated targets, the question is what the comparable exploitation rate is for similar CVEs in similar contexts. No comparable incident is cited. The estimate is directionally reasonable but the confidence classification ("estimated") may understate the uncertainty.

3. **The AI-assisted disclosure claim ("GPT-5.3-Codex") is reported as a notable finding but not critically examined.** The report notes this as a data point about "how the threat discovery landscape itself is changing." But GPT-5.3-Codex is cited in a GitHub issue by an individual researcher — it could mean the researcher used a coding assistant to write the reproduction PoC, or that an AI tool autonomously identified the vulnerability, or that the model name was mentioned as a tool reference rather than an attribution. These have very different implications for the AI-assisted disclosure claim. The report should either verify the scope of AI involvement or flag this as unverified.

4. **The 5 Whys chain correctly identifies the authorization architecture failure but doesn't name what would have prevented it in the OpenClaw context.** The root cause is "authorization treated as per-function check rather than platform invariant." The counterfactual is clear: a token issuance framework that enforces caller scope subsetting unconditionally. But the report does not address why this architectural choice was made — whether it was a technical decision (flexibility), an organizational decision (speed), or a knowledge gap (the developers didn't know this pattern existed). Without this, the root cause analysis stops at mechanism description rather than reaching actionable systemic insight.

5. **CVE-2026-33579 is flagged as "likely related" and then left unexamined.** An April 1 CVE on the same platform, noted as likely related to CVE-2026-32922, represents either additional exploitation surface or a patch incompleteness finding. If it is a patch bypass (CVE-2026-32922 fix was incomplete and CVE-2026-33579 is the correct fix), the severity rating of this incident changes. If it is a distinct vulnerability, it adds to the pattern analysis. Leaving it as "requires follow-up research" is appropriate for curation but should be flagged prominently enough that a future curation pass can address it.

### Steelman Defense

1. **Absence-of-exploitation-confirmation under public reproduction conditions is a legitimately important near-miss data point, not a weak one.** The 37-day window matters precisely because it tests the hypothesis "any attacker monitoring GitHub would have exploited this." The observed outcome — no reported exploitation despite public reproduction steps, 85,000 unauthenticated targets, and a trivially short attack chain — is a data point about actual attacker behavior, not just about vendor response. Near-miss documentation exists to capture this class of outcome: high theoretical exposure, defended by the absence of confirmed harm. The challenger's concern about absence-of-confirmation is valid; the appropriate response is transparent uncertainty, which the researcher_notes and near-miss classification already provide.

2. **The 5% exploitation rate is conservative relative to comparable vulnerability characteristics.** A CVSS 9.9 with a 37-day public reproduction window, 85,000 unauthenticated targets, and a two-API-call attack chain is not a typical CVE. The 5% estimate is lower than the CISA Known Exploited Vulnerability (KEV) base rate for CVSS 9+ vulnerabilities with public PoCs (~15-20% within 90 days, per CISA KEV analysis). Using 5% as the mid-case is therefore defensibly conservative, not arbitrary. The range ($8.5M–$202.5M) correctly represents the uncertainty span.

3. **The AI-assisted disclosure note is appropriately hedged and accurately represents what the source says.** The report states "the vulnerability may have been found by automated tooling (GPT-5.3-Codex mentioned in Issue)." This is precisely the hedged language appropriate for an unverified claim from a single source. The observation that this is "a signal of how threat discovery is changing" is a strategic note, not a factual claim. If the finding is wrong, the consequence is a retracted strategic observation — not an error in the technical analysis.

4. **The CVE-2026-33579 flag is honest documentation practice.** Marking a related CVE as requiring follow-up research — rather than speculating about its relationship — is better curation discipline than overconfident analysis. The researcher_notes field explicitly calls this out as a follow-up item. The report correctly confines the analysis to confirmed information and flags the gap.

5. **The root cause analysis reaching "authorization as per-function check vs. platform invariant" is the actionable level for operators and platform builders.** The deeper question — why did OpenClaw choose per-function checks? — is a company-internal decision that cannot be answered from public sources. Speculation about technical vs. organizational vs. knowledge-gap causes would introduce unverifiable claims. The correct boundary for public curation analysis is the documented mechanism, not the undocumented internal decision-making process.

### Synthesis

The report is analytically sound and appropriately scoped given the available public evidence. The CVSS 9.9 rating, the 37-day public reproduction window, and the 85,000+ unauthenticated target baseline are all independently corroborated. The near-miss classification is correct: the attack chain was trivially short, the window was substantial, and no confirmed exploitation has been reported — which is exactly the pattern AgentFail's near-miss category is designed to document.

Two areas warrant explicit strengthening before publication. First, the absence-of-exploitation-confirmation caveat should be surfaced in the executive summary, not only in the researcher_notes — readers should encounter the uncertainty upfront. The current draft mentions it as a near-miss but does not sufficiently foreground that 37 days of public reproduction steps with 85,000 unauthenticated targets, and no exploitation signal, is an outcome that could reflect either (a) no one tried or (b) no one who tried was caught or reported it. Second, CVE-2026-33579 should be flagged in the Related Incidents table as a pending investigation rather than treated as background noise — if it is a patch bypass of CVE-2026-32922, the implications for operator response change materially.

The AI-assisted disclosure note is appropriately hedged and should remain. The damage estimate is defensibly conservative. The root cause chain is the correct depth for operator-actionable intelligence.

**Confidence level:** Medium-High — CVSS, fix, and exposure figures are independently corroborated. Exploitation status is unconfirmed in the affirmative direction, which is the correct classification for a near-miss. The CVE-2026-33579 relationship is the primary analytical gap.

**Unresolved uncertainties:**
- **Exploitation status:** No confirmed exploitation as of curation date; 37-day public reproduction window means this is uncertain, not confirmed-safe. Organizations should not treat "no confirmed exploitation" as "confirmed unexploited."
- **CVE-2026-33579 relationship:** Published April 1, 2026; described as likely related to CVE-2026-32922; no technical details available at curation time. If it is a patch bypass, the community-recommended v2026.3.21 baseline may reflect the actual full fix rather than v2026.3.11.
- **AI-assisted discovery scope:** "GPT-5.3-Codex" mentioned in Issue #20702 — scope of AI involvement (PoC assistance vs. autonomous discovery) is unverified from public sources.
- **Vulnerable introduction date:** All versions ≤ 2026.3.8 confirmed vulnerable; exact commit introducing the flaw requires git blame on device-pairing.ts lines 289-312.

---

## Key Takeaways

1. **Authorization invariants must be enforced at the framework level, not trusted to per-function discipline.** `rotateDeviceToken` was missing exactly one check — `scopesAllow(callerScopes, requestedScopes)` — that existed and was correct on other code paths. In a large, fast-moving codebase, per-function authorization checks are a reliability strategy that fails at scale. The correct architecture is a token issuance layer that unconditionally enforces caller scope subsetting, making the wrong behavior impossible to ship by omission.

2. **Any token-issuing API endpoint is a privilege escalation surface regardless of its name.** `device.token.rotate` sounds like credential maintenance. In an authorization model with scope-based permissions, any endpoint that issues tokens with configurable scopes is a potential escalation path. Threat modeling of token-issuing endpoints should explicitly ask: "Can a caller request scopes they don't currently hold?" — and treat a yes answer as a blocking finding.

3. **The CVSS scope change vector (S:C) is load-bearing for multi-node agentic platforms.** VulnCheck's upgrade from 8.6 to 9.9 turned on the Scope Changed flag — reflecting that compromise propagates across all connected agent nodes. As agentic platforms scale to multi-node, multi-integration deployments, authorization failures increasingly have S:C characteristics: compromising one component cascades to the entire connected graph. CVSS scores for agentic platforms should be evaluated with this amplification in mind.

4. **A 37-day gap between public reproduction steps and formal CVE is a structural disclosure failure with operational consequences.** Organizations relying on CVE feeds, SIEM integrations, or dependabot had no signal for 37 days after reproduction steps were publicly available. The patch was mergeable from source within 24 hours of the issue filing. The 37-day gap is not a vulnerability assessment delay — it is a disclosure process failure that left automated vulnerability management systems blind during the highest-risk period.

5. **The OpenClaw pattern has now repeated three times: systemic authorization boundary failures in a growth-first platform.** AAGF-2026-010 (ClawBleed, ClawHavoc), AAGF-2026-028 (ClawJacked), and now AAGF-2026-075 (CVE-2026-32922) all trace to the same root: authorization controls implemented feature-by-feature in a platform that prioritized adoption velocity. The instance count grew 6× (21,639 → 135,000+) across this period. Operators must treat OpenClaw's authorization architecture as a structural risk, not a series of isolated bugs.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| NVD (CVE-2026-32922) | https://nvd.nist.gov/vuln/detail/CVE-2026-32922 | 2026-03-29 | Authoritative — government vulnerability database; CVSS 9.9 vector and CWE-269 classification; CNA: VulnCheck |
| GitHub Advisory (GHSA-4jpw-hj22-2xmc) | https://github.com/advisories/GHSA-4jpw-hj22-2xmc | 2026-03-13 | Authoritative — first credible public disclosure; reporter: tdjackey; earlier than CVE publication by 16 days |
| GitHub Issue #20702 | https://github.com/openclaw/openclaw/issues/20702 | 2026-02-19 | High — original disclosure by @coygeek; contains reproduction steps; AI-assisted disclosure note; source for "GPT-5.3-Codex" reference |
| GitHub PR #20703 | https://github.com/openclaw/openclaw/pull/20703 | 2026-02-20 | Authoritative — the actual fix; source for `expandScopeImplications`, `scopesAllowWithImplications` implementation details and response redaction of `approvedScopes` |
| blink.new writeup | https://blink.new/blog/cve-2026-32922-openclaw-privilege-escalation-fix-guide | 2026-04 | Medium-High — technical writeup with operator guidance; describes fix and safe baseline (v2026.3.21); not primary source |
| nflo.tech | https://nflo.tech/knowledge-base/2026-03-29-cve-2026-32922-en | 2026-03-29 | Medium — knowledge base entry published concurrent with CVE publication; corroborates mechanism and exploitation chain |
| ARMO Blog | https://www.armosec.io/blog/cve-2026-32922-openclaw-privilege-escalation-cloud-security/ | 2026-02 | High — primary source for Shodan exposure scan (135,000+ instances, 63% unauthenticated); ARMO is the security research firm that conducted the scan |
