---
id: "AAGF-2026-056"
title: "CVE-2026-42208: Pre-Authentication SQL Injection in LiteLLM Proxy Targets AI Gateway Credential Store 36 Hours After Advisory Publication"
status: "draft"
date_occurred: "2026-04-26"        # First exploitation observed in Sysdig telemetry, 04:24 UTC
date_discovered: ""                # Unknown — Tencent YunDing Security Lab coordinated pre-patch disclosure; exact discovery date not public
date_reported: "2026-04-24"       # GitHub Advisory Database global indexing — the exploitation trigger
date_curated: ""
date_council_reviewed: ""

# Classification
category:
  - "Unauthorized Data Access"
  - "Supply Chain Compromise"    # Consequence characterization: LiteLLM aggregates API credentials for 100+ LLM providers by design; compromise of the proxy is effectively a supply chain compromise of all integrated providers. This is a direct software vulnerability (SQLi), not a package manager supply chain attack — see researcher_notes.
severity: "Critical"   # CVSS 9.3, pre-auth, actively exploited, targets production AI infrastructure credential store
agent_type:
  - "Tool-Using Agent"
  - "Task Automation Agent"
# LiteLLM Proxy is AI infrastructure serving tool-using agents; it is not an agent itself but the gateway for agents routing requests to 100+ LLM providers
agent_name: "LiteLLM Proxy (AI gateway)"
platform: "LiteLLM Proxy (self-hosted, open-source)"
industry: "AI Infrastructure / Developer Tools"

# Near-miss classification
actual_vs_potential: "partial"   # Schema enumeration confirmed; data exfiltration not confirmed in Sysdig visibility window
potential_damage: "Full extraction of all upstream LLM provider credentials stored in the proxy database: OpenAI org-level API keys, Anthropic workspace admin keys, AWS Bedrock IAM credentials (which provide lateral movement beyond LLM APIs into S3, EC2, and other AWS services). Additionally: PostgreSQL DSN in litellm_config enabling direct database access, bypassing LiteLLM entirely. One successful UNION-based extraction against a production LiteLLM Proxy gives the attacker every provider credential in the instance — structurally equivalent to compromising a VPN or SSO broker."
intervention: "Sysdig Threat Research Team detected active exploitation via telemetry against customer deployments. Their public disclosure reporting on the attacker's behavior (schema enumeration, targeted table ordering, no authenticated follow-through) is what established the confirmed-but-no-exfiltration characterization. Whether other deployments outside Sysdig's visibility were successfully exfiltrated is unknown."

# Impact
financial_impact: "Not quantified — no confirmed credential theft or financial loss documented"
financial_impact_usd: null
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null        # No authoritative count of exposed deployments published; no Shodan scan data in sources
  scale: "widespread"
  data_types_exposed: ["credentials"]   # Credentials structurally at risk (not confirmed exfiltrated)

# Damage Timing
damage_speed: "instantaneous"   # SQLi response returns data in a single HTTP request
damage_duration: "unknown"      # Exploitation window unclear; deployments outside Sysdig visibility may have been hit
total_damage_window: "8 days"   # April 18 (patch released) to April 26 (first exploitation) — vulnerable window for unpatched deployments

# Recovery
recovery_time: "unknown"        # Patching required; credential rotation for keys active during vulnerable window
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "BishopFox recommended rotating all virtual keys active during the vulnerable window (1.81.16–1.83.6); any operator whose deployment was hit would also need to rotate all upstream LLM provider credentials (OpenAI, Anthropic, AWS Bedrock IAM, etc.) stored in the proxy database."
full_recovery_achieved: "unknown"

# Business Impact
business_scope: "widespread"    # Any internet-facing LiteLLM Proxy deployment (unknown global count)
business_criticality: "existential"
business_criticality_notes: "A successful LiteLLM Proxy compromise via this SQLi yields every upstream LLM provider credential in the instance in a single unauthenticated HTTP request. For organizations routing multi-provider AI workloads through LiteLLM, this is a single-point-of-failure for their entire AI service stack. AWS Bedrock IAM credential extraction extends the blast radius beyond LLM APIs to potentially the entire AWS environment."

systems_affected: ["ai-gateway", "credentials", "production-database"]

