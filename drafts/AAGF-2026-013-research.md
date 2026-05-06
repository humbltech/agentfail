# AAGF-2026-013 Research Document

**Subject:** Flowise AI Agent Builder CVSS 10.0 RCE Under Active Exploitation via CustomMCP Node Code Injection (CVE-2025-59528)
**Primary source:** https://thehackernews.com/2026/04/flowise-ai-agent-builder-under-active.html
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-013

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| The Hacker News | https://thehackernews.com/2026/04/flowise-ai-agent-builder-under-active.html | Independent journalism | High | Detailed coverage with VulnCheck quotes and technical context. |
| BleepingComputer | https://www.bleepingcomputer.com/news/security/max-severity-flowise-rce-vulnerability-now-exploited-in-attacks/ | Independent journalism | High | VulnCheck detection timeline, exploitation details, remediation guidance. |
| GitHub Security Advisory (GHSA-3gcm-f6qx-ff7p) | https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p | Primary -- vendor advisory | High | Official advisory with CVSS vector, affected versions, PoC details. Published Sept 13, 2025. |
| Security Affairs | https://securityaffairs.com/190471/security/attackers-exploit-critical-flowise-flaw-cve-2025-59528-for-remote-code-execution.html | Independent journalism | High | VulnCheck quotes, CISA KEV confirmation, Starlink IP attribution. |
| CSA Labs Research Note | https://labs.cloudsecurityalliance.org/research/csa-research-note-flowise-mcp-rce-exploitation-20260409-csa/ | Security research | High | Deep technical analysis, MCP protocol context, Function() vs eval() comparison, credential theft implications. |
| CyberSecurity News | https://cybersecuritynews.com/flowise-ai-agent-builder-vulnerability-exploited/ | Independent journalism | Medium-High | Exposure scale and active exploitation summary. |
| GitHub Advisory Database | https://github.com/advisories/GHSA-3gcm-f6qx-ff7p | Primary -- advisory database | High | Structured vulnerability entry with CWE classification. |
| GitHub PoC repo (UsifAraby) | https://github.com/UsifAraby/CVE-2025-59528-POC | Exploit code | Medium | Public proof-of-concept exploit code. |
| Canadian Cyber Security Journal | https://cybersecurityjournal.ca/techtalk/83883-flowise-cve-2025-59528-rce-exploitation-ai-agent-builder-2026-04-08/ | Independent journalism | Medium-High | Timeline and exposure details. |
| SC Media | https://www.scworld.com/brief/active-exploitation-of-max-severity-flowise-bug-threatens-broad-compromise | Independent journalism | High | Brief but authoritative. |
| SecurityWeek | https://www.securityweek.com/critical-flowise-vulnerability-in-attacker-crosshairs/ | Independent journalism | High | VulnCheck and exploitation context. |
| OWASP GenAI Exploit Round-up Q1 2026 | https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/ | Security community | High | Broader AI security context. |
| CSO Online | https://www.csoonline.com/article/4155680/hackers-exploit-a-critical-flowise-flaw-affecting-thousands-of-ai-workflows.html | Independent journalism | High | Enterprise workflow impact framing. |

**Source quality summary:** Strong. GitHub Security Advisory provides authoritative primary details including CVSS vector, CWE, affected versions, and PoC. VulnCheck (via multiple outlets) provides first-hand exploitation detection data. CSA Labs provides the deepest technical analysis including the Function() vs eval() distinction and JSON5.parse fix rationale. Multiple independent journalism outlets corroborate core facts. No contradictions found across sources.

---

## Who Was Affected

**Primary target:** Organizations using FlowiseAI Flowise for AI agent and LLM workflow orchestration

**Platform details (CSA Labs, The Hacker News):**
- Flowise is an open-source, low-code platform for building AI agents and LLM-based workflows
- Over 43,000 GitHub stars (CSA Labs)
- Used by Fortune 500 companies (CSA Labs)
- Serves developers, non-technical users, and enterprises operating chatbots, knowledge assistants, and RAG pipelines

**Exposure scale (VulnCheck via BleepingComputer, Security Affairs):**
- 12,000--15,000 Flowise instances publicly accessible on the internet at the time of exploitation detection
- Unknown percentage running vulnerable versions (pre-3.0.6), but six months after patch availability, many likely still unpatched

