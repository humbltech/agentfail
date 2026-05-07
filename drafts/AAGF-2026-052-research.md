# AAGF-2026-052 Research Notes
## CVE-2026-33017 — Langflow Unauthenticated RCE via Public Flow Build Endpoint

---

## Source URLs Consulted

1. **Primary** — Sysdig Threat Research Team: https://www.sysdig.com/blog/cve-2026-33017-how-attackers-compromised-langflow-ai-pipelines-in-20-hours
2. Anavem News summary: https://www.anavem.com/en/news/cybersecurity/langflow-cve-2026-33017-exploited-20-hours-after-disclosure
3. Aviral Srivastava (discoverer) on Medium: https://medium.com/@aviral23/cve-2026-33017-how-i-found-an-unauthenticated-rce-in-langflow-by-reading-the-code-they-already-dc96cdce5896
4. Barrack AI technical writeup (CVE-2025-3248 vs CVE-2026-33017 comparison): https://blog.barrack.ai/langflow-exec-rce-cve-2026-33017/
5. SecurityWeek coverage: https://www.securityweek.com/critical-langflow-vulnerability-exploited-hours-after-public-disclosure/
6. JFrog Security Research (patch gap disclosure): https://research.jfrog.com/post/langflow-latest-version-was-not-fixed/
7. RunZero detection guide: https://www.runzero.com/blog/langflow/
8. CSO Online / CISA KEV addition: https://www.csoonline.com/article/4151203/attackers-exploit-critical-langflow-rce-within-hours-as-cisa-sounds-alarm.html
9. The Hacker News (prior CVE-2025-3248 CISA KEV): https://thehackernews.com/2025/05/critical-langflow-flaw-added-to-cisa.html
10. Security Affairs (CISA KEV): https://securityaffairs.com/190018/security/u-s-cisa-adds-a-langflow-flaw-to-its-known-exploited-vulnerabilities-catalog.html
11. TheCyberThrone (CISA KEV date + Trivy): https://thecyberthrone.in/2026/03/27/cisa-adds-langflow-and-trivy-bugs-to-kev-catalog/
12. Help Net Security (CISA KEV + Trivy companion incident): https://www.helpnetsecurity.com/2026/03/27/cve-2026-33017-cve-2026-33634-exploited/
13. Cloud Security Alliance Labs: https://labs.cloudsecurityalliance.org/research/csa-research-note-langflow-cve-2026-33017-ai-pipeline-exploi/
14. Infosecurity Magazine: https://www.infosecurity-magazine.com/news/hackers-exploit-critical-langflow/
15. DailyCVE entry: https://dailycve.com/langflow-code-injection-rce-cve-2026-33017-critical/
16. SecurityOnline.info: https://securityonline.info/critical-langflow-vulnerabilities-rce-file-write-cve-2026-33017/
17. Wiz vulnerability database: https://www.wiz.io/vulnerability-database/cve/cve-2026-33017

---

## Key Dates

