---
id: "AAGF-2026-061"
title: "CrewAI Four-CVE Chain: Prompt Injection to RCE, SSRF, and Arbitrary File Read via Silent Sandbox Fallback"
status: "reviewed"
date_occurred: "2025-12-01"        # Approximate — vulnerability predates discovery; exact introduction date unknown
date_discovered: "2026-01-05"      # Date researcher (Yarden Porat, Cyata) notified CERT/CC and vendor
date_reported: "2026-03-26"        # First public disclosure per CERT/CC advisory VU#221883
date_curated: "2026-05-07"
date_council_reviewed: "2026-05-07"

# Classification
category:
  - "Prompt Injection"
  - "Tool Misuse"
  - "Unauthorized Data Access"
  - "Infrastructure Damage"
  - "Autonomous Escalation"
severity: "critical"
agent_type:
  - "Multi-Agent System"
  - "Tool-Using Agent"
  - "RAG Agent"
  - "Coding Assistant"
agent_name: "CrewAI Code Interpreter Tool, JSON Loader Tool, RAG Search Tools"
platform: "CrewAI (open-source multi-agent orchestration framework)"
industry: "AI Infrastructure / Cross-Industry"

# Impact
financial_impact: "Not quantified — no confirmed in-the-wild exploitation as of May 2026; potential impact is host-level compromise and credential theft across all production CrewAI deployments with Code Interpreter enabled"
financial_impact_usd: null
refund_status: "unknown"
refund_amount_usd: null
affected_parties:
  count: null                    # Unknown — widespread CrewAI deployments globally; no scan data available
  scale: "widespread"
  data_types_exposed: ["credentials", "PII", "source_code"]

# Damage Timing
damage_speed: "instantaneous"     # Theoretical — full exploit chain executes within a single agent invocation cycle
damage_duration: "not applicable" # Near-miss — no confirmed exploitation
total_damage_window: "not applicable" # Vulnerability window: ~Jan 2026 to present; SSRF/file read unpatched as of Apr 17, 2026

# Recovery
recovery_time: "not required"     # No exploitation confirmed; patch partial (sandbox CVEs only)
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "Operators must upgrade to ≥1.12.2 for sandbox CVEs; no patch available for CVE-2026-2285 (file read) or CVE-2026-2286 (SSRF) as of April 17, 2026. Operators must manually disable Code Interpreter Tool or add network/filesystem controls as interim mitigations."
full_recovery_achieved: "partial"  # Sandbox CVEs partially fixed; file read and SSRF remain unpatched

# Business Impact
business_scope: "multi-org"
business_criticality: "high"
business_criticality_notes: "Any organization running CrewAI with Code Interpreter Tool, JSON Loader, or RAG Search enabled is exposed to the full compromise chain. CrewAI is a widely-adopted production framework used in software development automation, data pipelines, customer service, and research — placing the aggregate exposure across all deployments in the high-to-existential range for affected operators."
systems_affected: ["agent-runtime", "host-filesystem", "credentials-store", "internal-network", "cloud-metadata-endpoints", "production-workflows"]

# Vendor Response
vendor_response: "acknowledged"    # CrewAI acknowledged Jan 21; partial fix in 1.12.2; SSRF/file read unpatched as of Apr 17
vendor_response_time: "7-30 days"  # Notified Jan 5; vendor statement Jan 21 (~16 days); partial fix in 1.12.2 (Mar 25, ~79 days)

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: 25000000      # 50,000 instances × $10,000/machine × 5% probability weight
  averted_range_low: 5000000        # 50,000 × $10,000 × 1%
  averted_range_high: 500000000     # 50,000 × $10,000 × 100% (raw ceiling, pre-probability)
  composite_damage_usd: 25000000
  confidence: "estimated"
  probability_weight: 0.05          # PoC exists and is publicly documented; no weaponized in-the-wild exploitation; requires attacker to reach agent with prompt injection
  methodology: "50,000 conservative baseline (widespread CrewAI deployments) × $10,000/machine (SANS 2024 remediation) × 5% exploitation probability"
  methodology_detail:
    per_unit_cost_usd: 10000
    unit_count: 50000
    unit_type: "machine"
    multiplier: null
    benchmark_source: "SANS 2024 — $10,000/machine remediation cost"
  estimation_date: "2026-05-07"
  human_override: false
  notes: "Raw ceiling ($500M) exceeds $1B threshold only under full exploitation probability — flagged for human review. Probability-weighted figure ($25M) is the operative estimate. Unit count (50,000) is a conservative baseline from 'widespread' qualifier with no public Shodan/Censys scan data available. No supply chain multiplier applied despite CrewAI being a framework dependency — multiplier would dramatically expand the range given downstream application embedding. Treat as order-of-magnitude orientation."

# Presentation
headline_stat: "Four chained CVEs in CrewAI: prompt injection reaches ctypes → native RCE. Sandbox that's supposed to contain execution silently falls back to an insecure mode when Docker disappears — with no warning to the operator. SSRF and arbitrary file read remain unpatched."
operator_tldr: "If you run CrewAI with Code Interpreter Tool, JSON Loader, or RAG Search: upgrade to ≥1.12.2 immediately for partial sandbox protection, then disable the Code Interpreter Tool entirely or add Docker availability guarantees and filesystem/network egress controls — two of four CVEs have no patch yet."
containment_method: "third_party"   # Discovered by external researcher (Yarden Porat, Cyata); disclosed via CERT/CC; no platform guardrail caught it
public_attention: "medium"

# Near-miss classification
actual_vs_potential: "near-miss"
potential_damage: "Any organization running CrewAI with Code Interpreter Tool enabled is exposed to full remote code execution on the host machine via the silent SandboxPython fallback and ctypes escape. Separately, the JSON Loader Tool (unpatched) allows arbitrary filesystem reads — /etc/passwd, .env files, private keys, database credentials. The RAG Search Tools (unpatched) allow SSRF into internal networks including cloud metadata endpoints (169.254.169.254). A successful full chain gives an attacker the same OS-level access as the agent process — in production deployments this typically includes secrets stores, CI/CD credentials, and internal APIs. Supply chain exposure propagates to all applications built on CrewAI as a dependency."
intervention: "Vulnerabilities discovered through proactive security research by Yarden Porat (Cyata), not through forensic analysis of a breach. Coordinated 80-day disclosure window via CERT/CC (Jan 5 → Mar 26, 2026) gave maintainers private remediation time before public disclosure. No confirmed in-the-wild exploitation found in any source as of May 7, 2026."

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0051"        # LLM Prompt Injection — primary attack vector for full chain
    - "AML.T0051.001"    # Indirect prompt injection — poisoned documents via RAG retrieval
    - "AML.T0053"        # AI Agent Tool Invocation — attacker causes agent to invoke Code Interpreter/file/RAG tools
    - "AML.T0085.001"    # AI Agent Tools — Code Interpreter/JSON Loader/RAG tools as attack primitives
    - "AML.T0105"        # Escape to Host — ctypes-based escape from SandboxPython to host OS
    - "AML.T0112.000"    # Local AI Agent — local CrewAI agent instance fully compromised
    - "AML.T0086"        # Exfiltration via AI Agent Tool Invocation — file read + SSRF enable credential/data exfiltration
    - "AML.T0085.001"    # AI Agent Tools — weaponized for unauthorized data access
    - "AML.T0083"        # Credentials from AI Agent Configuration — .env and filesystem credential theft
    - "AML.T0098"        # AI Agent Tool Credential Harvesting — credentials accessible via JSON Loader and filesystem RCE
    - "AML.T0101"        # Data Destruction via AI Agent Tool Invocation — full RCE potential includes destructive actions
  owasp_llm:
    - "LLM01:2025"       # Prompt Injection — the initial attack vector enabling the entire chain
    - "LLM06:2025"       # Excessive Agency — agents have Code Interpreter + file system + network access without per-action authorization
    - "LLM02:2025"       # Sensitive Information Disclosure — arbitrary file reads expose credentials, keys, secrets
  owasp_agentic:
    - "ASI01:2026"       # Prompt Injection via External Content — indirect injection through RAG-retrieved documents
    - "ASI02:2026"       # Tool Misuse and Exploitation — Code Interpreter/JSON Loader/RAG tools weaponized by injected instructions
    - "ASI03:2026"       # Autonomous Escalation — agent escalates from LLM inference to file system access to native code execution
    - "ASI05:2026"       # Unexpected Code Execution — ctypes escape achieves native host code execution from sandboxed context
  ttps_ai:
    - "2.5.5"            # Prompt Injection
    - "2.5.9"            # Indirect Prompt Injection via External Content
    - "2.5.4"            # AI Agent Tool Invocation
    - "2.7"              # Privilege Escalation / Sandbox Escape
    - "2.9"              # Credential Access — .env, private keys, filesystem credential theft
    - "2.12"             # Unauthorized Data Access — arbitrary file reads
    - "2.15"             # Exfiltration — file read and SSRF enable outbound data exfiltration
    - "2.16"             # Impact — full host compromise potential

