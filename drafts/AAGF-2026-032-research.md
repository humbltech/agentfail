# AAGF-2026-032 Research: MCPoison — Cursor IDE Persistent RCE via MCP Trust Bypass (CVE-2025-54136)

## Source Inventory

| # | Source | URL | Date Accessed |
|---|--------|-----|---------------|
| 1 | PipeLab — State of MCP Security 2026 (primary) | https://pipelab.org/blog/state-of-mcp-security-2026/ | 2026-05-06 |
| 2 | NVD CVE Record — CVE-2025-54136 | https://nvd.nist.gov/vuln/detail/CVE-2025-54136 | 2026-05-06 |
| 3 | GitHub Security Advisory GHSA-24mc-g4xr-4395 (vendor) | https://github.com/cursor/cursor/security/advisories/GHSA-24mc-g4xr-4395 | 2026-05-06 |
| 4 | Check Point Research — original disclosure blog | https://research.checkpoint.com/2025/cursor-vulnerability-mcpoison/ | 2026-05-06 |
| 5 | Check Point Blog — Cursor IDE Persistent Code Execution via MCP Trust Bypass | https://blog.checkpoint.com/research/cursor-ide-persistent-code-execution-via-mcp-trust-bypass/ | 2026-05-06 |
| 6 | The Hacker News coverage | https://thehackernews.com/2025/08/cursor-ai-code-editor-vulnerability.html | 2026-05-06 |
| 7 | Tenable FAQ — CurXecute and MCPoison | https://www.tenable.com/blog/faq-cve-2025-54135-cve-2025-54136-vulnerabilities-in-cursor-curxecute-mcpoison | 2026-05-06 |
| 8 | Security Boulevard FAQ | https://securityboulevard.com/2025/08/cve-2025-54135-cve-2025-54136-frequently-asked-questions-about-vulnerabilities-in-cursor-ide-curxecute-and-mcpoison/ | 2026-05-06 (403 — not accessed) |
| 9 | TrueFoundry — MCP Tool Poisoning structural analysis | https://www.truefoundry.com/blog/blog-mcp-tool-poisoning-gateway-defense | 2026-05-06 |
| 10 | Cursor user statistics (Panto.ai, DevGraphIQ, Shipper.now aggregates) | https://www.getpanto.ai/blog/cursor-ai-statistics | 2026-05-06 |

## Source Bias Assessment

**Check Point Research (sources 4, 5)** is the disclosing researcher. This is the authoritative technical source but carries typical researcher incentives: framing severity favorably, maximizing headline impact. Their CVSS assignment of 7.2 was overridden upward to 8.8 by NIST, suggesting the vendor-aligned CNA score may understate severity.

**GitHub Advisory GHSA-24mc-g4xr-4395 (source 3)** is a vendor advisory published by Cursor/Anysphere — reflects vendor framing. Credits @chaandrey (Andrey Charikov of Check Point).

**PipeLab (source 1)** is a third-party MCP security aggregator. No disclosed conflicts of interest found. Likely has business interest in portraying MCP ecosystem as high-risk.

**Quantitative claims to flag:**
- "1 million+ Cursor users" — confirmed by multiple independent sources (Tenable, Bloomberg, JetBrains survey data), considered reliable.
- "More than half of Fortune 500 companies had developers using Cursor" — Anysphere self-reported at Series C funding round (June 2025). Marketing claim, unaudited.
- No quantitative claims about how many users ran vulnerable versions at time of disclosure.

---

## Key Facts (with source attribution)

### Dates

- **date_occurred**: Unknown — vulnerability existed from when Cursor first shipped MCP support (MCP protocol launched November 2024; Cursor MCP support added early 2025). No specific date when the flaw was introduced has been reported.
- **date_discovered**: 2025-07 — Check Point Research discovered the vulnerability in July 2025 prior to disclosure on July 16. Exact internal discovery date not published.
- **date_reported**: **2025-08-05** — First public disclosure via Check Point Research blog post (sources 4, 5). NVD published CVE record 2025-08-01; advisory published same day. The August 5 blog post is the definitive first public technical disclosure.
- **vendor_notified**: 2025-07-16 (responsible disclosure to Cursor dev team) [sources 4, 5]
- **patch_shipped**: 2025-07-29 (Cursor version 1.3) [sources 4, 5, 3]
- **cvs_published**: 2025-08-01 [source 2]
- **nvd_last_modified**: 2025-08-24 [source 2]

