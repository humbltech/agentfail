---
id: "AAGF-2026-068"
title: "Flowise Three-CVE MCP RCE Cluster — Unauthenticated Root RCE and LLM-Output Code Execution Without Sandboxing"
status: "reviewed"
date_occurred: "2026-02-03"        # Last vulnerable version (3.0.13) released; vulnerability class existed since MCP adapter introduction
date_discovered: "2026-03-16"      # Flowise 3.1.0 patch released — vendor aware; approximate researcher discovery predates this
date_reported: "2026-04-15"        # CVE-2026-40933 first public advisory (GitHub Advisory Database)
date_curated: "2026-05-07"
date_council_reviewed: "2026-05-07"

# Classification
category:
  - "Tool Misuse"
  - "Prompt Injection"
  - "Unauthorized Data Access"
  - "Supply Chain Compromise"
severity: "critical"
agent_type:
  - "Tool-Using Agent"
  - "Task Automation Agent"
  - "Multi-Agent System"
agent_name: "Flowise AI Agent Workflow Builder — MCP adapter, CSVAgent, AirtableAgent"
platform: "Flowise (self-hosted, open-source; npm packages flowise and flowise-components)"
industry: "AI Infrastructure / Cross-Industry"

# Near-miss classification
actual_vs_potential: "near-miss"
potential_damage: "Mass compromise of 12,000–15,000 publicly exposed Flowise instances. CVE-2026-41268 requires a single unauthenticated HTTP POST to achieve root RCE on containerized deployments — zero authentication, zero prior knowledge, two steps from internet to shell. Each compromised instance exposes every stored credential: OpenAI, Anthropic, Azure OpenAI, and Google API keys; vector database connection strings; and internal business system credentials embedded in workflow configurations. Downstream impact cascades to every AI pipeline, RAG system, and agent tool built on the compromised Flowise host. CVE-2026-41264 and CVE-2026-41265 add a new attack surface: prompt injection into Python execution, meaning any public-facing Flowise chatflow using CSVAgent can be weaponized without credentials."
intervention: "Responsible coordinated disclosure — Flowise 3.1.0 patched all four primary CVEs on March 16, 2026, approximately 30 days before public CVE disclosure on April 15–16, 2026. Operators who patched promptly received a 30-day protected window before weaponization details became public. No confirmed in-the-wild exploitation of the new CVE cluster has been documented; the concurrent April 2026 exploitation campaign targets the older CVE-2025-59528 (CVSS 10.0), not this cluster. PoC exists for CVE-2026-41268 per NIST NVD documentation of the exploitation technique."

# Impact
financial_impact: "Not quantified — near-miss, no confirmed exploitation of this CVE cluster"
financial_impact_usd: null
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null                    # No confirmed victims for this cluster
  scale: "widespread"            # 12,000–15,000 exposed instances; potential widespread if exploited
  data_types_exposed:
    - "credentials"              # LLM API keys, DB credentials stored in Flowise instances
    - "PII"                      # Downstream; data in connected systems accessible post-compromise

# Damage Timing
damage_speed: "instantaneous"    # CVE-2026-41268: single HTTP POST, no waiting; exploitation is one request
damage_duration: "unknown"       # No confirmed exploitation duration for this cluster
total_damage_window: "unknown"   # Near-miss; no exploitation confirmed

# Recovery
recovery_time: "not required"    # Near-miss; operators who patched to 3.1.0+ are remediated
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "Patch upgrade to Flowise 3.1.0+ is the primary remediation action — minimal recovery labor for patched instances"
full_recovery_achieved: "unknown" # Depends on individual operator patch status

# Business Impact
business_scope: "multi-org"
business_criticality: "high"
business_criticality_notes: "Any organization running Flowise ≤3.0.13 with public-facing chatflows using MCP nodes faces unauthenticated root RCE via single HTTP request. Credential exfiltration would affect every connected AI provider and downstream business system."
systems_affected:
  - "production-ai-infrastructure"
  - "credential-stores"
  - "customer-data"

# Vendor Response
vendor_response: "fixed"
vendor_response_time: "7-30 days"   # Patch in 3.1.0 (March 16); CVE disclosure April 15–16 suggests ~30-day coordinated window from researcher report to patch

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: 9900000       # Probability-weighted: see methodology
  averted_range_low: 60000000       # Pre-weight lower bound: 12,000 instances × $5,000 avg credential+infra damage
  averted_range_high: 990000000     # Pre-weight upper bound: 12,000 instances × API key abuse + infra × $82,500
  composite_damage_usd: 9900000     # confirmed_loss (0) + recovery (0) + averted (9,900,000)
  confidence: "estimated"
  probability_weight: 0.05          # PoC exists, no confirmed exploitation of this cluster; prior cluster (CVE-2025-59528) actively exploited, reducing novelty barrier over time
  methodology: "12,000 exposed instances × $165/credential record × ~10 stored credentials per instance × 5% exploitation probability"
  methodology_detail:
    per_unit_cost_usd: 1650         # $165/credential × 10 credentials per Flowise instance (OpenAI key, Anthropic key, DB string, etc.)
    unit_count: 12000               # Publicly exposed Flowise instances per VulnCheck scan (lower bound of 12,000–15,000)
    unit_type: "credential"
    multiplier: 1.0                 # No downstream multiplier applied; cascade risk acknowledged but not compounded
    benchmark_source: "IBM 2024 Cost of a Data Breach Report — $165 per compromised record"
  estimation_date: "2026-05-07"
  human_override: false
  notes: "The 0.05 probability weight reflects near-miss status: PoC documented by NIST, no confirmed exploitation. The prior CVE-2025-59528 cluster (CVSS 10.0) was actively exploited six months post-patch, suggesting the 5% weight may be conservative if patch adoption remains poor. Averted range high uses $82,500/instance (API key abuse potential for high-volume LLM operations), which is speculative. Per-record methodology is more defensible."

