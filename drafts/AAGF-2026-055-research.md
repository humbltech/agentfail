# AAGF-2026-055 Research Notes

## Source URLs Consulted

### Primary Sources (fetched directly)
1. **[Vercel-KB]** Vercel official security bulletin: https://vercel.com/kb/bulletin/vercel-april-2026-security-incident
2. **[TechCrunch]** TechCrunch breach report: https://techcrunch.com/2026/04/20/app-host-vercel-confirms-security-incident-says-customer-data-was-stolen-via-breach-at-context-ai/
3. **[THN]** The Hacker News technical analysis: https://thehackernews.com/2026/04/vercel-breach-tied-to-context-ai-hack.html
4. **[BleepComp]** BleepingComputer hacker claims report: https://www.bleepingcomputer.com/news/security/vercel-confirms-breach-as-hackers-claim-to-be-selling-stolen-data/
5. **[PushSec]** PushSecurity OAuth chain attack analysis: https://pushsecurity.com/blog/unpacking-the-vercel-breach
6. **[Register]** The Register investigative piece: https://www.theregister.com/2026/04/20/vercel_context_ai_security_incident/
7. **[Context-AI]** Context.ai security update (404 at time of fetch — URL confirms page existed): https://context.ai/security-update
8. **[CyberScoop]** CyberScoop Lumma Stealer infection details: https://cyberscoop.com/vercel-security-breach-third-party-attack-context-ai-lumma-stealer/
9. **[RecoAI]** Reco.ai step-by-step attack chain: https://www.reco.ai/blog/vercel-context-ai-breach
10. **[GitGuardian]** GitGuardian environment variable analysis: https://blog.gitguardian.com/vercel-april-2026-incident-non-sensitive-environment-variables-need-investigation-too/
11. **[Gupta]** Deepak Gupta technical breakdown: https://guptadeepak.com/vercel-breach-how-a-roblox-cheat-download-led-to-a-2m-data-heist-through-ai-tool-oauth-abuse/
12. **[Rescana]** Rescana incident summary: https://www.rescana.com/post/vercel-april-2026-security-incident-context-ai-linked-breach-exposes-non-sensitive-environment-variables-and-customer-ac/

### Secondary Sources (search-identified, not fetched)
- OX Security supply chain analysis: https://www.ox.security/blog/vercel-context-ai-supply-chain-attack-breachforums/
- Trend Micro research (403 at fetch): https://www.trendmicro.com/en_us/research/26/d/vercel-breach-oauth-supply-chain.html
- VentureBeat OAuth gap analysis (rate-limited): https://venturebeat.com/security/vercel-breach-exposes-the-oauth-gap-most-security-teams-cannot-detect-scope-or-contain
- Strapi blog: https://strapi.io/blog/vercel-security-breach-april-2026
- Kiteworks Substack: https://kiteworks.substack.com/p/vercel-context-ai-oauth-supply-chain
- Varonis remediation guide: https://www.varonis.com/blog/vercel-breach-2026
- Qualysec OAuth analysis: https://qualysec.com/vercel-data-breach-2026-context-ai-oauth/
- CybersecurityDive: https://www.cybersecuritydive.com/news/vercel-customers-targeted-after-third-party-tool-compromised/817949/
- Vibe Graveyard summary: https://vibegraveyard.ai/story/vercel-context-ai-oauth-breach/

---

## Source Bias Notes

| Source | Likely Bias | Notes |
|--------|-------------|-------|
| Vercel KB | Minimization | Vendor bulletin; emphasizes "limited subset," "non-sensitive," "no npm compromise." Slow to acknowledge full scope — expanded findings across 3 updates over 5 days. Did not disclose customer count. |
| Context.ai security update | Deflection | Blamed Vercel's OAuth configuration for allowing overly broad permissions. Disclosed March 2026 breach only after Vercel went public in April — suggests incomplete initial investigation. Page returned 404 at research time (likely taken down post-incident). |
| TechCrunch | Moderate reliability | Trade press; relies on vendor disclosure + tags ShinyHunters attribution without independent technical verification. Limited technical depth. |
| THN | Moderate-high reliability | Better technical synthesis; sourced from Hudson Rock and Vercel statements. Added Lumma Stealer infection vector detail. |
| BleepingComputer | High reliability for hacker claim specifics | Contacted actual ShinyHunters to verify impersonation claim. Best source for BreachForums post contents and threat actor details. |
| PushSecurity | Highest technical authority | OAuth security specialists; most detailed analysis of OAuth chain mechanism, permission scope, and control gaps. |
| The Register | Skeptical/investigative | Flagged both-sides deflection ("Neither acknowledged systemic agentic AI risks"), noted shared responsibility gap. |
| RecoAI | Technically solid | SaaS security vendor with OAuth expertise; good step-by-step chain reconstruction. Notes "shadow AI" pattern. |
| GitGuardian | Technically solid | Secret detection vendor; best source on environment variable classification and remediation implications. |
| Hudson Rock | Third-party credential intel | Obtained Lumma Stealer log data over a month before public disclosure; key source for detection gap timeline. |
| Google Threat Intelligence | Authoritative on attribution | Principal analyst Austin Larsen assessed ShinyHunters claim as likely impersonation. |
| Vercel CEO (Guillermo Rauch) | Vendor perspective | Publicly stated attackers demonstrated "surprising velocity," suspected "AI" accelerated the attack. |

