---
id: "AAGF-2026-073"
title: "Cursor IDE CVE-2026-26268 — Prompt-Injected Agent Writes Malicious Git Hooks, Bypassing Sandbox to Execute Attacker Code"
status: "reviewed"
date_occurred: "2026-02-13"   # First disclosure date used as proxy; actual attack date unknown (pre-Feb 13, 2026)
date_discovered: "2026-02-13" # Coordinated disclosure; exact internal discovery date not publicly stated
date_reported: "2026-02-13"   # NVD + GHSA-8pcm-8jpx-hv8r published by Cursor security lead (mcpeak/Travis McPeak)
date_curated: "2026-05-07"
date_council_reviewed: "2026-05-07"

# Classification
category:
  - "Prompt Injection"
  - "Autonomous Escalation"
  - "Infrastructure Damage"
severity: "high"
agent_type:
  - "Coding Assistant"
  - "Tool-Using Agent"
agent_name: "Cursor IDE AI Agent"
platform: "Cursor IDE (Anysphere) — macOS, Linux, Windows (WSL2)"
industry: "Software Development / Developer Tooling"

# Impact
financial_impact: "None documented — near-miss; no confirmed exploitation in the wild"
financial_impact_usd: null
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null                  # No confirmed victims
  scale: "widespread"          # 5M+ Cursor users were at risk
  data_types_exposed:
    - "credentials"
    - "source_code"

# Damage Timing
damage_speed: "unknown"        # Hook execution is instant once triggered; no confirmed exploitation
damage_duration: "4 days"      # Vulnerability window: Feb 13 (disclosure) to Feb 17 (patch)
total_damage_window: "4 days"  # Public exposure window before patch shipped

# Recovery
recovery_time: "not required"  # No confirmed victims
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: ""
full_recovery_achieved: "unknown"

# Business Impact
business_scope: "unknown"
business_criticality: "high"
business_criticality_notes: "Developer machine RCE in AI coding assistant context — access to SSH keys, cloud credentials, source code, and CI/CD pipeline injection. No confirmed exploitation but 5M+ users at theoretical risk during 4-day window."
systems_affected:
  - "source-code"
  - "ci-cd"
  - "credentials"
  - "developer-workstation"

# Vendor Response
vendor_response: "fixed"
vendor_response_time: "1-7 days"   # CVE published Feb 13; patch shipped Feb 17 (~4 days)

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: 50000000     # 5M users × $10K/machine × 0.001 probability weight
  averted_range_low: 5000000       # Conservative: 0.1% exploitation rate, 100K affected machines
  averted_range_high: 500000000    # Aggressive: 1% exploitation rate, full user base
  composite_damage_usd: 50000000
  confidence: "estimated"
  probability_weight: 0.001        # Near-miss; patched in 4 days; no PoC circulating publicly; requires specific setup
  methodology: "5M Cursor users × $10K/machine (IBM CODB 2024 developer workstation compromise) × 0.001 exploitation probability weight"
  methodology_detail:
    per_unit_cost_usd: 10000
    unit_count: 5000000
    unit_type: "user"
    multiplier: null
    benchmark_source: "IBM 2024 Cost of Data Breach Report"
  estimation_date: "2026-05-07"
  human_override: false
  notes: "Probability weight set at 0.001 (near-miss conditions: 4-day patch window, no public PoC, requires social engineering to open malicious repo, coordinated disclosure before broad awareness). NIST CVSS 9.9 CRITICAL reflects theoretical worst case; CNA CVSS 8.0 HIGH reflects actual attack bar. Averted damage figure should be read as order-of-magnitude orientation, not precise estimate."

# Presentation
headline_stat: "AGENTS.md — the file designed to guide AI behavior — became the injection vector: one malicious repo primes Cursor's agent to write a backdoor Git hook that executes on the next git operation"
operator_tldr: "Audit your agent sandbox's filesystem deny-list: if it doesn't explicitly block writes to .git/hooks/ and .git/config, a prompt-injected agent can plant persistent backdoors that survive sandbox teardown and fire on every subsequent git operation."
containment_method: "third_party"  # Researchers (Novee, Teixeira, Tsukerman) performed coordinated disclosure; Cursor patched within 4 days
public_attention: "medium"

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0051"       # LLM Prompt Injection — parent technique
    - "AML.T0051.001"   # Indirect Prompt Injection — via AGENTS.md (external repo content)
    - "AML.T0053"       # AI Agent Tool Invocation — agent autonomously runs git operations
    - "AML.T0105"       # Escape to Host — hook execution escapes agent sandbox to host OS
    - "AML.T0112"       # Machine Compromise — developer workstation RCE
    - "AML.T0112.000"   # Local AI Agent — local agent achieves full compromise
    - "AML.T0083"       # Credentials from AI Agent Configuration — AGENTS.md as config attack surface
    - "AML.T0055"       # Unsecured Credentials — SSH keys / cloud creds accessible post-RCE
  owasp_llm:
    - "LLM01:2025"      # Prompt Injection — AGENTS.md injection vector
    - "LLM06:2025"      # Excessive Agency — agent autonomously executes git ops without per-operation approval
    - "LLM05:2025"      # Improper Output Handling — agent writes attacker-controlled content to filesystem
  owasp_agentic:
    - "ASI01:2026"      # Agent Goal Hijack — AGENTS.md redirects agent objectives
    - "ASI02:2026"      # Tool Misuse and Exploitation — git operations weaponized
    - "ASI05:2026"      # Unexpected Code Execution — hook fires outside sandbox
  ttps_ai:
    - "2.5.5"           # LLM Prompt Injection — parent technique
    - "2.5.9"           # Indirect Prompt Injection — via retrieved/read content (AGENTS.md)
    - "2.5.4"           # AI Agent Tool Invocation — autonomous git execution
    - "2.6"             # Persistence — hook persists after agent session ends
    - "2.7"             # Privilege Escalation — host OS access via hook exceeds sandbox privileges
    - "2.16"            # Impact — RCE, credential access, supply chain injection

