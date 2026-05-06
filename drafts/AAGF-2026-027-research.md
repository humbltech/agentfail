# AAGF-2026-027 Research: Anthropic Filesystem MCP Path Traversal (CVE-2025-53109/53110)

**Subject:** Two path traversal vulnerabilities in Anthropic's mcp-server-filesystem reference implementation allow agents to break out of configured allowed-directory scope
**CVEs:** CVE-2025-53109, CVE-2025-53110
**Disclosing researchers:** Elad Beber (Cymulate); wunderwuzzi/@wunderwuzzi23 (Embrace The Red, independent)
**Suggested ID:** AAGF-2026-027
**Date researched:** 2026-05-05
**Researcher:** Claude (automated Stage 1)

> **NOTE:** The file at this path previously contained a different incident (AI Procurement Agent/$5M fraud — illustrative scenario). That content has been replaced. If that prior incident needs a home, it should be assigned a new ID.

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| PipeLab — State of MCP Security 2026 | https://pipelab.org/blog/state-of-mcp-security-2026/ | MCP security research aggregator | High | Names both CVEs; "widely cited reference-impl failure"; no CVSS scores listed |
| NVD CVE-2025-53109 | https://nvd.nist.gov/vuln/detail/CVE-2025-53109 | Government CVE record | Authoritative | Published 2025-07-02; CWE-59; CVSS 4.0: 7.3 (GitHub CNA); NVD not yet enriched |
| NVD CVE-2025-53110 | https://nvd.nist.gov/vuln/detail/CVE-2025-53110 | Government CVE record | Authoritative | Published 2025-07-02; CWE-22; CVSS 4.0: 7.3 (GitHub CNA); NVD not yet enriched |
| GitHub Advisory GHSA-q66q-fx2p-7w4m (CVE-2025-53109) | https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-q66q-fx2p-7w4m | Official security advisory | Authoritative | Published 2025-07-01; CVSS 4.0: 8.4; credits Elad Beber (Cymulate) |
| GitHub Advisory GHSA-hc55-p739-j48w (CVE-2025-53110) | https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-hc55-p739-j48w | Official security advisory | Authoritative | Published 2025-07-01; CVSS 4.0: 7.3; credits Elad Beber (Cymulate) |
| Cymulate blog — "EscapeRoute" | https://cymulate.com/blog/cve-2025-53109-53110-escaperoute-anthropic/ | Disclosing researcher's blog | High (primary source bias) | Primary technical writeup; published 2025-07-02; author: Elad Beber; page body partially JS-rendered |
| Embrace The Red — wunderwuzzi | https://embracethered.com/blog/posts/2025/anthropic-filesystem-mcp-server-bypass/ | Independent security researcher | High | Published 2025-08-03; independent rediscovery; part of "Month of AI Bugs 2025"; reported to Anthropic June 1, 2025 |
| Hackaday — This Week In Security 2025-07-07 | https://hackaday.com/2025/07/07/this-week-in-security-anthropic-coinbase-and-oops-hunting/ | Independent tech journalism | High | Third-party confirmation; good plain-language technical summary of both flaws |
| CybersecurityNews.com | https://cybersecuritynews.com/anthropics-mcp-server-vulnerability/ | Security journalism | Medium | Confirms affected platforms include Claude Desktop and Cursor |
| GBHackers | https://gbhackers.com/anthropic-mcp-server-flaw/ | Security journalism | Medium | Confirms CVSS 8.4 for CVE-2025-53109 |
| Authzed — Timeline of MCP Breaches | https://authzed.com/blog/timeline-mcp-breaches | Security analysis blog | High | Places incident in August 2025 timeline; credits Cymulate; root cause framing |
| Endor Labs — Classic Vulns in AI Infra | https://www.endorlabs.com/learn/classic-vulnerabilities-meet-ai-infrastructure-why-mcp-needs-appsec | Security research | High | CWE framing; ecosystem context |
| GitHub Commit d00c60d (symlink fix) | https://github.com/modelcontextprotocol/servers/commit/d00c60df9d74dba8a3bb13113f8904407cda594f | Source code | Authoritative | Authored by Jenn Newton; committed 2025-06-30 20:04 UTC; "Address symlink and path prefix issues" |
| GitHub Commit cc99bda (merge) | https://github.com/modelcontextprotocol/servers/commit/cc99bdabdcad93a58877c5f3ab20e21d4394423d | Source code | Authoritative | Merged by Paul Carleton (@pcarleton); 2025-07-01; branch: security/fix-path-prefix-and-symlink |