# Presentation
headline_stat: "One unauthenticated HTTP POST achieves root RCE on 12,000+ exposed Flowise instances — no credentials, no prior knowledge, no multi-step"
operator_tldr: "Upgrade Flowise to 3.1.0 or later immediately — CVE-2026-41268 is unauthenticated root RCE via a single HTTP request to any public chatflow with an MCP node and API Override enabled, and PoC exploitation technique is publicly documented."
containment_method: "third_party"   # Researchers disclosed to vendor; coordinated patch released before CVE details public
public_attention: "medium"          # Trade press coverage conflates with prior CVE-2025-59528; new cluster received moderate independent attention

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0053"       # AI Agent Tool Invocation — MCP adapter command injection via tool config
    - "AML.T0051"       # LLM Prompt Injection — CVE-2026-41264/41265 prompt injection to Python RCE
    - "AML.T0051.000"   # Direct Prompt Injection — attacker-controlled user input triggers Python RCE
    - "AML.T0093"       # Prompt Infiltration via Public-Facing Application — public chatflow as injection surface
    - "AML.T0105"       # Escape to Host — CVE-2026-41268 breaks out to host OS from Flowise app context
    - "AML.T0112"       # Machine Compromise — root RCE in containerized deployment
    - "AML.T0112.000"   # Local AI Agent — agent process itself achieves host compromise
    - "AML.T0083"       # Credentials from AI Agent Configuration — API keys in Flowise workflow configs exposed post-RCE
    - "AML.T0098"       # AI Agent Tool Credential Harvesting — credentials accessible via tool/config access
    - "AML.T0086"       # Exfiltration via AI Agent Tool Invocation — post-RCE credential exfil via tool access
    - "AML.T0010"       # AI Supply Chain Compromise — downstream AI pipelines built on Flowise compromised
    - "AML.T0010.005"   # AI Agent Tool — MCP tool/adapter as supply chain attack surface
  owasp_llm:
    - "LLM01:2025"      # Prompt Injection — CVE-2026-41264/41265 prompt injection to unsandboxed execution
    - "LLM05:2025"      # Improper Output Handling — LLM-generated code executed without sandbox (CVE-2026-41264/41265)
    - "LLM06:2025"      # Excessive Agency — Flowise grants agent-generated code OS-level execution authority
    - "LLM02:2025"      # Sensitive Information Disclosure — credentials exfiltrable post-RCE
    - "LLM03:2025"      # Supply Chain — downstream pipeline exposure
  owasp_agentic:
    - "ASI01:2026"      # Agent Goal Hijack — prompt injection forces LLM to generate malicious Python (CVE-2026-41264/41265)
    - "ASI02:2026"      # Tool Misuse and Exploitation — MCP adapter command injection (CVE-2026-40933), FILE-STORAGE bypass (CVE-2026-41268)
    - "ASI03:2026"      # Agent Identity and Privilege Abuse — any authenticated user achieves root via CVE-2026-40933
    - "ASI04:2026"      # Agentic Supply Chain Compromise — Flowise as AI infrastructure hub; compromise cascades downstream
    - "ASI05:2026"      # Unexpected Code Execution — LLM output executed as OS commands without sandbox (all four CVEs)
  ttps_ai:
    - "2.5.4"           # AI Agent Tool Invocation — MCP adapter as execution vector
    - "2.5.5"           # LLM Prompt Injection — CVE-2026-41264/41265
    - "2.5.10"          # Direct Prompt Injection — attacker input to public chatflow triggers Python RCE
    - "2.7"             # Privilege Escalation — authenticated user → root (CVE-2026-40933); unauthenticated → root (CVE-2026-41268)
    - "2.9"             # Credential Access — API keys and DB credentials accessible post-RCE
    - "2.15"            # Exfiltration — credential and config data exfiltration path
    - "2.16"            # Impact — infrastructure compromise, credential theft, downstream pipeline corruption

# Relationships
related_incidents:
  - "AAGF-2026-052"    # Langflow CVE-2026-33017: unauthenticated RCE in competing AI workflow builder; same root cause class (user input to exec context), same credential cascade consequence, 20-hour exploitation window vs. Flowise's 30-day patch lead
pattern_group: "ai-workflow-builder-rce"
tags:
  - "flowise"
  - "mcp"
  - "rce"
  - "unauthenticated"
  - "command-injection"
  - "prompt-injection"
  - "python-execution"
  - "node-options"
  - "sandbox-bypass"
  - "credential-exfiltration"
  - "cve-2026-40933"
  - "cve-2026-41268"
  - "cve-2026-41264"
  - "cve-2026-41265"
  - "coordinated-disclosure"
  - "near-miss"

# Metadata
sources:
  - url: "https://github.com/advisories/GHSA-c9gw-hvqq-f33r"
    label: "GitHub Advisory — CVE-2026-40933 (MCP adapter RCE)"
    credibility: "High"
  - url: "https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-cvrr-qhgw-2mm6"
    label: "GitHub Advisory — CVE-2026-41268 (FILE-STORAGE bypass + NODE_OPTIONS injection)"
    credibility: "High"
    note: "GHSA-3gcm-f6qx-ff7p resolves to the PRIOR CVE-2025-59528, NOT this CVE. The correct advisory for CVE-2026-41268 is GHSA-cvrr-qhgw-2mm6."
  - url: "https://nvd.nist.gov/vuln/detail/CVE-2026-41268"
    label: "NVD — CVE-2026-41268 CVSS scoring and technical description"
    credibility: "High"
  - url: "https://dbugs.ptsecurity.com/vulnerability/PT-2026-34733"
    label: "Positive Technologies — technical analysis of CVE-2026-41268 (FILE-STORAGE bypass mechanism)"
    credibility: "High"
  - url: "https://github.com/advisories/GHSA-3hjv-c53m-58jj"
    label: "GitHub Advisory — CVE-2026-41264 (CSVAgent sandbox bypass)"
    credibility: "High"
  - url: "https://advisories.gitlab.com/npm/flowise/GHSA-f228-chmx-v6j6/"
    label: "GitLab Advisory — CVE-2026-41265 (AirtableAgent unsandboxed Python)"
    credibility: "High"
  - url: "https://github.com/FlowiseAI/Flowise/releases/tag/flowise@3.1.0"
    label: "Flowise 3.1.0 release notes — confirmed patch contents"
    credibility: "High"
  - url: "https://www.csoonline.com/article/4155680/hackers-exploit-a-critical-flowise-flaw-affecting-thousands-of-ai-workflows.html"
    label: "CSO Online — trade press coverage (primarily CVE-2025-59528 exploitation)"
    credibility: "Medium"
    note: "Coverage conflates CVE-2025-59528 exploitation with the new CVE cluster. Exploitation reports pertain to the prior flaw."
  - url: "https://thehackernews.com/2026/04/flowise-ai-agent-builder-under-active.html"
    label: "The Hacker News — VulnCheck-sourced exploitation coverage"
    credibility: "Medium"
    note: "Same conflation issue; 12,000+ instance figure and Starlink IP sourced to CVE-2025-59528 campaign."
  - url: "https://medium.com/@xyz031702/ai-threat-intelligence-briefing-64cfc4a36726"
    label: "Independent threat intel briefing — broadest CVE cluster coverage including CVE-2026-41137/41274"
    credibility: "Low-Medium"
    note: "Unknown authorship. CVE-2026-41137 and CVE-2026-41274 sourced here only; no primary advisories confirmed."
researcher_notes: "CRITICAL SOURCE DISAMBIGUATION: GHSA-3gcm-f6qx-ff7p (cited in some task briefs as the CVE-2026-41268 source) actually resolves to CVE-2025-59528 — the PRIOR CustomMCP JavaScript Function() injection flaw. The correct advisory for CVE-2026-41268 is GHSA-cvrr-qhgw-2mm6. All active exploitation reports (12,000+ instances, Starlink IP, April 6–7 VulnCheck detection) refer to CVE-2025-59528, NOT to this new cluster. The new cluster (40933/41268/41264/41265) is near-miss status with PoC documented but no confirmed in-the-wild exploitation as of 2026-05-07. Two additional CVEs (CVE-2026-41137 CSVAgent parameter injection, CVE-2026-41274 GraphCypherQAChain Cypher injection) appear in the Medium secondary source only; excluded from primary analysis pending primary advisory confirmation. Severity set to 'critical' per CVSS scores (9.9 and 9.8), unauthenticated root RCE capability, and potential for mass credential exfiltration — the severity taxonomy's 'exposure of highly sensitive data (credentials)' criterion is met even in near-miss classification. NIST vs. GitHub CVSS discrepancy for CVE-2026-41268 (9.8 vs. 7.7) reflects precondition debate; this report uses NIST score as the base case given that preconditions (public chatflow, API Override, MCP node) are common in production deployments."
council_verdict: "approve-with-note"
---

