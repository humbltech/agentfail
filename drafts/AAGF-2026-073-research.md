# AAGF-2026-073 Research: Cursor IDE CVE-2026-26268 Git Hook RCE

## Source Assessment

**Primary authoritative source**: NVD entry for CVE-2026-26268 — confirmed factual, NIST-reviewed as of February 18, 2026. CVSS scores from both NIST and the GitHub CNA (Anysphere) are available.

**Official vendor advisory**: GHSA-8pcm-8jpx-hv8r (github.com/cursor/cursor/security/advisories/GHSA-8pcm-8jpx-hv8r) — published February 13, 2026 by mcpeak (Travis McPeak, Cursor's security lead). Contains researcher credits, affected versions, and CVSS breakdown but is sparse on technical step-by-step.

**Secondary sources**:
- `cisomandate.com` — article "When the Tool Fights Back: Three Ways AI Coding Assistants Have Become an Attack Surface" (May 4, 2026). Provides the clearest narrative of the AGENTS.md attack chain. **Confidence: Medium** — security-focused outlet, details consistent with advisory, but no PoC code published.
- `cursor.com/blog/agent-sandboxing` (February 18, 2026) — Cursor's own post describing the Seatbelt sandbox policy that blocks `.git/hooks` writes. The timing (same day as NVD publication) and the explicit `(deny file-write* (regex "^.*\/\.git/hooks($|\/.*)")"` policy line corroborate the fix shipped in 2.5.
- `github.com/dhawaldesai/agentic-ioc-scanner` — community IOC scanner repo that includes §9 specifically for CVE-2026-26268 (post-checkout/post-merge/pre-commit hooks with fetch-and-execute patterns plus `core.hooksPath` redirect detection). **Confidence: Medium** — third-party scanner, technically plausible, corroborates advisory.
- NVD description explicitly uses "prompt injection" as the trigger mechanism.

**Conflicting data point**: `cisomandate.com` cites patch version as "≥ 2.2.5", while the official GHSA advisory and NVD both state "< 2.5 affected / fixed in 2.5". The official sources (GHSA + NVD) take precedence. The "2.2.5" figure from the secondary source may be a transcription error or refer to a different interim hotfix not reflected in the public changelog.

**What cannot be confirmed**: No PoC code found in public repositories. No confirmed wild exploitation. The researcher Assaf Levkovich is named only in the secondary source (cisomandate.com), not in the official GHSA credits — treat with caution. Official GHSA credits are: Novee Security Research Team, Daniel Teixeira (Nvidia AI Red Team), Philip Tsukerman.

---

## Timeline

| Date | Event |
|------|-------|
| Unknown (before Feb 13, 2026) | Vulnerability discovered; coordinated disclosure to Anysphere |
| February 13, 2026 | CVE-2026-26268 published (NVD); GHSA-8pcm-8jpx-hv8r published by mcpeak/Cursor |
| February 17, 2026 | Cursor version 2.5 released (patch ships) |
| February 18, 2026 | NVD NIST analysis completes; CVSS 9.9 CRITICAL assigned by NIST; Cursor publishes "Agent Sandboxing" blog post documenting the Seatbelt policy that blocks `.git/hooks` writes |
| May 4, 2026 | cisomandate.com publishes "When the Tool Fights Back" contextualing CVE-2026-26268 alongside Gemini CLI and Claude Code attacks |

**date_occurred**: Unknown lower bound. Upper bound is February 13, 2026 (disclosure date).
**date_discovered**: Pre-February 13, 2026 (coordinated disclosure; exact date not publicly stated).
**date_reported**: February 13, 2026 (NVD + GHSA publication = first public disclosure).

---

## Technical Mechanism

### Vulnerability Class
CWE-862 (Missing Authorization) — Cursor's agent sandbox, prior to version 2.5, did not restrict agent write access to `.git/config` and `.git/hooks/`. This allowed a prompt-injected agent to write malicious hook scripts into these paths.

### Step-by-step Attack Chain

1. **Initial access**: An attacker plants a malicious `AGENTS.md` file inside a git repository (or a repository subpath) they control. This file contains instructions visible to Cursor's agent when it processes the repository.

2. **Prompt injection via AGENTS.md**: When the Cursor agent navigates the repository (e.g., during autonomous code exploration, a task requiring cloning, or reading project context), it reads `AGENTS.md` as agent instructions. The file directs the agent toward a bare git repository or instructs it to perform git operations on an attacker-configured path.

3. **Hook write**: Because the pre-2.5 sandbox did not deny writes to `.git/hooks/`, the prompt-injected agent writes a malicious hook script (e.g., `post-checkout`, `post-merge`, `pre-commit`, or `post-rewrite`) to `.git/hooks/`. Alternatively, the `.git/config` file's `core.hooksPath` is redirected to an attacker-controlled path outside the normal hooks directory.

4. **Automatic hook trigger**: The hook fires automatically the next time a git operation that triggers it occurs — either by the agent itself or by the user. This requires no additional user interaction because git executes hooks as part of its normal operation model. For `post-checkout`, the hook fires when any `git checkout` or `git clone --` operation completes.

5. **Out-of-sandbox RCE**: The hook script executes in the host OS context, outside Cursor's agent sandbox, achieving arbitrary code execution with the OS permissions of the Cursor process (typically the developer's full user account).