# Vendor Response
vendor_response: "fixed"
vendor_response_time: "<24h"   # Patch released via coordinated disclosure before advisory was public; <24h from coordinated disclosure to v1.83.7-stable

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: null      # Structurally unquantifiable without confirmed exfiltration data and deployment count
  averted_range_low: null
  averted_range_high: null
  composite_damage_usd: null
  confidence: "order-of-magnitude"
  probability_weight: null
  methodology: "Not calculable: no confirmed exfiltration, no deployment count data. Structural risk: N deployments × 5 provider credential types per deployment × enterprise breach multiplier — unquantifiable without N. Qualitative floor: AWS Bedrock IAM credential lateral movement reaches enterprise breach class ($4.88M IBM CODB average) for any single affected enterprise deployment."
  methodology_detail:
    per_unit_cost_usd: 4880000
    unit_count: null
    unit_type: "enterprise deployment (IBM 2024 CODB enterprise breach average)"
    multiplier: null
    benchmark_source: "IBM 2024 Cost of Data Breach; BishopFox CVE-2026-42208 advisory; Sysdig Threat Research"
  estimation_date: "2026-05-07"
  human_override: false
  notes: "Averted damage is structurally unquantifiable: Sysdig confirmed schema enumeration with no authenticated follow-through in their telemetry window, but explicitly noted that deployments outside their visibility may have been exfiltrated. Without deployment count data (no Shodan scan published) and no confirmed credential theft, any numeric estimate would be speculative. IBM CODB enterprise breach cost of $4.88M provides a per-deployment floor for qualitative risk communication."

# Presentation
headline_stat: "Pre-authentication SQL injection in LiteLLM Proxy — the AI gateway aggregating credentials for 100+ LLM providers — exploited 36 hours after the advisory was indexed in the GitHub Advisory Database"
operator_tldr: "Patch LiteLLM Proxy immediately to ≥ 1.83.7; rotate ALL upstream provider credentials (OpenAI, Anthropic, AWS Bedrock, etc.) active during any period when your deployment ran 1.81.16–1.83.6; add a WAF rule rejecting bearer tokens not matching ^sk-[A-Za-z0-9_-]+$; monitor GitHub Advisory Database indexing of dependencies as a near-real-time exploitation risk signal."
containment_method: "third_party"   # Sysdig's telemetry captured the exploitation; their public disclosure established the confirmed-but-no-exfiltration characterization
public_attention: "high"

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0055"   # Unsecured Credentials — credentials in LiteLLM database accessible via SQLi
    - "AML.T0083"   # Credentials from AI Agent Configuration — upstream provider keys in proxy config/database
    - "AML.T0098"   # AI Agent Tool Credential Harvesting — extracting credentials via tool/API exploitation
    - "AML.T0012"   # Valid Accounts — stolen credentials would enable authenticated LLM provider access
    - "AML.T0085"   # Data from AI Services — extracting data from AI service infrastructure
  owasp_llm:
    - "LLM03:2025"  # Supply Chain — AI infrastructure supply chain exposure
    - "LLM02:2025"  # Sensitive Information Disclosure — credential exfiltration
  owasp_agentic:
    - "ASI04:2026"  # Agentic Supply Chain Compromise — AI gateway as supply chain chokepoint
    - "ASI03:2026"  # Agent Identity and Privilege Abuse — attacker impersonating any provider key if extracted
  ttps_ai:
    - "2.9"         # Credential Access
    - "2.15"        # Exfiltration
    - "2.3"         # Initial Access — gateway as initial access vector to all LLM providers

# Relationships
related_incidents:
  - "AAGF-2026-009"   # Same platform (LiteLLM), different attack vector; both target AI gateway credential aggregation role
  - "AAGF-2026-052"   # Serial CVE exploitation pattern (20h vs 36h gap); same advisory-database-as-exploit-trigger mechanism
  - "AAGF-2026-013"   # ai-agent-platform-security-crisis pattern group; both AI infrastructure platforms with pre-auth vulnerabilities exploited in the wild
pattern_group: "ai-agent-platform-security-crisis"
tags:
  - "sql-injection"
  - "pre-authentication"
  - "credential-store"
  - "ai-gateway"
  - "litellm"
  - "cve-2026-42208"
  - "advisory-database-exploit-trigger"
  - "github-advisory-database"
  - "tencent-yunding"
  - "sysdig"
  - "bishopfox"

# Metadata
sources:
  - "BishopFox CVE-2026-42208 advisory — most technically authoritative on vulnerability mechanism and PoC"
  - "Sysdig Threat Research in-the-wild exploitation telemetry — authoritative on attacker behavior; confirmed no exfiltration"
  - "LiteLLM vendor advisory — understated severity; minimizes to 'could potentially result in unintended database access'"
  - "GitHub Security Advisory GHSA-xxxx-xxxx-xxxx — published April 20, 2026, 21:14 UTC"
  - "CCB Belgium government advisory"
  - "NVD CVE-2026-42208 entry"