# Flowise Three-CVE MCP RCE Cluster — Unauthenticated Root RCE and LLM-Output Code Execution Without Sandboxing

## Executive Summary

Four critical CVEs in Flowise (the 40,000-star AI agent workflow builder) were patched on March 16, 2026 in version 3.1.0 and publicly disclosed on April 15–16, 2026 after a 30-day coordinated disclosure window. The cluster includes CVE-2026-41268 — unauthenticated root RCE requiring a single HTTP POST to any public-facing chatflow with an MCP node — and CVE-2026-40933, CVE-2026-41264, and CVE-2026-41265, which cover authenticated MCP command injection and a novel attack class: prompt injection that forces the LLM to generate Python code executed without sandboxing on the server. No exploitation of this specific cluster has been confirmed, but PoC is documented and 12,000+ Flowise instances are publicly exposed. This is the third distinct vulnerability cluster in Flowise in twelve months, with a recurring systemic pattern: user-controlled configuration reaching OS-level execution contexts without adequate isolation.

---

## Timeline

| Date | Event |
|------|-------|
| September 2025 | CVE-2025-59528 (CVSS 10.0) disclosed — Flowise CustomMCP JavaScript `Function()` injection. Flowise 3.0.6 patches it. |
| 2026-02-03 | Flowise 3.0.13 released — last version vulnerable to this CVE cluster |
| 2026-03-16 | **Flowise 3.1.0 released** — patches CVE-2026-40933, CVE-2026-41268, CVE-2026-41264, CVE-2026-41265, and additional security hardening |
| 2026-03-23 | Flowise 3.1.1 released |
| 2026-04-06 | VulnCheck detects first in-the-wild exploitation — of CVE-2025-59528 (the prior flaw, **not this cluster**), from a Starlink IP address |
| 2026-04-07 | VulnCheck confirms systematic opportunistic scanning of unpatched Flowise instances (CVE-2025-59528 **only — not this cluster**) |
| 2026-04-14 | Flowise 3.1.2 released |
| 2026-04-15 | **CVE-2026-40933 publicly disclosed** — GitHub Advisory Database (GHSA-c9gw-hvqq-f33r) |
| 2026-04-16 | **CVE-2026-41268 NVD entry published** — CVSS 9.8 NIST; exploitation technique documented publicly |
| 2026-04-16 | **CVE-2026-41264 and CVE-2026-41265 disclosed** — CSVAgent Pyodide bypass and AirtableAgent unsandboxed Python |
| 2026-05-07 | No confirmed exploitation of the new CVE cluster documented as of this curation date |

**Key disclosure finding:** The patch (3.1.0) preceded public CVE disclosure by approximately 30 days — a successful coordinated responsible disclosure. Operators who monitored Flowise releases had a protected window before weaponization details became public.

---

## What Happened

Flowise is an open-source drag-and-drop platform for building AI agent workflows, with over 40,000 GitHub stars and a large self-hosted deployment base. By early 2026, independent security researchers — MosesOX and 13ph03nix (CVE-2026-40933) and Positive Technologies (CVE-2026-41268) — identified a new wave of critical vulnerabilities distinct from the CVSS 10.0 flaw (CVE-2025-59528) that had been exploited in the wild since April 2026.

The four CVEs form a coherent cluster targeting Flowise's execution surfaces: the MCP adapter that Flowise uses to connect to Model Context Protocol tool servers, and the agent execution environments (CSVAgent and AirtableAgent) that run LLM-generated Python code. Each vulnerability represents a different pathway from attacker input to server-side code execution — and together they cover both authenticated and unauthenticated attack surfaces.

Researchers followed coordinated disclosure norms: FlowiseAI received the reports, shipped fixes in Flowise 3.1.0 on March 16, 2026, and the CVEs went public 30 days later after operators had time to patch. However, given that the parallel CVE-2025-59528 exploitation campaign showed that Flowise operators often fail to patch for months (12,000+ instances remained unpatched six months after that fix), the 30-day window may have been insufficient for many deployments.

The new cluster introduces a failure mode not seen in prior Flowise vulnerabilities: **LLM output treated as trusted code**. In CVE-2026-41264 (CSVAgent) and CVE-2026-41265 (AirtableAgent), an attacker uses prompt injection to manipulate the LLM into generating malicious Python code, which Flowise then executes on the server without adequate sandboxing. This is qualitatively different from the prior CVE-2025-59528 (direct `Function()` injection) — the LLM itself becomes an unwitting participant in the attack chain.

---

## Technical Analysis

### Attack Surface 1: MCP Adapter — CVE-2026-40933 (CVSS 9.9, Authenticated)

**Mechanism — unsafe stdio command serialization**

Flowise's Model Context Protocol (MCP) adapter allows authenticated users to register custom MCP stdio servers via the canvas UI. Flowise spawns these as child processes and communicates over stdin/stdout. A sanitization layer (`validateCommandInjection`, `validateArgsForLocalFileAccess`) attempts to restrict allowed commands and arguments.

The sanitization permits "safe" commands like `npx` but fails to constrain the argument space when those commands are paired with execution-enabling flags. An authenticated user provides a crafted command configuration:

```json
{
  "command": "npx",
  "args": ["-c", "touch /tmp/pwn"]
}
```

When Flowise initializes the MCP stdio server, it spawns `npx -c touch /tmp/pwn` as a child process with the privileges of the Flowise server process — root in standard Docker deployments. Any OS command is executable. The Changed scope (S:C) in the CVSS vector reflects the breakout from the Flowise application context to the underlying operating system.

**Fix:** Flowise 3.1.0 overhauled argument validation and command serialization in the MCP adapter, hardening the `validateCommandInjection` logic.

---

### Attack Surface 2: File Storage API — CVE-2026-41268 (CVSS 9.8/NIST, Unauthenticated)

**Mechanism — two-part: FILE-STORAGE:: keyword bypass + NODE_OPTIONS environment injection**

The `/api/v1/prediction/{chatflowId}` endpoint accepts an `overrideConfig` parameter that allows callers to override chatflow configuration values. The `replaceInputsWithConfig` function checks whether config values are file-backed using `.includes('FILE-STORAGE::')` — if true, it applies authorization checks via `isParameterEnabled()`.

**Part 1 — string check bypass:** The `.includes()` check instead of `.startsWith()` means an attacker can embed the keyword anywhere in the string, including as a comment prefix:

```
/* FILE-STORAGE:: */ {malicious config}
```

This satisfies the check and bypasses authorization, allowing the attacker to override `mcpServerConfig` without any authentication.

**Part 2 — NODE_OPTIONS injection:** The MCP node maintains an environment variable blocklist but omits `NODE_OPTIONS`. By injecting this variable with `--experimental-loader` pointing to a base64-encoded JavaScript payload, the attacker causes arbitrary JavaScript to execute at Node.js process startup — before any application code runs:

