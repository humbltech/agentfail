# AAGF-2026-068 Research: Flowise Three-CVE MCP RCE Cluster

## Source Assessment

**Primary sources (vendor advisories):**
- GHSA-c9gw-hvqq-f33r (GitHub Advisory Database) — vendor-adjacent; GitHub hosts the advisory. Credible for factual CVE detail. Bias: minimizes scope of exploitation.
- GHSA-3gcm-f6qx-ff7p (FlowiseAI official security advisory) — this URL resolves to the PRIOR CVE-2025-59528 advisory (CustomMCP node JavaScript injection, CVSS 10.0), NOT CVE-2026-41268. The new CVE-2026-41268 advisory is GHSA-cvrr-qhgw-2mm6. This is a source navigation error in the original task brief — the two advisories are distinct.

**Secondary sources:**
- CSO Online / The Hacker News — reputable trade press; coverage focuses on CVE-2025-59528 (the prior CVSS 10.0 flaw under active exploitation as of April 2026), not specifically the newer CVE-2026-40933/41268 cluster. Risk of conflation between the two Flowise vulnerability waves.
- NVD entry for CVE-2026-41268 — authoritative for CVSS scoring; shows discrepancy between NIST score (9.8) and GitHub CNA score (7.7, citing higher attack complexity).
- Medium threat intel briefing (@xyz031702) — independent analysis, provides broadest CVE coverage including CVE-2026-41264/41265/41137/41274. Authorship unclear; treat as secondary-corroborative, not primary.
- Positive Technologies (ptsecurity.com dbugs) — independent security firm; provided the most technically precise exploitation detail for CVE-2026-41268 (FILE-STORAGE bypass mechanism, exact HTTP payload structure).
- GitLab Advisory Database — mirrors GitHub advisories; useful for CVE-2026-41264/41265 detail.
- VulnCheck — industry threat intelligence firm cited in Hacker News/CSO; source of the 12,000–15,000 exposed instance figure and first-exploitation detection.

**Key bias flag:** Almost all media coverage conflates or primarily covers CVE-2025-59528 (CVSS 10.0, September 2025 disclosure, active exploitation April 2026) with the newer CVE-2026-40933/41268 cluster (disclosed April 15–16, 2026, fixed March 16, 2026). The exploitation reports pertain to the PRIOR vulnerability wave. Active exploitation of the newer CVEs has NOT been separately confirmed in sources reviewed. This distinction is critical for the incident record.

---

## Timeline

| Date | Event |
|------|-------|
| September 2025 | CVE-2025-59528 (CVSS 10.0) disclosed; Flowise 3.0.6 patched |
| February 3, 2026 | Flowise 3.0.13 released (last vulnerable version for the new CVE cluster) |
| March 16, 2026 | **Flowise 3.1.0 released** — patches CVE-2026-40933, CVE-2026-41268, CVE-2026-41264, CVE-2026-41265, and additional issues |
| March 23, 2026 | Flowise 3.1.1 released |
| April 6–7, 2026 | VulnCheck detects first in-the-wild exploitation — of CVE-2025-59528 (the prior flaw), from a Starlink IP |
| April 14, 2026 | Flowise 3.1.2 released |
| April 15, 2026 | CVE-2026-40933 publicly disclosed (GitHub Advisory Database) |
| April 16, 2026 | CVE-2026-41268 NVD entry published |
| April 16, 2026 | CVE-2026-41264 (CSVAgent) and CVE-2026-41265 (AirtableAgent) disclosed |

**Key timeline finding:** The new CVE cluster (40933, 41268, 41264, 41265) was patched in Flowise 3.1.0 on March 16, 2026 — approximately 30 days BEFORE public disclosure on April 15–16, 2026. This suggests coordinated disclosure: vendor fixed first, researchers disclosed after patch availability. Exploitation confirmed as of April 2026 is attributable to CVE-2025-59528 (the older CVSS 10.0 flaw), not the newer cluster.

