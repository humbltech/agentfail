# AAGF-2026-034 Research: MCPJam Inspector Remote Code Execution (CVE-2026-23744)

## Source Inventory

| # | Source | URL | Date Accessed |
|---|--------|-----|---------------|
| S1 | PipeLab — The State of MCP Security 2026 | https://pipelab.org/blog/state-of-mcp-security-2026/ | 2026-05-06 |
| S2 | NVD CVE Detail — CVE-2026-23744 | https://nvd.nist.gov/vuln/detail/CVE-2026-23744 | 2026-05-06 |
| S3 | GitHub Advisory Database — GHSA-232v-j27c-5pp6 | https://github.com/advisories/GHSA-232v-j27c-5pp6 | 2026-05-06 |
| S4 | The Vulnerable MCP Project — CVE-2026-23744 | https://vulnerablemcp.info/vuln/cve-2026-23744-mcpjam-inspector-rce.html | 2026-05-06 |
| S5 | CVE News — CVE-2026-23744 | https://www.cve.news/cve-2026-23744/ | 2026-05-06 |
| S6 | CrowdSec / LinkedIn article (author: CrowdSec) | https://www.linkedin.com/pulse/cve-2026-23744-critical-rce-mcpjam-inspector-targeting-developers-nvj9f | 2026-05-06 |
| S7 | PoC Repository — boroeurnprach/CVE-2026-23744-PoC | https://github.com/boroeurnprach/CVE-2026-23744-PoC | 2026-05-06 |
| S8 | PoC Repository — suljov/CVE-2026-23744-Remote-Code-Execution-POC | https://github.com/suljov/CVE-2026-23744-Remote-Code-Execution-POC | 2026-05-06 |
| S9 | GitLab Advisories — @mcpjam/inspector CVE-2026-23744 | https://advisories.gitlab.com/pkg/npm/@mcpjam/inspector/CVE-2026-23744/ | 2026-05-06 |
| S10 | SentinelOne Vulnerability DB | https://www.sentinelone.com/vulnerability-database/cve-2026-23744/ | 2026-05-06 |
| S11 | Pentest-Tools Exploit DB | https://pentest-tools.com/vulnerabilities-exploits/mcpjam-inspector-remote-code-execution_28808 | 2026-05-06 |
| S12 | OSV — Open Source Vulnerabilities | https://osv.dev/vulnerability/CVE-2026-23744 | 2026-05-06 |
| S13 | MCPJam/inspector GitHub repo | https://github.com/MCPJam/inspector | 2026-05-06 |
| S14 | modelcontextprotocol/inspector security advisories | https://github.com/modelcontextprotocol/inspector/security/advisories | 2026-05-06 |
| S15 | dbugs.ptsecurity.com (Positive Technologies) | https://dbugs.ptsecurity.com/vulnerability/PT-2026-3321 | 2026-05-06 (not fetched directly) |

## Source Bias Assessment

**Primary characterization source (S1, PipeLab):** PipeLab is a security vendor/research organization in the MCP ecosystem space. Their "State of MCP Security 2026" report serves as a marketing and thought leadership asset. They have an interest in demonstrating the breadth of MCP security issues. The CVE-2026-23744 mention is brief (one sentence + framing), not the original disclosure. Bias: **moderate vendor bias toward amplifying MCP risk**; factual accuracy on this CVE appears confirmed by independent sources.

**Original advisory (S3, GHSA-232v-j27c-5pp6):** Published via GitHub's advisory database by "matteo8p" (likely the MCPJam maintainer or a contributor), with reporter credited as "c2an1." This is the canonical disclosure source. The advisory was submitted by the affected vendor's ecosystem, which typically indicates responsible disclosure. Bias: **publisher is close to the affected project** — though the CVE assignment and NVD record (S2) independently confirm the facts.

**NVD (S2):** Government database, objective. Source is "GitHub, Inc." — the advisory flowed through GitHub's CVE Numbering Authority (CNA). This is reliable.

**PoC repositories (S7, S8):** Independent researchers published working exploits after disclosure. These confirm exploitability but add no new factual dates or discovery details.

**CrowdSec article (S6):** Security vendor publishing detection rules. Published March 16, 2026 — approximately 2 months after CVE publication. Confirms timeline and technical details; bias toward promoting their WAF detection capability.

**Important distinction:** CVE-2026-23744 affects **MCPJam Inspector** (`@mcpjam/inspector`), a third-party fork/enhancement of the official Anthropic `@modelcontextprotocol/inspector`. These are **two different tools** by two different organizations. The incident title in the research brief ("MCP Inspector") and the primary source framing may create confusion. The vulnerability is NOT in Anthropic's official MCP Inspector (which has its own separate CVEs: GHSA-g9hg-qhmf-q45m and GHSA-7f8r-222p-6f5g). This distinction is critical for accurate incident classification.