```json
POST /api/v1/prediction/{chatflowId}
{
  "question": "trigger",
  "overrideConfig": {
    "mcpServerConfig": "/* FILE-STORAGE:: */ {\"env\":{\"NODE_OPTIONS\":\"--experimental-loader data:text/javascript;base64,[base64_payload]\"}}"
  }
}
```

**Preconditions (per GitHub CNA scoring):** API Override enabled in the chatflow, chatflow publicly shared, chatflow contains an MCP tool node. These conditions are common in production Flowise deployments — public chatflows with MCP tools are the primary Flowise use case — which is why NIST scored it 9.8 without precondition adjustments.

**Attack cost:** Two steps: craft the payload, send one HTTP POST. No authentication, no brute force, no multi-step exploitation chain.

**Fix:** `replaceInputsWithConfig` changed to use `.startsWith()` instead of `.includes()`; `NODE_OPTIONS` added to the environment variable blocklist.

---

### Attack Surface 3: Agent Execution — CVE-2026-41264 and CVE-2026-41265 (CVSS 9.2–9.8, Unauthenticated/Low-Privilege)

**Mechanism — prompt injection → unsandboxed Python execution**

Both the CSVAgent and AirtableAgent use Pyodide (Python runtime in Node.js) to execute LLM-generated pandas code against data sources. A regex-based blocklist in `validatePythonCodeForDataFrame()` attempts to prevent dangerous imports.

**CVE-2026-41264 (CSVAgent — unauthenticated):** The regex blocklisting `import os` fails to catch aliased imports:

```python
import pandas as np, os as pandas
pandas.system("xcalc")
```

`os` becomes accessible as `pandas`, and `pandas.system()` executes OS commands on the server. An unauthenticated attacker sends a crafted prompt to a public CSVAgent chatflow, engineering the LLM to generate this bypass payload. The LLM's output is executed without verification on the server.

**CVE-2026-41265 (AirtableAgent — low privilege required):** User input is applied directly to the prompt template and reflected into the generated Python code without sanitization. An attacker crafts a prompt injection payload that overrides the LLM's system instructions and forces it to output OS command execution code. Per GitLab advisory, low-privilege authentication is required (contrast with CVE-2026-41264 which is fully unauthenticated).

**The new failure mode:** These two CVEs represent a novel attack class for Flowise — the LLM is an intermediary in the attack chain. The attacker does not directly inject code; they inject a prompt that manipulates the LLM into generating code that Flowise then executes without adequate sandboxing. This is **prompt injection → code generation → unsandboxed execution**.

**Fix:** Flowise 3.1.0 introduced a revised `validatePythonCodeForDataFrame()` with an explicit whitelist and denylist of permitted Python syntax and module imports, replacing the bypassable regex approach.

---

## Root Cause Analysis

**Proximate cause:** Four distinct code-level validation failures across three Flowise subsystems allow attacker-controlled input to reach OS-level execution contexts without adequate sanitization or sandboxing.

**Why 1:** Why did user input reach execution contexts in each case?

Each vulnerable component — the MCP adapter, the file storage config handler, and the agent execution layer — was designed to accept user-controlled configuration or input and use it as a parameter in a downstream execution or interpretation step. The design assumption was that sanitization at the boundary would be sufficient.

**Why 2:** Why was boundary sanitization insufficient in all four cases?

The sanitization implementations were incomplete in characteristic ways: `.includes()` instead of `.startsWith()` (CVE-2026-41268), regex blocklists that miss aliased imports (CVE-2026-41264), argument validation that permits `npx` without constraining its flags (CVE-2026-40933), and an environment variable blocklist that omits `NODE_OPTIONS` (CVE-2026-41268). Each is a different incomplete boundary check, but the underlying problem is the same: blocklists and pattern matching are fundamentally insufficient for securing execution contexts.

**Why 3:** Why was a blocklist/denylist approach chosen instead of allowlist-based or isolation-based controls?

Flowise's value proposition is configurability — users can compose arbitrary agent workflows from a visual canvas. Building allowlist controls for MCP commands, Python imports, and configuration parameters requires knowing in advance what legitimate users will do, which conflicts with the platform's open-ended design philosophy. Blocklists are the path of least resistance when the "allow any valid use" requirement is in tension with "block all dangerous patterns."

**Why 4:** Why did this design philosophy persist across three distinct vulnerability waves (CVE-2025-59528, CVE-2025-8943, and now this cluster)?

Each prior fix addressed the specific bypass pattern discovered rather than the architectural pattern that enabled it. CVE-2025-59528 replaced `Function()` with `JSON5.parse()` — it fixed that code path but left the adjacent MCP adapter (CVE-2026-40933) using a similar unsafe serialization pattern. The security model remained: "user-controlled input reaches execution, we'll sanitize it." The architectural alternative — "user-controlled input never reaches execution, we execute from safe templates only" — would require fundamental redesign of how Flowise handles configuration.

**Why 5 / Root cause:** Flowise's architecture grants user-controlled configuration direct access to execution contexts (OS child processes, JavaScript loaders, Python runtimes) as a fundamental design choice. Security is implemented as a sanitization layer on top of this architecture rather than as an architectural isolation boundary. Sanitization layers are inherently incomplete against creative bypass — especially when the "bypass creative space" includes LLM-generated code that can adapt to new evasion patterns the sanitizer was not written to anticipate.

**Root cause summary:** Flowise was architected for maximum configurability with sanitization as an afterthought — user-controlled input is structurally adjacent to execution contexts, making each new feature surface a new execution injection vector. This is the third CVE cluster in twelve months exploiting the same architectural pattern.

---

## Impact Assessment

**Severity:** Critical (justification: CVSS 9.9 and 9.8; unauthenticated root RCE via single HTTP request; exposure of highly sensitive credentials at scale; even as a near-miss, the "exposure of credentials" severity criterion is met by the potential scope of 12,000+ instances)

**Who was affected:**
- Operators of Flowise ≤3.0.13 running publicly accessible chatflows: 12,000–15,000 publicly exposed instances per VulnCheck scan (includes instances still running prior vulnerable versions)
- Downstream users and systems whose credentials were stored in Flowise workflow configurations

**What was affected:**
- LLM API credentials (OpenAI, Anthropic, Azure OpenAI, Google API keys stored in Flowise workflow configs)
- Vector database connection strings and credentials
- Internal business system credentials embedded in agent tool configurations
- Downstream RAG pipelines and AI applications built on Flowise infrastructure

**Quantified impact (near-miss):**
- Confirmed victims: None documented for this CVE cluster
- Instances exposed: 12,000–15,000 publicly accessible per VulnCheck scan during the CVE-2025-59528 campaign — this is the upper-bound count of *any* publicly exposed Flowise instance, not a confirmed count of instances specifically vulnerable to this cluster (≤3.0.13). Instances that had patched to 3.0.6–3.0.13 are safe from CVE-2025-59528 but still vulnerable to this cluster; instances that patched to 3.1.0+ are safe from both. The fraction of the 12,000+ specifically running ≤3.0.13 is unquantified.
- Exploitation barrier: Two HTTP requests for CVE-2026-41268; near-zero for a competent attacker
- Recovery: Upgrade to Flowise 3.1.0+ — no data loss if not exploited