### Technical Details

**Vulnerability class:** Post-approval trust persistence / lack of integrity re-validation (CWE-78: OS Command Injection; CWE-494: Download of Code Without Integrity Check)

**MCP configuration location:** `.cursor/rules/mcp.json` — a per-project JSON file checked into version-controlled repositories.

**Config structure:**
```json
{
  "mcpServers": {
    "test1": {
      "command": "echo",
      "args": ["hello"]
    }
  }
}
```

**Root cause — trust binding flaw:** Cursor bound approval to the MCP server's *key name* (e.g., `"test1"`) rather than to the content of `command` and `args` fields. Once an entry with a given key name was approved, any subsequent modification to `command` or `args` was silently accepted as still-trusted. The IDE never diffed or re-hashed configuration content against the original approved state. [sources 3, 4, 5]

**Attack flow (three stages):**
1. **Plant**: Attacker (with repository write access) commits a benign MCP entry — e.g., `command: "echo"`, `args: ["hello"]`. The configuration looks harmless and passes human code review.
2. **Approval**: Victim developer pulls the repository and opens it in Cursor. Cursor prompts once for MCP approval. User approves the innocuous-looking config.
3. **Swap and persist**: Attacker subsequently pushes a commit replacing `command` with a malicious payload (e.g., a reverse shell via a batch script: `shell.bat`). On every subsequent Cursor launch by the victim — including after a `git pull` — the malicious command executes silently with no new prompt or warning. The attacker receives persistent shell access for as long as the developer keeps working in the project.

**Execution trigger:** Project load. Every time Cursor opens the project directory, it scans `.cursor/` and auto-processes approved MCP configurations. No additional user interaction required after the initial approval. [sources 4, 5]

**POC demonstrated:** Check Point demonstrated replacement of `echo` with a reverse shell batch script (`shell.bat`). On project open, attacker receives reverse shell. Confirmed re-executes on every project reopen. [source 4]

**Attack pre-conditions:**
- Attacker must have write access to the shared repository (collaborator, maintainer, or supply chain compromise of a dependency repo)
- OR attacker has local filesystem write access to the victim machine (post-exploit lateral movement scenario)
- Victim must be running Cursor ≤ 1.2.4
- Victim must have previously approved the benign MCP config at least once

**Why this is "agentic":** The MCP configuration directly controls tools available to the Cursor AI agent. The attack hijacks the agent's tool execution layer — the AI model executes MCP server commands as part of its normal agentic workflow, meaning the malicious command runs not just as a startup script but as an injected agent capability available throughout the session.

### Affected System

- **Product:** Cursor IDE (AI code editor by Anysphere Inc.)
- **Vulnerable versions:** Cursor < 1.3 (specifically documented as ≤ 1.2.4 in GitHub advisory; NVD says "up to excluding 1.3")
- **Component:** MCP configuration trust/approval subsystem
- **Fixed version:** Cursor 1.3 (released 2025-07-29)
- **Fix mechanism:** Any modification to an `mcpServer` entry — including trivial whitespace changes — now triggers a mandatory re-approval prompt. The user must explicitly approve or reject before the modified MCP takes effect. [sources 3, 4, 5]
- **Release notes:** Cursor 1.3 release notes did NOT specifically mention the vulnerability. Independent testing by Check Point confirmed the fix. [source 4]

**Companion vulnerability disclosed simultaneously:**
- **CVE-2025-54135 (CurXecute)** — CVSS 8.5, fixed in Cursor 1.3.9. Prompt injection attack via connected MCP servers (e.g., Slack messages crafted to trigger AI-suggested edits that modify `mcp.json`), executing commands before the user can reject. Related architectural weakness — both exploit MCP configuration trust — but distinct attack vector requiring an active MCP server connection. [source 7]

### Impact & Damage

**Direct impact per exploitation:**
- Full arbitrary code execution on victim developer's machine, persistent across all future Cursor sessions
- Access to all files, credentials, SSH keys, API tokens, browser sessions visible to the developer's OS user account
- Source code exfiltration (entire local repository and any mounted drives)
- Intellectual property theft (unreleased code, internal tooling, business logic)
- Lateral movement into corporate networks via developer credentials
- Installation of persistent backdoors independent of the MCP mechanism