**Downstream services at risk (CSA Labs, The Hacker News):**
- OpenAI API keys stored in Flowise configurations
- Anthropic API keys
- Azure OpenAI credentials
- Google API keys
- Vector database credentials
- Connected cloud service credentials
- RAG pipeline data source configurations
- OAuth tokens for integrated services

**Industries:** Not specifically enumerated in sources, but Flowise is described as widely adopted across enterprises deploying AI chatbots, knowledge assistants, and automated workflows. CSO Online describes impact on "thousands of AI workflows."

---

## What Happened (Chronological)

### Vulnerability Introduction (version 2.2.7-patch.1)

The CustomMCP node was introduced in Flowise version 2.2.7-patch.1. This node allows users to configure connections to external Model Context Protocol (MCP) servers. The node's `convertToValidJSONString` function used JavaScript's `Function()` constructor to parse user-supplied configuration strings -- a design that amounted to an eval() equivalent, executing arbitrary code rather than parsing data. (GitHub Advisory, CSA Labs)

### Discovery and Responsible Disclosure (2025)

**Discoverer:** Kim SooHyun (GitHub handle: @im-soohyun) (GitHub Advisory)

Kim SooHyun identified that the `mcpServerConfig` parameter in the CustomMCP node's API endpoint (`/api/v1/node-load-method/customMCP`) could be exploited to achieve arbitrary code execution. The vulnerability was reported via GitHub's security advisory process. (GitHub Advisory)

### Advisory Publication and Patch Release (September 13, 2025)

FlowiseAI published GitHub Security Advisory GHSA-3gcm-f6qx-ff7p on September 13, 2025. The fix was released in Flowise version 3.0.6, replacing the dangerous `Function('return ' + inputString)()` call with `JSON5.parse(inputString)` in commit `4af067a444a579f260d99e8c8eb0ae3d5d9b811a`. (GitHub Advisory, search results)

### Six-Month Window (September 2025 -- April 2026)

The patch was publicly available for over six months before active exploitation was detected. As VulnCheck VP of Security Research Caitlin Condon noted: "This specific vulnerability has been public for more than six months, which means defenders have had time to prioritize and patch the vulnerability." Despite this, 12,000--15,000 instances remained internet-facing. (BleepingComputer, Security Affairs)

### Active Exploitation Detected (April 7, 2026)

On the morning of April 7, 2026, VulnCheck's Canary network began detecting first-time exploitation of CVE-2025-59528 in the wild. (BleepingComputer, Security Affairs)

**Exploitation details:**
- Activity originated from a single Starlink IP address (specific IP not publicly disclosed)
- Indicates either a compromised Starlink endpoint or attacker infrastructure hosted on Starlink (Security Affairs)
- VulnCheck provides exploit samples, network signatures, and YARA rules to paying customers (BleepingComputer)

**CISA KEV:** The vulnerability was added to CISA's Known Exploited Vulnerabilities catalog following active exploitation detection (Security Affairs)

### Concurrent Exploitation of Other Flowise Flaws

CVE-2025-59528 is the third Flowise vulnerability with documented in-the-wild exploitation. VulnCheck noted concurrent exploitation of two additional Flowise vulnerabilities (The Hacker News, Security Affairs):
- **CVE-2025-8943** (CVSS 9.8): Unauthenticated OS command execution
- **CVE-2025-26319** (CVSS 8.9): Arbitrary file upload via `/api/v1/attachments`

---

## Technical Detail

### Vulnerability Classification

| Field | Value |
|-------|-------|
| CVE ID | CVE-2025-59528 |
| CVSS Score | 10.0 (Critical) |
| CVSS Vector | CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H |
| CWE | CWE-94 (Improper Control of Generation of Code / Code Injection) |
| Affected versions | >= 2.2.7-patch.1, < 3.0.6 |
| Fixed version | 3.0.6 |
| Current recommended version | 3.1.1 |

### Vulnerable Code Path

**File:** `packages/components/nodes/tools/MCP/CustomMCP/CustomMCP.ts` (lines 262--270)

**Vulnerable endpoint:** `/api/v1/node-load-method/customMCP` (accepts POST requests)

**Vulnerable function:**
```javascript
function convertToValidJSONString(inputString) {
    return Function('return ' + inputString)(); // arbitrary code execution
}
```

