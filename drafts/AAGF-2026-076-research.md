# AAGF-2026-076 Research: Claude Code Sourcemap Leak + Axios RAT

**Research date:** 2026-05-08
**Researcher:** Stage 1 Agent
**Sources fetched:**
- https://thehackernews.com/2026/04/claude-code-tleaked-via-npm-packaging.html (FETCHED)
- https://www.securityweek.com/critical-vulnerability-in-claude-code-emerges-days-after-source-leak/ (FETCHED)
- https://www.infoq.com/news/2026/04/claude-code-source-leak/ (FETCHED, limited detail)
- https://www.backslash.security/blog/claude-code-source-leaked-implications-for-security (FETCHED)
- https://coder.com/blog/what-the-claude-code-leak-tells-us-about-supply-chain-security (FETCHED)
- https://github.com/axios/axios/issues/10604 (FETCHED — original community report)
- https://github.com/axios/axios/issues/10636 (FETCHED — official post-mortem by Jason Saayman)
- https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan (FETCHED)
- https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise/ (FETCHED)
- https://github.com/anthropics/claude-code/issues/41666 (FETCHED — user confirms 59.8MB sourcemap yank)
- https://github.com/anthropics/claude-code/issues/41434 (FETCHED — "Consider open source path" request after leak)
- https://github.com/anthropics/claude-code/pull/41518 (FETCHED — community PR submitting leaked source back)
- https://github.com/anthropics/claude-code/pull/41447 (FETCHED — second community "open source" PR)
- https://github.com/BH3GEI/claude-code — leaked source archive referenced in PRs
- npm registry API — version timestamps, package sizes (FETCHED)
- GitHub releases API — anthropics/claude-code (FETCHED)

---

## Key Facts (with source attribution)

### Incident A: Claude Code Sourcemap Leak

**Package version affected:** `@anthropic-ai/claude-code@2.1.88`

**Exact publish timestamp:** `2026-03-30T22:36:48.424Z` UTC (npm registry API)
Note: this is March 30 UTC, which is March 31 in many time zones. The "March 31" date in coverage is correct for most audiences.

**Version yanked from npm:** Yes — v2.1.88 is completely absent from current npm registry (versions field returns nothing for 2.1.88). The replacement version v2.1.89 was published at `2026-03-31T23:32:40.530Z` UTC, meaning the leak window was approximately 25 hours.

**Package size anomaly (npm registry API):**
- v2.1.87: 46.6 MB (normal)
- v2.1.88: ~59.8 MB (reported; package is fully yanked so size is unverifiable from registry; the delta is ~13-16 MB from the sourcemap)
- v2.1.89: 43.0 MB (slimmed after removal of sourcemap)
- Note: v2.1.89 is also 3.6 MB smaller than v2.1.87, suggesting the build pipeline was further cleaned up.

**Root cause:** Bun bundler generates sourcemaps by default. A missing `*.map` exclusion in the npm packaging configuration allowed the `cli.js.map` file to be included in the published tarball. (Source: coder.com; InfoQ)

**Scale of exposure (from leaked source PRs):**
- Community PR #41518 (BH3GEI) reports: 1,906 Anthropic TypeScript source files + 2,850 bundled third-party library sources extracted from the sourcemap
- A separate community PR #41447 (gameroman) submitted 513,237 lines of additions to the repo
- The leaked source map file was 57–59.8 MB (various sources cite slightly different sizes)
- Reported viral reach: "millions of views" (InfoQ); HackerNews cites 16–21M views for the initial X post by security researcher Chaofan Shou

**GitHub archive spread:**
- The leaked source was archived to multiple GitHub repositories
- One archive (BH3GEI/claude-code-source) reportedly accumulated 84,000 stars and 82,000 forks (HackerNews)
- The leaked source has also been submitted back to Anthropic's own repo as multiple open-source PRs that remain open as of research date

**Discovery:** Security researcher Chaofan Shou publicly flagged the leak on X (Twitter). The source was "discovered 20 minutes after publication" according to Backslash Security, though it remained in the registry for ~25 hours before v2.1.89 replaced it.

