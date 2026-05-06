# AAGF-2026-022 Research Document

**Subject:** MCP Protocol STDIO Design Vulnerability -- Architectural Flaw Enables RCE Across 200K+ AI Servers
**Primary source:** https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-022

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| The Hacker News | https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html | Security journalism | High | Published April 20, 2026. Detailed technical coverage with CVE list and researcher attribution. |
| The Register | https://www.theregister.com/2026/04/16/anthropic_mcp_design_flaw/ | Independent journalism | High | Published April 16, 2026. First major outlet coverage. Includes Anthropic response and marketplace poisoning details. |
| OX Security -- "The Mother of All AI Supply Chains" | https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/ | Primary -- researcher disclosure | High | Original research disclosure from OX Security team. JavaScript-rendered so full text could not be fetched, but details corroborated across all other sources. |
| OX Security -- Supply Chain Advisory | https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/ | Primary -- technical advisory | High | Full vulnerability advisory with CVE details. JavaScript-rendered. |
| Cloud Security Alliance (CSA) Research Note | https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-by-design-rce-ox-security-20260420-csa/ | Expert analysis | High | Published April 20, 2026. Comprehensive independent analysis. Maps to MAESTRO framework. Most detailed technical characterization. |
| LiteLLM Security Update | https://docs.litellm.ai/blog/mcp-stdio-command-injection-april-2026 | Primary -- vendor response | High | Published before April 21, 2026. CVE-2026-30623 details, patch information, fix implementation. |
| AuthZed -- Timeline of MCP Breaches | https://authzed.com/blog/timeline-mcp-breaches | Timeline compilation | High | Comprehensive chronological timeline of all MCP security incidents from April 2025 through April 2026. |
| Medium -- "The MCP Crisis: What 30 CVEs Teach Us" | https://medium.com/@khayyam.h/the-model-context-protocol-crisis-what-30-cves-teach-us-about-building-secure-ai-agents-95e16497d249 | Expert analysis | Medium-High | Published May 2026. Analysis of 30+ CVEs and systemic issues. |
| Tom's Hardware | https://www.tomshardware.com/tech-industry/artificial-intelligence/anthropics-model-context-protocol-has-critical-security-flaw-exposed | Mainstream tech journalism | Medium-High | Published April 22, 2026. Broader audience coverage. |
| VentureBeat | https://venturebeat.com/security/mcp-stdio-flaw-200000-ai-agent-servers-exposed-ox-security-audit | Tech journalism | High | Coverage with additional framing of Anthropic calling the flaw "a feature." |
| Penligent AI | https://www.penligent.ai/hackinglabs/anthropic-mcp-vulnerability-7000-servers-and-the-case-for-continuous-red-teaming | Security analysis | Medium | Red teaming perspective and continuous security testing advocacy. |