# Relationships
related_incidents:
  - "AAGF-2026-013"   # Flowise MCP RCE (CVSS 10.0): Nearest structural analog — open-source AI agent builder, unsandboxed code execution as design primitive (Function() constructor vs. ctypes escape), CISA KEV, credential cascade. Both are members of the ai-agent-platform-security-crisis pattern group.
  - "AAGF-2026-052"   # Langflow CVE-2026-33017: Same pattern — AI orchestration platform, exec()-based execution, credential aggregator role. Langflow had active in-the-wild exploitation; CrewAI is a near-miss, but root causes are architecturally identical: fail-open sandbox design.
  - "AAGF-2026-022"   # MCP STDIO Design Flaw: Architectural parallel — execute-before-validate as a design philosophy. MCP STDIO executes tool calls before validating origin; CrewAI executes Code Interpreter in an insecure fallback before validating sandbox state.
  - "AAGF-2026-015"   # Antigravity Prompt Injection Chain: Same class of prompt-injection-to-sandbox-escape chain in an AI coding context; demonstrates that the composition of prompt injection + tool execution is a recurring compound attack class.
pattern_group: "ai-agent-platform-security-crisis"
tags:
  - crewai
  - cve-2026-2275
  - cve-2026-2285
  - cve-2026-2286
  - cve-2026-2287
  - prompt-injection
  - sandbox-escape
  - ctypes
  - rce
  - ssrf
  - arbitrary-file-read
  - sandboxpython
  - docker-fallback
  - fail-open
  - cert-cc
  - vu221883
  - multi-cve-chain
  - unpatched
  - crewai-tools
  - indirect-prompt-injection
  - rag-injection
  - host-compromise
  - credentials
  - multi-agent
  - open-source

# Metadata
sources:
  - url: "https://kb.cert.org/vuls/id/221883"
    title: "CERT/CC Vulnerability Note VU#221883 — CrewAI Multiple Vulnerabilities"
    publisher: "CERT Coordination Center (Carnegie Mellon SEI)"
    date: "2026-03-30"
    credibility: "High — authoritative neutral third-party advisory; structured coordinated disclosure process; versioned and dated; primary technical source for all four CVEs"
  - url: "https://www.securityweek.com/crewai-vulnerabilities-expose-devices-to-hacking/"
    title: "CrewAI Vulnerabilities Expose Devices to Hacking"
    publisher: "SecurityWeek"
    date: "2026-04-01"
    credibility: "High — reputable security trade press; references CERT/CC advisory; editorial review; accurate CVE summary"
  - url: "https://dbugs.ptsecurity.com/vulnerability/PT-2026-29049"
    title: "PT-2026-29049 — CVE-2026-2285 Arbitrary File Read in CrewAI JSON Loader"
    publisher: "PT Security dbugs"
    date: "2026-04-01"
    credibility: "High — provides CVSS v3.1 vector for CVE-2026-2285 (7.5 High); cross-references CERT/CC; no unverified quantitative claims"
  - url: "https://www.thaicert.or.th/en/2026/04/02/multiple-vulnerabilities-in-crewai-allow-sandbox-escape-and-remote-code-execution-via-prompt-injection/"
    title: "Multiple Vulnerabilities in CrewAI Allow Sandbox Escape and Remote Code Execution via Prompt Injection"
    publisher: "ThaiCERT (National Cybersecurity Agency, Thailand)"
    date: "2026-04-02"
    credibility: "High — government CERT advisory; references CERT/CC; corroborates CVE details without independent claims"
  - url: "https://www.pointguardai.com/ai-security-incidents/crewai-vulnerabilities-enable-prompt-injection-to-system-takeover"
    title: "CrewAI Vulnerabilities Enable Prompt Injection to System Takeover"
    publisher: "PointGuard AI"
    date: "2026-04-01"
    credibility: "Medium — AI security tracker; provides qualitative analysis and AISSI proprietary score; no in-the-wild exploitation claims; useful for context"
  - url: "https://gbhackers.com/crewai-hit-by-critical-vulnerabilities/"
    title: "CrewAI Hit By Critical Vulnerabilities"
    publisher: "GBHackers"
    date: "2026-04-01"
    credibility: "Medium — security news blog; accurate summary of CERT/CC findings; no original technical analysis"
researcher_notes: "This incident is structurally significant as the clearest documented case of a compound multi-CVE chain in a multi-agent framework where all four vulnerabilities interact. The most analytically important element is the fail-open sandbox design: the decision to silently fall back to an insecure execution environment when Docker is unavailable (CVE-2026-2287 → CVE-2026-2275) without any operator warning or fail-closed behavior. This is not a bug in isolation — it is a design philosophy choice with security consequences that compound when prompt injection is in scope. Two of four CVEs (SSRF, file read) remained unpatched as of the advisory's last revision on April 17, 2026 — an unusual outcome given the 80-day coordinated disclosure window. The pattern group membership (ai-agent-platform-security-crisis) is justified on the same three criteria as AAGF-2026-013 (Flowise) and AAGF-2026-052 (Langflow): open-source AI orchestration platform, code execution as design primitive, credential aggregator role. Unlike those two incidents, CrewAI has no confirmed in-the-wild exploitation — this is a near-miss, not a partial or confirmed incident — which affects severity framing and damage estimate calibration. The potential scope is broad: CrewAI is among the most widely-adopted open-source multi-agent frameworks, with widespread enterprise production use. No Shodan/Censys scan data for vulnerable CrewAI deployments was found; the 50,000 unit count in the damage estimate is a conservative inference from 'widespread' deployment designation. The CVSS gap is notable: only CVE-2026-2285 has a published score (7.5 High); the RCE CVEs (2026-2275, 2026-2287) and SSRF CVE (2026-2286) have no published CVSS scores from CERT/CC or any authoritative source. Given the full chain produces host RCE via ctypes, the composite severity is Critical regardless of individual CVE scores."
council_verdict: "Technically well-grounded four-CVE chain with professionally defensible Critical composite severity; the fail-open sandbox design is correctly identified as the structural root cause — but the damage estimate rests on an uninvestigated deployment count, the sandbox-CVE fix in v1.12.2 is unconfirmed in official sources, and two CVEs remain unpatched at public disclosure, making this a high-confidence architectural finding with medium-confidence quantitative framing."
---

