# AAGF-2026-014 Research Document

**Subject:** CamoLeak -- Zero-click prompt injection in GitHub Copilot Chat enables silent source code exfiltration via GitHub's Camo image proxy (CVE-2025-59145)
**Primary source:** https://www.legitsecurity.com/blog/camoleak-critical-github-copilot-vulnerability-leaks-private-source-code
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-014

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| Legit Security blog (Omer Mayraz) | https://www.legitsecurity.com/blog/camoleak-critical-github-copilot-vulnerability-leaks-private-source-code | Primary -- researcher disclosure | High | Original researcher blog post. Full technical detail of attack chain. |
| Dark Reading | https://www.darkreading.com/application-security/github-copilot-camoleak-ai-attack-exfils-data | Independent journalism | High | Security-focused analysis. 403 on fetch but confirmed via search results. |
| SecurityWeek | https://www.securityweek.com/github-copilot-chat-flaw-leaked-data-from-private-repositories/ | Independent journalism | High | Published October 9, 2025. Confirmed timeline and fix details. |
| CSO Online | https://www.csoonline.com/article/4069887/github-copilot-prompt-injection-flaw-leaked-sensitive-data-from-private-repos.html | Independent journalism | High | Broader AI assistant implications analysis. |
| BlackFog | https://www.blackfog.com/camoleak-how-github-copilot-became-an-exfiltration-channel/ | Security vendor blog | Medium-High | Enterprise impact framing. |
| Meterpreter.org | https://meterpreter.org/github-copilot-zero-click-camoleak-exposed-cve-2025-59145-cvss-9-6-allowed-silent-data-theft-from-private-repos/ | Security community | Medium | CVE number and CVSS score confirmation. |
| CybersecurityNews | https://cybersecuritynews.com/hackers-exploit-github-copilot-flaw/ | Security journalism | Medium | Additional coverage details. |
| eSecurity Planet | https://www.esecurityplanet.com/news/github-copilot-data-theft/ | Security journalism | Medium | Coverage of the vulnerability. |
| Petri | https://petri.com/github-copilot-chat-camoleak-vulnerability/ | IT journalism | Medium | Enterprise context. |
| MintMCP Blog | https://www.mintmcp.com/blog/camoleak-github-copilot-vulnerability-private-repo-exfiltration | Security blog | Medium | Technical summary. |
| SQ Magazine | https://sqmagazine.co.uk/github-copilot-prompt-injection-camoleak/ | Security journalism | Medium | Prompt injection framing. |

**Source quality summary:** Strong. Primary researcher blog post provides comprehensive technical detail. CVE-2025-59145 confirmed across multiple independent sources. Multiple security journalism outlets (SecurityWeek, Dark Reading, CSO Online) corroborate core facts. No contradictions found across sources. GitHub did not issue a public CVE advisory but confirmed the fix via HackerOne.

---

## Who Was Affected

**Primary target:** Any organization or individual using GitHub Copilot Chat with access to private repositories.

**Attack surface:**
- Any developer who uses Copilot Chat to review pull requests on repositories where an attacker can submit PRs (open-source repos, or repos where attacker has contributor access)
- Copilot operates with the same permissions as the user making the request, meaning it could access all private repositories the victim was authorized to view -- including organization-level private repos

**Data at risk (per Legit Security, SecurityWeek, BlackFog):**
- Private repository source code
- AWS credentials and API keys embedded in code/configs
- Zero-day vulnerability descriptions from private issues
- Any secrets accessible within the victim's authorized repository scope
- Organization-level private repository contents

**Downstream impact:**
- Intellectual property theft (proprietary source code)
- Credential compromise leading to cloud infrastructure access
- Exposure of undisclosed security vulnerabilities before patches

---

## What Happened (Chronological)

### Discovery (June 2025)

**Researcher:** Omer Mayraz, Legit Security (Legit Security blog)

In June 2025, Omer Mayraz discovered that GitHub Copilot Chat could be weaponized as a covert data exfiltration channel through a combination of prompt injection and a novel CSP bypass leveraging GitHub's own infrastructure. The vulnerability was reported to GitHub via HackerOne. (Legit Security blog)