---

## Key Facts (with source attribution)

### Dates

- **date_occurred:** Unknown — the vulnerability existed in all versions ≤1.4.2. Earliest affected release date not confirmed in sources. The tool had ~1.9k GitHub stars and 226 forks suggesting active use for several months prior.
- **date_discovered:** Unknown precisely — reporter "c2an1" discovery date not publicly stated. CVE published 2026-01-16 (S2, S3). PoC repo created 2026-01-20 (S7), implying disclosure came just before.
- **date_reported (first public disclosure):** **2026-01-16** — NVD publication date (S2). GitHub Advisory GHSA-232v-j27c-5pp6 also published 2026-01-16 (S3). This is the first public record. CrowdSec published detection rules on 2026-02-18 (S6) and some sources say "disclosed February 2026" but the NVD record is authoritative at January 16.
- **NVD last modified:** 2026-03-13 (S2)

### Technical Details

**Vulnerability class:** CWE-306 — Missing Authentication for Critical Function (S2, S3)

**Root cause:** MCPJam Inspector's built-in HTTP server binds to `0.0.0.0` (all network interfaces) by default instead of `127.0.0.1` (localhost only). This is a developer tool that intentionally exposes an HTTP API for managing and connecting to MCP servers — but that API was designed assuming local-only access. The misconfiguration makes the tool network-accessible by default (S4, S6, S2).

**Vulnerable endpoint:** `/api/mcp/connect` — the endpoint for connecting to and installing MCP servers. Also referenced in one source as an `/install` endpoint with `additional_args` parameter injection (S5 — slight discrepancy in endpoint name; GHSA advisory names `/api/mcp/connect` as canonical).