# CrewAI Four-CVE Chain: Prompt Injection to RCE, SSRF, and Arbitrary File Read via Silent Sandbox Fallback

## Executive Summary

Four chained vulnerabilities in CrewAI — the widely-adopted open-source multi-agent AI orchestration framework — allow an attacker who can reach an agent with a prompt injection to escalate to full remote code execution on the host machine, arbitrary filesystem reads (credentials, secrets, `.env` files), and server-side request forgery into internal network infrastructure including cloud metadata endpoints. The critical design flaw is a silent, fail-open sandbox fallback: when Docker becomes unavailable, CrewAI's Code Interpreter silently degrades to an insecure Python sandbox (SandboxPython) that does not block `ctypes`, enabling arbitrary C library calls and native host code execution. Discovered by researcher Yarden Porat (Cyata) and disclosed via CERT/CC advisory VU#221883 in March 2026, the chain has no confirmed in-the-wild exploitation — but two of four CVEs (the SSRF and arbitrary file read vulnerabilities) remained unpatched as of April 17, 2026, leaving production deployments exposed more than 100 days after initial vendor notification.

---

## Timeline

| Date | Event |
|------|-------|
| ~2025-12-01 | Vulnerabilities exist in CrewAI production deployments (estimated; exact introduction date unknown) |
| 2026-01-05 | Yarden Porat (Cyata) notifies CERT/CC and CrewAI maintainers of all four vulnerabilities; coordinated disclosure window begins |
| 2026-01-21 | CrewAI issues formal vendor statement; acknowledges vulnerabilities; outlines planned mitigations including adding `ctypes` to `BLOCKED_MODULES` |
| 2026-03-25 | CrewAI v1.12.2 released — changelog references "Revise security policy and reporting instructions"; partial fix for sandbox CVEs (CVE-2026-2275, CVE-2026-2287) unconfirmed in official changelog |
| 2026-03-26 | First public disclosure of vulnerabilities per CERT/CC advisory |
| 2026-03-30 | CERT/CC publishes formal advisory VU#221883 with full technical details for all four CVEs |
| 2026-04-01 | SecurityWeek, GBHackers, PointGuard AI, ThaiCERT (Apr 2) publish coverage |
| 2026-04-17 | CERT/CC advisory last revised — CVE-2026-2285 (file read) and CVE-2026-2286 (SSRF) confirmed unpatched |
| 2026-05-07 | Research date — no confirmed in-the-wild exploitation found across any source |

---

## What Happened

CrewAI is one of the most widely-adopted open-source frameworks for building multi-agent AI systems. Organizations across software engineering, data analytics, customer service, and research automation use CrewAI to orchestrate autonomous agents that plan, delegate, and execute tasks — including running code, searching the web, and reading documents — without human review of each individual action.

In early 2026, security researcher Yarden Porat of Cyata discovered that CrewAI's tool execution architecture contained four vulnerabilities that could be chained, starting from a single prompt injection, to achieve complete host-machine compromise. Porat notified CERT/CC and CrewAI's maintainers on January 5, 2026, initiating an 80-day coordinated disclosure window before public release.

The attack begins with prompt injection — either through direct user input to an agent interface, or indirectly through content the agent retrieves from external sources (a poisoned document, a malicious URL returned by a search tool, adversarial text in a RAG-retrieved corpus). The injection causes the agent's underlying LLM to generate instructions that invoke CrewAI's built-in tools with attacker-controlled parameters.

From that injection point, the attack forks into up to three simultaneous compromise paths:

**Path 1 — RCE via silent sandbox fallback (CVE-2026-2275 + CVE-2026-2287):** CrewAI's Code Interpreter Tool is designed to run agent-generated code in Docker isolation. But if Docker is unavailable — or made unavailable — the system silently falls back to SandboxPython, a restricted Python execution environment. The critical oversight: SandboxPython's `BLOCKED_MODULES` list does not include `ctypes` or related modules. `ctypes` allows Python code to directly call C library functions — including `libc.system()` — bypassing the sandbox entirely and executing arbitrary native commands on the host operating system. CVE-2026-2287 adds a second dimension: CrewAI only checks for Docker availability at initialization, not continuously. If Docker stops running after the agent starts, the system silently degrades mid-session. An attacker who can cause Docker to become unavailable — through resource exhaustion or exploitation of intermittent Docker availability in cloud environments — can trigger the fallback on demand.

**Path 2 — Arbitrary file read (CVE-2026-2285):** The JSON Loader Tool reads files from the local filesystem based on a path provided at runtime. The tool performs no validation or sanitization of that path. An agent operating under injected instructions can be directed to read `/etc/passwd`, `/proc/self/environ`, `.env` files containing API keys, private SSH keys, database connection strings, or any other file readable by the agent process. This CVE carries a CVSS v3.1 score of 7.5 (High) and remained unpatched as of April 17, 2026.

**Path 3 — SSRF via RAG search (CVE-2026-2286):** The RAG Search Tools accept URLs at runtime and fetch them without validation. An agent under injected instructions can be directed to fetch internal network addresses — cloud instance metadata endpoints (`http://169.254.169.254/`), internal APIs, database admin interfaces, or other internal services not accessible from the public internet. This provides a pivot point into the internal network and enables exfiltration of cloud credentials. This CVE also remained unpatched as of April 17, 2026.

No confirmed in-the-wild exploitation of any of the four CVEs was found in any source as of the research date. The attack chain is documented and technically straightforward for an attacker who can reach the agent; the absence of exploitation is attributed to the vulnerabilities being discovered through proactive research rather than incident forensics, and the coordinated 80-day disclosure window before public details were released.

---

## Technical Analysis

### Framework Architecture

CrewAI is a Python-based multi-agent orchestration framework that manages agent lifecycles, task delegation, and tool execution. Agents are configured with a set of available tools — including the Code Interpreter Tool (`allow_code_execution=True`), the JSON Loader Tool, and RAG Search Tools — and autonomously invoke these tools when the LLM determines they are needed to complete a task. There is no per-action human approval gate in standard CrewAI deployments.

### CVE-2026-2275 — Sandbox Escape via ctypes in SandboxPython Fallback (RCE)

When the Code Interpreter Tool is active and Docker is available, CrewAI runs agent-generated code inside a Docker container, providing OS-level isolation. When Docker is unavailable, the framework falls back to SandboxPython — a restricted Python execution environment intended to prevent dangerous operations.

The flaw: SandboxPython's `BLOCKED_MODULES` list does not include `ctypes`, `ctypes.CDLL`, or related modules. An attacker who causes the fallback to activate can then have the agent execute:

```python
import ctypes
libc = ctypes.CDLL("libc.so.6")
libc.system(b"attacker_command_here")
```

This calls C library functions directly, completely bypassing SandboxPython's Python-level restrictions and achieving arbitrary native code execution on the host operating system.

Trigger condition: `allow_code_execution=True` in agent configuration, OR the Code Interpreter Tool explicitly added to the agent's tool list.

### CVE-2026-2287 — Insecure Runtime Docker Availability Check (RCE Enabler)

CrewAI checks for Docker availability once at agent initialization. If Docker is present at startup, the system proceeds under the assumption that Docker will remain available for the agent's lifetime. No continuous verification occurs.

