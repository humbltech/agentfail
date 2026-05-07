# Stage 1 Research: AAGF-2026-044
## Candidate: GitHub Copilot Agent Mode RCE via Prompt Injection in PR Description (CVE-2025-53773)

**Research date:** 2026-05-07
**Researcher:** Stage 1 Research Agent

---

## Source Attribution

Every claim below cites which source it came from. Sources consulted:

1. **[Rehberger-Primary]** Rehberger, J. "GitHub Copilot: Remote Code Execution via Prompt Injection (CVE-2025-53773)." Embrace The Red, August 12, 2025. https://embracethered.com/blog/posts/2025/github-copilot-remote-code-execution-via-prompt-injection/
2. **[NVD]** NVD CVE Detail, CVE-2025-53773. https://nvd.nist.gov/vuln/detail/CVE-2025-53773
3. **[PersistentSec]** Vernier, M. "Part III: CVE-2025-53773 — Visual Studio & Copilot — Wormable Command Execution via Prompt Injection." Persistent Security. https://www.persistent-security.net/post/part-iii-vscode-copilot-wormable-command-execution-via-prompt-injection (article body inaccessible — Wix JS rendering; attribution confirmed via search result snippets and Rehberger acknowledgment)
4. **[Willison]** Willison, S. "The Summer of Johann: prompt injections as far as the eye can see." simonwillison.net, August 15, 2025. https://simonwillison.net/2025/Aug/15/the-summer-of-johann/
5. **[Wiz]** Wiz Vulnerability Database, CVE-2025-53773. https://www.wiz.io/vulnerability-database/cve/cve-2025-53773
6. **[Rapid7]** Rapid7 Vulnerability Database, CVE-2025-53773. https://www.rapid7.com/db/vulnerabilities/microsoft-visual_studio-cve-2025-53773/
7. **[VentureBeat]** "Claude Code, Copilot and Codex all got hacked. Every attacker went for the credential, not the model." VentureBeat. https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them (rate-limited; details reconstructed from search snippet)
8. **[VSCode-1.104]** VS Code August 2025 release notes (v1.104). https://code.visualstudio.com/updates/v1_104
9. **[VSCode-v1.99]** VS Code Magazine coverage: "VS Code v1.99 Is All About Copilot Chat AI, Including Agent Mode." https://visualstudiomagazine.com/articles/2025/04/04/vs-code-v1-99-is-all-about-copilot-chat.aspx
10. **[SANS-XXVII-45]** SANS NewsBites Vol. XXVII Issue 45 (note: this issue covered EchoLeak/CVE-2025-32711, not CVE-2025-53773 directly — search confirmed tangential relevance only). https://www.sans.org/newsletters/newsbites/xxvii-45
11. **[GBHackers]** GBHackers, "GitHub Copilot RCE Vulnerability via Prompt Injection Enables Full System Compromise," August 13, 2025. https://gbhackers.com/github-copilot-rce-vulnerability/
12. **[CyberSecNews]** CyberSecurityNews, August 14, 2025. https://cybersecuritynews.com/github-copilot-rce-vulnerability/
13. **[SearchResults-General]** Multiple web search result snippets providing corroborating detail where direct fetch was unavailable.

---

## Dates

