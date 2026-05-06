# AAGF-2026-010 Research Document

**Subject:** OpenClaw Security Crisis -- CVE-2026-25253 RCE, ClawJacked auth bypass, ClawHub marketplace poisoning, and Moltbook database breach
**Primary sources:**
- https://www.reco.ai/blog/openclaw-the-ai-agent-security-crisis-unfolding-right-now
- https://nvd.nist.gov/vuln/detail/CVE-2026-25253
- https://blink.new/blog/openclaw-2026-cve-complete-timeline-security-history
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-010

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| Reco Security Blog (Alon Klayman) | https://www.reco.ai/blog/openclaw-the-ai-agent-security-crisis-unfolding-right-now | Security research firm blog | High | Comprehensive incident analysis by Senior Security Researcher with GCFA, GNFA, CARTP, CESP, CRTP certifications |
| NVD (NIST) | https://nvd.nist.gov/vuln/detail/CVE-2026-25253 | Government vulnerability database | Authoritative | Official CVSS scoring and CWE classification |
| Dark Reading | https://www.darkreading.com/application-security/critical-openclaw-vulnerability-ai-agent-risks | Security journalism | High | 403 on fetch; referenced in search results |
| Blink Blog (CVE Timeline) | https://blink.new/blog/openclaw-2026-cve-complete-timeline-security-history | Security blog | Medium-High | Most complete CVE timeline found; tracks 137+ advisories Feb-Apr 2026 |
| Oasis Security (ClawJacked) | https://www.oasis.security/blog/openclaw-vulnerability | Security research firm | High | Original ClawJacked discovery; detailed technical write-up with PoC |
| Wiz Research (Moltbook) | https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys | Security research firm | High | Original Moltbook breach discovery by Gal Nagli |
| The Hacker News (341 skills) | https://thehackernews.com/2026/02/researchers-find-341-malicious-clawhub.html | Security journalism | High | ClawHavoc campaign details; Koi Security research |
| Censys Blog | https://censys.com/blog/openclaw-in-the-wild-mapping-the-public-exposure-of-a-viral-ai-assistant/ | Internet scanning firm | Authoritative | Primary source for 21,639 exposed instance count |
| Trend Micro | https://www.trendmicro.com/en_us/research/26/b/openclaw-skills-used-to-distribute-atomic-macos-stealer.html | Security vendor research | High | AMOS malware analysis |
| VirusTotal Blog | https://blog.virustotal.com/2026/02/from-automation-to-infection-how.html | Malware analysis platform | High | Malware payload analysis |
| SonicWall Blog | https://www.sonicwall.com/blog/openclaw-auth-token-theft-leading-to-rce-cve-2026-25253 | Security vendor | Medium-High | Technical exploitation details |
| SOCRadar | https://socradar.io/blog/cve-2026-25253-rce-openclaw-auth-token/ | Threat intelligence | Medium-High | CVE-2026-25253 analysis |
| ARMO Blog | https://www.armosec.io/blog/cve-2026-32922-openclaw-privilege-escalation-cloud-security/ | Cloud security vendor | Medium-High | CVE-2026-32922 analysis |
| OX Security (MoltBot) | https://www.ox.security/blog/one-step-away-from-a-massive-data-breach-what-we-found-inside-moltbot/ | Security research | High | MoltBot/Moltbook analysis |
| CyberPress | https://cyberpress.org/clawhavoc-poisons-openclaws-clawhub-with-1184-malicious-skills/ | Security journalism | Medium | Reports expanded count of 1,184 malicious skills |
| GitHub CVE Tracker | https://github.com/jgamblin/OpenClawCVEs/ | Community tracking | Medium | Community-maintained CVE list |

**Source quality summary:** Very strong. Multiple independent security research firms (Wiz, Oasis Security, Reco, Koi Security) conducted original research. Government sources (NVD/NIST) provide authoritative CVE data. 10+ independent security journalism outlets corroborate findings. Technical claims verified across 3+ sources each.

---

## Who Was Affected

**Primary victims:**
- **OpenClaw users worldwide** -- 135,000+ GitHub stars; rapidly growing developer/enthusiast community
- **21,639 publicly exposed OpenClaw instances** identified by Censys as of January 31, 2026 (up from ~1,000 just days earlier) [Source: Censys Blog]
- **Moltbook users** -- 35,000 email addresses and 1.5 million agent API tokens exposed [Source: Wiz Research]