# Relationships
related_incidents:
  - "AAGF-2026-043"   # TrustFall (Claude Code CVE-2026-33068) — same pattern: repo config file weaponizes agent autonomy → RCE
  - "AAGF-2026-062"   # TrustFall Adversa AI replication — independent confirmation of config-file trust abuse
  - "AAGF-2026-066"   # Gemini CLI CVSS 10.0 — .gemini/ config dirs execute before sandbox initializes; same root cause class
  - "AAGF-2026-067"   # hackerbot-claw — contrasting pattern: agent as attacker vs. agent as victim/vector
pattern_group: "coding-agent-config-trust"
tags:
  - "prompt-injection"
  - "sandbox-escape"
  - "git-hooks"
  - "rce"
  - "cve"
  - "cursor"
  - "agentic-rce"
  - "AGENTS.md"
  - "developer-tooling"
  - "near-miss"
  - "coordinated-disclosure"
  - "cwe-862"

# Metadata
sources:
  - url: "https://nvd.nist.gov/vuln/detail/CVE-2026-26268"
    label: "NVD CVE-2026-26268"
    type: "primary"
    confidence: "high"
    date: "2026-02-18"
  - url: "https://github.com/cursor/cursor/security/advisories/GHSA-8pcm-8jpx-hv8r"
    label: "GitHub Security Advisory GHSA-8pcm-8jpx-hv8r"
    type: "primary"
    confidence: "high"
    date: "2026-02-13"
  - url: "https://www.cursor.com/blog/agent-sandboxing"
    label: "Cursor Agent Sandboxing Blog Post"
    type: "primary"
    confidence: "high"
    date: "2026-02-18"
  - url: "https://cisomandate.com/blog/when-the-tool-fights-back"
    label: "When the Tool Fights Back (cisomandate.com)"
    type: "secondary"
    confidence: "medium"
    date: "2026-05-04"
  - url: "https://github.com/dhawaldesai/agentic-ioc-scanner"
    label: "agentic-ioc-scanner §9 (community IOC detection kit)"
    type: "secondary"
    confidence: "medium"
    date: "2026-02-18"
  - url: "https://www.cursor.com/changelog"
    label: "Cursor Changelog (version history context)"
    type: "supporting"
    confidence: "high"
    date: "2026-02-17"
researcher_notes: "CVSS discrepancy: NIST 9.9 CRITICAL (AC:L, PR:L) vs. Anysphere CNA 8.0 HIGH (AC:H, PR:H). CNA is more defensible for the actual attack scenario — attacker must control a repository the developer opens (social engineering prerequisite). NIST captures theoretical worst case. Severity field is set to 'high' (matching CNA and actual-impact framing: near-miss, no confirmed victims). Assaf Levkovich is named in cisomandate.com but NOT in official GHSA credits — treated as unconfirmed; using only GHSA-credited researchers. The version 2.2.5 patch reference in cisomandate.com contradicts GHSA/NVD (both state < 2.5 / fixed in 2.5); official sources take precedence. Open question: whether the sandbox (Seatbelt/Landlock) was entirely new in 2.5 or was pre-existing with missing deny rules — the Feb 18 blog post language ('new sandbox implementation') suggests the former, but prior changelogs mention sandbox behavior changes as far back as 2.2."
council_verdict: "approve-with-notes"
---

# Cursor IDE CVE-2026-26268 — Prompt-Injected Agent Writes Malicious Git Hooks, Bypassing Sandbox to Execute Attacker Code

## Executive Summary

A critical vulnerability in Cursor IDE (CVE-2026-26268, CWE-862) allowed an attacker to plant a malicious `AGENTS.md` file in a git repository that, when processed by Cursor's AI agent, prompted the agent to write backdoor hook scripts into `.git/hooks/`. Because Cursor's pre-2.5 sandbox did not restrict agent writes to git internals, these hooks executed automatically on the developer's machine — outside the sandbox, with full OS-user privileges — the next time any git operation triggered them. The attack required no user interaction at the hook-execution stage; the developer only needed to open the attacker's repository. Researchers from Novee Security Research Team, Daniel Teixeira (Nvidia AI Red Team), and Philip Tsukerman disclosed the vulnerability through coordinated disclosure; Anysphere patched it in Cursor 2.5 within four days. No exploitation in the wild was confirmed.

---

## Timeline

| Date/Time | Event |
|-----------|-------|
| Pre-2026-02-13 | Vulnerability discovered; coordinated disclosure initiated with Anysphere |
| 2026-02-13 | CVE-2026-26268 published (NVD); GHSA-8pcm-8jpx-hv8r published by Travis McPeak (Cursor security lead) |
| 2026-02-17 | Cursor version 2.5 released — patch ships; sandbox deny rules block writes to `.git/hooks/` and `.git/config` |
| 2026-02-18 | NIST completes analysis; assigns CVSS 9.9 CRITICAL; Cursor publishes "Agent Sandboxing" blog documenting Seatbelt policy |
| 2026-05-04 | cisomandate.com publishes "When the Tool Fights Back" — contextualizes CVE-2026-26268 in the broader pattern of AI coding assistant RCE vectors |

---

## What Happened

Cursor is an AI-first IDE built on VS Code by Anysphere. Its AI agent can autonomously execute tasks: exploring a repository, running shell commands, executing git operations, writing and editing files — all without per-operation user approval. This autonomy is a core product feature; reducing approval friction was an explicit design goal.

The attack begins with a repository. An attacker creates — or compromises — a git repository and places a specially crafted `AGENTS.md` file at its root. `AGENTS.md` is a convention adopted by the agentic development ecosystem: tools like Cursor, Claude Code, Devin, and others recognize this file as a source of project-level instructions for the AI agent. It is the file *designed* to guide AI behavior — which made it the ideal injection vector.

When a developer opens the malicious repository in Cursor and the agent begins processing it (during any task that involves exploring the project, understanding its structure, or responding to a prompt in that workspace context), the agent reads `AGENTS.md`. The file contains crafted instructions that redirect the agent's behavior: directing it toward a bare git repository path or instructing it to perform git configuration operations. Because the agent treats `AGENTS.md` as authoritative project context — its intended purpose — it follows the embedded instructions.

