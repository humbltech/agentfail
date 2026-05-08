# AAGF-2026-074 Research: CVE-2026-35435 Azure AI Foundry Privilege Escalation

**Research date:** 2026-05-08
**Researcher:** Stage 1 Agent
**Sources fetched:**
- https://windowsnews.ai/article/cve-2026-35435-critical-azure-ai-foundry-privilege-escalation-in-m365-agents-leaves-systems-vulnerab.417153 — fetched, content returned
- https://www.redpacketsecurity.com/cve-alert-cve-2026-35435-microsoft-azure-ai-foundry/ — FAILED (HTTP 402, paywalled)
- https://radar.offseq.com/threat/cve-2026-35435-cwe-284-improper-access-control-in--a39ff77e — fetched, content returned
- https://cve.threatint.eu/CVE/CVE-2026-35435 — fetched, content returned
- https://vulnerability.circl.lu/vuln/msrc_cve-2026-35435 — fetched, content returned (most authoritative)
- https://nvd.nist.gov/vuln/detail/CVE-2026-35435 — fetched, content returned
- https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-35435 — fetched but JavaScript-rendered; no content extracted
- https://zenity.io/blog/research/inside-the-agent-stack-securing-azure-ai-foundry-built-agents — fetched; no CVE-specific content

---

## Key Facts (with source attribution)

### Dates