### The "No User Interaction" Claim
The CVSS metric UI:N (User Interaction: None) is accurate at the hook execution stage — once the hook is written, git executes it automatically. However, the attack **does** require the attacker's repository to be opened in Cursor and the agent to process it (which requires the user to open/clone the repository). The "no user interaction" is relative to the hook execution step, not the initial repository open. This is closer to the MCP trust dialog bypass model than a fully zero-click remote attack. The user must take an action (open a repository), but does not need to approve the hook execution itself.

### Which Git Hook Types Are Weaponized
Based on the IOC scanner (§9) and secondary sources, the following hook types are exploited or detectable:
- `post-checkout` — fires after `git checkout` or `git clone`; highest utility for instant execution
- `post-merge` — fires after `git merge` or `git pull`
- `post-rewrite` — fires after `git commit --amend` or `git rebase`
- `pre-commit` — fires before a commit; agent running `git commit` would trigger this

`post-checkout` is the highest-value type because it fires immediately upon cloning or switching branches — natural agent behavior when exploring a new repository.

### core.hooksPath Vector
A secondary vector uses git's `core.hooksPath` configuration setting (settable in `.git/config`) to redirect hook lookups to an attacker-controlled directory. This allows the hook payload to live outside the `.git/hooks/` directory, potentially in a path that was not covered by earlier sandbox allowlists.

### What Cursor's Agent Does Autonomously
Cursor's AI agent autonomously runs shell commands including git operations as part of task completion. When instructed to explore, build, test, or commit code, it runs `git checkout`, `git pull`, `git commit`, etc. without per-operation user approval (approval fatigue had already motivated Cursor to reduce mandatory approval checkpoints). This autonomous git execution is what makes hook-based RCE viable without a user explicitly triggering the git operation.

---

## Scope and Affected Versions

- **Affected**: Cursor (all platforms) prior to version 2.5
- **Fixed**: Cursor version 2.5 (released February 17, 2026)
- **Versions checked**: Version 2.2 (Dec 10, 2025), 2.3 (Dec 22, 2025), 2.4 (Jan 2026), all confirmed vulnerable by implication. The "Git writes are now allowed in sandboxes" note in the v2.4 release (Jan 22, 2026) is notably relevant — it shows the sandbox was being actively tuned, but write access to `.git/hooks` was not yet restricted.
- **Platform scope**: macOS, Linux, Windows (WSL2). The fix involves platform-specific sandbox implementations (Seatbelt on macOS, Landlock+seccomp on Linux) — all patched in 2.5.

---

## Exploitation Evidence

**PoC**: No public proof-of-concept code identified. The IOC scanner (`agentic-ioc-scanner`) provides detection logic (hook content patterns, `core.hooksPath` redirects) but no exploit code.

**Wild exploitation**: No confirmed incidents of exploitation in the wild. NIST notes the vulnerability was patched before broad public awareness.

**Attacker prerequisites** (per GHSA CVSS): Network access + high privileges (Privileges Required: High per CNA; NIST rates it Low). The "high privileges" CNA rating reflects that the attacker must control a repository the victim opens — a social engineering prerequisite rather than a direct network-level privilege. NIST's more aggressive 9.9 rating treats the prompt injection delivery mechanism as lower-barrier.

**Attack complexity**: High per CNA (requires controlling a repository the developer opens and crafting effective prompt injection via AGENTS.md). Low per NIST (if the victim is routinely opening external repositories, the setup cost is minimal).

---

## Vendor Response

**Vendor**: Anysphere (Cursor)
**Response time**: Patch shipped within ~4 days of CVE publication (Feb 13 → Feb 17). CVE was likely disclosed to vendor before Feb 13 under coordinated disclosure.
**Fix implemented**: Version 2.5 added explicit sandbox deny rules for writes to `.git/config` and `.git/hooks/`. The Seatbelt policy (macOS) now includes:
```
(deny file-write* (regex "^.*\/\.git/config$"))
(deny file-write* (regex "^.*\/\.git/hooks($|\/.*)" ))
```
Equivalent protections added on Linux (Landlock) and Windows (WSL2 sandbox).

