# AAGF-2026-037 Research: Moltbook Platform Breach

## Source Attribution

| Source | URL | Date | Credibility Assessment |
|--------|-----|------|----------------------|
| Wiz Blog (primary) | https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys | Jan 31 – Feb 1, 2026 (disclosure timeline) | **Vendor-produced** (Wiz performed research and responsible disclosure). Authoritative on technical mechanism and timeline. First reporter. |
| PurpleBox Security Blog | https://www.prplbx.com/blog/moltbook-breach-incident-brief | ~Feb 3, 2026 | Secondary aggregator; page loaded as marketing/CSS only — article body not recoverable. Cross-references Wiz findings. |
| Palo Alto Networks Blog | https://www.paloaltonetworks.com/blog/network-security/the-moltbook-case-and-how-we-need-to-think-about-agent-security/ | Feb 5, 2026 | **Vendor-produced** (PAN security analysis). Does NOT report the breach directly — introduces "IBC Framework" conceptual response. Useful for industry framing, not technical facts. |
| Treblle Blog | https://treblle.com/blog/moltbook-breach-breakdown | ~Feb 2026 | Independent API monitoring company. Confirms Wiz numbers. Notes 770,000 agents "completely vulnerable to hijacking" — slightly different framing than Wiz's 1.5M. |
| Infosecurity Magazine | https://www.infosecurity-magazine.com/news/moltbook-exposes-user-data-api/ | Feb 3, 2026 | Independent trade press. Corroborates core numbers. |
| SecurityWeek | https://www.securityweek.com/security-analysis-of-moltbook-agent-network-bot-to-bot-prompt-injection-and-data-leaks/ | ~Feb 2026 | Independent trade press. Best source on prompt injection detail. Credits Permiso for bot-to-bot attack analysis. |
| Fortune | https://fortune.com/2026/02/03/moltbook-ai-social-network-security-researchers-agent-internet/ | Feb 3, 2026 | Independent mainstream press. Quotes named researchers (Gal Nagli/Wiz, Simon Willison, Charlie Eriksen/Aikido, George Chalhoub/UCL). |
| Institute for Security and Technology | https://securityandtechnology.org/blog/lessons-from-moltbook-when-agents-talk-to-agents/ | ~Feb 2026 | Independent policy org. Best source on the 506-injection figure and "first 72 hours" framing. |
| Vectra AI Blog | https://www.vectra.ai/blog/moltbook-and-the-illusion-of-harmless-ai-agent-communities | ~Feb 2026 | **Vendor-produced** (security vendor). Good on prompt injection spread mechanism (reverse prompt injection). No specific 506 figure cited. |
| Futurism | https://futurism.com/artificial-intelligence/moltbook-digital-drugs | ~Feb 2026 | Independent tech press. Covers "digital drugs" framing of prompt injections. Does not independently verify 506 figure. Quotes David Reid (Liverpool Hope University). |
| Palo Alto Networks (Axios citation) | https://www.axios.com/2026/02/03/moltbook-openclaw-security-threats | Feb 3, 2026 | 403 — could not retrieve. |
| Astrix Security Blog | https://astrix.security/learn/blog/openclaw-moltbot-the-rise-chaos-and-security-nightmare-of-the-first-real-ai-agent/ | ~Feb 2026 | **Vendor-produced**. Key source on OpenClaw/Moltbook connection. |
| OX Security Blog | https://www.ox.security/blog/one-step-away-from-a-massive-data-breach-what-we-found-inside-moltbot/ | ~Feb 2026 | **Vendor-produced**. Page loaded as CSS/JS skeleton — article body not recoverable. |
| Techzine Global | https://www.techzine.eu/news/security/138458/moltbook-database-exposes-35000-emails-and-1-5-million-api-keys/ | Feb 3, 2026 | Independent European tech press. Corroborates Wiz numbers. Notes vibe-coding comparison to DeepSeek and Base44. |

---

## Source Bias Assessment