**Containment:** The 30-day coordinated disclosure window between patch (March 16) and CVE publication (April 15–16) is the primary containment mechanism. Operators who monitored Flowise releases and patched promptly were protected before weaponization details were public. The parallel active exploitation of CVE-2025-59528 during this window may have obscured the need to upgrade — operators aware of that campaign may have believed they were protected if they had patched to a version after 3.0.6 but before 3.1.0.

**Pattern note:** The prior CVE-2025-59528 was exploited six months after patching, with 12,000+ instances still unpatched in April 2026. If the same patch adoption pattern holds, exploitation of this cluster becomes increasingly likely over the coming months.

---

## How It Could Have Been Prevented

1. **Sandbox all code execution with OS-level isolation.** The CSVAgent and AirtableAgent vulnerabilities (CVE-2026-41264/41265) are possible because Python code generated by the LLM runs with server process privileges. Running Pyodide in a gVisor or seccomp-hardened container, or using a separate sandboxed subprocess with restricted capabilities (no network, no filesystem, no subprocess spawn), would have eliminated these attack vectors regardless of what the LLM generates. Blocklist validation is never sufficient for sandboxing — OS-level isolation is.

2. **Apply `.startsWith()` instead of `.includes()` for all keyword-based authorization checks.** The FILE-STORAGE:: bypass (CVE-2026-41268) is a single-character conceptual fix: every boundary check that uses string containment for security decisions is a candidate for this class of bypass. Static analysis tooling could flag `.includes()` usage in authorization code paths as a security smell.

3. **Enumerate and block all dangerous Node.js environment variables at the MCP adapter.** `NODE_OPTIONS` is a well-known code execution vector in Node.js — it predates Flowise. A complete Node.js security review would have identified it for blocklisting. The fix was trivial; the gap was the absence of a systematic review of what environment variables could affect Node.js process behavior.

4. **Treat MCP adapter command arguments with the same rigor as OS command injection.** The MCP adapter vulnerability (CVE-2026-40933) is classic CWE-78 OS command injection. The allowable command + args combinations should be constrained to a strict allowlist, not a blocklist of dangerous patterns. `npx` is a particularly dangerous "safe" command because it is a general-purpose package runner.

5. **Implement patch monitoring and automated upgrade pipelines for AI infrastructure dependencies.** The prior CVE-2025-59528 showed that manual patch processes leave Flowise operators exposed for months. Organizations running Flowise in production should have Renovate, Dependabot, or equivalent tooling continuously monitoring for new Flowise releases and surfacing them for prompt upgrade review.

---

## How It Was / Could Be Fixed

**Actual remediation by FlowiseAI (Flowise 3.1.0, March 16, 2026):**

- **CVE-2026-40933:** MCP adapter command serialization overhauled; `validateCommandInjection` argument validation strengthened
- **CVE-2026-41268:** `replaceInputsWithConfig` changed from `.includes('FILE-STORAGE::')` to `.startsWith('FILE-STORAGE::')` check; `NODE_OPTIONS` added to environment variable blocklist
- **CVE-2026-41264 and CVE-2026-41265:** `validatePythonCodeForDataFrame()` replaced bypassable regex with explicit whitelist/denylist of permitted Python syntax and module imports
- **Additional 3.1.0 security hardening:** Path traversal protections, filepath validation, Pyodide execution sanitization, LLM-generated code import prevention, DOM image URL sanitization, IDOR prevention for DocumentStores, mass assignment vulnerability fixes, sensitive cookie transmission fixes, string escaping/encoding improvements, regex vulnerability fixes on user-controlled data, dynamic method call validation

**Additional recommended steps for operators:**

