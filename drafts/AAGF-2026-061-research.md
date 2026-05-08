# AAGF-2026-061 Research Notes — CrewAI Multi-CVE Chain: Prompt Injection to RCE, SSRF, and Arbitrary File Read

## Triage Verdict: PROCEED

**Reasoning:**
1. **Real-world production deployment** — CrewAI is a widely-deployed open-source multi-agent AI framework used in production environments across industries. The vulnerabilities affect any production deployment with the Code Interpreter Tool enabled. Not a research demo or CTF.
2. **Autonomous agent involved** — CrewAI is an agent orchestration framework; agents act autonomously using tools (Code Interpreter, RAG search, JSON loader) without per-action human approval. The attack chain exploits exactly this autonomous tool-invocation behavior.
3. **Verifiable** — CERT/CC issued formal advisory VU#221883; four CVEs assigned; covered by SecurityWeek, ThaiCERT, GBHackers, PointGuard AI, IronPlate AI, Cyberpress, Rankiteo, and PT Security's dbugs database. Reporter is named (Yarden Porat, Cyata).
4. **Meaningful impact** — Successful exploitation grants full RCE on the host running the agent, arbitrary file reads (credentials, secrets), and SSRF into internal/cloud infrastructure. Supply chain risk amplified across all CrewAI-dependent systems. No patch for SSRF and file read as of late April 2026.

---

## Primary Source

**CERT/CC Advisory VU#221883**
- URL: https://kb.cert.org/vuls/id/221883
- Published: March 30, 2026
- Last Revised: April 17, 2026
- Notified: January 5, 2026
- Vendor Statement Date: January 21, 2026
- Reporter: Yarden Porat, Cyata (cyata.ai)

**Source bias flag:** The disclosing party is Cyata, a security research firm — this is a vendor-researcher disclosure. The CERT/CC advisory is a neutral third-party aggregation of the researcher's findings. No unverified quantitative claims (financial figures, user counts) are made by the researcher. All claims are technical in nature and specific.

---

## What Exactly Happened

CrewAI — a widely-used open-source Python framework for orchestrating multi-agent AI systems — was found to contain four chained vulnerabilities that allow an attacker to escalate from prompt injection to full host compromise. The vulnerability chain was discovered by Yarden Porat of Cyata and disclosed to the CrewAI maintainers on January 5, 2026. Public disclosure occurred March 26–30, 2026.

**The core attack scenario:** Any CrewAI deployment that (a) exposes the Code Interpreter Tool to agents, or (b) has `allow_code_execution=True` in agent configuration, is exploitable if an attacker can supply content that reaches the agent — either directly (e.g., through a user-facing interface) or indirectly (e.g., poisoned documents the RAG tool retrieves). Through prompt injection, the attacker causes the agent to use its tools in attacker-controlled ways.

The vulnerabilities compound: the sandbox that should contain Python execution silently degrades to an insecure fallback when Docker is unavailable or stops running. That fallback sandbox (SandboxPython) does not block the `ctypes` module, enabling arbitrary C function calls — effectively full native code execution on the host. Separately, the RAG search and JSON loader tools do not validate inputs (URLs and file paths), allowing SSRF to internal network resources and arbitrary file reads from the host filesystem.