Here the vulnerability materializes. Cursor's agent, prior to version 2.5, had no sandbox restriction on writes to `.git/config` or `.git/hooks/`. The prompt-injected agent writes a malicious hook script — typically targeting `post-checkout`, `post-merge`, `pre-commit`, or `post-rewrite` hook types — into the repository's `.git/hooks/` directory. An alternative vector uses `.git/config` to set `core.hooksPath` to an attacker-controlled directory, routing hook lookups outside the standard path.

At this point, the attack is staged. The hook now exists on the developer's filesystem.

The trigger requires no further user action. Git executes hooks automatically as part of its normal operation model. When Cursor's agent (or the developer) runs any git operation that fires the hook type written — `git checkout`, `git pull`, `git commit`, `git rebase` — the hook script executes. It runs in the host OS context: outside the Cursor sandbox, with the full filesystem and network permissions of the developer's user account.

The hook can fetch and execute arbitrary code, exfiltrate SSH keys and cloud credentials, inject malicious commits into the repository, or establish persistence via additional scheduled tasks or hooks. The developer's machine and everything it can reach — cloud environments, CI/CD pipelines, other repositories — is now accessible to the attacker.

The CVSS metric UI:N (User Interaction: None) accurately describes the hook execution stage: once planted, git executes the hook without any deliberate developer action. The attack does, however, require that the developer open the malicious repository and that Cursor's agent process it — a social engineering step, not a zero-click remote exploit.

Anysphere was informed through coordinated disclosure before the CVE was published. The patch shipped in Cursor 2.5 on February 17, 2026 — four days after public disclosure. No exploitation in the wild was confirmed during the window.

---

## Technical Analysis

### The AGENTS.md Vector

`AGENTS.md` occupies a uniquely privileged position in agentic coding tool workflows: it is the designated channel through which repository owners communicate instructions to AI agents. The Cursor agent reads it as trusted project context, not as user input subject to injection scrutiny. This elevated-trust treatment is the architectural prerequisite for the attack — it is what separates `AGENTS.md` from arbitrary file content the agent might read.

The injection payload in `AGENTS.md` instructs the agent to interact with a bare repository at an attacker-specified path, or to perform git configuration operations that write to `.git/config`. The exact payload structure required for reliable execution is not publicly documented (no PoC circulates), but the mechanism is clear: any instruction in `AGENTS.md` that causes the agent to write to `.git/hooks/` or modify `core.hooksPath` in `.git/config` exploits the vulnerability.

### The Sandbox Gap

Cursor's AI agent ran within a sandbox — macOS Seatbelt (sandbox-exec), Linux Landlock + seccomp, and equivalent WSL2 restrictions on Windows. These sandboxes constrain what the agent process can read, write, and execute. Prior to version 2.5, the sandbox policy had no explicit deny rules for writes to git internals.

The v2.4 changelog (January 2026) noted "Git writes are now allowed in sandboxes" — a feature addition intended to let the agent make legitimate git commits and edits. This change opened the path for the attack: the sandbox was configured to allow git-related writes, but without granularity to distinguish between writing a source file (legitimate) and writing to `.git/hooks/` (dangerous).

### The Two-Step Attack

Step 1 — **Hook plant** (agent sandbox): AGENTS.md prompt injection → agent writes `post-checkout` (or other hook type) to `.git/hooks/` → hook script contains fetch-and-execute payload, or uses `core.hooksPath` redirect to attacker-controlled directory outside `.git/hooks/`.

Step 2 — **Hook trigger** (host OS): Next git operation of matching type fires → `git` invokes hook as normal process → hook executes with developer's OS user permissions → outside sandbox, unrestricted.

The two-step structure makes this attack stealthier than the TrustFall (AAGF-2026-043) pattern. In TrustFall, the payload fires immediately when the workspace is opened. Here, the hook persists indefinitely — it will fire on every matching git operation until the developer notices and removes it. The agent session ends; the hook remains.

### Hook Types and Vectors

- **`post-checkout`** — fires after `git checkout` or `git clone`; highest value for instant execution since Cursor's agent routinely performs checkouts during repository exploration
- **`post-merge`** — fires after `git merge` or `git pull`; fires reliably in active development workflows
- **`pre-commit`** — fires before commits; Cursor's agent commits code autonomously as part of task completion
- **`post-rewrite`** — fires after `git commit --amend` or `git rebase`; less frequent but legitimate agent behavior

Secondary vector: `core.hooksPath` in `.git/config` redirects all hook lookups to an attacker-controlled directory. This allows the payload to live outside `.git/hooks/` — potentially escaping sandbox policies that were narrowly scoped to the standard hooks path.

### The Cursor 2.5 Fix

The patch added explicit deny rules to all platform sandbox implementations:

**macOS (Seatbelt):**
```
(deny file-write* (regex "^.*\/\.git/config$"))
(deny file-write* (regex "^.*\/\.git/hooks($|\/.*)" ))
```

Equivalent Landlock and seccomp rules were added for Linux; WSL2 sandbox received parallel restrictions. These rules prevent the agent process from writing to these paths at the OS-enforced sandbox level — not dependent on agent-level filtering, which could be bypassed by further prompt injection.

---

## Root Cause Analysis

**Proximate cause:** Cursor's AI agent, following prompt-injected instructions from a malicious `AGENTS.md` file, wrote a hook script to `.git/hooks/` — a path not restricted by the pre-2.5 sandbox — and git subsequently executed the hook outside the sandbox.

**Why 1: Why was the agent able to write to `.git/hooks/`?**
The sandbox policy explicitly allowed git-related filesystem writes (added in v2.4) but did not distinguish between writing source code files and writing to git internals (`.git/hooks/`, `.git/config`). The allow-list was category-level ("git writes") rather than path-level.

**Why 2: Why didn't the sandbox have path-level restrictions for git internals?**
The sandbox was designed to contain the agent's blast radius for normal development operations, not to model git's internal execution surface. `.git/hooks/` is a writable directory within the repository — the sandbox designer likely categorized it as repository content, not as an OS-level code execution path. The threat model did not account for git's hook execution model as an out-of-sandbox execution vector.

