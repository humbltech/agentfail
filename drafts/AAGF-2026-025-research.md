# AAGF-2026-025 Research Document

**Subject:** Three chained flaws in Anthropic's mcp-server-git (path traversal + argument injection + arbitrary file write) enable RCE
**CVEs:** CVE-2025-68143, CVE-2025-68144, CVE-2025-68145
**Disclosing researcher:** Yarden Porat (yardenporat), Cyata Security
**Primary source:** https://pipelab.org/blog/state-of-mcp-security-2026/
**Researcher:** Claude (automated Stage 1)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-025

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| PipeLab — State of MCP Security 2026 | https://pipelab.org/blog/state-of-mcp-security-2026/ | MCP security research aggregator | High | Primary framing source; mentions initial mention of the incident |
| The Vulnerable MCP Project | https://vulnerablemcp.info/vuln/cve-2025-68145-anthropic-git-mcp-rce-chain.html | Dedicated MCP CVE database | High | Detailed 4-step chain breakdown; treats as single chained advisory |
| The Register | https://www.theregister.com/2026/01/20/anthropic_prompt_injection_flaws/ | Independent journalism | High | Yarden Porat quoted directly; Anthropic did not respond to inquiry |
| The Hacker News | https://thehackernews.com/2026/01/three-flaws-in-anthropic-mcp-git-server.html | Security journalism | High | 6-step exploit chain; CVSS scores; good technical depth |
| SecurityWeek | https://www.securityweek.com/anthropic-mcp-server-flaws-lead-to-code-execution-data-exposure/ | Security journalism | High | Focus on prompt injection as attack vector |
| Dark Reading | https://www.darkreading.com/application-security/microsoft-anthropic-mcp-servers-risk-takeovers | Security journalism | High | Broader MCP ecosystem framing |
| GitHub Advisory GHSA-5cgr-j3jf-jw3v (CVE-2025-68143) | https://github.com/advisories/GHSA-5cgr-j3jf-jw3v | Official security advisory | Authoritative | git_init path traversal; CVSS 4.0: 6.5; patched in 2025.9.25 |
| GitHub Advisory GHSA-9xwc-hfwc-8w59 (CVE-2025-68144) | https://github.com/advisories/GHSA-9xwc-hfwc-8w59 | Official security advisory | Authoritative | Argument injection in git_diff/git_checkout; CVSS 4.0: 6.3/6.4; patched in 2025.12.18 |
| GitHub Advisory GHSA-j22h-9j4x-23w5 (CVE-2025-68145) | https://github.com/advisories/GHSA-j22h-9j4x-23w5 | Official security advisory | Authoritative | --repository flag bypass; CVSS v3: 7.1 / CVSS 4.0: 6.3; patched in 2025.12.18 |
| Feedly CVE-2025-68143 | https://feedly.com/cve/CVE-2025-68143 | CVE aggregator | High | CVSS v3.1: 8.8; vector string confirmed |
| NVD CVE-2025-68143 | https://nvd.nist.gov/vuln/detail/CVE-2025-68143 | NVD (authoritative) | Authoritative | Government CVE record |
| NVD CVE-2025-68144 | https://nvd.nist.gov/vuln/detail/CVE-2025-68144 | NVD (authoritative) | Authoritative | Government CVE record |
| NVD CVE-2025-68145 | https://nvd.nist.gov/vuln/detail/CVE-2025-68145 | NVD (authoritative) | Authoritative | Government CVE record |
| GitLab Advisory CVE-2025-68144 | https://advisories.gitlab.com/pkg/pypi/mcp-server-git/CVE-2025-68144/ | Advisory mirror | High | Confirms CWE-88 and CVSS details |
| GitLab Advisory CVE-2025-68145 | https://advisories.gitlab.com/pkg/pypi/mcp-server-git/CVE-2025-68145/ | Advisory mirror | High | Confirms --repository bypass details |
| Endor Labs analysis | https://www.endorlabs.com/learn/classic-vulnerabilities-meet-ai-infrastructure-why-mcp-needs-appsec | Security research | High | CWE-22 / CWE-77 classifications; "classic vulns in AI infra" framing |
| ByteVanguard | https://bytevanguard.com/2026/01/21/anthropic-mcp-git-flaws/ | Security blog | Medium | Good secondary summary |
| Infosecurity Magazine | https://www.infosecurity-magazine.com/news/prompt-injection-bugs-anthropic/ | Security journalism | High | "Prompt injection bugs" framing; correctly identifies attack vector |
| Security Boulevard | https://securityboulevard.com/2026/01/anthropic-microsoft-mcp-server-flaws-shine-a-light-on-ai-security-risks/ | Security journalism | Medium | Ecosystem risk framing |
| Adversa AI — Top MCP resources Feb 2026 | https://adversa.ai/blog/top-mcp-security-resources-february-2026/ | AI security research | Medium | Aggregator; useful for corroboration |
| Cyata AI blog (related research) | https://cyata.ai/blog/whispering-secrets-loudly-inside-mcps-quiet-crisis-of-credential-exposure/ | Disclosing firm's blog | High | Cyata's own blog; confirms firm context |
| cvedetails.com CVE-2025-68145 | https://www.cvedetails.com/cve/CVE-2025-68145/ | CVE aggregator | Medium | NVD mirror |
| Mondoo vulnerability intelligence CVE-2025-68145 | https://mondoo.com/vulnerability-intelligence/vulnerability/CVE-2025-68145 | Security platform | Medium | Additional CVSSv3 confirmation |
| OSV CVE-2025-68143 | https://test.osv.dev/vulnerability/CVE-2025-68143 | Open source vulnerability DB | High | Ecosystem record |
| Aviatrix threat research | https://aviatrix.ai/threat-research-center/anthropic-2026-mcp-git-server-vulnerability-prompt-injection/ | Security research | Medium | Good context on prompt injection angle |