**Attack mechanism:**
1. Attacker identifies a host running MCPJam Inspector on port 6274 (default) that is network-accessible due to `0.0.0.0` binding
2. Attacker sends a crafted HTTP POST request to `/api/mcp/connect` with a JSON body specifying a `serverConfig` containing `command` and `args` fields
3. MCPJam Inspector processes this request without any authentication check and without validating the source
4. The `command` and `args` values are passed directly to the OS for execution
5. Arbitrary code runs with the privileges of the MCPJam Inspector process (i.e., the developer's user account)

**Proof of concept** (from S3/S4, confirmed by multiple PoC repos):
```
curl http://<target>:6274/api/mcp/connect \
  -H "Content-Type: application/json" \
  -d '{"serverConfig":{"command":"cmd.exe","args":["/c","calc"],"env":{}},"serverId":"test"}'
```

**Why this is worse than CVE-2025-49596** (the earlier official MCP Inspector CVE): CVE-2025-49596 required social engineering / user interaction (tricking a user to click a malicious link for DNS rebinding). CVE-2026-23744 requires **zero user interaction** — if the port is reachable, the attacker can fire a single HTTP request (S4).

**Attack prerequisites:**
- Network access to the victim's machine on port 6274 (or whatever port Inspector is bound to)
- MCPJam Inspector version ≤1.4.2 must be running
- No credentials, no social engineering required
- Attacker could be on same LAN, connected via VPN, or (if developer exposes port via ngrok/cloud dev environment) over the internet

**CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` (S2)
- Attack Vector: Network
- Attack Complexity: Low
- Privileges Required: None
- User Interaction: None
- Scope: Unchanged
- Confidentiality: High | Integrity: High | Availability: High

**Base Score: 9.8 CRITICAL** (S2, S3)

**EPSS Score:** 32.235% — 97th percentile (S3) — extremely high likelihood of exploitation in the wild relative to all CVEs.

### Affected System

**Package:** `@mcpjam/inspector` (npm) — NOT to be confused with `@modelcontextprotocol/inspector` (Anthropic's official tool)

**Affected versions:** 1.4.2 and all prior versions

**Fixed version:** 1.4.3 (S2, S3, S7)

**What it is:** MCPJam Inspector is a developer debugging/testing platform for MCP servers, built as a fork/enhancement of Anthropic's official MCP Inspector. It adds LLM playground testing, multi-server chat, OAuth conformance testing, CI/CD integration, and team workspaces on top of the base inspector capabilities. It is more feature-rich than the official inspector and was created because "the original inspector repository moved too slowly" (S13 search result).

**Deployment context:** Runs locally on developer machines during MCP server development and testing. Typically invoked via `npx @mcpjam/inspector@latest`. Used as a development tool, not a production service — but developers often run it while working on projects without considering its network exposure.

**Usage scale:**
- 1,900 GitHub stars, 226 forks (S13) — meaningfully adopted in the MCP developer community
- npm weekly downloads for `@mcpjam/inspector-v1`: ~8/week (low, but this may be the legacy package; the primary package `@mcpjam/inspector` was not confirmed with a download count from npm directly)
- MCP ecosystem is growing rapidly; the inspector is commonly recommended in MCP development tutorials

**Typical deployment risk environments:**
- Developer laptops on office/shared WiFi networks
- Cloud development environments (GitHub Codespaces, VS Code Dev Containers) — these often have network exposure
- CI/CD systems that run Inspector for automated MCP testing
- Developers using ngrok or similar tunneling to share their local environment

### Impact & Damage

**What the attacker gains:** Full code execution on the developer's machine with the permissions of the running user. This means:
- Access to all files the developer can read (source code, credentials, SSH keys, `.env` files, API tokens, AWS credentials)
- Ability to install persistence mechanisms
- Access to any locally-running services (databases, other dev servers)
- Pivoting to corporate network if developer is on VPN

**Documented damage:** No confirmed real-world exploitation reported in sources. EPSS at 97th percentile suggests exploitation is highly plausible.

**Why developer tooling is high-value target:** Developers typically have access to source code repositories, CI/CD secrets, cloud provider credentials, and production infrastructure. Compromising a developer machine can be more valuable than compromising a production service directly (supply chain attack vector).

**Scale of theoretical exposure:** The MCP development community is large and growing. No precise figure for active MCPJam Inspector users found, but the 1.9k GitHub stars and active npm publishing suggest thousands of developers have used or evaluated it.

### Vendor Response

**Reporter:** c2an1 (GitHub handle) — credited in GHSA-232v-j27c-5pp6 (S3)
**Publisher of advisory:** matteo8p (likely MCPJam team member) (S3)

**Fix:** Version 1.4.3 released, patching the default binding address (restrict to 127.0.0.1) and adding authentication/validation to the server management endpoints (S2, S3, S6)

**Fix commit:** e6b9cf9 (referenced in GHSA advisory) (S3)

**CVE assignment:** Via GitHub's CNA process (source: "GitHub, Inc." on NVD record) (S2)

**Advisory:** GHSA-232v-j27c-5pp6 published 2026-01-16, same day as NVD publication — coordinated disclosure appears to have been brief or simultaneous

**Workaround (for users who cannot immediately upgrade):** Run Inspector with `--host 127.0.0.1 --port 8080` (or equivalent flag) to restrict binding to localhost (S5, S6)

**Third-party response:**
- CrowdSec published detection rules on 2026-02-18 (S6)
- Multiple security vendors added to vulnerability databases (SentinelOne, Endor Labs, Feedly, OSV, GitLab Advisories)
- Multiple independent PoC exploit scripts published publicly (S7, S8)

### Affected Parties

**Primary victims:** MCP server developers who use MCPJam Inspector as their debugging/testing tool during development. This is a developer-facing vulnerability; end users of MCP-powered applications are not directly affected unless their developer's machine is compromised (which could then affect the software they ship).

**Secondary risk:** Organizations whose developers use MCPJam Inspector — a developer machine compromise could lead to source code theft, credential compromise, or supply chain attacks on the software the developer ships.

**Who MCPJam targets:** The tool markets to "teams building MCP servers, MCP apps, and ChatGPT apps" — primarily AI application developers, companies building MCP server integrations, and security researchers testing MCP servers (the attack scenario described in PipeLab: "inspecting a suspect server could compromise the researcher's machine" — S1).

---

## Classification Assessment

- **Likely categories:**
  - `tooling-vulnerability` — vulnerability in development/debugging tooling
  - `supply-chain` — attack targets developers, not end users; potential supply chain downstream impact
  - `missing-authentication` — core CWE-306 classification
  - `network-misconfiguration` — 0.0.0.0 binding as the enabling condition

- **Likely severity:** HIGH to CRITICAL
  - CVSS 9.8 from NVD
  - However, exploitation requires network access to a developer's machine (somewhat mitigated in typical home/isolated dev environments)
  - Cloud dev environments and office networks substantially elevate real-world risk
  - EPSS 97th percentile indicates very high exploitation probability

- **actual_vs_potential:** `near-miss` — No confirmed in-the-wild exploitation reported, but the vulnerability was network-exploitable with zero interaction and a public PoC existed within days of disclosure. The window between CVE publication (Jan 16) and patch availability (also Jan 16 in v1.4.3) means unpatched instances existed. Whether any were actually exploited is unconfirmed.

- **potential_damage:** A developer running MCPJam Inspector on a shared/office network or cloud dev environment could have their machine silently compromised by a single unauthenticated HTTP request. The attacker gains full code execution as the developer — meaning access to source code, secrets, API keys, SSH keys, cloud credentials, and the ability to inject backdoors into software the developer is building. Given that MCP developers are often building AI integrations with access to LLMs, APIs, and enterprise data, the downstream blast radius is substantial.

- **intervention:** The fix (restricting bind address to localhost + authentication) was published in the same coordinated disclosure on 2026-01-16. The relatively small user base of MCPJam (vs. the official inspector) likely limited actual exploitation. No confirmed exploitation events found in any source.

---

## Pattern Connections

**MCP ecosystem tooling risk pattern:** This incident is part of a documented wave of CVEs affecting MCP developer tooling in early 2026, not just MCP servers themselves. PipeLab's report (S1) groups it with CVE-2025-6514 (mcp-remote, CVSS 9.6 — command injection in a library with ~500k downloads) to make the point that "the attack surface extends to client-side tooling, not just servers." Both incidents share the same root structural problem: developer tooling built quickly during an ecosystem growth phase, without the security scrutiny applied to production services.

**Developer machine = high-value target:** Unlike production service vulnerabilities, developer machine RCE provides access to the entire software supply chain: credentials, source code, secrets, and the ability to inject malicious code into software being built. This is the same threat model as the xz-utils backdoor (2024) but exploited via an exposed HTTP port rather than social engineering.

**Fork ecosystem amplification:** MCPJam is a community fork of the official MCP Inspector, created because the official project "moved too slowly." This fork dynamic is common in fast-moving AI tooling ecosystems — forks add features rapidly but may not carry over security practices or have the same security review bandwidth as the upstream project. The official modelcontextprotocol/inspector had its own separate critical vulnerabilities (GHSA-7f8r-222p-6f5g, June 2025; and GHSA-g9hg-qhmf-q45m, September 2025) — demonstrating that even the official tool had this problem class.

**0.0.0.0 default binding as systemic pattern:** This is a recurring misconfiguration in developer tooling (see also: Redis, Elasticsearch, Jupyter Notebook — all had major incidents from default 0.0.0.0 binding). Developer tools are built to be convenient; security defaults are often an afterthought. The MCP ecosystem, being young, is recapitulating this historical pattern.

**Security researcher catch-22:** PipeLab specifically notes the irony: a security researcher using the tool to inspect a *suspect* MCP server could themselves be compromised. The tool for investigating malicious MCP servers is itself the vulnerability — a particularly pointed demonstration of the tooling-layer attack surface.

**Related CVEs in same ecosystem wave (2026):**
- CVE-2025-6514 — mcp-remote, CVSS 9.6, command injection (~500k downloads)
- CVE-2025-49596 — official MCP Inspector, DNS rebinding + missing auth (requires user interaction)
- CVE-2026-22252 — LibreChat MCP integration
- CVE-2026-33252 — modelcontextprotocol/go-sdk, cross-site tool execution
- GHSA-7f8r-222p-6f5g — official MCP Inspector proxy server vulnerabilities (June 2025, Critical)

---

## Open Questions

1. **Exact date_occurred:** When was the vulnerable code introduced? Which version first had the 0.0.0.0 default binding? Not confirmed in any source.

2. **Reporter identity and discovery method:** "c2an1" is a GitHub handle with no public profile information found. Was this found via code review, active scanning, or a bug bounty? The discovery method matters for understanding whether this was found before or after potential exploitation.

3. **Real-world exploitation:** No confirmed exploitation events found. The 97th-percentile EPSS score and public PoC suggest high probability, but no breach reports were located. Worth monitoring threat intel for any post-exploitation disclosures.

4. **MCPJam vs. official inspector distinction:** The incident brief refers to "the official MCP debugging/inspection tool" — but CVE-2026-23744 is in **MCPJam Inspector**, a third-party fork, not the official Anthropic/modelcontextprotocol tool. This distinction should be clarified in the final incident write-up. The official inspector has its own separate CVEs.

5. **Download count for `@mcpjam/inspector`** (the current package, not the legacy v1 package): npm download data for the main package was not retrieved directly. The 8 weekly downloads figure is for `@mcpjam/inspector-v1` (legacy). The active package download count is unknown but likely much higher given 1.9k stars.

6. **Vendor notification date:** The GHSA advisory lists a published date of 2026-01-16 but the actual private disclosure to MCPJam maintainers may have preceded this. Timeline of responsible disclosure process not available.

7. **Is the fix sufficient?** The patch (v1.4.3) restricts binding to localhost and adds authentication. Whether the authentication implementation has been independently reviewed is unknown. Given the pace of the fix, a rapid security review would be prudent.

8. **Cloud dev environment exposure analysis:** No source quantified how many developers run MCPJam Inspector in GitHub Codespaces, Gitpod, or similar cloud environments where "localhost" is exposed over HTTPS to the internet by default through port forwarding — a scenario where even a localhost bind would not prevent remote exploitation.
