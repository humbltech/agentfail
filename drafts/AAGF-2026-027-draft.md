---
id: "AAGF-2026-027"
title: "Two Path Traversal CVEs in Anthropic's mcp-server-filesystem Reference Implementation Allow Full Sandbox Escape"
status: "reviewed"
date_occurred: "2025-03-28"           # Upper bound from earliest affected version; exact intro commit unknown
date_discovered: "2025-06-01"         # Approximate date both Elad Beber (Cymulate) and wunderwuzzi independently report
date_reported: "2025-07-01"           # First public disclosure — GitHub Security Advisories GHSA-q66q-fx2p-7w4m and GHSA-hc55-p739-j48w published
date_curated: "2026-05-06"
date_council_reviewed: "2026-05-06"

# Classification
category:
  - "Tool Misuse"
  - "Unauthorized Data Access"
  - "Supply Chain Compromise"
severity: "High"
agent_type:
  - "Tool-Using Agent"
  - "Coding Assistant"
agent_name: "mcp-server-filesystem (Anthropic reference implementation)"
platform: "Anthropic MCP / Claude Desktop / Cursor"
industry: "AI Infrastructure / Developer Tools"

# Near-miss classification
actual_vs_potential: "near-miss"
potential_damage: "Full filesystem access within the MCP server process's OS privilege scope: SSH private keys, .env files, application secrets, database credentials, cloud provider credentials, source code, and system configuration files. With elevated OS privileges (running as root or with write access to /etc or macOS Launch Agent directories): write to /etc/sudoers or system Launch Agent plist files to achieve remote code execution and persistent backdoor installation. Cymulate's EscapeRoute PoC demonstrated the symlink traversal path to /etc/sudoers as a concrete RCE scenario (researcher-attributed; requires elevated process privileges not present in default user-context deployments)."
intervention: "Responsible disclosure by Elad Beber (Cymulate) and independent co-discovery by wunderwuzzi (Embrace The Red); coordinated patch cycle resulting in fix within ~30 days of reports (June 2025 reports, July 1 2025 patch). No confirmed in-the-wild exploitation prior to or after disclosure. Note: 'no confirmed exploitation' reflects absence of public incident reports, not a verified forensic absence — the vulnerability window extended through any deployment not updated from v0.6.3."

# Impact
financial_impact: "Not quantified — no confirmed exploitation"
financial_impact_usd: null
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null                          # All users of mcp-server-filesystem reference implementation; deployment count not publicly available
  scale: "widespread"
  data_types_exposed: ["credentials", "source_code"]

# Damage Timing
damage_speed: "minutes"               # Symlink creation + traversal exploitable in a single agent tool call sequence
damage_duration: "persistent"         # Files accessible until discovery; credentials remain compromised until rotated
total_damage_window: "~30 days"       # June 2025 (disclosure) through July 1 2025 (patch); longer for deployments not updated promptly

# Recovery
recovery_time: "unknown"
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "No confirmed exploitation means no recovery costs documented. Had exploitation occurred: credential rotation across all files accessible to process (SSH keys, .env, API keys), audit of filesystem writes during exposure window, forensic investigation of affected developer machines."
full_recovery_achieved: "unknown"

# Business Impact
business_scope: "multi-org"
business_criticality: "high"
business_criticality_notes: "Any credential file accessible to the MCP server process was within reach of a traversal. Reference implementation status amplifies blast radius: security flaws in Anthropic's own example code propagate to every developer who built filesystem MCP tooling from this codebase. CVE-2025-53109 and CVE-2025-53110 also existed simultaneously with the unpatched mcp-server-git CVEs (AAGF-2026-025), creating a 5-month window of overlapping filesystem exposure."
systems_affected: ["credentials", "source-code", "developer-machines", "filesystem"]

# Vendor Response
vendor_response: "fixed"              # Both CVEs patched in v0.6.3, released July 1 2025; new path-validation.ts module (992 lines)
vendor_response_time: "30+ days"      # ~30 days from initial reports (early June) to patch (July 1 2025)

# Presentation
headline_stat: "CVSS 8.4: AI agents using Anthropic's own filesystem server could read or write any file on the host — ~/.ssh/id_rsa to /etc/sudoers — by exploiting two basic path validation flaws that bypassed the allowed-directory sandbox"
operator_tldr: "Upgrade @modelcontextprotocol/server-filesystem to v0.6.3 immediately. If your deployment uses this package and runs with elevated OS privileges, treat SSH keys, .env files, and API credentials on the host as potentially compromised and rotate them. Add fs.realpath() canonicalization before any directory boundary check in derivative filesystem tools — path string matching without symlink resolution does not constitute a security boundary."
containment_method: "third_party"     # Responsible disclosure by Elad Beber (Cymulate) and wunderwuzzi (Embrace The Red)
public_attention: "medium"            # Hackaday, CybersecurityNews, PipeLab; security community but not mainstream viral

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0053"        # AI Agent Tool Invocation — LLM instructed to invoke vulnerable filesystem tools
    - "AML.T0086"        # Exfiltration via AI Agent Tool Invocation — read traversal enables credential/key exfiltration
    - "AML.T0055"        # Unsecured Credentials — SSH keys, .env files, API keys accessible via traversal
    - "AML.T0083"        # Credentials from AI Agent Configuration — credentials readable within process privilege scope
    - "AML.T0098"        # AI Agent Tool Credential Harvesting — traversal paths to credential files
    - "AML.T0105"        # Escape to Host — symlink traversal breaks out of allowed-directory sandbox to host filesystem
    - "AML.T0010"        # AI Supply Chain Compromise — reference implementation flaw propagates to derivative adopters
    - "AML.T0010.005"    # AI Agent Tool — specifically a tool-level supply chain compromise vector
  owasp_llm:
    - "LLM02:2025"       # Sensitive Information Disclosure — credential files accessible via traversal
    - "LLM06:2025"       # Excessive Agency — filesystem tools execute beyond their configured scope
    - "LLM03:2025"       # Supply Chain — reference implementation as propagation vector for derivative projects
  owasp_agentic:
    - "ASI02:2026"       # Tool Misuse and Exploitation — filesystem tools exploited via path traversal
    - "ASI03:2026"       # Agent Identity and Privilege Abuse — agent exceeds authorized filesystem scope
    - "ASI04:2026"       # Agentic Supply Chain Compromise — reference implementation as supply chain risk
  ttps_ai:
    - "2.5.4"            # AI Agent Tool Invocation — attacker-controlled paths through LLM intermediary
    - "2.12"             # Collection — traversal enables collection of credential and source files
    - "2.15"             # Exfiltration — credential exfiltration as end-state of read traversal
    - "2.9"              # Credential Access — SSH keys, .env files, API credentials targeted
    - "2.7"              # Privilege Escalation — write to /etc/sudoers or Launch Agent dirs (elevated process only)