**Source quality summary:** Strong. Three official GitHub Security Advisories (the authoritative records from the affected repository), confirmed NVD entries, two high-quality independent security journalism sources (The Register, Hacker News), and the disclosing firm's own blog. CVSS scores confirmed across multiple independent aggregators.

---

## Overview

Cyata Security researcher Yarden Porat discovered three discrete input validation vulnerabilities in `mcp-server-git`, Anthropic's own reference implementation of a Model Context Protocol server for git operations. The flaws — a repository creation path traversal (CVE-2025-68143), a scope restriction bypass (CVE-2025-68145), and an argument injection in diff/checkout functions (CVE-2025-68144) — are individually limited in impact but chain to a full remote code execution path when the Git MCP server is deployed alongside the official Filesystem MCP server.

The attack is triggered via indirect prompt injection: an attacker embeds malicious instructions in content the AI assistant will read (a README, a GitHub issue, a compromised webpage). The LLM then autonomously calls the vulnerable MCP tools with attacker-controlled arguments, making user interaction unnecessary after the initial poisoning.

This is notable because the vulnerable code is Anthropic's own first-party reference implementation — the code developers are directed to examine and replicate when building MCP-enabled products. A security flaw in a reference implementation carries disproportionate risk because it propagates to every derivative.

Reported June 2025. Two-stage patch: partial fix in September 2025, full resolution in December 2025. Publicly disclosed January 20, 2026. No evidence of in-the-wild exploitation documented.

---

## Timeline

| Date | Event |
|------|-------|
| June 2025 | Yarden Porat (Cyata Security) reports all three vulnerabilities to Anthropic via HackerOne |
| September 2025 | Anthropic ships `mcp-server-git v2025.9.25` — partially patches CVE-2025-68143 (git_init path traversal); CVE-2025-68144 and CVE-2025-68145 remain unpatched |
| December 2025 | Anthropic ships `mcp-server-git v2025.12.18` — patches CVE-2025-68144 and CVE-2025-68145; removes git_init tool entirely as definitive fix for CVE-2025-68143 |
| January 20, 2026 | Coordinated public disclosure; The Register and The Hacker News publish; GitHub Security Advisories made public |
| January 21, 2026 | Multiple secondary security outlets cover; ByteVanguard, SecurityWeek, Infosecurity Magazine publish |
| February 2026 | Adversa AI lists incident in "Top MCP Security Resources" aggregator; broad security community awareness |

**Disclosure gap:** ~7 months from report to full patch, ~7.5 months from report to public disclosure. The Register noted Anthropic did not respond to media inquiries at time of publication.

---

## Technical Details

### The Affected Component

**Package:** `mcp-server-git` (Python)
**Repository:** `modelcontextprotocol/servers` (Anthropic-managed)
**Purpose:** Official MCP server providing git operations (init, clone, diff, checkout, add, commit, log, etc.) to AI agents via the Model Context Protocol
**Backend library:** GitPython (wraps git CLI calls)