### The Attack Chain (4 stages)

**Stage 1 -- Prompt Injection via Invisible HTML Comments:**
The attacker embeds malicious instructions inside a pull request description using standard HTML comment syntax (`<!-- hidden content here -->`). This is a documented GitHub feature -- HTML comments do not render in the web UI, so a developer reviewing the PR sees nothing suspicious. However, Copilot Chat ingests the raw markdown/HTML context including the hidden comments and treats the hidden text as legitimate instruction. The injected prompt affects any user who visits the page and invokes Copilot, not just the PR author. (Legit Security blog, CSO Online)

**Stage 2 -- Copilot Searches for Secrets:**
The hidden prompt instructs Copilot to search the repository context for sensitive data -- API keys, AWS credentials, secrets in configuration files, source code, or private issue contents. Because Copilot operates with the authenticated user's permissions, it has access to all private repositories and issues the victim can see, including organization-level private repos. (Legit Security blog, SecurityWeek)

**Stage 3 -- Base16 Encoding of Exfiltrated Data:**
The injected prompt instructs Copilot to encode the discovered secrets and source code in base16 (hexadecimal) format, then append the encoded data to URLs. This encoding step transforms arbitrary data into a format suitable for URL-based exfiltration. (Legit Security blog)

**Stage 4 -- CSP Bypass via Pre-signed Camo Image Proxy URLs:**
This is the novel technical contribution of the attack. GitHub's Content Security Policy (CSP) blocks requests to arbitrary external domains from Copilot Chat, which should prevent image-based exfiltration. The researcher bypassed this by exploiting GitHub's own Camo image proxy (`camo.githubusercontent.com`):

1. **Pre-computation:** The attacker set up a web server hosting approximately 100 transparent 1x1 pixel images -- one for each alphanumeric character and common symbol. Each image was invisible to users.
2. **Camo URL generation:** The attacker used GitHub's REST API to submit raw markdown containing external image URLs pointing to their server. GitHub's Camo proxy automatically converts these to signed URLs with HMAC-based cryptographic verification. The attacker collected the resulting Camo URLs, creating a dictionary mapping each character to a valid, signed Camo proxy URL.
3. **Dictionary embedding:** The complete character-to-URL dictionary was included in the hidden prompt injection payload.
4. **"ASCII art" rendering:** Copilot was instructed to render the leaked data as "ASCII art" composed entirely of these Camo-proxied images, placing them in the correct character order.
5. **Silent exfiltration:** When the victim's browser rendered Copilot's response, it automatically fetched each image through GitHub's trusted Camo proxy. The requests appeared as normal image loading from `camo.githubusercontent.com`. Each request hit the attacker's server, and the sequence of requests revealed the exfiltrated data character by character.

The attack was effectively zero-click from the victim's perspective -- the exfiltration occurred automatically when the browser rendered Copilot's response containing the images. The traffic was indistinguishable from normal GitHub image loading, bypassing standard network egress controls and security monitoring. (Legit Security blog, SecurityWeek, MintMCP, BlackFog)

### Disclosure Timeline

| Date | Event | Source |
|------|-------|--------|
| June 2025 | Vulnerability discovered by Omer Mayraz (Legit Security) | Legit Security blog |
| June 2025 | Reported to GitHub via HackerOne | Legit Security blog |
| August 14, 2025 | GitHub deploys fix -- disables image rendering in Copilot Chat | Legit Security blog, SecurityWeek |
| October 8-9, 2025 | Public disclosure (Legit Security blog post, SecurityWeek article) | Multiple sources |

---

## Technical Analysis

### Vulnerability Classification

- **CVE:** CVE-2025-59145
- **CVSS Score:** 9.6 (Critical)
- **Attack type:** Remote prompt injection + CSP bypass + data exfiltration
- **Attack vector:** Network (pull request descriptions)
- **User interaction:** Minimal -- victim must invoke Copilot Chat on a page containing the malicious PR, but exfiltration itself is zero-click
- **Privileges required:** Ability to create/edit pull request descriptions in a target repository (contributor access, or any user in an open-source repo)