If Docker stops running after initialization — whether due to resource exhaustion, container daemon crash, deliberate termination by another process, or cloud environment instability — the Code Interpreter silently falls back to SandboxPython mid-session. Combined with CVE-2026-2275, this creates a pathway to RCE even in deployments that initially started with Docker properly available.

This also enables a race-condition-style attack: an attacker who can influence the execution environment to make Docker unavailable (e.g., by exhausting container resources) can trigger the fallback on demand rather than relying on existing Docker absence.

### CVE-2026-2285 — Arbitrary Local File Read in JSON Loader Tool (CVSS 7.5 High)

The JSON Loader Tool reads a file from the filesystem and returns its contents to the agent for processing. The file path is provided at runtime and accepted without validation or sanitization.

Under prompt injection, an agent can be directed to invoke the JSON Loader with any path:

- `/etc/passwd` — user account enumeration
- `/proc/self/environ` — environment variables including any API keys or secrets injected at process launch
- `/home/user/.env` or `/app/.env` — application secrets files
- `/home/user/.ssh/id_rsa` — private SSH keys
- Any configuration file readable by the agent process

CVSS v3.1: 7.5 (High) — `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`

**Status: Unpatched as of April 17, 2026.**

### CVE-2026-2286 — SSRF in RAG Search Tools

The RAG Search Tools fetch URLs provided at runtime to retrieve content for the agent's context window. No URL validation or allowlist filtering is applied.

Under prompt injection, an agent can be directed to fetch:

- `http://169.254.169.254/latest/meta-data/` — AWS instance metadata (IAM role credentials)
- `http://metadata.google.internal/` — GCP instance metadata
- Internal API endpoints not exposed to the public internet
- Internal administrative interfaces (database admin panels, monitoring dashboards)
- Internal service discovery endpoints

SSRF into cloud metadata endpoints is particularly high-severity: it enables retrieval of temporary IAM credentials with whatever permissions the agent's instance profile holds, enabling lateral movement into cloud infrastructure.

**Status: Unpatched as of April 17, 2026.**

### The Full Attack Chain

```
1. Attacker supplies malicious content reachable by the CrewAI agent:
   - Crafted user input to an agent interface
   - Poisoned document ingested by a RAG pipeline
   - Adversarial content in a web page or search result
   - Malicious URL returned by a search tool

2. Prompt injection — malicious content causes the LLM to generate
   instructions invoking Code Interpreter / JSON Loader / RAG tools
   with attacker-controlled parameters

3a. [If Docker is running] CVE-2026-2287 — attacker triggers Docker
    unavailability (resource exhaustion, daemon crash) OR waits for
    intermittent Docker failure → system silently falls back to SandboxPython

3b. [If Docker already unavailable] CVE-2026-2275 activates immediately

4. CVE-2026-2275 — attacker code uses ctypes.CDLL to call native C
   functions → arbitrary host OS code execution as the agent process user

   AND/OR

4b. CVE-2026-2285 — JSON Loader reads attacker-specified path
    → /etc/passwd, .env, private keys, database credentials returned to agent

   AND/OR

4c. CVE-2026-2286 — RAG Search fetches attacker-specified URL
    → internal metadata endpoints (169.254.169.254), internal APIs accessed

5. Host compromise: credentials stolen, internal network accessed,
   lateral movement into connected systems possible
```

### Why the Silent Fallback Is the Critical Design Flaw

The most architecturally significant element is not any individual CVE but the fail-open design philosophy underlying CVE-2026-2275 and CVE-2026-2287. The correct behavior when a security boundary (Docker isolation) becomes unavailable is to fail closed — halt execution and alert the operator. Instead, CrewAI's Code Interpreter silently degrades to a less-secure execution environment without any runtime warning, log entry, or operator notification. An operator monitoring their agent system would have no indication that it was operating in insecure mode.

---

## Root Cause Analysis

**Proximate cause:** CrewAI's Code Interpreter Tool silently falls back to an insecure SandboxPython execution environment when Docker becomes unavailable, and SandboxPython does not block `ctypes` — enabling arbitrary native code execution by any Python code the agent runs.

**Why 1:** Why did the system fall back to an insecure environment instead of failing closed? Because the Code Interpreter feature was designed for developer productivity and task completion: if Docker isn't running, stopping the agent entirely would frustrate users who haven't set up Docker or are working in constrained environments. The fallback was added to maximize agent capability across diverse deployment contexts, not designed with the threat model that the fallback environment itself would be an attack surface.

**Why 2:** Why was `ctypes` not blocked in SandboxPython when it enables full sandbox escape? Because the SandboxPython `BLOCKED_MODULES` list was assembled reactively — blocking obvious high-risk modules (subprocess, os.system equivalents) — rather than through a comprehensive security analysis that modeled all Python-accessible paths to native code execution. `ctypes` is not commonly considered a scripting vector in developer contexts; it's used for low-level system integration, not typical agent use cases. The gap was not identified in security review.

**Why 3:** Why was there no comprehensive security review of the SandboxPython blocked modules list? Because CrewAI's development culture, consistent with the broader AI agent framework ecosystem, prioritized feature velocity and deployment breadth over adversarial security modeling of the execution environment. The SandboxPython fallback was not designed as a security boundary that would be stress-tested against all Python escape techniques — it was designed as a functional alternative to Docker for environments where Docker isn't available.

**Why 4:** Why did the framework design treat Docker availability as a one-time check rather than a continuous invariant? Because continuous Docker health checking adds latency and complexity to every agent operation. The design optimized for startup performance and simplicity. The threat model did not include an attacker who could influence Docker availability after initialization — that scenario requires the attacker to already have some level of system influence, which may have seemed like an unreasonable precondition in the framework's threat modeling.

**Why 5 / Root cause:** The CrewAI framework, like other widely-adopted AI agent orchestration platforms, treats code execution as a first-class capability for agent productivity rather than as a high-risk primitive requiring adversarial security modeling. Tool input validation (JSON Loader paths, RAG URLs), sandbox module blocklists, and failure mode security (fail-open vs. fail-closed) were all designed for functional correctness in trusted environments — not for deployments where the content reaching the agent may be adversarially crafted. The framework's architecture does not model the threat that legitimate tools, invoked by an agent acting on injected instructions, become the attack vector.

**Root cause summary:** CrewAI's agent tool architecture was designed for productivity in trusted environments and never hardened for the adversarial threat model of prompt injection — where legitimate tools invoked by a compromised agent become attack primitives — resulting in four independent tool-layer vulnerabilities with no shared code path that all exploit the same architectural gap: tools that execute or access resources without validating attacker-controllable inputs.

---

## Impact Assessment

**Severity:** Critical (for full chain); High (for individual CVEs)

The full exploitation chain — prompt injection to ctypes RCE — is Critical in composite severity. CVE-2026-2275 and CVE-2026-2287 together create unauthenticated remote code execution on the host machine via the agent's legitimate tools. CVE-2026-2285 (CVSS 7.5 High) and CVE-2026-2286 (SSRF, no published score) are independently High-severity even without the RCE chain.

**Who is affected:**
- Any organization running CrewAI with `allow_code_execution=True` or the Code Interpreter Tool explicitly enabled
- Any organization using the JSON Loader Tool (CVE-2026-2285 — unpatched) regardless of Code Interpreter status
- Any organization using RAG Search Tools (CVE-2026-2286 — unpatched) regardless of Code Interpreter status
- Downstream applications and libraries that embed CrewAI as a dependency with any of these tools enabled
- Industries most affected: software development automation, data analytics pipelines, customer service automation, research agents — all high-deployment-density sectors for CrewAI

