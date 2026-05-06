# AAGF-2026-033 Research: mcp-remote OS Command Injection RCE (CVE-2025-6514)

## Source Inventory

| # | Source | URL | Date Accessed |
|---|--------|-----|---------------|
| S1 | Pipelab — State of MCP Security 2026 | https://pipelab.org/blog/state-of-mcp-security-2026/ | 2026-05-06 |
| S2 | NVD CVE Record | https://nvd.nist.gov/vuln/detail/CVE-2025-6514 | 2026-05-06 |
| S3 | JFrog Blog (primary technical disclosure) | https://jfrog.com/blog/2025-6514-critical-mcp-remote-rce-vulnerability/ | 2026-05-06 |
| S4 | JFrog Research (technical detail) | https://research.jfrog.com/vulnerabilities/mcp-remote-command-injection-rce-jfsa-2025-001290844/ | 2026-05-06 |
| S5 | GitHub Advisory GHSA-6xpm-ggf7-wc3p | https://github.com/advisories/GHSA-6xpm-ggf7-wc3p | 2026-05-06 |
| S6 | GitHub — geelen/mcp-remote repository | https://github.com/geelen/mcp-remote | 2026-05-06 |
| S7 | GitHub — fix commit 607b226 | https://github.com/geelen/mcp-remote/commit/607b226a356cb61a239ffaba2fb3db1c9dea4bac | 2026-05-06 |
| S8 | The Hacker News coverage | https://thehackernews.com/2025/07/critical-mcp-remote-vulnerability.html | 2026-05-06 |
| S9 | The Vulnerable MCP Project tracker | https://vulnerablemcp.info/vuln/cve-2025-6514-mcp-remote-rce.html | 2026-05-06 |
| S10 | Wiz vulnerability database | https://www.wiz.io/vulnerability-database/cve/cve-2025-6514 | 2026-05-06 |
| S11 | SentinelOne vulnerability database | https://www.sentinelone.com/vulnerability-database/cve-2025-6514/ | 2026-05-06 |
| S12 | Docker Blog — MCP Horror Stories | https://www.docker.com/blog/mcp-horror-stories-the-supply-chain-attack/ | 2026-05-06 |
| S13 | Snyk advisory | https://security.snyk.io/vuln/SNYK-JS-MCPREMOTE-10734125 | 2026-05-06 |

---

## Source Bias Assessment

**JFrog Security Research (S3, S4) is the disclosing researcher.** This is a classic self-promotion disclosure: JFrog found the bug, wrote the CVE, and published the blog post. All quantitative claims (437K downloads, "first documented RCE on MCP client") originate from JFrog and flow through every secondary source uncritically. No independent verification of the download count or the "first ever" claim is available.

**Risk of inflation:** JFrog is a security vendor with commercial interest in showcasing MCP ecosystem risk. The "first documented case of full RCE on MCP client" framing may be accurate but is also maximally alarming for marketing purposes. The severity is real; the historical superlative requires independent verification.

**Secondary sources (S8–S12)** are purely derivative — they restate JFrog's findings with no additional technical investigation.

**The Vulnerable MCP Project (S9)** adds some independent editorial framing but cites the same JFrog source chain.

**NVD status (S2):** As of research date, marked "Not scheduled for NVD enrichment prioritization" — NVD has not independently assessed the CVSS. The 9.6 score was assigned by JFrog and is cited by NVD without independent review.

**mcp-remote repo (S6, S7):** Commit data (date, author, diff) is ground-truth — not subject to JFrog framing. The commit date of June 17, 2025 is verified objective fact.

---

## Key Facts (with source attribution)

### Dates

- **date_occurred:** 2024-11 (earliest known — mcp-remote 0.0.5 was first release after MCP launch; vulnerable code existed from first published version) [S4, S6]
- **date_discovered:** Unknown — JFrog has not disclosed when they found it. The fix commit (June 17, 2025) predates public disclosure (July 9, 2025) by 22 days, suggesting discovery was sometime in late May–early June 2025. [S7]
- **date_reported:** **2025-07-09** — JFrog blog publication and CVE assignment; this is the first public disclosure. [S3, S5]
- **date_patched:** **2025-06-17** — version 0.1.16 released (commit 607b226). Patch preceded public disclosure by 22 days — coordinated disclosure with quiet patch. [S7]

