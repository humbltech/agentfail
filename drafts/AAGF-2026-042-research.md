# Stage 1 Research: AAGF-2026-042
## Candidate: CVE-2026-25723 — Claude Code Command Injection via Piped sed/echo Bypasses File Write Restrictions

**Research date:** 2026-05-07
**Researcher:** Stage 1 Research Agent

---

## Source Attribution

Every claim below cites its source. Sources consulted:

1. **[GH-ADVISORY]** GitHub Security Advisory GHSA-mhg7-666j-cqg4 — https://github.com/anthropics/claude-code/security/advisories/GHSA-mhg7-666j-cqg4 (primary, vendor-published)
2. **[NVD]** NVD CVE-2026-25723 Detail — https://nvd.nist.gov/vuln/detail/CVE-2026-25723
3. **[SENTINEL]** SentinelOne Vulnerability Database entry — https://www.sentinelone.com/vulnerability-database/cve-2026-25723/
4. **[GITLAB-GLAD]** GitLab Advisory Database CVE-2026-25723 — https://advisories.gitlab.com/pkg/npm/@anthropic-ai/claude-code/CVE-2026-25723/
5. **[VENTUREBEAT]** VentureBeat "Six Exploits Broke AI Coding Agents" — https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them
6. **[FLATT]** GMO Flatt Security Research "Pwning Claude Code in 8 Different Ways" — https://flatt.tech/research/posts/pwning-claude-code-in-8-different-ways/
7. **[PENLIGENT]** Penligent.ai Claude Code Security Bypass Research — https://www.penligent.ai/hackinglabs/claude-code-security-bypass-research/
8. **[XPN]** Adam Chester (XPN InfoSec/SpecterOps) "An Evening with Claude (Code)" — https://blog.xpnsec.com/An-Evening-with-Claude-Code/ (predecessor CVE-2025-64755 writeup)
9. **[GH-PRED]** GitHub Advisory GHSA-7mv8-j34q-vp7q (predecessor CVE-2025-64755) — https://github.com/advisories/GHSA-7mv8-j34q-vp7q
10. **[NVD-CVE25724]** NVD CVE-2026-25724 (companion symlink bypass) — https://nvd.nist.gov/vuln/detail/CVE-2026-25724
11. **[DARKREADING]** Dark Reading "Flaws in Claude Code Put Developers' Machines at Risk" — https://www.darkreading.com/application-security/flaws-claude-code-developer-machines-risk (fetch failed with 403; title recovered from search)

**Source bias note:** The primary source (GHSA-mhg7-666j-cqg4) is a vendor-published advisory by Anthropic (published by "ddworken," an Anthropic engineer). The reporter (nil221 via HackerOne) did responsible disclosure. No independent researcher blog from nil221 was located. All technical mechanism descriptions derive from vendor and secondary aggregator sources. There is no independently published PoC from the reporter.

---

## Dates

- **date_occurred:** No specific introduction date identified. The vulnerability affects all `@anthropic-ai/claude-code` versions prior to 2.0.55. Given the predecessor sed bypass (CVE-2025-64755, fixed in v2.0.31 on November 20, 2025), the partial fix in 2.0.31 did not catch this variant — the vulnerability window for this specific bypass likely opened when the initial blocklist-based sed validation was introduced and persisted through v2.0.54. Conservatively: **at least November 2025 through February 6, 2026.** [GH-ADVISORY, GH-PRED]
- **date_discovered:** Unknown. Not disclosed in the advisory. Reported to HackerOne by nil221 before February 6, 2026. No earlier public references found. [GH-ADVISORY]
- **date_reported (first public disclosure):** **February 6, 2026.** This is the GitHub advisory publication date and the NVD received date. [GH-ADVISORY, NVD]

---

## Technical Mechanism

### Background: The Blocklist Problem

Claude Code enforces file write restrictions using a blocklist approach — it inspects commands for patterns that would write to restricted paths (the `.claude/` directory and paths outside the project working directory) and blocks them when "accept edits" is enabled.

CVE-2026-25723 is the second documented bypass of this same validation layer. The predecessor, **CVE-2025-64755** (Adam Chester / SpecterOps, November 20, 2025, fixed in v2.0.31), exploited sed's native `w` (write) command with variant delimiter syntax:

```
echo 'runme' | sed 'w /Users/xpn/.zshenv'
echo 'echo 123' | sed -n '1,1w/Users/xpn/.zshenv'
```

The regex patterns used to block write operations (`/^...[wW]\s+\S+/` and `/^e/`) failed to catch all valid sed syntax variants. [XPN, GH-PRED]

### CVE-2026-25723 Mechanism