**Anthropic's response:**
- Characterized as "a release packaging issue caused by human error, not a security breach"
- Statement: "no sensitive customer data or credentials were involved or exposed"
- Yanked v2.1.88 and published v2.1.89; did not make any public statement about KAIROS, undercover mode, or the anti-distillation feature
- No public comment on the concurrent axios RAT attack

**Previously leaked:** InfoQ reports "this was reportedly not the first time Anthropic has shipped source maps in its npm packages — earlier versions in 2025 also included full source maps before being pulled from the registry."

---

### What the Leaked Source Revealed

**Confirmed from actual leaked source code (BH3GEI/claude-code, feat/add-source-code branch):**

**1. Undercover Mode** (`src/utils/undercover.ts`)
- NOT "stealth mode hiding Anthropic employee contributions" — the framing in some coverage is inaccurate.
- Correct description: An internal-only feature (`USER_TYPE === 'ant'` build-time constant) for Anthropic employees using Claude Code to make contributions to PUBLIC or OPEN-SOURCE repositories.
- When active, strips all attribution from commit messages and PR descriptions: internal model codenames (animal names like "Capybara," "Tengu"), unreleased version numbers, internal repo/project names, Slack channels, "Co-Authored-By" lines, and any indication the commit was made by an AI.
- Activation: `CLAUDE_CODE_UNDERCOVER=1` env var forces it on; otherwise auto-detects public remotes. There is no force-off.
- Dead-code eliminated from external builds at bundle time via `--define` constants. DOES NOT SHIP in the public binary — only visible in the sourcemap.
- Security concern: This reveals that Anthropic employees use Claude Code as a tool for covert open-source contributions that appear human-authored. This is an ethical/transparency concern rather than a security vulnerability per se.

**2. Dream Mode / AutoDream** (`src/services/autoDream/`, `src/tasks/DreamTask/`)
- Background memory consolidation subagent that fires automatically after sufficient session history accumulates.
- Gate conditions: ≥ 24 hours since last consolidation AND ≥ 5 sessions accumulated.
- Runs as a forked background agent using the `/dream` prompt.
- A 4-stage structure: orient → gather → consolidate → prune.
- Feature-flagged via GrowthBook key `tengu_onyx_plover`. Not enabled for all users.
- NOT always-on as some coverage stated. It is time-gated and session-count-gated.

**3. KAIROS** (`src/bootstrap/state.ts`, referenced in `src/services/autoDream/autoDream.ts`)
- Appears as a state flag: `kairosActive: boolean`.
- When `getKairosActive()` returns true, the local AutoDream path is bypassed: "KAIROS mode uses disk-skill dream" (comment in autoDream.ts).
- This suggests KAIROS is a distinct operating mode (possibly remote/cloud-managed agent persistence) that handles dream/memory consolidation differently from the local implementation.
- No dedicated source file for KAIROS found in the leaked tree — it is a mode flag set at bootstrap, not a standalone feature module.
- The HackerNews description ("persistent background agent that performs error fixes autonomously and sends push notifications") likely conflates KAIROS with the broader AutoDream + background task system (BackgroundTask.tsx, BackgroundTaskStatus.tsx). Those UI components are real; whether KAIROS specifically drives them is unclear from the source.
- KAIROS appears to be Anthropic-internal (ant-only) or remotely-managed infrastructure, similar to how Undercover Mode is ant-only.

**4. Anti-Distillation Controls**
- Backslash Security's description of "injecting fake tool definitions into API requests to poison competitor training data" is NOT directly verifiable from the leaked source tree as reviewed.
- Files like `src/tools/BashTool/commandSemantics.ts` exist but are standard tool definition files.
- This claim requires additional verification. It may be based on specific code paths in the sourcemap that the Backslash team examined directly.

**5. Feature Flags**
- Community PR #41518 reports "90+ feature flags found" (from the older 2.0.74-era sourcemap that PR extracted from)
- Other coverage cites "44 hidden feature flags" — this likely refers specifically to the 2.1.88 sourcemap count, not the 2.0.74 one
- Feature flags are managed via GrowthBook; named with internal codenames (e.g., `tengu_onyx_plover`)
- Many flags gate ant-only or experimental features that are dead-code-eliminated in public builds