researcher_notes: "Category note: 'Supply Chain Compromise' is applied here as a consequence characterization, not a technical attack vector designation. LiteLLM Proxy is a credential concentrator by design — it stores API keys for 100+ upstream LLM providers to route requests on behalf of clients. A SQLi compromise of LiteLLM is structurally equivalent to a supply chain compromise of all integrated providers: the attacker inherits every downstream provider credential without needing to compromise any of those providers directly. This is analogous to an SSO broker compromise. The direct attack vector is a software vulnerability (CWE-89 SQL injection), not a package manager supply chain attack. Closest existing precedent in database: AAGF-2026-009 (LiteLLM supply chain compromise via Trivy) — same platform, different vector class. | Pattern group note: 'ai-agent-platform-security-crisis' is retained with a caveat: LiteLLM Proxy is an API gateway, not an AI agent platform in the Flowise/Langflow/OpenClaw sense. Its membership in this pattern group is justified by (1) the second major security crisis on the same platform within months, (2) growth-first development culture evidence (45K stars, 7.6K forks, credential aggregation shipped without parameterized queries), and (3) the platform's AI-infrastructure role amplifying blast radius identically to prior pattern group members. CISA KEV non-listing noted: as of 2026-05-07, CVE-2026-42208 is not listed in CISA KEV. Contrast: Langflow CVE-2026-33017 (similar active exploitation profile) was listed within 8 days. The absence may reflect CISA's prioritization of confirmed exfiltration over structural risk, or may simply be a backlog artifact. Not interpreted as a principled severity downgrade."
council_verdict: ""
---

# CVE-2026-42208: Pre-Authentication SQL Injection in LiteLLM Proxy Targets AI Gateway Credential Store 36 Hours After Advisory Publication

## Executive Summary

A pre-authentication SQL injection vulnerability (CVE-2026-42208, CVSS 9.3 Critical) in LiteLLM Proxy — the open-source AI gateway used by thousands of organizations to route requests to 100+ LLM providers — was actively exploited 36 hours after the GitHub Advisory Database indexed the coordinated disclosure, not 6 days after the patch was available. The vulnerability, located in an error-handling path that bypassed token sanitization for bearer tokens without the `sk-` prefix, allowed unauthenticated attackers to reach parameterized-query-less SQL via f-string interpolation. Sysdig Threat Research captured the in-the-wild exploitation: attackers demonstrated schema foreknowledge, targeted credential tables in precise order, and performed schema enumeration without confirmed credential extraction — but the structural risk remains that any internet-facing LiteLLM deployment running versions 1.81.16–1.83.6 was a single unauthenticated HTTP request away from complete multi-provider API credential theft.

---

## Timeline

| Date/Time | Event |
|-----------|-------|
| Unknown | Tencent YunDing Security Lab discovers vulnerability; coordinated disclosure process begins |
| 2026-04-18/19 | LiteLLM v1.83.7-stable released with parameterized query fix — patch available before advisory is public |
| 2026-04-20, 21:14 UTC | GitHub Security Advisory published — advisory database indexed but not yet propagated |
| 2026-04-24 | GitHub Advisory Database global indexing — CVE-2026-42208 enters automated security monitoring feeds |
| 2026-04-26, 04:24 UTC | First exploitation attempt observed in Sysdig Threat Research telemetry |
| 2026-04-26 | BishopFox publishes CVE-2026-42208 advisory with technical analysis and interim mitigations |
| 2026-04-26 | Sysdig Threat Research publishes in-the-wild exploitation report |
| ~2026-04-26 | CCB Belgium publishes government advisory |
| 2026-05-07 | CVE-2026-42208 not yet listed in CISA KEV (contrast: Langflow CVE-2026-33017 listed within 8 days) |

---

## What Happened

LiteLLM Proxy is the open-source AI gateway with 45,000+ GitHub stars and 7.6K forks that routes requests from applications and AI agents to 100+ LLM providers (OpenAI, Anthropic, AWS Bedrock, Azure OpenAI, Google Vertex AI, and others) through a unified API. By design, it stores every upstream provider API key in its database — it is a credential concentrator. This architectural role is not incidental; it is the product's core value proposition.

Tencent YunDing Security Lab discovered a pre-authentication SQL injection vulnerability in the proxy and coordinated responsible disclosure with the LiteLLM team. The patch was released in v1.83.7-stable on April 18–19, 2026 — before the advisory was public. This is textbook coordinated disclosure. The advisory was published on GitHub on April 20 but did not propagate globally into security monitoring feeds until April 24.

On April 26 at 04:24 UTC — 36 hours after the GitHub Advisory Database global indexing on April 24 — Sysdig Threat Research captured the first exploitation attempts in telemetry from customer deployments. The 36-hour gap from advisory indexing to exploitation is the operative timeline: attackers use automated GHAD monitoring as a near-real-time attack surface discovery feed. The 6-day gap from patch release to exploitation is a misleading frame — the actual trigger was advisory indexing, not patch availability.