**What is affected:**
- Host machine integrity — full RCE via ctypes grants arbitrary command execution as the agent process user
- Filesystem confidentiality — arbitrary file reads expose any file the agent process can read
- Internal network security — SSRF enables access to internal services and cloud metadata endpoints
- Credential security — `.env` files, private keys, cloud IAM credentials all at risk via file read and SSRF
- Supply chain integrity — all applications built on CrewAI inherit the vulnerabilities if the affected tools are enabled

**Quantified impact:**
- CVEs assigned: 4 (CVE-2026-2275, CVE-2026-2285, CVE-2026-2286, CVE-2026-2287)
- Published CVSS scores: 1 of 4 (CVE-2026-2285: 7.5 High)
- Patched CVEs as of April 17, 2026: 2 (sandbox CVEs, partially in v1.12.2)
- Unpatched CVEs as of April 17, 2026: 2 (CVE-2026-2285, CVE-2026-2286)
- Days from vendor notification to partial patch: ~79 days (Jan 5 → Mar 25)
- In-the-wild exploitation confirmed: none as of May 7, 2026
- Averted damage estimate (probability-weighted): $25M (order-of-magnitude; range $5M–$500M raw ceiling)

**Containment:** Third-party discovery by external researcher (Yarden Porat, Cyata). The vulnerabilities were not caught by any automated platform guardrail, runtime monitor, or internal security review. Coordinated disclosure via CERT/CC provided an 80-day private remediation window; however, two CVEs remain unpatched after that window closed with public disclosure.

---

## How It Could Have Been Prevented

1. **Fail closed when Docker becomes unavailable — never fall back to an insecure sandbox silently.** The single most impactful preventive control: if the Code Interpreter's Docker isolation is unavailable, the agent should halt the code execution step, log a warning, and surface an error to the operator — not silently execute in a less-secure environment. A one-line configuration flag (`code_execution_fallback: "fail_closed" | "sandboxpython"`) would give operators the choice while making the secure default explicit. Fail-closed is the correct default for any security boundary: if you cannot maintain the control, do not proceed.

2. **Enumerate all native code execution paths in the sandbox blocklist, not just obvious scripting modules.** The SandboxPython `BLOCKED_MODULES` list missed `ctypes` because it was built reactively rather than through adversarial analysis. A comprehensive review of all Python paths to native code execution — `ctypes`, `cffi`, `ctypes.CDLL`, platform-specific extension mechanisms — should have been applied when the sandbox was first designed. Any security-gated sandbox requires negative enumeration: explicitly blocking everything not needed, not just the most obvious risks.

3. **Validate and sanitize all tool inputs against a strict allowlist before execution.** The JSON Loader Tool and RAG Search Tools should validate inputs against operator-defined allowlists: permitted file path prefixes for JSON Loader, permitted URL schemes and hostname patterns for RAG Search. A JSON Loader that only reads from `/app/data/` cannot be used to read `/etc/passwd`. A RAG tool that only fetches `https://` URLs with domain allowlisting cannot reach `http://169.254.169.254/`. Input validation at the tool layer is the correct defense-in-depth layer for protecting against prompt injection reaching tool execution.

4. **Implement continuous Docker health monitoring with automatic fail-closed on loss of container runtime.** Rather than a one-time initialization check, CrewAI should continuously verify that Docker remains available throughout agent execution. A health check thread or watchdog process that sets a global "sandbox_secure" flag — and pauses or terminates code execution when Docker becomes unreachable — closes the CVE-2026-2287 attack surface entirely. This should be the production default for any deployment where the Code Interpreter Tool is enabled.

5. **Apply a security threat model to agent tool design that includes the prompt injection adversary.** All four CVEs stem from tool interfaces designed assuming the agent's inputs come from trusted sources. A systematic threat modeling exercise — "what if the agent's instructions are adversarially controlled?" — applied to each tool's input handling would have identified the file path injection risk in JSON Loader and the SSRF risk in RAG Search before they became CVEs. Agentic AI frameworks that expose tools with real-world side effects must be designed with the assumption that those tools will be invoked with attacker-controlled parameters.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**
- CERT/CC coordinated 80-day private disclosure window (Jan 5 → Mar 26, 2026); CrewAI acknowledged and outlined planned mitigations on January 21
- CrewAI v1.12.2 released March 25, 2026 — changelog notes "Revise security policy and reporting instructions"; partial fix for sandbox CVEs (CVE-2026-2275, CVE-2026-2287) is claimed by one secondary source but not explicitly confirmed in the official changelog with CVE identifiers
- Planned mitigations per CrewAI's January vendor statement: add `ctypes` and related modules to `BLOCKED_MODULES` for SandboxPython; evaluate fail-closed configuration; provide runtime warnings when sandbox mode is active; strengthen security documentation
- CVE-2026-2285 (JSON Loader file read): No patch as of April 17, 2026 — advisory notes "no information about a newer version that contains a fix"
- CVE-2026-2286 (SSRF via RAG Search): Unpatched as of April 17, 2026

**Operator actions required immediately:**
- Upgrade to CrewAI ≥1.12.2 for partial sandbox protection (sandbox CVEs)
- If the Code Interpreter Tool is not essential: disable it entirely (`allow_code_execution=False`)
- If Code Interpreter must be used: ensure Docker is running and implement monitoring to detect Docker availability loss; consider blocking agent execution when Docker is unavailable
- Do not rely on SandboxPython as a security boundary — treat it as no sandbox at all until full blocklist remediation is confirmed
- For JSON Loader Tool: do not pass untrusted content to agents that have JSON Loader access until CVE-2026-2285 is patched; consider wrapping the tool with path validation middleware
- For RAG Search Tools: apply URL validation middleware restricting permitted URL schemes and hostname patterns until CVE-2026-2286 is patched; explicitly block RFC 1918 addresses and known metadata endpoint ranges
- Audit all files readable by the agent process and treat them as potentially exposed if any untrusted content reaches the agent
- Review and rotate any secrets accessible from the agent's environment (API keys, database credentials, cloud tokens in `.env` files)

**Additional architectural recommendations:**
- File-system-level controls: run the CrewAI agent process as a dedicated low-privilege user with access only to the minimum required directories
- Network egress controls: use iptables or cloud security groups to block the agent process from reaching RFC 1918 address ranges and metadata endpoints (`169.254.169.254`, `fd00::/8`)
- Monitor agent tool invocations: log all tool calls with full parameter values; alert on file path accesses outside expected directories and URL fetches to unexpected destinations

---

## Solutions Analysis

### Fail-Closed Sandbox Mode — Halt Code Execution When Docker Becomes Unavailable
- **Type:** Sandboxing and Isolation / Secure Default Configuration
- **Plausibility:** 5/5 — The fix is straightforward: check Docker availability before each code execution step, not just at initialization. If Docker is unavailable, raise an exception and surface an operator alert rather than falling back. This is a design pattern well-established in security-critical systems: if the safety control fails, the operation fails.
- **Practicality:** 4/5 — Requires a one-time architecture change to the Code Interpreter tool execution path. The main cost is that agents in Docker-unavailable environments will halt instead of degrading gracefully. This is the correct behavior but will create operational friction for developers who rely on the fallback for local testing without Docker. Mitigation: make fail-closed the production default and document the fallback as a development-only setting with explicit security warning.
- **How it applies:** Directly closes CVE-2026-2287 (the runtime Docker check flaw) and indirectly closes CVE-2026-2275 (ctypes escape) by ensuring the insecure sandbox is never activated in a security context. The ctypes blocklist fix is still needed, but fail-closed prevents the condition that makes the blocklist gap exploitable.
- **Limitations:** Does not address CVE-2026-2285 (file read) or CVE-2026-2286 (SSRF) — those are separate tool-layer vulnerabilities. Developers using CrewAI in environments where Docker is unavailable or intermittent will experience workflow disruption.