1. Upgrade to Flowise 3.1.2 or later immediately (not just 3.1.0 — subsequent point releases include additional hardening)
2. Audit which deployed chatflows have API Override enabled and publicly shared status — disable API Override on chatflows that do not require it
3. Audit stored credentials in Flowise workflow configurations; rotate any API keys stored in instances that were running ≤3.0.13 and accessible from the internet, even if exploitation is not confirmed (the prior CVE-2025-59528 campaign may have already accessed them)
4. Deploy Flowise behind authentication (reverse proxy with auth, VPN, or Flowise's built-in auth) even for chatflows intended for public use — limit the API Override and MCP node features to authenticated contexts
5. If running CSVAgent or AirtableAgent nodes, audit prompt configurations and consider disabling until OS-level sandboxing can be confirmed

---

## Solutions Analysis

### Solution 1: OS-Level Sandbox Isolation for Code Execution

- **Type:** Sandboxing and Isolation
- **Plausibility:** 5/5 — Would definitively eliminate CVE-2026-41264 and CVE-2026-41265. Even if the LLM generates malicious Python, a properly configured gVisor container or seccomp profile restricting subprocess spawn, network access, and filesystem writes reduces the blast radius to near zero. This is a solved problem in container security.
- **Practicality:** 3/5 — Requires FlowiseAI to redesign the agent execution architecture to route code execution through an isolated subprocess or container. Self-hosted operators can partially mitigate by running Flowise in a restricted container (non-root user, read-only filesystem, dropped capabilities), but cannot fix the underlying Python execution sandboxing without code changes.
- **How it applies:** Replace direct Pyodide execution in the Flowise server process with a sandboxed execution worker: a separate process with no network access, restricted filesystem (read-only data mount only), and a capability-dropped seccomp profile. LLM-generated code runs in this worker; the result is returned to the main process. The worker dies and is recreated for each execution.
- **Limitations:** Adds latency per code execution. Pyodide's architecture (designed for browser sandboxing) may need replacement with a conventional Python subprocess in this model. Does not address the MCP adapter (CVE-2026-40933) or FILE-STORAGE bypass (CVE-2026-41268), which are pre-execution attack vectors.

---

### Solution 2: Input Validation via Allowlist Architecture

- **Type:** Input Validation and Sanitization
- **Plausibility:** 4/5 — A strict allowlist for MCP command + args combinations (CVE-2026-40933) and for Python imports/syntax (CVE-2026-41264/41265) would have blocked these specific exploits. Allowlists are more robust than blocklists — you define what is permitted rather than attempting to enumerate what is forbidden.
- **Practicality:** 3/5 — For MCP commands, an allowlist is practical: Flowise knows what legitimate MCP stdio server patterns look like. For Python code generated by an LLM, an allowlist is harder — LLM output is variable and the permitted operation space (pandas data manipulation) is broad. A function-level allowlist (permit only specific pandas API calls) is feasible but requires ongoing maintenance as pandas evolves.
- **How it applies:** For CVE-2026-40933: replace the command validation with a predefined set of permitted command + args templates; reject anything not in the set. For CVE-2026-41264/41265: replace regex blocklisting with AST-based Python analysis that only permits a whitelist of safe imports and call patterns; reject execution if any prohibited AST node is detected.
- **Limitations:** LLM output is generative — an allowlist designed for legitimate pandas operations may be too restrictive for some valid use cases, reducing the product's utility. AST-based analysis adds complexity and a potential bypass surface of its own (malformed AST, dynamic attribute access). Does not address CVE-2026-41268 (a different validation class).

---

### Solution 3: Authentication and Network Exposure Reduction

- **Type:** Permission Scoping / Least Privilege
- **Plausibility:** 4/5 — CVE-2026-41268 (unauthenticated RCE) requires a publicly accessible chatflow. Requiring authentication for all API Override usage — or disabling API Override by default — eliminates the unauthenticated attack vector entirely. CVE-2026-40933 requires authenticated access and cannot be fully eliminated this way, but raising the authentication bar reduces opportunistic exploitation risk.
- **Practicality:** 4/5 — Flowise already supports authentication. The fix is configuration: require authentication for the prediction API endpoint, or disable API Override globally except for explicitly authorized chatflows. Operators can implement this without any code changes; it is a configuration-level control. Many production Flowise deployments are already behind authentication — those operators were not exposed to CVE-2026-41268.
- **How it applies:** Operators should immediately disable API Override on all chatflows that do not require it, and deploy Flowise behind a reverse proxy that enforces authentication for all API endpoints. FlowiseAI should change the default to API Override disabled, requiring explicit opt-in.
- **Limitations:** Does not address the authenticated-RCE vectors (CVE-2026-40933, CVE-2026-41264/41265 with low-privilege auth). An insider or low-privilege account can still exploit those. Authentication is a perimeter control, not a depth-of-defense control — it reduces the attack surface but does not eliminate execution vulnerabilities.

---

### Solution 4: Monitoring and Anomaly Detection on Execution Behavior

- **Type:** Monitoring and Detection
- **Plausibility:** 3/5 — Runtime behavioral monitoring (unusual child process spawning, unexpected network connections from the Flowise process, anomalous file system writes) can detect exploitation of CVE-2026-40933 and CVE-2026-41268 after the initial exploit but before persistent compromise or exfiltration. For CVE-2026-41264/41265, monitoring the system calls from Pyodide execution could flag OS command invocations.
- **Practicality:** 3/5 — Falco, eBPF-based runtime security (Tetragon, Cilium), or cloud provider security tooling can be deployed alongside Flowise without application code changes. SIEM integration for unusual subprocess patterns is achievable for organizations with existing security tooling. For self-hosted Flowise operators without security infrastructure, this is lower practicality.
- **How it applies:** Deploy runtime security monitoring with rules that flag: (a) child processes spawned by the Flowise Node.js process with `npx` or `node` commands containing unexpected flags; (b) network connections from Pyodide Python execution contexts; (c) file writes to unusual paths from the Flowise process. Alert on deviation from baseline.
- **Limitations:** Detection-not-prevention — the exploit has already executed by the time monitoring fires. Does not prevent initial credential access if the attacker moves fast. Requires security tooling infrastructure that many Flowise self-hosters do not have. Requires establishing a behavioral baseline, which is non-trivial for a platform as configurable as Flowise.

---

### Solution 5: Architectural Separation of LLM Output from Execution Trust

- **Type:** Architectural Redesign
- **Plausibility:** 5/5 — The root cause of CVE-2026-41264 and CVE-2026-41265 is a single architectural assumption: LLM-generated code can be trusted for execution with server privileges. If LLM output is treated as untrusted by default — requiring explicit human review and approval before any code is executed — these CVEs cannot be exploited. The architectural change is conceptually simple: LLM output is data, not instructions.
- **Practicality:** 2/5 — This fundamentally changes Flowise's value proposition. The product's utility for CSVAgent and AirtableAgent comes from the ability to execute LLM-generated code automatically without human review. Adding a mandatory review step defeats the automation purpose. A partial implementation (sandbox-first, execute only if sandbox succeeds; or: preview mode with human approval for new prompt patterns) preserves some utility while introducing a trust boundary. This requires significant product redesign and may be unacceptable to Flowise's user base.
- **How it applies:** Implement a "safe execution preview" architecture: LLM-generated code is first executed in a throwaway isolated container with mocked data; the result is shown to the user for confirmation before server-side execution with real data. Alternatively: LLM-generated code is compiled to an AST, validated against a safe-by-construction template (parameterized pandas operations only), and rejected if the code cannot be expressed in the template language.
- **Limitations:** Major friction for legitimate use cases. Template-based approach constrains LLM flexibility. May require significant ML/product investment to make the safe preview useful rather than obstructive. Does not address MCP adapter or FILE-STORAGE bypass CVEs (different attack class).

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-052]] | Langflow CVE-2026-33017: Unauthenticated RCE in the competing AI workflow builder Langflow (exec() injection via `/api/v1/run` endpoint). Same root cause class — user input reaching Python execution without adequate isolation. Same consequence — credential cascade to all connected AI providers and downstream systems. Langflow was exploited within 20 hours of advisory publication; Flowise coordinated a 30-day patch window. Both incidents demonstrate the systemic vulnerability of open-source AI workflow builders that prioritize configurability over execution isolation. |

**Prior Flowise incidents (unpublished as of curation date):**

| CVE | Connection |
|-----|------------|
| CVE-2025-59528 (CVSS 10.0) | FlowiseAI CustomMCP node JavaScript `Function()` constructor injection — direct code injection (not prompt-injection mediated). Patched September 2025 in Flowise 3.0.6. Actively exploited April 2026. Same MCP attack surface as CVE-2026-40933; different code path and vulnerability class. The six-month exploitation window demonstrates the patch adoption problem that makes this cluster's near-miss status fragile over time. |
| CVE-2025-8943 (CVSS 9.8) | Unauthenticated OS command RCE — different component from the 2026 cluster; represents the earlier wave of Flowise execution vulnerabilities. |

---

## Strategic Council Review

*Conducted: 2026-05-07. Reviewer operates from the draft alone — no research file, no Stage 2 reasoning.*

---

### Phase 1 — Challenger

**1. The 12,000+ exposed instance figure is the wrong denominator for this cluster's damage estimate.**

The report's unit_count of 12,000 in the damage methodology comes from a VulnCheck scan of publicly exposed Flowise instances — but that scan was conducted in the context of the CVE-2025-59528 exploitation campaign (April 2026), not as a census of instances specifically vulnerable to this cluster (≤3.0.13). Flowise 3.0.6 patched CVE-2025-59528 in September 2025. By April 2026, many of those 12,000+ instances may have already patched past 3.0.6 but not yet to 3.1.0 — making them safe from CVE-2025-59528 but still vulnerable to this cluster. Or they may have patched all the way to 3.1.0+. The report uses 12,000 as if it equals "instances vulnerable to this cluster," but it actually means "any publicly exposed Flowise instance observed during the prior CVE campaign." These are different populations. The damage estimate's denominator is unverified for this specific cluster.

**2. Critical severity with a 30-day patch lead time invites a category-error objection.**

The report justifies Critical severity by citing CVSS 9.9/9.8 and the "exposure of credentials" criterion. But the CVSS discrepancy between NIST (9.8) and GitHub's own CNA (7.7) is non-trivial — a 2.1-point gap on a 10-point scale reflects the CNA's judgment that the three preconditions (API Override enabled, chatflow publicly shared, MCP node present) are meaningful. If the CNA score better characterizes real-world deployments (e.g., API Override is not enabled by default and most production Flowise deployments behind authentication do not have it enabled), then the practical exploitation barrier is higher than the headline suggests. The report defaults to NIST without adequately engaging with why the CNA's precondition assessment is wrong for this deployment population.