---

## Key Dates

| Event | Date | Source |
|-------|------|--------|
| Context.ai employee infected with Lumma Stealer malware | February 2026 | [THN], [CyberScoop], [Gupta] |
| Attacker accesses Context.ai AWS infrastructure, harvests OAuth tokens | March 2026 | [THN], [RecoAI] |
| Context.ai internally identifies unauthorized AWS access | March 2026 | [THN] |
| Google removes Context.ai Chrome extension from Chrome Web Store | March 27, 2026 | [THN] |
| OpenAI leaked-key alert received by at least one Vercel customer (Andrey Zagoruiko) — key only existed in Vercel | April 10, 2026 | [Rescana] (citing public customer report) |
| Vercel publicly discloses incident (initial bulletin, 11:04 AM PST) | April 19, 2026 | [Vercel-KB] |
| TechCrunch, BleepingComputer, THN, Register publish coverage | April 20, 2026 | all trade sources |
| Vercel clarifies definition of "compromised credentials" | April 20, 2026, 10:59 AM PST | [Vercel-KB] |
| Vercel publishes investigation findings, identifies additional compromised accounts | April 22, 2026, 7:58 PM PST | [Vercel-KB] |
| Vercel further clarifies findings | April 23, 2026, 9:54 AM PST | [Vercel-KB] |
| Vercel status update (no new information) | April 24, 2026, 4:22 PM PST | [Vercel-KB] |

**Key detection gap:** Compromised Context.ai credentials were available in criminal infostealer databases for over a month before the breach became public. Hudson Rock had the data 30+ days before Vercel's April 19 disclosure. The earliest confirmed downstream credential use (OpenAI key alert, April 10) suggests a ~9-day window between credential activation in the wild and Vercel's disclosure. [Gupta], [Rescana]