# Relationships
related_incidents:
  - "AAGF-2026-025"     # mcp-server-git CVE chain — same Anthropic first-party reference implementation repo; git exploit chain used filesystem server as write primitive; same June 2025 reporting timeframe; both patched from same root cause (no basic traversal defense review before publication)
  - "AAGF-2026-022"     # MCP STDIO "Execute-First, Validate-Never" — same MCP protocol security crisis context; both Anthropic MCP failures; -022 is protocol design level, -027 is reference implementation level
pattern_group: "mcp-protocol-security-crisis"
tags:
  - mcp
  - mcp-server-filesystem
  - anthropic
  - reference-implementation
  - path-traversal
  - symlink-traversal
  - prefix-match-bypass
  - sandbox-escape
  - allowed-directory
  - cwe-59
  - cwe-22
  - cve-2025-53109
  - cve-2025-53110
  - cvss-84
  - rce-conditional
  - credential-theft
  - ssh-keys
  - env-files
  - claude-desktop
  - cursor
  - developer-machine
  - cymulate
  - elad-beber
  - wunderwuzzi
  - embrace-the-red
  - escaperoute
  - supply-chain-propagation
  - realpath-missing
  - startswith-bypass

# Metadata
sources:
  - "https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-q66q-fx2p-7w4m"   # CVE-2025-53109; CVSS 8.4
  - "https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-hc55-p739-j48w"   # CVE-2025-53110; CVSS 7.3
  - "https://nvd.nist.gov/vuln/detail/CVE-2025-53109"
  - "https://nvd.nist.gov/vuln/detail/CVE-2025-53110"
  - "https://cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/"
  - "https://embracethered.com/blog/posts/2025/anthropic-filesystem-mcp-server-bypass/"
  - "https://hackaday.com/2025/07/07/this-week-in-security-anthropic-coinbase-and-oops-hunting/"
  - "https://cybersecuritynews.com/anthropics-mcp-server-vulnerability/"
  - "https://pipelab.org/blog/state-of-mcp-security-2026/"
  - "https://authzed.com/blog/timeline-mcp-breaches"
  - "https://github.com/modelcontextprotocol/servers/commit/d00c60df9d74dba8a3bb13113f8904407cda594f"
researcher_notes: "Two analytically distinct vulnerabilities that share a single architectural failure: validatePath() in src/filesystem/index.ts treated path strings as trusted representations of filesystem reality rather than as inputs to be canonicalized before use. CVE-2025-53109 (symlink traversal, CWE-59, CVSS 8.4) is the higher-severity flaw: the fix for symlink resolution was implemented but then bypassed by error-handling logic that allowed execution to continue after detecting a symlink. The bug was not merely a missing realpath() call but a failed fix that proceeded past its own detection. CVE-2025-53110 (prefix-match bypass, CWE-22, CVSS 7.3) is the simpler vulnerability: .startsWith() without a trailing path separator is a well-documented, textbook path traversal pattern that appears in OWASP path traversal guidance as an explicit anti-pattern. Both bugs existing simultaneously in Anthropic's own reference implementation — shipped for public adoption — indicates the codebase received no path-traversal-specific security review before publication. The RCE claim (write to /etc/sudoers or macOS Launch Agents) requires elevated OS privileges not present in default user-context Claude Desktop or Cursor deployments. This is technically achievable per Cymulate's EscapeRoute PoC but should not be headlined as the baseline threat; credential exfiltration via read traversal is the realistic threat for standard deployments. The relationship to AAGF-2026-025 is analytically important: both CVEs overlapped with the unpatched mcp-server-git CVEs for approximately 5 months (July 2025 patch for filesystem vs. December 2025 patch for git). During this overlap window, the git server's exploit chain used the filesystem server as a write primitive — meaning both the destination (filesystem) and the tool (git server) were simultaneously vulnerable. The patch commit (d00c60d, 992 lines in new path-validation.ts module) represents a significant security engineering investment, including proper symlink resolution via fs.realpath() and separator-aware prefix comparison. This suggests the pre-patch code was not reviewed to this standard before publication."
council_verdict: "Well-evidenced, technically precise analysis of two textbook path traversal CVEs in Anthropic's own reference implementation; near-miss classification and High severity are defensible, with the report's strongest analytical contribution being its supply chain propagation argument and the failed-fix pattern in CVE-2025-53109, though several claims about institutional process failures and derivative ecosystem exposure remain speculative due to absent public evidence."
---

# Two Path Traversal CVEs in Anthropic's mcp-server-filesystem Reference Implementation Allow Full Sandbox Escape

## Executive Summary

Anthropic's official reference implementation of a filesystem Model Context Protocol server — the canonical example developers follow when building file-access MCP integrations — contained two input validation failures that allowed AI agents to escape the configured allowed-directory sandbox and read or write any file accessible to the server process. The vulnerabilities required no user interaction after initial configuration: an agent operating on attacker-controlled content, or an agent given a malicious instruction via indirect prompt injection, could traverse to SSH private keys, `.env` files, API credentials, source code, and system configuration files anywhere on the filesystem. With elevated process privileges, write traversal reached `/etc/sudoers` and macOS Launch Agent directories, enabling persistent remote code execution (per Cymulate's EscapeRoute proof-of-concept — conditional on elevated OS privileges not present in default user-context deployments).

The two CVEs — CVE-2025-53109 (symlink traversal, CVSS 4.0: 8.4 HIGH) and CVE-2025-53110 (prefix-match bypass, CVSS 4.0: 7.3 HIGH) — were independently discovered by Elad Beber (Cymulate) and wunderwuzzi (Embrace The Red) in approximately June 2025, patched on July 1, 2025 in v0.6.3. No confirmed in-the-wild exploitation was reported. The vulnerabilities existed simultaneously with the unpatched mcp-server-git CVEs (AAGF-2026-025) for a five-month window, during which the git exploit chain explicitly used the filesystem server as a write primitive.

---

## Timeline

| Date | Event |
|------|-------|
| Before 2025-03-28 | Vulnerabilities introduced; exact commit unknown. CVE-2025-53109 and CVE-2025-53110 present in all affected versions of `@modelcontextprotocol/server-filesystem` |
| ~Early June 2025 | Elad Beber (Cymulate) discovers both vulnerabilities and reports to Anthropic |
| June 1, 2025 | wunderwuzzi (Embrace The Red) independently reports to Anthropic; Anthropic acknowledges pre-existing awareness of the issue |
| June 30, 2025 | Fix authored by Jenn Newton; commit d00c60d — "Address symlink and path prefix issues" — adds new `src/filesystem/path-validation.ts` module (992 lines); merged by Paul Carleton |
| July 1, 2025 | v0.6.3 released; GitHub Security Advisories GHSA-q66q-fx2p-7w4m (CVE-2025-53109) and GHSA-hc55-p739-j48w (CVE-2025-53110) published — **first public disclosure** |
| July 2, 2025 | NVD publishes CVE-2025-53109 and CVE-2025-53110; Cymulate publishes EscapeRoute blog post (Elad Beber) |
| July 7, 2025 | Hackaday "This Week In Security" covers both CVEs; independent third-party confirmation |
| August 3, 2025 | wunderwuzzi publishes independent writeup on Embrace The Red |
| ~August–December 2025 | Overlap window: mcp-server-filesystem patched; mcp-server-git CVEs (AAGF-2026-025) remain unpatched until December 2025; git exploit chain used filesystem server as write primitive during this period |