### Comprehensive Sandbox Module Blocklist — Block All Native Code Execution Paths
- **Type:** Sandboxing and Isolation / Input Validation
- **Plausibility:** 4/5 — Adding `ctypes` and related modules to SandboxPython's `BLOCKED_MODULES` is a direct fix for CVE-2026-2275. The CrewAI vendor statement committed to this action. The challenge is completeness: `ctypes`, `ctypes.CDLL`, `cffi`, `_ctypes`, and any platform-specific extension loading mechanisms must all be blocked. Adversarial enumeration of bypass paths is required.
- **Practicality:** 4/5 — A focused code change with narrow scope. The blocklist is a configuration artifact in the SandboxPython implementation. The main risk is incomplete enumeration — blocking `ctypes` without blocking `cffi` or platform-specific equivalents leaves escape paths open. Requires adversarial testing against the updated blocklist before release.
- **How it applies:** Closes CVE-2026-2275 by removing the escape path from SandboxPython. Does not address the underlying design concern (why is SandboxPython a fallback at all?), but reduces the immediate risk.
- **Limitations:** Sandboxes designed through reactive module blocking have a poor historical track record. New escape techniques are discovered regularly. A blocklist-based sandbox is fundamentally a defense of known-bad rather than allowlist-of-known-good. RestrictedPython (an alternative) has its own CVE history. The only durable solution is not to use SandboxPython as a security boundary at all — fail closed instead.

### Tool-Layer Input Validation — Allowlist File Paths and URL Patterns
- **Type:** Input Validation and Sanitization / Least Privilege
- **Plausibility:** 5/5 — Path prefix validation and URL allowlisting are standard input validation techniques with decades of established implementation patterns. No novel security research required. The JSON Loader should only read from a configured set of permitted directories; the RAG Search should only fetch URLs matching an operator-defined hostname allowlist with explicit RFC 1918 blocking.
- **Practicality:** 3/5 — Requires operators to configure the allowlists for their specific deployment context. A zero-configuration default (allow all paths, allow all URLs) is insecure but simpler; a secure default (deny all, require explicit allowlisting) requires operator action. Many CrewAI deployments are managed by data scientists and ML engineers who may not have the security expertise to configure allowlists correctly. Secure-by-default implementation with documentation is essential.
- **How it applies:** Directly patches CVE-2026-2285 and CVE-2026-2286. Blocks the specific exploit actions (reading `/etc/passwd`, fetching `169.254.169.254`) even if prompt injection causes the agent to attempt them.
- **Limitations:** Allowlists require ongoing maintenance as legitimate use cases expand. Operators who configure overly broad allowlists (e.g., "allow all files in `/`") lose the protection. Does not address the underlying prompt injection vulnerability — it mitigates its tool-layer consequences.

### Principle of Least Privilege — OS-Level Process Isolation for Agent Execution
- **Type:** Permission Scoping / Infrastructure Hardening
- **Plausibility:** 5/5 — Running the CrewAI agent process as a dedicated low-privilege service account with access only to required files and restricted network egress is standard Linux security practice (systemd service hardening, seccomp profiles, network namespaces). No CrewAI code changes required.
- **Practicality:** 3/5 — Requires infrastructure configuration by operators, not a code-level fix. Many CrewAI deployments run agents as the application's main process user, inheriting full access to application secrets and files. Restructuring this requires deliberate operator effort. The fix is operationally correct but adds deployment complexity. Cloud deployments can use IAM instance profiles with minimal permissions; on-premises deployments require OS-level service account configuration.
- **How it applies:** Even if CVE-2026-2285 (file read) or RCE via ctypes is exploited, a process running as a dedicated service account with access only to `/app/data/` cannot read `/etc/passwd` or `/home/user/.env`. OS-level containment reduces the blast radius of any tool-layer vulnerability.
- **Limitations:** Does not prevent the vulnerability from being exploited; limits its consequences. An agent process with legitimate access to application data (which it needs to function) can still have that data read via CVE-2026-2285. Full isolation requires separating the agent's working data from sensitive secrets, which is an application architecture change.

### Prompt Injection Defense — Output Validation and Instruction Provenance Tracking
- **Type:** Content Safety / Detection and Response
- **Plausibility:** 3/5 — Detecting prompt injection before it reaches tool invocation is an active research area without fully mature solutions. Classifiers trained on injection patterns can identify many known injection formats but are not reliable against novel injections or adversarial rephrasing. Instruction provenance tracking — marking which parts of the agent's context come from trusted vs. untrusted sources — is architecturally sound but not widely implemented.
- **Practicality:** 2/5 — Effective prompt injection defense at the framework level requires either a reliable classifier (currently not available at production accuracy) or a fundamental redesign of how agent context is structured (separating trusted instructions from untrusted content). Neither is a near-term drop-in mitigation. For most operators, the practical prompt injection defense is external content validation — sanitizing or refusing to process untrusted external content before it enters the agent's context window.
- **How it applies:** Addresses the initial attack vector (the prompt injection step) rather than the tool-layer vulnerabilities. If an injection cannot reach the agent, the tool-layer CVEs are not reachable. However, since all four CVEs exist at the tool layer, this is a complement to — not a replacement for — tool-layer mitigations.
- **Limitations:** Defense at the injection point is insufficient if tool-layer vulnerabilities exist: a sufficiently sophisticated injection, a novel bypass, or a missed classification will still route to the vulnerable tools. Tool-layer validation (solution 3) is the defense-in-depth layer that remains effective even when prompt injection detection fails.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-013]] | Flowise MCP RCE (CVSS 10.0, CISA KEV): Nearest structural analog — open-source AI agent builder platform, unsandboxed code execution as a design primitive (Function() constructor vs. ctypes escape via SandboxPython fallback), active in-the-wild exploitation, credential cascade to downstream LLM providers. Pattern group co-member. The key difference: Flowise had confirmed active exploitation; CrewAI is a near-miss. Same root architecture, different exploitation status. |
| [[AAGF-2026-052]] | Langflow CVE-2026-33017 (CVSS 9.3/v4.0, active exploitation): AI orchestration platform with exec()-based code execution and fail-open architecture. Langflow's `AUTO_LOGIN=true` default and Langflow's silent exec() path parallel CrewAI's fail-open sandbox fallback. Both are credential aggregator hubs. Langflow had exploitation within 20 hours of advisory; CrewAI has no confirmed exploitation — but the architectural gap is the same class: code execution that runs in insecure context when the security boundary is bypassed or absent. |
| [[AAGF-2026-022]] | MCP STDIO Design Flaw: Protocol-level execute-before-validate architecture, analogous to CrewAI's fail-open sandbox. In MCP STDIO, command execution precedes input validation by protocol design; in CrewAI, code execution proceeds in an insecure environment when Docker validation fails. Both incidents demonstrate that the "succeed at the task, worry about security later" design philosophy serializes into structural vulnerabilities. |
| [[AAGF-2026-015]] | Antigravity Prompt Injection Chain: Prompt injection to sandbox escape in a coding assistant context — same compound attack class as CrewAI's full chain. Establishes that the composition of (prompt injection) + (tool with execution capability) = sandbox escape is a recurring attack pattern across AI coding and agent platforms, not an isolated incident. |

---

## Strategic Council Review

### Challenger Findings

