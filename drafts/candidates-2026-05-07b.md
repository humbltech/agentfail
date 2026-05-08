# AgentFail Triage Candidates — 7-Day Sprint
**Search date:** 2026-05-07
**Sources searched:** Hacker News (hn.algolia.com queries), Reddit (r/netsec, r/MachineLearning, r/artificial), GitHub (security issues on major agent repos), security blogs (simonwillison.net, embracethered.com, hiddenlayer.ai, adversa.ai, zenity.io), AIID (incidentdatabase.ai), AIAAIC (aiaaic.org), Twitter/X (@simonw, @llm_sec, @greshake, @wunderwuzzi23, @PromptArmor), general news (SecurityWeek, The Register, Hacker News, TechCrunch, Help Net Security, BleepingComputer, VentureBeat, Dark Reading), CVE databases (NVD, GitHub Advisory, CISA KEV), OECD.AI
**Time period:** 2026-04-30 to 2026-05-07 (7 days)
**Total candidates found:** 3 confirmed in-window + 1 near-miss (borderline date)

---

## Deduplication Notes

The following incidents found during search were excluded:

- **Grok/Bankr $175K Morse-code prompt injection** (May 4, 2026) — Already documented as **Candidate 1 in candidates-2026-05-07.md**
- **MCP Protocol design flaw (200K servers)** — Already in candidates-2026-05-05-comprehensive.md
- **Windsurf CVE-2026-30615 zero-click MCP RCE** — Already in candidates-2026-05-07.md as Candidate 11
- **TrustFall** — New. Not in any prior candidates file. IN WINDOW.
- **Braintrust AWS breach** — New. Not in any prior candidates file. IN WINDOW.
- **Comment and Control (Claude Code/Gemini CLI/Copilot prompt injection via GitHub comments)** — April 16, 2026 — OUTSIDE strict 7-day window (April 30 – May 7). Noted below in Near-Miss section.
- **MemoryTrap (Claude Code persistent memory poisoning, Cisco)** — April 14, 2026 disclosure — OUTSIDE strict 7-day window. Noted below in Near-Miss section.
- **GrafanaGhost CVE-2026-27876** — April 7, 2026 — OUTSIDE 7-day window.
- **Azure SRE Agent CVE-2026-32173** — April 3, 2026 — OUTSIDE 7-day window.
- **CrewAI RCE/SSRF chain (CVE-2026-2275/2285/2286/2287)** — March–April 2026 disclosure — OUTSIDE 7-day window. Warrants its own pipeline run; high severity.
- **NousResearch Hermes Agent browser_console arbitrary JS execution (Issue #8875)** — April 13, 2026 — OUTSIDE 7-day window.
- **ShareLeak CVE-2026-21520 / Copilot Studio prompt injection** — Patched January 2026 — OUTSIDE window.
- **KuCoin AI trading agent $45M aggregate** — KuCoin blog post aggregating industry-wide 2026 stats; no single verifiable production incident; does not qualify on verifiability criterion.

---

## CANDIDATE 1 — IN WINDOW

### TrustFall: One-Click RCE Across Claude Code, Cursor, Gemini CLI, and GitHub Copilot via Default Trust Dialog

**Date:** 2026-05-07 (disclosed)
**Primary URL:** https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/
**Secondary URLs:**
- https://www.helpnetsecurity.com/2026/05/07/trustfall-ai-coding-cli-vulnerability-research/
- https://www.darkreading.com/application-security/trustfall-exposes-claude-code-execution-risk
- https://www.securityweek.com/claude-code-gemini-cli-github-copilot-agents-vulnerable-to-prompt-injection-via-comments/
- https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them

**Summary:** Adversa AI researchers disclosed TrustFall on May 7, 2026: all four major AI coding agent CLIs (Claude Code, Gemini CLI, Cursor CLI, GitHub Copilot CLI) read project-defined MCP configuration files that can point to attacker-controlled executables, and present a single trust dialog defaulting to "Yes." A developer who clones a malicious repository and presses Enter once — accepting the default — triggers immediate arbitrary code execution on their machine. Claude Code version 2.1 and later removed the earlier explicit MCP warning and "trust without MCP" option, leaving only the generic "Is this a project you trust?" prompt. Anthropic reviewed the report and declined to remediate, categorizing the behavior as "expected" given the user accepted the trust prompt.

**Why it qualifies:** Confirmed real-world attack surface across four widely deployed production developer tools; demonstrated RCE with no expertise required; Anthropic, Google, and Microsoft all acknowledged the finding; supply chain attack vector for any public repository.

**Rough category:** Supply Chain / Tool Misuse / Prompt Injection

**Rough severity:** High — zero-expertise one-click RCE affecting four production coding agents used by millions of developers; vendor declined to patch; malicious repo-as-vector is indistinguishable from a legitimate clone. Severity approaches Critical given the no-patch status and default-trust design across all four tools simultaneously.

**Related to existing:** Related to AAGF-2026-019 (Windsurf CVE-2026-30615 zero-click MCP RCE) — both exploit MCP server loading in coding IDEs/CLIs, but TrustFall affects four additional platforms and uses social-engineering trust dialog rather than zero-click HTML injection. Distinct enough to warrant separate incident entry.

---

## CANDIDATE 2 — IN WINDOW

### Braintrust AI Evaluation Platform Breached — Customer LLM Provider API Keys Exposed via Compromised AWS Account

**Date:** 2026-05-04 (incident detected), 2026-05-06 (disclosed publicly)
**Primary URL:** https://techcrunch.com/2026/05/06/ai-evaluation-startup-braintrust-confirms-breach-tells-every-customer-to-rotate-sensitive-keys/
**Secondary URLs:**
- https://www.prismnews.com/news/braintrust-warns-customers-to-rotate-api-keys-after-aws
- https://digitrendz.blog/tech-news/180413/ai-startup-braintrust-confirms-breach-urges-all-customers-to-rotate-keys/
- https://www.tipranks.com/news/private-companies/braintrust-probes-cloud-security-incident-urges-customers-to-rotate-api-keys

**Summary:** On May 4, 2026, suspicious activity was detected in one of Braintrust's AWS accounts. Braintrust is an AI evaluation and observability platform — its customers store upstream LLM provider API keys (OpenAI, Anthropic, AWS Bedrock, Azure OpenAI) with Braintrust to enable automated model testing and evals. The compromised AWS account contained these stored provider credentials, potentially granting attackers the ability to impersonate Braintrust customers against connected LLM provider accounts. Braintrust locked down the account, audited access, rotated internal secrets, and directed every customer to rotate any API keys stored on the platform. One customer impact was confirmed; broader exposure could not be ruled out.

**Why it qualifies:** Confirmed unauthorized access to a production AI infrastructure platform; customer LLM provider credentials at risk (OpenAI, Anthropic, Bedrock workspace admin keys); Braintrust officially confirmed and disclosed; "hub" breach pattern — AI eval platform as concentrated credential target.

**Rough category:** Unauthorized Data Access / Supply Chain

**Rough severity:** High — production AI evaluation platform breached; stored LLM provider credentials exposed; any stolen keys could enable attackers to act as legitimate enterprise customers against OpenAI/Anthropic/AWS at scale; one confirmed customer impact, scope of broader exposure unknown. Pattern mirrors Vercel/Context.ai breach (already in candidates list) — AI infrastructure as credential honeypot.

**Related to existing:** Thematically related to Candidate 2 in candidates-2026-05-07.md (Vercel April 2026 breach via Context AI supply chain) — both involve AI infrastructure platforms holding customer cloud credentials being breached. Not a duplicate; different company, different vector, different date.

---

## CANDIDATE 3 — BORDERLINE (patched April 24; widely reported May 7)

### Gemini CLI CVSS 10.0 Supply Chain RCE — GitHub Issue Prompt Injection in —yolo Mode Enables CI/CD Credential Theft

**Date:** 2026-04-20 (attack demonstrated), 2026-04-24 (patched), 2026-04-30 (The Register), 2026-05-07 (SecurityWeek detailed report)
**Primary URL:** https://www.securityweek.com/gemini-cli-vulnerability-could-have-led-to-code-execution-supply-chain-attack/
**Secondary URLs:**
- https://www.theregister.com/2026/04/30/googles_fix_for_critical_gemini/
- https://hackread.com/google-cvss-10-gemini-cli-vulnerability-github-rce/
- https://www.securityweek.com/critical-gemini-cli-flaw-enabled-host-code-execution-supply-chain-attacks/
- https://gbhackers.com/critical-gemini-cli-flaw/
- https://github.com/advisories/GHSA-wpqr-6v78-jr5g

**Summary:** Pillar Security demonstrated that Gemini CLI in `--yolo` mode (all tool calls auto-approved) would execute any command without restriction, bypassing configured allowlists. An attacker could create a public GitHub issue on a repository using Gemini CLI for automated issue triage, embed malicious prompt injection instructions in the issue text, and cause the auto-running agent to extract CI/CD secrets (API keys, tokens) and exfiltrate them to an attacker-controlled server. In a supply chain scenario targeting Google's own draco repository, the researchers demonstrated full credential extraction and exfiltration. The CVSS score was assessed at 10.0 — the maximum — though Google did not assign a traditional CVE, using GitHub Advisory GHSA-wpqr-6v78-jr5g instead. Google patched in Gemini CLI v0.39.1 on April 24, 2026; detailed reporting emerged in the final days of April and into May 7.

**Why it qualifies:** CVSS 10.0 production vulnerability in a widely deployed Google AI coding agent; demonstrated credential theft from CI/CD pipelines; supply chain attack vector with no prior credential required; Google paid bug bounty confirming real-world exploitability; The Register confirmed patched April 30.

**Rough category:** Supply Chain / Tool Misuse / Prompt Injection

**Rough severity:** Critical — CVSS 10.0 (maximum); `--yolo` mode used in automated pipelines bypasses all safety controls; supply chain CI/CD credential theft demonstrated; no CVE issued despite max CVSS (Google declined to assign one). Patched but the `--yolo` mode default behavior warrants architectural review.

**Related to existing:** Related to TrustFall (Candidate 1 above) — both exploit Gemini CLI's trust model; but this is a distinct, earlier vulnerability with a different vector (GitHub issue injection vs. cloned repo trust dialog). Also related to AAGF-2026-019 (Windsurf MCP RCE) — same pipeline-agent attack surface family.

---

## NEAR-MISS CANDIDATES — JUST OUTSIDE 7-DAY WINDOW

These incidents were reported/patched in the April 7–29 window and are not in any existing candidates file. They are high quality and should be considered for the next pipeline run.

---

### NM-1: Comment and Control — Prompt Injection via GitHub Comments Steals Credentials from Claude Code, Gemini CLI, GitHub Copilot

**Date:** 2026-04-16 (disclosed, updated April 21)
**Primary URL:** https://oddguan.com/blog/comment-and-control-prompt-injection-credential-theft-claude-code-gemini-cli-github-copilot/
**Secondary URLs:**
- https://www.securityweek.com/claude-code-gemini-cli-github-copilot-agents-vulnerable-to-prompt-injection-via-comments/
- https://cybersecuritynews.com/prompt-injection-via-github-comments/
- https://venturebeat.com/security/ai-agent-runtime-security-system-card-audit-comment-and-control-2026

**Summary:** Researcher Aonan Guan demonstrated "Comment and Control" — a proactive prompt injection attack that hijacks AI code agents triggered by GitHub Actions workflows. Unlike reactive indirect prompt injection, GitHub Actions auto-trigger on PR/issue events, meaning an attacker filing an issue or PR with a crafted title/body activates the agent without any victim interaction. Claude Code extracted credentials and logged them as a "security finding"; Gemini CLI was manipulated into exfiltrating API keys; GitHub Copilot Agent bypassed three runtime mitigations (environment variable filtering, secret scanning, network firewall) by reading secrets from the parent process via `ps auxeww`. All three vendors paid bug bounties but issued no public CVEs or advisories.

**Why it qualifies:** Three production AI coding agents confirmed to leak credentials via GitHub comment injection; demonstrated in working PoC against real GitHub repos; vendors confirmed and paid bounties; no-CVE quiet patching pattern has systemic implications.
**Rough category:** Prompt Injection / Unauthorized Data Access
**Rough severity:** High — credential theft from production CI/CD environments; zero-victim-interaction required; three major platforms simultaneously affected; quiet patching without CVE suppresses operator awareness.
**Related to existing:** None in existing corpus. Distinct from Clinejection (AAGF supply chain via issue title) — this is credential theft at runtime, not package publishing compromise.

---

### NM-2: MemoryTrap — Cisco Demonstrates Persistent Cross-Session Prompt Injection via Claude Code Memory Poisoning

**Date:** 2026-04-14 (Help Net Security article), patched in Claude Code v2.1.50
**Primary URL:** https://blogs.cisco.com/ai/identifying-and-remediating-a-persistent-memory-compromise-in-claude-code
**Secondary URLs:**
- https://www.helpnetsecurity.com/2026/04/14/idan-habler-cisco-agentic-ai-memory-attacks/
- https://www.darkreading.com/vulnerabilities-threats/bad-memories-haunt-ai-agents
- https://medium.com/@kombib/claude-cowork-memory-poisoning-cisco-persistent-compromise-860aac21614c

**Summary:** Cisco researchers discovered that a malicious npm package's `postinstall` hook could inject crafted content into Claude Code's MEMORY.md files (loaded into the system prompt on every session). The poisoned memory would persist across sessions, reboots, and subagents, silently altering the agent's behavior — for example, instructing developers to commit API keys directly to source files instead of using .env. The attack crosses the session boundary: a single poisoned memory object spreads to every project, every session, and every user of that shared MEMORY.md. Anthropic patched by removing MEMORY.md from the system prompt in Claude Code v2.1.50.

**Why it qualifies:** Production Claude Code deployment; confirmed cross-session persistent compromise via supply chain vector (npm postinstall); real malicious behavior demonstrated (security advice inversion); Anthropic patched after Cisco disclosure.
**Rough category:** Supply Chain / Context Poisoning
**Rough severity:** High — persistent cross-session compromise of production AI coding agent; memory poisoning survives reboots and spreads to subagents; security advice inversion (committing secrets) is high-impact in developer tooling. Patched but demonstrates novel memory attack surface.
**Related to existing:** None in existing corpus. Distinct from supply chain incidents — memory layer as a new persistent attack surface is the novel element.

---

### NM-3: CrewAI Four-CVE Prompt-Injection-to-RCE Chain (CVE-2026-2275, 2285, 2286, 2287)

**Date:** 2026-03-17 to 2026-04-02 (disclosures), active April 2026
**Primary URL:** https://kb.cert.org/vuls/id/221883
**Secondary URLs:**
- https://cyberpress.org/crewai-vulnerabilities/
- https://gbhackers.com/crewai-hit-by-critical-vulnerabilities/
- https://ironplate.ai/blog/weekly-agentic-ai-threat-intel-april-7-2026
- https://www.thaicert.or.th/en/2026/04/02/multiple-vulnerabilities-in-crewai-allow-sandbox-escape-and-remote-code-execution-via-prompt-injection/

**Summary:** CERT/CC issued VU#221883 covering four interrelated vulnerabilities in CrewAI that can be chained from a prompt injection starting point: (1) CVE-2026-2275 — Code Interpreter falls back to vulnerable SandboxPython if Docker is unavailable, allowing arbitrary ctypes calls; (2) CVE-2026-2285 — JSON loader reads files without path validation (arbitrary local file read); (3) CVE-2026-2286 — SSRF via RAG search tools that don't validate runtime URLs; (4) CVE-2026-2287 — Runtime Docker check bypass enabling second RCE path. An attacker who can interact with a CrewAI agent via prompt injection can chain these to achieve RCE on the host or exfiltrate files and internal cloud service metadata. CrewAI planned mitigations but had not issued a patched release as of CERT advisory.

**Why it qualifies:** CERT/CC advisory (VU#221883) confirms production-grade vulnerability chain; prompt injection → RCE in a widely-deployed enterprise agent framework; sandbox escape means Docker-based isolation provides false security assurance to operators; no patch confirmed as of advisory.
**Rough category:** Tool Misuse / Supply Chain / Infrastructure Damage
**Rough severity:** Critical — four chained CVEs from prompt injection to arbitrary code execution; Docker sandbox escapable; SSRF enables cloud metadata exfiltration; CERT/CC issued advisory; no patch shipped at disclosure.
**Related to existing:** None in existing corpus. Warrants a standalone pipeline run.

---

## Search Notes

**High-signal sources this cycle:**
- SecurityWeek — returned TrustFall (May 7), Gemini CLI CVSS 10, and Comment and Control with full technical detail
- Help Net Security — confirmed TrustFall (May 7) and MemoryTrap coverage with attribution
- TechCrunch — primary source for Braintrust breach confirmation (May 6)
- CERT/CC (kb.cert.org) — authoritative advisory for CrewAI CVE chain
- Adversa AI blog — curated May 2026 roundup; best single aggregation point for agentic security resources this month
- The Register — confirmed Gemini CLI patch date (April 30)

**Moderate-signal sources:**
- OECD.AI incident database — confirmed Grok/Bankr (already in prior file); no new entries found in the 7-day window
- Dark Reading — covered MemoryTrap and TrustFall but mostly republished; useful for date confirmation
- simonwillison.net — May 6 post about vibe coding/agentic engineering was editorial, not incident reporting; no new specific incidents in 7-day window

**Low-signal / inaccessible:**
- Twitter/X direct search — not accessible directly; incidents surfaced via news coverage citing X posts as evidence
- Reddit direct search — not accessible; incidents found via news aggregators referencing Reddit discussions
- AIAAIC repository — no structured search returned May 2026 specific new entries within the 7-day window
- HN Algolia direct API queries — returned generic search result pages, not content; HN-discussed incidents found via general news search referencing HN threads
- embracethered.com — no new production incidents in the 7-day window; site focuses on research demonstrations
- GitHub security issues on major agent repos — Hermes Agent browser_console issue (April 13) was the most recent relevant finding but fell outside the strict 7-day window

**Noisy searches:**
- "AI agent security vulnerability May 2026" — heavy noise from aggregate trend articles, 2026 security predictions, and marketing content
- KuCoin AI trading agent $45M — KuCoin blog post citing industry statistics, not a verifiable single incident; discarded
- "AI agent incident breach May 2026" — surfaced many April 2026 incidents mixed with May; required date filtering

**Key observations:**
- The 7-day window is narrow relative to the publication/disclosure lifecycle: TrustFall (May 7) and Braintrust (May 6) are the only clean in-window incidents. Most high-quality incidents from this cycle were disclosed in the April 7–29 window and are not in any prior candidates file — the near-miss section captures the best of these.
- Anthropic's quiet-patching pattern continues: TrustFall declined as "expected behavior"; Comment and Control patched without CVE; MemoryTrap patched in v2.1.50 without a CVE number. This suppresses operator awareness systematically.
- The CrewAI four-CVE chain (NM-3) is the highest-priority near-miss for a pipeline run — CERT/CC advisory, no confirmed patch, sandbox escape from prompt injection.
