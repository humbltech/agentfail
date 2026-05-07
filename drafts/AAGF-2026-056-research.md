# AAGF-2026-056 Research Notes
## CVE-2026-42208 — Pre-Authentication SQL Injection in LiteLLM Proxy (AI Gateway Credential Exfiltration)

---

## Source URLs Consulted

1. **Primary — BishopFox (technical discovery writeup):** https://bishopfox.com/blog/cve-2026-42208-pre-authentication-sql-injection-in-litellm-proxy
2. **Primary — Sysdig Threat Research Team (in-the-wild exploitation telemetry):** https://www.sysdig.com/blog/cve-2026-42208-targeted-sql-injection-against-litellms-authentication-path-discovered-36-hours-following-vulnerability-disclosure
3. The Hacker News: https://thehackernews.com/2026/04/litellm-cve-2026-42208-sql-injection.html
4. BleepingComputer: https://www.bleepingcomputer.com/news/security/hackers-are-exploiting-a-critical-litellm-pre-auth-sqli-flaw/
5. Security Affairs: https://securityaffairs.com/191483/hacking/cve-2026-42208-litellm-bug-exploited-36-hours-after-its-disclosure.html
6. LiteLLM vendor advisory: https://docs.litellm.ai/blog/cve-2026-42208-litellm-proxy-sql-injection
7. Penligent (AI gateway credential problem analysis): https://www.penligent.ai/hackinglabs/cve-2026-42208-litellm-sql-injection-and-the-ai-gateway-credential-problem/
8. Centre for Cybersecurity Belgium (CCB advisory): https://ccb.belgium.be/advisories/warning-litellm-pre-auth-sql-injection-cve-2026-42208-patch-immediately
9. GitHub Security Advisory: GHSA-r75f-5x8p-qvmc
10. Indusface: https://www.indusface.com/blog/cve-2026-42208-pre-authentication-sql-injection-in-litellm/
11. Security Boulevard: https://securityboulevard.com/2026/05/cve-2026-42208-pre-authentication-sql-injection-in-litellm-exposes-api-credentials/ (403 on fetch — excluded from direct extraction)

---

## Source Bias Notes

- **BishopFox**: Security firm that confirmed and reproduced the vulnerability (Nate Robb, Senior Operator). They did NOT discover it (credit goes to Tencent YunDing Security Lab per GHSA) but they produced the most technically rigorous writeup. Commercial interest in publishing findings (thought leadership / service marketing). Technically authoritative on the exploitation mechanism.
- **Sysdig Threat Research Team**: Observed in-the-wild exploitation against customer telemetry. Authoritative on attacker behavior, timing, and what data was (not) exfiltrated. Their commercial product (Falco/Sysdig cloud security) benefits from publicizing the threat. Data appears unmanipulated — they specifically note no confirmed exfiltration was observed.
- **LiteLLM vendor advisory**: Minimizes severity with hedged language ("could potentially result in unintended database access"). Does not credit discoverer. Does not mention CISA. Recommends v1.83.10-stable (more conservative than minimum fix version). Vendor advisory is the least informative source.
- **THN / BleepingComputer / SecurityAffairs**: Trade press, secondary sources aggregating BishopFox and Sysdig. Reliable on high-level timeline and impact framing. Minor timeline discrepancies between outlets (see below).
- **CCB Belgium**: Government advisory, confirms criticality, no new technical detail.

---

## Key Dates

| Event | Date / Time | Source |
|-------|-------------|--------|
| Vulnerability first introduced (version 1.81.16 released) | Not pinned to a calendar date in any source | GHSA |
| Vulnerability discovered by Tencent YunDing Security Lab | Not publicly disclosed (pre-patch coordinated disclosure) | GHSA attribution |
| Patch released (v1.83.7-stable) | April 18–19, 2026 (sources conflict by 1 day; see note) | BishopFox / Sysdig / THN |
| GitHub repository advisory published (GHSA-r75f-5x8p-qvmc) | April 20, 2026, 21:14 UTC | Sysdig |
| Advisory indexed in GitHub Advisory Database (global propagation) | April 24, 2026, 16:17 UTC | Sysdig |
| **date_reported (first effective public disclosure):** | **April 24, 2026** | GitHub Advisory Database |
| First exploitation observed (Sysdig telemetry, IP 65.111.27.132) | April 26, 2026, 04:24 UTC | Sysdig |
| Second attacker IP observed (65.111.25.67, refined enumeration) | April 26, 2026, later same day | Sysdig |
| BishopFox blog post published | ~April 25–28, 2026 (not pinned exactly) | BishopFox |
| THN article published | ~April 28, 2026 | THN |
| BleepingComputer article published | ~April 28, 2026 | BleepingComputer |