**3. The $9.9M averted damage estimate applies the IBM benchmark to the wrong asset class.**

The methodology uses $165/credential record from the IBM 2024 Cost of a Data Breach Report. The IBM figure measures the cost of a compromised *personal data record* — customer PII, payment card data, health records. LLM API keys and database connection strings are not personal data records in the IBM methodology. A single compromised OpenAI API key with no spend cap could enable far more than $165 in unauthorized charges within hours of theft. Conversely, a credential from a dev-tier Flowise instance with a $20/month cap represents far less exposure. The benchmark is not matched to the asset class. The estimate may be directionally correct but the unit economics do not hold up to scrutiny.

**4. The "recurring systemic failure" framing overstates architectural determinism.**

Three CVE clusters in twelve months is the claimed pattern. But the root cause analysis asserts architectural continuity — "the same design pattern" — across three distinct subsystems (CustomMCP Function() injection, MCP adapter command sanitization, and agent execution Python filtering). A more skeptical reading: these are three different engineers making three different category mistakes in three different code paths, all of which happen to be execution surfaces. This is indistinguishable from ordinary fast-moving OSS security debt. The architectural claim (sanitization-as-bolt-on rather than isolation-as-foundation) is compelling but not proven by three data points alone — Langflow, LangChain, and Dify all have comparable vulnerability histories without the architectural framing.

**5. CVE-2026-41264/41265 novelty claim is overstated.**

The draft describes "prompt injection → code generation → unsandboxed execution" as a novel attack class. But this is mechanically equivalent to any system where user-controlled input reaches an interpreter: the LLM is the interpreter. The actual novel element is narrow: the intermediate LLM step means the injection pathway is probabilistic and model-dependent rather than deterministic. This distinction is operationally significant (as the Steelman will note) but the draft frames it as a new attack class rather than a new delivery mechanism for an old attack class (code injection to unsandboxed execution). This matters for taxonomy precision.

**6. The active exploitation language in the headline and timeline creates ambiguity that the body text corrects but cannot fully undo.**

The executive summary opens by noting "no exploitation of this specific cluster has been confirmed" — correct. But the timeline's April 6–7 entries ("VulnCheck detects first in-the-wild exploitation") and the trade press sources cited (CSO Online, The Hacker News) all refer to CVE-2025-59528 activity. A reader skimming the timeline and sources would plausibly infer that the exploitation energy of the prior CVE is evidence for this cluster's risk. The researcher_notes correction is in the right place but the timeline should make the CVE-specific attribution explicit inline, not only in a notes section.

---

### Phase 2 — Steelman

**1. Critical severity is intrinsic to the vulnerability, not dependent on current exploitation state.**

CVSS scores describe vulnerability capability, not current exploitation status. CVE-2026-41268 requires one unauthenticated HTTP POST to achieve root RCE — that is the definitional maximum of exploitation simplicity. The 30-day coordinated disclosure window is a mitigation factor for harm, not a severity reduction. The near-miss classification already adjusts for actual harm observed; lowering severity to High because a patch was available would conflate the vulnerability rating with the incident's harm outcome. The report correctly separates severity (Critical, intrinsic) from incident classification (near-miss, outcome-based).

**2. The LLM-as-intermediary introduces operational novelty that static analysis cannot address.**

The Challenger correctly notes this is mechanically similar to classic code injection. The Steelman point is about operational novelty, not academic novelty. When injection reaches an exec context through eval() or subprocess(), static analysis tools (CodeQL, Semgrep) can trace the data flow deterministically. When injection goes through an LLM, the attack path cannot be found by static analysis — because the LLM is a runtime probabilistic component. The import aliasing bypass (`import pandas as np, os as pandas`) does not look dangerous to a model asked to "analyze this CSV file" — it looks like a valid multi-import line. Safety training on "do not write os.system" does not catch this because the bypass is structural, not semantic. This is the operational novelty: the attack class cannot be patched by patching code, only by architectural isolation.

**3. MCP adapter as attack surface (CVE-2026-40933) is consequential for the field beyond Flowise.**

The MCP stdio transport model fundamentally spawns OS child processes as part of its architecture — this is not a Flowise-specific implementation choice, it is how stdio-transport MCP servers work. Any platform implementing MCP with stdio transport and user-configurable server commands faces the same class of vulnerability. CVE-2026-40933 is one of the first documented exploitations of this pattern in a high-profile AI platform. Documenting it before MCP adoption becomes widespread — which is occurring in 2026 — serves the preventive function AgentFail is designed for.

**4. Three clusters in twelve months is pattern evidence, not proof, and pattern evidence is appropriate at this stage.**

The Challenger is correct that three data points do not prove architectural causation. But the report does not claim proof — it documents a pattern for operator attention and frames it as a hypothesis about root cause. The root cause analysis specifically traces how CVE-2025-59528's fix (replacing Function() in CustomMCP) left the adjacent MCP adapter with equivalent unsafe serialization, demonstrating that the prior fix did not generalize to the same pattern in a nearby subsystem. This is more than coincidence — it is evidence that the fix cycle was narrow. Whether this is "architecture" or "inadequate cross-subsystem security review" is a distinction without operational difference for operators deciding whether to trust Flowise's security posture.

**5. The damage estimate's methodological conservatism is appropriate for a near-miss.**

No damage estimate methodology for a near-miss is correct in a precise sense. The IBM benchmark mismatch is real, but the alternatives — no estimate, or a highly speculative custom model — provide less comparative value for AgentFail's incident database. The 5% probability weight is explicitly conservative, the high-range figure ($990M) captures the upside tail, and the notes acknowledge the benchmark mismatch. For the database's purpose (operator decision-making about risk priority), "order-of-magnitude near-miss estimate using industry-standard unit costs, adjusted by low exploitation probability" is defensible and more useful than silence.

---

### Phase 3 — Synthesis

**Items that require updates before publication:**

1. **The 12,000+ figure needs explicit qualification in the Impact Assessment section.** The body text should state clearly that 12,000+ represents publicly exposed Flowise instances per the VulnCheck CVE-2025-59528 campaign scan, and that the count of instances specifically vulnerable to *this cluster* (≤3.0.13) is unquantified. This is already in researcher_notes; it needs one sentence in the Impact Assessment "Quantified impact" subsection. The damage estimate's methodology notes should similarly qualify unit_count as an upper bound.

2. **The timeline entries for April 6–7 should carry explicit CVE attribution inline.** Currently, "VulnCheck detects first in-the-wild exploitation" appears as a timeline event without inline clarification that this is CVE-2025-59528, not this cluster. Add "(CVE-2025-59528, not this cluster)" inline to those two rows.

**Items that do not require updates (Steelman holds):**

- Critical severity: correct. CVSS scores are intrinsic to vulnerability, not outcome-dependent.
- NIST 9.8 as baseline with CNA 7.7 acknowledged: correct approach for near-miss risk record.
- LLM cooperation qualifier: already addressed in the existing Phase 2 defense. Operationally significant, not requiring a severity reduction.
- $9.9M estimate: defensible as order-of-magnitude near-miss quantification with acknowledged uncertainty.
- Systemic pattern framing: appropriate as documented hypothesis, not overclaimed as proof.
- Novelty claim: the "novel attack class" language could be tightened to "novel delivery mechanism for code injection via LLM intermediary," but this is editorial rather than analytical — not a blocking issue.