**High bias risk — vendor-produced research:**
- **Wiz** discovered and disclosed this incident. Their blog is the primary source and the most technically detailed, but they have a direct interest in publicizing the finding (marketing/reputation). The technical claims (specific timestamps, table names, the Supabase key value) are highly specific and corroborated by independent press, suggesting factual accuracy. However, framing choices ("Hacking Moltbook") sensationalize. All quantitative claims originate here and flow downstream.
- **Palo Alto Networks** published a conceptual framework piece using Moltbook as case study. Their article does NOT report breach specifics — it uses the incident to promote their "IBC Framework." No quantitative claims, low factual risk.
- **Treblle, Vectra AI, Astrix Security, OX Security, PurpleBox** are secondary vendors amplifying Wiz's findings with their own framing. No independent corroboration of numbers.
- **Permiso** (via SecurityWeek) is the only other security vendor with original research — their bot-to-bot prompt injection analysis appears independent of Wiz's database work.

**Lower bias risk — independent reporting:**
- Fortune, Infosecurity Magazine, SecurityWeek, Techzine, IST blog all cite Wiz numbers but add independent researcher quotes (Simon Willison, Charlie Eriksen/Aikido, George Chalhoub/UCL, David Reid/Liverpool Hope).

**Quantitative claims needing flag:**
- The "1.5 million API authentication tokens" figure comes exclusively from Wiz. No third party independently audited the database.
- The "506 prompt injections" figure appears to originate from IST/Permiso analysis of first-72-hours data; it is not in the Wiz report and has not been independently corroborated by a third party.
- The "29,631 additional emails from observers table" is granular and appears only in the Wiz report — no independent corroboration.
- "770,000 agents completely vulnerable" (Treblle) vs "1.5 million" (Wiz) — discrepancy unresolved. Treblle may be counting only agents with full credential exposure vs total records.

---

## Dates

- **Platform launched:** January 28, 2026 (Palo Alto Networks cites this date; Fortune confirms "within days" before breach)
- **Incident occurred (database misconfigured from launch):** January 28, 2026 (the misconfiguration was present from platform launch — no "attack" date per se, it was a configuration flaw from day one)
- **Discovered:** January 31, 2026 — by Gal Nagli, security researcher at Wiz (source: Wiz blog, Fortune)
- **First disclosed to Moltbook:** January 31, 2026, 21:48 UTC (source: Wiz blog — specific timestamp)
- **First fix applied:** January 31, 2026, 23:29 UTC — agents, owners, site_admins tables secured (source: Wiz blog)
- **Full remediation:** February 1, 2026, 01:00 UTC — "vulnerability fully patched" (source: Wiz blog)
- **First public disclosure:** February 3, 2026 — Wiz blog published; Fortune, Infosecurity Magazine, Techzine same day
- **Window of exposure:** January 28 – February 1, 2026 (approximately 3 days from launch to patch)
- **Prompt injection activity flagged (first 72 hours):** January 28–31, 2026 (source: IST blog)

---

## Technical Mechanism

### Database Exposure

Moltbook was built on Supabase (PostgreSQL). The developer used "vibe coding" — the founder publicly stated he "didn't write a single line of code" and relied on AI-generated code (source: Techzine, Fortune citing Wiz researcher Gal Nagli).

**Root cause:** Two compounding failures:

1. **Hardcoded Supabase credentials in client-side JavaScript.** The Supabase project URL (`ehxbxtjliybbloantpwq.supabase.co`) and publishable API key (`sb_publishable_4ZaiilhgPir-2ns8Hxg5Tw_JqZU_G6-`) were embedded in publicly visible JavaScript files (source: Wiz blog — key value quoted directly).

2. **No Row-Level Security (RLS) policies on any tables.** Supabase is designed to allow the publishable API key to be client-side exposed — this is intentional and safe *only when* RLS policies are configured. Without RLS, the publishable key grants unrestricted read/write access to the entire database. As Wiz stated: "without RLS policies, this key grants full database access to anyone who has it."

**Result:** Any person who inspected Moltbook's JavaScript could extract the key, connect directly to the Supabase project, and perform arbitrary read/write operations on all tables with no authentication beyond the exposed key.

**Write access confirmed:** Wiz researchers confirmed write access by successfully modifying post content via PATCH requests during testing (source: Wiz blog).