**date_occurred (first confirmed exploitation):** April 26, 2026
**date_discovered (Tencent YunDing internal report):** Unknown — pre-patch, coordinated disclosure, exact date not public
**date_reported (first public disclosure):** April 24, 2026 (GitHub Advisory Database global indexing)

### Patch vs. Exploit Gap — Timeline Reconciliation

The "36 hours" figure is accurate when measured from the global database indexing event (April 24, 16:17 UTC) to first exploitation (April 26, 04:24 UTC) = 36 hours, 7 minutes. However:

- The GitHub repository advisory was actually published ~4 days earlier (April 20, 21:14 UTC)
- The patch itself was released April 18–19, 2026 — up to 6 days before exploitation

This is the key narrative nuance: the patch was already available for nearly a week before exploitation began. The "36-hour window" is specifically the gap between when the advisory became searchable in the GitHub Advisory Database (triggering automated CVE scanners and attacker tooling) and first exploitation. The earlier patch/advisory publication did not trigger immediate exploitation — the global database indexing did.

**Patch date discrepancy across sources:** THN and SecurityAffairs both say "April 19, 2026." BishopFox says "April 18, 2026." The 1-day difference likely reflects UTC vs. local timezone of the tag. Use "April 18–19, 2026" for safety.

---

## Vulnerability Technical Details

### What Is LiteLLM?

LiteLLM is an open-source AI gateway (proxy) that routes requests to 100+ LLM providers (OpenAI, Anthropic, AWS Bedrock, Azure OpenAI, Google Gemini, etc.) through a unified API. It aggregates all provider API keys in its database. 45,000+ GitHub stars, 7,600+ forks. Widely deployed as an enterprise AI API management layer.

**Security significance:** A single LiteLLM compromise gives an attacker every LLM provider credential stored in that instance — all providers, all keys, in one query. It is structurally equivalent to a VPN or SSO broker in its credential aggregation role.

### CVE-2026-42208 — Vulnerability Mechanism

**CVE ID:** CVE-2026-42208
**GitHub Advisory:** GHSA-r75f-5x8p-qvmc
**CWE:** CWE-89 (SQL Injection)
**CVSS v4 Score:** 9.3 (Critical)
**Authentication Required:** None (pre-authentication)
**Affected Versions:** LiteLLM Proxy >= 1.81.16, < 1.83.7
**Fixed Version:** 1.83.7 (LiteLLM vendor recommends 1.83.10-stable)

**Discoverer:** Tencent YunDing Security Lab (per GHSA credit)
**Confirmed/Reproduced By:** Nate Robb, Senior Operator, BishopFox

### Injection Vector

**Endpoint:** Any LLM API route — `/v1/chat/completions`, `/v1/completions`, `/v1/messages`, `/v1/embeddings`, etc.

**Parameter:** `Authorization: Bearer <value>` HTTP header

**Root Cause:** In `litellm/proxy/utils.py`, the `PrismaClient.get_data()` function used f-string interpolation to construct SQL queries:

```sql
-- Vulnerable (f-string):
WHERE v.token = '{token}'

-- Fixed (parameterized):
WHERE v.token = $1
```

The caller-supplied bearer token was concatenated directly into query text instead of passed as a bound parameter. The patch replaces f-string interpolation with parameterized queries and converts deprecated-token lookups to Prisma's typed `find_first()` API, fixing the injection at the sink regardless of which code path reaches it.

### Error-Handling Path — The Architectural Flaw

The injection is reachable via two distinct code paths, which is what makes it pre-auth:

**Path A (PYTHONOPTIMIZE):** When LiteLLM runs with `-O` or `PYTHONOPTIMIZE=1`, Python strips `assert` statements. This causes a silent assertion failure in token validation that routes execution to the vulnerable query.

