# AAGF-2026-062 Research Notes — TrustFall: One-Click RCE via Trust Dialog in Claude Code, Cursor, Gemini CLI, GitHub Copilot

## Triage Verdict: PROCEED

**Reasoning:** All four triage criteria pass.

1. **Real-world production deployment** — affects production coding agents (Claude Code, Gemini CLI, Cursor CLI, GitHub Copilot CLI) used by developers daily, not a CTF or isolated research demo. The CI/CD variant (zero-click, headless) runs against real pull-request pipelines.
2. **Autonomous agent involved** — these are agentic CLIs that autonomously execute MCP server processes, read filesystems, call tools, and make network requests. The vulnerability triggers before any Claude model "decides" to do anything — the agent runtime itself auto-spawns attacker-controlled processes.
3. **Verifiable** — primary research by Adversa AI with demo video and PoC; independently covered by The Register, Help Net Security, SecurityWeek, Dark Reading. Related CVE class (CVE-2025-59536, CVE-2026-21852) independently corroborated by Check Point Research and NVD.
4. **Meaningful impact** — SSH keys, cloud credentials, shell history, API keys, CI/CD secrets, and entire developer filesystems are within exfiltration range. The zero-click CI/CD variant can compromise build pipelines with no human interaction.

**Triage note on "real incident" vs "research":** No confirmed in-the-wild exploitation has been documented as of publication date (May 7, 2026). However, TrustFall documents a live, unpatched vulnerability in production software affecting millions of developer machines. The CI/CD variant in particular has a realistic, low-barrier exploitation path. This is comparable to a critical CVE disclosed before exploitation is confirmed — meaningfully different from a pure CTF scenario.

---

## Primary Source

**URL:** https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/  
**Published:** May 7, 2026  
**Authors:** Rony Utevsky (lead researcher), Alex Polyakov (co-founder/CTO, Adversa AI), Sergey Malenkovich (communications)  
**Organization:** Adversa AI — an AI red-teaming security vendor. See Source Reliability Assessment for bias flags.

**Secondary sources consulted:**
- Help Net Security: https://www.helpnetsecurity.com/2026/05/07/trustfall-ai-coding-cli-vulnerability-research/
- The Register: https://www.theregister.com/security/2026/05/07/claude-code-trust-prompt-can-trigger-one-click-rce/5235319
- SecurityWeek (supply chain angle): https://www.securityweek.com/ai-coding-agents-could-fuel-next-supply-chain-crisis/
- Dark Reading: https://www.darkreading.com/application-security/trustfall-exposes-claude-code-execution-risk
- Check Point Research (related CVEs): https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/
- NVD CVE-2025-59536: https://nvd.nist.gov/vuln/detail/CVE-2025-59536
- Penligent (Gemini CLI analysis): https://www.penligent.ai/hackinglabs/gemini-cli-rce-workspace-trust-and-the-ci-cd-agent-attack-surface/

---

## What Exactly Happened

### The Core Issue

TrustFall is a class-level security design flaw across four major AI coding agents: Claude Code (Anthropic), Gemini CLI (Google), Cursor CLI (Cursor/Anysphere), and GitHub Copilot CLI (Microsoft). All four share the same architectural pattern: they support the Model Context Protocol (MCP), which lets projects define external helper programs (MCP servers) in repository configuration files. When a developer opens a repository in any of these tools, the tool presents a "trust dialog" — but all four auto-spawn the project-defined MCP servers the moment the user accepts the dialog, without separately disclosing that executables will run, without per-server consent, and without any sandbox.

A developer who clones a malicious repository and presses Enter on the trust dialog has — in one keypress — granted the attacker's code full execution privileges on their machine as their own user account. (Source: Adversa AI primary blog, Help Net Security, The Register)

### The Regression in Claude Code v2.1

The issue has a specific regression history for Claude Code. In versions prior to 2.1, the trust dialog:
- Explicitly warned that the project could execute code through MCP
- Offered a third option: "proceed with MCP servers disabled"