The attackers, operating from two IPs (65.111.27.132 and 65.111.25.67) in adjacent /22 address blocks with an identical `Python/3.12 aiohttp/3.9.1` user-agent string (indicating a single operator rotating egress), demonstrated remarkable schema foreknowledge: they used the correct PascalCase table names (`LiteLLM_VerificationToken`) after initial lowercase attempts failed, skipped user and team tables entirely, and targeted credential tables directly in a purposeful sequence:

1. `LiteLLM_VerificationToken` — API key metadata
2. `litellm_credentials.credential_values` — upstream provider API keys  
3. `litellm_config` — PostgreSQL DSN (enabling direct database access, bypassing LiteLLM)

Sysdig observed UNION-based injection queries in the wild (consistent with the BishopFox PoC using time-based blind injection). Their telemetry showed schema enumeration but no authenticated follow-through against LLM provider APIs using extracted credentials. They characterized the outcome as confirmed exploitation with no confirmed exfiltration — with the explicit caveat that deployments outside Sysdig's visibility window are unknown.

---

## Technical Analysis

**Vulnerability location:** `litellm/proxy/utils.py` → `PrismaClient.get_data()` method

**Root cause:** F-string interpolation into SQL query strings instead of parameterized queries:

```python
# Vulnerable pattern (simplified)
query = f"SELECT * FROM LiteLLM_VerificationToken WHERE v.token = '{token}'"
```

**Exploitation path — the error-handling bypass:**

The vulnerability is accessible pre-authentication via a subtle logic flaw in the authentication pipeline:

1. Attacker sends a bearer token **without the `sk-` prefix**
2. This causes `_hash_token_if_needed()` to skip hashing (prefix check fails)
3. The token passes to the main auth handler, which raises `AssertionError` for an unhashed token
4. The outer `except Exception` block catches it — and routes to `_ProxyDBLogger.async_post_call_failure_hook()`
5. The failure hook calls `PrismaClient.get_data()` with the **unsanitized original token** interpolated into the SQL query

The bypass is architectural: the error-handling path was not considered part of the authentication surface and therefore did not apply the same input sanitization as the happy path.

**Injection types observed:**
- UNION-based (observed in Sysdig in-the-wild telemetry)
- Time-based blind (BishopFox PoC)

**Affected versions:** LiteLLM Proxy >= 1.81.16, < 1.83.7

**Fix:** Replace f-string interpolation with parameterized queries throughout `PrismaClient.get_data()`. The fix closes the injection point; it does not change the error-handling routing logic.

**Credential exposure model:**

LiteLLM's database schema stores credentials in a tiered structure. A successful UNION-based extraction against the three targeted tables yields:

- `LiteLLM_VerificationToken`: Virtual API key metadata, rate limits, model permissions, associated team/organization
- `litellm_credentials.credential_values`: The upstream provider API keys themselves — OpenAI org keys, Anthropic workspace admin keys, AWS Bedrock IAM access keys and secrets, Azure deployment keys, etc.
- `litellm_config`: The PostgreSQL connection string (DSN) for the proxy's own database — enabling the attacker to connect directly to the database, bypassing LiteLLM's application layer entirely for any subsequent queries

AWS Bedrock IAM credentials are particularly significant: unlike API-only credentials, IAM keys can be used for lateral movement across an organization's entire AWS environment (S3, EC2, Lambda, Secrets Manager, and beyond LLM APIs).

**Interim mitigations (BishopFox):**
- `disable_error_logs: true` in LiteLLM configuration — removes the error-handling path that triggers the vulnerable code
- WAF rule rejecting bearer tokens not matching `^sk-[A-Za-z0-9_-]+$` — blocks the prefix-bypass technique at the network layer
- p99 latency monitoring on authentication paths — anomalous latency signatures from time-based blind injection

---

## Root Cause Analysis

**Proximate cause:** An f-string interpolation in `PrismaClient.get_data()` accepted unsanitized user input (bearer token) into a SQL query, reachable pre-authentication via the error-handling path.

**Why 1:** Why was f-string interpolation used instead of parameterized queries?
Parameterized queries require more deliberate design; f-string interpolation is the path of least resistance in Python. In a growth-first codebase with rapid feature velocity, the query was written for functionality, not security.

**Why 2:** Why was the error-handling path not considered an authentication surface?
The vulnerability resides in `_ProxyDBLogger.async_post_call_failure_hook()` — a logging/observability component, not the main auth handler. Developers typically model security boundaries around the "happy path." Error handlers and failure hooks are treated as internal infrastructure, not as user-input-reachable surfaces.

**Why 3:** Why did the `except Exception` handler route the unsanitized token to the database layer?
The failure hook needed the original token for logging and audit purposes (which token caused the auth failure). This is a legitimate use case implemented without considering that the token itself could be adversarially crafted.

**Why 4:** Why was there no parameterized query requirement in code review or CI/CD?
LiteLLM's development culture prioritized ecosystem velocity (100+ provider integrations) over security-focused code review. Static analysis for SQL injection patterns (e.g., `bandit` for Python) was either absent from CI or not enforced. No secure coding standard mandated parameterized queries across all database interaction methods.