---

## Technical Mechanism — Per CVE

### CVE-2026-40933 — Authenticated RCE via MCP Adapter (CVSS 9.9)

**CVSS Vector:** CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H  
**CWE:** CWE-78 (OS Command Injection)  
**Authentication:** Required (PR:L = low privileges; any authenticated user)  
**Reporters:** MosesOX, 13ph03nix

**What the MCP adapter does in Flowise:**  
Flowise implements Model Context Protocol (MCP) support, allowing users to connect external tool servers to their AI workflows. The "Custom MCP" configuration UI (`/canvas`) lets authenticated users register MCP stdio servers — processes that Flowise spawns as child processes and communicates with over stdin/stdout. This is a legitimate feature for extending agent tool access.

**The vulnerability — unsafe serialization of stdio commands:**  
The MCP adapter contains sanitization functions (`validateCommandInjection`, `validateArgsForLocalFileAccess`) that attempt to restrict which commands and arguments can be passed when spawning a stdio server. However, the sanitization permits "safe" commands like `npx` and fails to prevent those commands from being paired with execution-enabling arguments. The serialization of the full command + args structure into the stdio spawn call does not adequately constrain the argument space.

**Exploitation:**  
An authenticated user navigates to the Flowise canvas, adds a new Custom MCP server configured as stdio type, and provides a crafted command + args JSON:

```json
{
  "command": "npx",
  "args": ["-c", "touch /tmp/pwn"]
}
```

When Flowise attempts to initialize the MCP stdio server, it spawns `npx -c touch /tmp/pwn` as a child process with the privileges of the Flowise server process. In containerized deployments this is typically root. Any OS command is executable this way.

**Privilege level:** Flowise server process privileges — root in typical Docker deployments.

**Scope changed (S:C in CVSS):** The exploit breaks out of the Flowise application context to the underlying OS, hence the Changed scope and CVSS 9.9.

---

### CVE-2026-41268 — Unauthenticated RCE via FILE-STORAGE:: Bypass + NODE_OPTIONS Injection (CVSS 9.8 / NIST)

**CVSS Vector (NIST):** CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H  
**CVSS Vector (GitHub CNA):** CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:L (7.7 HIGH)  
**Note:** NIST and GitHub disagree on attack complexity (Low vs. High). The 7.7 score reflects the preconditions (API Override enabled + Chatflow publicly shared + MCP tool node present). NIST scores the base capability without preconditions.  
**CWE:** CWE-20 (Improper Input Validation)  
**GHSA:** GHSA-cvrr-qhgw-2mm6  
**Authentication:** None required.

**What FILE-STORAGE:: is:**  
`FILE-STORAGE::` is an internal Flowise keyword used in the `replaceInputsWithConfig` function to reference stored file configurations. It acts as a marker for the parameter system to distinguish file-backed configurations from inline values, and triggers authorization checks via `isParameterEnabled()`.

**The two-part exploit mechanism:**

*Part 1 — FILE-STORAGE:: bypass:*  
The validation check uses `.includes()` instead of `.startsWith()` to detect the FILE-STORAGE:: marker. An attacker embeds the keyword as a comment anywhere in the config string:

```
/* FILE-STORAGE:: */ {malicious config}
```

This satisfies the `.includes('FILE-STORAGE::')` check, bypassing parameter authorization and allowing the attacker to override the `mcpServerConfig` parameter without authentication.

*Part 2 — NODE_OPTIONS injection:*  
The MCP node's environment variable blocklist excludes `NODE_OPTIONS`. By injecting this variable with the `--experimental-loader` flag pointing to a base64-encoded JavaScript payload, the attacker causes arbitrary JavaScript to execute at Node.js process startup — before any application code runs.

**Exact HTTP request:**