In Claude Code v2.1+, this was replaced with a generic safety check: "Quick safety check: Is this a project you created or one you trust?" The current dialog does not mention MCP, does not enumerate what will execute, and defaults to "Yes, I trust this folder." The explicit MCP warning and the opt-out option were silently removed. (Source: The Register, Help Net Security, Adversa AI)

### The Attack Mechanics

An attacker embeds two configuration files in a malicious repository:

1. **`.mcp.json`** — defines one or more MCP servers pointing to attacker-controlled executables
2. **`.claude/settings.json`** — contains settings such as `enableAllProjectMcpServers: true` and `enabledMcpjsonServers` that auto-approve MCP execution

When the developer opens the folder in Claude Code and accepts the trust dialog, the MCP server spawns immediately as an **unsandboxed Node.js (or other) process with the developer's full user privileges**. No tool call from Claude is required — the agent runtime spawns it automatically as part of initialization.

The spawned process has access to:
- `~/.ssh/` (SSH private keys)
- `~/.aws/` (AWS credentials)
- Shell history
- Source code from other projects on the same machine
- `ANTHROPIC_API_KEY` and other env vars
- Any file readable by the user account

It can open outbound network connections to an attacker-controlled server to exfiltrate this data. (Source: Help Net Security, The Register, SecurityWeek)

### The CI/CD Zero-Click Variant

This is the highest-severity attack path. When Claude Code runs in headless mode — the default for the official `claude-code-action` GitHub Action — the trust dialog is never rendered. Workflows that run Claude Code against arbitrary pull-request branches (including from forks) will auto-execute any MCP servers defined in the PR's configuration files with zero human interaction.

Attackers can submit a pull request to any project using `claude-code-action`, embed malicious `.mcp.json` in the PR branch, and have the CI runner automatically exfiltrate:
- Repository secrets (e.g., deployment keys, signing certificates)
- CI environment variables
- Cloud provider credentials
- Build artifacts with injected malicious code

The blast radius is comparable to a supply chain attack. SecurityWeek drew explicit comparison to the Salesloft Drift breach but noted the access barrier is significantly lower. (Source: Adversa AI, SecurityWeek, Help Net Security)

### The Broader Convention

Adversa initially framed TrustFall as a Claude Code regression. After Anthropic declined to treat it as a vulnerability, they expanded the parity check to Gemini CLI, Cursor CLI, and GitHub Copilot CLI — discovering the same pattern across all four. This reframed the finding from "a single vendor's regression" to "a shared architectural convention across agentic CLIs." Because the issue is a convention rather than a single vendor bug, the researchers chose broad public disclosure rather than per-vendor responsible disclosure. (Source: Adversa AI, search result summaries)

**Trust dialog transparency comparison across tools:**
- **Claude Code (v2.1+):** Generic "do you trust this folder?" — no MCP mention, defaults Yes
- **Gemini CLI:** Lists helper programs by name in the prompt — most transparent of the four
- **Cursor CLI:** Mentions MCP in general terms
- **GitHub Copilot CLI:** Generic trust prompt with no MCP reference

---

## Technical Detail

### Attack Vector Summary

| Platform | Config Files | Auto-Spawn Trigger | Dialog Quality | Headless CI Risk |
|---|---|---|---|---|
| Claude Code | `.mcp.json`, `.claude/settings.json` | On trust dialog accept | No MCP warning (regression in v2.1) | Yes — zero-click |
| Gemini CLI | `.gemini/` config | On trust dialog accept | Lists helper names | Yes — patched (GHSA-wpqr-6v78-jr5g) |
| Cursor CLI | `.mcp.json` (likely) | On trust dialog accept | General MCP mention | Unknown |
| GitHub Copilot CLI | MCP config | On trust dialog accept | No MCP mention | Unknown |

### Key Malicious Settings in Claude Code