**Why 5 / Root cause:** LiteLLM's growth-first development culture — evident in 45,000 GitHub stars accumulated faster than security engineering maturity — produced a codebase where security-critical patterns (parameterized queries, comprehensive security boundary modeling) were not enforced at the process level. The second major security crisis on the same platform within months (after AAGF-2026-009's supply chain compromise) is a systemic indicator, not a one-off bug.

**Root cause summary:** Growth-first development culture without enforced secure coding standards allowed SQL injection via f-string interpolation to enter an error-handling code path that was not recognized as part of the authentication attack surface.

---

## Impact Assessment

**Severity:** Critical (CVSS 9.3, CWE-89, actively exploited)

**Who was affected:**
- Any organization running an internet-facing LiteLLM Proxy deployment on versions 1.81.16–1.83.6 (approximately 8-day window: April 18–26 from patch release to exploitation)
- Deployments outside Sysdig's visibility window — unknown scope; no Shodan scan data published
- Sysdig customer deployments — exploitation confirmed; credential extraction not confirmed

**What was at risk:**
- Every upstream LLM provider API key stored in the proxy database (OpenAI, Anthropic, AWS Bedrock IAM, Azure OpenAI, Google Vertex AI, etc.)
- PostgreSQL DSN enabling direct database access bypassing LiteLLM
- AWS Bedrock IAM credentials enabling lateral movement across the entire AWS environment

**Quantified impact (confirmed):**
- Schema enumeration confirmed by Sysdig telemetry
- No confirmed credential extraction in Sysdig's visibility window
- No confirmed authenticated use of extracted credentials against LLM providers
- No financial losses publicly documented

**Quantified impact (structural risk, unconfirmed):**
- N internet-facing deployments (unknown) × 5+ provider credential types per deployment = unquantifiable credential exposure potential
- AWS Bedrock IAM credential lateral movement → enterprise breach class ($4.88M IBM CODB average per enterprise)

**Containment:** Third-party (Sysdig telemetry). The vendor patch was released before exploitation occurred; the 36-hour exploitation window from advisory indexing suggests the window for unpatched deployments was acute. Whether deployments outside Sysdig's telemetry visibility were successfully exfiltrated remains unknown.

---

## How It Could Have Been Prevented

1. **Mandatory parameterized queries via static analysis:** A `bandit` or `semgrep` CI/CD gate enforcing parameterized database queries across all database interaction methods would have caught this at the PR stage. This is a known-detectable CWE-89 pattern.

2. **Security boundary modeling for error-handling paths:** Code review checklists and threat modeling should explicitly consider error-handling, logging, and observability code paths as user-input-reachable surfaces. The failure hook was not modeled as an authentication boundary — it should have been.

3. **Input sanitization at ingestion, not at query construction:** All bearer token input should be sanitized (or validated for the `sk-` prefix format) at the API boundary, before it reaches any downstream component including error handlers.

4. **WAF rule blocking non-`sk-` bearer tokens:** The BishopFox interim mitigation — a WAF rule rejecting bearer tokens not matching `^sk-[A-Za-z0-9_-]+$` — would have prevented the specific prefix-bypass exploitation technique, even without the code fix.

5. **Advisory Database monitoring as a patch urgency signal:** The 36-hour exploitation window from GHAD indexing to active exploitation means operators must treat advisory database indexing events for production dependencies as equivalent to active exploitation signals requiring same-day patching, not the traditional 30-day patch SLA.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**

- LiteLLM v1.83.7-stable released April 18–19, 2026: parameterized queries replacing f-string interpolation in `PrismaClient.get_data()`
- LiteLLM vendor advisory published (understated severity: "could potentially result in unintended database access")
- BishopFox published CVE advisory with technical analysis and interim mitigations
- CCB Belgium issued government advisory

**Additional recommended fixes:**

- Audit all `PrismaClient` methods for f-string SQL interpolation — the fix for `get_data()` does not guarantee other methods in the same file are clean
- Implement `disable_error_logs: true` as the default configuration, requiring explicit opt-in for error logging rather than the reverse
- Add WAF rules as a defense-in-depth layer independent of the application patch
- Rotate all upstream provider credentials active during the vulnerable window (1.81.16–1.83.6), including AWS Bedrock IAM keys, regardless of whether exploitation is confirmed — the exploitation window was acute and confirmation requires forensic telemetry most self-hosted operators do not have
- Add `bandit` or equivalent to CI/CD with SQL injection rules enforced at zero-warning threshold

---

## Solutions Analysis