The server exposes git capabilities as MCP "tools" that an LLM agent can call. Tools accept structured arguments passed from the LLM decision layer — the attack surface.

---

### CVE-2025-68143 — Unrestricted git_init (Path Traversal / Arbitrary Repository Creation)

**GitHub Advisory:** GHSA-5cgr-j3jf-jw3v
**CWE:** CWE-22 — Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)
**CVSS v3.1 Score:** 8.8 (High) — `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H`
**CVSS v4.0 Score:** 6.5 (Medium) — `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:N/VI:N/VA:N/SC:H/SI:H/SA:H`
**Affected versions:** mcp-server-git < 2025.9.25
**First partial patch:** v2025.9.25 (September 2025)
**Definitive fix:** v2025.12.18 — git_init tool removed entirely

**Mechanism:**

The `git_init` MCP tool accepted an arbitrary filesystem path as its argument and invoked `git init` at that location without any validation against allowed directories. Unlike other git tools in the server, which required an existing repository path, `git_init` could operate on any directory the server process had write access to.

This meant an attacker (via a prompt-injected instruction to the LLM) could invoke `git_init` with any target path — including sensitive system directories such as `~/.ssh`, `/etc`, or any application data directory — transforming them into git repositories. Once a directory is a git repository, it becomes eligible for all other git MCP tool operations (add, commit, etc.) and, critically, for git hook mechanisms.

**Why this matters for the chain:** Converting `~/.ssh` or a temporary directory into a git repository is the prerequisite step that makes the RCE chain possible. Without arbitrary repository creation, the subsequent steps have no surface to plant their payload.

**Anthropic's fix rationale:** The tool was removed entirely rather than patched, because `mcp-server-git` is designed to operate on *existing* repositories; the ability to create new repositories in arbitrary locations was architecturally out of scope and could not be safely constrained with path filters alone.

---

### CVE-2025-68145 — Repository Scope Bypass (--repository Flag Bypass)

**GitHub Advisory:** GHSA-j22h-9j4x-23w5
**CWE:** CWE-22 — Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)
**CVSS v3.1 Score:** 7.1 (High)
**CVSS v4.0 Score:** 6.3 (Medium)
**Affected versions:** mcp-server-git < 2025.12.18
**Patch:** v2025.12.18 (December 2025)
**Researcher:** yardenporat (HackerOne)

**Mechanism:**

`mcp-server-git` supports a `--repository` command-line flag intended to restrict the server's operations to a single, pre-approved repository path. This was the server's primary security boundary: administrators could launch the server with `--repository /safe/repo` and expect that no git operations could reach outside that directory.

The flaw: while the server validated the `--repository` flag value at startup, it did not validate the `repo_path` argument in individual subsequent tool calls. Each MCP tool that accepts a repository path accepted it without checking whether that path fell within the configured `--repository` boundary.

An attacker (via prompt injection) could therefore pass an arbitrary `repo_path` to any git tool call — completely bypassing the scope restriction that `--repository` was intended to enforce. This is a classic "validate at registration, not at use" input validation failure.

**Scope boundary violated:** The configured `--repository` directory. Operations could reach any git repository accessible to the server process on the filesystem.

**Anthropic's fix:** Adds path resolution at tool invocation time — both the configured repository path and the requested path are resolved (following symlinks), and the tool verifies the requested path is a subpath of the configured repository before executing.

---

### CVE-2025-68144 — Argument Injection in git_diff / git_checkout

**GitHub Advisory:** GHSA-9xwc-hfwc-8w59
**CWE:** CWE-88 — Improper Neutralization of Argument Delimiters in a Command (Argument Injection)
**CVSS v3.1 Score:** 8.1 (High)
**CVSS v4.0 Score:** 6.3–6.4 (Medium)
**CVSS v4.0 Vector:** `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:N/VI:N/VA:N/SC:N/SI:H/SA:L`
**Affected versions:** mcp-server-git < 2025.12.18
**Patch:** v2025.12.18 (December 2025)
**Researcher:** yardenporat (HackerOne)

**Mechanism:**

The `git_diff` and `git_checkout` functions passed user-controlled arguments directly to the underlying git CLI (via GitPython) without sanitization. The argument fields — intended to accept git refs like branch names or commit hashes — were passed without stripping or rejecting flag-like values.