CVE-2026-25723 is a different bypass in the same validation layer. The specific technique uses **piped `sed` operations combined with `echo`** to escape the command pipeline validator. [GH-ADVISORY, SENTINEL, GITLAB-GLAD]

The validation logic did not properly parse and evaluate command pipelines involving shell redirection operators combined with text processing utilities. Piped command chains combining `echo` and `sed` appeared benign to the validator but executed in ways that write files to unauthorized locations. [SENTINEL]

The related Flatt Security research on "8 ways to pwn Claude Code" documents the specific sed mechanism that survives blocklisting: **sed's `e` modifier**, which executes shell commands within sed substitutions:

```
echo test | sed 's/test/touch \/tmp\/pwned/e'
```

This causes `sed` to execute the substitution result as a shell command. Whether CVE-2026-25723 uses this exact variant or a `sed`+`echo` piping technique that redirects output to a restricted path via the pipeline is not confirmed in public sources — no PoC from nil221 has been published. [FLATT]

The key exploit chain: [GH-ADVISORY, SENTINEL]
1. Attacker influences a command Claude Code will suggest or execute (via prompt injection, malicious repository content, or MCP server response)
2. The crafted command involves a piped `sed` operation with `echo`
3. Claude Code's validation layer inspects the command but does not correctly parse the pipeline, allowing it through
4. The "accept edits" feature is enabled — user sees a plausible-looking command
5. User accepts (or auto-accept is on)
6. Command executes and writes to `.claude/` or paths outside project scope

**What can be written:** [GH-ADVISORY, PENLIGENT]
- `.claude/settings.json` — stores permissions, hooks, and MCP server configurations that are sourced on startup; writing here can install persistent hooks or escalate permissions
- `.claude/settings.local.json` — local overrides
- Shell initialization files (`.zshenv`, `.bashrc`, etc.) — depending on path traversal capability
- Any path outside the project working directory the OS user has write access to

**Permissions required:** None beyond the ability to influence Claude Code's command execution (via any prompt injection surface). The "accept edits" feature must be enabled. [GH-ADVISORY]

**User interaction:** Passive — the CVSS vector lists UI:P (user interaction: passive). The user does not need to take an extraordinary action; they simply must have "accept edits" enabled and accept a command that appears routine. In environments with auto-accept enabled, no interaction is required. [GH-ADVISORY]

**Attack vector:** Network (AV:N) — a malicious repository, webpage fetched by the agent, or MCP server response can deliver the payload. [GH-ADVISORY]

---

## Affected Versions and Scale

- **Affected:** `@anthropic-ai/claude-code` < 2.0.55 [GH-ADVISORY, NVD]
- **Patched:** v2.0.55 [GH-ADVISORY]
- **Companion CVE patched later:** CVE-2026-25724 (symlink bypass) patched in v2.1.7 [NVD-CVE25724]

**Scale estimate:**
- Claude Code is distributed as an npm package with auto-update enabled by default. [GH-ADVISORY]
- The npm package `@anthropic-ai/claude-code` had 252+ dependent projects in the registry as of research date. [npm search results]
- No specific weekly download count was retrievable (npm registry returned 403). However, given Anthropic's market position and VentureBeat's characterization of Claude Code as one of the primary AI coding agents alongside Codex and GitHub Copilot, the install base is in the hundreds of thousands of developer machines. [VENTUREBEAT]
- Users on standard auto-update received the patch automatically and silently. Users who had disabled auto-update or pinned versions below 2.0.55 remained exposed. [GH-ADVISORY]
- The vulnerability window from the predecessor fix (v2.0.31, November 20, 2025) to this patch (v2.0.55, February 6, 2026) is approximately **78 days**. [GH-ADVISORY, GH-PRED]

---

## Damage Assessment

### What an attacker can directly do

**Writes to `.claude/settings.json` or `.claude/settings.local.json`:** [PENLIGENT, GH-ADVISORY]
- Install persistent hooks that execute arbitrary commands on every Claude Code session startup
- Add malicious MCP servers to the trusted list
- Override permission modes (e.g., set `bypassPermissions: true`)
- This is the highest-impact write target: it converts a one-time exploit into persistent access to every future Claude Code session

**Writes to shell initialization files (`.zshenv`, `.bashrc`, etc.):** [XPN]
- Arbitrary code execution on next shell start
- Credential exfiltration (API keys, cloud credentials visible to the process)
- Backdoor installation

**Writes to project files outside scope:**
- Modify source code, CI/CD configurations, or deployment scripts
- Supply chain attack vector: poison files committed to shared repositories

### Blast radius assessment