**Source quality summary:** Strong. Two authoritative GitHub Security Advisories from the affected repository, confirmed NVD entries, named patch commits with authorship, the disclosing researcher's blog post, and multiple independent journalism sources. Technical claims are consistent across all sources. Core gaps: Cymulate blog body was partially JS-rendered and could not be fully fetched; full PoC steps reconstructed from secondary sources.

---

## Source Bias Flag

**Primary source bias:** The Cymulate blog ("EscapeRoute") is authored by the disclosing researcher (Elad Beber) and published by his employer. This is the richest named technical source but serves Cymulate's marketing interests. All technical claims from it are corroborated by independent sources (Hackaday, wunderwuzzi).

**Quantitative claims to flag:**
- No source provides independently corroborated deployment counts or affected-user counts for the filesystem MCP server. npm download figures were not retrieved.
- "RCE" headlines used by SecurityOnline.info and CybersecurityNews.com are technically achievable (per Cymulate PoC) but require the server to run with elevated OS-level privileges. This is realistic in some enterprise deployments but not universal. The RCE framing overstates the base-case risk for standard user-privilege deployments.
- CVSS score discrepancy: The GitHub advisory for CVE-2025-53109 lists 8.4 HIGH; the NVD record lists 7.3 HIGH. Both are from GitHub, Inc. as CNA, using different CVSS 4.0 vector calculations. The advisory score (8.4, AV:L/AC:L/AT:N vector) should be treated as more authoritative than the NVD-mirrored score (7.3, AV:N/AC:L/AT:P vector). Both exceed the "High" threshold.

---

## Key Facts