```
POST /api/v1/prediction/{chatflowId}
Content-Type: application/json

{
  "question": "trigger",
  "overrideConfig": {
    "mcpServerConfig": "/* FILE-STORAGE:: */ {\"env\":{\"NODE_OPTIONS\":\"--experimental-loader data:text/javascript;base64,[base64_encoded_payload]\"}}"
  }
}
```

No authentication headers required. Single request, unauthenticated.

**Preconditions (per GitHub CNA scoring, explaining the 7.7 vs 9.8 discrepancy):**
1. "API Override" must be enabled in the target Chatflow's configuration
2. The Chatflow must be publicly shared (accessible without auth)
3. The Chatflow must contain an MCP tool node (Custom MCP confirmed vulnerable)

These preconditions are common in production deployments (public chatflows are the primary Flowise use case), which is why NIST scored it 9.8 without precondition assumptions.

**Privilege level:** Root in containerized instances (standard Flowise Docker deployment runs as root). Enables full container compromise, credential exfiltration, lateral movement to internal networks.

**Steps from exploit to root shell:** 2 — craft the payload, send one HTTP POST. No brute force, no credentials, no multi-step.

---

### CVE-2026-41264 — CSVAgent Prompt Injection to Python RCE (CVSS 9.2 / 9.8)

**CVSS (GHSA/GitHub):** 9.2 CRITICAL — CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N  
**CVSS (GitLab advisory):** 9.8 CRITICAL  
**CWE:** CWE-184 (Incomplete List of Disallowed Inputs)  
**GHSA:** GHSA-3hjv-c53m-58jj  
**Authentication:** None required.

**Affected component:** `CSV_Agents` class, `run` method, in flowise-components.

**Mechanism:**  
The CSVAgent allows users to upload a CSV file and ask natural language questions about it. Internally, the agent uses Pyodide (Python runtime in Node.js/browser) to execute LLM-generated pandas code against the CSV data. A validation function (`validatePythonCodeForDataFrame()`) uses regex blocklists to filter forbidden imports and patterns.

**The sandboxing failure:**  
The regex-based denylist is bypassable via Python import aliasing. Example:

```python
import pandas as np, os as pandas
pandas.system("xcalc")
```

The pattern blocking non-pandas imports (`import os`) does not catch aliased imports where `os` is imported alongside `pandas` in a single import statement. `os` becomes accessible as `pandas`, and `pandas.system()` executes OS commands.

**Attack paths:**
1. Unauthenticated users can send malicious prompts to a public chatflow using CSVAgent, manipulating the LLM into generating the bypass payload.
2. Authenticated users with server access can point the chatflow at an attacker-controlled LLM server that returns malicious Python directly.

**Execution context:** Server-side, with the privileges of the Flowise server process. Not sandboxed to a browser or client context.

**Missing sandboxing:** No subprocess isolation, no OS-level sandbox (seccomp/AppArmor), no Python import whitelist enforcement — only bypassable regex.

---

### CVE-2026-41265 — AirtableAgent Prompt Injection to Python RCE (CVSS 9.2)

**CVSS (GitLab):** 8.3 HIGH — CVSS:3.0/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L  
**CVSS (THREATINT):** 9.2  
**CWE:** CWE-94 (Improper Control of Generation of Code)  
**GHSA:** GHSA-v38x-c887-992f / GHSA-f228-chmx-v6j6  
**Authentication:** Low privilege required (PR:L per GitLab CVSS; contrast with CVE-2026-41264 which is unauthenticated).

**Affected component:** `Airtable_Agents` class, `run` method, in flowise-components.

**Mechanism:**  
The AirtableAgent connects to Airtable data sources and uses LLM-generated Python (pandas) to manipulate the data. The user's question input is applied directly to the prompt template and reflected into generated Python code without sanitization:

> "The user's input is directly applied to the question parameter within the prompt template and it is reflected to the Python code without any sanitization."