This allowed injection of git command-line flags. The documented proof-of-concept for `git_diff`: injecting `--output=/path/to/file` as the `target` argument causes git to write diff output to that file path rather than returning it through the normal output channel. Since git creates or overwrites the output file, this achieves arbitrary file write with the content of an empty diff (or controlled diff content with additional manipulation).

**Which arguments / which tools:**
- `git_diff`: `target` argument (accepts git ref — injecting `--output=` redirects output to arbitrary path)
- `git_checkout`: ref/branch argument (accepts git ref — similar injection surface)

**File write impact:** Any file path writable by the server process. This includes application configuration files, SSH authorized_keys, shell profile files, and (combined with CVE-2025-68143) git hook scripts.

**Anthropic's fix:** Patch validates that arguments do not begin with a hyphen (rejecting flag-like values) and additionally verifies the argument resolves to a valid git reference via `rev_parse` before passing it to the git command.

---

### The RCE Chain — How the Three Flaws Combine

The chain was demonstrated by Cyata using a deployment where both the Git MCP server and the Filesystem MCP server are active simultaneously. As Yarden Porat stated: *"Each MCP server might look safe in isolation, but combine two of them — Git and Filesystem in this case — and you get a toxic combination."*

**Full 6-step chain (as documented by The Hacker News / Cyata):**

1. **Scope bypass** (CVE-2025-68145): Attacker uses prompt injection to instruct the LLM to call git tools with `repo_path` arguments pointing outside the allowed `--repository` scope, reaching a writable directory the attacker controls.

2. **Repository creation** (CVE-2025-68143): LLM is instructed to call `git_init` on a chosen writable directory (e.g., `/tmp/exploit` or `~/.ssh`), initializing it as a git repository and making it eligible for subsequent git operations via the MCP server.

3. **Payload write** (Filesystem MCP server): LLM uses the Filesystem MCP server to write a malicious shell script (e.g., a reverse shell or persistence payload) to a path within the newly initialized repository.

4. **Hook configuration** (Filesystem MCP server + CVE-2025-68144): LLM uses the Filesystem MCP server to write a malicious `.git/config` that configures a git smudge/clean filter pointing to the payload script, and writes a `.gitattributes` file that applies the filter to all tracked files.

5. **Trigger file creation** (Filesystem MCP server): LLM writes a trigger file that matches the `.gitattributes` filter pattern.

6. **Filter execution** (CVE-2025-68144 + git clean filter): LLM calls `git_add` (or `git_diff` with injected arguments) on the repository. Git processes the trigger file through the configured clean filter, which executes the payload script. RCE achieved.

**Attack vector for the chain:** Indirect prompt injection — an attacker plants malicious instructions in content the LLM will process (a malicious repository README, a poisoned GitHub issue, a compromised webpage the agent browses). No direct access to the victim's system is required; the LLM autonomously executes the chain after reading the poisoned content.

**Privilege context:** The payload executes with the same OS privileges as the MCP server process — typically the user's own account when running locally with Claude Desktop or Cursor.

---

## Damage Assessment

**Direct impact (demonstrated):**
- Arbitrary code execution on the developer's machine
- Arbitrary file overwrite (any file writable by the server process)
- Breach of repository scope isolation (access to any repository on the system)
- SSH key exfiltration or overwrite (via `.ssh` directory targeting)
- Persistence via shell profile modification

**Deployment surface:**
- `mcp-server-git` is Anthropic's own reference implementation, distributed via the `modelcontextprotocol/servers` repository
- It is the canonical example for MCP git integration, referenced in official MCP documentation and tutorials
- Claude Desktop, Cursor, and other MCP-compatible AI coding assistants can all be configured to use it
- As a reference implementation, it directly influenced derivative MCP servers built by third parties replicating its patterns
- Specific download/install counts not publicly disclosed; the broader MCP SDK package (`@modelcontextprotocol/sdk`) had significant adoption by early 2026, indicating broad ecosystem exposure

**In-the-wild exploitation:**
- No evidence of confirmed exploitation documented across any source at time of research
- The attack requires specific deployment configuration (both Git and Filesystem MCP servers active simultaneously) which limits the immediately exploitable population
- However, this is precisely the configuration shown in Anthropic's own quickstart documentation

