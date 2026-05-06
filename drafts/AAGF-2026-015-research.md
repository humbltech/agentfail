# AAGF-2026-015 Research Document

**Subject:** Google Antigravity IDE -- Prompt injection to sandbox escape and RCE via find_by_name tool flag injection
**Primary source:** https://www.pillar.security/blog/prompt-injection-leads-to-rce-and-sandbox-escape-in-antigravity
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-015

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| Pillar Security blog (Dan Lisichkin) | https://www.pillar.security/blog/prompt-injection-leads-to-rce-and-sandbox-escape-in-antigravity | Primary -- researcher writeup | High | Original technical disclosure with full attack chain, PoC details, and timeline. |
| The Hacker News | https://thehackernews.com/2026/04/google-patches-antigravity-ide-flaw.html | Independent journalism | High | Coverage with researcher quotes, publication April 21, 2026. |
| CyberScoop | https://cyberscoop.com/google-antigravity-pillar-security-agent-sandbox-escape-remote-code-execution/ | Independent journalism | High | Security-focused analysis with additional context on Secure Mode bypass. |
| CSO Online | https://www.csoonline.com/article/4161382/prompt-injection-turned-googles-antigravity-file-search-into-rce.html | Independent journalism | High | Coverage with Google VRP confirmation. Notes Google did not respond to request for comment. |
| Dark Reading | https://www.darkreading.com/vulnerabilities-threats/google-fixes-critical-rce-flaw-ai-based-antigravity-tool | Independent journalism | High | Severity framing, "critical RCE." Access blocked (403) during fetch. |
| Cloud Security Alliance (CSA) Lab Space | https://labs.cloudsecurityalliance.org/research/csa-research-note-agentic-ide-prompt-injection-sandbox-escap/ | Industry analysis | High | Detailed root cause analysis, comparative table with Cursor and Copilot vulnerabilities, "Forced Descent" parallel vuln context. |
| Mindgard blog ("Forced Descent") | https://mindgard.ai/blog/google-antigravity-persistent-code-execution-vulnerability | Security vendor -- separate vuln | Medium-High | Documents a *different* Antigravity vulnerability (persistent MCP config backdoor via .agent rules). Not the same bug but related product. |
| SecurityWeek | https://www.securityweek.com/google-antigravity-in-crosshairs-of-security-researchers-cybercriminals/ | Independent journalism | High | Broader context: fake installer malware campaign targeting Antigravity users. |
| OECD AI Incident Monitor | https://oecd.ai/en/incidents/2026-04-20-8687 | International organization | High | Formal incident classification. Severity: Critical. |

**Source quality summary:** Strong. Pillar Security's original blog post provides full technical detail including PoC code. Multiple independent security journalism outlets (Hacker News, CyberScoop, CSO Online, SecurityWeek) corroborate core facts. CSA provides independent technical analysis. No contradictions found across sources. One source (Dark Reading) returned 403 but its content is confirmed by search result snippets. No CVE was assigned to this specific vulnerability.

---

## Who Was Affected

**Primary target:** Developers using Google's Antigravity IDE (an agentic, AI-powered development environment powered by Gemini)

**Product description:** Antigravity is Google's "agent-first" development platform that delegates complex engineering tasks to autonomous AI agents. It provides native tools for filesystem operations, code generation, and automated coding assistance. The IDE uses the `fd` utility under the hood for file searching.

**Users at risk:**
- Any Antigravity user processing untrusted content (pulling code from public repos, opening files from external sources)
- Developers who clone repositories containing adversarial prompt injections in code comments, README files, or other text
- Even users with Secure Mode (the most restrictive security configuration) enabled were vulnerable

**Data/systems at risk:**
- Full code execution on the developer's machine
- Access to filesystem, credentials, environment variables, SSH keys
- Potential lateral movement to other systems accessible from the developer's workstation
- Supply chain compromise potential if attacker modifies source code in the developer's workspace

---

## What Happened (Chronological)

### Discovery (Late 2025 / Early January 2026)

**Discoverer:** Dan Lisichkin, Pillar Security (Israeli cybersecurity company specializing in AI security)

Pillar Security researchers identified that Antigravity's `find_by_name` native tool passed user-supplied input directly to the underlying `fd` filesystem search utility without sanitization. This created a command-line flag injection vulnerability that could be escalated to arbitrary code execution.

### Responsible Disclosure (January 6-7, 2026)

- **January 6, 2026:** Initial report submitted to Google's Vulnerability Reward Program (VRP). Some sources say January 7 -- likely timezone difference.
- **January 24, 2026:** Google accepts the report and files an internal bug.

### Patch (February 28, 2026)