**Source quality summary:** Excellent. The primary research comes from OX Security, a credible application security firm. The Cloud Security Alliance independently validated findings and mapped them to their MAESTRO framework. Multiple independent outlets (The Register, The Hacker News, VentureBeat, Tom's Hardware) corroborate all core claims. LiteLLM's vendor disclosure provides first-party confirmation of the vulnerability and patch details. The AuthZed timeline contextualizes this incident within a broader MCP security crisis spanning 12+ months. No contradictions across sources.

---

## Who Was Affected

**Primary affected parties:**
- Up to 200,000 MCP server instances (OX Security estimate; The Register, The Hacker News)
- 7,000+ publicly accessible MCP servers (OX Security; confirmed across all sources)
- 150+ million cumulative downloads of affected SDKs and downstream projects (OX Security; CSA)

**Affected SDKs (all officially maintained by Anthropic):**
- Python MCP SDK
- TypeScript MCP SDK
- Java MCP SDK
- Rust MCP SDK

(CSA; The Hacker News; The Register)

**Affected downstream products with specific CVEs:**
- GPT Researcher -- CVE-2025-65720 (The Hacker News)
- LiteLLM -- CVE-2026-30623, Critical severity, patched in v1.83.7-stable (LiteLLM Security Update)
- Agent Zero -- CVE-2026-30624 (The Hacker News)
- Fay Framework -- CVE-2026-30618 (The Hacker News)
- Bisheng -- CVE-2026-33224, patched (The Hacker News)
- Langchain-Chatchat -- CVE-2026-30617 (The Hacker News)
- Jaaz -- CVE-2026-33224 (The Hacker News)
- Upsonic -- CVE-2026-30625 (The Hacker News)
- Windsurf -- CVE-2026-30615, zero-click exploitation (The Register; CSA)
- DocsGPT -- CVE-2026-26015, patched (The Hacker News)
- Flowise -- CVE-2026-40933, CVSS 10.0 (CSA; The Hacker News)

**Affected IDEs and developer tools:**
- Windsurf v1.9544.26 (zero user interaction required) (CSA; The Register)
- Cursor -- CVE-2025-54136 (The Hacker News)
- Claude Code (mentioned as requiring minimal interaction) (CSA)
- Gemini-CLI (The Register)
- GitHub Copilot (The Register)

**Related MCP infrastructure CVEs:**
- MCP Inspector -- CVE-2025-49596, CVSS 9.4 (CSA; The Hacker News)
- LibreChat -- CVE-2026-22252 (The Hacker News)
- WeKnora -- CVE-2026-22688 (The Hacker News)
- @akoskm/create-mcp-server-stdio -- CVE-2025-54994 (The Hacker News)

**MCP marketplace operators:**
- 9 of 11 tested MCP registries/marketplaces accepted malicious proof-of-concept submissions (The Register; CSA)

**Not directly affected (but at risk):**
- Enterprise/internal MCP deployments not publicly enumerable -- actual scope likely higher than 200K (CSA)

---

## What Happened (Chronological)

### Background: MCP Protocol Launch (November 2024)

Anthropic launched the Model Context Protocol (MCP) in November 2024 as an open standard for AI agent communication. MCP provides a standardized way for LLMs, AI applications, and agents to connect to external data, systems, and tools. The protocol quickly became the industry standard, with adoption across major AI platforms. (AuthZed Timeline; Medium MCP Crisis article)

### Early MCP Security Issues (April-September 2025)

Before the OX Security research, a pattern of MCP security vulnerabilities had already emerged:

- **April 2025:** WhatsApp MCP tool poisoning -- entire chat histories sent to attacker-controlled numbers (AuthZed)
- **May 2025:** GitHub MCP prompt injection -- private repository contents leaked to public repos via broad PAT scopes combined with untrusted content (AuthZed)
- **June 2025:** Asana MCP cross-tenant access -- logic flaw allowed one organization to see another's data (AuthZed)
- **June 2025:** Anthropic MCP Inspector RCE -- CVE-2025-49596, unauthenticated remote code execution on developer machines (AuthZed)
- **July 2025:** mcp-remote OS command injection -- CVE-2025-6514, affected 437,000+ downloads (AuthZed; The Hacker News)
- **August 2025:** Anthropic Filesystem MCP Server sandbox escape -- CVE-2025-53109, CVE-2025-53110 (AuthZed)
- **September 2025:** Malicious Postmark MCP supply-chain compromise -- BCC copies of emails sent to attacker servers (AuthZed)
- **September 2025:** Flowise critical STDIO transport vulnerability -- CVE-2025-59528, early instance of the systemic design flaw (AuthZed)
- **October 2025:** Smithery MCP hosting path traversal -- leaked Fly.io API token controlling 3,000+ apps (AuthZed)
- **October 2025:** Figma/Framelink MCP command injection -- CVE-2025-53967 (AuthZed)

### OX Security Research Begins (November 2025)

OX Security's four-person research team -- Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok, and Roni Bar -- began investigating the MCP protocol's security architecture in November 2025. (The Register)

### The Core Discovery: STDIO "Execute-First, Validate-Never"

The researchers identified a fundamental architectural flaw in how MCP's STDIO transport layer handles commands. The vulnerability is not in any single implementation but in the protocol design itself, baked into Anthropic's official SDK across all supported languages.

**Technical mechanism:** When MCP uses STDIO (standard input/output) as a local transport mechanism to spawn an MCP server as a subprocess, the SDK executes the specified command in the `command` parameter field unconditionally -- without sanitization, syntax restrictions, or execution boundaries. If the command successfully creates a STDIO server, it returns the handle. If given an arbitrary OS command instead, the command executes fully, and the server merely returns an error after execution completes. (CSA; The Register; The Hacker News; LiteLLM)

The CSA characterized this as an **"execute-first, validate-never" pattern** where execution occurs before server validation, preventing conventional error-checking defenses. (CSA)

As OX Security stated: "What made this a supply chain event rather than a single CVE is that one architectural decision...propagated silently into every language, every downstream library." (The Hacker News)

### LangFlow Disclosure (January 11, 2026)

OX Security disclosed the first specific vulnerability to LangFlow on January 11, 2026. No CVE was issued by LangFlow despite the disclosure. (The Register)

### Anthropic Contacted -- Declines Fix (January 2026)

OX Security "repeatedly" contacted Anthropic requesting a protocol-level patch. Anthropic "declined to modify the protocol's architecture, citing the behavior as 'expected.'" Nine days after OX's initial contact, Anthropic updated its SECURITY.md file to note that STDIO adapters should be used with caution, but made no architectural changes. (The Register; VentureBeat)

The researchers' assessment of Anthropic's SECURITY.md update: "This change didn't fix anything." (VentureBeat/search results)

Anthropic's position: the STDIO execution model represents a secure default, and sanitization is the developer's responsibility. (All sources)

Anthropic has not implemented manifest-only execution, a command allowlist in the official SDKs, or any other protocol-level mitigation. (VentureBeat/search results)

### Four Exploitation Families Documented

OX Security catalogued four distinct families of exploitation:

**1. Unauthenticated UI Injection (AI Application Frameworks)**
Remote registration of malicious STDIO servers without authentication, triggered by initiating agent sessions. Identified in LiteLLM, LangChain, LangFlow. (CSA; The Register; The Hacker News)

**2. Hardening Bypass**
Platforms with input validation, allowlisting, or sandboxing were defeated. Flowise: CVE-2026-40933 (CVSS 10.0) -- command injection despite protections, bypassed via argument injection techniques like `npx -c <command>`. (CSA; The Register)

**3. Zero-Click Prompt Injection**
Attackers modify local MCP configuration via rendered content. User prompts directly influence MCP JSON configuration in IDEs with no user interaction required. Attack vectors include crafted HTML, repository READMEs, and malicious tool descriptions. Windsurf v1.9544.26 (CVE-2026-30615) was the only IDE where exploitation required zero user interaction. Cursor and Claude Code require minimal interaction. (CSA; The Register)

**4. Malicious Marketplace Distribution**
OX Security submitted proof-of-concept benign MCPs (empty file generation, not malware) to eleven MCP registries. Nine of eleven accepted submissions without review. Marketplaces that accepted submissions include platforms with hundreds of thousands of monthly visitors. A single malicious MCP entry could be installed by thousands of developers before detection, each installation granting arbitrary command execution on the developer's machine. (The Register; CSA)

### Additional Related Incidents (January-March 2026)

- **January 2026:** Gemini MCP Tool 0-day -- CVE-2026-0755 (CVSS 9.8), unauthenticated RCE as service account (AuthZed)
- **February 2026:** SmartLoader/Oura MCP Malware -- supply-chain compromise via cloned repository distributing StealC information-stealing malware (AuthZed)
- **March 2026:** nginx-ui MCP integration flaw -- CVE-2026-33032 (CVSS 9.8), complete NGINX service takeover, 2,600+ exposed instances (AuthZed)

### Public Disclosure (April 15-16, 2026)

OX Security published its full advisory on April 15, 2026. The Register published its coverage on April 16, 2026, providing the first major independent reporting. (The Register; OX Security)

### Broader Coverage (April 20-22, 2026)

- The Hacker News published its detailed coverage on April 20, 2026 (The Hacker News)
- Cloud Security Alliance published its independent research note on April 20, 2026 (CSA)
- Tom's Hardware published coverage on April 22, 2026 (Tom's Hardware)