**Disclosure gap:** ~30 days from initial reports to patch. Patch velocity was notably faster than the 7-month timeline for mcp-server-git (AAGF-2026-025). No proactive security bulletin from Anthropic beyond the GitHub Security Advisories.

---

## What Happened

### What mcp-server-filesystem Is — and Why Reference Status Matters

`mcp-server-filesystem` is Anthropic's official reference implementation of a Model Context Protocol server for filesystem operations. It provides AI agents with tools to read files, write files, list directories, create directories, search for content, and move or delete files. The `allowedDirectories` configuration parameter is the server's primary security boundary: operators specify which directories on the filesystem the agent is permitted to access, and all operations are supposed to be constrained within those directories.

Reference implementations carry disproportionate security risk. When Anthropic publishes a reference implementation, developers treat it as the canonical pattern for building MCP filesystem integrations. Security flaws in reference implementations propagate to every downstream project built from them, creating a supply chain effect without a traditional supply chain attack vector. The security model developers rely on in derivative tools depends on the correctness of the reference.

The server is deployed by Claude Desktop, Cursor, and any other MCP-compatible AI coding assistant configured to provide filesystem access to the agent. It is among the most commonly deployed MCP servers because filesystem access is a foundational capability for any coding or document-processing AI agent.

### The Two Vulnerabilities

Elad Beber (Cymulate) and wunderwuzzi (Embrace The Red) independently discovered two discrete path validation failures in `validatePath()`, the function responsible for enforcing the `allowedDirectories` boundary before any filesystem operation. Beber named the combined vulnerability class "EscapeRoute."

**CVE-2025-53109** (symlink traversal, CWE-59, CVSS 4.0: 8.4 HIGH): `validatePath()` used `path.normalize()` to canonicalize paths but did not call `fs.realpath()` to resolve symbolic links before the directory boundary check. Additionally, error handling allowed execution to continue after detecting a symlink rather than blocking it. The result: an attacker or malicious prompt could create a symlink inside the allowed directory pointing to any location outside it. The path string check passed (the symlink path was inside the allowed directory), and the OS then followed the symlink to its actual target beyond the boundary. Read or write calls through that symlink bypassed all access controls.

**CVE-2025-53110** (prefix-match bypass, CWE-22, CVSS 4.0: 7.3 HIGH): The same `validatePath()` function used `.startsWith()` without appending a path separator to verify a true directory boundary:

```
Allowed: /private/tmp/allowed_dir
Check:   requestedPath.startsWith('/private/tmp/allowed_dir')
Bypass:  /private/tmp/allowed_dir-other → PASSES
         /private/tmp/allowed_dirsibling → PASSES
```

As wunderwuzzi documented: "The validatePath function uses a .startsWith() comparison without verifying the path represents an actual directory boundary." As Hackaday summarized: "If the allowed path is `/home/user/Public` and there's a second folder, `/home/user/PublicNotAllowed`, the AI has access to both."

### The Attack Paths

**Via CVE-2025-53109 (symlink traversal):** An attacker creates a symlink inside the allowed directory pointing to a sensitive path — `~/.ssh/id_rsa`, `~/.aws/credentials`, a project `.env` file, or a system configuration directory. The agent reads or writes through the symlink. The allowed-directory sandbox is bypassed. The attacker either provides direct instructions to the agent ("read the file at /allowed_dir/link-to-ssh-key") or delivers instructions via indirect prompt injection through content the agent reads. With write capability and elevated OS privileges (e.g., process running as root or with write access to system directories), Cymulate's PoC demonstrates writing to `/etc/sudoers` or macOS Launch Agent plist files to achieve RCE and persistence.

**Via CVE-2025-53110 (prefix-match bypass):** If a sibling directory exists whose name begins with the same string as the allowed directory, the boundary check incorrectly grants access. This requires knowledge of the host filesystem layout but is exploitable without any symlink creation — the bypass is a simple string manipulation of the requested path.

Both traversal paths are exploitable through indirect prompt injection: malicious instructions embedded in a README, GitHub issue, project documentation, or any document the agent reads can cause the agent to invoke filesystem tools with traversal payloads, with no user interaction required beyond initial configuration.

### Vendor Response and Patching

Anthropic patched both CVEs in a single commit (d00c60d) on June 30, 2025, released as v0.6.3 on July 1. The fix introduces a new module, `src/filesystem/path-validation.ts` (992 lines added), implementing proper symlink resolution via `fs.realpath()` before boundary checks and path-separator-aware prefix comparison. The scale of the new module — nearly 1,000 lines — reflects the difference between the pre-patch ad hoc validation and a security-engineered path validation framework.

Anthropic published no proactive security bulletin. The GitHub Security Advisories were the disclosure mechanism. No outreach was directed to developers who had built derivative filesystem tools from the reference implementation.

---

## Technical Analysis

### CVE-2025-53109: Symlink Path Traversal (CWE-59)

- **GitHub Advisory:** GHSA-q66q-fx2p-7w4m
- **CWE:** CWE-59 — Improper Link Resolution Before File Access ("Link Following")
- **CVSS 4.0:** 8.4 HIGH

The `validatePath()` function in `src/filesystem/index.ts` operated in two steps:

1. Canonicalize the requested path using `path.normalize()`
2. Check whether the normalized path string starts with one of the allowed directories

The critical missing step: resolving symbolic links via `fs.realpath()` before the boundary check. `path.normalize()` resolves path components like `..` and `.` but does not follow symbolic links — it operates on the string representation of the path, not the filesystem. A symbolic link is, to `path.normalize()`, just another path component.

The second flaw compounded the first: the error handling for symlink detection allowed execution to continue. Even if code detected the presence of a symlink, the error path did not block the operation. The defensive intent existed; the defensive implementation failed.

**Exploitation pattern:**
1. Create symlink inside allowed directory: `ln -s /root/.ssh allowed_dir/ssh_link`
2. Request file read: `read_file("/allowed_dir/ssh_link/id_rsa")`
3. `validatePath()` checks: `"/allowed_dir/ssh_link/id_rsa".startsWith("/allowed_dir")` → **PASS**
4. OS follows symlink to actual path: `/root/.ssh/id_rsa`
5. SSH private key contents returned