**Why 3: Why didn't the agent's threat model account for git hooks as an execution surface?**
The agent's sandbox threat model was built around preventing direct OS calls and network access — the obvious agentic blast radius risks. Git hooks are a *legitimate development primitive*, not a traditionally adversarial concept. The risk of a prompt-injected agent writing hooks was not modeled as a distinct threat class in the sandbox policy design.

**Why 4: Why did the agent treat AGENTS.md instructions as authoritative enough to execute repository configuration changes?**
`AGENTS.md` is architecturally designated as the agent's configuration source for project context — this is its intended function across the agentic coding tool ecosystem. The agent has no mechanism to distinguish between a legitimate project maintainer's instructions and an attacker's injected instructions in the same file. The trust model is: file in repository = authoritative project context.

**Why 5 / Root cause:** The fundamental cause is that agentic coding tools grant repository-local configuration files (AGENTS.md, `.claude/settings.json`, `.gemini/`) elevated trust that permits them to alter agent behavior, while the agents have no sandboxed representation of the *downstream execution effects* of the actions they take on behalf of those instructions. The agent writes a file; the sandbox controls file writes; but neither the agent nor the sandbox models "this file write causes future OS-level code execution outside the sandbox when git runs."

**Root cause summary:** Agentic coding tools conflate repository-local configuration (intended to guide agent behavior) with trustworthy instruction sources, while their sandboxes model direct agent actions but not indirect execution effects (hooks, config-driven execution) triggered by those actions.

---

## Impact Assessment

**Severity:** High (actual-impact framing: near-miss, no confirmed victims; NIST CVSS 9.9 CRITICAL reflects theoretical worst case; CNA CVSS 8.0 HIGH reflects actual attack bar)

**Who was affected:**
- No confirmed victims (near-miss)
- At-risk population: 5M+ Cursor users running versions prior to 2.5 during the February 13–17, 2026 window
- Highest-risk users: developers routinely opening external or untrusted repositories in Cursor with the AI agent enabled

**What was affected (potential, not confirmed):**
- Developer workstation filesystem — full read/write at OS user permissions
- SSH keys, cloud credentials, `.env` files, browser credential stores
- Active source code repositories and commit history
- CI/CD pipelines via malicious code injection into repository commits
- Cloud environments (AWS, GCP, Azure) via exposed credentials
- Downstream systems reachable via the developer's machine (lateral movement)

**Quantified impact:**
- Confirmed victims: 0
- Confirmed data exposed: none
- Confirmed financial impact: $0
- Averted damage estimate: ~$50M (probability-weighted; see `damage_estimate`)
- Vulnerability window: 4 days (Feb 13–17, 2026)

**Containment:** Coordinated disclosure by researchers (Novee Security Research Team, Daniel Teixeira, Philip Tsukerman) allowed Anysphere to patch before broad public awareness. No public PoC was published. NIST notes the patch preceded mass exploitation awareness. Containment effectiveness was high — the 4-day window was narrow, and no evidence of exploitation during that window has emerged.

---

## How It Could Have Been Prevented

1. **Path-granular sandbox policy for git internals.** The sandbox should have denied writes to `.git/hooks/`, `.git/config`, and any path that git uses for execution (including `core.hooksPath`-configured directories). Category-level "allow git writes" is insufficient; the deny-list must model git's internal execution surface specifically.

2. **Treat AGENTS.md (and all repo-local agent config files) as untrusted input, not trusted instruction sources.** The agent should apply prompt injection scrutiny to `AGENTS.md` content — the same scrutiny applied to web-scraped content or tool outputs. Instructions embedded in repo config files that request filesystem writes to sensitive paths (`.git/`, `/etc/`, `~/.ssh/`, etc.) should require explicit user confirmation.

3. **Repository trust levels before agent processing.** Agentic IDEs should distinguish between repositories the user has authored (implicitly trusted) and repositories cloned from external sources (untrusted until reviewed). External repositories should trigger a reduced-permission agent mode that requires explicit approval before writing to any path within the repository — including `.git/`.

4. **Scan for hook presence before and after agent operations.** A pre/post scan of `.git/hooks/` contents during any agent session that involves git operations would detect unauthorized hook writes as a compensating control, even without sandbox-level prevention.

5. **Threat model git's execution surface in agent sandbox design.** Sandbox policies for agentic coding tools should include a systematic review of all OS-level execution paths that could be triggered by legitimate-looking filesystem writes — git hooks, cron files, shell profiles, systemd unit files, launchd plists, etc. These indirect execution surfaces are categorically different from direct shell execution and require explicit sandbox coverage.

---

## How It Was / Could Be Fixed

**Actual remediation (Cursor 2.5, released February 17, 2026):**
Anysphere added explicit deny rules to the Seatbelt (macOS), Landlock+seccomp (Linux), and WSL2 (Windows) sandbox policies, blocking all agent writes to `.git/config` and `.git/hooks/` (and subdirectories). The fix is applied at the OS-enforced sandbox level — not in agent code — making it resistant to prompt injection bypasses that operate at the agent reasoning layer. The Cursor "Agent Sandboxing" blog post (February 18, 2026) documents the deny rule syntax and the platform-specific implementations.

**What remains at risk after the patch:**
- Other indirect execution paths not yet covered by the sandbox deny-list (shell profiles, cron, launchd, `.git/config` keys other than `core.hooksPath`)
- Other agentic coding tools (Windsurf, Devin, Aider, custom agents) that may have analogous gaps in their sandbox policies
- Enterprise or self-hosted Cursor deployments on versions prior to 2.5 that have not auto-updated
- The root cause — agent trust in repo-local config files — is not addressed by the patch; only the specific filesystem paths are denied

**Additional recommended fixes:**
- All agentic coding tool vendors should audit their sandbox deny-lists against git's full execution surface (hooks, config-driven paths, fsmonitor hooks, credential helpers)
- The ecosystem needs a shared threat model for repo-local agent configuration files (AGENTS.md, `.claude/`, `.gemini/`, `.devcontainer/`, etc.) — these files should be treated as untrusted input by default