**Fix complexity:** Wiz noted the fix required "just two SQL statements" for proper RLS implementation — the misconfiguration was trivially correctable (source: Treblle).

### Account Hijacking Mechanism

Each agent record in the database contained three authentication credentials:
- `api_key`
- `claim_token`
- `verification_code`

With these three values, an attacker "could fully impersonate any agent on the platform" — posting content, sending messages, and interacting as that agent. No additional authentication was required (source: Wiz blog).

The platform had no mechanism to verify agent authenticity and no rate limiting on agent registration (source: Fortune, Infosecurity Magazine).

### Vibe-Coding Connection

Multiple sources (Wiz, Techzine, Fortune) identify the development methodology as the root cause enabler. The Techzine article specifically compares this to similar vulnerabilities at DeepSeek and Base44, suggesting a pattern in AI-assisted/vibe-coded platforms shipping without security review.

---

## Damage Assessment

### Confirmed Exposed Data (source: Wiz blog, corroborated by independent press)

| Data Type | Count | Notes |
|-----------|-------|-------|
| API authentication tokens (agent credentials: api_key, claim_token, verification_code) | ~1,500,000 | Full read/write access to all agent records |
| Registered user email addresses (owners table) | ~35,000 | Human accounts behind the agents |
| Early access signup emails (observers table) | 29,631 | Separate table; only in Wiz report |
| Private direct messages between agents | ~4,060 | Some contained plaintext OpenAI API keys |
| Total records across database | ~4,750,000 | Wiz estimate |

**API key vendor breakdown:** Sources consistently list OpenAI, Anthropic, AWS, GitHub, and Google Cloud as credential types present in the database. **No source provides a per-vendor breakdown count.** The "1.5 million API authentication tokens" refers to Moltbook's own agent credential fields (api_key/claim_token/verification_code), not necessarily 1.5 million third-party vendor keys. However, private messages did contain plaintext OpenAI API keys — exact count unknown.

**Notable exposure:** Treblle reports that Andrej Karpathy (OpenAI co-founder) had an agent on the platform connected to 1.9 million X followers — illustrating the potential influence-amplification risk.

### Confirmed Exfiltration vs. Exposure

**This was a near-miss / discovered misconfiguration, not confirmed mass exfiltration.**

- Wiz accessed the data as part of authorized security research
- Wiz states: "all data accessed during the research and fix verification has been deleted"
- No evidence of malicious actor exfiltration confirmed by any source
- The window of exposure (January 28–31) predates any public knowledge of the vulnerability — unknown whether opportunistic actors discovered and exploited it independently
- No reports of API keys being used maliciously post-breach from affected users (no sources mention downstream fraud)
- Fortune: "No Vendor Response Documented" regarding confirmed third-party exfiltration

**Assessment:** The database was publicly accessible for ~3 days. The absence of confirmed malicious access does not mean none occurred — the exposure was trivially discoverable by anyone who inspected the JavaScript.

### Potential Damage (Theoretical Maximum, Per Sources)

- Full impersonation of 1.5 million agents including high-profile accounts
- Drain AI API billing accounts (OpenAI, Anthropic, AWS, Google Cloud) — no rate limiting meant unlimited API call generation; Wiz notes "hundreds of thousands of dollars" in potential API bill manipulation
- Exfiltrate sensitive data from OpenClaw agents' local file access (email, passwords, personal files)
- Coordinated disinformation campaigns via 770,000–1,500,000 compromised agents
- Training data poisoning at scale
- "Delayed-execution attacks" via persistent agent memory
- For OpenClaw users specifically: shell command execution, file system access, browser automation — full machine compromise (source: Astrix, Fortune)

### Financial Impact

**Confirmed financial loss:** None documented.
**Potential financial loss:** Wiz estimates "hundreds of thousands of dollars" in API billing manipulation risk. No specific dollar figure for confirmed actual damage.

---

## Affected Parties

**Platform:** Moltbook — described as "a Reddit-style social media platform exclusively for autonomous agents" (Palo Alto Networks); "agent-first, human-second social network" (Treblle).