| Field | Value |
|-------|-------|
| CVE-2025-53109 | Symlink path traversal — CWE-59 (Improper Link Resolution Before File Access) |
| CVE-2025-53110 | Prefix-match path traversal — CWE-22 (Improper Limitation of Pathname to Restricted Directory) |
| CVSS 4.0 (CVE-2025-53109) | 8.4 HIGH (GitHub advisory vector); 7.3 HIGH (NVD record) |
| CVSS 4.0 (CVE-2025-53110) | 7.3 HIGH |
| Affected package | `@modelcontextprotocol/server-filesystem` (npm) |
| Affected versions | < 0.6.3 (semver) or < 2025.3.28 (date-versioned) |
| Patched versions | 0.6.3 and 2025.7.01 |
| date_occurred | Before 2025-03-28 (earliest affected version per advisory); vulnerability class existed in initial implementation — exact introduction commit not identified |
| date_discovered | June 1, 2025 (wunderwuzzi's confirmed report date to Anthropic; Elad Beber reported independently around the same time — exact Beber date not confirmed) |
| date_reported (first public disclosure) | July 1, 2025 (GitHub Security Advisories GHSA-q66q-fx2p-7w4m and GHSA-hc55-p739-j48w published) |
| CVE publication date | July 2, 2025 (NVD) |
| Cymulate blog published | July 2, 2025 |
| Patch commit date | June 30–July 1, 2025 |
| Primary discoverer (per advisory credit) | Elad Beber (Cymulate) |
| Independent co-discoverer | wunderwuzzi/@wunderwuzzi23 (Embrace The Red) — reported June 1, 2025; published August 3, 2025 |
| Confirmed exploitation in the wild | No evidence found |

---

## Vulnerability Mechanism

### CVE-2025-53109 — Symlink Path Traversal (CWE-59)

**What the server does:** The filesystem MCP server accepts a list of `allowedDirectories` at startup. Every tool call (read_file, write_file, list_directory, etc.) passes through a `validatePath()` function in `src/filesystem/index.ts` that checks whether the requested path falls within those allowed directories.

**The flaw:** The original `validatePath()` used Node.js's `path.normalize()` to canonicalize path strings, which correctly defeats classic `../` traversal sequences. However, it did not call `fs.realpath()` to resolve symbolic links before performing the directory-boundary check. The flow was:

1. Check whether the path string (after normalize) starts with an allowed directory string — PASS
2. Hand the path to the OS for actual file I/O — OS follows symlink to its target

If a symlink exists inside an allowed directory and points outside the allowed directories, the check passes because the symlink's own path is inside scope, but the I/O lands on the target, which is out of scope.

Additionally, the original code contained error handling that allowed execution to continue after detecting a symlink — meaning the server would throw an error on detection but then proceed anyway. This made the protection non-functional even when triggered.

**Exploitation:** An attacker or malicious prompt instructs the agent to create a symlink inside the allowed directory pointing to a sensitive path (e.g., `/etc/sudoers`, `~/.ssh/id_rsa`, `/etc/passwd`). Subsequent read/write calls through that symlink bypass all access controls. Cymulate demonstrated: if the server runs with elevated OS privileges, the attacker can write to `/etc/sudoers` or OS launch agent directories, achieving privilege escalation to RCE.

### CVE-2025-53110 — Prefix-Match Path Traversal (CWE-22)

**What the server does:** Same `validatePath()` function; tests whether a requested path is within an allowed directory.

**The flaw:** The validation used JavaScript's `.startsWith()` string method against the allowed directory path string — without appending a path separator to the allowed directory before comparison. This means:

- Allowed directory: `/private/tmp/allowed_dir`
- Allowed check: `requestedPath.startsWith('/private/tmp/allowed_dir')`
- Bypassed by: `/private/tmp/allowed_dir-other`, `/private/tmp/allowed_dirsibling`, `/private/tmp/allowed_dir/../secret`

Any path whose string representation begins with the allowed directory prefix passes the check, regardless of whether the path is actually inside that directory.

**From wunderwuzzi's analysis (Embrace The Red, 2025-08-03):** "The `validatePath` function in the filesystem MCP server's `index.ts` uses a `.startsWith()` comparison without verifying the path represents an actual directory boundary." A correct implementation requires `requestedPath.startsWith(allowedDir + path.sep)`.

**Exploitation:** An agent or attacker constructs a path to a sibling directory whose name begins with the same string as an allowed directory. The path passes the prefix check and the server reads, writes, or lists files in the unintended sibling location. From Hackaday: "If the allowed path is `/home/user/Public` and there's a second folder, `/home/user/PublicNotAllowed`, the AI has access to both."

**Fix applied:** Patch commit `d00c60d` (authored by Jenn Newton, committed 2025-06-30, merged by Paul Carleton 2025-07-01) introduced a new dedicated module `src/filesystem/path-validation.ts` (992 lines added, 20 removed). The fix adds proper symlink resolution via `fs.realpath()` before boundary checks, and corrects the prefix comparison to use path-separator-aware logic. A comprehensive test suite was added at `src/filesystem/__tests__/path-validation.test.ts`.

---

## Vendor Response

| Date | Event |
|------|-------|
| ~Early June 2025 | Elad Beber (Cymulate) reports both vulnerabilities to Anthropic |
| June 1, 2025 | wunderwuzzi reports the prefix-match flaw (CVE-2025-53110) to Anthropic; Anthropic acknowledges they were already tracking the issue |
| June 30, 2025 | Patch authored by Jenn Newton (Anthropic), committed to `modelcontextprotocol/servers` repo (commit d00c60d) |
| July 1, 2025 | Fix merged by Paul Carleton (@pcarleton); GitHub Security Advisories GHSA-q66q-fx2p-7w4m and GHSA-hc55-p739-j48w published; version 2025.7.01 / 0.6.3 released to npm |
| July 2, 2025 | CVE-2025-53109 and CVE-2025-53110 published on NVD; Cymulate "EscapeRoute" blog post published by Elad Beber |
| August 3, 2025 | wunderwuzzi publishes independent writeup on Embrace The Red ("Month of AI Bugs 2025") |

**Vendor communication:** Anthropic's acknowledgement to wunderwuzzi on June 1 confirmed they were already aware of the issue before external disclosure — suggesting internal tracking predated both external reports. The fix was shipped within approximately 30 days of the first external report. Both advisories credit Elad Beber as the primary discoverer (Cymulate's disclosure appears to have been treated as the primary report). No public statement or blog post from Anthropic was found beyond the GitHub advisories themselves.

---

## Impact Assessment