**Challenge 1 — Critical severity is an analyst inference, not an independently verified score.**
The report assigns Critical composite severity while only one of four CVEs (CVE-2026-2285) carries a published CVSS score — and that one scores 7.5 (High), not Critical. The two RCE CVEs (2026-2275 and 2026-2287) have no published CVSS scores from CERT/CC or any authoritative scoring body. The Critical designation is the analyst's own inference based on the full exploitation chain producing host RCE. A critic could reasonably argue: no exploited incident + no published CVSS Critical scores = the severity framing is narrative construction, not documented consensus. The researcher notes acknowledge the CVSS gap but treat it as a presentation issue rather than a substantive epistemic constraint on the severity claim.

**Challenge 2 — The $25M averted damage estimate is built on an invented deployment count.**
The damage methodology converts the qualitative word "widespread" from the affected_parties field into a precise figure of 50,000 machines — with no Shodan scan, no Censys data, no PyPI download statistics, and no GitHub analytics cited. All three figures in the damage range ($5M, $25M, $500M) derive directly from this uninvestigated number. PyPI download data for the `crewai` package is publicly accessible via pypistats.org and was not consulted. The methodology footnote discloses this limitation ("conservative baseline from 'widespread' qualifier") but presenting it as a calculated methodology rather than a labelled rough guess confers unearned precision. The estimate's order-of-magnitude framing is appropriate; the formula structure is not.

**Challenge 3 — All secondary sources derive from a single researcher (Cyata); no independent technical replication exists.**
The full source chain is: Cyata researcher report → CERT/CC advisory VU#221883 → SecurityWeek, GBHackers, ThaiCERT, PointGuard AI (all citing CERT/CC). No independent security researcher has confirmed the ctypes escape in SandboxPython. No PoC from a third party is linked anywhere in the report, despite the damage estimate using a 5% probability weight explicitly justified by "PoC exists and is publicly documented." The claimed PoC is not cited with a URL. The entire technical analysis rests on a single researcher's disclosure relayed through institutional channels that corroborate rather than independently verify.

**Challenge 4 — The "silent fallback" stealth is overstated; production operators typically detect Docker daemon failure through independent infrastructure monitoring.**
The report claims an operator would have "no indication" the agent was running in insecure mode. This is stated without evidence of what CrewAI actually logs during the fallback transition — no source code reference, no CERT/CC characterization, no empirical test. Container orchestration platforms (Kubernetes, ECS, Docker Compose) emit health events when Docker containers stop. Any standard observability stack would detect Docker daemon failure independently of CrewAI's application-level logging. The stealth argument holds for operators with no monitoring infrastructure; it overstates the invisible-to-operator scenario for production deployments with standard tooling.

**Challenge 5 — The most dangerous RCE attack path requires attacker capabilities that largely undermine the threat premise.**
The full chain requires either: (a) Docker is already absent from the deployment (a misconfiguration), or (b) the attacker can cause Docker to become unavailable after agent initialization. Path (b) — via resource exhaustion or deliberate daemon termination — requires the attacker to already have a level of system influence that renders CrewAI exploitation largely redundant. The report notes this tension in the Why 4 root cause section ("that scenario requires the attacker to already have some level of system influence") but does not surface it as a chain reliability caveat in the impact assessment. The realistic at-risk population is primarily CrewAI deployments where Docker is absent or intermittently available — a meaningful but narrower subset than "all CrewAI deployments with Code Interpreter enabled."

**Challenge 6 — The sandbox CVE fix status is ambiguous and the operator TL;DR may be giving false assurance.**
The report states the sandbox CVEs had a "partial fix" in v1.12.2, then acknowledges this is "claimed by one secondary source but not explicitly confirmed in the official changelog with CVE identifiers." Despite this, the YAML frontmatter records `full_recovery_achieved: "partial"` and the operator TL;DR says "upgrade to ≥1.12.2 immediately for partial sandbox protection" — without the same caveat language that appears in the body. If the fix claim is unconfirmed, directing operators to upgrade for "partial sandbox protection" may be providing false assurance about a protection that does not exist.

---

### Steelman Defense

**Defense 1 — Critical composite severity is professionally defensible without published CVSS scores.**
A ctypes escape from a restricted Python sandbox to host OS execution satisfies all CVSS 3.1 Critical criteria independently: AV:N (network-reachable via prompt injection), AC:L (no special conditions), PR:N (no authentication required on the agent interface), UI:N (agent acts autonomously), S:C (scope change: agent context to host OS), C:H, I:H, A:H. CERT/CC's failure to publish individual scores for three CVEs reflects their documentation scope, not a technical dispute with the severity. CrewAI's vendor statement acknowledged the vulnerabilities and committed to mitigations including adding ctypes to BLOCKED_MODULES — vendor acknowledgment is independent corroboration of the severity framing. Multiple government CERTs carried the advisory without contesting the severity level.

**Defense 2 — CERT/CC's coordinated disclosure process provides institutional validation independent of Cyata's researcher bias.**
CERT/CC does not publish vulnerability notes based solely on researcher assertions. Their process includes vendor notification with response tracking, independent technical staff review, and structured advisory preparation. CrewAI's January 21 vendor statement — acknowledging all four vulnerabilities and committing to specific mitigations — is documented independent corroboration. ThaiCERT's April 2 advisory as a National Cybersecurity Agency adds a second institutional layer. The source chain is narrow in origin but has passed through two credentialed institutional validation steps that go beyond editorial corroboration. The disclosing researcher being from a commercial security firm (Cyata) is standard for responsible disclosure; it does not invalidate findings that a CERT and a vendor have independently acknowledged.

**Defense 3 — The fail-open sandbox design's architectural significance holds regardless of operator monitoring stealth.**
Whether or not operators have parallel Docker monitoring, the security consequence is documented: the application-level security boundary degrades without the application raising an error or halting execution. In cloud environments with spot instances, container restarts, or auto-scaling events, the Docker daemon may be transiently unavailable and recover before any alert fires — leaving a window that is invisible in retrospect precisely because it closed before monitoring detected it. More importantly, the significance of the fail-open design is not contingent on operator blindness — it is significant because the application that depends on a security boundary does not fail safely when that boundary disappears. This is a documented architectural choice in the CERT/CC advisory, not an inference.

**Defense 4 — Two unpatched CVEs after 80 days of coordinated disclosure is independently documented and significant.**
The CERT/CC advisory's April 17, 2026 revision explicitly states CVE-2026-2285 and CVE-2026-2286 have no patch ("no information about a newer version that contains a fix"). This is authoritative documentation, not inference. Path validation and URL allowlisting — the fixes for both unpatched CVEs — are not security research problems. They require only developer time to implement. The vendor's pattern of prioritizing sandbox CVEs (which require code execution capability to reach) over tool input validation CVEs (which require only prompt injection to reach, a lower-barrier attack vector) may itself reflect the same productivity-over-security design philosophy identified in the root cause analysis.

**Defense 5 — The near-miss framing and damage estimate uncertainty are appropriately and scrupulously labeled.**
The report makes no false claims about exploitation status. The near-miss classification is explicitly and repeatedly stated. The damage estimate is labeled "estimated," the confidence field reads "estimated," the unit count caveat is documented in the methodology_detail notes, and all figures are presented as order-of-magnitude orientation. The 5% probability weight is conservative given that a PoC exists and the advisory is public. The estimate's purpose is calibrated scale, not actuarial precision. The report does not overstate what is known anywhere in the quantitative section — it is among the more carefully caveated damage estimates in the incident database.

---

### Synthesis