- **February 28, 2026:** Google marks the issue as fixed. Specific remediation details were not publicly disclosed.

### Bug Bounty Award (March 26, 2026)

- **March 26, 2026:** Google's VRP panel awards a bug bounty. The specific dollar amount was not publicly disclosed.

### Public Disclosure (April 20-21, 2026)

- **April 20, 2026:** OECD AI Incident Monitor publishes incident record.
- **April 21, 2026:** Pillar Security publishes full technical blog post. Multiple outlets (Hacker News, Dark Reading, CSO Online, CyberScoop, SecurityWeek) publish coverage.

---

## The Attack Chain (Technical Detail)

### Root Cause: Two Missing Safeguards

The vulnerability stems from two compounding failures in the `find_by_name` tool:

1. **No input validation on the Pattern parameter:** The Pattern parameter accepts arbitrary strings without verifying they contain only legitimate search pattern characters. Any string beginning with `-` is interpreted by `fd` as a command-line flag rather than a search pattern.

2. **No argument termination:** The `--` separator is not prepended before user-supplied values, so `fd` cannot distinguish between flags and search terms. (CSA, Pillar Security)

### Step-by-Step Attack Chain

**Step 1 -- Prompt Injection Delivery:**
The attacker delivers adversarial instructions to the Antigravity agent via indirect prompt injection. Delivery vectors include:
- Malicious comments embedded in source code files in public repositories
- Adversarial content in web pages the agent browses
- Any untrusted content the agent ingests during its operation
- Compromised user accounts (direct prompt injection)

No user interaction beyond normal development workflow is required. A developer simply pulls a "benign-looking source file from an untrusted origin, such as a public repository, containing attacker-controlled comments that instruct the agent to stage and trigger the exploit." (Pillar Security, CSO Online)

**Step 2 -- Malicious File Creation (Staging):**
The injected prompt instructs the agent to create a malicious shell script in the workspace. File creation is an unrestricted, permitted native action in Antigravity -- it is a core part of the IDE's normal operation. Example payload file: `a.orange` containing `open -a Calculator` (PoC) or any arbitrary shell commands.

**Step 3 -- Flag Injection via find_by_name:**
The injected prompt instructs the agent to call the `find_by_name` tool with a crafted Pattern parameter: `-Xsh`

This causes `fd` to:
- Interpret `-X` as the `exec-batch` flag (which executes a specified binary against matched files)
- Interpret `sh` as the binary to execute
- Pass all matched files to `sh` for execution as shell scripts

**Critical detail on space handling:** Spaces within the injected Pattern string are treated as literal characters rather than argument separators. This is why the attacker uses `-Xsh` (no space) rather than `-X sh`. Antigravity's ability to stage files beforehand circumvents this limitation. (CSA, Pillar Security)

**Step 4 -- Arbitrary Code Execution:**
The `fd` utility passes the previously staged malicious file(s) to `sh`, which executes them as shell scripts. The attacker achieves full arbitrary code execution on the developer's machine. The PoC demonstrated launching Calculator; in a real attack, the payload could exfiltrate data, install backdoors, modify source code, etc.

### Why Secure Mode Failed

Antigravity's Secure Mode is the product's most restrictive security configuration. It:
- Runs operations through a virtual machine
- Throttles network access
- Restricts file writing to the working directory
- Sandboxes command execution

**None of these controls prevented exploitation.** The critical architectural flaw:

> "Native tool invocations are executed by the agent directly, before Secure Mode's command-level restrictions are evaluated." (Pillar Security)

The `find_by_name` tool is classified as a **native system tool**. When the agent invokes it, the execution happens *before* Secure Mode's security boundary evaluates the call. The agent treats it as a native tool invocation, not a shell command, so it never reaches the security boundary that Secure Mode enforces. As Dan Lisichkin stated: "The security boundary that Secure Mode enforces simply never sees this call." (CyberScoop)

This represents a fundamental architectural trust model failure: built-in tools were granted "pre-evaluation execution authority" without parameter sanitization. (CSA)

---

## Proof of Concept

From Pillar Security's disclosure:

1. Create a file `a.orange` containing: `open -a Calculator`
2. Invoke `find_by_name` with `Pattern: "-Xsh"` and a matching extension filter for `.orange`
3. `fd` executes `sh` against `a.orange`, launching Calculator

The full attack via prompt injection requires only that the adversarial instructions be present in content the agent processes -- no additional user interaction is needed.

---

## Key Quotes

**Dan Lisichkin, Pillar Security:**
> "Tools designed for constrained operations become attack vectors when their inputs are not strictly validated. The trust model underpinning security assumptions, that a human will catch something suspicious, does not hold when autonomous agents follow instructions from external content." (The Hacker News)