**Attack path:**  
An attacker crafts a prompt designed to bypass the LLM's system instructions, forcing the model to output malicious Python code (e.g., OS command execution) instead of legitimate data manipulation logic. The attacker's prompt injection is then executed as Python on the server.

**Key difference from CVE-2026-41264:** AirtableAgent requires low-privilege authentication (an account), while CSVAgent (CVE-2026-41264) is fully unauthenticated.

**The fix (3.1.0):** Both CVE-2026-41264 and CVE-2026-41265 are addressed by introducing `validatePythonCodeForDataFrame(pythonCode)`, a dedicated validation function with explicit whitelist and denylist of permitted Python syntax and module imports. This replaces the bypassable regex approach.

---

### Additional CVEs in the Same Cluster (sourced from Medium threat intel briefing — lower confidence, no primary advisory fetched)

**CVE-2026-41137 (CVSS ~9.4):** Command injection in `CSVAgent` via custom Pandas CSV read code — attacker provides injection payload in the CSV read function parameter. Distinct from CVE-2026-41264 (which uses prompt injection); this is direct parameter injection.

**CVE-2026-41274 (CVSS ~9.3):** Cypher query injection in `GraphCypherQAChain` node — user-provided input forwarded directly into Cypher query execution pipeline without sanitization. Enables unauthorized data access, modification, or DoS in connected graph databases (Neo4j, etc.).

*Note: CVE-2026-41137 and CVE-2026-41274 are from the secondary Medium source only. No primary advisories were located. Flag these as unverified pending primary advisory confirmation.*

---

## Exploitation Evidence

**Confirmed active exploitation (April 2026):** YES — but for CVE-2025-59528 (the prior CVSS 10.0 flaw, patched September 2025 in Flowise 3.0.6), NOT the new CVE-2026-40933/41268 cluster.

- **First confirmed exploitation:** April 6–7, 2026, detected by VulnCheck's Canary network
- **Attack origin:** Single Starlink IP address conducting opportunistic scanning
- **Pattern:** Systematic probing of unpatched deployments

**For CVE-2026-41268 specifically:** NIST NVD notes: "No authentication or prior knowledge of the instance is required. Exploitation involves a single HTTP request utilizing the documented parameter and environment variable injection technique." However, confirmed in-the-wild exploitation of CVE-2026-41268 has NOT been separately documented in any source reviewed. Given the simpler exploitation requirements (unauthenticated, single HTTP request) versus CVE-2025-59528 (required API token), exploitation probability is high but currently unconfirmed as a distinct campaign.

**The 12,000–15,000 figure:**  
Source: VulnCheck internet scanning (Shodan/Censys methodology, specific platform unconfirmed). This is the number of publicly accessible Flowise instances on the internet — not confirmed-compromised instances. VulnCheck VP of Security Research: "The internet-facing attack surface area of 12,000+ exposed instances makes the active scanning and exploitation attempts we're seeing more serious." The number of instances running versions prior to 3.1.0 (and thus vulnerable to the new CVE cluster) is a subset of this — unquantified.

**What attackers are doing with access:**  
For CVE-2025-59528 exploitation: successful exploitation grants access to `child_process` (OS command execution) and `fs` (unrestricted file system). Sources confirm the following capabilities but do NOT document confirmed cryptomining, backdoor installation, or specific data theft in reviewed sources:
- Full container/host compromise
- LLM API key exfiltration (OpenAI, Anthropic, Azure OpenAI, Google keys routinely stored in Flowise instances)
- Database credential theft (vector databases, internal business systems)
- Lateral movement to connected cloud services
- Downstream AI pipeline compromise (RAG systems, agent tool configurations)

**Downstream AI workflow impact:** Flowise instances are gateways to broader AI infrastructure. Compromise doesn't just affect the Flowise host — it exposes every connected service whose credentials are stored in the workflow configuration. This creates supply chain risk across AI development ecosystems.

**Confirmed victims:** No named organizations documented in any reviewed source.

---

## Affected Versions and Fix