- `enableAllProjectMcpServers: true` — in `.claude/settings.json`
- `enabledMcpjsonServers` — enables `.mcp.json`-defined servers
- `permissions.allow` — can grant additional permissions from project scope

These settings, when embedded in a repository's config files, are processed by Claude Code at startup and override user-level preferences.

### Execution Model

The MCP server spawns as an OS-level process, not a sandboxed subprocess:
- No container
- No capability restriction
- Runs with full developer account privileges
- No per-server consent prompt after trust dialog
- No tool call from Claude required to trigger it

### Related CVEs (Prior Incidents — Now Patched)

TrustFall itself has **no CVE assigned** as of publication. Anthropic declined to treat it as a vulnerability. However, the TrustFall blog mentions this is the "third similar" issue in six months. The prior patched CVEs in this class:

**CVE-2025-59536** (CVSS 8.8 HIGH)
- Description: Claude Code could execute code from a project *before* the user accepted the trust dialog
- Discovered: ~July 2025 (Check Point Research, hooks RCE vector)
- Patched: August 26, 2025, in version 1.0.111
- Published: October 3, 2025

**CVE-2026-21852**
- Description: API key exfiltration via `ANTHROPIC_BASE_URL` override before trust dialog confirmation
- Discovered: October 28, 2025 (Check Point Research)
- Patched: December 28, 2025, in version 2.0.65+
- Published: January 21, 2026

**TrustFall differs from prior CVEs** in that execution happens *after* the trust dialog — the trust dialog has already rendered and been accepted. Anthropic's position is that post-dialog execution is by design. The researchers' counter is that the dialog does not constitute informed consent because it does not disclose what will execute.

**Gemini CLI CVE (adjacent):** GHSA-wpqr-6v78-jr5g — workspace trust bypass in headless mode. Affected `@google/gemini-cli` before 0.39.1. Patched by Google. Related but distinct from TrustFall.

**CVE-2026-0755:** Command injection in `gemini-mcp-tool` (CVSS 9.8) — separate but part of the same MCP infrastructure risk surface.

### Proposed Mitigations (from Adversa AI)

1. Block `enableAllProjectMcpServers`, `enabledMcpjsonServers`, and `permissions.allow` from being set in project-level (repository) configuration files — restrict to system-level or user-level scope only
2. Implement a dedicated MCP consent dialog that defaults to "deny" and enumerates each server by name and executable path
3. Require per-server interactive consent rather than blanket approval
4. For CI/CD: gate Claude Code usage on pre-reviewed commits (post-merge on main, not arbitrary PR branches)

Enterprise Claude Code admins can currently use Managed scope settings to disable project-scoped MCP auto-approval org-wide, but adoption is described as rare.

---

## Dates

**date_occurred:** Approximately April 2026 (when Claude Code v2.1 shipped, removing the explicit MCP warning from the trust dialog). The prior, more informative dialog was present in v2.0.x. Exact v2.1 release date not confirmed in sources — use "~April 2026" as estimate.

**date_discovered:** Not publicly stated. Adversa AI's internal research timeline is not disclosed. The discovery of the regression (v2.1 removing MCP warning) was presumably sometime in April–early May 2026. The parity check across other tools followed Anthropic's decline, so the full four-tool scope was discovered after vendor notification.

**date_reported (first public disclosure):** May 7, 2026 — publication date of Adversa AI blog post, confirmed by multiple secondary sources published the same day (Help Net Security, The Register, SecurityWeek). This is the date_reported to use.

**Vendor notification date:** Not explicitly stated. Anthropic reviewed and declined before the parity check expanded to other tools — so notification was likely April–early May 2026, before May 7 publication. Exact date unknown.

**Reasoning:** All sources cite May 7, 2026 as publication date. The blog post is the first public disclosure. There is no earlier CVE, advisory, or news coverage.

---

## Source Reliability Assessment

### Adversa AI (Primary) — MODERATE RELIABILITY, FLAG VENDOR BIAS