**Scale:**
- Cursor had 1M+ daily users and 360,000+ paying customers as of mid-2025 [source 10]
- More than half of Fortune 500 companies had developers using Cursor (Anysphere claim, June 2025) [source 10]
- All users running Cursor ≤ 1.2.4 who used MCP configurations in shared repositories were potentially vulnerable
- No public data on what percentage of Cursor users had MCP configurations enabled or shared via git at time of disclosure

**Real-world exploitation:** No confirmed in-the-wild exploitation reported. This is a research disclosure with working POC. The attack requires attacker write access to a shared repository, which limits the opportunistic attack surface but is entirely realistic in supply chain, insider threat, and compromised contributor scenarios. [sources 4, 5]

**Highest-risk targets:** Enterprise development teams using shared GitHub repositories with MCP-enabled Cursor workflows; open-source contributors accepting PRs from untrusted contributors.

### Vendor Response

| Date | Event |
|------|-------|
| 2025-07-16 | Check Point discloses to Cursor dev team (responsible disclosure) |
| 2025-07-29 | Cursor 1.3 released with fix (13 days after disclosure) |
| 2025-08-01 | GitHub Security Advisory GHSA-24mc-g4xr-4395 published; CVE-2025-54136 assigned |
| 2025-08-05 | Check Point public disclosure blog post published |
| 2025-08-24 | NVD last modified date (CVSS score analysis updated) |

**Fix quality:** The patch is behavioral — adding a mandatory re-approval prompt on any config change. It does not address the underlying architectural issue (MCP trust is still name-based; the fix is a compensating control requiring user acknowledgment of changes). A content-hash-based approval mechanism would be stronger. No workarounds were documented in the advisory.

**CVSS discrepancy:** Anysphere/GitHub CNA assigned CVSS 7.2 (Privileges Required: High — reflecting the need for repository write access). NIST NVD independently assessed 8.8 (Privileges Required: Low). The difference reflects disagreement about whether repository write access constitutes "high" privilege in collaborative developer environments. The higher NIST score is arguably more appropriate for open-source project contexts. [source 2]

### Affected Parties

- **Primary victims:** Software developers and engineering teams using Cursor ≤ 1.2.4 with MCP configurations checked into shared version-controlled repositories
- **Industry:** Software development, technology companies broadly; Fortune 500 enterprises with developer workforces
- **Geographic scope:** Global — Cursor is used worldwide
- **Estimated exposed population:** Up to 1M+ daily active users (all potentially vulnerable until patched); subset materially at risk is those with MCP configs in shared repos

---

## Classification Assessment

- **Likely categories:** `tool-misuse`, `supply-chain`, `trust-bypass`, `persistent-execution`, `agentic-tool-injection`
- **Likely severity:** HIGH — CVSS 7.2 (vendor/CNA) / 8.8 (NIST). Real-world severity closer to NIST score given developer environments where repository write access is common among team members. Full RCE with persistence on developer machines warrants HIGH classification.
- **actual_vs_potential:** `near-miss` — No confirmed in-the-wild exploitation. Working POC demonstrated by researchers. Potential for exploitation was real (1M+ users, widely deployed, trivial attack chain once repo write access exists).
- **potential_damage:** Compromise of developer machines across Fortune 500 engineering teams; exfiltration of unreleased source code, credentials, and API keys; supply chain injection into software built by affected developers; persistent backdoor surviving IDE restarts. At scale, an attacker targeting a popular open-source MCP configuration could have poisoned configurations pulled by thousands of developers simultaneously.
- **intervention:** Responsible disclosure by Check Point Research, followed by a 13-day vendor patch cycle. No evidence the vulnerability was known to or exploited by threat actors before public disclosure.

---

## Pattern Connections