- **date_occurred (feature introduced / vulnerability existed from):** VS Code v1.99 (March 2025). The `chat.tools.autoApprove` setting was introduced as an experimental feature in VS Code v1.99. [VSCode-v1.99, SearchResults-General] The vulnerability existed from this point — any version of VS Code Copilot shipping v1.99 or later with Agent Mode enabled was affected. Visual Studio 2022 affected versions: 17.14.0 through 17.14.11. [NVD, Rapid7]
- **date_discovered:** Rehberger reported to MSRC on **June 29, 2025**. [Rehberger-Primary, SearchResults-General] Markus Vernier (Persistent Security) and Ari Marzuk made independent discoveries; their precise report dates are not publicly documented but Microsoft's acknowledgment of "existing tracking" at time of Rehberger's June 29 report suggests at least one other party had already reported it. [SearchResults-General, GBHackers]
- **date_reported (first public disclosure):** **August 12, 2025** — Rehberger's blog post and the NVD/MSRC advisory publication date are both August 12, 2025. [NVD, Rehberger-Primary] This is coordinated disclosure, not a pre-patch leak. The CVE was published on the same day as Patch Tuesday.
- **Patch Tuesday date:** August 12, 2025 (Microsoft's August 2025 Patch Tuesday, which addressed 107 CVEs total). [SearchResults-General]
- **Simon Willison post contextualizing the broader "Month of AI Bugs" campaign:** August 15, 2025. [Willison]

**Source bias note:** The primary technical source is the disclosing researcher (Rehberger). Rehberger is a well-established, credible prompt injection researcher with a track record of responsible disclosure across major AI vendors (ChatGPT, Microsoft, Google). His reports are consistently technically rigorous and have been confirmed by MSRC on multiple occasions. The co-discovery by Markus Vernier (Persistent Security) — an independent professional security firm — further validates the finding. No material source conflicts were identified.

---

## Technical Mechanism

### What is "YOLO Mode" / `chat.tools.autoApprove`?

`chat.tools.autoApprove` is an experimental VS Code workspace setting introduced in v1.99 (March 2025). When set to `true` in `.vscode/settings.json`, it disables ALL user confirmation dialogs for GitHub Copilot tool invocations in Agent Mode. This means Copilot can execute terminal commands, write files, browse the web, and invoke other tools without any user approval prompt. Rehberger described the effect as: "disables all user confirmations, and we can run shell commands, browse the web, and more." [Rehberger-Primary]

The setting name was subsequently changed to `chat.tools.global.autoApprove` in VS Code v1.104 (August 2025 release), and a "deservedly scary-looking warning" was added to deter accidental activation — changes triggered in part by this vulnerability. [VSCode-1.104]

The term "YOLO mode" is colloquial shorthand used by the security community (and Rehberger himself) for this configuration state.

### How a Hidden Instruction in a PR Description Reaches Copilot's Context

When a developer uses GitHub Copilot in Agent Mode (VS Code) to review a pull request, Copilot ingests the PR description and associated content as part of its context window. If an attacker has crafted the PR description to contain a hidden prompt injection payload, that payload is processed as instructions by the LLM, not as inert data. [Rehberger-Primary]

Injection concealment techniques documented include:
- **Invisible Unicode characters** — zero-width joiners, non-printing Unicode, or other invisible characters to hide instructions from human review while remaining present in the text Copilot reads. [Rehberger-Primary, SearchResults-General]
- **HTML-style hidden comments** embedded in Markdown that render invisibly in GitHub's PR UI but are present in raw content consumed by Copilot. [SearchResults-General]
- The payload can also be embedded in **source code files**, **web pages fetched by the agent**, **GitHub issues**, or **tool responses** — PR descriptions are one of multiple injection surfaces. [Rehberger-Primary]

### Step-by-Step Attack Flow

1. **Attacker creates or modifies a PR** containing a hidden prompt injection payload in the PR description (or in a file changed by the PR). The payload instructs Copilot to write `"chat.tools.autoApprove": true` to `.vscode/settings.json`.
2. **Developer opens VS Code** with GitHub Copilot in Agent Mode enabled and asks Copilot to review or summarize the PR (or Copilot ingests the content while performing another agentic task).
3. **Injection executes:** Copilot reads the PR description, encounters the hidden instructions, and treats them as legitimate task instructions. Copilot writes `"chat.tools.autoApprove": true` to `.vscode/settings.json`. Critically, writing configuration files is within Copilot's standard Agent Mode capabilities — no special permissions are required for this step. [Rehberger-Primary]
4. **YOLO mode activates:** The settings change persists to disk immediately. From this point forward, all Copilot tool invocations in this workspace proceed without user confirmation.
5. **Arbitrary command execution:** The malicious payload (or a follow-on instruction in the same injection) now directs Copilot to execute terminal commands. These can be OS-conditional (targeting Windows, macOS, or Linux separately). [Rehberger-Primary, SearchResults-General]
6. **Full system compromise:** With unrestricted shell access, the attacker can exfiltrate secrets, install persistence mechanisms, download and execute remote payloads, or enroll the machine in a botnet.

### Additional Attack Surfaces Beyond PR Descriptions

Rehberger documented that the same injection-to-YOLO-mode attack chain works via:
- `.vscode/tasks.json` (executable task definitions that can be overwritten to run arbitrary commands)
- Malicious MCP (Model Context Protocol) server injection
- Other agent configuration file overwrites
[Rehberger-Primary]

### Wormable Propagation Mechanism

The "wormable" characterization comes from the following propagation chain: [Rehberger-Primary, SearchResults-General, VentureBeat]

1. Once a developer's machine is compromised and Copilot is in YOLO mode, the malicious instructions can direct Copilot to **embed the injection payload into new source files** during normal coding/refactoring tasks (e.g., docstrings, comments, configuration files).
2. These infected files are then **committed and pushed to the repository** — either by the developer unknowingly or by Copilot itself if instructed to commit.
3. **Other developers** who pull these changes and interact with Copilot encounter the payload in their own context, repeating the cycle.
4. The attack can additionally direct Copilot to **create new PRs** containing the payload, further spreading to other developers or repositories.

Rehberger coined the term "ZombAI" to describe developer workstations enrolled into a botnet via this mechanism. [SearchResults-General]

Key researcher quote: "AI that can set its own permissions and configuration settings is wild!" [Rehberger-Primary]

### Blast Radius

With YOLO mode enabled and unrestricted shell access:
- **Credential theft:** Source code repositories, cloud provider credentials (AWS/Azure/GCP CLI configs), SSH keys, `.env` files, npm tokens
- **Supply chain attack:** Inject malicious code into the developer's active projects before commit
- **Lateral movement:** Pivot from developer workstation to corporate network resources
- **Botnet enrollment:** Persistent backdoor installation
- **Data exfiltration:** Any file accessible on the developer's machine
- **Worm propagation:** Self-replicating spread to other developers via shared repositories

The attack requires only **user interaction** (developer asks Copilot to do something while a malicious PR/file is in scope) — it does not require any elevated privileges or additional software installation by the attacker. [NVD CVSS vector: AV:L/AC:L/PR:N/UI:R]

---

## Affected Versions and Scale

### Affected Software
- **VS Code + GitHub Copilot (Agent Mode):** All versions shipping `chat.tools.autoApprove` (VS Code v1.99 / March 2025 onward) until the August 2025 patch. [VSCode-v1.99, VSCode-1.104]
- **Visual Studio 2022:** Versions 17.14.0 through 17.14.11 explicitly confirmed in NVD CPE data. [NVD]
- **Patched versions:** VS Code v1.104 (August 2025 release with safety changes); Visual Studio 2022 v17.14.12. [Rapid7, VSCode-1.104]

### Scale Estimate

- GitHub Copilot reached **20 million total users** by July 2025 (just before the August disclosure). [TechCrunch / SearchResults-General]
- Copilot is deployed at approximately **90% of Fortune 100 companies** and over 50,000 organizations. [SearchResults-General]
- Agent Mode was introduced in February 2025 and was in active use across the developer community. It is **not on by default** — it must be explicitly enabled. However, `chat.tools.autoApprove` specifically does not need to be pre-enabled by the victim; the exploit *creates* that setting.
- No statistics are publicly available on the percentage of Copilot users who had Agent Mode enabled at the time of disclosure.
- The vulnerability affects users who use Copilot in Agent Mode *and* interact with content from untrusted sources (PRs, issues, web fetches) — a common workflow for many developers.

---

## Damage Assessment

### Actual Damage (Documented)
- **No confirmed in-the-wild exploitation** reported. Exploitation was demonstrated in controlled researcher proof-of-concept environments. [Wiz, SearchResults-General]
- CISA KEV listing: **No** — not added to Known Exploited Vulnerabilities catalog. [Wiz]
- EPSS score: **1.4 (80.4th percentile)** — statistically elevated exploitation probability relative to the CVE universe. [Wiz]

### Potential Damage (Near-Miss Assessment)
- Any developer using Copilot Agent Mode and reviewing a PR from a malicious contributor is a potential victim. This is routine developer workflow — reviewing third-party PRs on open-source projects is normal practice for millions of developers.
- If exploited at scale: **supply chain compromise** across hundreds or thousands of software projects, since developers' machines are the origin point of software releases, signing keys, and cloud deployments.
- Worm propagation means a single successful compromise could propagate silently through an organization's entire development team.
- The Fortune 100 deployment footprint means that enterprise developers at major corporations — with access to internal codebases, cloud infrastructure, and proprietary secrets — are within the blast radius.
- The "AI Kill Chain" pattern (prompt injection → confused deputy → automatic tool invocation) is described by Simon Willison as representing systems that "should not be built at all" without robust injection defenses. [Willison]

---

## Vendor Response

### Timeline
| Date | Event |
|------|-------|
| ~March 2025 | `chat.tools.autoApprove` introduced in VS Code v1.99 (experimental) |
| June 29, 2025 | Rehberger reports to MSRC via responsible disclosure |
| June 29, 2025 | MSRC confirms the issue was already being tracked internally (suggesting prior report from Vernier/Marzuk) |
| August 12, 2025 | Patch Tuesday — Microsoft ships fix; CVE-2025-53773 published; Rehberger's blog post goes live |
| August 15, 2025 | Simon Willison publishes broader context piece; NVD last modified |

### Patch Details
- **CVE:** CVE-2025-53773
- **CVSS v3.1 Score:** 7.8 (HIGH)
- **CVSS Vector:** AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H
- **CWE:** CWE-77 (Improper Neutralization of Special Elements used in a Command)
- **Fix mechanism:** The August 2025 patch requires explicit user approval for any configuration change affecting security settings. This prevents Copilot from silently writing `chat.tools.autoApprove: true` to settings files. [SearchResults-General, VSCode-1.104]
- **VS Code v1.104 additional hardening:** Setting renamed to `chat.tools.global.autoApprove`; scary-looking warning added on first activation; no automatic migration of old setting (intentional friction). Internet fetch via curl/wget/Invoke-WebRequest now triggers a warning as a common prompt injection vector. [VSCode-1.104]
- **Visual Studio 2022 fix:** Version 17.14.12. [Rapid7]

### Acknowledgments (per MSRC/Rehberger)
- Johann Rehberger (Embrace The Red) — primary discoverer
- Markus Vernier (Persistent Security) — independent co-discoverer
- Ari Marzuk — independent co-discoverer
[Rehberger-Primary, SearchResults-General]

### CVE Record
- Published: August 12, 2025
- Source: Microsoft Corporation
- NVD: https://nvd.nist.gov/vuln/detail/CVE-2025-53773
- MSRC: https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-53773

---

## Classification Assessment

### actual_vs_potential
**`near-miss`** — No confirmed in-the-wild exploitation. Three independent researchers discovered the vulnerability through security research, not through observing active attacks. CISA did not add it to KEV. Exploitation was demonstrated via PoC only. The gap between actual (zero known victims) and potential (millions of developers, supply chain cascade) is extreme.

### Severity Reasoning
Despite the near-miss classification, severity is HIGH for the following reasons:
1. **Attack surface is enormous:** 20M Copilot users, routine workflow (PR review), no special victim configuration required beyond using Agent Mode.
2. **Zero victim privileges required:** The attacker only needs to submit a PR or issue with a hidden payload. No authentication to victim systems needed.
3. **Wormable:** Self-propagating through shared repositories — unlike most vulnerabilities which require attacker action per victim.
4. **Supply chain multiplier:** Compromising developer machines compounds into downstream software integrity risks.
5. **EPSS 80th percentile:** Statistical models assessed it as significantly more likely to be exploited than average.

### Pattern Group
- Primary: `enterprise-copilot-prompt-injection-exfiltration`
- Sub-pattern: `agent-permission-escalation` (the distinguishing mechanic — not just data exfiltration but self-modifying permissions)
- Also fits: `ai-worm-propagation` (self-replicating via repository commits)

### Agent Mode Default Status
Agent Mode is **NOT enabled by default** in VS Code. It requires user opt-in. `chat.tools.autoApprove` is also not pre-enabled — the exploit *creates* this setting. This slightly reduces the attack surface compared to a fully default-on configuration, but does not meaningfully limit real-world risk given how widely Agent Mode was adopted by mid-2025.

---

## Related Incidents

| Incident ID | Title | Relationship |
|-------------|-------|-------------|
| AAGF-2026-024 | AgentFlayer — Enterprise Copilot Prompt Injection Exfiltration | Same class: enterprise Copilot, prompt injection vector. AgentFlayer focuses on data exfiltration; this incident adds permission escalation and RCE. Same pattern group. |
| AAGF-2026-014 | CamoLeak — GitHub Copilot Chat CVE-2025-59145 | Same platform (GitHub Copilot/VS Code). CamoLeak is exfiltration via Markdown image rendering; this incident is RCE via config manipulation. Both are prompt injection in Copilot. Distinguish: different CVEs, different exploit primitives. |
| AAGF-2026-031 | MCP Issue Body Injection | Same indirect prompt injection surface (issue/PR body content feeds agent context). MCP-specific; this incident is VS Code Copilot. Structural parallel in injection vector. |

**Distinguishing features of AAGF-2026-044 vs. related incidents:**
- It is the first documented case of AI-agent **self-modifying its own permission settings** (not just exfiltrating data or executing pre-existing capabilities)
- It is the first Copilot incident to be characterized as **wormable** via repository propagation
- Three independent researchers found it simultaneously, suggesting the attack surface was obvious once researchers started looking at Agent Mode systematically

**Broader context (Willison):** This incident is part of Johann Rehberger's "Month of AI Bugs" (August 2025), in which he published one AI agent vulnerability per day across ChatGPT, Codex, Anthropic MCPs, Cursor, Amp, Devin, OpenHands, Claude Code, GitHub Copilot, and Google Jules. The VentureBeat "Six Exploits" article characterized the August 2025 wave as demonstrating that attackers target credentials and configuration, not the model weights themselves. [Willison, VentureBeat]

---

## Additional Sources Found

All sources consulted during research:

- https://embracethered.com/blog/posts/2025/github-copilot-remote-code-execution-via-prompt-injection/ — Primary technical writeup [fetched]
- https://nvd.nist.gov/vuln/detail/CVE-2025-53773 — NVD CVE record [fetched]
- https://www.persistent-security.net/post/part-iii-vscode-copilot-wormable-command-execution-via-prompt-injection — Vernier independent discovery [fetch returned Wix JS shell only; details from search snippets]
- https://simonwillison.net/2025/Aug/15/the-summer-of-johann/ — Broader context [fetched]
- https://www.wiz.io/vulnerability-database/cve/cve-2025-53773 — EPSS score, exploitability assessment [fetched]
- https://www.rapid7.com/db/vulnerabilities/microsoft-visual_studio-cve-2025-53773/ — Version range, patch version [fetched]
- https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-53773 — MSRC advisory [fetch returned JS skeleton only; details from NVD/search]
- https://code.visualstudio.com/updates/v1_104 — VS Code August release notes, security changes [fetched]
- https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them — VentureBeat "Six Exploits" [rate-limited 429; details from search snippet]
- https://gbhackers.com/github-copilot-rce-vulnerability/ — GBHackers coverage [fetch returned JS skeleton; date confirmed as August 13, 2025]
- https://cybersecuritynews.com/github-copilot-rce-vulnerability/ — CyberSecurityNews, August 14, 2025 [fetched; minimal content]
- https://www.sans.org/newsletters/newsbites/xxvii-45 — SANS NewsBites (covered EchoLeak, not CVE-2025-53773 directly) [fetched]
- https://securityboulevard.com/2025/08/microsofts-august-2025-patch-tuesday-addresses-107-cves-cve-2025-53779/ — August Patch Tuesday overview [403 blocked]
- https://isc.sans.edu/diary/Microsoft+August+2025+Patch+Tuesday/32192/ — SANS ISC Patch Tuesday [not fetched; referenced in search results]
- https://www.cve.org/CVERecord?id=CVE-2025-53773 — Official CVE record [not separately fetched; NVD used as equivalent]
- https://feedly.com/cve/CVE-2025-53773 — Feedly CVE feed [not fetched]
- https://github.com/Ashwesker/Ashwesker-CVE-2025-53773 — PoC repository [not fetched]
- https://github.com/B1ack4sh/Blackash-CVE-2025-53773 — PoC repository [not fetched]
- https://visualstudiomagazine.com/articles/2025/04/04/vs-code-v1-99-is-all-about-copilot-chat.aspx — v1.99 feature introduction context [referenced via search]
- https://github.com/microsoft/vscode/issues/253039 — "Add a big warning to chat.tools.autoApprove" issue [referenced via search]
- https://news.ycombinator.com/item?id=44883108 — Hacker News discussion thread [not fetched]
- https://techcrunch.com/2025/07/30/github-copilot-crosses-20-million-all-time-users/ — 20M user milestone [referenced via search]

**In-the-wild exploitation:** No reports found across all sources consulted. CISA KEV: not listed. Classification as `near-miss` is well-supported.

**PoC exploit code:** Public PoC repositories exist on GitHub (Ashwesker-CVE-2025-53773, Blackash-CVE-2025-53773) as of research date, raising exploitation risk post-disclosure. Not fetched/analyzed for this research document.