**CVSS scores**:
- NIST: 9.9 CRITICAL — AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H
- GitHub CNA (Anysphere): 8.0 HIGH — AV:N/AC:H/PR:H/UI:N/S:C/C:H/I:H/A:H
- The discrepancy is significant: NIST rates attack complexity Low and privileges required Low; Anysphere rates both High. The CNA score is more defensible for the actual attack scenario (social engineering + high attacker control required). NIST's rating better captures the theoretical worst case.

**Advisory publication**: mcpeak (Travis McPeak, Cursor security lead) published GHSA-8pcm-8jpx-hv8r on February 13, 2026.

**Researcher credits** (per GHSA): Novee Security Research Team, Daniel Teixeira (Nvidia AI Red Team), Philip Tsukerman.

---

## Damage Assessment

**actual_vs_potential**: `near-miss` — No confirmed exploitation in the wild. Vulnerability was disclosed and patched before mass public awareness.

**What an attacker achieves with code execution in Cursor's context**:
- Full filesystem access as the developer's OS user (not just the workspace)
- Access to SSH keys, cloud credentials, `.env` files, browser credential stores
- Ability to exfiltrate source code, commit history, secrets in git history
- Lateral movement to cloud environments (AWS, GCP, Azure) via stored credentials
- Supply chain attack: inject malicious code into the developer's active repository, which then flows into CI/CD pipelines and production
- Persistence: plant additional hooks or scheduled tasks for repeated execution

**Scope of potential impact**: Any developer using Cursor < 2.5 and opening a malicious repository. Cursor had significant adoption among professional developers by early 2026. The "all developers who open untrusted repos" attack surface is large.

**Affect on Cursor's AI agent specifically vs. IDE itself**: The vulnerability specifically exploits the AI agent's autonomous git operation behavior. A standard non-agent IDE user would not trigger hook execution without explicit git command invocation. The agent's willingness to run git commands autonomously as part of task completion is what converts a low-probability attack (user must type `git checkout`) into a higher-probability one (agent does it during normal workflow).

**Financial damage documented**: None (near-miss).

**Near-miss potential**: Developer workstation RCE → credential theft → cloud account compromise → supply chain injection. Worst case: a targeted attack against a developer at a high-value company (financial, defense, healthcare) using their Cursor agent to work on a repository an attacker plants in their workflow.

---

## Relationship to Existing Incidents

### vs. AAGF-2026-043 (TrustFall — Claude Code CVE-2026-33068)

| Dimension | AAGF-2026-043 TrustFall | AAGF-2026-073 (this) |
|-----------|------------------------|----------------------|
| **Tool** | Claude Code | Cursor IDE |
| **Attack file** | `.claude/settings.json` with `bypassPermissions: true` | `AGENTS.md` directing agent to malicious git repo |
| **Mechanism** | Settings file silently elevates agent permissions | Prompt injection via config file → agent writes malicious hook → hook executes autonomously |
| **When it fires** | Immediately on workspace open (settings loaded) | On next git operation after hook is planted |
| **Sandbox relationship** | Bypasses the entire permission system | Exploits gap in sandbox's filesystem write restrictions |
| **User interaction** | None — opens workspace, settings auto-load | Repository must be opened; agent must perform git operation |
| **Fix type** | Validation of repo-level settings; workspace trust enforcement | Explicit deny rules for `.git/hooks` writes in sandbox policy |
| **Patch timeline** | <24h (Feb 18 → Feb 18 — same day on Flatt disclosure) | ~4 days (coordinated disclosure → Feb 17 patch) |

**Key similarity**: Both are "agent as victim" attacks where the AI agent's autonomy and trust in local configuration files is weaponized. Both exploit the gap between "agent reads configuration" and "agent verifies configuration is trustworthy."

**Key difference**: TrustFall is a one-step attack (settings file → immediate permission bypass). The git hook attack is a two-step attack (agent writes hook → hook fires on next git operation). TrustFall is more severe in immediacy; the git hook attack is stealthier (the hook persists for future exploitation).

### vs. hackerbot-claw Pattern (AI agent as attacker)
The hackerbot-claw pattern involves an AI agent actively performing offensive operations as the attack originator. CVE-2026-26268 is the inverse: the AI agent is the **victim/trigger** — it is manipulated into writing malicious hooks, then the hooks execute autonomously using git's native execution model. The agent is weaponized as a tool-user rather than acting as a direct attacker.