**Affected platforms:**
- Claude Desktop (official Anthropic desktop app; filesystem MCP server is the primary bundled/recommended tool)
- Cursor (popular AI-assisted IDE; users commonly configure the filesystem server)
- Any MCP-compatible AI agent host that deploys `@modelcontextprotocol/server-filesystem` from npm
- The package is a first-party reference implementation — downstream adopters who copied its code into derivative implementations are also vulnerable

**What an attacker could access with a successful exploit:**
- Any file readable by the OS process running the MCP server (bounded by OS-level process privileges)
- SSH private keys (`~/.ssh/id_*`)
- Environment files containing API keys and credentials (`.env`, shell rc files)
- Application secrets and config files
- Database files accessible to the process user
- System configuration files (`/etc/hosts`, `/etc/passwd`)
- With elevated process privileges: `/etc/sudoers`, OS launch agent directories

**RCE condition:** Cymulate demonstrated RCE when the server runs with elevated OS privileges — achievable by writing to macOS Launch Agent paths or modifying `/etc/sudoers`. This is a real but conditional attack path. Standard user-privilege deployments face data exfiltration rather than direct code execution. The "RCE" headline used by some outlets overstates the baseline risk.

**Attacker model in practice:** In agentic deployments, the most plausible attack path is indirect prompt injection: a malicious document, email, webpage, or data source that the AI agent reads triggers the exploitation sequence autonomously. The attacker does not need direct access to the agent host — they need only influence the content the agent reads.

**Confirmed exploitation in the wild:** No evidence found across any source. The vulnerability was patched within approximately 30 days of the first external report, limiting the exposure window. Given the MCP ecosystem was early-stage in mid-2025, sophisticated attackers targeting this vector at scale is plausible but not documented.

---

## Relationship to AAGF-2026-025 (mcp-server-git, CVE-2025-68143/68144/68145)

| Dimension | AAGF-2026-025 (git server) | AAGF-2026-027 (filesystem server) |
|-----------|---------------------------|----------------------------------|
| Affected server | `mcp-server-git` (Python, PyPI) | `@modelcontextprotocol/server-filesystem` (TypeScript, npm) |
| CVEs | CVE-2025-68143, CVE-2025-68144, CVE-2025-68145 | CVE-2025-53109, CVE-2025-53110 |
| Disclosing researcher | Yarden Porat (Cyata Security) | Elad Beber (Cymulate) |
| Same researcher? | No — different firms (Cyata vs. Cymulate) |
| Reporting timeframe overlap | Both reported to Anthropic June 2025 | Both reported to Anthropic June 2025 |
| Patch/disclosure timeline | Patched December 2025, disclosed January 2026 | Patched July 2025, disclosed July 2025 |
| Vendor | Both Anthropic first-party reference implementations in `modelcontextprotocol/servers` repo | Same |
| Exploit chain interaction | The Cyata exploit chain for AAGF-2026-025 explicitly used the filesystem MCP server as a component — it writes a malicious `.git/config` via filesystem write tools. The filesystem CVEs would amplify that attack if the allowed-directory scope was a constraint on the write target. | Complementary attack surface |

**Common thread:** Both incidents demonstrate that Anthropic's own first-party reference implementations shipped without adequate security review against classic vulnerability classes — path traversal and argument injection. Both were widely cited (including by PipeLab's 2026 MCP security report) as evidence that MCP reference code cannot be treated as secure by default. The co-occurrence of both reports in June 2025 from different researchers suggests MCP security received coordinated or parallel scrutiny at that time.

**Brief overlap window:** The filesystem CVEs were reported June 2025 and patched July 1, 2025. The git CVEs were reported June 2025 and patched December 2025. There was a 5-month window (July–December 2025) during which the git vulnerabilities remained unpatched while the filesystem vulnerabilities were fixed. During this window, attackers who discovered the git flaws could no longer leverage the unpatched filesystem CVEs — but could still use the filesystem server as a write primitive in the git RCE chain under normal allowed-directory configurations.

---

## Classification Notes

**Severity estimate:** High. CVSS 4.0: 8.4 (CVE-2025-53109) / 7.3 (CVE-2025-53110). RCE is conditional on elevated process privileges; data exfiltration is straightforward at standard privilege levels.