**Systemic significance:**
- First major CVE chain against a first-party Anthropic reference implementation
- Demonstrates that indirect prompt injection (attacker influences LLM-processed content) is a viable delivery mechanism for tool-layer exploits — no user clicks required
- Sets a precedent for MCP server security requirements; Cyata's research directly accelerated MCP security tooling development

---

## Vendor Response

**Anthropic's patching:**
- Two-stage patch. CVE-2025-68143 partially fixed in September 2025 (v2025.9.25). All three fully resolved in December 2025 (v2025.12.18).
- The fix for CVE-2025-68143 was removal of the `git_init` tool entirely — an architectural decision, not a filter patch.
- Fix for CVE-2025-68145: adds path resolution and subpath verification at each tool call.
- Fix for CVE-2025-68144: rejects hyphen-prefixed arguments and validates via `rev_parse`.
- Patch commit: `eac56e7bcde48fb64d5a973924d05d69a7d876e6` (CVE-2025-68143).

**Anthropic's public communication:**
- The Register reported that Anthropic did not respond to media inquiries at the time of the January 20, 2026 disclosure.
- No public blog post, security bulletin, or incident disclosure from Anthropic has been documented in sources reviewed.
- GitHub Security Advisories were published on the `modelcontextprotocol/servers` repository — the standard disclosure mechanism, but not proactively communicated.

**HackerOne:** Researcher submitted via HackerOne (`yardenporat`). Triage and coordination occurred through HackerOne.

**Assessment of response quality:** Adequate on patching timeline (7-month window is long but included coordinated disclosure); weak on public communication (no proactive outreach to users of the affected package; Anthropic's silence with press is notable given the first-party nature of the flaw).

---

## Researcher Notes

### Confidence Assessment
- **CVE IDs:** Confirmed — appear in GitHub Security Advisories, NVD, and multiple independent sources
- **CVSS scores:** Confirmed — cross-referenced across Feedly, GitLab advisories, GitHub advisories, and search results (some variation between v3 and v4 is expected and documented)
- **CWE classifications:** High confidence — CWE-22 for CVE-2025-68143/68145, CWE-88 for CVE-2025-68144, confirmed across multiple sources
- **Timeline:** High confidence — June 2025 report, September 2025 partial patch, December 2025 full patch, January 20, 2026 disclosure — consistent across all sources
- **Researcher identity:** High confidence — "yardenporat" confirmed on HackerOne credits in GitHub advisories; Cyata Security confirmed as the employer in The Register and multiple outlets
- **Exploitation chain:** High confidence — 6-step chain consistent across The Hacker News and The Vulnerable MCP Project; independently corroborated

### Data Gaps
- **No download/install statistics** for `mcp-server-git` specifically — package is distributed via GitHub (not npm for Python version), making accurate install counts difficult to establish
- **No CVSS vector for CVE-2025-68145 v3.1** — score (7.1) confirmed but full vector string not recovered
- **Anthropic's official public statement** — none located; Anthropic did not respond to The Register inquiry; no Anthropic security blog post found
- **In-the-wild exploitation** — no confirmed cases; absence of evidence is not strong evidence of absence given the 7-month gap between report and disclosure
- **Cyata's primary research blog post** — Cyata's own blog (cyata.ai) does not appear to have published a detailed technical writeup specific to this CVE chain at time of research (a related but different prompt injection post was found); their disclosure vehicle appears to have been HackerOne + coordinated press

### Categorization Guidance
- **Primary failure mode:** Tool-layer input validation failure — classic path traversal and argument injection in an MCP tool handler
- **Delivery mechanism:** Indirect prompt injection (attacker poisons LLM-processed content; LLM autonomously calls vulnerable tools)
- **Agent-specific risk:** The multi-server composition risk — each server appears safe in isolation; unsafe combinations emerge from agentic deployment patterns where multiple MCP servers are active simultaneously
- **Taxonomy:** Input Validation Failure + Prompt Injection (indirect) + Tool Abuse + Cross-Server Composition Risk

### AAGF Classification Flags
- First-party vendor reference implementation failure (not third-party ecosystem)
- Multi-CVE chain (not a single vulnerability)
- Prompt injection as delivery mechanism distinguishes from pure software CVE
- Cross-server composition risk (Git + Filesystem interaction) is a novel MCP-specific attack pattern worth flagging in taxonomy
- No confirmed harm to end users (research disclosure, not incident) — but classify as high-risk near-miss given deployment footprint

---

*Research complete. Ready for Stage 2 draft authoring.*