**Final verdict:** APPROVE WITH NOTE. Publish as near-miss Critical after the two targeted inline corrections. The core analytical work — source disambiguation, systemic root cause framing, the CVE-2026-41264/41265 LLM-as-intermediary characterization — is this record's primary editorial value and is well-executed.

**Confidence level:** Medium. Technical CVE details are high-confidence (primary advisories, NIST NVD, Positive Technologies). Exploitation probability (5%) and damage estimate ($9.9M averted) are inherently speculative for a near-miss but appropriately framed. The systemic pattern characterization is supported by documented evidence but cannot be conclusively proven with three data points.

**Unresolved uncertainties (for follow-up curation cycle):**
- Whether CVE-2026-41268 has been exploited as a distinct in-the-wild campaign (separate from CVE-2025-59528) — GreyNoise/VulnCheck query on CVE-2026-41268 signatures in May–July 2026 would resolve.
- What fraction of the 12,000+ exposed instances have patched to 3.1.0+ — determines whether near-miss classification should be revised to "partial" in a follow-up record.
- CVE-2026-41137 and CVE-2026-41274 (Medium source only) — if primary advisories are confirmed, they expand the cluster scope and the attack surface analysis.

**Required pre-publish actions:**
1. Add "(CVE-2025-59528, not this cluster)" inline to the April 6 and April 7 timeline rows.
2. Add one qualifying sentence to the Impact Assessment "Quantified impact" subsection: the 12,000+ figure is the exposed-Flowise-instance upper bound from the prior CVE campaign, not a confirmed count of instances vulnerable to this cluster.

---

## Key Takeaways

1. **Patch Flowise immediately and track releases proactively.** CVE-2026-41268 is a single unauthenticated HTTP request to root RCE on any exposed Flowise instance running ≤3.0.13 with a public chatflow containing an MCP node. The fix is available in 3.1.0+ (current: 3.1.2). The prior CVE-2025-59528 showed that manual patch processes leave Flowise operators exposed for months — use Dependabot, Renovate, or equivalent tooling to monitor Flowise npm package releases automatically.

2. **LLM-generated code is untrusted input, not trusted instructions.** CVE-2026-41264 and CVE-2026-41265 introduce a failure mode that will appear in other AI platforms: an attacker manipulates the LLM via prompt injection, and the LLM's output (code) is executed on the server without sandboxing. The security model must treat LLM output as user-controlled data — subject to the same input validation and execution sandboxing requirements as any other untrusted input.

3. **Blocklists and denylist-based validation are not sufficient for securing execution contexts.** All four CVEs in this cluster bypass validation through creative input crafting (aliased imports, comment-embedded keywords, environment variable omissions). The correct control is architectural isolation: code that reaches an execution context should be sandboxed at the OS level, not filtered by pattern matching.

4. **MCP adapters are a new, high-risk attack surface for AI platforms.** CVE-2026-40933 targets Flowise's MCP implementation specifically. As MCP adoption accelerates across AI tooling ecosystems in 2026, the pattern of user-configurable MCP stdio servers spawning OS child processes will appear in many platforms. Security teams should treat MCP configuration surfaces with the same rigor as OS command execution APIs — because they are.

5. **Audit and rotate credentials stored in AI workflow platforms after any vulnerability disclosure.** Flowise instances store LLM API keys, vector database credentials, and business system secrets as part of workflow configuration. Even without confirmed exploitation of this cluster, the parallel CVE-2025-59528 exploitation campaign may have already accessed credentials in instances that ran vulnerable versions. Any organization running Flowise should rotate credentials as a precautionary measure after this disclosure, regardless of patch status.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| GitHub Advisory Database — CVE-2026-40933 (GHSA-c9gw-hvqq-f33r) | https://github.com/advisories/GHSA-c9gw-hvqq-f33r | 2026-04-15 | High — primary advisory |
| GitHub Advisory Database — CVE-2026-41268 (GHSA-cvrr-qhgw-2mm6) | https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-cvrr-qhgw-2mm6 | 2026-04-16 | High — primary advisory; NOTE: GHSA-3gcm-f6qx-ff7p resolves to prior CVE-2025-59528, not this CVE |
| NIST NVD — CVE-2026-41268 | https://nvd.nist.gov/vuln/detail/CVE-2026-41268 | 2026-04-16 | High — authoritative CVSS scoring; NIST 9.8 vs GitHub CNA 7.7 discrepancy documented |
| Positive Technologies — Technical analysis of CVE-2026-41268 (PT-2026-34733) | https://dbugs.ptsecurity.com/vulnerability/PT-2026-34733 | 2026-04-16 | High — independent security firm; most technically precise FILE-STORAGE bypass analysis |
| GitHub Advisory Database — CVE-2026-41264 (GHSA-3hjv-c53m-58jj) | https://github.com/advisories/GHSA-3hjv-c53m-58jj | 2026-04-16 | High — primary advisory |
| GitLab Advisory Database — CVE-2026-41265 (GHSA-f228-chmx-v6j6) | https://advisories.gitlab.com/npm/flowise/GHSA-f228-chmx-v6j6/ | 2026-04-16 | High — mirrors GitHub advisory |
| Flowise 3.1.0 Release Notes | https://github.com/FlowiseAI/Flowise/releases/tag/flowise@3.1.0 | 2026-03-16 | High — primary source for patch contents and security hardening list |
| CSO Online — Hackers exploit critical Flowise flaw | https://www.csoonline.com/article/4155680/hackers-exploit-a-critical-flowise-flaw-affecting-thousands-of-ai-workflows.html | 2026-04 | Medium — trade press; primarily covers CVE-2025-59528 exploitation; conflates with new cluster |
| The Hacker News — Flowise AI Agent Builder Under Active Attack | https://thehackernews.com/2026/04/flowise-ai-agent-builder-under-active.html | 2026-04 | Medium — VulnCheck sourced; 12,000+ instance figure; conflates CVE-2025-59528 with new cluster |
| Security Affairs — CVE-2025-59528 exploitation | https://securityaffairs.com/190471/security/attackers-exploit-critical-flowise-flaw-cve-2025-59528-for-remote-code-execution.html | 2026-04 | Medium — trade press; prior CVE exploitation coverage |
| SecurityWeek — Critical Flowise Vulnerability | https://www.securityweek.com/critical-flowise-vulnerability-in-attacker-crosshairs/ | 2026-04 | Medium — trade press; useful for VulnCheck attribution |
| Independent AI Threat Intel Briefing (@xyz031702) | https://medium.com/@xyz031702/ai-threat-intelligence-briefing-64cfc4a36726 | 2026-04 | Low-Medium — unknown authorship; broadest CVE coverage including unverified CVE-2026-41137/41274; corroborative only |
| THREATINT — CVE-2026-41264 | https://cve.threatint.eu/CVE/CVE-2026-41264 | 2026-04-16 | Medium — CVE aggregator; useful for CVSS 4.0 vector |
| THREATINT — CVE-2026-41268 | https://cve.threatint.eu/CVE/CVE-2026-41268 | 2026-04-16 | Medium — CVE aggregator |