**Vulnerable versions:** All Flowise versions up to and including 3.0.13 (npm packages `flowise` and `flowise-components`)

**Fixed version:** Flowise 3.1.0 (released March 16, 2026, 14:47 UTC)  
**Confirmed from npm registry:** `flowise@3.1.0` published `2026-03-16T14:47:16.783Z`

**Post-fix versions:** 3.1.1 (March 23, 2026), 3.1.2 (April 14, 2026), 3.1.x current

**Fix coverage per CVE:**
- CVE-2026-40933: MCP adapter command serialization hardened; argument validation overhauled
- CVE-2026-41268: `replaceInputsWithConfig` fixed to use `.startsWith()` instead of `.includes()`; `NODE_OPTIONS` added to environment variable blocklist
- CVE-2026-41264: `validatePythonCodeForDataFrame()` function introduced with explicit whitelist/denylist
- CVE-2026-41265: Same `validatePythonCodeForDataFrame()` function applied to AirtableAgent

**Additional 3.1.0 security fixes (from release notes):** Path traversal protections, filepath validation, Pyodide execution sanitization, LLM-generated code import prevention, DOM image URL sanitization, IDOR prevention for DocumentStores, mass assignment vulnerability fixes, sensitive cookie transmission fixes, string escaping/encoding fixes, regex vulnerability fixes on user-controlled data, dynamic method call validation.

---

## Damage Assessment

**Quantified damage:** No confirmed financial losses or named victims documented in reviewed sources.

**Potential damage (near-miss assessment):**
- 12,000–15,000 publicly exposed Flowise instances
- Subset running ≤ 3.0.13: unquantified; 3.1.0 released March 16, users had ~30 days to patch before public CVE disclosure
- CVE-2026-41268 (unauthenticated, single HTTP request): any publicly shared chatflow with MCP node and API Override enabled is exploitable with zero barriers
- Credential exfiltration scope: each compromised instance potentially exposes OpenAI/Anthropic/Azure/Google API keys plus database credentials
- RAG pipeline corruption: agent tool configurations accessible to attacker enable downstream manipulation of AI-powered applications built on Flowise

**Actual vs. potential classification:** `near-miss` for the new CVE cluster (40933/41268/41264/41265) — no confirmed exploitation documented; `partial` for the broader Flowise story if including the prior CVE-2025-59528 exploitation wave (active exploitation confirmed but no named victims, no documented losses).

---

## Vendor Response

**FlowiseAI response timeline:**
- Vulnerabilities reported to FlowiseAI by independent security researchers (MosesOX and 13ph03nix credited for CVE-2026-40933; Positive Technologies credited for CVE-2026-41268 research)
- Fix shipped in Flowise 3.1.0 on March 16, 2026 — approximately 30 days before public CVE disclosure
- This timeline indicates coordinated responsible disclosure: vendor fixed first, CVEs disclosed post-patch

**Assessment:** FlowiseAI executed a reasonable coordinated disclosure process for the new cluster. The prior CVE-2025-59528 presents a worse picture: patched September 2025 but 12,000+ instances remained unpatched through April 2026 (six-month window). No public statement from FlowiseAI about the exploitation campaign was found in reviewed sources. No bug bounty program documentation found.

**Patch adoption problem:** The larger failure is operator patch adoption — not vendor response speed. Six months post-patch, the majority of exposed instances remained on vulnerable versions.

---

## Relationship to Prior Flowise CVEs

**CVE-2025-59528 (CVSS 10.0, patched September 2025):**
- Component: CustomMCP node, `convertToValidJSONString` function
- Mechanism: User input passed directly to `Function()` constructor (JavaScript eval equivalent)
- Authentication: API bearer token required
- Fix: Replaced `Function()` with `JSON5.parse()` in Flowise 3.0.6
- Active exploitation: Confirmed April 2026 (six months post-patch)
- Same attack surface? Partially — CustomMCP node is adjacent to the MCP adapter in CVE-2026-40933, but different code paths and different vulnerability class (code injection vs. command injection via serialization bypass)