**Exploitation for RCE (elevated process privileges only, per Cymulate EscapeRoute PoC):**
- Create symlink to `/etc/` → write to `/etc/sudoers` via agent write call
- Create symlink to macOS `~/Library/LaunchAgents/` → write malicious plist → persistence on next login

**Fix:** New `path-validation.ts` adds `fs.realpath()` call before boundary checks, resolving all symbolic links to their true filesystem targets before comparing against allowed directories. Symlink detection now blocks rather than continuing.

### CVE-2025-53110: Prefix-Match Path Traversal (CWE-22)

- **GitHub Advisory:** GHSA-hc55-p739-j48w
- **CWE:** CWE-22 — Improper Limitation of a Pathname to a Restricted Directory ("Path Traversal")
- **CVSS 4.0:** 7.3 HIGH

The boundary check used `.startsWith()` against the configured allowed directory path without appending a trailing path separator (`/`). This is a documented anti-pattern in path traversal prevention: a path that is a sibling of the allowed directory — not a child of it — will satisfy the `.startsWith()` check if the sibling's name begins with the allowed directory's name.

The vulnerability is purely a string matching failure, requiring no filesystem manipulation (unlike CVE-2025-53109 which requires symlink creation). If the filesystem contains `/workspace-sensitive` adjacent to the allowed `/workspace`, any agent request for a path under `/workspace-sensitive` will bypass the boundary check.

This is the textbook form of the CWE-22 path traversal pattern listed in OWASP's path traversal prevention cheat sheet. Its presence in a publicly released, production-targeting reference implementation indicates the `validatePath()` function received no review against known path traversal patterns.

**Fix:** New `path-validation.ts` appends the OS path separator before comparison and uses a path-aware comparison that verifies directory boundary semantics rather than string prefix matching.

### The Failed-Fix Pattern in CVE-2025-53109

A notable analytical detail: CVE-2025-53109 is not simply a case of missing security logic. The code contains evidence that symlink handling was considered — error handling exists for the symlink detection case. The failure is that the error path did not block execution. This is a "failed fix" pattern: a partial implementation of a security control that creates false confidence in the control's effectiveness while leaving the attack surface open. The 992-line replacement in `path-validation.ts` suggests that the pre-patch implementation was not merely missing controls but architecturally insufficient for security-critical path validation.

### Overlap with AAGF-2026-025 (mcp-server-git)

The mcp-server-git exploit chain (AAGF-2026-025) explicitly used the filesystem MCP server as a write primitive in its six-step RCE sequence. During the period from July 1, 2025 (filesystem CVEs patched) through December 2025 (git CVEs patched), deployments that updated the filesystem server but not the git server received the filesystem patch while retaining the git server's ability to use the (now-patched) filesystem server for write operations. The original overlap — both servers vulnerable simultaneously — existed from June 2025 through July 1, 2025, and represents the highest-risk window: CVE-2025-53110 provides a write primitive independent of the git server, and the git server's CVEs simultaneously offered their own traversal paths into the filesystem.

---

## Root Cause Analysis

**5 Whys:**

**Why 1:** Why could AI agents read or write files outside the configured allowed directories?

Because `validatePath()` — the single function enforcing all allowed-directory boundary checks — used two techniques that are insufficient security controls: `path.normalize()` without `fs.realpath()` (which does not resolve symbolic links), and `.startsWith()` without a trailing separator (which does not verify directory boundary semantics). Both are documented anti-patterns in path traversal prevention. The function's error handling for symlink detection allowed execution to continue rather than blocking it.

**Why 2:** Why did `validatePath()` use path string matching rather than path canonicalization with symlink resolution?

Because the implementation pattern was derived from traditional filesystem permission models that treat path strings as trustworthy representations of filesystem reality — models designed for static, trusted inputs, not for adversarially crafted paths supplied by an LLM processing untrusted content. The choice of `path.normalize()` over `fs.realpath()` is consistent with code written for correctness in the happy path, not written to resist path traversal attacks.

**Why 3:** Why was the boundary check not implemented to the security standard path traversal prevention requires?

Because the reference implementation was built with functional correctness as the primary goal — demonstrating how an MCP filesystem server works — without a pre-publication security review focused on the attack surface of tool inputs. The specific gap: no review against the documented path traversal prevention patterns in OWASP or CWE-22 guidance before the code was published as a reference.

**Why 4:** Why was no security review focused on path traversal conducted before publication?

Because MCP reference implementations were built during a period of rapid ecosystem expansion where adoption speed was the primary success metric. At the time of publication, secure-by-default patterns for MCP tool implementations — path traversal prevention standards, symlink resolution requirements, input validation frameworks — had not been established, documented, or enforced even within Anthropic's own MCP teams. Reference implementations were treated as functional demonstrations, not as security baselines.

**Why 5 / Root cause:** Why were secure-by-default standards not required before publishing reference implementations that would propagate to the broader developer ecosystem?

No mandatory pre-publication security review gate existed for first-party Anthropic MCP reference implementations. The institutional process that would have caught CVE-2025-53109 (symlink traversal) and CVE-2025-53110 (prefix-match bypass) — a required security review checklist including path traversal prevention verification before a repository is designated as reference material — was absent. The ecosystem-level consequence: every developer who built a filesystem MCP tool from this reference inherited the same vulnerability class, and those derivatives were not patched by Anthropic's July 1 fix. The security review cadence for MCP reference implementations was not commensurate with their de facto adoption rate as production deployment baselines.

**Root cause summary:** Path validation in `mcp-server-filesystem` was implemented using techniques appropriate for functional path normalization but insufficient for security boundary enforcement, because the codebase received no pre-publication review against documented path traversal attack patterns. The institutional root cause: no mandatory security review gate existed before Anthropic-published code was designated as a reference implementation for ecosystem adoption.

---

## Impact Assessment

**Severity:** High

**Justification:** CVSS 4.0: 8.4 for CVE-2025-53109. No confirmed exploitation. However, the realistic threat for standard user-privilege deployments is read/write access to all files within the OS process's privilege scope — including SSH private keys (`~/.ssh/`), `.env` files, cloud provider credentials (`~/.aws/credentials`), and source code. This is a credential exposure at the filesystem level that warrants High regardless of whether RCE (which requires elevated process privileges) is achievable in a given deployment.

**Actual vs. potential:** Near-miss. No confirmed in-the-wild exploitation reported prior to or after coordinated disclosure. However, the vulnerability window — from initial introduction (before March 2025) through July 1, 2025 patch for any deployment that updated promptly, and potentially longer for deployments that did not — represents a non-trivial exposure period. "No confirmed exploitation" reflects the absence of public incident reports, not forensic verification of non-exploitation.