**Timeline reconstruction:**
- ~Late May / early June 2025: JFrog discovers vulnerability
- June 17, 2025: Fix committed and v0.1.16 released (quiet — no security advisory at release)
- July 9, 2025: JFrog publishes blog post, CVE assigned

**Note:** The 22-day gap between patch and public CVE is a coordinated disclosure window, but the absence of a release-time security notice means users who upgraded between June 17 and July 9 would not have known why they should upgrade.

---

### Technical Details

**Vulnerable component:** `mcp-remote` npm package, versions 0.0.5–0.1.15 [S4, S5]

**CWE:** CWE-78 — Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection') [S2, S5]

**Root cause:** During OAuth flow initialization, mcp-remote fetches metadata from the remote MCP server, which includes an `authorization_endpoint` URL. This URL is passed to the `open()` npm package (a browser-launching utility) without sanitization. [S3, S4]

**Vulnerable code path:**
```
StreamableHTTPClientTransport.send()
  → auth.ts:auth()
    → discoverOAuthMetadata()
      → startAuthorization()
        → node-oauth-client-provider.ts:redirectToAuthorization()
          → open() [npm package — passes URL to OS shell]
```
[S3]

**Platform-specific behavior:**
- **Windows:** Full arbitrary OS command execution with parameter control. The `open()` package invokes PowerShell with the URL; attackers use PowerShell's subexpression operator `$()` to execute commands. Example payload scheme: `a:$(cmd.exe /c malicious_command)` — the non-standard URI scheme prevents URL encoding of spaces and special characters. [S3]
- **macOS/Linux:** Arbitrary executable launch with constrained parameters. The `file://` scheme can be used to force execution of specified binaries. Example: `file:/c:/windows/system32/calc.exe` (adapted for macOS/Linux targets). Limited parameter control compared to Windows. [S3, S4]

**Proof of concept (Windows):**
```
authorization_endpoint: a:$(cmd.exe /c whoami > c:\\temp\\pwned.txt)?response_type=code...
```
The non-existent URI scheme `a:` prevents URL encoding of special characters like spaces, enabling full PowerShell command syntax. [S3]

**What the fix did:**
Commit 607b226 added URL encoding for credentials in `sanitizeUrl()`:
```typescript
if (url.username) url.username = encodeURIComponent(url.username)
if (url.password) url.password = encodeURIComponent(url.password)
```
A test was added verifying that `user$(calc)r:pass$(calc)word@domain.com` becomes `%24` encoded. [S7]

**Note on fix scope:** The fix targets username/password credential injection in URLs. The broader vulnerability was the `authorization_endpoint` URL being passed to `open()`. The fix is specifically scoped to the credential injection vector — whether the full attack surface was closed warrants verification.

---

### Affected System