**CVE-2025-8943 (CVSS 9.8):** Unauthenticated OS command RCE — different component from the 2026 cluster

**CVE-2025-26319 (CVSS 8.9):** Arbitrary file upload — different attack class entirely

**Pattern across all Flowise CVEs:**
The attack surface is consistent: Flowise's architecture allows users to configure integrations with external services, execute code, and process user-supplied data, all in a server-side Node.js environment. The recurring failure mode is insufficient sanitization of user-supplied configuration that reaches execution contexts (JavaScript eval, OS command spawn, Python execution). This is not isolated bugs — it reflects a systematic design pattern where power-user configurability was prioritized over security boundaries. Each CVE wave exposes a new configuration pathway that reaches execution.

**What's different about the 2026 cluster:**
- Expands from JavaScript execution (CVE-2025-59528) to OS-level command injection (CVE-2026-40933)
- Introduces unauthenticated RCE (CVE-2026-41268) — prior exploits required at minimum an API token
- Introduces prompt injection as an attack vector to reach Python execution (CVE-2026-41264/41265) — a new failure mode category: LLM output treated as trusted code
- Covers MCP protocol infrastructure specifically — timing coincides with broad MCP adoption across AI tooling

---

## Classification Notes

**Recommended categories:**
- `tool-misuse` (MCP adapter command injection)
- `prompt-injection` (CVE-2026-41264/41265 — prompt injection → Python RCE)
- `supply-chain` (downstream credential and pipeline exposure)
- `authentication-bypass` (CVE-2026-41268 unauthenticated access)

**Failure modes:**
- Insufficient input sanitization in execution-adjacent configuration
- Trust boundary violation: user-controlled configuration reaches OS command execution
- Trust boundary violation: LLM-generated code treated as trusted and executed without sandbox
- Incomplete blocklists (`.includes()` vs. `.startsWith()`, regex-bypassable import filtering)

**Severity:** Critical (5-CVE cluster; includes unauthenticated RCE requiring single HTTP request)

**`actual_vs_potential`:** `near-miss` — no confirmed exploitation of the specific new CVE cluster; massive potential given unauthenticated single-request exploit for CVE-2026-41268

**`potential_damage`:** Mass compromise of 12,000+ exposed Flowise instances, with credential exfiltration cascading to every connected LLM API, database, and business system. Downstream corruption of AI workflows and RAG pipelines built on compromised Flowise deployments.

**`intervention`:** Responsible disclosure process — CVEs patched in Flowise 3.1.0 (March 16, 2026) approximately 30 days before public disclosure (April 15–16, 2026). Operators had a patch window before weaponization details became public.

**Relationship to AAGF-2026-052 note:** AAGF-2026-052 is listed as "Langflow" in the task brief — that is a DIFFERENT platform (Langflow vs. Flowise). No deduplication concern.

**Relationship to prior Flowise incidents:** CVE-2025-59528 may be in the candidate list (CVSS 10.0, exploitation confirmed April 2026). If published, this new cluster (068) should cross-reference that prior incident.

---

## Open Questions

1. **Exact GHSA for CVE-2026-41268:** The task brief lists GHSA-3gcm-f6qx-ff7p as the primary source for CVE-2026-41268, but that GHSA resolves to CVE-2025-59528 (the prior flaw). The correct GHSA for CVE-2026-41268 appears to be GHSA-cvrr-qhgw-2mm6. Confirm before drafting.

2. **Active exploitation of new CVEs:** Has CVE-2026-41268 been separately weaponized in the wild beyond the April 2026 CVE-2025-59528 campaign? No source distinguishes the two campaigns. VulnCheck or GreyNoise query would confirm.