The VentureBeat article covering six AI coding agent exploits explicitly names this CVE and frames the core risk: every AI coding agent holds credentials (API tokens, cloud access). The attacker's goal is not to compromise the AI — it is to steal the credential the AI holds and use it to walk into production systems. Claude Code's environment typically includes `ANTHROPIC_API_KEY`, cloud provider CLI credentials, and SSH keys in scope. [VENTUREBEAT]

Writing to `.claude/settings.json` is particularly severe because it is designed to be committed to source control for team sharing — a poisoned settings file can cascade to every developer on a team when they pull the repository.

**actual_vs_potential classification reasoning:** This is a **near-miss / vulnerability-class incident**, not a confirmed exploitation-in-the-wild. No reports of weaponized exploitation have surfaced. However, the predecessor (CVE-2025-64755) was discovered during a client engagement demonstrating real risk, and the VentureBeat article frames the broader pattern as active exploitation territory. The "near-miss" designation is appropriate: the capability for full compromise existed; no confirmed mass exploitation has been documented. [GH-ADVISORY, XPN, VENTUREBEAT]

**Potential damage if exploited at scale:**
- Credential theft from developer machines → unauthorized API usage billed to victims
- Persistent hook implantation → long-term access surviving patch cycles
- Supply chain poisoning via committed `.claude/settings.json`
- The scale (hundreds of thousands of installs, 78-day window) makes the near-miss potential orders of magnitude larger than any documented direct loss

---

## Vendor Response

- **Reporter:** nil221, via HackerOne responsible disclosure program [GH-ADVISORY]
- **Advisory published by:** ddworken (Anthropic engineer) [GH-ADVISORY]
- **Patch released:** v2.0.55, February 6, 2026 — same day as advisory publication, indicating the fix was ready before public disclosure [GH-ADVISORY]
- **Delivery mechanism:** Auto-update (the default); users on standard Claude Code received the fix automatically [GH-ADVISORY]
- **Advisory quality:** The advisory is sparse on technical detail — no patch notes, no PoC, no code diff linked. This is consistent with responsible disclosure practice (avoiding providing a recipe for exploitation before widespread patching). [GH-ADVISORY]
- **CVSS assessment:** GitHub/CNA scored CVSS v4.0 at 7.7 HIGH. NIST independently scored CVSS 3.1 at 6.5 MEDIUM (lower, as 3.1 does not capture the "accept edits" exploitation context as well). The v4.0 score is the more accurate representation of real-world risk. [GH-ADVISORY, NVD]
- **Prior disclosure pattern:** Anthropic has a documented pattern of rapid response to Claude Code security reports — CVE-2025-64755 was patched within approximately 3 weeks of discovery (November 2025). [GH-PRED]
- **No public bug bounty amount disclosed.** [GH-ADVISORY]

---

## Classification Assessment

### actual_vs_potential
**`near-miss`** — This is a disclosed vulnerability with confirmed exploitability under documented conditions ("accept edits" enabled + attacker influence over command execution). No confirmed exploitation in the wild. The damage described is potential, not observed.

### Severity reasoning
- CVSS v4.0: 7.7 HIGH [GH-ADVISORY]
- The low attack complexity (AC:L), no required privileges (PR:N), and network attack vector (AV:N) mean the barrier to exploitation is low once a prompt injection foothold exists
- The "accept edits" requirement (AT:P — attack requirements: present) is the primary friction point — but many developers enable this mode for productivity, and auto-accept configurations exist
- Writing to `.claude/settings.json` enables persistence that survives the initial access vector

### Pattern group fit
This incident belongs in the **`agentic-ide-vulnerability-class`** pattern group. It shares the same fundamental pattern as:
- CVE-2025-64755 (predecessor sed bypass in Claude Code, same product, blocklist bypass via different sed syntax variant)
- CVE-2026-25724 (companion symlink bypass in Claude Code, same product, same advisory batch)
- The Flatt Security "8 ways to pwn Claude Code" research (broader blocklist bypass class in Claude Code)
- Similar bypass vulnerabilities in other agentic IDEs (Copilot, Cursor, Codex) mentioned in the VentureBeat article

The root cause across this class is identical: **blocklist-based command validation is fundamentally insufficient for shell command safety**. Anthropic's fix in an earlier Claude Code version (v1.0.93, in response to Flatt Security research) switched to an **allowlist approach** rather than blocklist for shell command filtering. CVE-2026-25723 occurring in v2.0.x suggests the allowlist approach was not fully applied to the "accept edits" file-write validation pathway — that pathway retained blocklist logic that was separately bypassed.

---

## Related Incidents

### Same product — direct predecessors/companions