**Who was at risk:**
- All users of `@modelcontextprotocol/server-filesystem` on versions < 0.6.3 / < 2025.3.28
- Claude Desktop and Cursor users with filesystem MCP configured
- Developers who built derivative filesystem MCP tools from the reference implementation (not patched by Anthropic's July 1 fix)

**What was accessible via traversal:**
- SSH private keys (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`)
- Cloud provider credential files (`~/.aws/credentials`, `~/.gcp/`, `~/.azure/`)
- `.env` files across all projects — application secrets, database credentials, API keys, OAuth tokens
- Full source code within the process's readable scope
- System configuration files within the process's readable scope
- Browser profile data (passwords, session tokens) if the MCP server runs as the user's account

**RCE scope note:** Write traversal to `/etc/sudoers` or macOS `~/Library/LaunchAgents/` requires the MCP server process to run with elevated OS privileges. Default Claude Desktop and Cursor deployments run the MCP server under the user's account, which does not have write access to `/etc/` on standard configurations. The RCE scenario documented in Cymulate's EscapeRoute blog is technically achievable but conditional on elevated process privileges not present in standard user-context deployments.

**Reference implementation amplification:** Developers who built derivative filesystem MCP tools from this codebase may have reproduced the same validation pattern. The July 1 patch does not reach those derivatives. The actual exposure surface depends on how many derivative tools exist and whether they copied the `validatePath()` logic — quantities unknowable from public data.

---

## How It Could Have Been Prevented

**1. Symlink resolution as a baseline for path validation.**
Any function that accepts a filesystem path and validates it against a security boundary must call `fs.realpath()` (or its equivalent) before the comparison. This resolves all symbolic links and path components to their true filesystem targets, making the boundary check operate on reality rather than string representation. This is the canonical defense against CWE-59 (link following) vulnerabilities and is documented in every major path traversal prevention guide. It was the core fix in the July 1 patch.

**2. Directory boundary-aware prefix comparison.**
Path prefix comparisons for security boundaries must append the OS path separator before checking: `requestedPath.startsWith(allowedDir + path.sep)` rather than `requestedPath.startsWith(allowedDir)`. This prevents sibling directories from matching as children. This is textbook CWE-22 prevention and appears in OWASP's path traversal prevention cheat sheet as a specific anti-pattern to avoid. Its absence from a publicly released reference implementation indicates the code was not reviewed against that guidance.

**3. A security review checklist for path traversal before publication.**
Both CVE-2025-53109 and CVE-2025-53110 would have been caught by a reviewer running through any standard path traversal review checklist. A mandatory checklist item — "Does this code use `fs.realpath()` before directory boundary checks? Does this code append a path separator in prefix comparisons?" — reviewed before the repository was published as a reference would have blocked both vulnerabilities before propagation.

**4. Error handling that blocks, not continues.**
CVE-2025-53109 includes a failed-fix element: code that detected a symlink but allowed execution to continue. Security-critical error handling must follow a fail-closed model: when a security check detects an anomaly, it must block the operation and return an error, never continue. A code review policy requiring fail-closed error handling in security boundary functions would have caught this specific failure mode.

**5. Pre-publication threat modeling for MCP tool inputs.**
Any MCP server tool that accepts filesystem paths must be threat-modeled with the assumption that those paths may be adversarially crafted — either by direct malicious instruction or via indirect prompt injection through content the LLM has processed. The design question is not "what does a legitimate user ask this tool to do?" but "what can an adversary cause the LLM to supply as a path argument after reading a poisoned document?" Applying this threat model before publication would have surfaced both traversal vulnerabilities as high-priority concerns.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**

Commit d00c60d ("Address symlink and path prefix issues"), authored June 30, 2025, by Jenn Newton, merged July 1, 2025 by Paul Carleton. Released as v0.6.3 / 2025.7.01.

*CVE-2025-53109 (symlink traversal):*
- New `path-validation.ts` module adds `fs.realpath()` call to fully resolve all symbolic links to their true filesystem targets before any boundary comparison
- Error handling for symlink detection changed to fail-closed: detection now blocks the operation with a permission error rather than allowing execution to continue
- 992 lines added in the new module represent a complete replacement of the ad hoc validation with a security-engineered path validation framework

*CVE-2025-53110 (prefix-match bypass):*
- Boundary comparison updated from `.startsWith(allowedDir)` to a path-separator-aware comparison verifying that the requested path is an actual child of the allowed directory
- The fix ensures that sibling directories with names beginning with the allowed directory's name are correctly excluded

**What was not done:**
- No proactive security bulletin from Anthropic beyond GitHub Security Advisories
- No outreach to developers who had built derivative filesystem MCP tools from the reference implementation
- No acknowledgment in MCP documentation of the path traversal prevention requirements for derivative tool builders
- No retrospective review of other MCP reference implementations for analogous validation failures

**Recommended additional measures:**
- Publish a path validation security pattern document as a companion to MCP filesystem server development guidance — derivative tool builders should receive the correct pattern, not discover it from a CVE
- Conduct a security review of all other MCP reference implementations for path traversal and input validation failures
- Add path traversal prevention tests to the reference implementation's test suite, so future changes are validated against both the `fs.realpath()` requirement and the separator-aware boundary check
- Update MCP server development documentation to specify that tool inputs must be treated as potentially adversarially crafted (the indirect prompt injection threat model)

---

## Solutions Analysis

### 1. Symlink Resolution via fs.realpath() Before Boundary Checks

- **Type:** Input Validation / Secure Defaults
- **Plausibility:** 5/5 — This is the direct fix that was implemented. `fs.realpath()` is a standard Node.js API; the pattern requires a single additional async call in the validation function. The July 1 patch demonstrates both the technical feasibility and the correctness of the approach.
- **Practicality:** 5/5 — Backward compatible for legitimate use cases. The only behavioral change is that symbolic links pointing outside allowed directories are now correctly rejected, which is the intended security behavior. Can be applied to any derivative filesystem MCP tool with minimal effort.
- **How it applies:** Directly prevents CVE-2025-53109. The critical note for derivative implementations: `fs.realpath()` must be called on the full requested path, not just the base path. Partial canonicalization (normalizing the base but not resolving the full path's symlinks) can still be bypassed.
- **Limitations:** `fs.realpath()` is async; implementations that expect synchronous path validation may require refactoring. On filesystems with slow symlink resolution or deep symlink chains, there is a minor performance implication — typically negligible for local filesystem access.

### 2. Separator-Aware Prefix Comparison

- **Type:** Input Validation / Secure Defaults
- **Plausibility:** 5/5 — Trivial to implement correctly. Appending `path.sep` to the allowed directory before `.startsWith()` is a one-character change with no ambiguity. The fix is deterministic, has no edge cases that require special handling, and is tested by the path traversal prevention literature.
- **Practicality:** 5/5 — Zero backward-compatibility impact for legitimate use. Sibling directory access was never the intended behavior; rejecting it is purely corrective.
- **How it applies:** Directly prevents CVE-2025-53110. Implementable as a linting rule or static analysis check to ensure all path boundary comparisons in the codebase include the separator.
- **Limitations:** Addresses string-level bypass only. Does not protect against symlink-based traversal (CVE-2025-53109) — both fixes are required for complete path traversal prevention. A fix that applies only this correction without also fixing the symlink issue remains vulnerable to CVE-2025-53109.

### 3. Fail-Closed Error Handling in Security Boundary Functions

- **Type:** Defensive Programming / Secure Defaults
- **Plausibility:** 5/5 — The fail-closed principle is a foundational security engineering pattern. In path validation, detecting an anomaly (symlink, traversal attempt, unexpected path component) must result in immediate rejection, not continuation. The principle is non-controversial; implementation is straightforward.
- **Practicality:** 4/5 — Requires discipline across the codebase to verify that every error path in security boundary functions is fail-closed. Code review policy or linting can enforce this. Legacy code with fail-open error paths requires auditing — not just fixing the known cases but finding any unknown ones.
- **How it applies:** Addresses the specific failure mode in CVE-2025-53109 where symlink detection existed but the error path allowed execution to continue. The fix removes the possibility of a future "failed fix" of this type by making fail-closed behavior the enforced default.
- **Limitations:** Only effective if applied consistently. A single fail-open error path in a security boundary function can negate all other controls. Enforcement requires either automated checks or rigorous code review, not just policy documentation.

### 4. Pre-Publication Security Review Gate for Reference Implementations

- **Type:** Process / Organizational Control
- **Plausibility:** 4/5 — Establishing a mandatory security review checklist before publishing reference implementations is an organizational process change, not a technical one. It requires Anthropic to define and enforce a review gate. The difficulty is organizational, not technical: defining who owns the review, what the checklist contains, and what "published as reference" means in practice.
- **Practicality:** 4/5 — The direct cost is a security review of each reference implementation before publication — plausibly a few days of engineering time per server. The indirect benefit is that derivative ecosystem projects inherit correct patterns rather than incorrect ones. The ROI on preventing one reference implementation vulnerability that propagates to N derivative projects is high.
- **How it applies:** Would have caught both CVE-2025-53109 and CVE-2025-53110 before publication, preventing all downstream exposure. The path traversal review checklist is simple: "Does this code call fs.realpath() before boundary checks? Does this code use separator-aware prefix comparisons?" Both questions require only a code read to answer.
- **Limitations:** A checklist only catches the classes of vulnerabilities the checklist includes. New vulnerability classes not yet on the checklist will pass. The gate must be maintained and updated as new attack patterns emerge. It also requires someone to enforce the gate — a process without an owner is not a process.

### 5. Path Validation as a Shared Library Pattern for MCP Ecosystem

- **Type:** Supply Chain / Ecosystem Defense
- **Plausibility:** 3/5 — Publishing the `path-validation.ts` module from the July 1 patch as a standalone, importable security library would provide derivative tool builders with a validated, tested path validation function. This addresses the supply chain propagation risk directly: instead of developers copying an incorrect pattern, they import a correct one.
- **Practicality:** 3/5 — Requires ongoing maintenance of the library as new traversal techniques are discovered. The MCP ecosystem would need to adopt it, which requires awareness and tooling integration. Dependency on a shared library introduces its own supply chain considerations. However, it is strictly better than the current situation where derivative tools implement their own path validation from scratch, likely reproducing the same failures.
- **How it applies:** Directly addresses the reference implementation propagation risk. Derivative projects that import the shared library rather than copying validation logic receive security fixes through version updates, the same mechanism that patched the reference implementation.
- **Limitations:** Adoption is voluntary unless mandated by MCP tooling or documentation. Libraries that provide security primitives must be reviewed more carefully than application code — a vulnerability in the shared path validation library would be a supply chain attack on all adopters. The library must be maintained with the same rigor as the fix it encodes.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-025]] | Three CVEs in Anthropic's mcp-server-git reference implementation — same `modelcontextprotocol/servers` repository, same June 2025 reporting timeframe, same root cause (no pre-publication traversal defense review). The git exploit chain (AAGF-2026-025) explicitly used the filesystem server as a write primitive in its 6-step RCE sequence. Both CVE sets overlapped as unpatched for approximately one month (filesystem patched July 1; git patched December 2025), creating a window where both write surfaces were simultaneously vulnerable. Both incidents belong to the `mcp-protocol-security-crisis` pattern group. |
| [[AAGF-2026-022]] | MCP STDIO "Execute-First, Validate-Never" — same MCP protocol security crisis context; both are Anthropic MCP failures. AAGF-2026-022 is a protocol-design-level architectural flaw; AAGF-2026-027 is an implementation-level validation failure in a reference implementation. Thematically continuous: the MCP ecosystem was built for adoption speed ahead of security depth at both the protocol design layer and the reference implementation layer. |

---

## Strategic Council Review

### Challenger Findings

1. **Root cause diagnosis substitutes organizational narrative for evidence:** The 5 Whys chain culminates in "no mandatory security review gate existed before Anthropic-published code was designated as a reference implementation." This is a reasonable inference, but it is stated as established fact rather than as the most parsimonious explanation. The report has no direct evidence — an internal post-mortem, a public statement from Anthropic, a commit history showing rushed publication — that a review gate was absent rather than bypassed, or that the reviewers who did exist missed it. An equally plausible institutional root cause is that the code underwent general review but not adversarial path-traversal-specific review. The distinction matters because the recommended fix ("add a checklist") applies only to the "no gate existed" interpretation; if a gate existed and failed, a different intervention is required. The institutional root cause is the weakest link in the analysis and is stated with more confidence than the evidence supports.

2. **"Supply chain propagation" claim is asserted without quantification:** The report repeatedly foregrounds the supply chain risk — derivative tools inheriting the flawed `validatePath()` pattern — as a significant amplifier of the incident's impact. But no evidence is offered that any meaningful number of derivative tools actually copied this specific function. The MCP ecosystem was relatively young at the time of publication; `mcp-server-filesystem` may have been more widely referenced as documentation than as code copied into production. Without a count or even an order-of-magnitude estimate of derivative implementations, the supply chain amplification argument remains a hypothesis. It is stated as a distinguishing feature of severity when it may be a theoretical risk with near-zero realized exposure.

3. **damage_speed: "minutes" requires an attacker who already has filesystem write access to create symlinks:** CVE-2025-53109 (symlink traversal) requires the creation of a symlink inside the allowed directory before the traversal can occur. Symlink creation is itself a filesystem write operation. In the threat model most relevant to AI agent deployments — indirect prompt injection through content the agent reads — the agent would need to be instructed to create the symlink and then exploit it in sequence. This is a two-step operation that requires the attacker to first establish write access to a location inside the allowed directory. "Minutes" as the damage_speed presupposes that write access already exists or that the agent's allowed directories include writable paths. For read-only MCP configurations or configurations where the allowed directory is not writable by the agent's instruction path, the symlink vector may not be exploitable at all. The damage_speed classification does not acknowledge this precondition.

4. **CVE-2025-53109's "failed-fix" characterization may overstate what the pre-patch code attempted:** The report states that "code that detected a symlink but allowed execution to continue" represents a "failed partial fix" — an attempt at a security control that was incorrectly implemented. This is the most analytically distinctive claim in the report and the one most dependent on a specific reading of the pre-patch source code. The report does not cite the specific lines of pre-patch code that implement this behavior. Without examining the actual pre-patch implementation, it is possible that the symlink detection logic served a different purpose (e.g., error logging or telemetry) and was never intended as a security block. The "failed fix" interpretation creates a more damaging narrative (evidence of an attempted security control that failed) than the simpler interpretation (no security control was present). The distinction matters for the root cause analysis: "failed implementation" implies different process failures than "missing implementation."

5. **"No confirmed exploitation" caveat is appropriately hedged but the report benefits from it asymmetrically:** The report correctly notes that "no confirmed exploitation reflects absence of public incident reports, not forensic verification of non-exploitation." This is an accurate and responsible qualification. However, the report uses this caveat primarily to argue that the near-miss severity should be taken seriously — i.e., to argue for higher concern than the absence of exploitation would suggest. The same caveat also limits the ability to characterize the actual risk with confidence: without exploitation data, we cannot know whether the vulnerability was practically exploitable in common deployment configurations, whether attackers attempted and failed, or whether the population of vulnerable deployments was actually small (early MCP ecosystem, limited real-world deployment before patch). The caveat works both ways and the report does not fully apply it in the direction that would reduce the incident's apparent severity.

6. **The five-month overlap period framing is partially misleading:** The report states that CVE-2025-53109/110 overlapped with mcp-server-git CVEs for "approximately one month" (June–July 1 2025), then separately describes an August–December 2025 period as an "overlap window." The August–December window is not a window where both filesystem and git servers were simultaneously vulnerable; it is a window where the filesystem server was patched but the git server was not. The framing that the git server "could still use the filesystem server's write capability as part of its 6-step RCE chain" implies that the filesystem patch did not fully break the attack chain — but if the filesystem server's write traversal was patched, the git server's use of it as a write primitive for out-of-directory writes was also blocked. The compounding risk argument requires clarification: the five-month overlap is the git CVEs remaining unpatched, not a compounding of both CVE sets simultaneously.

### Steelman Defense

1. **The textbook nature of CVE-2025-53110 is analytically decisive for the severity argument:** CVE-2025-53110's `.startsWith()` without a path separator is not merely a known anti-pattern — it appears verbatim as the negative example in OWASP's path traversal prevention cheat sheet. Its presence in Anthropic's reference implementation is not a sophisticated or novel oversight; it is the kind of error that a 30-minute review against standard guidance would have caught. This is not a circumstance requiring organizational process speculation: the code either was or was not reviewed against OWASP CWE-22 guidance before publication, and the presence of this specific pattern is strong evidence it was not. The institutional root cause ("no path-traversal-specific review before publication") is more tightly supported for CVE-2025-53110 than the Challenger gives credit for.

2. **near-miss and High severity are well-calibrated for the actual threat surface:** The CVSS 8.4 for CVE-2025-53109 is scored by NVD — an external authoritative source — not self-assessed. The severity designation is therefore not the report's claim but a reflection of independent technical scoring. The realistic attacker path for Claude Desktop and Cursor users (indirect prompt injection via a malicious README or project file, causing the agent to read `~/.ssh/id_rsa` or `~/.env`) requires no elevated privileges, no prior filesystem access, and no user interaction beyond opening a project. This is a low-precondition attack path for a high-value target (developer SSH keys and API credentials). High severity and near-miss are appropriate for an unexecuted vulnerability with this combination of low precondition and high-value accessible data.

3. **The failed-fix pattern in CVE-2025-53109 is analytically important regardless of original intent:** Whether the pre-patch symlink detection logic was intended as a security control or served another purpose, the result is the same: code that detects a symlink-related condition and does not block execution is a fail-open security posture. The analytical takeaway — that error handling in security boundary functions must be fail-closed — is valid independent of whether the original author intended the detection as a security gate. The report's framing of this as a "failed fix" may overclaim the original intent, but the fail-closed lesson it supports is correct and generalizable. The Challenger's objection is to the narrative framing, not to the lesson or the underlying code behavior.

4. **The supply chain argument, even without quantification, correctly identifies a structural risk class:** The report cannot count derivative tools because that number is not publicly available — this is a data absence, not an analytic failure. The structural argument is sound: reference implementations have outsized adoption because developers treat them as canonical. A security flaw in a reference implementation propagates via developer behavior (copying patterns) rather than via dependency management (version pinning), which means the July 1 patch has no mechanism to reach derivative codebases. The propagation risk is real and structural even without a precise count. The absence of quantification should prompt a confidence caveat, but it does not undermine the argument's logic.

5. **The 30-day patch timeline, while faster than mcp-server-git, does not exonerate the disclosure process:** The report notes patch velocity favorably compared to the seven-month mcp-server-git timeline. But 30 days from responsible disclosure to patch, with no proactive bulletin to the developer ecosystem, and no outreach to derivative tool builders, is not a strong response to a vulnerability in the most-deployed MCP reference implementation. The absence of any developer communication beyond the GitHub Security Advisories is a documented gap in the vendor response, correctly noted in the "What was not done" section. The favorable comparison to mcp-server-git's timeline is accurate but sets a low bar.

### Synthesis

The draft is technically precise and factually grounded on the vulnerability mechanics — CVE-2025-53109 and CVE-2025-53110 are accurately characterized, the CVSS scores are drawn from authoritative sources, and the patch analysis (992-line `path-validation.ts` replacement) is correctly interpreted as evidence that the pre-patch validation was architecturally insufficient, not merely missing a single call. The near-miss and High severity designations are defensible against the Challenger's scrutiny: the NVD scoring is independent validation, and the low-precondition attack path for developer SSH keys and API credentials in standard Claude Desktop deployments supports the risk characterization. The failed-fix narrative in CVE-2025-53109 may overstate what the original code intended, but the fail-closed lesson is correct and the underlying behavior (detection without blocking) is accurately described. These are the report's strongest elements.

Two Challenger points require treatment. First, the institutional root cause ("no mandatory security review gate") is stated with more confidence than the evidence warrants for a report that lacks direct access to Anthropic's internal processes. The correct framing is "the most parsimonious explanation consistent with the evidence" rather than a stated fact. A hedging clause in the root cause section would resolve this without undermining the analysis. Second, the five-month overlap framing conflates two distinct periods — a one-month window where both CVE sets were simultaneously unpatched, and a subsequent four-month window where only the git server remained unpatched. The compounding risk claim in the August–December period requires clarification: if the filesystem patch broke the write traversal, the git server's use of it as a write primitive for out-of-directory writes was also impacted. The current framing implies ongoing compounding risk that the patch did not address, which may not be accurate.

The supply chain propagation concern and the damage_speed precondition (symlink creation requiring prior write access) are acknowledged uncertainties that the report handles with appropriate qualification in the `researcher_notes` field but could be surfaced more explicitly in the body. These do not change the incident's classification but affect confidence in the realized versus theoretical scope.

**Confidence level:** Medium-High — The technical core is solidly evidenced via CVE records, patch commit, and two independent researcher reports. The institutional/organizational claims and supply chain scope are inferred rather than documented, appropriately reducing confidence from High. The near-miss classification and severity ratings are well-supported.

**Unresolved uncertainties:**
- **Derivative tool exposure count** — How many production MCP filesystem implementations copied `validatePath()` logic from the reference before the patch, and have any been updated independently? This matters for realized versus theoretical supply chain scope. Would be resolved by a GitHub code search for `validatePath` patterns across MCP-adjacent repositories, or a public statement from Anthropic on ecosystem outreach.
- **Pre-patch symlink detection intent** — Was the symlink-detection error-handling code in the original `validatePath()` intended as a security control (failed fix) or as a non-security logging/diagnostic path (missing fix)? This matters for the institutional root cause narrative. Would be resolved by examining pre-patch source code or a statement from the original authors.
- **Actual exploitation during the vulnerability window** — "No confirmed exploitation" is not "no exploitation." The vulnerability existed in a widely-deployed developer tool for months with no forensic audit performed. Whether any developer machine's SSH keys or `.env` files were exfiltrated during this period cannot be determined from public information.
- **Scope of the August–December compounding window** — Whether the git server's 6-step RCE chain remained fully functional after the July 1 filesystem patch depends on whether the chain's write-primitive step required the filesystem server's traversal capability specifically, or could operate through other write paths. This would be resolved by reading the mcp-server-git CVE technical details in AAGF-2026-025 against the patched filesystem server behavior.

---

## Key Takeaways

**1. Path string matching is not a security boundary.**
`path.normalize()` resolves syntactic path components but does not resolve symbolic links. A security boundary enforced by comparing path strings — rather than resolved filesystem targets — is not a security boundary; it is an illusion that attackers can step around with a `ln -s` command. Any filesystem access control must call `fs.realpath()` (or platform equivalent) before comparing against boundaries. This applies to every MCP filesystem tool, every custom file-handling service, and every derivative implementation built from this reference.

**2. `.startsWith()` without a path separator is a documented, well-known anti-pattern.**
CVE-2025-53110 represents one of the most basic forms of path traversal: prefix-match bypass via sibling directory. It appears in OWASP documentation as an explicit anti-pattern. Its presence in a publicly released Anthropic reference implementation indicates the codebase received no review against documented path traversal prevention patterns before publication. The textbook nature of this flaw is more analytically significant than its CVSS score.

**3. A failed partial fix is more dangerous than no fix.**
CVE-2025-53109's error handling detected a symlink but allowed execution to continue. Code that detects a security violation and proceeds anyway is worse than code that never checks: it creates false confidence in the control while leaving the vulnerability open. Security boundary error handling must be fail-closed — detection without blocking is not detection in any security-meaningful sense.

**4. Reference implementations create security debt at ecosystem scale.**
The July 1 patch fixed the reference implementation. It did not fix any derivative filesystem MCP tool built from the reference before that date. The propagation of an incorrect path validation pattern to downstream implementers is a supply chain effect in slow motion: it does not require a sophisticated attack, only that developers follow the natural behavior of copying from examples. Anthropic's responsibility does not end at patching the reference — it extends to reaching the developers who inherited the pattern.

**5. The five-month overlap with mcp-server-git CVEs created compounding risk.**
From the filesystem patch date (July 1, 2025) through the git server patch date (December 2025), deployments using both servers were in an asymmetric state: the filesystem server was patched, but the git server could still use the filesystem server's write capability as part of its 6-step RCE chain. An operator who updated the filesystem server but not the git server achieved partial security improvement while remaining vulnerable to the full chain. Compound vulnerability windows require compound communication — patching one server is not sufficient if the combined attack chain includes another.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| GitHub Advisory GHSA-q66q-fx2p-7w4m | https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-q66q-fx2p-7w4m | 2025-07-01 | Authoritative — CVE-2025-53109; CVSS 4.0: 8.4; credits Elad Beber (Cymulate) |
| GitHub Advisory GHSA-hc55-p739-j48w | https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-hc55-p739-j48w | 2025-07-01 | Authoritative — CVE-2025-53110; CVSS 4.0: 7.3; credits Elad Beber (Cymulate) |
| NVD — CVE-2025-53109 | https://nvd.nist.gov/vuln/detail/CVE-2025-53109 | 2025-07-02 | Authoritative — government CVE record; CWE-59 |
| NVD — CVE-2025-53110 | https://nvd.nist.gov/vuln/detail/CVE-2025-53110 | 2025-07-02 | Authoritative — government CVE record; CWE-22 |
| Cymulate — EscapeRoute blog (Elad Beber) | https://cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/ | 2025-07-02 | High — disclosing researcher's analysis; source bias flag: RCE scenario requires elevated OS privileges; JS-rendered page |
| Embrace The Red — wunderwuzzi | https://embracethered.com/blog/posts/2025/anthropic-filesystem-mcp-server-bypass/ | 2025-08-03 | High — independent co-discoverer; confirmed June 1 2025 report date; corroborates all core technical claims |
| Hackaday — This Week In Security | https://hackaday.com/2025/07/07/this-week-in-security-anthropic-coinbase-and-oops-hunting/ | 2025-07-07 | High — independent third-party confirmation; prefix-match bypass explained clearly |
| CybersecurityNews.com | https://cybersecuritynews.com/anthropics-mcp-server-vulnerability/ | 2025-07 | Medium — confirms affected platforms (Claude Desktop, Cursor); secondary source |
| PipeLab — State of MCP Security 2026 | https://pipelab.org/blog/state-of-mcp-security-2026/ | 2026 | High — aggregated MCP security research; "widely cited reference-impl failure" characterization |
| Authzed — Timeline of MCP Breaches | https://authzed.com/blog/timeline-mcp-breaches | 2025-08+ | High — places incident in broader MCP breach timeline |
| GitHub Commit d00c60d | https://github.com/modelcontextprotocol/servers/commit/d00c60df9d74dba8a3bb13113f8904407cda594f | 2025-06-30 | Authoritative — patch commit; "Address symlink and path prefix issues"; 992 lines in new path-validation.ts |