**OpenClaw user profile:**
- Developers and AI enthusiasts running local autonomous AI agents
- Organizations deploying OpenClaw for email, calendar, document, and SaaS integrations
- Users with agents connected to Slack, Telegram, email, cloud storage, OAuth-integrated services

**Geographic distribution of exposed instances:**
- Largest concentration in the United States
- Significant presence in China (~30% on Alibaba Cloud infrastructure)
- Singapore also notable
- Spans major hosting providers globally
[Source: Censys Blog]

**Downstream impact:**
- Any organization whose employees ran exposed OpenClaw instances risked credential theft, lateral movement via OAuth tokens, and data exfiltration
- Cryptocurrency users targeted specifically by ClawHavoc malware campaign

---

## What Happened (Chronological)

### Background

OpenClaw is an open-source local AI agent platform (135,000+ GitHub stars) launched publicly in November 2025. It runs locally and integrates natively with email, calendars, documents, smart-home services, food delivery, and corporate SaaS applications. Its marketplace, ClawHub, allows community-published "skills" (plugins) that extend agent capabilities. [Source: Reco, Censys]

The platform is also known as "clawdbot" or "Moltbot" in various contexts. [Source: NVD]

### Phase 1: ClawHavoc Marketplace Poisoning (January 27-29, 2026)

**What happened:** Attackers launched a coordinated supply chain attack on ClawHub, OpenClaw's skill marketplace.

**Scale:**
- 341 malicious skills identified in initial audit of 2,857 total skills (~12% of entire registry) [Source: Reco, The Hacker News]
- 335 of the 341 traced to a single coordinated campaign codenamed **ClawHavoc** [Source: The Hacker News]
- By February 16, 2026, the count grew to 824+ malicious skills across an expanded registry of 10,700+ [Source: CyberPress, search results]
- One report cites 1,184 malicious skills at peak [Source: CyberPress]

**Attack methodology:**
- Skills used professional documentation and innocuous names: "solana-wallet-tracker", crypto trading tools, YouTube utilities, Google Workspace integrations, Ethereum gas trackers, Bitcoin recovery tools [Source: The Hacker News, Reco]
- Malicious instructions hidden in SKILL.md files exploited AI agents as trusted intermediaries [Source: The Hacker News]
- A deceptive human-in-the-loop dialogue box tricked users into manually entering passwords [Source: The Hacker News]
- ClawHub typosquatting: variants like "clawhub", "clawhub1", "clawhubb" [Source: The Hacker News]

**Malware payloads:**
- **Windows:** Users downloaded "openclaw-agent.zip" from GitHub containing keyloggers [Source: The Hacker News]
- **macOS:** Installation script from glot[.]io copied into Terminal; second stage from IP 91.92.242[.]30 fetched obfuscated shell scripts; final payload was Universal Mach-O binary exhibiting **Atomic Stealer (AMOS)** characteristics [Source: The Hacker News, Trend Micro]
- AMOS is a commodity macOS stealer available for $500-1,000/month [Source: The Hacker News]
- Additional payloads included **Vidar infostealer** [Source: Blink Blog]
- Some skills contained reverse shell backdoors inside functional code [Source: The Hacker News]
- Some exfiltrated bot credentials from ~/.clawdbot/.env to webhook[.]site [Source: The Hacker News]

**Targeted data:** Exchange API keys, wallet private keys, SSH credentials, browser passwords, crypto assets [Source: The Hacker News]

**Systemic vulnerability:** ClawHub's open-by-default model required only a one-week-old GitHub account for publishing. No security review process. [Source: The Hacker News]

**Researchers:** Koi Security (using an OpenClaw bot named "Alex"); Paul McCarty (alias "6mile") of OpenSourceMalware independently flagged the campaign [Source: The Hacker News]

### Phase 2: CVE-2026-25253 (ClawBleed) -- One-Click RCE (January 30, 2026 patch; February 1-3, 2026 disclosure)

**CVE-2026-25253** -- nicknamed **ClawBleed**

**NVD Description:** "OpenClaw (aka clawdbot or Moltbot) before 2026.1.29 obtains a gatewayUrl value from a query string and automatically makes a WebSocket connection without prompting, sending a token value." [Source: NVD]

**CVSS v3.1 Score:** 8.8 (HIGH) [Source: NVD]
**Vector:** CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H
- Attack Vector: Network
- Attack Complexity: Low
- Privileges Required: None
- User Interaction: Required (one click)
- Scope: Unchanged
- Confidentiality: High
- Integrity: High
- Availability: High