| CVE | GHSA | Mechanism | Patched | Reporter |
|-----|------|-----------|---------|----------|
| CVE-2025-64755 | GHSA-7mv8-j34q-vp7q | sed `w` command write validation bypass (blocklist regex fail) | v2.0.31 (Nov 20, 2025) | Adam Chester / SpecterOps |
| **CVE-2026-25723** | GHSA-mhg7-666j-cqg4 | Piped sed+echo bypass of file write restrictions | v2.0.55 (Feb 6, 2026) | nil221 / HackerOne |
| CVE-2026-25724 | GHSA-4q92-rfm6-2cqx | Symlink following bypasses deny rules | v2.1.7 | GitHub |

### AgentFail cross-references

- **AAGF-2026-036** — The 50-subcommand deny-rule bypass in Claude Code. Different mechanism (deny rule exhaustion via subcommand count), same product, same theme (permission system bypasses). CVE-2026-25724 is the companion symlink bypass.
- The VentureBeat "Six Exploits" framing directly links this CVE to the broader pattern of AI coding agent exploitation targeting credentials, not models — the same framing used across multiple AgentFail incidents in the agentic-IDE class.

---

## Additional Sources Found

### Primary
- [GitHub Security Advisory GHSA-mhg7-666j-cqg4](https://github.com/anthropics/claude-code/security/advisories/GHSA-mhg7-666j-cqg4)
- [NVD CVE-2026-25723](https://nvd.nist.gov/vuln/detail/CVE-2026-25723)
- [GitLab Advisory Database CVE-2026-25723](https://advisories.gitlab.com/pkg/npm/@anthropic-ai/claude-code/CVE-2026-25723/)

### Secondary — covering this CVE
- [SentinelOne CVE-2026-25723](https://www.sentinelone.com/vulnerability-database/cve-2026-25723/)
- [Miggo.io CVE-2026-25723](https://www.miggo.io/vulnerability-database/cve/CVE-2026-25723) (paywalled/JS-rendered, minimal content retrieved)
- [VentureBeat "Six Exploits Broke AI Coding Agents"](https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them) (rate-limited during fetch; search summary confirms CVE-2026-25723 coverage)
- [Penligent.ai Claude Code Security Bypass Research](https://www.penligent.ai/hackinglabs/claude-code-security-bypass-research/)

### Predecessor CVE — technical context
- [Adam Chester / XPN InfoSec "An Evening with Claude (Code)"](https://blog.xpnsec.com/An-Evening-with-Claude-Code/) — full technical writeup for CVE-2025-64755, directly documents the sed regex bypass that CVE-2026-25723 is a follow-on to
- [SpecterOps blog post](https://specterops.io/blog/2025/11/21/an-evening-with-claude-code/) — same content, SpecterOps domain
- [GitHub Advisory GHSA-7mv8-j34q-vp7q (CVE-2025-64755)](https://github.com/advisories/GHSA-7mv8-j34q-vp7q)
- [NVD CVE-2025-64755](https://nvd.nist.gov/vuln/detail/CVE-2025-64755)

### Companion CVE
- [NVD CVE-2026-25724 (symlink bypass)](https://nvd.nist.gov/vuln/detail/CVE-2026-25724)
- [GitLab Advisory CVE-2026-25724](https://advisories.gitlab.com/npm/@anthropic-ai/claude-code/CVE-2026-25724/)

### Broader agentic IDE vulnerability class context
- [Flatt Security "Pwning Claude Code in 8 Different Ways"](https://flatt.tech/research/posts/pwning-claude-code-in-8-different-ways/) — documents sed `e` modifier technique among 8 bypass classes
- [Dark Reading "Flaws in Claude Code Put Developers' Machines at Risk"](https://www.darkreading.com/application-security/flaws-claude-code-developer-machines-risk) (403 during fetch)
- [The Hacker News "Claude Code Flaws Allow Remote Code Execution"](https://thehackernews.com/2026/02/claude-code-flaws-allow-remote-code.html) — covers CVE-2025-59536 and CVE-2026-21852 (different Claude Code CVEs, same product pattern)

### No Hacker News thread found
A search for Hacker News discussion specifically about CVE-2026-25723 or GHSA-mhg7-666j-cqg4 returned no results. The predecessor CVE (CVE-2025-64755) and the Flatt Security research likely received more HN attention; this specific advisory appears to have been absorbed into the broader Claude Code security discussion without a dedicated thread.

### No public PoC located
No proof-of-concept exploit for CVE-2026-25723 from nil221 has been published publicly. The Flatt Security research documents related sed bypass techniques (the `e` modifier) that provide technical context.