---

## Solutions Analysis

### 1. Explicit Sandbox Deny-List for Indirect Execution Paths
- **Type:** Sandboxing and Isolation
- **Plausibility:** 5/5 — This is exactly what the Cursor 2.5 patch implemented. OS-level sandbox deny rules definitively prevent writes to the covered paths regardless of what the agent is instructed to do.
- **Practicality:** 4/5 — Requires enumerating all indirect execution paths (git hooks, shell profiles, cron, launchd, systemd, etc.) — a non-trivial but bounded engineering task. Already demonstrated as feasible by Anysphere in a 4-day turnaround.
- **How it applies:** Deny-list `.git/hooks/`, `.git/config`, `core.hooksPath`-routed directories, and equivalent paths in the OS-level sandbox. The agent cannot write there regardless of injected instructions.
- **Limitations:** The deny-list must be maintained as new indirect execution vectors are discovered. It does not address the trust model for `AGENTS.md` — a more sophisticated attack might find a path not yet on the deny-list. Cross-platform consistency requires platform-specific implementations (Seatbelt, Landlock, WSL2).

---

### 2. Input Validation and Sanitization on Repo-Local Config Files
- **Type:** Input Validation and Sanitization
- **Plausibility:** 3/5 — Prompt injection detection for structured config files is more tractable than general web content injection, but AGENTS.md is free-form natural language — reliable detection of adversarial instruction patterns is not solved.
- **Practicality:** 2/5 — Implementing a robust classifier that distinguishes legitimate project guidance from injection payloads without false positives that break normal AGENTS.md usage is a significant ongoing engineering burden. Adversarial actors can craft payloads that evade classifiers.
- **How it applies:** Before the agent processes AGENTS.md, run it through an injection detector or structural parser that flags instructions requesting filesystem writes to sensitive paths (`.git/`, `~/.ssh/`, etc.) and routes them to user confirmation.
- **Limitations:** Not a complete solution — sophisticated attackers craft payloads that evade detection. Better as a defense-in-depth layer than a primary control.

---

### 3. Repository Trust Levels and Reduced-Permission Agent Mode
- **Type:** Permission Scoping / Least Privilege
- **Plausibility:** 4/5 — Differential trust based on repository origin (user-authored vs. externally cloned) directly reduces the attack surface. An agent in untrusted-repo mode with read-only access cannot plant hooks regardless of injection.
- **Practicality:** 3/5 — Requires UI work (trust prompts, trust state management across sessions), and defining trust boundaries is not trivial (what about forks? submodules? repositories with external dependencies?). Adds friction to a product category that competes on reducing friction.
- **How it applies:** Repositories cloned from external sources trigger a reduced-permission agent mode: agent can read files and suggest changes, but any write operation requires explicit user confirmation. Writes to `.git/` paths require a separate, explicit trust grant.
- **Limitations:** Approval fatigue risk — if confirmation prompts are too frequent, users will approve without reading. Trust state can be poisoned if the attacker controls the first interaction with the repository.

---

### 4. Hook Integrity Monitoring During Agent Sessions
- **Type:** Monitoring and Detection
- **Plausibility:** 4/5 — Scanning `.git/hooks/` content before and after agent operations would reliably detect unauthorized writes. Hook contents containing fetch-and-execute patterns are identifiable via static analysis.
- **Practicality:** 4/5 — Straightforward to implement: hash `.git/hooks/` directory at session start and after each agent tool call; alert/halt if unexpected additions or modifications appear. Low performance overhead, no UX friction unless a hook write is detected.
- **How it applies:** Cursor instruments each git-related agent tool call with pre/post integrity checks on `.git/hooks/` and `.git/config`. The IOC scanner patterns (hook scripts with curl/wget + execute patterns, `core.hooksPath` redirects) can be adapted for real-time scanning.
- **Limitations:** Detection-only — does not prevent the write, only detects it. If the agent writes the hook and immediately triggers it (by running a git operation in the same tool call sequence), detection may be post-exploit. Requires the monitoring to run at sufficient granularity to catch writes between tool calls.

---

### 5. Human-in-the-Loop for Git Internal Writes
- **Type:** Human-in-the-Loop (HITL)
- **Plausibility:** 5/5 — Requiring user confirmation before any agent write to `.git/` paths would definitively break the attack chain. The user would see "agent is about to write to `.git/hooks/pre-commit`" and have the opportunity to refuse.
- **Practicality:** 2/5 — Adds confirmation overhead to legitimate agent workflows that involve git configuration. Developer expectation is that the agent manages git operations autonomously. A confirmation prompt for every `.git/` write would be too frequent for comfort; a confirmation prompt only for `.git/hooks/` and `.git/config` writes would be acceptable but requires fine-grained instrumentation. Risk of approval fatigue if confirmation language is not precise.
- **How it applies:** Cursor adds a distinct confirmation dialog for agent writes specifically to `.git/hooks/` and `.git/config`: "The agent is about to write to `.git/hooks/post-checkout`. This file will be executed automatically by git. Approve?" with the hook content displayed.
- **Limitations:** Approval fatigue — users may approve without reading, especially in automated or "always approve" configurations. Does not address sophisticated attacks that chain multiple legitimate-looking writes to achieve the same effect.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| AAGF-2026-043 (TrustFall — Claude Code CVE-2026-33068) | Same pattern: repo-local config file (`.claude/settings.json` vs. `AGENTS.md`) weaponizes agent trust to achieve RCE. TrustFall is one-step (immediate permission bypass); this is two-step (hook persists for future execution). Both are "agent as victim" attacks. |
| AAGF-2026-062 (TrustFall Adversa AI replication) | Independent confirmation that the config-file trust abuse pattern replicates across research teams and agent tools. Establishes it as a class vulnerability, not an isolated implementation bug. |
| AAGF-2026-066 (Gemini CLI CVSS 10.0) | Closest structural analog: `.gemini/` config directories execute before sandbox initializes — same root cause (agent config files trigger code execution before sandbox applies). Different trigger mechanism (pre-sandbox initialization vs. git hook delayed execution). |
| AAGF-2026-067 (hackerbot-claw) | Contrasting pattern: agent as attacker vs. agent as victim/vector. Hackerbot-claw involves an AI agent actively performing offensive operations. CVE-2026-26268 involves the agent being manipulated to become an unwitting RCE vector. |