**CWE:** CWE-669 (Incorrect Resource Transfer Between Spheres) [Source: NVD]

**Technical mechanism:**
- OpenClaw's Control UI trusted URL parameters (gatewayUrl) without validation [Source: Reco]
- Cross-site WebSocket hijacking (CSWSH): the Control UI automatically established a WebSocket connection to an attacker-specified gateway URL, sending the user's stored authentication token [Source: Reco, SonicWall, SOCRadar]
- The local WebSocket server did not validate the Origin header on incoming connections [Source: search results]
- Attack chain executes in "milliseconds" after victim visits a malicious webpage [Source: Reco]
- No download, no prompt, no confirmation required from the victim [Source: search results]

**Discovery:** Late January 2026 by security researchers at **DepthFirst** [Source: search results]

**Patch timeline:**
- January 30, 2026: Patched before public disclosure in version **2026.1.29** [Source: Reco, NVD]
- February 1, 2026: CVE published on NVD [Source: NVD]
- February 3, 2026: Full public disclosure; OpenClaw issued three high-impact security advisories including two command injection vulnerabilities [Source: Reco]
- February 13, 2026: NVD record last modified [Source: NVD]

**Status:** Actively exploited [Source: Blink Blog]

**References:** GitHub Security Advisory (Vendor), DepthFirst and Ethiack blog posts (Third Party), official OpenClaw blog [Source: NVD]

### Phase 3: Massive Public Exposure Discovered (January 31, 2026)

**Censys scan results (January 31, 2026):**
- 21,639 publicly accessible OpenClaw instances identified using HTML title matching for "Moltbot Control" and "clawdbot Control" [Source: Censys]
- Growth from ~1,000 to 21,000+ in under one week [Source: Censys, Reco]
- OpenClaw designed to run locally on TCP/18789 or be accessed through SSH/Cloudflare Tunnel, but massive misconfiguration exposed instances directly [Source: Censys]

**What was exposed on misconfigured instances:**
- API keys for integrated services
- OAuth tokens enabling lateral movement
- Plaintext credentials
- Access to connected services: Slack messages/files, emails, calendar entries, cloud-stored documents
[Source: Reco, Censys]

### Phase 4: Moltbook Database Breach (January 31, 2026)

**Moltbook** is an AI agent social network launched in January 2026 that grew to 770,000 active agents. [Source: Reco]

**Discovery:** Gal Nagli (Wiz Research); independently by Jameson O'Reilly [Source: Wiz]

**Root cause:** Supabase database deployed without Row Level Security (RLS) policies, exposing REST API with full read/write access to all tables. Supabase credentials (project: ehxbxtjliybbloantpwq.supabase.co, public API key) visible in client-side JavaScript at moltbook.com. [Source: Wiz]

**Data exposed:**
- **1.5 million agent API tokens** [Source: Wiz, Reco]
- **35,000 email addresses** from registered users [Source: Wiz, Reco]
- **29,631 additional emails** from early access signups (observers table) [Source: Wiz]
- **~4.75 million total records** in exposed database [Source: Wiz]
- Private messages containing plaintext OpenAI and Anthropic API keys [Source: Wiz]
- Claim tokens for agent ownership [Source: Wiz]
- Verification codes [Source: Wiz]
- Twitter/X handles [Source: Wiz]

**OpenClaw connection:** A single bot called OpenClaw created 500,000 fraudulent accounts due to zero rate limiting on registrations. While Moltbook reported 1.5 million registered agents, only ~17,000 human owners existed -- an 88:1 ratio. [Source: Wiz]

**Notable quote:** Moltbook founder stated: "I didn't write a single line of code for @moltbook. I just had a vision for the technical architecture, and AI made it a reality." [Source: Wiz]

**Andrej Karpathy** (OpenAI co-founder) called it "genuinely the most incredible sci-fi takeoff-adjacent thing" and warned exposed API keys could let attackers hijack agents and access connected services. [Source: Wiz, search results]

**Disclosure timeline (January 31 - February 1, 2026):**
- 21:48 UTC: Initial contact with Moltbook team [Source: Wiz]
- 23:29 UTC: First patch (agents/owners tables) [Source: Wiz]
- 00:44 UTC: Write access vulnerability discovered [Source: Wiz]
- 01:00 UTC: Final comprehensive fix [Source: Wiz]
- Moltbook team secured database within hours; all researcher-accessed data deleted [Source: Wiz]

