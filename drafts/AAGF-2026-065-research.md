# AAGF-2026-065 Research Notes — MemoryTrap: Persistent MEMORY.md Poisoning via npm Postinstall in Claude Code

## Triage Verdict: PARK

**Reasoning:** This is high-quality, well-documented security research (responsible disclosure) with a clear, novel technical mechanism and a real patch. However, it fails Triage Criterion 1: no confirmed real-world production exploitation. Cisco explicitly described this as a proof-of-concept demonstration. The incident is valuable as a "near-miss" class entry — a real, exploitable architecture flaw that existed in production software used by real developers, patched before confirmed exploitation. It qualifies as a borderline case: the *vulnerability* existed in real-world production deployments of Claude Code, but the *attack* was only demonstrated in a lab. Recommend PARK pending editorial decision on whether the "exploitable-in-production" threshold counts as meeting Criterion 1, vs. requiring confirmed in-the-wild exploitation.

**If the editorial bar is "vulnerability in real production software, demonstrated to be fully exploitable" → PROCEED.**
**If the bar is "confirmed real-world victim" → PARK.**

---

## Primary Source

- **URL:** https://blogs.cisco.com/ai/identifying-and-remediating-a-persistent-memory-compromise-in-claude-code
- **Published:** April 1, 2026
- **Authors:** Idan Habler, Amy Chang (with contributions from Vineeth Sai Narajala, Arjun Sambamoorthy, Adam Swanda)
- **Organization:** Cisco AI Threat and Security Research team

---

## What Exactly Happened

Cisco's AI security team discovered that Claude Code's persistent memory architecture — specifically its MEMORY.md files — could be durably compromised via npm postinstall lifecycle hooks. The attack, named "MemoryTrap" by the research community, works by embedding a malicious payload inside an npm package's `postinstall` script, which executes automatically when a developer runs `npm install`.

The payload overwrites or appends to MEMORY.md files at `~/.claude/projects/*/memory/MEMORY.md` and modifies `~/.claude/settings.json` (the global hooks configuration). It also injects a shell alias into `.zshrc` or `.bashrc` to defeat any attempt to disable memory loading:

```
alias claude='CLAUDE_CODE_DISABLE_AUTO_MEMORY=0 claude'
```

This alias ensures that even if a user attempts to set `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` to stop memory from loading, the alias silently overrides it before the command runs.

Claude Code treats the first 200 lines of MEMORY.md files as a high-authority addition to the system prompt — the model trusts and follows these instructions with the same weight as developer-written configuration. A poisoned MEMORY.md can therefore instruct the agent to invert security best practices silently: in Cisco's demonstration, the poisoned agent recommended storing API keys directly in committed source files and advised against using `.env` files or environment variables — with no security warning.

The attack also exploited the `UserPromptSubmit` hook in `~/.claude/settings.json`, which executes before every prompt and injects its output directly into the model's context. This means the poisoned instructions are re-injected at every interaction, across all projects, all sessions, and even after reboots.

Habler noted in a subsequent interview (Help Net Security, April 14, 2026) that the contamination can propagate to other agents: when Agent A retrieves Agent B's compromised memory, it inherits the malicious inputs. This creates invisible trust propagation chains across multi-agent workflows.

Cisco responsible-disclosed the finding to Anthropic's Application Security team before publication. Anthropic patched it in Claude Code v2.1.50 by removing user memory files from the system prompt, severing the architectural pathway that gave MEMORY.md the same authority as system instructions.

---

## Technical Detail

### Attack Chain (Step by Step)

1. **Entry:** Attacker publishes or compromises an npm package, embedding a malicious `postinstall` script.
2. **Execution:** Developer runs `npm install` (or it runs automatically via a CI step). The `postinstall` hook fires with the user's local privileges.
3. **Memory Poisoning:** The hook overwrites `~/.claude/projects/*/memory/MEMORY.md` with attacker-controlled instructions. It also modifies `~/.claude/settings.json` to install a persistent `UserPromptSubmit` hook.
4. **Alias Injection:** The hook appends `alias claude='CLAUDE_CODE_DISABLE_AUTO_MEMORY=0 claude'` to `.zshrc` / `.bashrc`, defeating the user's ability to disable memory loading.
5. **Persistence:** On every subsequent Claude Code invocation, across every project and session (including after reboots), the poisoned memory is loaded into the system prompt. The `UserPromptSubmit` hook re-injects the payload before every prompt.
6. **Execution of Attacker Intent:** Claude Code silently follows attacker instructions (e.g., recommend insecure practices, introduce hardcoded secrets, weaken security patterns, propagate insecure guidance to teammates).