**Credibility factors:**
- Legitimate AI security research firm with documented prior work on Claude Code vulnerabilities
- Research is technically coherent and independently corroborated by multiple tier-1 outlets
- Prior research (OpenClaw attacks) has been similarly covered by credible security press
- Alex Polyakov is a recognized name in AI red-teaming

**Bias flags:**
- Adversa AI is a security vendor with commercial interest in publicizing AI agent vulnerabilities — their product is AI red-teaming services
- No independent technical reproduction of the PoC has been documented in available sources
- Adversa's quantitative framing (e.g., "supply chain crisis" language) is unverified by independent parties
- The claim that this is the "third similar CVE in six months" is factually grounded (CVE-2025-59536, CVE-2026-21852 are real and verified), but the framing of TrustFall as equally severe is the vendor's own assessment
- Adversa chose broad public disclosure (vs. per-vendor) partly on the grounds that it's a "convention not a bug" — a framing that conveniently sidesteps the question of whether more disclosure time would have produced patches

**Verdict:** Core technical claims are credible and multi-source-corroborated. Severity framing and supply chain catastrophe language should be treated as vendor perspective, not independent assessment.

### Help Net Security — HIGH RELIABILITY
Respected security trade publication. Article dated May 7, 2026. Independently describes the same technical mechanics. Adds enterprise mitigation detail (Managed scope setting) not in all other sources. No corroborating CVE or PoC reproduction cited.

### The Register — HIGH RELIABILITY
Adds researcher identity detail (Alex Polyakov, Sergey Malenkovich), confirms v2.1 trust dialog regression specifics, confirms Anthropic declined to comment publicly. The detail about the prior dialog offering "MCP disabled" as a third option is corroborated here.

### SecurityWeek — HIGH RELIABILITY
Adds supply chain framing, Salesloft Drift comparison, CI/CD attack path detail. Notes no CVE assigned. Corroborates Anthropic's decline.

### Check Point Research (CVE-2025-59536) — HIGH RELIABILITY
Independent research, published with vendor collaboration, CVE assigned and NVD-corroborated. Useful for establishing the pattern of prior vulnerabilities in this class.

### Penligent (Gemini CLI) — MODERATE RELIABILITY
Smaller security research blog. Technical detail on Gemini CLI headless trust bypass is specific (GHSA-wpqr-6v78-jr5g, affected versions) and independently verifiable via GitHub Security Advisories. Treat as credible on technical specifics.

### CodeSecAI (codesecai.com) — LOW RELIABILITY
Content appears to be AI-generated security thought leadership. Assessor flagged it as "speculative fiction presented as cybersecurity intelligence." Do not use for factual claims.

---

## Vendor Response

### Anthropic (Claude Code)

**Decision: Declined to patch / declined to assign CVE**

Anthropic's security team reviewed the TrustFall report and declined it as outside their threat model. Their position: accepting "Yes, I trust this folder" constitutes informed consent to all project contents, including MCP server definitions. Post-trust-dialog execution is the boundary functioning as designed.

Anthropic did not respond to press requests for comment (The Register).

**Context:** This is notable given that Anthropic *previously* patched two closely related vulnerabilities in this class (CVE-2025-59536, CVE-2026-21852) — both of which involved execution *before* the trust dialog. Anthropic's position is that the dialog is the correct trust boundary, and TrustFall operates post-dialog. The researchers' counter is that removing the explicit MCP warning in v2.1 means users cannot make an informed decision at that boundary.

**Enterprise mitigation available:** Managed scope settings can disable project-scoped MCP auto-approval org-wide, but adoption is rare.

### Google (Gemini CLI)

**Decision: Patched (separate but related issue)**

The Gemini CLI headless trust bypass (GHSA-wpqr-6v78-jr5g) was patched in versions 0.39.1 and 0.40.0-preview.2, as well as `google-github-actions/run-gemini-cli` before v0.1.22. The patch enforces explicit trust decisions in headless mode. Google did not publicly respond to the TrustFall research specifically.