### Pattern: AI Coding Agents + Autonomous Git Operations
This is the third confirmed instance of AI coding tools creating RCE pathways through autonomous git operations or config file trust:
1. **TrustFall** (Claude Code) — settings file in repo bypasses permissions
2. **Gemini CLI CVSS 10.0** — `.gemini/` config directories execute before sandbox initializes  
3. **CVE-2026-26268** (Cursor) — agent writes malicious git hooks; git executes them autonomously

Common root cause across all three: **agents trust local repository configuration files at a level that allows those files to grant code execution**, either directly (settings.json) or indirectly (hook scripts written by a prompt-injected agent). The attack surface is "any agent that reads local config and executes based on it" — a structural property of all agentic coding tools.

---

## Classification Notes

- **Category**: Sandbox Escape, Prompt Injection, Unauthorized Code Execution
- **Agent type**: Coding Assistant (AI-driven IDE agent)
- **Failure mode**: Agent trusts attacker-controlled configuration files → agent performs privileged filesystem writes → hook execution bypasses sandbox
- **actual_vs_potential**: `near-miss`
- **Severity**: High (GHSA) / Critical (NIST) — use NIST 9.9 as the "potential" framing, GHSA 8.0 for "actual attack bar"
- **NIST CVSS**: 9.9 CRITICAL (AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H)
- **CNA CVSS**: 8.0 HIGH (AV:N/AC:H/PR:H/UI:N/S:C/C:H/I:H/A:H)

---

## Open Questions

1. **Exact discovery timeline**: When was the vulnerability first reported to Anysphere? The coordinated disclosure period is unspecified. Was it part of a bounty program?

2. **Assaf Levkovich attribution**: The cisomandate.com article names Assaf Levkovich as the discoverer, but the official GHSA names Novee Security Research Team, Daniel Teixeira, and Philip Tsukerman. Is Levkovich part of Novee Security, or is the attribution incorrect?

3. **Exploit chain completeness**: Does a working exploit require a specific prompt injection payload in AGENTS.md, or does any AGENTS.md content that references a bare git repo suffice? Is the agent's behavior toward AGENTS.md deterministic enough that the attack is reliable?

4. **Version 2.2.5 discrepancy**: The cisomandate.com source states the patch is "≥ 2.2.5" while GHSA/NVD state "< 2.5 / fixed in 2.5". Was there an interim hotfix at 2.2.5 that addressed a subset of the issue, or is this purely a secondary-source error?

5. **Sandbox blog timing**: The "Agent Sandboxing" blog post (Feb 18) describes the `.git/hooks` deny rules as part of the "new" sandbox implementation. Does this mean the sandbox itself was the fix — i.e., prior to 2.5, there was no Seatbelt/Landlock sandbox at all for agent operations — or was the sandbox in place but missing these specific rules?

6. **Wild exploitation**: Has any threat intelligence emerged post-May 2026 indicating actual exploitation of this window?

7. **Enterprise exposure**: Were Enterprise customers protected earlier via admin-enforced sandbox policies, or were they equally vulnerable until 2.5?

---

## Sources

| Source | URL | Type | Confidence |
|--------|-----|------|-----------|
| NVD CVE Record | https://nvd.nist.gov/vuln/detail/CVE-2026-26268 | Primary (government database) | High |
| GitHub Security Advisory GHSA-8pcm-8jpx-hv8r | https://github.com/cursor/cursor/security/advisories/GHSA-8pcm-8jpx-hv8r | Primary (vendor advisory) | High |
| Cursor Agent Sandboxing Blog Post | https://www.cursor.com/blog/agent-sandboxing | Primary (vendor blog, dated Feb 18 2026) | High |
| "When the Tool Fights Back" (cisomandate.com) | https://cisomandate.com/blog/when-the-tool-fights-back | Secondary (security outlet, May 4 2026) | Medium |
| agentic-ioc-scanner §9 (dhawaldesai) | https://github.com/dhawaldesai/agentic-ioc-scanner | Secondary (community detection kit) | Medium |
| Cursor Changelog (pages 5-7) | https://www.cursor.com/changelog | Supporting (version history context) | High |
| Cursor Security Advisories List | https://github.com/cursor/cursor/security/advisories | Supporting (advisory inventory) | High |
| Cursor Security Page | https://www.cursor.com/security | Supporting | Medium |
| THN article title reference | https://thehackernews.com/ (search result snippet) | Tertiary (article title only, no content) | Low |