**6. Axios as Bundled Dependency (confirmed)**
- Claude Code has ZERO npm-level dependencies (verified via npm registry API for all checked versions)
- However, the leaked sourcemap's dependency manifest confirms axios IS bundled inside the compiled `cli.js`
- `src-package.json` in the leaked repo lists axios (version: `*`) among 312 bundled third-party libraries
- This confirms that any developer who installed v2.1.88 during the axios RAT window may have been affected

---

### Incident B: Axios npm RAT Supply Chain Attack

**Compromised versions:**
- `axios@1.14.1` — published 2026-03-31 00:21 UTC
- `axios@0.30.4` — published approximately 2026-03-31 01:00 UTC

**Removal timeline:**
- First external detections: ~01:00 UTC March 31
- Community issues filed: ~01:00 UTC (attacker deleted them using the compromised npm account)
- Collaborator DigitalBrainJS opens PR #10591 to deprecate and contacts npm: 01:38 UTC
- Malicious versions removed from npm: **03:15 UTC** (not 03:29 as originally cited)
- `plain-crypto-js` malicious package removed: 03:29 UTC

**Total exposure window:** ~2h 54m for axios@1.14.1; ~2h 15m for axios@0.30.4

**Malicious payload mechanism:**
- `plain-crypto-js@4.2.1` injected as a new dependency in axios's `package.json`
- Pre-publish staging: `plain-crypto-js@4.2.0` (clean stub) published 2026-03-30 05:57 UTC — the day before, to reserve the package name
- The malicious `4.2.1` was published with the actual RAT dropper
- Payload delivered via npm `postinstall` hook in `plain-crypto-js`
- Two-layer XOR obfuscation with base64; key: `"OrDeR_7077"`
- Anti-forensics: after execution, replaces malicious `package.json` with clean stub reporting version 4.2.0

**RAT technical details (cross-platform):**
- **macOS:** Mach-O universal binary (x86_64 + arm64), cached to `/Library/Caches/com.apple.act.mond`
- **Windows:** PowerShell to `%TEMP%\6202033.ps1`; persistence via `%PROGRAMDATA%\system.bat` + `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\MicrosoftUpdate`; binary also copied to `%PROGRAMDATA%\wt.exe`
- **Linux:** Python script to `/tmp/ld.py`; no built-in persistence

**Data exfiltration on install:**
- `FirstInfo` beacon: directory listings of victim's home directory, Desktop, Documents, `.config` folder
- `BaseInfo` beacons (60-second loop): hostname, username, OS, architecture, timezone, boot time, hardware model, CPU, running processes

**C2 infrastructure:**
- Domain: `sfrclak[.]com` (registered 2026-03-30 via Namecheap — one day before attack)
- IP: `142.11.206.73` (Hostwinds)
- Endpoint: `http://sfrclak[.]com:8000/6202033`
- User-Agent: Hardcoded IE8 string across all variants

**How the account was compromised:**
- "Targeted social engineering campaign" against lead maintainer Jason Saayman, initiated ~2 weeks before March 31
- The attacker first compromised the maintainer's PC via RAT malware, then harvested npm credentials
- The attacker also had write access to the axios GitHub repo (used to delete community issue reports)

**Scale:**
- axios averages 100M+ weekly npm downloads (all versions)
- Specific download counts for the compromised versions during the 2h-54m window are not publicly reported
- Detection method: StepSecurity Harden-Runner captured C2 callbacks "within two seconds of `npm install`" across monitored open-source projects including Backstage