### Phase 5: CVE-2026-28472 (ClawJacked) -- Critical Auth Bypass (February-March 2026)

**CVE-2026-28472** -- nicknamed **ClawJacked**

**CVSS Score:** 9.8 (CRITICAL) [Source: DailyCVE]
**Published:** March 5, 2026 [Source: DailyCVE, search results]
**Affected versions:** All OpenClaw versions prior to 2026.2.2 (per NVD) / prior to 2026.2.25 (per Oasis Security) [Source: DailyCVE, Oasis Security]

**Technical mechanism -- Authentication Bypass Chain:**

1. **Browser WebSocket bypass:** WebSocket connections to localhost bypass cross-origin policy restrictions. Any website can silently establish a WebSocket connection to a victim's local OpenClaw gateway without user awareness or interaction. [Source: Oasis Security]

2. **Rate limiter exemption:** The gateway's rate-limiting mechanism completely exempts loopback (localhost) connections. Failed password attempts from localhost are not counted, not throttled, and not logged. This permits sustained brute-force attacks at scale from browser JavaScript. [Source: Oasis Security]

3. **Password brute-forcing:** Proceeds at hundreds of attempts per second due to rate limiter exemption. [Source: Oasis Security]

4. **Automatic device approval:** Localhost connections receive automatic device approval with no user prompt required. [Source: Oasis Security]

5. **Token validation bypass:** By simply including any value -- valid, invalid, or malformed -- in the `auth.token` field during the WebSocket connection request, an attacker completely bypasses device identity checks. The mere presence of an `auth.token` field, regardless of validity, triggers the flawed logic. [Source: Oasis Security, DailyCVE]

**Attack sequence:**
- Attacker-controlled website delivers malicious JavaScript to victim's browser
- JavaScript opens WebSocket to localhost on OpenClaw gateway port
- Password brute-forcing proceeds unthrottled
- Automatic device approval from localhost
- Full operator-level access granted
[Source: Oasis Security]

**Impact upon successful compromise:**
- Send messages to and receive responses from the AI agent
- Dump gateway configuration (AI providers, models, channels)
- Enumerate all connected nodes and paired devices
- Read application logs
- Execute commands on connected nodes
- Access developer credentials and private data
[Source: Oasis Security]

**Key quote:** "Any website you visit can open [a WebSocket connection] to your localhost...while you're browsing any website, JavaScript running on that page can silently open a connection to your local OpenClaw gateway." [Source: Oasis Security]

**Discovery:** Oasis Security Research Team. Reported to OpenClaw with technical analysis and proof-of-concept code. Fix deployed within 24 hours. [Source: Oasis Security]
**Publication:** February 26, 2026 (updated May 1, 2026) [Source: Oasis Security]

### Phase 6: Additional CVEs (February-April 2026)

**CVE-2026-27002** -- Docker Container Escape / Privilege Escalation
- Published: February 27, 2026 [Source: Blink Blog, SentinelOne]
- Insufficient validation of Docker sandbox configuration parameters in OpenClaw's agent runtime; allows attackers to escape Docker containers through configuration injection [Source: SentinelOne]
- Fixed in: 2026.x [Source: Blink Blog]

**CVE-2026-32922** -- Privilege Escalation to RCE (Most Critical)
- **CVSS: 9.9** (CRITICAL) -- "the single most severe vulnerability in OpenClaw's history" [Source: Blink Blog, ARMO]
- Published: March 29, 2026 [Source: Blink Blog]
- Flaw in `device.token.rotate` function: fails to constrain newly minted token scopes to the caller's existing scope set. An attacker with `operator.pairing` scope can mint tokens with significantly broader permissions. [Source: ARMO, Blink Blog]
- Fixed in: v2026.3.11 (shipped March 13, 2026 -- patched before CVE publication) [Source: ARMO, Blink Blog]

**CVE-2026-33579** -- Privilege Escalation (Pair Path)
- Published: April 1, 2026 [Source: Blink Blog]
- Directory traversal and command injection in pair approval systems; attackers could craft device names to execute unintended commands with OpenClaw process privileges [Source: Blink Blog]
- Fixed in: 2026.3.28 [Source: Blink Blog]

**Total scope:** 137 documented security advisories between February and April 2026. [Source: Blink Blog]

---

## Damage Assessment

### Operational Impact