**Triage criteria check:**
- Real-world deployment: Yes — official Anthropic reference implementation, deployed by Claude Desktop and Cursor users
- Autonomous agent involved: Yes — MCP server is designed for autonomous AI agent use; exploitation via indirect prompt injection requires no human interaction post-injection
- Verifiable: Yes — two GitHub Security Advisories, NVD records, patch commits with named authors, multiple independent journalism sources
- Meaningful impact: Yes — path traversal to full filesystem read/write; conditional RCE

**Recommended categories:**
- Tool/Plugin Vulnerability
- Privilege Escalation / Sandbox Escape
- Path Traversal
- Reference Implementation Failure

**MITRE ATLAS techniques:**
- AML.T0010: ML Supply Chain Compromise (reference implementation as infection vector for derivative adopters)
- AML.T0054: LLM Prompt Injection (attack delivery via indirect injection into agent-read content)

**CWE classifications (confirmed from NVD/GitHub advisories):**
- CVE-2025-53109: CWE-59 — Improper Link Resolution Before File Access (Link Following)
- CVE-2025-53110: CWE-22 — Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')

---

## Raw Notes / Quotes

**From Hackaday — This Week In Security (2025-07-07):**
> "If the allowed path is `/home/user/Public` and there's a second folder, `/home/user/PublicNotAllowed`, the AI has access to both."

> "As long as the symlink itself resides in an allowed directory, 'the AI can use it.'"

> "The server checks for symlinks and throws errors when they attempt to access restricted paths. However, error handling allows execution to continue."

**From Embrace The Red — wunderwuzzi (2025-08-03):**
> "The `validatePath` function in the filesystem MCP server's `index.ts` uses a `.startsWith()` comparison without verifying the path represents an actual directory boundary."

> "Reported: June 1, 2025. Status: Anthropic acknowledged pre-existing awareness of the issue."

> "Resolution: Fixed in subsequent rewrite supporting MCP's `roots` feature."

> Part of the "Month of AI Bugs 2025" security research initiative.

**From PipeLab — State of MCP Security 2026:**
> "Two CVEs were assigned for path traversal vulnerabilities that allowed agents to break out of the configured allowed-directory scope."

> "Widely cited as evidence that even reference implementations had not been reviewed against basic traversal defenses."

> Classifies both under MCP02 (Privilege Escalation via Scope Creep).

> Recommended mitigations: reject escaping symlinks during path operations; canonicalize paths before authorization checks; run MCP servers in a chroot or container filesystem.

**From web search synthesis (Cymulate blog, partial content via search results):**
> CVE-2025-53109: "By combining a symlink attack with the flawed directory check, an attacker can gain full read/write access to arbitrary files — including sensitive system files like /etc/sudoers."

> CVE-2025-53110: "A naive prefix-matching check lets any path that simply begins with the approved directory bypass the filter, allowing unrestricted listing, reading and writing outside the intended sandbox."

**GitHub commit message (d00c60d, Jenn Newton, 2025-06-30):**
> "Address symlink and path prefix issues with allowed directories"
> New file: `src/filesystem/path-validation.ts` — 992 lines added, 20 removed.

**From Authzed — Timeline of MCP Breaches:**
> Root cause: "poor sandbox implementation and insufficient directory-containment enforcement in the MCP server's file-tool interface."

---

## Completeness Assessment

**Substance level:** Well above 300 words. All required fields populated.

**Remaining gaps:**
1. Full Cymulate "EscapeRoute" blog post body not retrieved (JS-rendered page; content reconstructed from secondary sources with high confidence).
2. Exact private disclosure date for Cymulate/Beber to Anthropic not confirmed — only wunderwuzzi's June 1 date is explicit. Beber's date is "around the same time" based on advisory credit ordering.
3. npm download counts for `@modelcontextprotocol/server-filesystem` not retrieved — no scale estimate possible.
4. Whether Anthropic's official MCP documentation explicitly recommended the vulnerable server configuration (and thus propagated the vulnerability to documentation followers) was not confirmed.
5. Whether the vulnerability existed in Anthropic-maintained documentation examples or starter templates was not confirmed.

**Recommendation:** Proceed to draft. Sufficient and well-sourced material for a complete incident entry. Flag the RCE claim as conditional (elevated-privilege deployments only) in the final write-up. Consider coordinating publication note with AAGF-2026-025 to surface the "Anthropic reference implementation" pattern.
