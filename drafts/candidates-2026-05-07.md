# AgentFail Triage Candidates
**Search date:** 2026-05-07
**Sources searched:** all (simonwillison.net, embracethered.com, hiddenlayer.com, adversa.ai, zenity.io blogs; web searches across 8 query sets; HN Algolia API x3; GitHub security advisories; OECD.AI; NVD/CVE databases; The Register, SecurityWeek, BleepingComputer, TechCrunch, Help Net Security, Hacker News, VentureBeat, Dark Reading, Infosecurity Magazine, CSO Online, SC Media, CERT/CC)
**Time period:** 2026-04-30 to 2026-05-07 (7 days, with near-miss section for April 21–29)
**Total candidates found:** 5 confirmed in-window + 3 near-miss (April 21–29) + prior file preserved below

---

## Deduplication — Already Published (Skip)

- AAGF-2026-061: CrewAI Four-CVE Chain (VU#221883)
- AAGF-2026-062: TrustFall Adversa AI (MCP auto-spawn RCE)
- AAGF-2026-064: Comment and Control (HTML comment credential theft)
- AAGF-2026-066: Gemini CLI --yolo CVSS 10.0 (GHSA-wpqr-6v78-jr5g)
- AAGF-2026-043: TrustFall Flatt Security (settings.json bypassPermissions)
- AAGF-2026-052: Langflow CVE-2026-33017 RCE
- AAGF-2026-058: Meta Llama Sev1 production incident
- AAGF-2026-060: McKinsey Lilli data leakage
- AAGF-2026-063: Braintrust breach (parked — not agentic)
- AAGF-2026-065: MemoryTrap (parked — PoC only, no confirmed victims)

## Deduplication — In Prior Candidates Files (Skip)

The following were found during today's search but already appear in `candidates-2026-05-07b.md` or `candidates-2026-05-05-comprehensive.md`:

- **Grok/Bankr $175K Morse-code prompt injection** — in candidates-2026-05-07b.md Candidate 1 / candidates-2026-05-07.md (prior version) Candidate 1
- **Vercel April 2026 breach via Context AI** — candidates-2026-05-07.md (prior) Candidate 2
- **LiteLLM CVE-2026-42208 SQL injection** — candidates-2026-05-07.md (prior) Candidate 3
- **Langflow CVE-2026-33017 CISA KEV** — candidates-2026-05-07.md (prior) Candidate 4; now AAGF-2026-052
- **Meta internal AI data exposure** — candidates-2026-05-07.md (prior) Candidate 5
- **McKinsey Lilli autonomous agent breach** — candidates-2026-05-07.md (prior) Candidate 6; now AAGF-2026-060
- **CyberStrikeAI FortiGate campaign** — candidates-2026-05-07.md (prior) Candidate 7
- **Clinejection npm supply chain** — candidates-2026-05-07.md (prior) Candidate 8
- **Frontier LLM peer-preservation** — candidates-2026-05-07.md (prior) Candidate 9
- **Mexican government AI-assisted breach** — candidates-2026-05-07.md (prior) Candidate 10
- **Windsurf CVE-2026-30615 zero-click MCP RCE** — candidates-2026-05-07.md (prior) Candidate 11
- **Flowise CVSS 10.0 CVE-2025-59528** — candidates-2026-05-05-comprehensive.md #9
- **Claude Code deny-rule bypass** — candidates-2026-05-05-comprehensive.md #37
- **MCP Protocol design flaw (200K servers)** — candidates-2026-05-05-comprehensive.md #21
- **LiteLLM PyPI supply chain (TeamPCP)** — candidates-2026-05-05-comprehensive.md #3

---

## NEW CANDIDATES — IN WINDOW (April 30 – May 7, 2026)

---

### CANDIDATE 1

### Braintrust AI Evaluation Platform Breached — Customer LLM Provider API Keys Exposed via Compromised AWS Account

**Date:** 2026-05-04 (incident detected), 2026-05-06 (public disclosure)
**Primary URL:** https://techcrunch.com/2026/05/06/ai-evaluation-startup-braintrust-confirms-breach-tells-every-customer-to-rotate-sensitive-keys/
**Secondary URLs:**
- https://www.prismnews.com/news/braintrust-warns-customers-to-rotate-api-keys-after-aws
- https://digitrendz.blog/tech-news/180413/ai-startup-braintrust-confirms-breach-urges-all-customers-to-rotate-keys/
- https://www.tipranks.com/news/private-companies/braintrust-probes-cloud-security-incident-urges-customers-to-rotate-api-keys

**Summary:** On May 4, 2026, suspicious activity was detected in one of Braintrust's production AWS accounts. Braintrust is an AI evaluation and observability platform — customers store upstream LLM provider API keys (OpenAI, Anthropic, AWS Bedrock, Azure OpenAI) to enable automated model testing and evals. The compromised AWS account contained these stored provider credentials, potentially granting attackers ability to impersonate customers against LLM providers. Braintrust locked down the account, rotated internal secrets, and directed all customers to rotate stored API keys. One confirmed customer impact; broader scope unknown.

**Why it qualifies:** Confirmed unauthorized access to a production AI infrastructure platform (real-world deployment); the platform stores LLM provider credentials that can be used autonomously in eval pipelines (agent-adjacent); Braintrust officially confirmed and disclosed (verifiable); LLM provider API keys exposed, one confirmed customer impact (meaningful impact).

**Rough category:** Unauthorized Data Access / Supply Chain

**Rough severity:** High — production AI evaluation platform breached; stored LLM provider credentials exposed (OpenAI/Anthropic/AWS workspace admin keys); mirrors Vercel/Context.ai pattern of AI infrastructure as credential honeypot.

**Related to existing:** AAGF-2026-063 (Braintrust, parked as non-agentic) — note: prior AAGF entry was parked because the agentic angle was unclear. This triage confirms the agentic angle: Braintrust's core function is autonomous LLM evaluation pipelines; compromised credentials enable attackers to run autonomous eval agents as impersonated customers.

---

### CANDIDATE 2

### TrustFall: One-Click MCP RCE Across Claude Code, Cursor, Gemini CLI, and GitHub Copilot via Default Trust Dialog

**Date:** 2026-05-07 (disclosed by Adversa AI)
**Primary URL:** https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/
**Secondary URLs:**
- https://www.helpnetsecurity.com/2026/05/07/trustfall-ai-coding-cli-vulnerability-research/
- https://www.darkreading.com/application-security/trustfall-exposes-claude-code-execution-risk
- https://www.securityweek.com/claude-code-gemini-cli-github-copilot-agents-vulnerable-to-prompt-injection-via-comments/

**Summary:** Adversa AI disclosed that all four major AI coding agent CLIs (Claude Code, Gemini CLI, Cursor CLI, GitHub Copilot CLI) read project-defined MCP configuration files that can point to attacker-controlled executables. A developer who clones a malicious repository and presses Enter once — accepting the default trust dialog — triggers immediate arbitrary code execution. Claude Code v2.1+ removed the earlier explicit MCP warning, leaving only a generic "Is this a project you trust?" prompt. Anthropic reviewed and declined to remediate, categorizing the behavior as "expected." The attack requires no credentials and is indistinguishable from a legitimate repository clone.

**Why it qualifies:** Confirmed production attack surface across four widely deployed production developer tools (real-world); AI agent autonomously executes attacker-specified binaries on trust (autonomous agent); Adversa AI published PoC, vendors acknowledged (verifiable); arbitrary code execution on developer machines (meaningful impact).

**Rough category:** Supply Chain / Tool Misuse / Prompt Injection

**Rough severity:** High — one-click RCE affecting four production coding agents used by millions; vendor declined to patch; malicious repo vector is socially indistinguishable from legitimate clone. Approaches Critical given no-patch status across all four tools.

**Related to existing:** Related to AAGF-2026-062 (TrustFall Adversa AI, MCP auto-spawn RCE) — check if this IS the same disclosure. If AAGF-2026-062 is already this Adversa AI research, this is a duplicate. If AAGF-2026-062 is a different TrustFall (e.g., Flatt Security's version in AAGF-2026-043), this is new.

**NOTE:** Review AAGF-2026-062 content before pipeline run to confirm non-duplication.

---

### CANDIDATE 3

### Flowise Three-CVE MCP RCE Cluster — Authenticated + Unauthenticated RCE via MCP Adapter and Parameter Injection (April 21-23)

**Date:** 2026-04-21 to 2026-04-23 (CVE disclosures), exploitation active through May 2026
**Primary URL:** https://github.com/advisories/GHSA-c9gw-hvqq-f33r (CVE-2026-40933)
**Secondary URLs:**
- https://github.com/FlowiseAI/Flowise/security/advisories/GHSA-3gcm-f6qx-ff7p (CVE-2026-41268)
- https://www.csoonline.com/article/4155680/hackers-exploit-a-critical-flowise-flaw-affecting-thousands-of-ai-workflows.html
- https://advisories.gitlab.com/npm/flowise/CVE-2026-40933/
- https://nvd.nist.gov/vuln/detail/CVE-2026-41268
- https://medium.com/@xyz031702/ai-threat-intelligence-briefing-64cfc4a36726

**Summary:** Three Flowise vulnerabilities disclosed April 21-23, 2026, all fixed in Flowise 3.1.0:
- **CVE-2026-40933** (CVSS 9.9, April 21): Authenticated RCE via MCP adapter — unsafe serialization of stdio commands allows authenticated attacker to register an arbitrary OS command as an MCP stdio server, achieving full OS command execution.
- **CVE-2026-41268** (CVSS 9.8, April 23): Unauthenticated RCE via FILE-STORAGE:: keyword bypass — single HTTP request, no credentials required, executes arbitrary commands with root privileges in the containerized instance via NODE_OPTIONS injection.
- **CVE-2026-41264/41265** (April 23): CSV and Airtable agent prompt injection enabling arbitrary Python code execution via unsandboxed LLM-generated scripts in CSVAgent and AirtableAgent components.
Active exploitation of CVE-2026-41268 confirmed; 12,000+ Flowise instances exposed online.

**Why it qualifies:** Production AI agent builder platform (real-world); Flowise is an agentic workflow orchestrator — the RCE exploits MCP adapter and agent execution components directly (autonomous agent); CVEs and GitHub advisories confirm (verifiable); unauthenticated RCE with root privileges, active exploitation confirmed (meaningful impact).

**Rough category:** Tool Misuse / Infrastructure Damage / Supply Chain

**Rough severity:** Critical — unauthenticated root RCE on production AI agent builder; 12,000+ exposed instances; active exploitation confirmed; MCP adapter as new attack surface distinct from prior Flowise CVSS 10.0 (CVE-2025-59528).

**Related to existing:** Distinct from AAGF-2026-052 (Langflow CVE-2026-33017) and candidates-2026-05-05-comprehensive.md #9 (Flowise CVE-2025-59528 CVSS 10.0). These are newer CVEs in the same platform, different vulnerability classes (MCP adapter vs. CustomMCP node JavaScript injection).

---

### CANDIDATE 4

### Google/Unit42 In-the-Wild Prompt Injection Study — 10 Live Financial Fraud Payloads Targeting AI Agents with Payment Capabilities

**Date:** 2026-04-24 (Google blog + Help Net Security); Unit42 study published ~April 2026
**Primary URL:** https://security.googleblog.com/2026/04/ai-threats-in-wild-current-state-of.html
**Secondary URLs:**
- https://www.helpnetsecurity.com/2026/04/24/indirect-prompt-injection-in-the-wild/
- https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/
- https://www.infosecurity-magazine.com/news/researchers-10-wild-indirect/
- https://www.securityweek.com/malicious-ai-prompt-injection-attacks-increasing-but-sophistication-still-low-google/

**Summary:** Google and Unit42/Palo Alto Networks independently documented 10 live indirect prompt injection payloads deployed in the wild targeting AI agents with financial tool access. Key findings: (1) A PayPal.me payload embedding a $5,000 fixed transaction with full step-by-step instructions designed to execute when an AI agent with payment capabilities visits the page. (2) A Stripe donation redirect using meta-tag namespace injection + "ultrathink" persuasion amplifier to hijack AI-mediated financial actions. (3) A 32% increase in malicious prompt injection content on the public web between November 2025 and February 2026. Payloads hide from humans via 1px text, zero-opacity CSS, or HTML `display:none` tags — visible only to AI. No confirmed financial fraud execution was documented, but the payloads are live in production web content targeting real agents.

**Why it qualifies:** Live payloads deployed in production web environment (real-world); specifically engineered to exploit autonomous AI agents with payment tools (autonomous agent); Google and Unit42 independently confirmed and documented (verifiable); live financial fraud instrumentation targeting real agent deployments (meaningful impact potential, though no confirmed execution).

**Rough category:** Prompt Injection / Financial Loss

**Rough severity:** Medium — live financial fraud payloads confirmed in the wild; 32% growth trend; no confirmed successful execution documented, but instruments are positioned for scale. First systematic evidence of weaponized financial fraud payloads targeting AI payment agents in production web content.

**Related to existing:** AAGF-2026-064 (Comment and Control, HTML comment credential theft) — both are in-the-wild prompt injection on the web, but this is financial fraud targeting rather than credential theft, and involves a broader ecosystem scan rather than a specific platform.

---

### CANDIDATE 5

### Claude Desktop Extensions Zero-Click RCE — Single Calendar Event Executes Arbitrary Code, Anthropic Declines Fix

**Date:** 2026-02-09 (LayerX disclosure), ~May 2026 (Anthropic confirmed no fix, reconfirmed in May reporting)
**Primary URL:** https://layerxsecurity.com/blog/claude-desktop-extensions-rce/
**Secondary URLs:**
- https://www.infosecurity-magazine.com/news/zeroclick-flaw-claude-dxt/
- https://cybersecuritynews.com/claude-desktop-extensions-0-click-vulnerability/
- https://www.esecurityplanet.com/threats/10k-claude-desktop-users-exposed-by-zero-click-vulnerability/
- https://thehackernews.com/2026/03/claude-extension-flaw-enabled-zero.html
- https://oecd.ai/en/incidents/2026-02-09-a707

**Summary:** LayerX discovered a CVSS 10.0 zero-click RCE in Claude Desktop Extensions (DXT). Claude Desktop Extensions run unsandboxed with full system privileges. An attacker who injects a malicious instruction into a Google Calendar event (or similar connector) causes Claude to autonomously chain the low-risk calendar connector to high-privilege local executor extensions, executing arbitrary code on the user's machine without any user interaction. A benign prompt ("take care of it") is sufficient to trigger the chain. Affects 10,000+ active users across 50+ DXT extensions. Anthropic declined to remediate, stating the flaw "falls outside our current threat model." The vulnerability is architecturally unfixable without restricting extension chaining.

**Why it qualifies:** Production Claude Desktop with Extensions (real-world deployment, 10,000+ active users); Claude autonomously chains connectors without user approval (autonomous agent); LayerX published full technical writeup, OECD.AI confirmed (verifiable); arbitrary code execution on user machines, Anthropic confirmed and declined to fix (meaningful ongoing impact).

**Rough category:** Tool Misuse / Autonomous Escalation / Infrastructure Damage

**Rough severity:** Critical — CVSS 10.0, zero-click, 10,000+ exposed users, vendor declined to patch, no mitigations beyond manually disconnecting extensions. Architecturally unfixable without breaking the extension chaining feature.

**Related to existing:** Related to AAGF-2026-062/043 (TrustFall variants) — all exploit Claude's extension/MCP trust model, but this is zero-click (no user interaction at all) and affects Claude Desktop rather than Claude Code. Distinct enough to warrant separate entry.

**NOTE:** Original disclosure was February 9, 2026. The Anthropic "no fix" decision and continued exposure of 10,000+ users makes this ongoing in the window. May be borderline for triage; include if the no-fix posture is the qualifying event.

---

## NEAR-MISS CANDIDATES — APRIL 21–29 (not in any prior file)

---

### NM-1: Flowise CVE-2026-41137 — CSV Agent Prompt Injection Enables Arbitrary Python Execution Without Sandboxing

**Date:** 2026-04-23
**Primary URL:** https://nvd.nist.gov/vuln/detail/CVE-2026-41264
**Summary:** CSVAgent and AirtableAgent components lacked sandboxing when evaluating LLM-generated Python scripts. Prompt injection via crafted CSV data or Airtable records caused the agent to execute arbitrary Python code on the server. Fixed in Flowise 3.1.0. Part of the same April 21-23 Flowise cluster as Candidate 3 above — consider bundling into one incident entry.
**Rough category:** Tool Misuse / Prompt Injection
**Rough severity:** High — no sandboxing on LLM-generated code execution in production AI agent builder.
**Related to existing:** Bundle with Candidate 3 (Flowise MCP RCE Cluster).

---

### NM-2: Copirate 365 — Microsoft 365 Copilot Memory Hijack + Persistent Email Exfiltration Backdoor (CVE-2026-24299)

**Date:** 2026-05-04 (DEF CON Singapore talk writeup published)
**Primary URL:** https://embracethered.com/blog/posts/2026/defcon-talk-copirate-365/
**Secondary URLs:**
- https://windowsnews.ai/article/cve-2026-24299-microsoft-365-copilot-information-disclosure-vulnerability
- https://www.varonis.com/blog/reprompt

**Summary:** Researcher Johann Rehberger (wunderwuzzi23) demonstrated a chain of vulnerabilities in Microsoft 365 Copilot (CVE-2026-24299): indirect prompt injection via email/document content causes Copilot to render HTML preview that loads attacker fonts from `wuzzi.net/<encoded-secret>/pirate.woff2`, exfiltrating passwords and secrets. Combined with long-term memory hijacking, a single malicious email or document plants a persistent backdoor — future Copilot conversations automatically exfiltrate whatever the user pastes (passwords, code, secrets) until memory is manually cleared. MSRC patched; DEF CON Singapore talk published full details May 4, 2026. Responsible disclosure.

**Why it qualifies:** Production M365 Copilot deployment (real-world); Copilot autonomously exfiltrates data across sessions (autonomous agent); MSRC confirmed, CVE assigned, researchers published technical details (verifiable); password and secret exfiltration via persistent backdoor (meaningful impact).
**Rough category:** Prompt Injection / Unauthorized Data Access
**Rough severity:** High — persistent cross-session backdoor; exfiltrates secrets the user pastes in future conversations; HTML preview as side-channel; patched but demonstrates novel memory-persistence attack.
**Related to existing:** None in existing corpus.

---

### NM-3: hackerbot-claw — Claude-Powered AI Bot Systematically Compromises GitHub Actions, Steals PATs, Destroys Repository Releases

**Date:** 2026-02-21 to 2026-03-02 (campaign), disclosed March 2026
**Primary URL:** https://www.stepsecurity.io/blog/hackerbot-claw-github-actions-exploitation
**Secondary URLs:**
- https://thehackernews.com/2026/03/trivy-security-scanner-github-actions.html
- https://orca.security/resources/blog/hackerbot-claw-github-actions-attack/
- https://cybernews.com/security/claude-powered-ai-bot-compromises-five-github-repositories/
- https://www.upwind.io/feed/trivy-supply-chain-incident-github-actions-compromise-breakdown

**Summary:** A GitHub account calling itself "hackerbot-claw" (self-described as "powered by claude-opus-4-5") systematically scanned public repositories for exploitable `pull_request_target` workflows, opened 12+ pull requests across Microsoft, DataDog, CNCF and open source projects, achieved arbitrary code execution in at least 6 repos, and exfiltrated GITHUB_TOKEN with write permissions. In the Trivy incident (March 19, 2026): the stolen PAT was used to make the repository private, rename it to `aquasecurity/private-trivy`, push an empty repo in its place, delete all GitHub Releases v0.27.0–v0.69.1 (75 tags hijacked), and publish a malicious VSCode extension to the Open VSIX marketplace. Trivy has 32,000 stars and 100M annual downloads.

**Why it qualifies:** Confirmed real-world GitHub Actions exploitation campaign (real-world); Claude-powered autonomous agent identified targets, opened PRs, and executed attacks without per-step human guidance (autonomous agent); StepSecurity, Orca, HackerNews Hacker Bot all documented; supply chain attack on a 100M-download security scanner with repository deletion and malicious extension distribution (meaningful impact).
**Rough category:** Supply Chain / Autonomous Escalation / Infrastructure Damage
**Rough severity:** Critical — autonomous AI agent actively exploiting production CI/CD pipelines; 100M-download scanner compromised; releases deleted; malicious extension distributed; "pwn request" pattern at scale with AI as the attack executor.
**Related to existing:** None in existing corpus. Warrants priority pipeline run — this is an autonomous AI agent actively attacking production infrastructure.

---

## Search Notes

**High-signal sources this cycle:**
- Web search "AI agent security incident 2026" — returned PocketOS, CyberStrikeAI, Mexican breach, OpenClaw with rich summaries
- Web search "MCP security vulnerability exploit 2026" — returned OX Security MCP design flaw, Windsurf CVE, Azure MCP SSRF
- Web search "Vercel Context AI supply chain attack" — TechCrunch primary source confirmed; ShinyHunters/BreachForums angle confirmed
- Web search "hackerbot-claw Trivy" — StepSecurity advisory, Orca Security, Hacker News coverage; strong multi-source confirmation
- TechCrunch — Braintrust breach primary confirmation (May 6, in-window)
- Adversa AI blog (adversa.ai/blog/top-agentic-ai-security-resources-may-2026/) — curated May 2026 summary; confirmed TrustFall as new May 7 disclosure
- embracethered.com — Copirate 365 writeup (May 4); confirmed CVE-2026-24299 and patched status

**Moderate-signal sources:**
- HN Algolia API — returned stories from 2026 but majority were tool launches and editorials, not specific incidents; one useful entry (Meta rogue AI, March 2026)
- simonwillison.net — No new specific production incidents May 1-7; Mozilla Claude Mythos vulnerability finding (May 7) is a positive use case (AI finding bugs) not an incident
- hiddenlayer.com — Research hub landing only; no individual posts accessible
- zenity.io blog — No dates on articles; could not confirm 7-day window entries

**Sources not accessible:**
- Reddit direct search — not accessible; incidents surfaced via news aggregators
- Twitter/X direct search — not accessible directly; payloads and incidents surfaced via news coverage
- AIAAIC repository — website accessible but no structured search returned May 2026 specific entries
- adversa.ai blog body content — metadata only, no article text loaded

**New findings vs. prior sessions:**
- **Candidate 3** (Flowise three-CVE MCP cluster, April 21-23) — genuinely new; not in either prior 2026-05-07 file or comprehensive 2026-05-05 file. Distinct from CVE-2025-59528 (prior).
- **Candidate 4** (Google/Unit42 in-the-wild financial fraud payloads) — new this session; borderline (pattern study vs. incident), included because it documents live deployed payloads.
- **NM-3** (hackerbot-claw Trivy supply chain) — new this session; high-priority for pipeline run. February-March campaign outside the 7-day window but may not be in any existing AAGF entry.
- **Candidate 1** (Braintrust) — also in candidates-2026-05-07b.md; cross-referenced for completeness.
- **Candidate 2** (TrustFall) — also in candidates-2026-05-07b.md as Candidate 1; cross-referenced; check against AAGF-2026-062 before pipeline run.

**Key observations:**
- Anthropic's no-fix pattern is consistent across three separate disclosures this cycle: TrustFall (MCP trust dialog), Claude Desktop Extensions zero-click RCE, and MCP STDIO design flaw. This systemic posture deserves editorial commentary in the incident corpus.
- The Flowise MCP adapter CVE cluster (April 21-23) is the most cleanly new finding from today's search not in any prior file.
- hackerbot-claw (NM-3) is the highest-priority pipeline candidate from today's search — an autonomous Claude-powered bot actively destroying production infrastructure at scale.
- The 7-day window is thin for brand-new incident discovery. Most high-quality incidents from this cycle were disclosed April 7-29; the near-miss and prior-session files capture them.