3. **CVE-2026-41137 and CVE-2026-41274 verification:** These two CVEs (CSVAgent parameter injection, GraphCypherQAChain Cypher injection) appear in the Medium source only. No primary advisories located. Need GitHub advisory database confirmation.

4. **Patch adoption rate:** What fraction of the 12,000–15,000 exposed instances have patched to 3.1.0+? VulnCheck or Censys may have post-patch scan data. If adoption is poor, the near-miss classification may need revision to "partial."

5. **FlowiseAI public statement:** No official blog post or disclosure statement from FlowiseAI found regarding the exploitation campaign or the new CVE cluster. Worth checking their GitHub discussions and X/Twitter.

6. **CVE-2026-41265 authentication discrepancy:** GitHub (GHSA-f228-chmx-v6j6 via GitLab mirror) shows PR:L (low privilege required); THREATINT shows CVSS 9.2 which implies unauthenticated. Reconcile before finalizing severity for AirtableAgent CVE.

7. **NODE_OPTIONS in containerized vs. bare-metal deployments:** Does NODE_OPTIONS injection work when Flowise is deployed via npm (bare metal) vs. Docker? Root privilege impact may differ.

---

## Sources

| URL | Type | Credibility |
|-----|------|-------------|
| https://github.com/advisories/GHSA-c9gw-hvqq-f33r | Primary advisory (CVE-2026-40933) | High — GitHub Advisory Database |
| https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p | NOTE: Resolves to CVE-2025-59528, NOT CVE-2026-41268 | High for CVE-2025-59528; wrong target for this incident |
| https://nvd.nist.gov/vuln/detail/CVE-2026-41268 | NVD entry | High — authoritative for CVSS scoring |
| https://dbugs.ptsecurity.com/vulnerability/PT-2026-34733 | Technical analysis of CVE-2026-41268 (Positive Technologies) | High — independent security firm; best technical detail on FILE-STORAGE bypass |
| https://github.com/advisories/GHSA-3hjv-c53m-58jj | Primary advisory (CVE-2026-41264, CSVAgent) | High |
| https://advisories.gitlab.com/npm/flowise/GHSA-f228-chmx-v6j6/ | Advisory (CVE-2026-41265, AirtableAgent) | High — mirrors GitHub advisory |
| https://advisories.gitlab.com/npm/flowise/CVE-2026-41264/ | Advisory mirror (CVE-2026-41264) | High |
| https://www.csoonline.com/article/4155680/hackers-exploit-a-critical-flowise-flaw-affecting-thousands-of-ai-workflows.html | Trade press | Medium — primarily covers CVE-2025-59528 exploitation |
| https://thehackernews.com/2026/04/flowise-ai-agent-builder-under-active.html | Trade press | Medium — VulnCheck sourced; same conflation issue |
| https://securityaffairs.com/190471/security/attackers-exploit-critical-flowise-flaw-cve-2025-59528-for-remote-code-execution.html | Trade press | Medium |
| https://www.securityweek.com/critical-flowise-vulnerability-in-attacker-crosshairs/ | Trade press | Medium |
| https://medium.com/@xyz031702/ai-threat-intelligence-briefing-64cfc4a36726 | Independent analysis | Low-Medium — broad CVE coverage, unknown authorship; corroborative only |
| https://cve.threatint.eu/CVE/CVE-2026-41264 | CVE aggregator | Medium — useful for CVSS 4.0 vector |
| https://cve.threatint.eu/CVE/CVE-2026-41268 | CVE aggregator | Medium |
| https://labs.cloudsecurityalliance.org/research/csa-research-note-flowise-mcp-rce-exploitation-20260409-csa/ | CSA research note | Medium — CSS-heavy page, content not extracted; check manually |
| https://github.com/FlowiseAI/Flowise/releases/tag/flowise@3.1.0 | GitHub release notes | High — confirmed patch contents |
| npm registry (registry.npmjs.org/flowise) | Package metadata | High — authoritative for release timestamps |