**Axios CVE:** Community reported this as a vulnerability for CVE assignment (GitHub issue #10604, opened by Ashish Kurmi). CVE number not confirmed in sources reviewed.

---

### Incident C: Post-Leak Critical Vulnerability (Claude Code Permission Bypass)

**Discovered by:** Adversa AI Red Team

**Public disclosure date:** April 2, 2026

**How source leak enabled it:**
- The sourcemap leak on March 31 exposed the Claude Code permission system implementation
- Adversa examined the TypeScript source and identified the subcommand analysis cap within days
- This is a textbook case of "security through obscurity" failure — the implementation flaw existed before, but the source was needed to find it efficiently

**The vulnerability:**
- Claude Code's permission system analyzes shell commands and their subcommands for deny-rule matching
- A hardcoded cap of 50 subcommands: analysis beyond this threshold defaults to "ask" (request user confirmation) rather than enforcing deny rules
- An attacker with a malicious `CLAUDE.md` file in a repository can craft >50 subcommands that appear legitimate
- This causes "deny rules, security validators, command injection detection — all skipped" (Adversa)

**Attack surface:** Any developer who clones a malicious repository containing a crafted `CLAUDE.md` and then runs Claude Code in that directory

**Potential impact:**
- SSH private key theft
- AWS credential exfiltration
- GitHub and npm token compromise
- CI/CD pipeline poisoning
- Supply chain attacks

**Partial mitigation:** Adversa noted "Claude's LLM safety layer independently caught some obviously malicious payloads" — defense-in-depth provides partial protection, but the structural bypass is real.

**CVE number:** Not assigned or confirmed in any source reviewed as of research date.

**Patch status:** No patch announcement found in sources reviewed. Given the vulnerability was disclosed April 2, 2026 and the research date is May 8, 2026, it should have been addressed — but no advisory in anthropics/claude-code issues was found confirming this.

---

### Are the Two Main Incidents Linked?

**Short answer: coincidental timing, not coordinated.**

**Evidence for coincidental:**
- Socket.dev's analysis explicitly states: "we have not observed any evidence linking this activity to the recently reported TeamPCP campaigns" — they examined potential coordination and found none
- The coder.com article characterizes opportunistic package squatting on Anthropic internal names as "within 24 hours" — separate actors exploiting the publicity, not coordinators
- The axios attack vector (social engineering against a lead maintainer) began ~2 weeks before March 31 — it was already in motion before the sourcemap leak occurred
- The C2 domain `sfrclak[.]com` was registered March 30 — one day before the leak — suggesting the axios attack was independently timed

**Evidence for potential link (weak):**
- The timing is extraordinary: both incidents occurred on the same day, both affecting the developer tool ecosystem
- A developer updating Claude Code to v2.1.88 during the early hours of March 31 UTC could theoretically have triggered both: the sourcemap leak AND the axios RAT (if npm install pulled the compromised axios version bundled into their project)
- However, Claude Code bundles axios internally — it does not pull axios from npm at install time. The risk would be to projects that use axios as a direct dependency and ran `npm install` during the window, not to Claude Code users specifically.

**Clarification on the "Claude Code depends on axios" claim:**
- The triage summary's claim that "any developer who installed or updated Claude Code during that window may have pulled in the compromised axios dependency" appears to be inaccurate.
- Claude Code has ZERO external npm dependencies (confirmed via registry API). Axios is bundled inside the compiled binary at Anthropic's build time, not at user install time.
- The risk to Claude Code users from the axios RAT would only be indirect: if a developer also had a separate project using axios and ran a fresh npm install during the window.
- This is a meaningful distinction for impact assessment.

---

## Technical Analysis

### Why the Sourcemap Was So Large

The published npm package is a single compiled `cli.js` binary (Claude Code uses Bun bundler). When Bun compiles TypeScript to JavaScript, it optionally generates a `.map` file that maps positions in the minified JS back to original TypeScript source. Crucially, this `.map` file can embed the full original source inline (as base64 data URIs in the sourcesContent field) or reference them by path. In Claude Code's case, the sourcemap embedded the actual TypeScript source of both Anthropic code and all 2,850 bundled third-party libraries. This is standard debugging behavior — it should be excluded from npm publishes via `.npmignore` or `package.json` `files` field whitelist, but no such exclusion existed.

### Why Undercover Mode Is More Significant Than Reported

The undercover mode is not a "stealth backdoor" — it's an internal policy tool. But its existence confirms that Anthropic engineers routinely use Claude Code to make AI-assisted contributions to public open-source projects while actively suppressing any indication that an AI was involved. The code is explicit: "Write commit messages as a human developer would" and "NEVER include... any hint of what model or version you are... The phrase 'Claude Code'... any mention that you are an AI." This is a genuine transparency and attribution issue in the open-source community context.

### Why the AutoDream / KAIROS Analysis Matters

The HackerNews article conflates KAIROS with AutoDream. The actual source shows:
- AutoDream is the background memory consolidation system (runs locally, time/session-gated, user-configurable)
- KAIROS is a separate state flag that, when active, bypasses the local AutoDream implementation in favor of a different mechanism ("disk-skill dream")
- KAIROS is likely an Anthropic-internal remote-management mode for running Claude Code in production/cloud contexts
- Neither is "always-on" for regular users — KAIROS appears to be an Anthropic infrastructure feature only

---

## Classification Assessment

### Should these be one incident or two (or three)?

**Recommendation: Two separate incidents, with a cross-reference note.**

**Incident A (AAGF-2026-076): Claude Code Sourcemap Leak + Post-Leak CVE**
These belong together because the CVE was directly enabled by the sourcemap exposure. This is one causal chain:
- Packaging error → sourcemap shipped → IP/architecture exposed → permission bypass CVE discovered
- The CVE is a consequence of the leak, not a separate story
- Category: Accidental Exposure + Cascading Vulnerability Discovery

**Incident B (AAGF-2026-077 proposed): Axios npm RAT Supply Chain Attack**
This is a distinct supply chain attack against a different project (axios) by a different threat actor (social engineering of the axios maintainer):
- Independent attack timeline (began 2 weeks earlier)
- Different affected parties (all npm users of axios, not Claude Code users specifically)
- Different attack vector (account compromise, not packaging error)
- Different failure mode (supply chain compromise vs. accidental disclosure)
- The coincidental same-day timing is editorially interesting but does not make these one incident technically
- Cross-reference: "Occurred on the same day as AAGF-2026-076; both affected the npm developer ecosystem"

**The "bundled axios = overlap" claim in triage is incorrect** and should not be used to justify bundling. Claude Code users were not at elevated risk from the axios RAT unless they separately ran `npm install axios` in a project that day.

---

## Open Questions

1. **KAIROS full definition:** The source only shows KAIROS as a state flag. What Anthropic-internal system sets `kairosActive = true`? Is this the remote code execution environment, the web UI bridge mode, or something else? The "persistent background agent with push notifications" description in coverage may be marketing language for the combined AutoDream + BackgroundTask UI system.

2. **Anti-distillation claim verification:** Backslash Security's claim about "fake tool definitions injected into API requests to poison competitor training data" requires direct examination of specific sourcemap paths. Not independently confirmed in this research from available sources.

3. **CVE assignment for the permission bypass:** No CVE number was found in any source for the subcommand-cap bypass vulnerability. Given it was disclosed April 2, it should be tracked.

4. **Actual download count for axios@1.14.1 and @0.30.4:** Total axios downloads on March 31 were 18M (npm API). The fraction that received the malicious versions during the ~3-hour window is unknown. Given npm's CDN caching behavior and the window size, rough estimate might be 1-3M installs, but this is speculative.

5. **Confirmed RAT infections:** No source documented confirmed victim organizations or individuals, only detection in monitoring systems (StepSecurity Harden-Runner caught it for Backstage project).

6. **Patch status for permission bypass CVE:** Research date is May 8, 2026. No advisory or patch confirmation found. Current version (v2.1.133 as of May 7) may have addressed it without announcement.

7. **Is this the first sourcemap leak from Anthropic?** InfoQ says earlier 2025 versions also had this. If so, what versions? Were they also exploited?

---

## Summary Statistics

| Field | Value |
|-------|-------|
| Primary incident date | 2026-03-30 22:36 UTC (npm publish) / 2026-03-31 (most coverage) |
| Sourcemap size | ~59.8 MB |
| TypeScript source files | 1,906 (Anthropic) + 2,850 (third-party) |
| Leak window | ~25 hours (until v2.1.89 published) |
| GitHub archive spread | 84K stars, 82K forks (per HackerNews) |
| X/Twitter viral reach | 16–21M views |
| Axios attack window | 2026-03-31 00:21–03:15 UTC (2h 54m) |
| Axios versions compromised | 1.14.1 and 0.30.4 |
| Axios daily downloads (March 31) | 18,057,508 (all versions) |
| RAT C2 | sfrclak[.]com:8000/6202033 |
| Post-leak CVE disclosed | April 2, 2026 (Adversa AI) |
| CVE number | Not confirmed |