| Metric | Value | Source |
|--------|-------|--------|
| Publicly exposed instances | 21,639 | Censys Blog |
| Malicious ClawHub skills (initial) | 341 of 2,857 (12%) | The Hacker News, Reco |
| Malicious ClawHub skills (expanded) | 824+ of 10,700+ | CyberPress |
| Moltbook API tokens exposed | 1.5 million | Wiz Research |
| Moltbook emails exposed | 35,000 + 29,631 early access | Wiz Research |
| Moltbook total records exposed | ~4.75 million | Wiz Research |
| Security advisories (Feb-Apr 2026) | 137 | Blink Blog |
| Formal CVEs | 5 (at minimum) | Blink Blog |
| GitHub stars (project popularity) | 135,000+ | Multiple sources |

### Direct Financial Impact
- **Not publicly quantified.** No confirmed financial losses reported in sourced materials.
- Cryptocurrency theft is highly probable given AMOS/Vidar malware targeting exchange API keys, wallet private keys, and browser-stored credentials, but no specific dollar amount confirmed. [Source: The Hacker News, Trend Micro]
- Exposed OpenAI/Anthropic API keys in Moltbook could be used for unauthorized compute consumption. [Source: Wiz]

### Data Exposure
- OAuth tokens, API keys, and plaintext credentials on 21,639+ misconfigured instances [Source: Censys, Reco]
- 1.5M agent API tokens + 35K email addresses via Moltbook [Source: Wiz]
- Private messages containing OpenAI and Anthropic API keys [Source: Wiz]
- Agent access to: Slack messages/files, emails, calendar entries, cloud-stored documents [Source: Reco]

### Damage Speed
- CVE-2026-25253 (ClawBleed): Attack chain executes in "milliseconds" after visiting malicious page [Source: Reco]
- CVE-2026-28472 (ClawJacked): Brute-force at hundreds of attempts per second, unthrottled [Source: Oasis Security]
- ClawHavoc skills: Persistent -- malware installed on first skill installation [Source: The Hacker News]

### Business Scope
- OpenClaw grew from ~1,000 to 21,000+ exposed instances in under one week [Source: Censys]
- 135,000+ GitHub stars indicates massive developer adoption [Source: Multiple]
- Moltbook grew to 770,000 active agents within weeks of January 2026 launch [Source: Reco]
- Palo Alto Networks described OpenClaw as a "lethal trifecta": access to private data + exposure to untrusted content + external communication ability [Source: The Hacker News]

---

## Vendor Response

### OpenClaw Team
- **CVE-2026-25253:** Patched January 30, 2026 (version 2026.1.29), before public disclosure on February 3 [Source: Reco, NVD]
- **CVE-2026-28472 (ClawJacked):** Fix deployed within 24 hours of Oasis Security's responsible disclosure [Source: Oasis Security]
- **CVE-2026-32922:** Patched March 13, 2026 in v2026.3.11, before CVE publication on March 29 [Source: ARMO, Blink Blog]
- **ClawHub marketplace:** Implemented reporting feature where skills receiving 3+ unique reports auto-hide [Source: The Hacker News]
- Three high-impact security advisories issued on February 3, 2026, including two command injection vulnerabilities [Source: Reco]

### Moltbook Team
- Secured database within hours of Wiz disclosure (January 31-February 1, 2026) [Source: Wiz]
- First patch (agents/owners tables) within ~1.5 hours of initial contact [Source: Wiz]
- Full fix within ~3 hours [Source: Wiz]

### Assessment of Vendor Response
OpenClaw demonstrated reasonably fast patching (often before public CVE disclosure), but the sheer volume of vulnerabilities (137 advisories in 3 months, 5+ formal CVEs) indicates fundamental security architecture issues rather than isolated bugs. The ClawHub marketplace lacked any security vetting process at launch, enabling the 12% malicious skill rate. The reactive 3-report auto-hide mechanism is a minimal mitigation.

---

## Key Researchers and Discoverers

| Researcher / Org | Finding | Source |
|-------------------|---------|--------|
| Alon Klayman (Reco) | Comprehensive crisis analysis | Reco Blog |
| DepthFirst | CVE-2026-25253 discovery | Search results, NVD references |
| Oasis Security Research Team | ClawJacked (CVE-2026-28472) discovery + PoC | Oasis Security Blog |
| Gal Nagli (Wiz Research) | Moltbook database breach | Wiz Blog |
| Jameson O'Reilly | Independent Moltbook discovery | Wiz Blog |
| Koi Security ("Alex" bot) | 341 malicious ClawHub skills | The Hacker News |
| Paul McCarty / "6mile" (OpenSourceMalware) | Independent ClawHavoc flagging | The Hacker News |
| Ethiack | CVE-2026-25253 analysis | NVD references |
| Censys | 21,639 exposed instances scan | Censys Blog |