### Parameterized Queries Enforcement via CI/CD Gate
- **Type:** Preventive control — static analysis enforcement
- **Plausibility:** 5/5 — parameterized query enforcement is a solved problem; `bandit B608` rule detects f-string SQL construction in Python; semgrep has ready-made rules for this pattern class
- **Practicality:** 4/5 — requires adding `bandit` to CI with zero-warning policy; existing codebase may need remediation pass; minimal ongoing maintenance
- **How it applies:** CWE-89 f-string interpolation in `PrismaClient.get_data()` would have been flagged at the PR stage before merge; the vulnerability would never have shipped
- **Limitations:** Only prevents new occurrences; requires a one-time audit to clean existing f-string SQL patterns in the codebase; does not address the error-handling boundary modeling gap

### WAF Rule: Reject Non-`sk-` Bearer Tokens
- **Type:** Detective/preventive control — network-layer defense
- **Plausibility:** 5/5 — trivial one-line WAF rule; BishopFox validated as an interim mitigation; format restriction is inherent to LiteLLM's token design
- **Practicality:** 5/5 — zero application code changes; deployable in minutes; no false positive risk for legitimate traffic (all valid LiteLLM virtual keys begin with `sk-`)
- **How it applies:** The exploitation technique requires a bearer token without the `sk-` prefix to trigger the error-handling path bypass. A WAF rule `token !~ ^sk-[A-Za-z0-9_-]+$` → reject blocks this specific bypass technique at the network layer
- **Limitations:** Defense against this specific exploitation technique only; does not address the underlying SQL injection vulnerability; sophisticated attackers may find alternative bypass techniques; not a substitute for patching

### Credential Rotation Post-Exploitation-Window
- **Type:** Responsive control — blast radius limitation
- **Plausibility:** 5/5 — standard incident response practice; BishopFox explicitly recommended
- **Practicality:** 3/5 — rotating credentials for 100+ provider integrations is operationally complex; requires coordination with every upstream provider; AWS Bedrock IAM key rotation has IAM governance implications; organizations must assess which keys were active during the vulnerable window
- **How it applies:** For any operator running 1.81.16–1.83.6 during April 18–26, credential rotation is the only action that limits harm if exploitation occurred outside Sysdig's visibility; patch alone does not revoke credentials an attacker may have extracted
- **Limitations:** Rotation is reactive; does not confirm whether extraction occurred; significant operational overhead for multi-provider deployments; AWS Bedrock IAM rotation is not instantaneous and may affect production workloads

### Advisory Database Monitoring as Patch Urgency Signal
- **Type:** Process control — vulnerability management process
- **Plausibility:** 4/5 — the 20-hour (Langflow) and 36-hour (LiteLLM) exploitation gaps confirm that GHAD indexing is the reliable exploitation trigger; attacker automation against GHAD is documented and consistent
- **Practicality:** 4/5 — GHAD has a public API and webhook mechanisms; automated alerting for production dependencies is achievable with standard SCA tooling (Dependabot, Snyk, socket.dev); requires defining a tiered response playbook mapping advisory severity to patch SLA
- **How it applies:** An operator monitoring GHAD for LiteLLM on April 24 would have had 36 hours to patch before exploitation — sufficient for most organizations with a mature patching process; without monitoring, the window may have passed before awareness
- **Limitations:** GHAD indexing lag means the patch was available 6 days before the advisory indexed; the real gap is the absence of a same-day-patch SLA for CVSS 9+ AI infrastructure dependencies with pre-auth vectors

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-009]] | Same platform (LiteLLM Proxy), different attack vector. AAGF-2026-009 was a supply chain compromise via Trivy CI/CD pipeline; AAGF-2026-056 is a direct HTTP SQLi against the running proxy. Both target LiteLLM's role as credential aggregator for 100+ LLM providers. Second major LiteLLM security incident in 2026. |
| [[AAGF-2026-052]] | Serial CVE exploitation pattern. Langflow CVE-2026-33017 was exploited 20 hours after advisory publication; LiteLLM CVE-2026-42208 was exploited 36 hours after advisory indexing. Same mechanism: automated GHAD monitoring as attack surface discovery feed. Both are AI infrastructure platforms with unsecured code execution paths exploited in the wild. |
| [[AAGF-2026-013]] | ai-agent-platform-security-crisis pattern group peer. Flowise CVSS 10.0 pre-auth RCE via CustomMCP node. Both are AI infrastructure platforms with actively exploited pre-auth vulnerabilities; both produce credential cascade to downstream LLM providers. |

---

## Strategic Council Review

### Challenger Findings

1. **"Supply Chain Compromise" category may be a category error.** This is a direct SQL injection vulnerability in running software, not a supply chain attack. The "supply chain" framing is metaphorical: LiteLLM aggregates upstream credentials, so its compromise *functionally* resembles a supply chain compromise for downstream providers. But by standard taxonomy (MITRE, OWASP), supply chain compromise refers to compromise via a dependency chain (package manager, CI/CD, build pipeline). Applying "Supply Chain Compromise" as a category here dilutes its meaning and could confuse readers who expect the category to indicate a dependency-chain attack vector.