The `mcpServerConfig` parameter -- intended to hold JSON configuration for connecting to an external MCP server -- was passed directly to the `Function()` constructor without any validation or sanitization. (GitHub Advisory, CSA Labs)

### Function() Constructor vs eval()

The `Function()` constructor is functionally equivalent to `eval()` for code execution purposes. CSA Labs analysis notes that while `Function()` doesn't share the caller's lexical scope (a limitation `eval()` lacks), "both execute arbitrary JavaScript within the same runtime context." This means attackers gain access to the same dangerous Node.js modules:
- **`child_process`**: OS command execution (e.g., `execSync`, `spawn`)
- **`fs`**: Unrestricted file system read/write operations
- **`process`**: Environment variables, process control
- Full Node.js runtime privileges (GitHub Advisory, CSA Labs)

### Attack Vector

1. Attacker sends a POST request to `/api/v1/node-load-method/customMCP`
2. Request body contains a malicious `mcpServerConfig` value
3. The value is passed through variable substitution without security filtering
4. `Function('return ' + inputString)()` executes the payload as JavaScript
5. Payload uses `process.mainModule.require()` to load dangerous modules

**Authentication requirement:** While Flowise supports optional API token authentication, the vulnerability can be exploited without credentials when authentication is not configured -- described as "a common deployment scenario" (CSA Labs, GitHub Advisory). The CVSS vector (PR:N = Privileges Required: None) reflects this.

### Proof of Concept

The GitHub Advisory demonstrates command execution that creates a file at `/tmp/RCE.txt` using `process.mainModule.require()` to invoke `child_process.execSync()`. A public PoC repository exists at https://github.com/UsifAraby/CVE-2025-59528-POC. (GitHub Advisory)

### The Fix (v3.0.6)

**Commit:** `4af067a444a579f260d99e8c8eb0ae3d5d9b811a`

The fix replaced the `Function()` constructor call with `JSON5.parse()`:

```javascript
// BEFORE (vulnerable):
function convertToValidJSONString(inputString) {
    return Function('return ' + inputString)();
}

// AFTER (fixed):
function convertToValidJSONString(inputString) {
    return JSON5.parse(inputString);
}
```

CSA Labs describes this as "a targeted architectural fix rather than superficial sanitization" -- it enforces strict data parsing by treating user input exclusively as structured data rather than executable instructions.

### MCP Protocol Context

The Model Context Protocol's design for flexible tool integration created structural pressure toward permissive input handling. CSA Labs notes: "MCP's inherent flexibility -- designed to accommodate a wide variety of external tool configurations -- can create pressure on developers to accept overly permissive input formats." The CustomMCP node is a direct MCP server configuration implementation where the protocol's flexibility became a security liability.

---

## Impact and Damage Assessment

### Direct Impact

**Full system compromise (GitHub Advisory):**
- Arbitrary command execution on the host system
- Complete file system access (read/write/delete)
- Sensitive data exfiltration
- Infrastructure takeover potential

**Credential theft (CSA Labs):**
A compromised Flowise instance is "not an isolated endpoint but a gateway into broader AI infrastructure." Typical Flowise deployments store:
- LLM provider API keys (OpenAI, Anthropic, Google, Azure OpenAI)
- Vector database credentials
- Cloud service credentials
- OAuth tokens for integrated services
- RAG pipeline data source configurations

An attacker who exploits CVE-2025-59528 "gains access not just to the host system but to every downstream service whose credentials are configured in the application" (The Hacker News).

### Scale of Exposure

- 12,000--15,000 internet-facing Flowise instances (VulnCheck via BleepingComputer)
- Caitlin Condon (VulnCheck): "the internet-facing attack surface area of 12,000+ exposed instances makes the active scanning and exploitation attempts we're seeing more serious" (The Hacker News)
- Described as "a critical-severity bug in a popular AI platform used by a number of large corporations" (Condon, The Hacker News)

### Damage Speed

- Exploitation is trivial: single HTTP POST request to a known endpoint
- No user interaction required (CVSS UI:N)
- No authentication required in common deployments (CVSS PR:N)
- Immediate code execution upon payload delivery

### Historical Pattern

Three actively exploited Flowise vulnerabilities within approximately twelve months represents a concerning pattern. CSA Labs highlights: "the rapid adoption of open-source AI platforms has outpaced the security maturity of those platforms."