---

## Strategic Council Review

*Reviewed: 2026-05-07 | Verdict: approve-with-notes | Replacing prior draft council section with full three-phase review.*

---

### Phase 1 — Challenger

**C1. Is "high" severity correct, or should this be "medium" given patch speed, no victims, and the social engineering prerequisite?**

The "high" rating deserves scrutiny. Three conditions simultaneously reduce urgency relative to the framing: (a) the 4-day patch window is among the shortest in the AgentFail corpus — compare TrustFall's <24h, but also note that 4 days is faster than the Gemini CLI's 8-day window; (b) no confirmed victims, no public PoC, no evidence of in-wild exploitation; (c) the attack requires a developer to deliberately open an attacker-controlled repository and have the Cursor agent actively process it during that session — not a passive or zero-click attack path. The CNA score of 8.0 HIGH with AC:H (High Complexity) and PR:H (High Privileges) specifically reflects these prerequisites. "High" is defensible only if the severity field is understood to mean *potential* impact class, not confirmed impact — which the `actual_vs_potential: near-miss` field already signals. A "medium" severity would not be indefensible for a confirmed-near-miss entry, and the present draft should acknowledge this is a judgment call at the boundary, not a clear-cut classification.

**C2. Is AGENTS.md confirmed as the injection vector, or inferred?**

The GHSA advisory (primary source, high confidence) describes the vulnerability as prompt injection via "attacker-controlled repository content" — it does not name AGENTS.md specifically. The AGENTS.md framing originates from cisomandate.com (secondary source, medium confidence) and is corroborated by the `agentic-ioc-scanner` §9 detection patterns. AGENTS.md is therefore a *plausible and corroborated primary vector*, not a confirmed one. The draft's Technical Analysis section and headline_stat both present AGENTS.md as the definitive vector ("the file designed to guide AI behavior — became the injection vector"), which overstates the certainty available from primary sources. The correct framing is: AGENTS.md is the highest-confidence single-file attack surface given its purpose in the ecosystem, and the IOC scanner's targeted detection patterns make it the probable primary vector — but the vulnerability affects any file the agent reads as instructional context. The headline should qualify this.

**C3. Is 5M the right user count, and is 0.001 (0.1%) exploitation probability defensible?**

5M Cursor users is a widely-cited figure for the user base as of early 2026 (Cursor's own marketing materials and press coverage). Using it as the unit count is standard for this class of estimate. However, the relevant at-risk population for this specific vulnerability is not all 5M Cursor users — it is the subset who: (a) had the AI agent enabled (not all users use the agent feature), (b) opened external/untrusted repositories (not just their own code), and (c) did so during the 4-day window while unpatched. The actual exposed population is plausibly one to two orders of magnitude smaller than 5M. Using 5M as the base unit inflates the averted_damage estimate relative to the realistic attack surface. A more defensible parameterization would be 100K–500K (20th–10th percentile of the 5M base as active-agent-with-external-repos users), which would put the probability-weighted averted damage at $1M–$5M — still significant but more honest. The 0.001 probability weight (0.1%) is, separately, likely generous for a 4-day no-PoC window: TrustFall used 0.08 but had a documented PoC mechanism; this entry should use 0.001 or lower, and the notes acknowledge this. The combination of overestimated unit count and an already-near-floor probability weight means the $50M figure is a ceiling, not a median estimate. The draft's notes partially acknowledge this; the methodology_detail should make the at-risk-population narrowing explicit.

**C4. Is the `coding-agent-config-trust` pattern group novel enough to warrant creation?**

Three incidents now share this pattern group: AAGF-2026-043, AAGF-2026-062, and AAGF-2026-066. Creating a named pattern group at three confirmed instances is standard practice in vulnerability taxonomy (CWE patterns typically require multiple independent instances for classification). However, the pattern group name `coding-agent-config-trust` is broad enough to encompass meaningfully different attack mechanics: TrustFall (AAGF-2026-043) abuses a settings file's permission fields to silently grant `bypassPermissions`; Gemini CLI (AAGF-2026-066) involves workflow configuration executed before sandbox initialization; this entry involves a two-step attack where agent action creates a persistent OS-level execution artifact. These are three variants of a shared root cause (config-file trust), not three instances of a single attack pattern. The pattern group is warranted as a root-cause-class grouping but the documentation should distinguish sub-variants: (a) permission-field bypass (TrustFall class), (b) pre-sandbox config execution (Gemini CLI class), (c) agent-planted persistent execution artifact (this entry). Lumping them under one group without sub-classification risks obscuring the distinct defensive controls each variant requires.

**C5. Does this entry add enough over AAGF-2026-043 (TrustFall) and AAGF-2026-066 (Gemini CLI) to warrant a separate incident?**

The differentiation case requires scrutiny. From the draft's Related Incidents section: TrustFall is "one-step (immediate permission bypass)"; Gemini CLI is "pre-sandbox initialization"; this is "two-step (hook persists for future execution)." The persistence characteristic — the hook survives agent session teardown and fires asynchronously on future git operations — is a materially distinct failure mode from the other two. It introduces a temporal decoupling between the agent-side injection and the OS-side execution that neither TrustFall nor Gemini CLI exhibit. This decoupling creates different detection requirements (you cannot detect the exploit at injection time; you must detect the hook artifact before it fires) and different user experience (the developer may not notice anything during the session, then be compromised days later). A separate entry is warranted for this temporal-decoupling distinction. However, the draft's differentiation case is not made explicitly in the incident body — it is only implied in the Related Incidents table. The Key Takeaways section partially addresses it (Takeaway 3), but the What Happened section should state upfront that this entry's distinguishing feature is the two-step temporal separation, not merely being another config-file trust incident.

**C6. The "sandbox entirely new in 2.5" open question has asymmetric severity implications.**

If the Cursor agent in versions prior to 2.5 had no sandbox at all — not a sandbox with a gap, but no sandbox — then every agent write, shell command, and git operation ran with full user permissions throughout the version history prior to 2.5. That is a categorically different (and significantly worse) threat picture than the draft's framing of "sandbox with a missing deny rule." The February 18 blog post's language ("new sandbox implementation") suggests the former interpretation is correct. If true, the vulnerability window extends back to whenever the AI agent feature was introduced (plausibly Cursor 1.x), not just the post-2.4 "git writes allowed" change. The draft appropriately flags this in researcher_notes but does not address its implications in the Impact Assessment or Root Cause Analysis sections.

---

### Phase 2 — Steelman

**S1. "High" is correct because the severity field measures blast radius class, not confirmed impact.**

AgentFail's severity taxonomy (following NIST's framework) classifies incidents by the *potential consequences if the vulnerability is exploited*, not by the observed exploitation rate. Developer workstation RCE with access to SSH keys, cloud credentials, source code, and CI/CD pipelines is unambiguously a High-severity consequence class — irrespective of whether any particular developer was exploited. Using "medium" would create a perverse incentive: vulnerabilities disclosed via coordinated disclosure (which prevents exploitation) would be systematically under-rated relative to those disclosed after exploitation. The `actual_vs_potential: near-miss` and `financial_impact_usd: null` fields carry the "no confirmed victims" signal. Severity carries the consequence-class signal. These two fields serve different purposes and should not collapse into each other.