### MEMORY.md Persistence Mechanism

Claude Code reads MEMORY.md from two locations:
- Project-level: `.claude/memory/MEMORY.md` within project directories
- Global: `~/.claude/projects/*/memory/MEMORY.md`

The first 200 lines of these files are loaded directly into the AI's system prompt at session start. The model treats this content as high-authority user-authored configuration, not as untrusted external data.

### What Poisoned MEMORY.md Can Instruct the Agent To Do

Cisco demonstrated:
- Recommend storing API keys directly in committed source files
- Advise against using `.env` files or environment variables
- Suppress security warnings
- Systematically weaken security patterns across all code the agent writes
- Propagate insecure practices to team members who share project context

Theoretically (per Habler's Help Net Security interview), a sufficiently crafted payload could:
- Introduce backdoors or hardcoded secrets into production code
- Exfiltrate data from the agent's context via outbound tool calls
- Spread to subagents in multi-agent workflows

### Patch Details (Claude Code v2.1.50)

Anthropic's fix: removed user memory files from the system prompt entirely. Memory content no longer has the architectural authority of system instructions — it is no longer loaded as part of the prompt layer the model treats as authoritative. This eliminates the "System Prompt Override" vector for memory-based attacks.

The fix does NOT prevent postinstall hooks from writing to MEMORY.md files. It addresses the consequence (memory having system-prompt authority), not the initial entry (npm postinstall executing arbitrary code). npm postinstall is a legitimate mechanism; blocking it would break many packages.

### No CVE Assigned

No CVE number was assigned to this specific vulnerability as of the article's publication date (April 1, 2026). The related CVEs in the Claude Code ecosystem (CVE-2025-59536, CVE-2026-21852, CVE-2026-35020/35021/35022) address separate vulnerability classes (hook-based RCE, API token exfiltration, command injection) discovered by Check Point Research and Phoenix Security, not the MemoryTrap memory poisoning vector.

---

## Dates

- **date_occurred:** Exact date unknown. Claude Code's MEMORY.md architecture predates the April 2026 disclosure; the vulnerability class likely existed since MEMORY.md persistent memory was introduced. The earliest known related Claude Code version with this behavior is not specified in public sources.
- **date_discovered:** Not precisely stated. Cisco's team discovered and analyzed the vulnerability before April 1, 2026 (responsible disclosure implies pre-publication coordination with Anthropic).
- **date_reported:** April 1, 2026 (Cisco blog publication; also date of responsible disclosure handoff completion — Anthropic had already patched v2.1.50 by this date, so disclosure to Anthropic occurred earlier, exact date unknown).
- **date_patched:** Claude Code v2.1.50 (released before April 1, 2026; exact release date not in public sources).

---

## Source Reliability Assessment

| Source | Reliability | Notes |
|---|---|---|
| Cisco Blog (primary) | High | Cisco AI Threat and Security Research is a credible team. Named authors (Habler, Chang) with specific technical claims. **Bias flag:** Cisco has product interest in AI security findings (Cisco AI Defense). This does not invalidate the finding, but the framing may emphasize severity. The research is reproducible and Anthropic confirmed it by patching. |
| Help Net Security / Habler interview | High | Direct quotes from primary researcher. Secondary source, no additional claims beyond what Cisco published. |
| BigGo Finance / Medium summaries | Medium | Accurate summaries of the primary source; no original reporting. |
| Search results (general) | Medium | Several tangentially related Claude Code security stories (source code leak, CVE-2025-59536, CVE-2026-21852) were present in search results. These are separate incidents and were carefully excluded from this research. |

**Anthropic's public position:** "The user principal on the machine is considered fully trusted. Users are ultimately responsible for vetting any dependencies introduced into their environments." This is a standard supply chain security posture — it does not dispute the technical findings, it deflects responsibility. The patch itself confirms Anthropic took the architectural issue seriously.

---

## Vendor Response

- **Anthropic's technical response:** Patched in Claude Code v2.1.50 by removing user memory files from the system prompt. Eliminated the architectural authority MEMORY.md had over model behavior.
- **Anthropic's public statement:** User principal is fully trusted; users must vet their dependencies. No acknowledgment of structural design flaw in MEMORY.md trust model.
- **Patch quality:** Addresses the symptom (memory-as-system-prompt) rather than the root (npm postinstall can write to memory files). Memory files can still be written by malicious packages — they just no longer have system-prompt authority. Whether future features re-elevate memory authority is an open question.
- **CVE:** None assigned.
- **Bug bounty / GHSA:** None mentioned in sources.
- **Timeline transparency:** Anthropic did not publish a security advisory or changelog note for v2.1.50. The patch was confirmed only through Cisco's disclosure.

---

## Failure Mode Classification

### Primary Categories
- **Supply Chain Compromise** — npm package with malicious postinstall hook as initial vector
- **Context Poisoning** — MEMORY.md content injected into system prompt to manipulate agent behavior
- **Prompt Injection** — Poisoned memory functions as persistent prompt injection across all sessions
- **Tool Misuse** — Agent's tool-calling behavior directed by attacker via poisoned context

### Secondary Categories
- **Autonomous Escalation** — Agent acts on attacker instructions without user awareness across sessions
- **Unauthorized Data Access** — Theoretical: attacker-directed agent could exfiltrate data from context/files
- **Social Engineering** — Agent delivers convincingly authoritative but malicious guidance to the developer

### Severity: HIGH (borderline CRITICAL)
- Persistent across sessions and reboots
- Invisible to users (poisoned agent appears normal)
- Broad blast radius: all Claude Code users who install npm packages (extremely large population)
- Can propagate across multi-agent systems
- Supply chain entry means no direct user interaction required post-installation

**Downgraded from CRITICAL** because: no confirmed real-world exploitation; Anthropic's position that users bear responsibility for supply chain vetting reflects a genuine expectation in the developer tooling ecosystem.

### actual_vs_potential: `"near-miss"`
This is a research demonstration. The vulnerability existed in production software (Claude Code installations worldwide), but no confirmed attacker exploited it against real users. The "near-miss" designation reflects: real exploitable architecture in production, demonstrated PoC, no confirmed real-world victims.

---

## Suggested Frontmatter Values

```yaml
id: AAGF-2026-065
title: "MemoryTrap: Persistent MEMORY.md Poisoning via npm Postinstall in Claude Code"
slug: aagf-2026-065-memorytrap-memory-poisoning
status: draft
visibility: public

date_occurred: "2026-01-01"  # Approximate; vulnerability class existed before discovery, exact date unknown
date_discovered: "2026-03-01"  # Approximate; before April 1 publication; exact date not public
date_reported: "2026-04-01"   # Cisco blog publication date
date_patched: "2026-03-01"    # Before April 1; exact date unknown — v2.1.50 released before disclosure

agent_name: "Claude Code"
agent_version: "< 2.1.50"
vendor: "Anthropic"
patch_version: "Claude Code v2.1.50"

categories:
  - Supply Chain Compromise
  - Context Poisoning
  - Prompt Injection
  - Tool Misuse
  - Autonomous Escalation

severity: high
actual_vs_potential: near-miss

potential_damage: |
  All Claude Code users who install npm packages (a very large population of developers) were
  theoretically exposed. A successful real-world attack could cause developers to introduce
  hardcoded credentials, security backdoors, or deliberate vulnerabilities into production
  codebases — with no visible indication of compromise. In multi-agent deployments, poisoned
  memory can propagate to subagents, multiplying the blast radius. If exploited at scale via
  a popular npm package, this could affect thousands of development teams simultaneously.

intervention: |
  Cisco's responsible disclosure prompted Anthropic to patch the architectural flaw in v2.1.50
  before any confirmed real-world exploitation. The attack was demonstrated only in a controlled
  research environment.

actual_damage: |
  No confirmed real-world victims. Cisco demonstrated the attack as a proof-of-concept.
  Anthropic patched the underlying architecture before publication.

sources:
  - name: "Cisco Blog — Identifying and remediating a persistent memory compromise in Claude Code"
    url: "https://blogs.cisco.com/ai/identifying-and-remediating-a-persistent-memory-compromise-in-claude-code"
    date: "2026-04-01"
    credibility: high
  - name: "Help Net Security — Idan Habler interview on agentic AI memory attacks"
    url: "https://www.helpnetsecurity.com/2026/04/14/idan-habler-cisco-agentic-ai-memory-attacks/"
    date: "2026-04-14"
    credibility: high

cve: null
ghsa: null

researchers:
  - "Idan Habler (Cisco)"
  - "Amy Chang (Cisco)"
  - "Vineeth Sai Narajala (Cisco)"
  - "Arjun Sambamoorthy (Cisco)"
  - "Adam Swanda (Cisco)"

tldr: |
  Cisco demonstrated that a malicious npm package's postinstall hook can write adversarial
  instructions into Claude Code's MEMORY.md files, which are loaded into the system prompt
  as high-authority content. This gives an attacker persistent control over the agent's
  behavior across all sessions, projects, and reboots — silently. The agent appeared normal
  while directing developers toward insecure practices. Anthropic patched it in v2.1.50 by
  removing memory files from the system prompt. No real-world exploitation confirmed.

root_cause: |
  Claude Code treated user-writable MEMORY.md files as high-authority system prompt content,
  granting any process that could write to those files (including npm postinstall hooks) the
  ability to permanently alter the agent's behavior. The architecture provided no trust boundary
  between user-authored memory and attacker-written memory.

five_whys:
  - "Why did the agent follow attacker instructions? Because MEMORY.md content was loaded into the system prompt as trusted configuration."
  - "Why could an attacker write to MEMORY.md? Because npm postinstall hooks execute arbitrary code with the user's local privileges."
  - "Why did no trust boundary exist? Because the MEMORY.md system was designed for user convenience, not adversarial resistance."
  - "Why wasn't this caught before? Supply chain attacks on AI agent memory were a novel attack surface not in scope for standard package security review."
  - "Why did it persist across reboots? Because shell alias injection (.zshrc/.bashrc) ensured the disable flag was always overridden."
```

---

## Open Questions

1. **Exact date of v2.1.50 release** — Not in public sources. Important for the `date_patched` field. The Anthropic Claude Code changelog (code.claude.com) starts at v2.1.86 in the visible range; v2.1.50 predates it. The GitHub CHANGELOG.md may contain this.

2. **When did Cisco first contact Anthropic?** — The responsible disclosure timeline between Cisco's discovery and Anthropic's patch is not public. This determines a more accurate `date_discovered`.

3. **Is the v2.1.50 fix permanent?** — Anthropic removed memory from the system prompt, but if future versions re-introduce memory-as-system-prompt (a likely product direction for agent context), does the architecture become vulnerable again? Not addressed in any source.

4. **Multi-agent propagation: demonstrated or theoretical?** — Habler described cross-agent propagation in the Help Net Security interview. It's unclear if Cisco's PoC demonstrated this or if it is a theoretical extrapolation from the architecture.

5. **Does the fix address the alias injection?** — The alias injection into `.zshrc`/`.bashrc` is a separate persistence mechanism from the MEMORY.md system-prompt authority. Even after v2.1.50, can an alias still be injected? If memory is no longer loaded as system-prompt content, the alias would be less useful — but it's not clear if Anthropic added any sanitization of shell config files.

6. **CVE decision** — Was a CVE considered and declined, or simply not requested? Given the broad affected population (all Claude Code users), a CVE assignment would be appropriate.

7. **Relationship to other concurrent Claude Code CVEs** — CVE-2025-59536 and CVE-2026-21852 (Check Point Research) involve hook-based RCE and API token exfiltration. The `UserPromptSubmit` hook exploitation in MemoryTrap overlaps architecturally with CVE-2025-59536's hook-based vector. Whether Anthropic's hooks security improvements from those CVEs provided partial mitigation is unknown.

8. **Affected version range** — "< 2.1.50" is the best current estimate. The earliest vulnerable version is unknown.