| Event | Date | Source |
|-------|------|--------|
| Vulnerability initially reported (responsible disclosure) | February 25, 2026 | Aviral Srivastava / Medium |
| Fix merged (PR #12160, commit `73b6612`) | March 10, 2026 | Barrack AI |
| GitHub security advisory published (GHSA-vwmf-pq79-vjvx) | March 17, 2026, ~20:05 UTC | Sysdig / Medium |
| CVE-2026-33017 formally assigned | March 17, 2026 | Medium / Sysdig |
| **date_reported (first public disclosure):** | **March 17, 2026** | GitHub advisory |
| First exploitation observed in wild | March 18, 2026, ~16:04 UTC (≈20 hours post-advisory) | Sysdig honeypot |
| First successful credential exfiltration | March 18, 2026, ~20:55 UTC (≈25 hours post-advisory) | Sysdig |
| Sysdig blog post published | March 19, 2026 | Sysdig |
| Langflow v1.9.0 released (true fix) | ~March 20, 2026 (concurrent with or shortly after advisory) | SecurityWeek, Sysdig |
| CISA adds CVE-2026-33017 to KEV | March 25, 2026 | TheCyberThrone, Help Net Security, SecurityAffairs |
| Federal remediation deadline (US agencies) | April 8, 2026 | CISA |

**date_occurred (exploitation in the wild):** March 18, 2026
**date_discovered (responsible disclosure / internal fix):** February 25, 2026 (researcher report); March 10, 2026 (fix merged)
**date_reported (first public disclosure):** March 17, 2026 (GitHub advisory GHSA-vwmf-pq79-vjvx)

**Note on timing discrepancy:** One source (TheCyberThrone) mentions "February 26, 2026" as the discovery date; the researcher's own Medium post says February 25, 2026. These likely refer to the same disclosure event. Use February 25, 2026 as conservative date_discovered.

---

## Vulnerability Technical Details

### What is Langflow?
Langflow is an open-source visual framework for building AI agents and RAG (Retrieval-Augmented Generation) pipelines. It enables drag-and-drop composition of AI workflows using pre-built components. It has 145,000+ GitHub stars (Sysdig claim; no independent corroboration of actual deployment count). DataStax maintains and sponsors the project.

### CVE-2026-33017 — Vulnerability Mechanism

**Type:** Unauthenticated Remote Code Execution (RCE)  
**CWE:** CWE-94 (Code Injection), CWE-95 (Eval Injection), CWE-306 (Missing Authentication for Critical Function)  
**CVSS Score:** 9.3 (CVSS v4.0 per GitHub advisory) / 10.0 (CVSS v3.1 per CSA Labs) — the discrepancy reflects different scoring frameworks, not a dispute about severity. Both classify as Critical.  
**Affected Versions:** Langflow through 1.8.1 (also reported as ≤1.8.2 in some sources; the NVD/GitHub advisory initially listed 1.8.2 as patched — see JFrog finding below)  
**Fixed Version:** 1.9.0 (confirmed fix); the `langflow-base` package fixed in v0.9.0

**Vulnerable Endpoint:**
```
POST /api/v1/build_public_tmp/{flow_id}/flow
```

This endpoint was designed by the Langflow team to allow unauthenticated users to build (run) public flows — shared chatbot links and demos. The design intent was legitimate; the flaw was implementation.

**Root Cause — The Optional `data` Parameter:**
When the optional `data` parameter is supplied in the POST body, the endpoint ignores the server-side stored flow definition and instead uses the attacker-supplied flow data. This data contains node definitions with arbitrary Python code embedded in `code` fields. The server compiles and executes this attacker-supplied code via Python's `exec()` with no sandboxing.

**Execution Chain (10 function calls from HTTP request to RCE):**
1. `start_flow_build()` receives attacker-supplied `data`
2. → `generate_flow_events()`
3. → `create_graph()`
4. → `build_graph_from_data()`
5. → `Graph.from_payload()` parses malicious nodes
6. → `add_nodes_and_edges()`
7. → `_instantiate_components_in_vertices()`
8. → `vertex.instantiate_component()` extracts `code` field
9. → `eval_custom_component_code()` → `create_class()` → `prepare_global_scope()`
10. → **`exec(compiled_code, exec_globals)`** at line 397 of `validate.py`

> "No sandbox. No restrictions on imports. Full access to the Python runtime." — Aviral Srivastava (discoverer)

**Critical design subtlety:** `ast.Assign` nodes execute during *graph building*, before the flow ever runs. An attacker payload like `_x = os.system("id")` is an assignment statement — it executes at instantiation time, not flow execution time.

**The `AUTO_LOGIN=true` amplifier:**
When `AUTO_LOGIN=true` (which is the default Langflow configuration), an attacker does not even need a valid `flow_id`. They can call `/api/v1/auto_login` to obtain a superuser token, create a public flow themselves, then exploit the RCE via that flow's UUID. This removes the only prerequisite for exploitation in default installations.

**No sandbox whatsoever:** The code executes with full Python interpreter access — arbitrary imports, filesystem reads, network calls, subprocess spawning.

### Why This Is a Repeat Failure (CVE-2025-3248 Comparison)

| Aspect | CVE-2025-3248 | CVE-2026-33017 |
|--------|---------------|-----------------|
| CVSS | 9.8 (v3.1) | 9.3 (v4.0) / 10.0 (v3.1) |
| Endpoint | `/api/v1/validate/code` | `/api/v1/build_public_tmp/{flow_id}/flow` |
| Auth required? | No (bypassed via missing auth) | No (endpoint unauthenticated by design) |
| Fix method | Authentication added | `data` parameter removed entirely |
| Root cause | Same `exec()` pipeline | Same `exec()` pipeline |
| CISA KEV | Added May 5, 2025 | Added March 25, 2026 |

> "Nobody audited the other endpoints that fed user input into the same `exec()` pipeline." — Barrack AI

This is Langflow's **fourth documented RCE in ~12 months** (per CSA Labs). The architectural root cause — unsandboxed `exec()` used as a design primitive for custom components — was not addressed after CVE-2025-3248; the patch only added authentication to one endpoint while the underlying execution model remained exploitable.

### The JFrog Patch Gap (Critical)

JFrog Security Research found that Langflow v1.8.2 — initially reported by NVD and the GitHub advisory system as the patched version — **was still vulnerable** to CVE-2026-33017. JFrog validated this using a publicly available PoC against both PyPI and Docker installations.

The true fixed version is **1.9.0**. This gap meant organizations that upgraded to 1.8.2 believing they were protected remained exposed during the active exploitation window. The advisory databases were later corrected.

---

## Exploitation in the Wild

### Timeline (Sysdig Honeypot — 48-Hour Observation Window)

**Hour 0** (March 17, ~20:05 UTC): GitHub advisory GHSA-vwmf-pq79-vjvx published. No public PoC exists.

**Hour ~20** (March 18, ~16:04 UTC): First exploitation attempt observed. Attackers built working exploits from advisory text alone, with no PoC code available.

**Phase 1 (Hours 20–21) — Automated Mass Scanning:**
- Automated scanning using nuclei templates
- `interactsh` callback servers used to detect vulnerable instances (OOB exfiltration)
- Observed payload: `_r = __import__('os').popen('id').read()`
- Base64-encoded output exfiltrated to attacker callback servers

**Phase 2 (Hours 21–24) — Reconnaissance:**
- Custom Python exploit scripts
- Directory listing (`ls`, `find`)
- Credential file enumeration (`/etc/passwd`, `.env`, config directories)

**Phase 3 (Hours 24–30) — Credential Harvesting:**
- Targeted collection of environment variables, database configs, `.env` files
- API keys specifically harvested: OpenAI, Anthropic, AWS, database connections
- Stage-2 dropper infrastructure observed being prepared on attacker-controlled servers *before* confirming vulnerable targets (indicating pre-planned campaign)

**Attacker Infrastructure:**
- 6 unique source IPs across the 48-hour observation window
- C2 servers: `143.110.183.86:8080` and `173.212.205.251:8443`
- Overlapping C&C infrastructure across multiple actors suggests either coordinated operators or shared toolkits/marketplaces

### Prerequisites for Exploitation
- Network access to a Langflow instance (default: port 7860, though varies)
- A valid `flow_id` for a public flow (discoverable via shared chatbot links, public demos) — **OR** no prerequisite at all if `AUTO_LOGIN=true` (default)
- No credentials, no authentication tokens required
- Single HTTP POST request achieves RCE

---

## Impact Assessment

### Exposed Instances
- **Sysdig claim:** "145,000+ GitHub stars translate to a large number of exposed instances" — this is a proxy metric, not a direct count of exposed internet-facing instances. No Shodan/Censys scan data citing a specific number was found in coverage.
- **RunZero:** Provides detection queries for customer infrastructure; no public internet-wide scan numbers published.
- **Independent verification:** No third-party source independently counted exposed instances. The 145,000 GitHub stars claim is unverifiable as a deployment metric.
- **Context:** Langflow instances are commonly deployed as internal tools, cloud-hosted demos, and production AI backends. The public flow feature (the vulnerable surface) is enabled by default for demo/sharing purposes.

### Data at Risk Per Compromised Instance
Langflow instances are typically configured as AI workflow hubs, connecting to:
- OpenAI, Anthropic, and other LLM provider API keys
- AWS credentials and cloud tokens
- Database connection strings (PostgreSQL, MongoDB, vector DBs)
- OAuth tokens for downstream integrations
- RAG pipeline document stores (potentially containing proprietary documents)

A compromised Langflow instance is a gateway to an organization's *entire AI infrastructure stack*, not just the Langflow data.

### Software Supply Chain Angle
The Barrack AI analysis notes the potential for **supply chain compromise**: if an attacker can execute code in a Langflow instance integrated into CI/CD or software build pipelines, downstream artifacts could be compromised.

### CISA KEV Status
**YES — Added March 25, 2026.** Federal agencies were mandated to remediate by April 8, 2026 (14-day deadline, unusually short, reflecting confirmed active exploitation).

### Companion Incident (Same KEV Batch)
CVE-2026-33634 (Trivy supply chain compromise by TeamPCP) was added to CISA KEV on March 26, 2026, with an April 9, 2026 deadline. This is a separate but temporally adjacent incident affecting AI tooling infrastructure (LiteLLM, present in 36% of monitored cloud environments per Help Net Security).

### Industries / Sectors Affected
No industry breakdown in public reporting. Langflow's user base spans:
- AI startups and developers (primary)
- Enterprise AI teams
- Research institutions
- Government/public sector (implied by CISA concern)

### Documented Financial Impact
No specific financial losses publicly reported. The nature of the attack (credential theft for lateral movement) means financial damage likely manifested through secondary incidents (cloud bill fraud, data breach costs) rather than direct losses attributable to this CVE.

---

## Vendor Response

### Discoverer
Aviral Srivastava — independent security researcher. Discovered the flaw by reading the diff/changelog from the CVE-2025-3248 fix, which led him to audit other endpoints using the same `exec()` pipeline.

### Timeline
- **February 25, 2026:** Researcher reports vulnerability to Langflow/DataStax
- **March 10, 2026:** Langflow team acknowledges and merges fix (PR #12160, commit `73b6612`). The fix removes the `data` parameter from the public endpoint, forcing reliance on server-side stored flow definitions.
- **March 17, 2026:** GitHub security advisory published (coordinated disclosure)
- **~March 20, 2026:** Langflow v1.9.0 released as the true fixed version

### Patch Quality Issues
- v1.8.2 was initially listed as patched in NVD and GitHub advisory system but **remained vulnerable** (JFrog finding)
- Advisory databases were later corrected after JFrog's disclosure
- This created a false-security window during active exploitation

### DataStax / Official Langflow Statement
No dedicated public vendor advisory beyond the GitHub security advisory (GHSA-vwmf-pq79-vjvx) was found in research. No DataStax press statement or security blog post identified.

### Fix Design
PR #12160 removed the `data` parameter acceptance from the public endpoint. This is a correct fix (the parameter should never have accepted attacker-supplied flow definitions), but it does not address the underlying architectural issue: the `exec()` pipeline with no sandboxing remains in authenticated endpoints, deferring rather than eliminating the risk surface.

---

## Source Bias Notes

### Sysdig as Primary Source
- Sysdig is both the threat researcher AND the vendor selling cloud security products (Sysdig Secure). The honeypot campaign and 48-hour attack timeline are primary Sysdig findings.
- **Claims requiring independent corroboration:**
  - "145,000+ GitHub stars translate to a large number of exposed instances" — GitHub star count is verifiable; the inference about deployment scale is not
  - 6 unique attacker IPs across 48 hours — honeypot data, single observation point
  - The three-phase attack progression narrative — based on Sysdig's own honeypot; no independent honeypot operators published corroborating data
  - C2 infrastructure IPs (143.110.183.86, 173.212.205.251) — not corroborated by third-party threat intel feeds in public reporting
- **Validated independently:**
  - CVSS 9.3 score confirmed by multiple sources
  - Patch version (1.9.0) confirmed by JFrog, RunZero, SecurityWeek
  - CISA KEV addition date (March 25, 2026) confirmed by multiple outlets
  - The basic vulnerability mechanism confirmed by independent researcher (Aviral Srivastava's blog and Barrack AI's code analysis)
  - The 20-hour exploitation timeline is corroborated by SecurityWeek, CSO Online, Infosecurity Magazine, Help Net Security — though all cite Sysdig as the original data source

### Discoverability of Vulnerability
The vulnerability was independently discovered by a researcher reading the prior patch diff. This strongly suggests that the exploit was derivable by multiple threat actors from the advisory text alone — supporting Sysdig's claim that no PoC was needed.

---

## Classification Assessment

**Category:** Infrastructure Damage, Unauthorized Data Access, (potential) Supply Chain Compromise  
**Severity:** Critical  
**Agent Type:** Tool-Using Agent, Task Automation Agent, Multi-Agent System  
**Platform:** Langflow (open-source, self-hosted)  
**Industry:** AI Infrastructure / Cross-Industry  

**actual_vs_potential:** `partial`  
- Confirmed active exploitation within 20 hours
- Credential harvesting confirmed across multiple attacker phases
- Full scope of downstream damage (lateral movement to cloud accounts, data exfiltration from connected systems) not publicly quantified
- CISA KEV addition confirms real-world exploitation, not just theoretical risk

**potential_damage:** Full RCE on all exposed Langflow instances (145,000+ GitHub stars; no direct count). Each compromised instance yields API keys for major AI providers (OpenAI, Anthropic) and cloud infrastructure (AWS). An attacker with these credentials has lateral access to an organization's entire AI stack, cloud data stores, and potentially software supply chain if Langflow is integrated into build pipelines.

**intervention:** Patch (v1.9.0) deployed within ~21 days of responsible disclosure. CISA KEV addition with 14-day federal deadline. JFrog's disclosure corrected false-patched-version metadata, closing a dangerous false-security window. However: the fix is architectural band-aid (removing the parameter), not a fundamental change to the `exec()` design.

**Failure mode classification:**
- Design-level failure: Using `exec()` without sandboxing as a core platform primitive, inheritable by any endpoint
- Process failure: Post-CVE-2025-3248 fix audited only the reported endpoint, not the full `exec()` attack surface
- Disclosure failure: NVD and GitHub advisory system initially listed wrong patched version (1.8.2 instead of 1.9.0)

---

## Related Incidents

### AAGF-2026-013 — Flowise MCP RCE (CVSS 10.0, CISA KEV)
**Highly related — same class of vulnerability in a competing AI agent builder.**
- Flowise CustomMCP node: code injection → unsandboxed server-side execution
- Also resulted in CISA KEV addition
- Same credential-harvesting threat model (stored LLM API keys as primary target)
- Same architectural pattern: visual AI workflow builder that uses server-side `exec()` as a design primitive
- Flowise: 12,000-15,000 exposed instances; CVSS 10.0; Langflow: unknown count; CVSS 9.3/10.0
- **Pattern:** Two of the top AI agent builder platforms (Langflow and Flowise) hit by critical unauthenticated RCE in the same exploit class within months of each other

### AAGF-2026-022 — MCP STDIO Design Flaw (200K+ servers)
**Related — same architectural theme of unsandboxed code execution as design choice.**
- MCP STDIO transport: execute-first-validate-never for arbitrary system commands
- Protocol-level flaw vs. endpoint-level flaw
- Same downstream credential exposure risk
- The Anthropic-ecosystem connection is notable: CVE-2026-33017 specifically harvests Anthropic API keys from Langflow instances; AAGF-2026-022 affects the MCP protocol Anthropic designed

### CVE-2025-3248 (Prior Langflow RCE, CISA KEV May 2025)
**Directly related — same platform, same root cause.**
- Different vulnerable endpoint (`/api/v1/validate/code`)
- Same `exec()` call without sandboxing
- Fix was insufficient (added auth to one endpoint; did not sandbox exec)
- This is the direct predecessor that enabled CVE-2026-33017 to exist

### CVE-2026-33634 — Trivy Supply Chain Compromise (Same CISA KEV batch)
**Temporally adjacent — same threat landscape, different attack surface.**
- Added to CISA KEV one day after CVE-2026-33017 (March 26, 2026)
- Trivy security scanner compromised by TeamPCP
- Downstream impact on LiteLLM (present in 36% of monitored cloud environments)
- Both incidents affect AI infrastructure tooling in the same time window

### Industry Pattern
CSA Labs notes four RCE vulnerabilities in Langflow since 2025, suggesting "a systemic architectural tendency rather than isolated incidents." The broader pattern: any platform using server-side Python `exec()` for visual AI workflow composition has inherited this risk surface, and multiple platforms (Flowise, Langflow) have been serially exploited through it.

---

## Raw Notes / Quotes

> "This endpoint accepts attacker-supplied flow data containing arbitrary Python code in node definitions, which is then executed server-side without sandboxing." — Sysdig (primary source)

> "An unauthenticated attacker can submit a fabricated flow definition containing arbitrary Python code in node definitions, and the server will compile and execute it." — GitHub advisory GHSA-vwmf-pq79-vjvx

> "No sandbox. No restrictions on imports. Full access to the Python runtime." — Aviral Srivastava (discoverer, Medium)

> "ast.Assign nodes are executed during graph building, before the flow ever runs." — Barrack AI

> "Nobody audited the other endpoints that fed user input into the same exec() pipeline." — Barrack AI

> "When AUTO_LOGIN=true (which is the default), even that prerequisite disappears, because the attacker can call /api/v1/auto_login to get a superuser token and create a public flow themselves." — Sysdig

> "Multiple authoritative sources (National Vulnerability Database, GitHub advisory system) initially reported version 1.8.2 as patched, creating false security perception while active exploitation occurred in the wild." — JFrog Security Research

> "Attackers built working exploits directly from the advisory description" — Sysdig (corroborated by SecurityWeek, Infosecurity Magazine)

> "No public proof-of-concept (PoC) code existed at the time" — Sysdig (confirmed by multiple outlets)

> "A compromised Langflow instance can provide lateral access into an organization's cloud accounts, AI services, and data stores." — Barrack AI

> "Any platform that enables visual composition of AI workflows faces similar risks if relying on server-side code execution as a design primitive." — CSA Labs

### Key Numbers to Verify in Incident Report
- 20 hours: advisory to first exploitation (Sysdig; widely corroborated)
- 25 hours: advisory to first successful credential exfiltration (Sysdig only)
- 6 attacker IPs: 48-hour honeypot observation (Sysdig only)
- 145,000+ GitHub stars: verifiable; inference about deployment count is not
- CVSS 9.3 (CVSS v4.0): confirmed by GitHub advisory, Aviral Srivastava, Barrack AI
- CVSS 10.0 (CVSS v3.1): reported by CSA Labs — treat as alternate scoring framework, not contradiction
- Patch v1.9.0: confirmed fix (JFrog, SecurityWeek, RunZero)
- v1.8.2 false-patched: JFrog confirmed still vulnerable
- CISA KEV March 25, 2026: confirmed (TheCyberThrone, Help Net Security, SecurityAffairs)
- Federal deadline April 8, 2026: confirmed (Help Net Security, CSO Online)