**S2. AGENTS.md as the injection vector is the strongest-evidence single attack path, even if not the only one.**

The IOC scanner (agentic-ioc-scanner §9) provides detection rules specifically for AGENTS.md-triggered hook writes — patterns that would only be coded by researchers who had modeled or confirmed this attack path. The cisomandate.com narrative is internally consistent with the GHSA mechanism and the IOC scanner. The alternative vectors (any instructional file the agent reads) are theoretically possible but have no equivalent corroboration. For operational security guidance, the AGENTS.md framing is the most actionable: it names the specific file that attacker-controlled repositories would weaponize, giving defenders a concrete control point (treat AGENTS.md as untrusted input). Softening the framing to "any repo content" is technically more accurate but operationally less useful.

**S3. The $50M averted-damage figure, while using an overestimated unit count, correctly communicates the order-of-magnitude risk class.**

The damage estimate is explicitly labeled `confidence: "estimated"` with `probability_weight: 0.001` and notes stating it is "order-of-magnitude orientation, not precise estimate." For an incident with zero confirmed victims and no PoC, no estimate will be precise. The $50M figure communicates the correct risk tier — this is not a $10K incident or even a $1M incident in potential class; it is a $10M–$100M-class event if the vulnerability had been exploited across even a fraction of the user base. The methodology is transparent and auditable. The averted_range_low ($5M) to averted_range_high ($500M) range adequately brackets the uncertainty. The field serves its purpose: giving operators a calibrated order-of-magnitude sense of risk, not a precise actuarial figure.

**S4. The `coding-agent-config-trust` pattern group is warranted precisely because the third instance establishes a class.**

One instance (TrustFall) is an incident. Two instances (TrustFall + Gemini CLI) suggest a pattern. Three instances across three different vendors and tools (Anthropic/Claude Code, Google/Gemini CLI, Anysphere/Cursor) confirm a class vulnerability rooted in a shared architectural assumption: repo-local config files are trusted as authoritative agent instructions without injection scrutiny. Creating the pattern group at this point — with three confirmed instances — is the minimum necessary for the database to provide its core value to operators: "this is a class, not an outlier, and you should assume your tool is also vulnerable until proven otherwise." Without the pattern group, the third entry looks like a routine addition. With it, the three entries together constitute a structural warning about the agentic coding tool ecosystem.

**S5. The separate entry is justified by temporal decoupling — a qualitatively different failure mode requiring different defensive controls.**

TrustFall and Gemini CLI are synchronous attacks: the exploitation consequence (permission bypass, credential exposure) occurs in the same session as the injection. This entry is asynchronous: the injection creates an artifact (git hook) that fires in a future session, potentially days later, potentially during a production deployment commit or a CI-triggering push. This means: (a) the developer cannot connect the exploit to the agent session that caused it — forensics are harder; (b) compensating controls differ — TrustFall is prevented by not running the agent against untrusted repos; this incident requires additionally monitoring for unauthorized hook presence even after trusted agent sessions; (c) the blast radius timing is attacker-controllable — the hook can be planted to fire on the highest-impact git operation, not just the first one. These are material differences that justify a separate entry with distinct operator guidance, not a footnote to TrustFall.

---

### Phase 3 — Synthesis

**Final verdict: APPROVE WITH NOTES**

CVE-2026-26268 is a valid, well-sourced entry that earns its place as the third confirmed instance of the `coding-agent-config-trust` class. The core analysis is sound, the 5 Whys are well-constructed, and the solution analysis is thorough. Three specific issues require annotation or correction before publication:

**Issue 1 (Moderate): AGENTS.md framing needs qualification in the headline and Technical Analysis section.** The headline_stat and Technical Analysis section present AGENTS.md as the confirmed injection vector. It is the probable primary vector corroborated by the IOC scanner, but the GHSA advisory describes "attacker-controlled repository content" more broadly. Change: add "probable primary vector" qualifier in the Technical Analysis opening paragraph and soften the headline_stat from "AGENTS.md — the file designed to guide AI behavior — became the injection vector" to "AGENTS.md — the file designed to guide AI behavior — is the probable primary injection vector." This is a low-friction fix that materially improves accuracy without reducing impact.

**Issue 2 (Moderate): Damage estimate methodology should narrow the unit count from 5M to a realistic at-risk sub-population.** Not all 5M Cursor users are in the attack path — only those running the agent against external repositories during the 4-day window. A conservative at-risk estimate of 250K–500K (5–10% of the user base as active-agent-with-external-repos users) with the existing 0.001 probability weight yields $2.5M–$5M averted damage. This is a more defensible figure. The current $50M figure should be retained as the averted_range_high ceiling (full-user-base theoretical), with the composite_damage_usd revised to ~$5M to reflect the realistic at-risk population. Alternatively, add explicit methodology_detail fields for the at-risk-population narrowing step. This is a judgment call for the curator; the current figure is transparent and within the labeled confidence level, so blocking publication on this issue would be excessive.