**date_occurred:** Attacker gained access to Vercel systems in March or early April 2026 (exact date not disclosed). Earliest downstream evidence: April 10, 2026.
**date_discovered:** Not explicitly stated by Vercel; implied to be shortly before April 19, 2026 public disclosure.
**date_reported:** April 19, 2026 (Vercel's initial public bulletin).

---

## What is Context.ai?

Context.ai is an AI productivity startup. Relevant to this incident, it operated a consumer product called the **AI Office Suite**, launched in June 2025. The product was described as "a workspace designed to help users work with AI agents to build presentations, documents, and spreadsheets." [The Register]

Key functional details relevant to the breach:
- The AI Office Suite included a feature that "allowed consumer users to **enable AI agents to perform actions across their external applications**, facilitated via another 3rd-party service." [The Register]
- Users could connect their Google Workspace to the suite and grant AI agents the ability to "perform Google Workspace actions such as writing emails or creating documents on the grantee's behalf." [search result synthesis]
- The OAuth permissions requested were broad — the integration included "full read/write access to everything the user can see in Drive" via Google Drive scope. [PushSec]
- Context.ai also deployed a Chrome extension (ID: `omddlmnhcofjbnbflmjginpjjblphbgk`) that enabled an additional OAuth grant for Google Drive read access. Google removed this extension from the Chrome Web Store on March 27, 2026. [THN]

**Current status:** The AI Office Suite consumer product was shut down following the incident. Context.ai has pivoted to an enterprise product called **Bedrock**, described as "the enterprise platform for deploying agents into real workflows," running on-premises in customer environments. [Context.ai security update, search results]

**Classification note on Context.ai:** Context.ai is NOT a passive analytics tool. It is an active AI agent platform — its product explicitly enabled autonomous agent actions across user applications via OAuth delegation. This is directly relevant to the failure mode: the agentic OAuth delegation pattern (granting broad permissions so AI can act on your behalf) is exactly what created the attack surface.

---

## Attack Mechanism: Full Chain

### Stage 1 — Initial Compromise (February 2026)
A Context.ai employee was infected with **Lumma Stealer** malware after downloading "Roblox 'auto-farm' scripts and executors" — a well-documented Lumma Stealer distribution vector. [THN, CyberScoop]

The malware harvested the employee's corporate credentials including:
- Google Workspace credentials (including the `support@context.ai` account)
- Keys and logins for Supabase, Datadog, and Authkit
- OAuth tokens and session data

[THN, Gupta, CyberScoop]

### Stage 2 — AWS Infrastructure Pivot (March 2026)
Using stolen credentials, the attacker accessed Context.ai's **AWS environment**, which hosted Context.ai's authentication and integration components — including **OAuth tokens issued to AI Office Suite users**. Context.ai confirmed "unauthorized access to their infrastructure" and that OAuth tokens were "likely compromised." [THN, RecoAI]

Context.ai internally identified this unauthorized AWS access in March 2026 but only disclosed the OAuth token compromise publicly after Vercel went public in April — a critical delayed disclosure. [THN, The Register]

### Stage 3 — OAuth Token Theft
The attacker obtained OAuth tokens that Vercel employees had granted to Context.ai's AI Office Suite. At least one Vercel employee had:
1. Signed up for the AI Office Suite using their **Vercel enterprise Google account**
2. Granted "Allow All" permissions when authorizing the integration

Vercel's internal OAuth configurations "appear to have allowed this action to grant these broad permissions in Vercel's enterprise Google Workspace." [The Register, RecoAI]

The stolen OAuth token reflected the full scope of access the employee's account held — including shared drives, shared calendars, collaborative documents, and any other resources accessible to that employee. [PushSec]

**Key OAuth app IDs involved:**
- `110671459871-30f1spbu0hptbs60cb4vsmv79i7bbvqj.apps.googleusercontent.com` — primary Vercel access app
- `110671459871-f3cq3okebd3jcg1lllmroqejdbka8cqq.apps.googleusercontent.com` — Chrome extension with Google Drive access

[THN, BleepComp, PushSec]

### Stage 4 — Google Workspace Account Takeover
The attacker used the stolen OAuth token to take over the Vercel employee's Google Workspace account. **No MFA bypass or real-time phishing was required** — the OAuth trust had been granted months earlier and was compromised at Context.ai's side. [RecoAI, PushSec]

This granted access to "Vercel's enterprise Google Workspace" including internal documents, shared drives, and collaborative resources. [Vercel-KB, PushSec]

### Stage 5 — Internal System Pivot
From the Google Workspace foothold, the attacker "maneuvered through systems to enumerate and decrypt non-sensitive environment variables." [Vercel-KB]

Vercel CEO Guillermo Rauch described the attacker as demonstrating "surprising velocity and in-depth understanding of Vercel's systems," and stated the company "strongly suspects" the attack was **"significantly accelerated by AI."** [CyberScoop, Gupta]

### Stage 6 — Environment Variable Exfiltration
Vercel stores all customer environment variables encrypted at rest. However, variables NOT marked with Vercel's "sensitive" flag decrypt to plaintext and were accessible via the compromised internal access. The attacker enumerated and exfiltrated these non-sensitive environment variables, which can include:
- API keys
- Tokens (NPM, GitHub)
- Database credentials
- Signing keys

[Vercel-KB, GitGuardian, BleepComp]

**Sensitive variables** (those explicitly flagged in Vercel's UI) remained encrypted throughout. Vercel stated: "We do not have evidence that sensitive-marked variables were accessed." [Vercel-KB, Gupta]

### Stage 7 — BreachForums Listing
On April 19, 2026, a threat actor using the ShinyHunters name posted on BreachForums claiming to sell stolen Vercel data for **$2 million**. The listing claimed to include:
- Access keys
- Source code and databases
- Internal deployment access
- API keys (NPM, GitHub tokens)
- Employee records (580 records with names, email addresses, account status)
- Screenshots of Vercel's internal Enterprise dashboard

The attacker shared a text file with 580 employee records as proof. BleepingComputer could not independently verify authenticity. [BleepComp]

**Attribution note:** Actual ShinyHunters members denied involvement to BleepingComputer. Google Threat Intelligence Group principal analyst Austin Larsen assessed the threat actor as "likely an imposter attempting to use an established name to inflate their notoriety." [BleepComp]

---

## Data Compromised

### Confirmed by Vercel:
- Non-sensitive environment variables from "a limited subset of customers" — these may contain API keys, tokens, database credentials, signing keys
- A "small number of additional accounts" identified in expanded investigation (April 22)
- "A small number of customer accounts with signs of compromise that appear to be separate from the April 2026 incident" — these "do not appear to have originated on Vercel systems" (likely separate credential stuffing or malware) [Vercel-KB]

### Claimed by threat actor (BreachForums, unverified):
- 580 employee records (names, emails, account status, timestamps)
- Access keys, source code, database data
- Internal deployment access, API keys (NPM, GitHub)
- Screenshots of internal Enterprise dashboard

### Confirmed NOT compromised:
- npm packages published by Vercel (verified jointly with GitHub, Microsoft, npm, Socket) [Vercel-KB]
- Next.js, Turbopack, open-source projects [Vercel-KB]
- Sensitive-flagged environment variables [Vercel-KB]

### Downstream exploitation evidence:
- At least one customer (Andrey Zagoruiko) received an OpenAI leaked-key alert on **April 10, 2026** — 9 days before Vercel's disclosure — for an API key that, per the customer, existed only in Vercel [Rescana, citing public customer report]
- This is the strongest evidence that stolen credentials were operationalized before Vercel knew about or disclosed the breach

---

## Impact

### Customer impact:
- No specific customer count disclosed. Language: "limited subset," later "a small number of additional accounts"
- Environment variables across affected accounts treated as fully compromised (API keys, DB credentials, signing keys)
- Customers advised to rotate all non-sensitive environment variables

### Confirmed dark web sale:
- BreachForums listing exists; authenticity of data unverified independently
- $2 million asking price — high, suggesting significant perceived value or bluff

### Downstream exploitation:
- At least one confirmed case of OpenAI key from Vercel being flagged in the wild prior to disclosure (April 10)
- Full extent of downstream use "remains under investigation" as of last Vercel update (April 24)
- No confirmed mass exploitation reported

### Vercel's reputational/financial impact:
- Significant reputational impact — Vercel is a major hosting platform for Next.js/React applications
- No financial figures disclosed
- Stock/private company — no market data

---

## Vendor Response

### Vercel:
- Disclosed publicly April 19, 2026 (initial bulletin)
- Engaged Google Mandiant and additional cybersecurity firms
- Engaged law enforcement
- Contacted Context.ai directly to understand scope of their compromise
- Notified affected customers with rotation recommendations
- Expanded investigation April 22–24, identified additional affected accounts
- Confirmed npm/open-source projects safe via joint verification with GitHub, Microsoft, npm, Socket
- Rolled out dashboard updates improving environment variable management (sensitive variable encryption improvements)
- Did NOT disclose customer count at any point

### Context.ai:
- Discovered unauthorized AWS access in March 2026
- Did NOT immediately disclose OAuth token compromise publicly
- Disclosed OAuth token theft only after Vercel's April public disclosure
- Removed AI Office Suite and associated OAuth application
- Chrome extension removed from Chrome Web Store on March 27, 2026 (by Google)
- Blamed Vercel's OAuth configuration for allowing overly broad permissions
- Shut down AI Office Suite consumer product entirely

### Shared deflection pattern:
Both vendors deflected responsibility. Vercel cited Context.ai as the breach origin. Context.ai cited Vercel's OAuth configuration as enabling the overly broad grant. Neither proactively acknowledged systemic agentic AI risk. [The Register]

---

## Classification Assessment

### Is this an AI agent incident?

**Yes, with important nuance.** This is not simply a breach that happened to involve an AI tool. The AI-agentic nature of Context.ai's product is directly causal to the attack surface:

1. **Context.ai's AI Office Suite was explicitly an AI agent platform** — it enabled autonomous agents to perform actions across user applications via OAuth delegation. The product's core value proposition was agentic: AI acting on the user's behalf in Google Workspace.

2. **The agentic OAuth pattern created the attack surface.** The reason the OAuth grant was so broad ("Allow All" permissions, full Google Drive read/write) was because the product needed those permissions for AI agents to act autonomously across user documents, emails, and calendars. A passive analytics tool would not need this scope.

3. **Shadow AI was the proximate enabler.** An individual Vercel employee signed up for the consumer AI Office Suite using their enterprise Google account — no procurement review, no security assessment, no contract. The IT/security team had no visibility into this integration. [RecoAI, PushSec]

4. **AI allegedly accelerated the attack itself.** Vercel CEO stated the company "strongly suspects" the attack was "significantly accelerated by AI." This is unverified but notable. [CyberScoop]

### AI-agent-specific failure modes identified:

1. **Over-permissioned agentic OAuth grants:** AI agents require broad permissions to act autonomously. Those permissions become a latent liability if the AI provider is compromised. Standard principle of least privilege is frequently bypassed because AI tools request maximal permissions to function.

2. **Shadow AI / unsanctioned agentic integrations:** Employees connecting AI agent tools to enterprise identity without IT oversight. The breach was enabled by a single employee's personal sign-up with enterprise credentials.

3. **OAuth trust chain as attack vector:** The OAuth trust established for agentic purposes (let AI act on my behalf) is weaponizable: compromise the AI tool, inherit the user's permissions without requiring real-time user interaction. No MFA, no phishing — just dormant trust.

4. **Third-party AI tool supply chain risk:** Consumer-facing AI agent products (lower security bar than enterprise tools) can become entry points into enterprise environments when employees use them with corporate credentials.

### Primary failure mode:
**Agentic OAuth Over-Permissioning + Supply Chain Compromise**

The AI agent's functional requirement for broad OAuth scope created the attack surface. The compromise of the AI tool provider then weaponized that scope. This is distinct from a generic supply chain breach because the breadth of permissions was specifically enabled by the agentic use case.

### Category assignment:
- **Primary:** Supply Chain Compromise (AI tool provider)
- **Secondary:** Unauthorized Data Access, OAuth Abuse
- **Tertiary:** Privacy Violation (customer credentials, potentially PII in environment variables)
- **Shadow AI** as contributing factor

### Severity: High
- Breadth: "Limited subset" of Vercel customers — specific count unknown, but Vercel serves hundreds of thousands of developers
- Data sensitivity: API keys, database credentials, signing keys — high-impact secrets enabling downstream compromise
- Confirmed downstream use: At least one OpenAI key flagged before disclosure
- Ransomware angle: $2M BreachForums listing (attribution disputed)
- Not Critical because: Sensitive-flagged variables not accessed; npm/open-source not compromised; no confirmed mass exploitation

---

## Related Incidents

| AAGF ID | Title | Relationship |
|---------|-------|--------------|
| AAGF-2026-009 | LiteLLM PyPI supply chain | AI infrastructure supply chain compromise — different vector (package poisoning vs. OAuth chain), same supply chain theme |
| AAGF-2026-020 | Postmark MCP | Supply chain compromise of AI tooling used by developers |
| AAGF-2026-037 | Moltbook | AI platform credential exposure — similar theme of AI platform holding sensitive customer credentials |

---

## Open Questions / Gaps

1. **Exact customer count** never disclosed by Vercel. "Limited subset" is opaque given Vercel's scale.
2. **Full extent of data exfiltration** still "under investigation" as of April 24 last update — no follow-up finding confirmed.
3. **Context.ai's disclosure gap:** Why did Context.ai's March discovery not trigger immediate OAuth token revocation? Was the full OAuth token compromise scope not understood until April?
4. **Dark web data verification:** BleepingComputer could not independently verify BreachForums data authenticity. Was data actually sold? To whom?
5. **AI acceleration claim:** Vercel CEO's "AI accelerated the attack" statement is unverified. What evidence supports this?
6. **Separate compromise accounts:** Vercel noted a "small number of accounts with signs of compromise separate from this incident." What was the separate vector? Social engineering or malware targeting Vercel customers directly?
7. **Andrey Zagoruiko's April 10 OpenAI key alert** — was this the only confirmed pre-disclosure downstream exploitation, or were there others?

---

## Recommended Frontmatter Fields (Draft)

```yaml
id: AAGF-2026-055
title: "Vercel April 2026 Breach: AI Agent OAuth Supply Chain Attack via Context.ai"
date_occurred: "2026-03" # Attacker accessed systems March/early April; earliest downstream evidence April 10
date_discovered: "2026-04-19" # Implied from Vercel's public disclosure date
date_reported: "2026-04-19"
status: published
severity: high
categories:
  - supply-chain-compromise
  - unauthorized-data-access
  - oauth-abuse
  - privacy-violation
ai_system: "Context.ai AI Office Suite (AI agent platform for Google Workspace)"
vendor: "Vercel (victim); Context.ai (compromised AI tool provider)"
failure_mode: "Agentic OAuth over-permissioning + third-party AI tool supply chain compromise"
actual_vs_potential: "partial"
actual_damage: "Non-sensitive environment variables (API keys, DB credentials, signing keys) from a limited subset of Vercel customer accounts; 580 employee records claimed on BreachForums; at least one OpenAI key confirmed active in the wild before disclosure"
potential_damage: "Full compromise of all customer environment variables across Vercel's developer platform; mass downstream service takeovers (databases, APIs, deployments); Vercel serves hundreds of thousands of developers — full scope exploitation could have affected the broader web infrastructure supply chain"
intervention: "Sensitive-flagged variables remained encrypted; Vercel's internal investigation contained lateral movement before full exfiltration; attacker demanded $2M ransom rather than quietly exploiting all credentials"
```