> "The security boundary that Secure Mode enforces simply never sees this call." (CyberScoop)

> "Every native tool parameter that reaches a shell command is a potential injection point." (CSO Online)

**CSA Lab Space analysis:**
> "Agentic tools have been brought to market with capability profiles that substantially exceed prior IDE plugins, while security architectures appear to have adapted existing approaches rather than developing models accounting for autonomous agent properties."

---

## Related Vulnerabilities (Same Product)

The CSA analysis documents a comparative landscape of agentic IDE vulnerabilities:

| Product | Vulnerability | Mechanism |
|---------|---------------|-----------|
| **Antigravity** (this incident) | find_by_name flag injection | Pattern parameter → fd exec-batch RCE |
| **Antigravity** (Forced Descent, Mindgard) | Persistent MCP config backdoor | .agent rules write malicious mcp_config.json to ~/.gemini/antigravity/, persists through reinstall |
| **Antigravity** (Hacktron AI) | Browser extension file write | SaveScreenRecording path traversal, $10,000 bounty |
| Cursor | CVE-2025-59944 | Case-sensitivity bypass of config protection |
| Cursor | CVE-2025-54135/54136 | MCP configuration injection |
| Copilot/Claude/gemini-cli | PR content injection | Prompt injection via PR metadata |

The Mindgard "Forced Descent" vulnerability is particularly notable: it exploits global configuration loading at startup *prior to any project trust verification*, enabling persistent backdoors that survive complete application reinstall. (Mindgard blog)

---

## Vendor Response

- **Google** accepted the report on January 24, 2026, and patched the issue by February 28, 2026 (~53 days from report to fix, ~35 days from acceptance to fix).
- Google awarded a bug bounty through its VRP; the amount was not publicly disclosed.
- Google did not respond to CSO Online's request for comment at publication time.
- Specific technical remediation measures were not publicly disclosed beyond confirming the fix.
- No CVE was assigned to this vulnerability.

---

## Exploitation in the Wild

- **No confirmed real-world exploitation** was documented before the patch date. (CyberScoop, The Hacker News, CSO Online)
- The attack is practical and requires no elevated access -- only that a developer processes untrusted content.
- Separately, SecurityWeek reported a fake Antigravity installer distribution campaign (malware), indicating broader threat actor interest in targeting Antigravity users.

---

## Damage Assessment

### Potential Damage (if exploited)
- **Severity:** Critical (OECD classification)
- Full arbitrary code execution on developer workstations
- Sandbox escape bypassing Secure Mode (the strictest security setting)
- Supply chain compromise: attacker could modify source code silently
- Credential theft: access to environment variables, SSH keys, cloud credentials
- Lateral movement potential from compromised developer machines
- Zero-click exploitation possible via indirect prompt injection in repository files

### Actual Damage
- No confirmed exploitation in the wild prior to patching
- Vulnerability existed from at least early January 2026 (discovery date) until February 28, 2026 (patch date)
- Unknown how long the vulnerability existed before discovery

---

## Classification Tags

- **Attack vector:** Indirect prompt injection → native tool parameter injection → command-line flag injection → RCE
- **Vulnerability type:** Input validation failure, argument injection, security boundary bypass
- **Root cause:** Insufficient sanitization of tool parameters + missing argument termination (`--`) + architectural trust model flaw (native tools bypass security evaluation)
- **AI system:** Google Antigravity IDE (agentic, Gemini-powered)
- **Impact:** RCE, sandbox escape, potential supply chain compromise
- **CVE:** None assigned
- **OWASP LLM Top 10:** LLM01 (Prompt Injection), LLM07 (Insecure Plugin Design)

---

## Key Takeaways for AgentFail Narrative

1. **Architectural trust model failure:** The vulnerability reveals a fundamental design flaw in agentic IDE security -- native tools execute with pre-evaluation authority, bypassing the very security boundaries designed to constrain them. This is not a simple input validation bug; it is a category-level architectural failure.

2. **The file-search-to-RCE chain is elegant:** The attacker combines two permitted operations (file creation + file search) to achieve an unpermitted outcome (code execution). Neither operation is individually malicious.

3. **"Secure Mode" as false assurance:** Users who enabled the strictest security configuration received no protection. This undermines user trust in security features.

4. **Agentic tools are a new privileged software class:** As CSA notes, these tools have capability profiles exceeding prior IDE plugins, but security architectures have not adapted. Every parameter that reaches a system command is an injection point.

5. **Supply chain attack surface:** The indirect prompt injection delivery via repository files makes this a potential supply chain attack vector -- a single malicious comment in a popular open-source repository could compromise every developer who clones it with Antigravity.