**Path B (generic exception handler):** The attacker supplies a bearer token that lacks the `sk-` prefix. This bypasses `_hash_token_if_needed()`, so the raw malicious string is passed unsanitized. An `AssertionError` is caught by an outer `except Exception` clause that dispatches to `UserAPIKeyAuthExceptionHandler._handle_authentication_error()`. This triggers a metadata enrichment callback (`_ProxyDBLogger.async_post_call_failure_hook()`) that reaches the vulnerable query with the unsanitized token string.

**Key architectural insight:** The SQL injection is in the *error-handling path*, not the happy path. The vulnerable query runs when authentication *fails*, not when it succeeds. This is what enables pre-auth exploitation — authentication never needs to succeed.

### SQL Injection Type

**UNION-based injection.** Sysdig observed payloads like:

```
sk-litellm' UNION SELECT api_key,NULL,NULL,NULL,NULL FROM "LiteLLM_VerificationToken"--
```

BishopFox confirmed timing-based blind injection also works:

```bash
# PoC — time-based blind (6-second sleep on vulnerable host):
curl -X POST https://TARGET/v1/chat/completions \
  -H "Authorization: Bearer ' OR (SELECT pg_sleep(6)) IS NULL --" \
  -H "Content-Type: application/json" \
  -d '{"model":"x","messages":[{"role":"user","content":"x"}]}'

# Patched host responds in <100ms; vulnerable host responds in ~6s
```

The observed attacker demonstrated UNION-based extraction targeting specific tables by name, with a column-count discovery sweep first (indicating familiarity with the schema structure).

### Database Tables Targeted

**Sources differ slightly on table names — reconciled here:**

| Table Name | Contents | Source |
|-----------|----------|--------|
| `LiteLLM_VerificationToken` | Virtual API key hashes, team bindings, budget caps, master key | BishopFox |
| `litellm_credentials` / `litellm_credentials.credential_values` | Upstream provider API keys (OpenAI, Anthropic, Bedrock, etc.) | THN / Sysdig |
| `litellm_config` | Proxy runtime environment variables (includes PostgreSQL DSN) | THN / Sysdig |
| `LiteLLM_TeamTable` | Team-level configuration | BishopFox |
| `LiteLLM_BudgetTable` | Budget tracking | BishopFox |
| `LiteLLM_OrganizationTable` | Organization-level data | BishopFox |

**Attacker targeting priority (from Sysdig telemetry):** The threat actor went directly to `LiteLLM_VerificationToken` → `litellm_credentials` → `litellm_config`, skipping user/team tables. This demonstrates pre-existing schema knowledge, not generic SQLmap probing.

**Note on virtual key storage:** Virtual keys in `LiteLLM_VerificationToken` are stored as SHA-256 hashes, so UNION-based extraction of the hash column does not directly yield the plaintext key. However, metadata (key aliases, owner, team bindings, budget caps) is stored in plaintext alongside the hash. The upstream provider credentials in `litellm_credentials.credential_values` are the higher-value target — these contain actual OpenAI org keys, Anthropic workspace admin keys, and AWS Bedrock IAM credentials in extractable form.

**Credentials at risk (per THN):** OpenAI organization keys with five-figure monthly spend caps; Anthropic console keys with workspace admin rights; AWS Bedrock IAM credentials.

---

## Exploitation In The Wild

### Attacker Profile (Sysdig Telemetry)

- **IP 1:** 65.111.27.132 — Phase 1: schema enumeration and column-count discovery
- **IP 2:** 65.111.25.67 — Phase 2: refined UNION-based extraction attempts
- **ASN:** AS200373 (3xK Tech GmbH, Germany) — both IPs in adjacent /22 blocks, consistent with single operator rotating egress between requests
- **User-Agent:** `Python/3.12 aiohttp/3.9.1` — identical across both IPs, confirming single operator
- **Attribution:** Unknown threat actor, no group claimed

### What the Attacker Did

1. Column-count discovery sweep against auth-failure path
2. Correct PascalCase table identifier usage after lowercase queries failed — indicating schema foreknowledge
3. UNION-based extraction targeting `LiteLLM_VerificationToken` first
4. Follow-up unauthenticated probes against `/key/generate` and `/key/info` endpoints from the second IP

### What the Attacker Did NOT Do (Confirmed Non-Events)

- No authenticated calls using exfiltrated keys were observed
- No virtual-key minting via `/key/generate`
- No chained reuse of provider credentials against OpenAI/Anthropic APIs
- No confirmed successful data exfiltration (schema enumeration was observed; extraction success unconfirmed)