- **Package:** `mcp-remote` (npm)
- **Affected versions:** 0.0.5 – 0.1.15 (inclusive)
- **Fixed version:** 0.1.16+
- **Current latest version** (as of research date): 0.1.38 [S6]
- **Repository:** https://github.com/geelen/mcp-remote
- **Maintainer:** Glen Maddern (@geelen) — Head of MCP at Groq (formerly Cloudflare). Community contributor to MCP ecosystem. **Not an Anthropic employee.** Not an official Anthropic package. [S6, S12, web search]
- **Package status:** Explicitly labeled "experimental / proof-of-concept" in its own README [S6]
- **Clients using mcp-remote:**
  - Claude Desktop (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`) [S6]
  - Cursor (`~/.cursor/mcp.json`) [S6]
  - Windsurf (`~/.codeium/windsurf/mcp_config.json`) [S6]
  - Any stdio-only MCP client connecting to remote OAuth-protected servers [S6]
- **Purpose:** Bridge tool enabling MCP clients that only support local stdio servers to connect to remote MCP servers with OAuth authentication. Users add it to their MCP client config as a local proxy.

---

### Impact & Damage

**Download count:** 437,000+ at time of disclosure (July 9, 2025) [S3, S8]. The pipelab source rounds to "close to half a million." [S1]

**Scale context:** This is a developer tool — each download represents a developer machine, not an end-user installation. 437K downloads = 437K potential developer workstations with code execution exposure.

**Actual damage:** No confirmed exploitation in the wild documented in any source. No data breach, financial loss, or known victim reported. [S9, S10]

**Potential damage:** Full OS-level code execution on developer machines. Attacker consequences would include:
- Credential theft (SSH keys, API keys, AWS/GCP/Azure credentials in `~/.config`, `.env` files)
- Source code exfiltration
- Supply chain contamination (inject into repos, CI pipelines)
- Persistent access via malware installation
- Lateral movement within corporate network

**EPSS score:** 6.169% (91st percentile for exploitation probability) [S5] — relatively low absolute probability but extremely high relative to other CVEs.

**actual_vs_potential assessment:** Near-miss / partial. No confirmed exploitation but: (a) public PoC exists, (b) 437K downloads exposed, (c) EPSS at 91st percentile, (d) fix committed before public disclosure suggests quiet discovery. The window between June 17 (patch) and July 9 (disclosure) represents 22 days when the bug was patchable but users had no reason to upgrade.

---

### Vendor Response

**Maintainer:** Glen Maddern (@geelen) responded promptly — patched within the coordinated disclosure window.

**Response quality:** Positive from a patching standpoint. Weaknesses:
1. No release-time security notice when v0.1.16 was pushed (June 17) — users had no signal to upgrade urgently
2. The package README still describes the project as "experimental" — raises questions about production use given 437K downloads
3. Anthropic was not the vendor — as a community-maintained dependency used in Claude Desktop, Anthropic had no direct role in the patch

**Anthropic's role:** mcp-remote was being recommended in MCP documentation and tutorials as the standard way to connect Claude Desktop to remote MCP servers, despite being a community package with "experimental" status. No evidence Anthropic issued guidance to Claude Desktop users to upgrade. [S6, S8]

**Timeline summary:**
- ~May–June 2025: JFrog discovers, reports to Glen Maddern
- 2025-06-17: v0.1.16 patched and released (no CVE, no security notice)
- 2025-07-09: JFrog publishes blog + CVE assigned (CVSS 9.6)

---

### Affected Parties

- **Developers** using mcp-remote as a proxy to connect Claude Desktop, Cursor, or Windsurf to remote MCP servers
- **Corporate developer environments** — any org where developers run AI-assisted coding tools and have connected remote MCP servers
- **CI/CD pipelines** — if mcp-remote was used in automated workflows (less common but possible)
- **MCP server operators** — not directly affected, but a malicious operator could exploit this against anyone connecting to their server

---

## Classification Assessment

- **Likely categories:**
  - `supply-chain` — community package with wide adoption in AI toolchain, not maintained by Anthropic
  - `shell-injection` / `os-command-injection` — CWE-78 is the primary technical class
  - `mcp-ecosystem` — client-side attack surface within the MCP protocol stack
  - `developer-tooling` — affects developer machines, not production user systems

- **Likely severity:** HIGH. CVSS 9.6 (JFrog-assigned, NVD not independently reviewed). The score is defensible: Network attack vector, Low complexity, No privileges required, User interaction required (the UI:R is the only mitigating factor — victim must connect to a malicious server), Changed scope (C:H, I:H, A:H). The UI:R reduces from a theoretical 10.0 to 9.6.

- **actual_vs_potential:** `near-miss` — No confirmed exploitation. High potential impact given download scale, public PoC, and developer machine attack surface.

- **potential_damage:** Full OS-level RCE on 437,000+ developer machines. Attacker controlling a malicious MCP server could compromise any developer who connects to it: steal credentials (SSH, API keys, cloud credentials), exfiltrate source code, poison repositories, and establish persistent backdoors. At scale, this is a developer supply chain attack vector.

- **intervention:** (1) JFrog discovered before documented exploitation; (2) coordinated disclosure with patch ahead of public CVE; (3) no evidence of adversarial MCP servers exploiting this in the wild prior to disclosure.

---

## Pattern Connections

**1. Supply chain risk in AI tooling ecosystem**
mcp-remote emerged rapidly to fill a gap in the MCP spec (OAuth for remote servers) and was referenced in Anthropic's own documentation. Despite being labeled "experimental" and maintained by a single developer with no official backing, it accumulated 437K downloads. This mirrors classic supply chain vulnerabilities: widely-adopted community packages in nascent ecosystems move faster than security review. Contrast with npm `event-stream` (2018), `ua-parser-js` (2021), and `xz-utils` (2024).

**2. Client-side MCP attack surface**
Most MCP security discourse focuses on server-side risks (prompt injection via tool responses, data exfiltration through MCP servers). This CVE demonstrates the converse: a malicious MCP *server* attacking the *client*. The OAuth handshake is a trusted protocol boundary that becomes an injection vector. Security reviews of MCP deployments should treat server → client data flows as untrusted input.

**3. Shell injection in AI infrastructure plumbing**
The `open()` npm package pattern (pass a URL to the OS to open in browser) is ubiquitous in developer tooling. The vulnerability is not MCP-specific — any tool that takes a remote-provided URL and passes it to an OS shell command is vulnerable. AI tooling is being built rapidly by developers who may not apply the same scrutiny as they would to web-facing code.

**4. Implicit trust in OAuth metadata**
OAuth authorization_endpoint is fetched from a remote server and used in a security-critical operation. The assumption that the OAuth endpoint URL is safe to pass to an OS command reflects a common implicit trust assumption: "this is a URL, not code." In the context of shell execution, URLs with non-standard schemes become code.

**5. Experimental labels vs. production reality**
The README states "experimental / proof-of-concept" but the package was documented in MCP client setup guides. 437K downloads suggests real production use far exceeding experimental intent. This gap between declared status and actual use creates a security blind spot — neither the maintainer nor users treat it with production-grade security rigor.

**6. PromptIntel cross-reference**
This maps to the "Agentic Misuse" subcategory in PromptIntel taxonomy — specifically server-to-client attack chains in multi-agent infrastructure. A malicious MCP server achieving RCE on the connecting client represents the infrastructure equivalent of prompt injection escalating to system compromise.

---

## Open Questions

1. **Exact discovery date:** When did JFrog first find this? The 22-day gap between patch (June 17) and disclosure (July 9) is known, but the discovery-to-patch timeline is not documented in public sources.

2. **Any exploitation before disclosure?** No confirmed exploitation documented, but the 22-day quiet patch window is a risk period. No post-disclosure threat intelligence on in-the-wild exploitation.

3. **Scope of the fix:** The commit targets URL credential encoding in `sanitizeUrl()`. Does this fully close the `authorization_endpoint` injection vector, or was there a separate fix? The JFrog blog describes a broader vulnerability (any crafted `authorization_endpoint` URL) but the commit message reads "Forcibly escape username/pass for basic auth URLs too" — which sounds more narrow. Requires code audit of v0.1.16 to confirm full coverage.

4. **Anthropic's documentation response:** Did Anthropic update Claude Desktop setup documentation to recommend avoiding mcp-remote until patched, or to require v0.1.16+? No evidence found in sources.

5. **npm advisory publication:** Was a formal npm security advisory published alongside the CVE? The GitHub Advisory (GHSA-6xpm-ggf7-wc3p) exists but it's unclear if npm's advisory system surfaced an automatic upgrade warning to existing users.

6. **macOS/Linux exploitation difficulty:** Sources describe "arbitrary executable execution with limited parameter control" on macOS/Linux. What is the realistic exploit complexity on those platforms? Could a `file://` scheme target be used to execute a user-writable script with meaningful impact?

7. **Glen Maddern's current role:** Listed as "Head of MCP at Groq" in one source. Does Groq now maintain mcp-remote, or is it still personal project? Relevant for ongoing security ownership.

8. **Other packages using `open()` with remote-provided URLs:** Is this vulnerability pattern present in other MCP client libraries? JFrog may have broader research; this CVE might be one of several related findings.