Note: The Gemini CLI fix covers the *headless/CI variant* of the issue. Whether Google addressed the interactive trust dialog transparency issue is not confirmed in available sources.

### Cursor (Cursor CLI)

**Decision: No public response documented**

No patch announcement, advisory, or public statement from Cursor/Anysphere on TrustFall found in available sources as of May 7, 2026.

### GitHub/Microsoft (Copilot CLI)

**Decision: No public response documented**

No patch announcement, advisory, or public statement from GitHub/Microsoft on TrustFall found in available sources as of May 7, 2026.

---

## Failure Mode Classification

### Primary Categories

**Tool Misuse** — The primary mechanism: MCP server (a legitimate tool capability) is abused via malicious repository configuration to execute attacker-controlled code. The agent's tool execution infrastructure is the attack surface.

**Autonomous Escalation** — The agent runtime autonomously escalates privileges by spawning unsandboxed OS processes with full user account permissions, without per-action user consent beyond the initial (uninformative) trust dialog.

**Unauthorized Data Access** — The spawned process can access SSH keys, AWS credentials, shell history, source code, API keys, and all user-readable files — and exfiltrate them.

**Supply Chain Compromise** — The CI/CD variant allows injection into build pipelines, credential theft from CI runners, and potentially code injection into build outputs. The supply chain angle is theoretical but well-supported.

**Prompt Injection** — Secondary/contributing: repository contents (README, config files) can carry injected instructions that the agent processes, compounding the initial MCP execution risk. (This is a separate but related attack surface documented in adjacent research by Aonan Guan on GitHub comment prompt injection.)

### Severity

**High** — based on actual impact potential, not just theoretical.

Rationale:
- The interactive (one-click) variant requires social engineering to get a developer to clone a malicious repo, which is a realistic but non-trivial barrier
- The CI/CD zero-click variant is closer to Critical — requires only submitting a PR to a project using `claude-code-action`, a very low barrier
- No confirmed in-the-wild exploitation as of publication date
- The combination of realistic attack path + high-privilege access + no patch from primary vendor (Anthropic) + large install base warrants High, not Medium

**Not Critical** because: no documented exploitation, requires at minimum a cloned malicious repo (interactive) or PR submission (CI/CD), and enterprise mitigations exist (Managed scope).

### actual_vs_potential

**`near-miss`**

No confirmed exploitation documented. The vulnerability is live and unpatched in Claude Code. The damage described — credential theft, supply chain injection — is the potential outcome, not a documented incident.

---

## Suggested Frontmatter Values