### Downstream Vendor Patching (April-May 2026)

As of May 1, 2026:
- **Patched:** LiteLLM (v1.83.7-stable, fix commit 7b7f304, PR #25343), DocsGPT, Flowise, Bisheng (The Hacker News; LiteLLM; VentureBeat)
- **Unpatched/Reported only:** Windsurf, Langchain-Chatchat (VentureBeat)
- **Protocol-level fix by Anthropic:** None. No architectural changes to MCP specification. (All sources)

---

## Technical Deep Dive

### The Architectural Flaw

The vulnerability exists in MCP's STDIO transport layer, which is the default mechanism for connecting an AI agent to a local tool. The protocol design allows the `command` parameter field to execute arbitrary OS commands unconditionally, regardless of whether a valid MCP server initializes. (CSA; The Register; The Hacker News)

**Key technical properties (CSA):**
- Affects all officially supported SDKs: Python, TypeScript, Java, Rust
- Execution occurs before server validation
- No command sanitization or syntax restrictions implemented
- "Execute-first, validate-never" pattern prevents conventional error-checking defenses

**Exploitation pattern (CSA):**
When developers configure STDIO MCP servers, the SDK executes the specified command unconditionally. An attacker injecting a short shell command that exits immediately receives an error from the MCP client perspective, while the injected command completes background execution -- creating a timing vulnerability where validation never occurs.

### Why This Is Architectural, Not Implementation-Specific

This distinction is critical and well-documented across sources:

1. **SDK-level propagation:** The flaw is in Anthropic's official SDK, not in any single downstream project. Every developer using the official MCP SDK in any supported language inherits the vulnerability. (The Register; CSA; The Hacker News)

2. **Cross-language consistency:** The same vulnerability pattern appears across Python, TypeScript, Java, and Rust SDKs -- demonstrating it is a design decision, not a coding error. (CSA)

3. **Supply chain multiplication:** "One architectural change at the protocol level would have protected every downstream project." Instead, sanitization responsibility is distributed across thousands of downstream developers, predictably resulting in systematic exposure. (OX Security via The Register)

4. **Anthropic confirmed intentionality:** Anthropic characterized the behavior as "expected" and declined architectural changes, confirming this is by-design behavior in the protocol specification. (All sources)

### LiteLLM Patch Details (Case Study)

LiteLLM's fix for CVE-2026-30623 illustrates the downstream mitigation burden (LiteLLM Security Update):

**Root cause in LiteLLM:** When adding an MCP server with `transport: stdio`, the `command` field was passed directly to `StdioServerParameters` and executed as a subprocess on the proxy host. Input validation was absent.

**Vulnerable endpoints:** MCP server creation/update endpoints, `/mcp-rest/test/connection`, `/mcp-rest/test/tools/list` preview endpoints, and servers reconstructed from configuration or database at runtime.

**Four-layer fix implemented:**
1. Command allowlist restricted to: `{"npx", "uvx", "python", "python3", "node", "docker", "deno"}`
2. Request-level validation via Pydantic in both creation and update requests
3. Runtime re-validation when instantiating stdio clients
4. Access control: preview endpoints now require `PROXY_ADMIN` role

**Patched versions:** v1.83.6-nightly (first nightly), v1.83.7-stable (first stable)

### Flowise Vulnerability (CVE-2026-40933, CVSS 10.0)

Flowise represented the "hardening bypass" category -- despite having protections in place, the vulnerability was exploitable via argument injection techniques such as `npx -c <command>` to circumvent allowed-command lists. (CSA; The Register)

### Windsurf Zero-Click (CVE-2026-30615)

Windsurf was the only IDE where exploitation required zero user interaction. The user's prompt directly influenced the MCP JSON configuration with no user interaction needed. Other vendors (Google/Gemini-CLI, Microsoft/GitHub Copilot, Anthropic/Claude Code) dismissed similar issues as "known" or requiring explicit user permission. (The Register; CSA)

---

## Scale Assessment

### The 200K Server Estimate

The 200,000 figure comes from OX Security's research but the precise methodology is not detailed in any source. The numbers cited across sources:

- **7,000+ publicly accessible servers** -- directly enumerable, publicly reachable MCP server instances (all sources)
- **Up to 200,000 vulnerable instances** -- includes both public and estimated private/enterprise deployments (OX Security via all sources)
- **150+ million cumulative downloads** across affected SDKs and downstream packages (OX Security; CSA)
- **Internal/enterprise deployments** not publicly enumerable; actual scope likely higher (CSA)

The gap between 7,000 publicly accessible and 200,000 total likely accounts for internal/enterprise MCP server deployments behind firewalls, development environments, and CI/CD pipelines. (Inferred from CSA noting "actual scope likely higher")

### Marketplace Scale

- 9 of 11 MCP registries accepted malicious PoC submissions
- Affected marketplaces serve hundreds of thousands of monthly visitors
- A single malicious entry could reach thousands of developers before detection (The Register; CSA)

---

## Vendor and Community Response

### Anthropic

- **Position:** Behavior is "expected" and "by design" (all sources)
- **Action taken:** Updated SECURITY.md nine days after initial contact to note STDIO adapters should be used with caution (The Register; VentureBeat)
- **Action NOT taken:** No architectural changes, no manifest-only execution, no command allowlist in official SDKs, no protocol-level mitigation (all sources)
- **Press response:** Did not respond to The Register's inquiries (The Register)
- **Researcher assessment:** "This change didn't fix anything" (VentureBeat)

### OX Security

- **Position:** One architectural change at the protocol level would have protected every downstream project (The Register)
- **Research scope:** Four-person team, research began November 2025, multi-month effort
- **Proposed fix:** Protocol-level command sanitization/restriction rather than distributing responsibility to downstream developers

### Cloud Security Alliance

- **Published independent research note** on April 20, 2026 validating OX Security's findings (CSA)
- **Mapped to MAESTRO framework** for agentic AI security (CSA)
- **Recommendation:** Organizations should advocate for protocol-level defenses including restricted command grammar, sandbox execution, or required server verification handshakes (CSA)
- **Assessment:** Distributing sanitization burden across developers has proven ineffective at scale (CSA)

### Downstream Vendors

Mixed response -- some patched quickly, others remain unpatched:
- **Patched:** LiteLLM, DocsGPT, Flowise, Bisheng
- **Unpatched as of May 2026:** Windsurf, Langchain-Chatchat
- **Dismissed as known/expected:** Google (Gemini-CLI), Microsoft (GitHub Copilot), Anthropic (Claude Code) (The Register)

---

## Classification Assessment

### Severity: Critical

- CVSS scores on individual CVEs range from 9.4 to 10.0 (CSA; LiteLLM; AuthZed)
- Flowise CVE-2026-40933 scored CVSS 10.0 (CSA)
- MCP Inspector CVE-2025-49596 scored CVSS 9.4 (CSA)
- Gemini MCP CVE-2026-0755 scored CVSS 9.8 (AuthZed)

### Suggested Categories

- **Vulnerability type:** Protocol design flaw / Architectural vulnerability
- **Attack vector:** Command injection via STDIO transport
- **Impact type:** Remote Code Execution (Arbitrary Command Execution)
- **Supply chain classification:** Systemic supply chain vulnerability (affects entire ecosystem through shared protocol)
- **Scope:** Cross-platform, cross-language, cross-vendor

### MITRE ATLAS Techniques

- **AML.T0053 -- Exploit Public-Facing Application:** MCP servers with publicly accessible configuration interfaces
- **AML.T0040 -- ML Supply Chain Compromise:** The architectural flaw propagates through the SDK supply chain to all downstream consumers
- **AML.T0043 -- Craft Adversarial Data / Prompt Injection:** Zero-click prompt injection to modify MCP configuration
- **AML.T0048 -- Command and Scripting Interpreter:** Arbitrary OS command execution via STDIO transport

### Actual vs. Potential Harm

**Confirmed exploitation/demonstrated:**
- OX Security successfully poisoned 9 of 11 MCP marketplaces with PoC submissions (The Register; CSA)
- All four exploitation families were demonstrated with working proof-of-concept attacks (CSA)
- Real-world supply-chain compromise already occurred: SmartLoader/Oura MCP malware (February 2026) distributed StealC info-stealer via cloned MCP repository (AuthZed)
- Malicious Postmark MCP (September 2025) BCC'd all emails to attacker servers (AuthZed)

**Potential harm (not yet confirmed at full scale):**
- Complete takeover of up to 200,000 server instances
- Access to sensitive user data, internal databases, API keys, chat histories
- Developer machine compromise via marketplace-distributed malicious MCPs
- Enterprise network lateral movement from compromised development environments

### Distinction from Individual Implementation Bugs

This incident represents a fundamentally different class of vulnerability than typical software bugs:

1. **Not a coding error** -- The behavior is intentional and confirmed as "expected" by Anthropic
2. **Protocol-level propagation** -- Every SDK consumer inherits the vulnerability without making any implementation mistake
3. **Cannot be fully mitigated downstream** -- Individual vendors can add allowlists (as LiteLLM did), but the protocol itself continues to execute commands unconditionally
4. **Systemic rather than point failure** -- 14+ CVEs across 30+ projects trace to a single architectural decision

---

## Broader Context: The MCP Security Crisis (2025-2026)

This incident is not isolated. The AuthZed timeline and Medium analysis document a sustained 12-month pattern of MCP security failures:

- **30+ CVEs disclosed** in approximately 60 days of early 2026 alone (Medium)
- **~41% of public MCP servers** operate without authentication (Medium)
- **Systemic root causes identified:** rapid adoption outpacing security hardening, "local equals safe" assumptions, SDK-level vulnerabilities cascading through deployment chains, default configurations binding to 0.0.0.0 (Medium)
- **Low patch adoption rates** across the ecosystem (Medium)
- **MCP launched November 2024** -- within 18 months, the protocol had accumulated more critical security incidents than many mature protocols see in a decade (AuthZed; Medium)

The CSA noted: "MCP ecosystem currently lacks supply chain hygiene infrastructure of mature package ecosystems. Organizations should treat marketplace packages as untrusted pending internal review -- analogous to npm/PyPI software composition analysis." (CSA)

---

## Key Dates Summary

| Date | Event | Source |
|------|-------|--------|
| November 2024 | MCP protocol launched by Anthropic | AuthZed; Medium |
| April-October 2025 | Multiple early MCP security incidents (WhatsApp, GitHub, mcp-remote, etc.) | AuthZed |
| November 2025 | OX Security begins MCP protocol research | The Register |
| January 11, 2026 | OX Security discloses LangFlow vulnerability | The Register |
| January 2026 (approx.) | OX Security contacts Anthropic; Anthropic declines architectural fix | The Register; VentureBeat |
| ~9 days after contact | Anthropic updates SECURITY.md with STDIO caution notice | The Register; VentureBeat |
| April 15, 2026 | OX Security publishes full advisory | OX Security; VentureBeat |
| April 16, 2026 | The Register publishes first major coverage | The Register |
| April 20, 2026 | The Hacker News and CSA publish coverage/analysis | THN; CSA |
| April 22, 2026 | Tom's Hardware publishes coverage | Tom's Hardware |
| Before April 21, 2026 | LiteLLM patches CVE-2026-30623 (v1.83.7-stable) | LiteLLM |
| May 1, 2026 | Windsurf and Langchain-Chatchat remain unpatched | VentureBeat |
| As of May 5, 2026 | No protocol-level fix from Anthropic | All sources |

---

## Open Questions for Draft Phase

1. **200K methodology:** No source explains how OX Security derived the 200,000 figure from the confirmed 7,000 publicly accessible servers. The gap likely represents private/enterprise deployments but this is inferred, not sourced.

2. **Anthropic's detailed rationale:** Beyond "expected behavior" and "developer's responsibility," Anthropic has not published a detailed technical justification for the design choice. They did not respond to press inquiries.

3. **Protocol specification changes:** As of May 5, 2026, no changes to the MCP specification have been announced. The MCP specification's Security Best Practices page exists (modelcontextprotocol.io) but it is unclear if it was updated in response to this research.

4. **Exploitation in the wild:** While PoC exploits were demonstrated and related supply-chain attacks occurred (SmartLoader/Oura, Postmark MCP), no source confirms large-scale exploitation of the core STDIO design flaw in production environments.

5. **Relationship to earlier MCP CVEs:** Many pre-April 2026 MCP vulnerabilities (mcp-remote, MCP Inspector, Flowise September 2025) appear to share the same root cause. The OX Security research framed these as symptoms of the systemic design flaw, but not all earlier CVEs have been explicitly linked.

---

## Raw CVE Inventory

| CVE | Product | CVSS | Status | Source |
|-----|---------|------|--------|--------|
| CVE-2025-65720 | GPT Researcher | -- | Reported | THN |
| CVE-2026-30623 | LiteLLM | Critical | Patched (v1.83.7) | THN; LiteLLM |
| CVE-2026-30624 | Agent Zero | -- | Reported | THN |
| CVE-2026-30618 | Fay Framework | -- | Reported | THN |
| CVE-2026-33224 | Bisheng | -- | Patched | THN |
| CVE-2026-30617 | Langchain-Chatchat | -- | Unpatched | THN; VB |
| CVE-2026-33224 | Jaaz | -- | Reported | THN |
| CVE-2026-30625 | Upsonic | -- | Reported | THN |
| CVE-2026-30615 | Windsurf | -- | Unpatched | THN; Reg; CSA |
| CVE-2026-26015 | DocsGPT | -- | Patched | THN |
| CVE-2026-40933 | Flowise | 10.0 | Patched | CSA; THN |
| CVE-2025-49596 | MCP Inspector | 9.4 | -- | CSA; THN |
| CVE-2026-22252 | LibreChat | -- | -- | THN |
| CVE-2026-22688 | WeKnora | -- | -- | THN |
| CVE-2025-54994 | @akoskm/create-mcp-server-stdio | -- | -- | THN |
| CVE-2025-54136 | Cursor | -- | -- | THN |
| CVE-2025-6514 | mcp-remote | -- | -- | AuthZed |
| CVE-2025-53109 | Anthropic Filesystem MCP | -- | -- | AuthZed |
| CVE-2025-53110 | Anthropic Filesystem MCP | -- | -- | AuthZed |
| CVE-2025-59528 | Flowise (early) | -- | -- | AuthZed |
| CVE-2025-53967 | Figma/Framelink MCP | -- | -- | AuthZed |
| CVE-2026-0755 | Gemini MCP Tool | 9.8 | -- | AuthZed |
| CVE-2026-33032 | nginx-ui MCP | 9.8 | -- | AuthZed |