**Issue 3 (Low): The pattern group sub-variant taxonomy should be noted in the Related Incidents section.** The draft correctly groups TrustFall, Gemini CLI, and this entry under `coding-agent-config-trust` but does not distinguish sub-variants. A parenthetical note in the Related Incidents table — "(permission-field bypass variant)" for TrustFall, "(pre-sandbox execution variant)" for Gemini CLI, "(agent-planted persistent artifact variant)" for this entry — would prevent the pattern group from obscuring the distinct defensive implications of each variant.

**On severity "high":** Confirmed correct. The `actual_vs_potential: near-miss` field correctly signals the absence of confirmed victims; `severity: "high"` correctly signals the consequence class if exploited. These fields are not in conflict.

**On separate entry justification:** Confirmed warranted. The temporal-decoupling characteristic (asynchronous hook execution, attacker-controllable blast radius timing, forensic opacity) distinguishes this entry from TrustFall and Gemini CLI in ways that matter to operators. A pattern-aware reader gains genuine additional knowledge from this entry beyond what 043 and 066 provide.

**On pattern group:** Confirmed warranted. Three vendor-diverse confirmed instances establish a class. The group name is appropriate. Sub-variant taxonomy should be added as a low-priority annotation, not a blocking issue.

**Confidence:** Medium-High. Vulnerability mechanism, patch, and researchers are primary-source confirmed. AGENTS.md vector is secondary-source corroborated. Zero confirmed victims, no PoC. Open questions on sandbox newness pre-2.5, Levkovich attribution, and exact payload structure are material but do not affect the core analysis or operator guidance.

**Unresolved uncertainties (carried forward to publication notes):**
- Whether the Cursor agent sandbox was entirely absent (not merely incomplete) in versions prior to 2.5 — if so, the vulnerability window extends to all AI agent versions, not just post-2.4 "git writes allowed" builds. This warrants a follow-up query against the Cursor changelog for the version that introduced agent tool execution.
- Whether Assaf Levkovich is part of the Novee Security Research Team (which would reconcile the cisomandate.com attribution with the GHSA researcher credits) — treat his role as unconfirmed until reconciled.
- Exact AGENTS.md payload structure required for reliable exploitation — no public PoC; the attack complexity assessment (AC:H in CNA scoring) remains the best available proxy.
- Whether any exploitation occurred in the 4-day window and has not been publicly disclosed — standard caveat for all near-miss entries.

---

## Key Takeaways

1. **Repo-local agent config files are attack surfaces, not trusted control planes.** `AGENTS.md`, `.claude/settings.json`, `.gemini/`, and their equivalents across tools are the files attackers will plant in repositories. Treat content from these files as untrusted input subject to injection scrutiny — the same scrutiny applied to web-scraped content — not as authoritative project-owner instructions.

2. **Sandbox your agent's indirect execution surface, not just its direct OS calls.** A sandbox that blocks shell execution but allows writes to `.git/hooks/`, shell profiles, cron directories, or launchd plists has not sandboxed the execution surface — it has sandboxed the obvious path while leaving the persistence-and-execute paths open. Enumerate all OS-level files whose presence or content causes future code execution and add them to your sandbox deny-list.

3. **Two-step attacks survive session teardown.** Unlike one-shot injections that fire immediately, hook-based attacks persist after the agent session ends. The hook will fire on the next triggering git operation — potentially days later, during a commit, push, or merge. Operators should scan for unauthorized hook presence as part of repository integrity checks, not assume that ending the agent session contains the blast radius.

4. **The coding agent RCE pattern is now a class vulnerability.** CVE-2026-26268 is the third confirmed instance of AI coding tools creating RCE pathways through local config file trust (TrustFall, Gemini CLI, Cursor). Vendors of agentic coding tools should treat this as a shared threat model requiring cross-ecosystem coordination, not isolated implementation bugs requiring individual patches.

5. **Coordinated disclosure with fast patch turnaround is the viable containment mechanism for near-miss agentic CVEs.** No organizational control can be reliably deployed to 5M users in 4 days — that window belongs entirely to the vendor. Security researchers finding vulnerabilities in widely-deployed agentic tools should prioritize coordinated disclosure with vendors who have demonstrated capacity for rapid patching (Anysphere: 4 days; Anthropic on TrustFall: <24 hours).

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| NVD CVE-2026-26268 | https://nvd.nist.gov/vuln/detail/CVE-2026-26268 | 2026-02-18 | High — primary source, NIST-reviewed, CVSS 9.9 CRITICAL |
| GitHub Security Advisory GHSA-8pcm-8jpx-hv8r | https://github.com/cursor/cursor/security/advisories/GHSA-8pcm-8jpx-hv8r | 2026-02-13 | High — vendor advisory, published by Travis McPeak (Cursor security lead), CVSS 8.0 HIGH |
| Cursor Agent Sandboxing Blog Post | https://www.cursor.com/blog/agent-sandboxing | 2026-02-18 | High — vendor primary source; documents Seatbelt policy syntax and platform-specific fix implementations |
| Cursor Changelog | https://www.cursor.com/changelog | 2026-02-17 | High — version history confirming v2.5 release date and prior sandbox behavior |
| When the Tool Fights Back (cisomandate.com) | https://cisomandate.com/blog/when-the-tool-fights-back | 2026-05-04 | Medium — security outlet; provides AGENTS.md attack chain narrative; consistent with official advisory but not independently confirmable |
| agentic-ioc-scanner §9 (dhawaldesai/GitHub) | https://github.com/dhawaldesai/agentic-ioc-scanner | 2026-02-18 | Medium — community detection kit; technically plausible IOC patterns for hook content and core.hooksPath redirect detection; corroborates AGENTS.md vector |