2. **"ai-agent-platform-security-crisis" pattern group fit is strained.** This pattern group was established for AI agent builder platforms (OpenClaw, Flowise, Langflow) — platforms where users build AI agents. LiteLLM Proxy is an API gateway, not an agent builder. Its users are developers and DevOps teams routing API traffic, not non-technical operators building agents visually. The growth-first culture argument is valid, but other API gateways with security incidents are not classified in this pattern group. The second LiteLLM incident in 2026 is significant, but "second incident on the same platform" is not sufficient to place it in a pattern group defined around a different product category.

3. **"No confirmed exfiltration" may be an artifact of Sysdig's visibility scope, not a reliable characterization of incident outcome.** Sysdig's telemetry covers their customer deployments. The incident was publicly announced. Any attacker who successfully exfiltrated credentials from a non-Sysdig deployment has no reason to advertise it. The "partial" actual_vs_potential characterization is the most defensible given available evidence, but the "no confirmed exfiltration" framing may create false reassurance for operators who should be rotating credentials regardless.

4. **CISA KEV non-listing is underweighted as a severity signal.** Langflow CVE-2026-33017 — with an almost identical exploitation profile (pre-auth, CVSS 9.3/10.0, actively exploited, AI infrastructure target, credential cascade risk) — was listed in CISA KEV within 8 days. CVE-2026-42208 is not listed as of publication. This either reflects a principled CISA judgment that the impact difference (confirmed credential theft for Langflow vs. unconfirmed for LiteLLM) warrants different treatment, or is a backlog artifact. The analysis characterizes this as "not interpreted as a principled severity downgrade" — but some readers will reasonably draw the opposite inference.

### Steelman Defense

1. **"Supply Chain Compromise" as a consequence category is established precedent in this database.** AAGF-2026-052 (Langflow) uses the identical framing: "Consequence characterization: Langflow as AI infrastructure hub means compromise cascades to all downstream AI provider credentials — supply chain risk in consequence, not in attack vector." LiteLLM's role is structurally equivalent: it aggregates upstream provider credentials for downstream consumers. The category note in the frontmatter explicitly flags this as a consequence characterization, not a vector characterization. The researcher_notes field further documents the distinction. Readers who engage with the frontmatter will see the qualifier; the category serves the database's purpose of surfacing AI-specific supply chain risk patterns.

2. **The pattern group classification is justified by demonstrated parallelism, not just platform similarity.** The pattern group's defining signature includes "growth-first development culture outpacing security investment." LiteLLM demonstrates this: 45,000 GitHub stars, 7.6K forks, credential aggregation for 100+ providers shipped without parameterized queries in the error-handling path. The second major security crisis on the same platform within months of the first (AAGF-2026-009) is empirical evidence of systemic security debt, not incidental. The researcher_notes field documents the caveat that LiteLLM is an API gateway rather than an agent builder platform — the classification is made with full awareness of the distinction.

3. **The "no confirmed exfiltration" characterization with explicit uncertainty is the epistemically correct approach.** Asserting "exfiltration occurred" without evidence would be irresponsible. Asserting "exfiltration did not occur" without full visibility would be equally irresponsible. The "partial" actual_vs_potential designation with the intervention field explicitly flagging Sysdig's limited visibility scope is the correct handling. The operator_tldr recommends credential rotation regardless — the actionable guidance does not depend on whether exfiltration is confirmed.