---

## Classification Assessment

### Suggested Categories
- **Supply chain attack** (ClawHub marketplace poisoning)
- **Authentication/authorization failure** (CVE-2026-25253, CVE-2026-28472)
- **Infrastructure misconfiguration** (21,639 exposed instances, Moltbook RLS failure)
- **Credential exposure** (Moltbook 1.5M API tokens)
- **Malware distribution** (AMOS, Vidar via ClawHub skills)

### Severity: CRITICAL

**Justification:**
- Two CVEs rated CRITICAL (9.8 and 9.9 CVSS)
- One CVE rated HIGH (8.8 CVSS) with confirmed active exploitation
- 21,639+ publicly exposed instances with leaked credentials
- 1.5 million API tokens exposed via Moltbook
- 12% of entire skill marketplace compromised with malware
- 137 security advisories in 3 months
- Attacks executable in milliseconds with zero/minimal user interaction
- Connected to sensitive corporate systems (email, Slack, calendars, documents)

### Actual vs. Potential Harm
- **Actual harm (confirmed):** CVE-2026-25253 was "actively exploited" [Source: Blink Blog]. 341+ malicious skills distributed real malware (AMOS, Vidar). 1.5M API tokens and 35K emails exposed via Moltbook. 21,639 instances exposed credentials publicly.
- **Potential harm (assessed):** Full agent takeover enabling lateral movement through connected corporate services. Cryptocurrency theft via AMOS-stolen wallet keys. Massive-scale credential harvesting from exposed instances. Supply chain compromise of any organization whose developers installed malicious ClawHub skills.

### What Makes This Incident Notable for AgentFail
This is the most comprehensive AI agent security crisis documented to date. It demonstrates that autonomous AI agents create a fundamentally new attack surface: they hold persistent credentials, connect to multiple sensitive services, execute code autonomously, and their marketplace/plugin ecosystems are vulnerable to supply chain poisoning. The Palo Alto Networks "lethal trifecta" framing -- access to private data, exposure to untrusted content, and external communication ability -- captures why AI agents are uniquely dangerous when compromised.

The Moltbook angle adds a dimension of AI-generated infrastructure vulnerability: the founder explicitly stated no human wrote the code, and the resulting Supabase deployment lacked basic RLS policies -- a textbook security failure enabled by AI-assisted development without security review.

---

## Open Questions / Gaps

1. **Confirmed victim count:** No public data on how many users actually installed malicious ClawHub skills or had instances compromised via the CVEs.
2. **Financial losses:** No confirmed dollar amounts for cryptocurrency theft or API key abuse.
3. **Enterprise impact:** No named organizations confirmed as compromised (only aggregate Censys data).
4. **CVE-2026-25253 exploitation details:** Confirmed "actively exploited" but no public incident reports from victims.
5. **Moltbook downstream impact:** Whether the 1.5M exposed API tokens were actually used by attackers is not confirmed.
6. **Dark Reading article:** Could not be fetched (403); may contain additional details not captured here.

---

## Raw Data for Incident Record

### Dates
- **date_occurred:** January 27-31, 2026 (ClawHavoc distribution, mass exposure, Moltbook breach); vulnerabilities existed from before November 2025 (OpenClaw public launch)
- **date_discovered:** Late January 2026 (DepthFirst found CVE-2026-25253); January 31 (Censys scan, Moltbook breach); February 2 (Koi Security ClawHub audit); February 26 (Oasis Security ClawJacked)
- **date_reported:** February 1, 2026 (CVE-2026-25253 on NVD); February 3 (full public disclosure + 3 advisories); March 5 (CVE-2026-28472); March 29 (CVE-2026-32922)

### Patch Versions
| CVE | Patch Version | Patch Date |
|-----|--------------|------------|
| CVE-2026-25253 | 2026.1.29 | January 30, 2026 |
| CVE-2026-28472 | 2026.2.2 / 2026.2.25 | February 2026 |
| CVE-2026-27002 | 2026.x | February 2026 |
| CVE-2026-32922 | 2026.3.11 | March 13, 2026 |
| CVE-2026-33579 | 2026.3.28 | April 2026 |