### Why This Attack Worked

1. **Invisible prompt injection surface:** GitHub's HTML comment feature creates a gap between what humans see and what Copilot processes. The raw markdown is part of Copilot's context window even though it renders as invisible to users.

2. **Excessive privilege inheritance:** Copilot Chat inherits the full authentication scope of the invoking user, including access to private repositories and organization resources. A prompt injection in one repository could leak data from entirely different private repositories.

3. **Trusted infrastructure as exfiltration channel:** GitHub's Camo proxy is whitelisted in CSP policies because it is GitHub's own infrastructure. By pre-computing valid signed URLs, the attacker turned GitHub's security feature (image proxying to prevent IP tracking) into an exfiltration channel.

4. **Browser auto-fetch behavior:** Images embedded in Copilot's response are automatically fetched by the browser without any user click, enabling true zero-click exfiltration.

### Comparison to EchoLeak (AAGF-2026-012)

CamoLeak shares significant structural similarities with the EchoLeak vulnerability in Microsoft 365 Copilot (CVE-2025-32711):

| Dimension | CamoLeak (GitHub Copilot) | EchoLeak (M365 Copilot) |
|-----------|--------------------------|------------------------|
| Injection vector | Hidden HTML comments in PR descriptions | Hidden instructions in crafted emails |
| CSP bypass | GitHub Camo image proxy | Teams async preview API (`asyncgw.teams.microsoft.com`) |
| Exfiltration method | Pre-signed Camo URLs, character-by-character | Reference-style Markdown links + auto-fetched images |
| User interaction | Zero-click (auto image fetch) | Zero-click (auto image fetch) |
| CVSS | 9.6 | 8.8 |
| Scope | Private repos, org repos | M365 emails, OneDrive, SharePoint, Teams |

Both attacks exploit the same fundamental pattern: indirect prompt injection via hidden content + CSP bypass through the vendor's own trusted infrastructure + browser auto-fetch for zero-click exfiltration.

---

## Vendor Response

### GitHub

- **Fix deployed:** August 14, 2025 (Legit Security blog, SecurityWeek)
- **Fix method:** Disabled image rendering in Copilot Chat entirely, blocking the Camo-based exfiltration channel (Legit Security blog, CSO Online)
- **Disclosure coordination:** Via HackerOne bug bounty program (Legit Security blog)
- **Public statement:** No public advisory or CVE advisory from GitHub found in research. Fix was confirmed through researcher notification. (SecurityWeek)
- **Assessment:** GitHub chose to disable an entire feature (image rendering in chat) rather than attempt to patch the underlying prompt injection vulnerability, suggesting the prompt injection issue may be fundamentally difficult to resolve while maintaining Copilot's current architecture.

**Notable:** Omer Mayraz emphasized that GitHub "resolved it by completely disabling a feature rather than patching the underlying mechanism" -- indicating the prompt injection itself remains an unsolved challenge. (CSO Online)

---

## Wild Exploitation

**No evidence of exploitation in the wild prior to responsible disclosure.** No source consulted reports any confirmed breaches or incidents resulting from CamoLeak. The vulnerability was discovered through security research and reported via HackerOne before public awareness. (Legit Security blog, SecurityWeek, CSO Online)

---

## Related Vulnerabilities in GitHub Copilot

CamoLeak exists within a broader pattern of GitHub Copilot security issues discovered in 2025:

### CVE-2025-53773 -- Remote Code Execution via Prompt Injection
- **Discovered:** 2025
- **Severity:** Critical
- **Attack:** Exploits Copilot's ability to modify project configuration files (`.vscode/settings.json`, `.vscode/tasks.json`) to escalate privileges and execute arbitrary commands on the developer's machine
- **Fix:** Microsoft August 2025 Patch Tuesday
- **Source:** https://embracethered.com/blog/posts/2025/github-copilot-remote-code-execution-via-prompt-injection/