The report is substantively sound where it matters most: the root cause analysis is technically accurate, the fail-open sandbox design is correctly identified as a design philosophy failure rather than a discrete bug, the solutions are feasibly ordered, and the near-miss classification is scrupulously maintained throughout. The CERT/CC advisory provides sufficient institutional grounding for the technical claims, and the vendor's own January 21 acknowledgment independently corroborates the vulnerabilities' existence and character. The Critical composite severity designation is professionally defensible under CVSS 3.1 criteria derived from first principles, even absent published scores for three of four CVEs.

Three challenger points require substantive updates to the report body. The damage estimate's unit count should cite the absence of PyPI download data explicitly in the methodology notes (rather than implying it was considered and set aside), and ideally add an approximate PyPI figure if one is reachable. The "PoC exists and is publicly documented" claim used to justify the 5% probability weight must either cite a URL or be revised to "PoC described in researcher disclosure, not independently verified as publicly accessible." The impact assessment section should add a brief note that the Docker-unavailability attack path (CVE-2026-2287 as an active exploit enabler) requires prior system influence, narrowing the realistic at-risk population to deployments where Docker is absent or unreliable — while noting that the file read and SSRF CVEs are exploitable via prompt injection alone with no Docker dependency. The operator TL;DR should add a caveat matching the body text's own uncertainty about whether the sandbox CVE fix in v1.12.2 has been independently confirmed.

**Final assessment:** High-quality architectural incident analysis with one structural quantitative weakness (uninvestigated deployment count) and one citation gap (PoC reference). The core findings — fail-open sandbox as root cause, two unpatched CVEs at public disclosure, Critical composite severity for the full chain, tool-layer design mismatch with adversarial threat model — are well-supported and analytically correct. The report's primary value is as a pattern-group anchor documenting the clearest multi-CVE chain in the ai-agent-platform-security-crisis group; that value is not diminished by the evidentiary gaps.

**Confidence level: Medium-High.** The architectural analysis and root cause framing earn High confidence. The severity designation earns High confidence via CVSS derivation from first principles and vendor acknowledgment. The quantitative damage framing earns Medium confidence given the uninvestigated unit count. The fix status for sandbox CVEs earns Medium confidence given unconfirmed changelog attribution. Composite: Medium-High.

**Unresolved uncertainties:**

1. **Are CVE-2026-2275 and CVE-2026-2287 actually patched in v1.12.2?** — Resolution: diff the v1.12.2 source on GitHub for changes to SandboxPython's BLOCKED_MODULES list and the Docker availability check logic; or obtain an explicit CVE-to-commit mapping from the maintainers.
2. **What is the actual deployed instance count for vulnerable CrewAI versions?** — Resolution: consult pypistats.org download data for `crewai` package versions predating 1.12.2; GitHub dependency graph data may also provide downstream application counts.
3. **Is the claimed PoC publicly accessible, and if so, where?** — Resolution: verify whether Cyata or CERT/CC published a PoC or proof-of-concept code; cite the URL or revise the probability-weight justification to reflect that the PoC is described but not independently linkable.
4. **What does CrewAI log during the SandboxPython fallback transition?** — Resolution: inspect the Code Interpreter source code at the Docker availability check path for log.warning, log.error, or console output calls; document whether any application-level signal is emitted.

---

## Key Takeaways

1. **Fail-open sandbox fallback is not a sandbox — it is a hidden attack surface.** CrewAI's Code Interpreter degrades silently from Docker isolation to an insecure Python sandbox when Docker becomes unavailable. No operator warning is issued. No agent halt occurs. From the operator's perspective, the agent continues running normally; from a security perspective, the isolation that justifies allowing code execution no longer exists. Any framework that uses sandboxing as a security boundary must fail closed when that boundary cannot be maintained — halt execution and alert the operator, never degrade silently.

2. **Two unpatched CVEs after 80 days of coordinated disclosure indicates tool-layer security is an afterthought, not a design requirement.** CERT/CC's coordinated disclosure gave CrewAI maintainers 80 days of private remediation time before public disclosure. At the close of that window, the sandbox CVEs had a partial fix in v1.12.2; the SSRF and arbitrary file read CVEs had no patch. Tool input validation — the fix for both — is not a complex security research problem. It requires allowlisting or sanitizing inputs at tool invocation boundaries. The fact that these remain unpatched signals that tool-layer security was not prioritized during the remediation window. Operators cannot assume that coordinated disclosure timelines guarantee complete remediation.

3. **The prompt injection threat model must be applied to every tool that has real-world side effects.** The JSON Loader reads files. The RAG Search fetches URLs. Both were designed assuming their inputs come from trusted orchestration logic. In a multi-agent system where the LLM's instructions can be influenced by external content, every tool that acts on attacker-reachable parameters is a potential attack vector. The four CrewAI CVEs share a single root: tool interfaces designed for trusted environments, deployed in adversarial ones. Security review of agentic tools must model the question: "What happens if an adversary controls this parameter?"

4. **`ctypes` is a sandbox escape vector — include it in any Python execution blocklist by default.** `ctypes` is not a commonly audited attack surface for Python sandbox designers. It enables direct calls to C library functions, bypassing Python-level restrictions entirely. Any Python execution environment intended to restrict what code can do must block `ctypes`, `cffi`, and platform-specific extension loading mechanisms from the start. The gap in SandboxPython's blocklist is not unusual — it is likely present in many other "restricted Python" implementations that focused on blocking `subprocess`, `os.system`, and `eval` without modeling all native code paths.

5. **Assess your deployment's fallback behavior, not just its primary configuration.** CrewAI operators who verified they had Docker running and Code Interpreter enabled in Docker mode may have believed they were operating securely. CVE-2026-2287 demonstrates that the security of the fallback path is equally important: if Docker stops running for any reason, the security guarantee changes with no operator notification. For any system with a primary and fallback execution mode, both modes must be independently assessed for security, and the fallback must either be as secure as the primary or trigger a halt.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| CERT/CC VU#221883 | https://kb.cert.org/vuls/id/221883 | 2026-03-30 | High — primary authoritative advisory; neutral third-party; structured coordinated disclosure; all four CVE details; vendor statement included; last revised April 17, 2026 |
| SecurityWeek — CrewAI Vulnerabilities | https://www.securityweek.com/crewai-vulnerabilities-expose-devices-to-hacking/ | 2026-04-01 | High — reputable security trade press; editorial review; accurate CVE summary referencing CERT/CC |
| PT Security dbugs PT-2026-29049 | https://dbugs.ptsecurity.com/vulnerability/PT-2026-29049 | 2026-04-01 | High — authoritative source for CVE-2026-2285 CVSS v3.1 vector (7.5 High); cross-references CERT/CC; no unverified claims |
| ThaiCERT Advisory | https://www.thaicert.or.th/en/2026/04/02/multiple-vulnerabilities-in-crewai-allow-sandbox-escape-and-remote-code-execution-via-prompt-injection/ | 2026-04-02 | High — government CERT advisory (National Cybersecurity Agency, Thailand); corroborates CERT/CC findings |
| PointGuard AI — CrewAI Incident | https://www.pointguardai.com/ai-security-incidents/crewai-vulnerabilities-enable-prompt-injection-to-system-takeover | 2026-04-01 | Medium — AI security tracker; useful qualitative attack chain analysis and AISSI proprietary scoring; no independent technical verification; no exploitation claims |
| GBHackers | https://gbhackers.com/crewai-hit-by-critical-vulnerabilities/ | 2026-04-01 | Medium — security news blog; accurate summary of CERT/CC findings; no original technical analysis; useful for coverage breadth confirmation |