**Direct MCP supply chain pattern:**
- **postmark-mcp backdoor (September 2025)** — First confirmed in-the-wild malicious MCP server published to npm. An attacker published a backdoored version of a legitimate MCP package. Different vector (package registry vs. config file swap) but same supply chain trust model exploited.
- **OX Security MCP architectural RCE** — Researchers found a systemic RCE vulnerability in Anthropic's MCP protocol affecting 150M+ downloads across 7,000+ exposed servers. MCPoison is one specific instantiation of the broader MCP trust model problem.
- **Anthropic mcp-server-git three-CVE chain** — Three CVEs in the official Anthropic MCP git server. Same ecosystem vulnerability surface.

**MCP tool poisoning / prompt injection:**
- **CVE-2025-54135 (CurXecute)** — Companion vulnerability in Cursor. Prompt injection via connected MCP servers (e.g., malicious Slack message crafts an AI suggestion that modifies `mcp.json`). Both CVEs were disclosed together by Check Point, both fixed in Cursor 1.3.x.
- **Invariant Labs MCP tool poisoning research (2025)** — Demonstrated how malicious MCP tool descriptions embed hidden instructions exploiting AI context windows. MCPoison bypasses the AI layer entirely (config-level attack), but the trust model failure is analogous.
- **WhatsApp MCP rug-pull (2025)** — Malicious MCP server embedded instructions in tool descriptions to exfiltrate WhatsApp history. Both represent post-approval trust exploitation.

**IDE/developer tooling supply chain:**
- **VS Code extension supply chain attacks** — Pattern of compromised developer tool extensions achieving persistent code execution. MCPoison is structurally identical but in the MCP configuration layer rather than the extension layer.
- **Event-Stream npm package (2018)** — Canonical example of a benign package later modified to add malicious payload after gaining user trust. MCPoison is functionally the same "bait-and-switch" pattern, now in AI tool configurations.

**Broader trust bypass precedents:**
- The "trust key name, not content" flaw mirrors historical SSH `known_hosts` key-rotation blind spots and SSL certificate pinning bypasses — systems that establish initial trust but fail to re-validate when underlying credentials change.

---

## Triage Verification

1. **Real-world deployment:** YES — Cursor is a production IDE used by 1M+ developers, not a research prototype. MCP configuration support shipped as a production feature.
2. **Autonomous agent involved:** YES — Cursor AI uses MCP servers as its tool execution layer. The attack hijacks the tool layer available to the AI agent during agentic coding sessions. The persistence mechanism specifically exploits agentic execution (MCP servers run automatically when the agent engages tools).
3. **Verifiable:** YES — CVE-2025-54136 assigned; GitHub Security Advisory published by vendor (GHSA-24mc-g4xr-4395); NVD record published; independent confirmation by multiple security vendors (Tenable, Security Boulevard, THN).
4. **Meaningful impact:** YES — Full persistent RCE on developer machines. Developer machines are high-value targets (credentials, source code, corporate network access). Affected population up to 1M+ daily users.

**All four triage criteria met. Recommend: PUBLISH.**

---

## Open Questions

1. **When did Cursor first ship MCP support?** The exact version and date when the vulnerable MCP trust model was introduced is not documented in any source. This would establish the true `date_occurred` (vulnerability introduction date).

2. **Was the vulnerability exploited in the wild?** No exploitation has been reported, but no systematic scan of public repositories for evidence of malicious MCP config swaps has been published.

3. **What percentage of Cursor users had MCP configs in shared repos?** No telemetry data released. This determines the realistic attack surface vs. the theoretical 1M+ user ceiling.

4. **Content-hash fix gap:** The patch is a behavioral compensating control (re-prompt on change). Was a stronger fix (content hashing, cryptographic signing of approved configs) discussed or rejected? No vendor communication published on this design choice.

5. **Cursor 1.3 vs. 1.3.9 discrepancy:** CVE-2025-54136 is fixed in 1.3; companion CVE-2025-54135 (CurXecute) is fixed in 1.3.9. Were there interim releases? Was MCPoison's fix complete in 1.3 or were there regression patches?

6. **Enterprise deployment lag:** With Fortune 500 adoption, what was the corporate patching timeline? Enterprise IDEs often lag personal installs by weeks or months. No enterprise patch adoption rate data available.

7. **Researcher identity confirmation:** The GitHub advisory credits `@chaandrey` (Andrey Charikov). Check Point Research also names Roman Zaikin and Oded Vanunu. Primary source (pipelab.org) does not name individual researchers — attribution is to "Check Point Research" collectively.