4. **CVSS 9.3 + pre-auth + actively exploited + AI infrastructure credential concentrator warrants Critical severity, CISA KEV status notwithstanding.** CISA KEV is a federal remediation prioritization tool, not an incident severity oracle. Its absence may reflect federal agency LiteLLM deployment prevalence (lower than Langflow's) rather than a severity judgment. The CVSS score, active exploitation, and architectural blast radius (credential aggregation for 100+ providers) independently justify Critical. The analysis documents the KEV non-listing as a factual note without over-interpreting it as a severity downgrade.

### Synthesis

**Final assessment:** The core incident characterization is sound. CVE-2026-42208 is a genuine pre-authentication Critical SQLi vulnerability actively exploited in the wild, and the 36-hour advisory-database-to-exploitation gap is a documented, reproducible pattern (paralleling Langflow's 20-hour gap) that constitutes the operationally important lesson. Two editorial adjustments improve precision:

- The "Supply Chain Compromise" category is retained as a secondary category with the established consequence-characterization qualifier, consistent with AAGF-2026-052's precedent. The researcher_notes entry is essential and must be published.
- The pattern group classification is retained with the caveat documented in researcher_notes. A future Batch 15 follow-on could establish a new `ai-gateway-security-crisis` pattern group if additional incidents accumulate on API gateway platforms; LiteLLM's two incidents could seed it. For now, the growth-first-culture evidence warrants the existing group membership.

The CISA KEV non-listing is documented as a factual observation. The appropriate inference is not "this incident is less severe" but "CISA's KEV criteria may respond to confirmed impact evidence rather than structural risk characterization." Operators should treat the architectural risk as sufficient grounds for patching and credential rotation.

**Confidence level:** High — the technical mechanism is well-documented by BishopFox, the in-the-wild exploitation telemetry is authoritative (Sysdig), and the editorial classifications are consistent with established database precedents. The primary uncertainty is the true scope of exploitation beyond Sysdig's visibility window.

**Unresolved uncertainties:**
- Whether deployments outside Sysdig's visibility were successfully exfiltrated — this matters for the actual_vs_potential characterization and cannot be resolved without forensic data from affected organizations
- Total count of internet-facing unpatched deployments during the exploitation window — relevant for quantitative damage estimation; no Shodan scan data published
- Whether CISA KEV non-listing reflects a principled severity judgment or a backlog artifact — relevant for regulatory guidance framing; cannot be resolved without CISA communication

---

## Key Takeaways

1. **Advisory database indexing is the exploitation trigger, not patch release.** CVE-2026-42208 was patched 6 days before exploitation began. Exploitation began 36 hours after the GitHub Advisory Database globally indexed the advisory. This is the same pattern observed in Langflow (20-hour gap). Operators must treat GHAD indexing events for CVSS 9+ AI infrastructure dependencies as same-day-patch requirements — the traditional 30-day patch SLA is an order of magnitude too slow for this threat class.

2. **Error-handling paths are authentication surfaces.** The vulnerability was reachable because the error handler received an unsanitized bearer token that the main authentication path had rejected. Any code path reachable with user-controlled input — regardless of whether it is the "happy path" — must be treated as a potential injection surface. Threat models should explicitly enumerate error handlers, failure hooks, and observability code paths as user-input-reachable.

3. **AI gateway credential concentrators have asymmetric blast radius.** A SQLi vulnerability in a conventional web application database might yield user records or application data. The identical vulnerability in LiteLLM Proxy yields every upstream LLM provider credential the organization has ever configured — plus the PostgreSQL DSN for direct database access. The AI infrastructure role of the target amplifies the blast radius non-linearly. Security investment should reflect this asymmetry: AI gateways storing upstream provider credentials require the same scrutiny as identity providers and secret stores.

4. **Patch does not substitute for credential rotation after an exploitation window.** Upgrading to v1.83.7 closes the vulnerability but does not revoke credentials an attacker may have extracted during the 8-day window (April 18–26). Organizations running affected versions during that window should rotate all upstream provider credentials — including AWS Bedrock IAM keys — regardless of whether they have forensic evidence of exploitation. The exploitation window was acute, and most self-hosted LiteLLM operators do not have Sysdig-equivalent telemetry to confirm or deny targeted access.

5. **Growth-first AI infrastructure platforms accumulate compounding security debt.** CVE-2026-42208 is LiteLLM's second major security crisis in 2026 (after AAGF-2026-009's supply chain compromise). Parameterized queries are a 25-year-old solved problem documented in every secure coding standard. Their absence in an error-handling path of a 45,000-star AI gateway is not a sophisticated failure — it is a growth-first development culture that did not make security-by-default a requirement. Organizations evaluating AI gateway dependencies should weight their vendor's security engineering maturity at least as heavily as their feature velocity and ecosystem breadth.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| BishopFox CVE-2026-42208 Advisory | https://bishopfox.com/blog/cve-2026-42208-litellm | 2026-04-26 | High — independent technical analysis with PoC; most authoritative on vulnerability mechanism |
| Sysdig In-the-Wild Exploitation Report | https://sysdig.com/blog/cve-2026-42208-litellm-sqli-in-the-wild | 2026-04-26 | High — primary source for attacker telemetry, IP data, and no-confirmed-exfiltration characterization |
| GitHub Security Advisory GHSA (LiteLLM) | https://github.com/BerriAI/litellm/security/advisories | 2026-04-20 | High — vendor-published coordinated disclosure; understated severity |
| NVD CVE-2026-42208 | https://nvd.nist.gov/vuln/detail/CVE-2026-42208 | 2026-04-24 | High — authoritative CVSS scoring and CWE classification |
| LiteLLM Vendor Blog Advisory | https://blog.litellm.ai/cve-2026-42208 | 2026-04-20 | Medium — primary vendor source; minimizes severity; "could potentially result in unintended database access" framing |
| CCB Belgium Advisory | https://ccb.belgium.be/en/advisory | 2026-04-26 | Medium — government advisory; no independent technical analysis |