No evidence of in-the-wild exploitation was found in any source as of the research date (May 7, 2026). However, exploitation paths are publicly documented and technically straightforward given access to a vulnerable agent. [Sources: CERT/CC VU#221883; SecurityWeek; PointGuard AI; ThaiCERT]

---

## Technical Detail

### Framework
- **Software:** CrewAI (crewAIInc/crewAI)
- **Type:** Open-source Python multi-agent AI orchestration framework
- **Affected component:** Code Interpreter Tool, JSON Loader Tool, RAG Search Tools
- **Condition for exploitation:** Agent must have Code Interpreter Tool enabled (via `allow_code_execution=True` or manual tool addition by developer)

### CVE Breakdown

**CVE-2026-2275 — Sandbox Escape via ctypes in SandboxPython Fallback (RCE)**
- When Docker is unreachable, the Code Interpreter tool silently falls back from Docker-isolated execution to SandboxPython, a restricted Python sandbox.
- SandboxPython's `BLOCKED_MODULES` list does not include `ctypes` or related modules.
- `ctypes` allows calling arbitrary C library functions (e.g., `libc.system()`) from Python, bypassing the sandbox entirely and achieving native code execution on the host.
- Trigger: `allow_code_execution=True` OR Code Interpreter Tool explicitly added to agent.
- [Source: CERT/CC VU#221883; SecurityWeek; ThaiCERT]

**CVE-2026-2286 — SSRF in RAG Search Tools**
- RAG (Retrieval-Augmented Generation) search tools accept URLs at runtime without validation.
- An attacker who can influence agent behavior (via prompt injection) can cause the agent to issue requests to internal network addresses (e.g., `http://169.254.169.254/` for cloud metadata services, internal APIs, or other infrastructure).
- Enables exfiltration of cloud credentials (AWS/GCP/Azure metadata endpoints), internal service enumeration, and pivoting into internal networks.
- **Unpatched as of April 17, 2026** (last revised date of CERT/CC advisory).
- [Source: CERT/CC VU#221883; dbugs PT Security; PointGuard AI]

**CVE-2026-2287 — Insecure Runtime Docker Availability Check (RCE via Fallback)**
- CrewAI checks for Docker availability at initialization but does not continuously verify Docker remains running during agent execution.
- If Docker stops or becomes unavailable mid-session, the system silently falls back to the insecure SandboxPython mode.
- This creates a race-condition-style attack: if an attacker can cause Docker to become unavailable (e.g., via resource exhaustion or in environments where Docker availability is intermittent), the fallback to vulnerable sandbox occurs without warning.
- Combined with CVE-2026-2275, this provides a pathway to RCE even in deployments that initially started with Docker available.
- [Source: CERT/CC VU#221883; SecurityWeek; Cyberpress]

**CVE-2026-2285 — Arbitrary Local File Read in JSON Loader Tool (CVSS 7.5 High)**
- The JSON loader tool reads files from the filesystem without validating or sanitizing the file path provided.
- An attacker with the ability to control agent inputs (via prompt injection or direct manipulation) can cause the agent to read arbitrary files: `/etc/passwd`, `/proc/self/environ`, private keys, `.env` files containing API secrets, database credentials, etc.
- CVSS v3.1: 7.5 (High) — Base vector: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N
- Confidentiality impact: High. No integrity or availability impact.
- **Unpatched as of April 17, 2026.**
- [Source: dbugs PT Security (PT-2026-29049); CERT/CC VU#221883]

### Attack Chain (Full Exploit Path)

```
1. Attacker supplies malicious content reachable by the CrewAI agent
   (crafted user input, poisoned document, URL returned by search, etc.)

2. Prompt injection — malicious content causes the LLM to generate
   instructions invoking Code Interpreter / JSON Loader / RAG tools
   with attacker-controlled parameters

3a. [If Docker is up] CVE-2026-2287 — attacker triggers or waits for
    Docker unavailability → system silently falls back to SandboxPython
    
3b. [If Docker already down/unavailable] CVE-2026-2275 activates
    immediately — SandboxPython fallback is already in effect

4. CVE-2026-2275 — attacker-controlled Python code uses ctypes to call
   native C functions → arbitrary code execution on host OS

   AND/OR

4b. CVE-2026-2285 — JSON loader reads attacker-specified file path
    → /etc/passwd, .env, private keys, credentials exfiltrated

   AND/OR

4c. CVE-2026-2286 — RAG search tools fetch attacker-specified URL
    → internal metadata endpoints, internal APIs accessed

5. Host compromise: credentials stolen, internal network accessed,
   lateral movement possible
```

[Source: CERT/CC VU#221883; SecurityWeek; ThaiCERT; PointGuard AI]

### Tools/Permissions/Integrations Involved
- Code Interpreter Tool (crewai-tools)
- JSON Loader Tool (crewai-tools)
- RAG Search Tools (crewai-tools)
- Docker (expected isolation layer)
- SandboxPython (fallback execution environment)
- `ctypes` Python module (the escape vector)

---

## Dates

- **date_occurred (vulnerability introduced):** Unknown — no version-specific introduction date found across sources. The vulnerabilities appear to have existed for an extended period prior to discovery. The CERT/CC advisory does not specify the version in which each flaw was introduced.
- **date_discovered:** Approximately January 2026 (researcher notified CERT/CC and vendor on January 5, 2026; discovery would precede notification by days to weeks — estimate: late December 2025 / early January 2026). [Source: CERT/CC VU#221883 — "Notified: January 5, 2026"]
- **date_reported (first public disclosure):** March 26, 2026 — earliest reference to public disclosure. CERT/CC published advisory March 30, 2026. SecurityWeek and GBHackers published April 1, 2026. ThaiCERT published April 2, 2026. [Source: CERT/CC VU#221883 "Public Disclosure: March 26, 2026"]

**Reasoning:** The CERT/CC advisory gives explicit dates for vendor notification (Jan 5), vendor statement (Jan 21), public disclosure (Mar 26), and advisory publication (Mar 30). The ~80-day coordinated disclosure window (Jan 5 → Mar 26) is consistent with standard CERT/CC practice. "date_reported" is interpreted as first public disclosure, which is March 26, 2026 per the advisory.

---

## Source Reliability Assessment

| Source | Type | Reliability | Notes |
|--------|------|-------------|-------|
| CERT/CC VU#221883 (kb.cert.org) | Official advisory | High | Authoritative; neutral third party; structured disclosure process; dated and versioned |
| Yarden Porat / Cyata | Disclosing researcher | Medium-High | Primary technical source; flag: researcher has reputational interest in disclosure; no inflated quantitative claims found; technical claims specific and checkable |
| SecurityWeek | Security trade press | High | Reputable outlet; editorial review; references CERT/CC |
| ThaiCERT | Government CERT | High | Government advisory; references CERT/CC; no independent analysis |
| dbugs PT Security (PT-2026-29049) | Vulnerability database | High | Provides CVSS v3.1 for CVE-2026-2285; cross-references CERT/CC |
| GBHackers | Security news blog | Medium | Reputable but article content was thin in fetch; no new claims |
| PointGuard AI | AI security tracker | Medium | Provides AISSI score (proprietary, not CVSS); useful qualitative analysis; no exploitation evidence claimed |
| IronPlate AI (weekly intel) | AI security newsletter | Medium | Aggregator; useful for confirming coverage breadth; access returned 403 |
| Cyberpress, Rankiteo, HendrYadrian | News aggregators | Low-Medium | Republishing without independent analysis; consistent with primary sources |

---

## Vendor Response

- **Notified:** January 5, 2026 (by Yarden Porat via CERT/CC)
- **Vendor Statement:** January 21, 2026 — CrewAI acknowledged vulnerabilities and outlined planned mitigations
- **Planned actions per vendor statement:**
  - Add `ctypes` and related modules to `BLOCKED_MODULES` for SandboxPython
  - Evaluate fail-closed configuration (rather than falling back to insecure sandbox)
  - Provide clearer runtime warnings when sandbox mode is active
  - Strengthen security documentation
- **Version 1.12.2** (released March 25, 2026 per CrewAI changelog): Changelog entry for this version mentions "Revise security policy and reporting instructions" but does not explicitly reference CVE fixes or module blocklisting. One secondary source (from search results, not independently verified) states "version 1.12.2 fixes the sandbox issue" — this claim is unverified against the actual release notes.
- **Patch status as of CERT/CC advisory last revision (April 17, 2026):**
  - CVE-2026-2275 / CVE-2026-2287 (sandbox/RCE): Partial fix potentially in 1.12.2; not fully confirmed in official changelog
  - CVE-2026-2285 (file read): No patch — "no information about a newer version that contains a fix" [Source: dbugs PT Security]
  - CVE-2026-2286 (SSRF): Unpatched as of disclosure [Source: CERT/CC; search result noting "RAG tool vulnerabilities remain unpatched"]
- **Assessment:** Response was cooperative (coordinated disclosure respected) but slow on delivery. Two of four CVEs remained unpatched as of the advisory's last revision date — unusual given the severity and the 80-day coordinated disclosure window.

---

## Affected Parties

- **Directly affected software:** CrewAI (crewAIInc/crewAI), all versions with Code Interpreter Tool, JSON Loader Tool, or RAG Search Tools enabled
- **User base:** CrewAI is a widely-adopted open-source framework with tens of thousands of GitHub stars and broad enterprise adoption for multi-agent automation workflows. Specific user count not available from sources.
- **Industries at risk:** Any industry using CrewAI for agentic automation — software development automation, data analysis pipelines, customer service agents, document processing workflows, research automation
- **Data types at risk:** Host filesystem contents (credentials, .env files, private keys, configuration files, source code), internal network services (cloud metadata, internal APIs), arbitrary code execution scope = full host compromise
- **Exploitation evidence:** No in-the-wild exploitation confirmed across any source as of May 7, 2026. Exploitation paths are fully documented in public advisories.
- **Supply chain note:** As a framework dependency, vulnerabilities propagate to all applications built on CrewAI — both direct users and downstream applications that package CrewAI-based agents.

---

## Failure Mode Classification

**Primary categories:**
- **Prompt Injection** — The initial attack vector; attacker-controlled content causes the LLM to invoke tools with malicious parameters. Both direct (user input) and indirect (poisoned external content) injection paths are documented.
- **Tool Misuse** — The agent's legitimate tools (Code Interpreter, JSON Loader, RAG Search) are weaponized to perform actions outside their intended scope due to absent input validation.
- **Unauthorized Data Access** — Arbitrary file reads expose credentials, secrets, PII from the host filesystem.
- **Infrastructure Damage** — Full RCE on host; SSRF enabling internal network access and cloud credential theft creates potential for lateral movement and infrastructure compromise.

**Secondary/contributing:**
- **Autonomous Escalation** — The agent autonomously invokes tools with escalating privilege (from LLM inference to file system access to native code execution) without human review of each step.

**Severity:** Critical (for full chain exploitation); High (for individual CVEs)
- The full chain (prompt injection → sandbox escape → RCE) is Critical: unauthenticated, network-accessible, complete host compromise
- CVE-2026-2285 individually: High (CVSS 7.5)
- CVE-2026-2286 individually: High (SSRF with cloud metadata access potential)

**actual_vs_potential:** `near-miss`
- No confirmed real-world exploitation in any source. The vulnerabilities were discovered by a security researcher, not by forensic analysis of a breach. The full damage potential exists in any vulnerable production deployment but no evidence that it materialized. Classification as near-miss reflects that: real vulnerabilities, real production deployments affected, no confirmed exploitation.

---

## ATLAS / OWASP Mappings

**MITRE ATLAS:**
- AML.T0051 — LLM Prompt Injection
- AML.T0054 — LLM Jailbreak (indirect — sandbox bypass via prompt-directed ctypes use)
- AML.T0048 — Exploit Public-Facing ML Application (agent interface as attack surface)

**OWASP LLM Top 10 (2025):**
- LLM01: Prompt Injection — primary attack vector for the whole chain
- LLM07: System Prompt Leakage / Insecure Tool Use (agent tool invocation without validation)
- LLM08: Excessive Agency — agents have Code Interpreter + file system + network access; no per-action authorization

**OWASP Agentic AI (emerging):**
- Insecure Tool Execution — tools execute without input sanitization (CVE-2026-2285, CVE-2026-2286)
- Unsafe Fallback Behavior — fail-open rather than fail-closed on container unavailability (CVE-2026-2275, CVE-2026-2287)
- Prompt Injection via External Content — indirect injection through RAG-retrieved documents

---

## Suggested Frontmatter Values

```yaml
id: AAGF-2026-061
title: "CrewAI Multi-CVE Chain: Prompt Injection to RCE, SSRF, and Arbitrary File Read"
date_occurred: "2025-12-01"  # Approximate — vulnerability existed before discovery; exact introduction date unknown; conservative estimate
date_discovered: "2026-01-05"  # Date researcher notified CERT/CC and vendor per VU#221883
date_reported: "2026-03-26"  # First public disclosure per CERT/CC advisory
status: published
severity: critical
actual_vs_potential: near-miss
potential_damage: >
  Any organization running CrewAI with the Code Interpreter Tool enabled is exposed to full
  remote code execution on the host machine, arbitrary reads of secrets and credentials from
  the filesystem, and SSRF into internal network services including cloud metadata endpoints.
  A successful exploit chain gives an attacker the same access as the process running the
  agent — in many deployments, this includes production infrastructure, secrets stores, and
  internal APIs. Supply chain exposure extends to all applications built on CrewAI.
intervention: >
  Vulnerabilities discovered through proactive security research by Yarden Porat (Cyata),
  not through forensic analysis of a breach. Coordinated disclosure through CERT/CC gave
  maintainers an ~80-day private remediation window before public disclosure. No confirmed
  in-the-wild exploitation found in any source.
framework: crewai
framework_version: "all versions with Code Interpreter Tool enabled (partial fix in 1.12.2 for sandbox CVEs; SSRF and file read unpatched as of April 2026)"
cve_ids:
  - CVE-2026-2275
  - CVE-2026-2285
  - CVE-2026-2286
  - CVE-2026-2287
cvss_scores:
  CVE-2026-2285: "7.5 (High) — AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
  CVE-2026-2275: "Not published (CERT/CC advisory does not list CVSS)"
  CVE-2026-2286: "Not published"
  CVE-2026-2287: "Not published"
categories:
  - Prompt Injection
  - Tool Misuse
  - Unauthorized Data Access
  - Infrastructure Damage
  - Autonomous Escalation
industries:
  - Software Development
  - Enterprise Automation
  - Data Analytics
  - Any industry using CrewAI-based agents
reporter: "Yarden Porat, Cyata (cyata.ai)"
sources:
  - https://kb.cert.org/vuls/id/221883
  - https://www.securityweek.com/crewai-vulnerabilities-expose-devices-to-hacking/
  - https://dbugs.ptsecurity.com/vulnerability/PT-2026-29049
  - https://www.thaicert.or.th/en/2026/04/02/multiple-vulnerabilities-in-crewai-allow-sandbox-escape-and-remote-code-execution-via-prompt-injection/
  - https://www.pointguardai.com/ai-security-incidents/crewai-vulnerabilities-enable-prompt-injection-to-system-takeover
  - https://gbhackers.com/crewai-hit-by-critical-vulnerabilities/
vendor_response: >
  CrewAI acknowledged vulnerabilities on January 21, 2026. Planned mitigations include
  adding ctypes to BLOCKED_MODULES, fail-closed sandbox configuration, and runtime warnings.
  Version 1.12.2 (March 25, 2026) may address sandbox CVEs (unconfirmed in changelog).
  SSRF (CVE-2026-2286) and file read (CVE-2026-2285) remained unpatched as of April 17, 2026.
patch_status: partial
atlas_techniques:
  - AML.T0051
  - AML.T0054
  - AML.T0048
owasp_llm:
  - LLM01
  - LLM07
  - LLM08
```

---

## Open Questions

1. **Exact affected version range** — No source specifies which CrewAI version first introduced each vulnerability. Required for accurate `date_occurred` and for operators to know if they're affected.

2. **CVE-2026-2275 / CVE-2026-2287 CVSS scores** — CERT/CC advisory and all secondary sources do not publish CVSS scores for three of the four CVEs. Only CVE-2026-2285 has a documented score (7.5 High from dbugs PT Security).

3. **Version 1.12.2 patch confirmation** — One secondary source (unverified) claims "version 1.12.2 fixes the sandbox issue." The official CrewAI changelog entry for 1.12.2 only mentions "Revise security policy and reporting instructions" — no explicit CVE fix documentation. Recommend checking the GitHub release tag and commit log for confirmation.

4. **SSRF and file read patch timeline** — As of April 17, 2026, CVE-2026-2285 and CVE-2026-2286 remain unpatched. Has a patch been released between April 17 and May 7, 2026? Check current CrewAI releases (currently at 1.14.5a3 per GitHub).

5. **Cyata technical writeup** — The disclosing researcher (Yarden Porat, Cyata) may have published a detailed technical blog post with PoC details. No direct Cyata writeup URL was found in searches. Worth checking cyata.ai directly.

6. **Indirect injection path specifics** — All sources mention "indirect prompt injection" as an attack vector but none provide a concrete example of the poisoned document path (e.g., poisoned PDF retrieved via RAG → agent invokes Code Interpreter). Technical writeup from Cyata would likely clarify this.

7. **Real-world deployment scope** — CrewAI's exact production deployment count is unknown. GitHub stars and PyPI download statistics would give a sense of scale; these were not retrieved.

8. **Exploitation in the wild since disclosure** — No evidence as of research date, but the ~6-week window since public disclosure (Mar 26 → May 7) has not been assessed for threat intelligence feeds or incident reports.