- **date_reserved:** April 2, 2026 — [ThreatINT](https://cve.threatint.eu/CVE/CVE-2026-35435), [CIRCL/MSRC](https://vulnerability.circl.lu/vuln/msrc_cve-2026-35435)
- **date_occurred / date_discovered:** Unknown — the CVE was reserved April 2, 2026, suggesting internal discovery preceded that date. No researcher or firm is credited in any source. The MSRC advisory (the authoritative source) does not state when the vulnerability was first exploitable or first exploited.
- **date_reported (first public disclosure):** May 7, 2026 — NVD published, MSRC advisory published [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-35435), [CIRCL](https://vulnerability.circl.lu/vuln/msrc_cve-2026-35435)
- **Last modified:** May 8, 2026 — [ThreatINT](https://cve.threatint.eu/CVE/CVE-2026-35435)

### CVSS and Classification

- **CVSS 3.1 Base Score:** 8.6 HIGH — all authoritative sources agree
- **CVSS 3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N`
  - AV:N — network-accessible
  - AC:L — low complexity
  - PR:N — no privileges required
  - UI:N — no user interaction
  - S:C — scope changed (impact crosses component boundary)
  - C:H — high confidentiality impact
  - I:N — no integrity impact
  - A:N — no availability impact
- **Temporal modifiers (from CIRCL/ThreatINT):** `E:U/RL:O/RC:C`
  - E:U — exploit code unproven
  - RL:O — official fix/remediation level
  - RC:C — confirmed report confidence
- **CWE:** CWE-284 (Improper Access Control) — all sources
- **NVD tag:** `exclusively-hosted-service` — [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-35435)
- **Assigning CNA:** Microsoft Corporation

### Affected Products

- **Product:** Azure AI Foundry — specifically "M365 published agents" feature
- **Scope:** Cloud-hosted service (exclusively-hosted-service tag); no on-premises component
- **Versions:** Not enumerated; cloud services do not carry traditional version numbers
- **Source:** [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-35435), [CIRCL](https://vulnerability.circl.lu/vuln/msrc_cve-2026-35435)

### Exploitation Status

**AUTHORITATIVE (MSRC via CIRCL/ThreatINT):**
- Exploitation in the wild: **No** — `E:U` (unproven exploit code maturity)
- Publicly disclosed prior to patch: **No**
- Customer action required: **None** — "This vulnerability documented by this CVE requires no customer action to resolve" — [CIRCL](https://vulnerability.circl.lu/vuln/msrc_cve-2026-35435)
- Remediation level: **Official fix** — Microsoft patched this server-side as a cloud service update before publication

**CONFLICTING (windowsnews.ai):**
- Claims "already exploited in the wild" and "no patch available"
- These claims are directly contradicted by the MSRC-sourced CVSS temporal vector (`E:U/RL:O`) and the CIRCL advisory stating an official fix is in place
- No Microsoft quote or CISA KEV entry corroborates the exploitation-in-wild claim

### Vendor Response

- Microsoft issued an official fix server-side (cloud patch) prior to or concurrent with disclosure on May 7, 2026
- No customer-side action required — consistent with Azure cloud service updates that Microsoft deploys directly
- No patch timeline announcement because the patch was already deployed at disclosure
- MSRC advisory published: https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-35435

---

## Technical Analysis

### Vulnerability Mechanism

Official CVE description (verbatim): *"Improper access control in Azure AI Foundry M365 published agents allows an unauthorized attacker to elevate privileges over a network."*

No technical deep-dive has been published by Microsoft or any researcher. The CVSS vector provides the most granular available detail:

- **Attack surface:** Network-reachable endpoint(s) within the Azure AI Foundry agent runtime or its M365 publishing layer
- **Authentication requirement:** None (PR:N) — an unauthorized attacker can trigger the flaw without any prior credentials
- **Complexity:** Low — no race conditions or special configurations required
- **Scope change (S:C):** The elevated privileges reach beyond the Azure AI Foundry component itself — likely into the broader M365 environment or other Azure resources the agent's service principal has access to
- **Impact:** Confidentiality only (C:H, I:N, A:N) — the exploitation path leads to unauthorized information disclosure, not data modification or service disruption

### What "M365 Published Agents" Are

Azure AI Foundry allows organizations to build AI agents and "publish" them into Microsoft 365 — surfacing them in Teams, Copilot, SharePoint, etc. Published agents operate under a service principal with delegated permissions across the M365 tenant. The flaw appears to reside in how these agents' authorization context is established or validated when accessed over the network, allowing an attacker to assume elevated permissions without supplying the required credentials.

### Plausible Mechanism Classes (Unverified — No Technical Writeup Published)

Based on CVSS vector (PR:N, AC:L, S:C, C:H) and CWE-284, the most consistent mechanism classes are:
1. **Authorization token or context forgery** — a request crafted without credentials is accepted and granted elevated context because the agent runtime does not validate the caller's identity before applying permissions
2. **Insecure default on agent publishing endpoint** — the M365 agent publication API endpoint lacks proper access control checks, allowing any network caller to invoke privileged operations
3. **SSRF or cross-tenant boundary escape** — less likely given no integrity impact, but possible if the elevated confidentiality access crosses tenant boundaries

The I:N (no integrity impact) strongly suggests this is a read/exfiltration path, not a write or execution path.

### CWE Analysis

CWE-284 (Improper Access Control) is the umbrella. More specific sub-CWEs that fit the vector:
- CWE-285 (Improper Authorization) — most likely; failure to verify that a caller is authorized before granting access
- CWE-862 (Missing Authorization) — possible; authorization check simply absent on the vulnerable endpoint
- CWE-306 (Missing Authentication for Critical Function) — possible given PR:N; the critical function may not require any authentication at all

---

## Source Quality Assessment

### windowsnews.ai (Primary Source)

**Assessment: UNRELIABLE for factual claims about this CVE. Flag for hallucination or speculative extrapolation.**

- Claims "exploited in the wild" — directly contradicted by MSRC's own CVSS temporal vector `E:U` (unproven)
- Claims "no patch available" — directly contradicted by `RL:O` (official fix) and "no customer action required"
- Claims CVSS "likely exceeding 9.0" — incorrect; the score is 8.6
- The article contains no Microsoft quotes, no researcher attribution, no CISA KEV reference
- The site appears to be an AI-generated or low-quality security news aggregator that extrapolated heavily from the CVE description and applied worst-case framing throughout
- Pattern: The same site published CVE-2026-35428 (Azure Cloud Shell) with similar alarmist framing; that CVE was also a cloud-patched service requiring no customer action
- **Do not use windowsnews.ai claims as evidence without independent corroboration**

### radar.offseq.com

**Assessment: Moderately reliable — aggregates MSRC data. Correct on CVSS, CWE, dates, and patch status. Conservative on exploitation (correctly states "no active exploitation documented").**

### vulnerability.circl.lu (CIRCL/MISP)

**Assessment: High reliability — pulls directly from MSRC advisory JSON feed. Most authoritative non-MSRC source. Correctly captures "no customer action required" and official-fix status.**

### cve.threatint.eu

**Assessment: High reliability — same MSRC source feed. Correct on all factual fields.**

### nvd.nist.gov

**Assessment: High reliability — authoritative NVD entry. Confirms "exclusively-hosted-service" tag, CNA is Microsoft, CVSS 8.6.**

### Conflicting Claims Summary

| Claim | windowsnews.ai | MSRC/CIRCL/ThreatINT/NVD |
|-------|---------------|--------------------------|
| Exploited in wild | Yes (stated as fact) | No (E:U — unproven) |
| Patch available | No | Yes (official fix, RL:O) |
| Customer action required | Yes (urgent) | None required |
| CVSS score | "likely >9.0" | 8.6 HIGH |
| Severity label | Critical | High (CVSS) / Critical (Microsoft internal label) |

**Resolution:** The MSRC-sourced data wins on all counts. This is a cloud-side fix, not an active zero-day.

---

## Classification Assessment

### Likely Categories

- **Primary:** Authorization / Access Control failure in AI agent platform
- **Secondary:** Agentic privilege escalation (agent runtime as attack surface)
- **Tertiary:** Cloud service boundary crossing (scope change S:C)

### Likely Failure Mode Tags (AgentFail taxonomy)

- `authorization-bypass` — core mechanism
- `overprivileged-agent` — the agent's service principal provides the elevated access that is improperly granted
- `agentic-privilege-escalation` — textbook case
- `m365-integration-surface` — the M365 publishing layer is the exposed attack surface

### Likely Severity

**HIGH for AgentFail purposes, despite being pre-patched.**

Justification: CVSS 8.6, no auth required, scope change into M365, confidentiality impact high. The fact that Microsoft patched it before disclosure suggests they considered it serious enough for proactive remediation. The cloud-only attack surface and confidentiality-only impact prevent this from being CRITICAL.

### actual_vs_potential

**`near-miss`** — with justification:

The official MSRC data states no exploitation in the wild was detected (E:U). Microsoft discovered and remediated this before any confirmed attacker exploitation. However, the attack requires no authentication and no user interaction against a widely deployed cloud service (Azure AI Foundry / M365) used across enterprise tenants. If unpatched and exploited:
- Any internet-accessible Azure AI Foundry workspace with published M365 agents would be at risk
- The scope change (S:C) means access could cross into the M365 tenant environment
- Thousands of enterprise M365 tenants use Azure AI Foundry agent publishing
- Near-miss is the correct classification: the vulnerability was real, the attack surface was live, exploitation was plausible, but Microsoft closed the window before attackers used it (per available evidence)

### CVSS Temporal Justification for Near-Miss

- E:U (exploit unproven) confirms no known exploit code
- RL:O (official fix) confirms remediation before exploitation
- RC:C (confirmed) confirms the vulnerability itself was real and verified

### MITRE ATLAS Techniques

- **AML.T0056 — LLM Jailbreak** — not applicable (this is an access control flaw, not a model manipulation)
- **AML.T0048 — Discover ML Model Ontology** — not directly applicable
- **AML.T0043 — Craft Adversarial Data** — not applicable
- **Most applicable (ATLAS v5.4):**
  - **AML.T0053 — Exploit Public-Facing Application** — attack via network-accessible agent endpoint
  - **AML.T0054 — Exploit ML Model Inference API** — the agent runtime API is the attack surface
  - **AML.T0050 — Establish Accounts** — not applicable (no auth required)
  - **Closest tactic: Privilege Escalation / Initial Access via exploitation of ML platform**

Note: MITRE ATLAS does not yet have a dedicated technique for "AI platform authorization bypass" — this maps most cleanly to traditional exploitation techniques applied to an AI-specific surface.

### OWASP LLM Top 10 (2025)

- **LLM06:2025 — Excessive Agency** — partial fit; the agent has excessive permissions that can be improperly accessed by an unauthorized party
- **LLM09:2025 — Misinformation** — not applicable
- **LLM04:2025 — Data and Model Poisoning** — not applicable

### OWASP Agentic AI Top 10 (December 2025)

- **A02 — Agentic Authorization Failures** — primary mapping; the agent runtime fails to enforce authorization before granting elevated access
- **A05 — Excessive Permissions and Scope** — secondary; the agent's service principal scope enables the high-impact confidentiality breach once authorization is bypassed
- **A08 — Trust Boundary Violations** — applicable; scope change (S:C) indicates trust boundary crossing from agent context into M365 environment

### Related CVEs

**CVE-2026-25592 and CVE-2026-26030 (Semantic Kernel):**
- These are vulnerabilities in the Semantic Kernel SDK (Python), affecting the orchestration framework
- CVE-2026-35435 affects Azure AI Foundry's M365 agent publishing infrastructure (cloud service layer), not the SDK
- They are **distinct vulnerability chains** — different product, different layer, different mechanism (SK is code execution / path traversal; this is access control / authorization)
- However, they share a common threat context: Microsoft's AI agent platform stack is attracting significant security scrutiny in 2026
- Related to AAGF-2026-072 (Semantic Kernel CVSS 9.9×2) by theme and vendor, not by technical chain

---

## Open Questions

1. **Who discovered this?** No researcher, firm, or bug bounty submission is credited in any source. Was this found internally by Microsoft's own security team (Blue Team / Security Research), externally reported via MSRC, or discovered during a routine security audit of the Azure AI Foundry platform?

2. **Exact vulnerable endpoint/API.** The CVSS description is maximally sparse. What specific API route, agent management endpoint, or M365 publishing workflow contained the authorization gap?

3. **When was the cloud fix deployed?** The CVE was reserved April 2, 2026 and published May 7, 2026. The ~35-day gap suggests internal discovery, investigation, and fix deployment all occurred before public disclosure. Was the fix deployed silently weeks before disclosure?

4. **Scope of exposure window.** How long was the vulnerable code running in production before the fix? If the agent publishing feature launched in late 2025 (Azure AI Foundry Agents GA was ~November 2025), the attack surface could have been live for months.

5. **Cross-tenant impact.** Does the scope change (S:C) enable cross-tenant access, or is it contained within a single tenant's M365 environment? This is the single biggest unknown for estimating potential damage.

6. **windowsnews.ai sourcing.** The primary triage source cited "Microsoft confirmed active exploitation in the wild" — this appears to be fabricated or grossly misread from the MSRC advisory. Verify whether windowsnews.ai is AI-generated content that hallucinated the exploitation claim.

7. **Relationship to Azure AI Foundry Agents GA timeline.** The M365 "published agents" feature is relatively new (GA ~Nov 2025). Were security controls for this feature adequately reviewed before launch?

8. **CISA KEV status.** Is this CVE in CISA's Known Exploited Vulnerabilities catalog? Search results did not confirm this, and the `E:U` temporal vector suggests it is not — but should be explicitly verified.

9. **Additional related CVEs.** The same May 7 disclosure batch from Microsoft included CVE-2026-35428 (Azure Cloud Shell spoofing) and CVE-2026-41105 (Azure Monitor Action Groups privilege escalation) — these may indicate a broader audit of Azure cloud service authorization controls in May 2026.