**Sysdig conclusion:** "Deliberate, and likely customized, enumeration of the production LiteLLM schema" rather than a generic automated SQLmap spray. The attacker targeted the three highest-value tables and demonstrated schema knowledge that is not in public documentation.

---

## Impact Assessment

### Confirmed Impact
- Active exploitation observed against real LiteLLM Proxy deployments within 36 hours of advisory publication
- Schema enumeration confirmed; data exfiltration unconfirmed (no follow-through observed)
- No confirmed credential theft, no confirmed downstream LLM API abuse

### Potential Impact (Had Exploitation Succeeded)
- Full extraction of all upstream LLM provider credentials stored in the proxy database
- OpenAI org-level API keys → financial damage (model costs billed to victim), model theft, data exfiltration via LLM queries
- Anthropic workspace admin keys → workspace-level access (billing, usage, team management)
- AWS Bedrock IAM credentials → lateral movement into AWS environment (S3, EC2, etc. — far beyond LLM access)
- PostgreSQL connection string in `litellm_config` → direct database access, bypassing the LiteLLM layer entirely
- Virtual master key extraction (even hashed) → potential offline cracking for high-value targets

### Scale of Exposure
- **Installed base:** No authoritative count of vulnerable internet-facing deployments published. LiteLLM has 45,000+ GitHub stars and 7,600+ forks but these do not map to deployed Proxy instances. No Shodan scan count available in any source.
- **Architectural amplification:** LiteLLM is a credentials aggregator by design. One compromised instance = all providers' keys in one query. This is structurally worse than a per-provider credential leak.

### Comparison to AAGF-2026-009 (LiteLLM Supply Chain)
| Dimension | AAGF-2026-009 | AAGF-2026-056 |
|-----------|---------------|---------------|
| Attack vector | Malicious PyPI package via compromised Trivy CI/CD | Direct HTTP request to LiteLLM Proxy |
| Authentication required | None (passive, runs on install) | None (pre-auth HTTP) |
| Root cause | Supply chain compromise | SQL injection / missing parameterized queries |
| Credentials targeted | LiteLLM package users (developer machines, CI) | LiteLLM Proxy deployments (production AI gateways) |
| Scope of exposure | Anyone who `pip install`d during compromise window | Any internet-facing LiteLLM Proxy v1.81.16–1.83.6 |
| Confirmed data theft | Yes (reported) | No (enumeration only observed) |
| Patch path | Package version update | Proxy software version update |

---

## Vendor Response

### LiteLLM Team
- Patch released (v1.83.7-stable) before advisory was publicly indexed — coordinated disclosure with Tencent YunDing Security Lab
- Vendor advisory published at: https://docs.litellm.ai/blog/cve-2026-42208-litellm-proxy-sql-injection
- Advisory language minimizes severity: "could potentially result in unintended database access" — understated for a pre-auth SQLi targeting production credential stores
- Does not name the discoverer in the advisory text
- Does not reference CISA KEV
- Recommends v1.83.10-stable (more conservative than minimum fix of 1.83.7)
- Provides a Postgres query for operators to audit their query history for signs of exploitation

### BishopFox
- Reproduced and published detailed technical writeup: https://bishopfox.com/blog/cve-2026-42208-pre-authentication-sql-injection-in-litellm-proxy
- Provided PoC curl command demonstrating time-based blind injection
- Recommended interim mitigations: `disable_error_logs: true`, WAF rule rejecting bearers not matching `^sk-[A-Za-z0-9_-]+$`, per-endpoint p99 latency monitoring on auth-failure paths
- Key post-patch remediation: rotate all virtual keys active during the vulnerable window

### CISA KEV
- **Not listed in CISA Known Exploited Vulnerabilities catalog** as of publication of all source articles (late April / early May 2026)
- Notably, the similar Langflow CVE-2026-33017 (AAGF-2026-052) was added to KEV within ~8 days of exploitation; LiteLLM has not received the same treatment despite confirmed active exploitation — possible because no confirmed data theft was documented

### CCB Belgium (Centre for Cybersecurity Belgium)
- Published a government advisory warning operators to patch immediately: https://ccb.belgium.be/advisories/warning-litellm-pre-auth-sql-injection-cve-2026-42208-patch-immediately
- Confirms Critical severity, no new technical detail