### Filename-Based Prompt Injection (Tenable TRA-2025-53)
- **Affected:** GitHub Copilot Chat version 0.28.0 in Agent mode
- **Attack:** Crafted filenames are appended to user prompts, causing Copilot to follow attacker instructions
- **Source:** https://www.tenable.com/security/research/tra-2025-53

### Comment-Based Prompt Injection (Multi-Agent)
- **Affected:** GitHub Copilot Agent (SWE Agent), Claude Code Security Review, Google Gemini CLI Action
- **Attack:** Malicious PR titles or issue comments processed as trusted context by AI agents, enabling credential exfiltration via PR comments
- **Source:** https://cybersecuritynews.com/prompt-injection-via-github-comments/

### Hidden Unicode Text Injection
- **Date:** May 2025 (Pillar Security research)
- **Attack:** Invisible Unicode characters used to inject malicious instructions into files processed by Copilot
- **Fix:** GitHub implemented warnings for files containing hidden Unicode text on github.com
- **Source:** https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents

### GitLab Duo Remote Prompt Injection (Related, Different Vendor)
- **Context:** Legit Security blog references a previous vulnerability in GitLab Duo involving remote prompt injection in that platform's AI assistant, establishing CamoLeak as part of a broader trend affecting AI coding assistants
- **Source:** Referenced in Legit Security blog

---

## Key Quotes

> "The attack combined a novel CSP bypass using GitHub's own infrastructure with remote prompt injection." -- Omer Mayraz, Legit Security (CSO Online)

> "[Copilot could leak] AWS keys and zero-day bugs from private repositories." -- Omer Mayraz, Legit Security (SecurityWeek)

> "[Copilot could] influence the responses Copilot provided to other users." -- Omer Mayraz, Legit Security (SecurityWeek)

---

## Incident Classification (Suggested)

| Field | Value |
|-------|-------|
| **ID** | AAGF-2026-014 |
| **Title** | CamoLeak: GitHub Copilot Silent Source Code Exfiltration via Camo Image Proxy |
| **CVE** | CVE-2025-59145 |
| **CVSS** | 9.6 (Critical) |
| **Agent** | GitHub Copilot Chat |
| **Vendor** | GitHub / Microsoft |
| **Category** | Data exfiltration, Prompt injection, CSP bypass |
| **date_occurred** | June 2025 (vulnerability existed prior; discovered June 2025) |
| **date_discovered** | June 2025 |
| **date_reported** | June 2025 (via HackerOne) |
| **date_fixed** | August 14, 2025 |
| **date_disclosed** | October 8, 2025 |
| **Exploited in wild** | No evidence |
| **Damage type** | Potential (no confirmed breaches) |
| **Potential impact** | Private source code theft, credential exfiltration, zero-day exposure |
| **Root cause** | Indirect prompt injection via invisible HTML comments + CSP bypass via trusted infrastructure (Camo proxy) |
| **Fix** | Disabled image rendering in Copilot Chat entirely |
| **Researcher** | Omer Mayraz, Legit Security |

---

## Lessons / Patterns

1. **Vendor infrastructure as exfiltration channel:** Both CamoLeak and EchoLeak demonstrate that attackers can bypass CSP by routing exfiltration through the vendor's own trusted proxies and APIs. This is an emergent pattern in AI assistant attacks.

2. **Invisible content = prompt injection surface:** Any mechanism that hides content from human view while keeping it in the AI's context window (HTML comments, hidden Unicode, reference-style markdown) creates a prompt injection opportunity.

3. **Feature removal as fix:** GitHub chose to disable image rendering entirely rather than trying to filter or sanitize prompt injections, acknowledging that prompt injection defense in LLM-based tools remains fundamentally unsolved.

4. **Permission inheritance amplifies impact:** Copilot's access to all of a user's authorized repositories means a prompt injection in one public/shared repo can exfiltrate data from entirely separate private repos.

5. **Zero-click exfiltration via browser behavior:** Browser auto-fetching of images turns any image-rendering capability in an AI assistant into a potential zero-click exfiltration channel.