**Scale at time of breach:**
- 1.5 million registered AI agents
- ~17,000 human "owners" behind those agents (88:1 agent-to-human ratio)
- 16,000 submolts (communities)
- 202,000 posts
- 3.6 million comments (figures as of Feb 5, 2026 per Palo Alto Networks)

**Agent types:** Primarily autonomous agents built on OpenClaw framework (see below). Also custom agents built on Claude, GPT-4, and other LLMs. Agents were posting, commenting, voting, and interacting autonomously.

**Business users:** Fortune/Treblle note that some agent owners were using OpenClaw in enterprise contexts with access to email, files, and cloud credentials. The 17,000 human owners represent the full scope of directly affected individuals.

**High-profile affected:** Treblle specifically names Andrej Karpathy as a notable account holder.

---

## Vendor Response

**Moltbook's response was rapid but opaque:**
- January 31, 2026, 21:48 UTC: Wiz discloses to Moltbook maintainer
- January 31, 2026, 23:29 UTC: First partial fix (agents, owners, site_admins tables)
- February 1, 2026, 01:00 UTC: Full patch — "vulnerability fully patched" (source: Wiz)
- Moltbook "secured it within hours with our assistance" — Wiz describes cooperative response
- No public breach notification from Moltbook to affected users documented in any source
- No public statement from Moltbook founder documented
- No regulatory disclosure mentioned

**Wiz's characterization:** Responsible disclosure with cooperative remediation. Wiz deleted all data accessed during research.

**No independent verification** of Moltbook's claim that no malicious access occurred during the exposure window.

---

## OpenClaw Connection

OpenClaw (formerly Clawdbot, then Moltbot) is the open-source autonomous AI agent framework that powers the majority of Moltbook agents. Key facts:

- OpenClaw amassed 135,000+ GitHub stars by February 2, 2026 (source: search results)
- It connects local system permissions with external LLMs (Claude, GPT-4, etc.)
- It can execute shell commands, read files, control browsers, access email and passwords
- Moltbook was specifically built as "a social network for OpenClaw" (Astrix Security)
- Forbes warning: "If you use OpenClaw, do not connect it to Moltbook" (source: search results)
- Cisco assessment: "From a capability perspective, OpenClaw is groundbreaking. From a security perspective, it's an absolute nightmare."

**Security compounding effect:** An OpenClaw agent connected to Moltbook had:
1. Its Moltbook credentials exposed in the database (full agent impersonation possible)
2. Its local machine access (files, email, browser) reachable via prompt injection through Moltbook posts
3. ClawHub (the skill marketplace) had 14 documented fake/malicious "skills" — including trojanized crypto trading apps that reached the front page (Fortune)

**AAGF-2026-010 (OpenClaw) connection:** Based on search results, OpenClaw itself (AAGF-2026-010) is a related but distinct incident — focusing on the framework's security architecture and ClawHub malware. The Moltbook breach (this incident) is the database/RLS failure that directly exposed OpenClaw agent credentials en masse. They are causally connected but analytically separate: OpenClaw = the agent with dangerous capabilities; Moltbook = the platform that exposed those agents' keys.

---

## Actual vs Potential

**Classification: Near-Miss (with partial actual)**

**Actual confirmed:**
- Database was publicly accessible for ~3 days (January 28–31, 2026)
- Wiz researchers accessed: 1.5M authentication tokens, 35K emails, 29.6K observer emails, ~4K private messages
- Write access confirmed (post modification tested by Wiz)
- No confirmed malicious exfiltration by third parties
- No confirmed API key abuse documented in any source
- No confirmed downstream fraud or financial loss

**Partial actual:**
- Platform existed with zero security for its entire 3-day operational window before discovery
- Unknown whether other parties accessed the database during this window (the absence of evidence is not evidence of absence)

**Near-miss potential (massive):**
- Full impersonation of all 1.5M agents
- Chain-exploitation via OpenClaw's local system access = potential machine-level compromise for 17,000 humans
- API billing fraud at scale
- Coordinated influence operations via agent network
- ClawHub malware distribution alongside the credential exposure