---

## Open Questions (Unresolved)

1. **Were real LLM credentials confirmed stolen?** Current evidence: schema enumeration observed, no authenticated follow-through observed. Sysdig explicitly states no exfiltration confirmed. However, absence of evidence is not evidence of absence — other deployments may have been hit without Sysdig visibility.

2. **CISA KEV?** Not listed as of reporting. If CISA adds it after this research, update incident record.

3. **Total installed base of affected deployments?** Not quantified in any source. No Shodan/FOFA scan counts published. This is a significant gap — the actual attack surface is unknown.

4. **Exact discovery date by Tencent YunDing?** GHSA credits them but no date for initial report to LiteLLM team is public.

5. **Were other threat actors active beyond the two IPs Sysdig observed?** Sysdig's telemetry is limited to their customer deployments. Other exploitation attempts likely occurred without being captured.

6. **Was a public PoC published before the observed exploitation?** BishopFox's blog appears to post-date the April 26 exploitation. The attacker's schema foreknowledge suggests either independent vulnerability research or a non-public PoC circulating in threat actor channels.

---

## Classification Assessment

### Categories
- **Primary:** Unauthorized Data Access (pre-auth SQLi targeting credential store)
- **Secondary:** AI Infrastructure Compromise (LLM gateway as high-value credential aggregator)
- **Pattern:** Classic SQL injection but with uniquely high impact due to the credential aggregation architectural role of LiteLLM Proxy

### Severity
- **Critical** — CVSS 9.3, pre-auth, actively exploited, targets production AI infrastructure credential stores

### Pattern Group
- Extends: `supply-chain-ai-infrastructure` (established by AAGF-2026-009)
- New pattern element: AI gateway as attack surface (separate from supply chain — direct software vulnerability)
- Related: AAGF-2026-009 (LiteLLM supply chain via Trivy CI/CD), AAGF-2026-052 (Langflow serial CVEs, similar rapid exploitation timeline)

### Failure Mode Tags
- `missing-parameterized-queries` — direct string interpolation in SQL
- `error-path-injection` — vulnerability in exception handler, not happy path
- `credential-aggregator-targeting` — attacker specifically targets AI gateway's role as a multi-provider credential store
- `rapid-exploitation` — 36 hours from global advisory indexing to first observed attack

### 5 Whys Preview (for pipeline Stage 2)

1. **Why did the SQLi exist?** F-string interpolation used instead of parameterized queries in `PrismaClient.get_data()`
2. **Why was the vulnerable code in the error-handling path?** Exception handlers often receive less security scrutiny than happy-path code; the `except Exception` catch-all masked the control flow reaching the SQL sink
3. **Why was LiteLLM's database targeted specifically?** It is a credential aggregator by design — one successful query yields all providers' keys
4. **Why did exploitation occur 36 hours after advisory indexing?** The GitHub Advisory Database is monitored by automated tooling (both defensive and offensive); indexing creates an immediate signal for attackers with pre-built scanning infrastructure
5. **Why was no data exfiltration confirmed?** Unknown — possibly the attacker was performing reconnaissance for a later operation, possibly defensive monitoring interrupted the attack, possibly the UNION-based extraction was unsuccessful against the specific schema encountered

---

## Key Narrative for Incident Record

The 36-hour exploitation gap is the headline, but the correct framing is: the patch existed for nearly a week before exploitation began. The trigger was not the patch — it was the advisory database indexing. This is a documented pattern (see also AAGF-2026-052 Langflow at 20 hours). Attackers are monitoring the GitHub Advisory Database as a near-real-time attack surface discovery feed.

The deeper story is architectural: LiteLLM Proxy is a credential concentrator. Every organization that routes multi-provider LLM traffic through a single LiteLLM instance has created a single point of credential failure. A pre-auth SQLi in this component is categorically more damaging than the same vulnerability in an application database, because the LiteLLM database contains the keys to the LLM kingdom — including cloud IAM credentials (Bedrock) that provide far broader access than just LLM APIs.

This is also the second major LiteLLM security incident in 2026 (after AAGF-2026-009 supply chain). The pattern of two critical vulnerabilities in rapid succession against the same AI infrastructure component warrants attention to whether LiteLLM's security posture is adequate for its role as an enterprise AI gateway.