---

## Vendor Response

### FlowiseAI Response Timeline

| Date | Event |
|------|-------|
| 2025 (exact date unknown) | Kim SooHyun (@im-soohyun) reports vulnerability via GitHub Security Advisory |
| September 13, 2025 | GitHub Security Advisory GHSA-3gcm-f6qx-ff7p published |
| September 2025 | Flowise v3.0.6 released with JSON5.parse fix |
| ~Late March 2026 | Flowise v3.1.1 released (two weeks before April 7 exploitation) |
| April 7, 2026 | VulnCheck detects first in-the-wild exploitation |
| April 2026 | CISA adds CVE-2025-59528 to Known Exploited Vulnerabilities catalog |

### VulnCheck Role

- Detected exploitation via their Canary network on April 7, 2026
- Attributed initial activity to a single Starlink IP address
- Provides exploit samples, network signatures, and YARA rules to paying customers
- VP of Security Research Caitlin Condon served as primary spokesperson

### Remediation Guidance (CSA Labs, BleepingComputer)

**Emergency response:**
- Upgrade to Flowise v3.1.1 (recommended) or minimum v3.0.6
- Remove Flowise instances from public internet if external access is unnecessary
- Enforce network access controls to trusted IP ranges
- Audit access logs for POST requests to `/api/v1/node-load-method/customMCP` since September 2025
- Rotate all credentials stored in Flowise (LLM API keys, OAuth tokens, database credentials)
- Revoke and reissue OAuth tokens for integrated services

**Strategic recommendations (CSA Labs):**
- Integrate Flowise deployments into standard vulnerability management programs with CVSS-aligned SLAs
- Treat critical patches as requiring 24--72 hour deployment windows
- Evaluate platform security track records as first-class procurement criteria
- Consider isolating platforms with repeated vulnerability patterns

---

## Key Quotes (with attribution)

**Caitlin Condon, VP Security Research, VulnCheck (via The Hacker News):**
"This is a critical-severity bug in a popular AI platform used by a number of large corporations."

**Caitlin Condon (via BleepingComputer):**
"This specific vulnerability has been public for more than six months, which means defenders have had time to prioritize and patch the vulnerability."

**Caitlin Condon (via Security Affairs):**
"Early this morning, VulnCheck's Canary network began detecting first-time exploitation of CVE-2025-59528, a CVSS-10 arbitrary JavaScript code injection vulnerability in Flowise."

**CSA Labs:**
"A compromised Flowise instance is often not an isolated endpoint but a gateway into broader AI infrastructure."

**CSA Labs (on MCP protocol):**
"MCP's inherent flexibility -- designed to accommodate a wide variety of external tool configurations -- can create pressure on developers to accept overly permissive input formats."

**GitHub Advisory (FlowiseAI):**
"This node parses the user-provided mcpServerConfig string to build the MCP server configuration. However, during this process, it executes JavaScript code without any security validation."

---

## AgentFail Categorization Notes

**Why this qualifies as an AI agent incident:**
- Flowise is explicitly an AI agent builder platform -- its purpose is constructing autonomous AI agent workflows
- The vulnerability is in the Model Context Protocol (MCP) integration layer -- the mechanism by which AI agents connect to external tools
- Compromise of Flowise instances exposes the entire AI agent infrastructure: LLM API keys, tool configurations, RAG data sources
- The vulnerability pattern (unsafe code evaluation in configuration parsing) is symptomatic of the rapid, security-immature development cycle in AI tooling

**Suggested categories:** Infrastructure Vulnerability, Tool Integration Failure, Supply Chain Risk

**Severity indicators:**
- CVSS 10.0 (maximum)
- Active exploitation confirmed
- 12,000--15,000 exposed instances
- Third actively exploited Flowise CVE in ~12 months
- Trivial exploitation (single POST request, no auth required)
- Cascade risk via stolen downstream credentials (OpenAI, Anthropic, Azure keys)

**Comparison to other AgentFail incidents:**
- Similar to infrastructure-level vulnerabilities where the AI platform itself is the attack surface
- Unique in that the vulnerable component (CustomMCP) is specifically an MCP protocol integration node -- making it a direct MCP security incident
- The Function() constructor as eval()-equivalent pattern is a well-known anti-pattern that should have been caught during code review