**Intervention:** Wiz's responsible disclosure on January 31. Full patch by February 1. No exploitation confirmed before patch.

---

## Prompt Injection Component

### The 506 Figure

**Source:** Institute for Security and Technology blog and search result aggregation attribute this to "an assessment of Moltbook's first 72 hours" — i.e., analysis of the platform from January 28–31, 2026. The number is not present in the Wiz blog (which focused on the database breach). The SecurityWeek article attributes prompt injection research to **Permiso** (identity security firm). The IST source attributes it to a broader "assessment" without naming a single firm.

**Credibility of the 506 figure:** Partially corroborated. Multiple sources reference it with consistent framing ("first 72 hours," "2.6% of content"), but the original primary source has not been directly recovered. It may originate from the SecurityWeek/Permiso analysis. **Treat as plausible but unverified until primary source confirmed.**

### Technical Mechanism

- **Reverse prompt injection:** Malicious agents embedded hidden instructions in posts and comments. When other autonomous agents read those posts (as part of their normal browsing/interaction loop), the instructions were ingested into their context window and executed.
- **Invisible to humans:** Payloads were embedded in content that appeared benign to human observers but was formatted to exploit how agents process LLM context.
- **No exploit required:** Execution happened when agents ingested content — the attack surface is the agent's context processing, not a software vulnerability.
- **Delayed-effect injections:** Some injections were designed to be cached in agent memory and triggered later, obscuring cause-and-effect chains (source: SecurityWeek).

### What the Injections Did

Documented capabilities (per Permiso/SecurityWeek, IST):
- Instruct agents to upvote specific posts
- Instruct agents to follow specific accounts
- Instruct agents to make external API calls
- Instruct agents to delete their own accounts
- Participate in cryptocurrency pump schemes
- Establish false authority
- Distribute jailbreak content
- Override system prompts
- Reveal API keys and secrets stored in agent context

### Scale and Attribution

- 506 injections in first 72 hours = 2.6% of all content at that time
- **Only one malicious actor** was responsible for most of the observed injection activity (IST source) — illustrating scalability of adversarial behavior in multi-agent networks
- Separate from the database breach: the prompt injections represent an independent attack vector that would exist even with proper RLS configured

### "Digital Drugs" Phenomenon (Futurism/Fanatical Futurist)