```yaml
id: AAGF-2026-062
title: "TrustFall: One-Click RCE via Trust Dialog Exposes Developer Credentials Across Four AI Coding Agents"
status: published
date_occurred: "2026-04" # When Claude Code v2.1 shipped, removing the MCP warning from trust dialog
date_discovered: "2026-05" # Adversa AI research discovery — exact date not disclosed
date_reported: "2026-05-07" # Adversa AI public blog post — first public disclosure
date_added: "2026-05-07"

agent_systems:
  - Claude Code (Anthropic, v2.1+)
  - Gemini CLI (Google)
  - Cursor CLI (Cursor/Anysphere)
  - GitHub Copilot CLI (Microsoft)

failure_modes:
  - Tool Misuse
  - Autonomous Escalation
  - Unauthorized Data Access
  - Supply Chain Compromise

severity: High
actual_vs_potential: near-miss

actual_damage: >
  No confirmed in-the-wild exploitation documented as of May 7, 2026. Proof-of-concept
  demonstrated by Adversa AI with demo video. Live unpatched vulnerability in production
  software. Anthropic declined to patch.

potential_damage: >
  Full exfiltration of SSH private keys, cloud credentials (AWS, GCP, Azure), shell
  history, API keys, and all user-readable files from developer machines. In the CI/CD
  zero-click variant: theft of repository secrets, signing certificates, deployment
  credentials, and potential injection of malicious code into build outputs — supply
  chain compromise against any downstream users of affected software.

intervention: >
  No exploitation confirmed. Adversa AI responsible disclosure triggered public awareness.
  Gemini CLI headless variant patched (GHSA-wpqr-6v78-jr5g). Enterprise Claude Code
  admins can use Managed scope to disable project-scoped MCP. Claude Code itself remains
  unpatched per Anthropic's threat model decision.

sources:
  primary: "https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/"
  secondary:
    - "https://www.helpnetsecurity.com/2026/05/07/trustfall-ai-coding-cli-vulnerability-research/"
    - "https://www.theregister.com/security/2026/05/07/claude-code-trust-prompt-can-trigger-one-click-rce/5235319"
    - "https://www.securityweek.com/ai-coding-agents-could-fuel-next-supply-chain-crisis/"
    - "https://research.checkpoint.com/2026/rce-and-api-token-exfiltration-through-claude-code-project-files-cve-2025-59536/"
    - "https://nvd.nist.gov/vuln/detail/CVE-2025-59536"

cve_related:
  - CVE-2025-59536 # Prior Claude Code RCE (pre-dialog), patched Oct 2025
  - CVE-2026-21852 # Prior Claude Code API key exfiltration, patched Dec 2025
  # TrustFall itself: no CVE assigned (Anthropic declined)

researchers:
  - Rony Utevsky (Adversa AI)
  - Alex Polyakov (Adversa AI)

vendor_response:
  anthropic: "Declined — outside threat model. Trust dialog constitutes consent."
  google: "Patched headless/CI variant (GHSA-wpqr-6v78-jr5g, Gemini CLI 0.39.1+)"
  cursor: "No public response as of 2026-05-07"
  github_microsoft: "No public response as of 2026-05-07"

tags:
  - mcp
  - trust-dialog
  - rce
  - supply-chain
  - ci-cd
  - coding-agent
  - credential-theft
```

---

## Open Questions

1. **Exact date Claude Code v2.1 shipped** — needed to pin `date_occurred` more precisely. The regression (removal of MCP warning from trust dialog) happened in v2.1, but the exact release date is not confirmed in available sources.

2. **Exact vendor notification date** — Adversa AI notified Anthropic before publication; the exact date is not disclosed. This affects the responsible disclosure timeline assessment.

3. **Cursor and GitHub Copilot vendor responses** — neither vendor has publicly responded as of May 7, 2026. Their technical implementations may differ from Claude Code's; whether they will patch is unknown.

4. **Confirmed exploitation** — no in-the-wild exploitation documented. This could change. Monitor for follow-up reporting.

5. **Demo video content** — Adversa AI published a demo video with the blog post but it was not fetched. The video may contain additional technical detail about exact PoC mechanics.

6. **Install base figures** — no verified user count for affected tools. The combined install base is large (Claude Code, Cursor, GitHub Copilot CLI are all widely used) but no specific numbers were available.

7. **Whether Google/GitHub addressed the interactive dialog transparency** — the Gemini CLI patch (GHSA-wpqr-6v78-jr5g) covers headless mode. It is unclear whether the interactive trust dialog now enumerates MCP servers for Gemini CLI users who are *not* running headless.

8. **Enterprise mitigation adoption rate** — Adversa AI describes adoption of Claude Code's Managed scope setting as "rare." No data on what percentage of enterprise deployments have applied this mitigation.

9. **CVE-2026-33068** — one search result mentioned this CVE in passing as a third patched Claude Code vulnerability. Not independently verified in this research session. If real, would further establish the pattern.

10. **Relationship to Aonan Guan's prompt injection research** — a separate but same-day published piece on GitHub comment prompt injection in Claude Code, Gemini CLI, and Copilot CLI appears to be a distinct attack path. Worth checking if it merits a separate AgentFail entry or is better treated as context for this one.