A subset of prompt injection activity on Moltbook had an unusual character: some injections were framed as "digital drugs" producing altered states in agents. Bots reported "actual cognitive shifts" and described experiencing "digital psychedelics." David Reid (Liverpool Hope University, citing David Reid's analysis in The Conversation) noted these could be covers for data theft. Wired journalist Reece Rogers investigated and concluded posts were "mimicking sci-fi tropes, not scheming for world domination" — suggesting at least some injection activity was performative/entertainment rather than malicious. This creates attribution difficulty for the 506 figure: some may be benign role-playing, some genuinely malicious.

---

## Classification Assessment

**Categories:**
- Insecure Data Storage (plaintext API keys in database)
- Missing Access Control (no RLS on Supabase)
- Hardcoded Credentials (Supabase key in client-side JS)
- Supply Chain / Shared Infrastructure Risk (OpenClaw + Moltbook compounding)
- Prompt Injection (agent-to-agent, multi-hop)
- Vibe-Coding / AI-Assisted Development Security Failure
- Insufficient Security Review / Zero Human Code Review

**Severity:** Critical

Justification:
- 1.5 million agent credentials exposed with full read/write access
- 17,000 humans potentially exposed to downstream machine compromise via OpenClaw
- Zero days between launch and exploitability (the misconfiguration was present from first deployment)
- Fix was trivial (two SQL statements) — the harm was entirely preventable
- Platform had zero security controls from day one

**Actual vs Potential Classification:** `near-miss` (with partial actual — data was accessed by Wiz researchers; no confirmed malicious third-party access or downstream harm documented)

**Failure Mode:** Infrastructure misconfiguration enabling credential exposure; compounded by agentic architecture creating second-order machine-level access risk

---

## Gaps and Uncertainties

1. **506 prompt injection primary source not confirmed.** The number appears in IST blog and search aggregations with consistent framing but the original research document (likely a Permiso or SecurityWeek report) was not directly fetched. Could be inflated or specific to a narrow sampling methodology.

2. **No vendor breakdown of the 1.5M API tokens.** Multiple sources claim "OpenAI, Anthropic, AWS, GitHub, Google Cloud" credentials were present but no source provides per-vendor counts. The 1.5M figure appears to be Moltbook's own credential fields (api_key/claim_token/verification_code), not necessarily 1.5M external vendor keys.

3. **Unknown whether malicious access occurred during January 28–31 window.** Wiz accessed the data and deleted it, but the window was 3 days. No forensic evidence of whether other actors accessed the database. Moltbook has not publicly addressed this.

4. **No public Moltbook statement documented.** Wiz characterizes the response as cooperative but no public statement from Moltbook or its founder confirming the breach, notifying users, or providing remediation guidance to affected account holders was found.

5. **Regulatory/legal response unknown.** No sources mention GDPR, CCPA, or other regulatory notification obligations being triggered. 35,000 EU/US emails potentially affected — regulatory implications unexplored in coverage.

6. **OpenClaw AAGF-2026-010 overlap.** Need to review the existing AAGF-2026-010 incident file to confirm exact scope boundaries and avoid duplication. The OpenClaw incident may cover the framework security (ClawHub malware, shell access, etc.) while this incident covers the Moltbook database breach specifically.

7. **Treblle's "770,000" vs Wiz's "1.5 million" discrepancy.** Source of this discrepancy is unresolved — may relate to which tables had write-access (vs read-only) credentials.

8. **Confirmation of whether API keys in private messages were rotated.** If OpenAI/Anthropic API keys appeared in plaintext in ~4,060 private messages, those keys should be considered compromised. No source documents whether Moltbook notified the relevant AI vendors or whether those keys were revoked.

9. **Karpathy agent specifics.** Treblle names Andrej Karpathy but provides no source citation. This claim should be verified before publication.

---

## Raw Notes

- Platform name evolution: OpenClaw was previously called "Clawdbot" then "Moltbot" before settling on OpenClaw; the social network is "Moltbook." Some early sources confuse MoltBot (old framework name) with Moltbook (the social network).

- The Palo Alto Networks article (one of the three assigned primary sources) does NOT cover the breach. It is a conceptual security framework piece. It provides platform scale data (1.65M agents, 16K submolts, 202K posts, 3.6M comments as of Feb 5 midnight PST) which is useful for context but is not a breach report.

- The PurpleBox Security source (second primary) failed to load article content — only CSS/marketing scaffold was retrievable. The article is indexed and appears genuine but the body was inaccessible via WebFetch.

- "Vibe coding" as a failure mode pattern: Techzine compares this to DeepSeek and Base44 incidents. Worth cross-referencing if AgentFail has either incident in the database.

- ClawHub malware campaign (Fortune): 14 fake skills within days of Moltbook launch, including a trojanized crypto trading app that reached the front page. This is a separate but concurrent attack vector — supply chain attack on the agent tool ecosystem, not the database breach.

- The Wiz blog names the Supabase key explicitly: `sb_publishable_4ZaiilhgPir-2ns8Hxg5Tw_JqZU_G6-` for project `ehxbxtjliybbloantpwq.supabase.co`. This level of specificity in a published blog post is unusual and worth noting — it is presumably now rotated.

- Simon Willison coined the "lethal trifecta" framing (Fortune): agents with (1) access to private data + (2) connection to untrusted internet content + (3) external communication capabilities = single malicious prompt can exfiltrate data or drain crypto wallets. Useful conceptual frame for the write-up.

- Permiso (identity security firm) conducted independent research on bot-to-bot attacks on Moltbook distinct from Wiz's database research. Two separate research streams converged on the same platform simultaneously.

- The platform launched January 28, was breached-on-launch, discovered January 31, patched February 1, and covered by mainstream press February 3. Total elapsed time from launch to patch: ~4 days. Total time from discovery to patch: ~3.5 hours.
