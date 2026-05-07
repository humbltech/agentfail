# Stage 1 Research: AAGF-2026-047
## Candidate: OmniGPT Data Breach — AI Aggregator Platform Exposes 34M Conversation Lines

**Research date:** 2026-05-07
**Researcher:** Stage 1 Research Agent

---

## TRIAGE VERDICT

**QUALIFIED WITH CAVEATS** — The breach itself appears to be a conventional infrastructure/database compromise of an AI chatbot aggregator platform. The AI's autonomous behavior did not cause the breach. However, the incident qualifies for AgentFail coverage under a specific and meaningful angle: AI aggregator platforms create a novel, concentrated attack surface by centralizing conversation data that users treat as ephemeral but the platform persists indefinitely — and users routinely embed sensitive credentials, API keys, and PII inside those conversations. The failure mode is structural to how AI chat platforms handle data governance, not a one-time security lapse. This is the "AI platform data retention as attack surface" pattern. Coverage should be framed around that finding, not as a generic breach story.

**Unresolved concern (lowers confidence):** The breach has not been independently verified. OmniGPT never acknowledged it. Sole source is threat actor "Gloomer" on BreachForums — a forum known for fabricated breach claims. The data samples shown are consistent with a real breach but not fully corroborated. Label as "alleged" throughout.

---

## AgentFail Scope Assessment

### Was AI/agent behavior the cause of the breach?

No. The breach mechanism is unconfirmed but points toward conventional infrastructure compromise: weak authentication, API endpoint exposure, session management flaws, or inadequate access controls. The AI models (GPT-4, Claude 3.5, Gemini, Midjourney) were not agents acting autonomously — they were responding to user prompts via OmniGPT's aggregation layer. There is no evidence that any AI model's behavior exfiltrated data or caused the breach.

### Does this reveal something specific about how AI platforms handle or expose data?

Yes — and this is the qualifying angle:

1. **Conversation persistence without user awareness.** OmniGPT stores all user-AI conversations server-side. Users treated the chat interface as a scratchpad and freely embedded API keys, credentials, crypto private keys, billing information, and proprietary documents. This is a documented behavioral pattern specific to conversational AI interfaces: users underestimate or are unaware of data retention.

2. **AI aggregator as credential concentration point.** OmniGPT integrates OpenAI, Anthropic, Google, and Midjourney APIs in one platform. Users accessing multiple AI models through a single aggregator concentrate all their sensitive AI-related credentials and workflows in one target. A single breach yields cross-platform exposure.

3. **Non-human identity (NHI) chain risk.** The exposed data included API keys and authentication tokens for integrated services (Slack, Google Workspace, Notion). This creates a lateral movement vector: breach the aggregator, harvest NHI credentials, pivot to enterprise systems. This is structurally different from a traditional PII breach.

4. **"Shadow AI" amplification.** Forcepoint's analysis notes this incident exemplifies risks from employees using AI tools without organizational visibility or data governance controls — sharing sensitive business data in AI conversations that are then stored by a third-party platform.

### Classification: AI-agent failure or conventional breach?

Hybrid. The root technical cause appears conventional. The *why it matters* and *why the impact scale is unique* are AI-platform-specific. AgentFail should frame it as: "What happens when an AI platform fails to protect the conversation data that users — incorrectly — assume is private or ephemeral."

---

## Key Facts

| Fact | Detail | Source |
|------|--------|--------|
| Threat actor | "Gloomer" on BreachForums | Hackread, CSO Online, CyberInsider |
| Data offered for | $100 USD | CSO Online |
| Chat lines exposed | 34,270,455 lines of user-AI conversations | Hackread |
| User emails exposed | ~30,000 | All sources |
| Phone numbers exposed | ~20% of affected users (~6,000) | SecureWorld, CSO Online |
| API keys/credentials | Found within conversation messages | All sources |
| Crypto private keys | ~130 extracted via regex program; 10 had balances/NFTs | CSO Online |
| File links exposed | 6,000+ uploaded files (some containing credentials, billing info) | SecureWorld |
| OmniGPT response | None — no public acknowledgment | All sources |
| Data asking price | $100 | CSO Online |
| Verification status | Alleged — not independently confirmed | Research assessment |

---

## Dates

| Event | Date | Source / Notes |
|-------|------|----------------|
| First BreachForums post (initial claim) | January 24, 2025 | CSO Online — KrakenLabs detected this post |
| Follow-up post / data offered for sale | February 10, 2025 | CSO Online |
| First public media reporting | February 9–11, 2025 | CyberInsider (Feb 9), Hackread (Feb 11), CSO Online (Feb 12), SecureWorld (Feb 13) |
| KrakenLabs discovery/alert | January 27, 2025 | SecureWorld |
| When breach actually occurred | Unknown — OmniGPT never disclosed | All sources confirm no vendor statement |
| OmniGPT official response | Never issued | All sources |

**Timeline reconciliation:** The initial BreachForums post appears to have been January 24, 2025 (per CSO Online/KrakenLabs). KrakenLabs flagged it on January 27, 2025. Public media coverage began February 9–11, 2025 when a follow-up post offering the full dataset for $100 generated broader attention.

---

## Technical Analysis

### What is OmniGPT?

OmniGPT (omnigpt.co / app.omnigpt.co) is an AI chatbot aggregator platform that provides unified access to multiple AI models: ChatGPT-4, Claude 3.5 (Anthropic), Google Gemini, Perplexity, and Midjourney (image generation). It also offers WhatsApp integration, team collaboration features, document management, and integrations with workplace tools (Slack, Google Workspace, Notion). Pricing: free tier to ~$16/month. Not an autonomous agent platform — OmniGPT is a multi-model chat interface, not a system deploying AI agents to take autonomous actions.

### How did the breach occur?

**Unknown — this is a critical gap.** "Gloomer" did not disclose the attack vector. Technical evidence from exposed data suggests possible vectors:

- **API endpoint vulnerability:** Leaked data samples included "API request headers and payloads, specifically referencing OmniGPT's application endpoint (https://app.omnigpt.co)" — suggesting the attacker may have exploited session management or authentication weaknesses at the API layer (SecureWorld / KrakenLabs analysis)
- **Weak authentication / access control failures** — cited as possible causes by NHIMG analysis
- **Encryption deficiencies** — sensitive data may have been stored without adequate encryption
- **Third-party integration compromise** — possible entry via integrated services (Slack, Google Workspace)

**No SQL injection, no ransomware, no phishing chain documented.** The attack mechanism remains unconfirmed.

### What was in the 34 million conversation lines?

Based on sampled data and attacker claims:
- Technical discussions with embedded API keys and credentials (users pasting keys directly into chat)
- Business documents: market analysis reports, office project files
- Personal documents: university assignments, police verification certificates, WhatsApp screenshots
- Files containing billing information
- Crypto private keys (~130 extracted by attacker using regex; 10 had balances)

### Were API keys actively misused?

**Not confirmed.** The attacker acknowledged having extracted API keys and credentials but no source documents active exploitation of those keys. The crypto key extraction (130 keys, 10 with balances) is the only confirmed active extraction — the attacker built a regex tool specifically for this. Whether those crypto balances were drained is not reported.

### Geographic distribution of affected users

Brazil, Italy, India, Pakistan, China, Saudi Arabia — consistent with OmniGPT's global user base.

### HIBP Listing

No HIBP (Have I Been Pwned) listing found for OmniGPT as of research date. The breach has not appeared in HIBP's database, likely because OmniGPT never confirmed it and HIBP requires some corroboration before adding a breach.

---

## Damage Assessment

### Documented/Confirmed
- **Financial loss (users):** Unknown — no confirmed cases of financial fraud or account takeover reported
- **Crypto losses:** Potentially minor — 10 crypto private keys had balances, but no confirmed draining reported
- **Users affected:** ~30,000 with email exposure; subset with phone numbers; unknown total active user base
- **Data volume:** 34M+ conversation lines — qualitatively significant even if the user count seems modest

### Potential / Near-Miss
- **API key lateral movement:** Any user who pasted API keys (OpenAI, Anthropic, AWS, etc.) into OmniGPT conversations had those keys exposed. Scope unknown but likely dozens to hundreds of keys across corporate and individual users. Each represents a potential unauthorized access vector.
- **Enterprise exposure via Slack/Google Workspace credentials:** If workplace integration credentials were exposed, lateral movement into corporate environments was possible.
- **Proprietary business data:** Market analysis reports and business documents in uploaded files represent potential competitive intelligence exposure — no direct financial figure possible.
- **GDPR exposure (OmniGPT):** European users confirmed (Italy) — failure to notify regulators or affected users within 72 hours is a GDPR violation. No GDPR enforcement action reported as of research date.

### actual_vs_potential classification
`"partial"` — Some harm likely occurred (crypto keys with balances were found by attacker; credentials were exposed to a threat actor). Full exploitation scope unknown.

---

## Vendor Response

**OmniGPT issued no public statement.** Every source confirms this. The company did not respond to media inquiries from Hackread, CSO Online, CyberInsider, or SecureWorld. There was no breach notification to affected users documented in any source. No regulatory filing discovered.

This silence has its own implications:
- If the breach is real: failure to notify violates GDPR (EU users affected) and potentially other privacy regulations
- If the breach is fabricated: the company's failure to deny it or reassure users is itself a reputational harm
- OmniGPT's continued operation without public acknowledgment suggests either the company does not believe the breach is real, cannot confirm it, or is deliberately avoiding disclosure

---

## Source Bias and Verifiability Assessment

**Critical caveat: this breach is self-reported by the attacker.**

The sole primary source is threat actor "Gloomer" posting on BreachForums — a forum with documented history of fabricated breach claims for attention and monetization. Key verifiability considerations:

1. **No independent sample verification:** No journalist or security firm reported independently verifying that the sampled data is genuine and from OmniGPT's systems specifically (vs. aggregated from other sources)
2. **OmniGPT silence:** Could indicate (a) breach is real and company is hoping it stays quiet, (b) breach is fabricated and company assessed it not worth dignifying, or (c) company is unaware. All are possible.
3. **KrakenLabs monitoring:** KrakenLabs (a credible threat intelligence firm) detected and reported the BreachForums posts — this lends some credibility to the claim's existence but not its authenticity
4. **$100 asking price:** Extremely low for 34M records. Could indicate the data is low-quality/old, or the attacker's primary motive was reputation/notoriety rather than profit. Neither confirms nor denies authenticity.
5. **Data structure consistency:** The API request headers and endpoint references in leaked samples are consistent with what OmniGPT's actual API would produce — this is the strongest evidence of authenticity short of vendor confirmation.

**Verdict:** Plausible but unverified. Should be labeled "alleged" in all AgentFail content. The story is worth covering because the security lessons are valid regardless of whether this specific breach occurred — the attack surface is real.

---

## Classification Assessment

### Does this QUALIFY for AgentFail?

**Yes, with caveats and specific framing.**

**What qualifies it:**
- Real production AI platform (OmniGPT is a live commercial service)
- Meaningful impact: 30,000+ users, 34M conversation lines, credential exposure
- Reveals a structural failure mode unique to AI platforms: conversation data as a persistent, high-value attack target
- Illustrates user behavior risk: people treat AI chat interfaces as disposable scratchpads, not understanding that conversation history is a goldmine for attackers
- API/NHI chain risk: aggregator platforms concentrate attack surface across multiple AI providers

**What qualifies only partially:**
- AI behavior was not the cause — this is an infrastructure breach, not an agent failure
- "Agent" element is weak: OmniGPT is a chatbot UI, not an autonomous agent system

**Suggested AgentFail framing:**
This incident is best framed as an **AI platform data governance failure** and a **conversation data retention risk** — not an "AI agent went rogue" story. The relevant lesson for operators: AI platforms that store conversation history create a new attack surface category. Sensitive data shared in AI conversations persists in ways users don't anticipate, and platform-side security failures can expose it at massive scale.

**Recommended category:** `data-exposure` or `platform-security-failure`

**Relevant failure modes:**
- AI platform data retention without adequate user consent/awareness
- Aggregator platform attack surface concentration
- Non-human identity (NHI) chain risk from embedded credentials in conversations
- Lack of data minimization (retaining full conversation history)

### Severity Estimate
- **Severity:** Medium-High (impact is real and broad; full exploitation unknown)
- **Novelty:** High (conversation-as-attack-surface is an emerging, underappreciated risk category)
- **Verifiability:** Medium (plausible but unconfirmed by vendor)

### Comparable incidents
- ChatGPT conversation history bug (March 2023, OpenAI) — different mechanism (bug exposed conversations to wrong users) but same risk category: conversation data exposure at AI platforms
- Samsung/ChatGPT leak (2023) — employees pasting proprietary code into ChatGPT; OmniGPT incident is the server-side consequence of that same behavior

---

## Sources Reviewed

| Source | URL | Quality | Notes |
|--------|-----|---------|-------|
| Hackread | https://hackread.com/omnigpt-ai-chatbot-breach-hacker-leak-user-data-messages/ | Good | Primary coverage, Feb 11 2025 |
| CSO Online | https://www.csoonline.com/article/3822911/hacker-allegedly-puts-massive-omnigpt-breach-data-for-sale-on-the-dark-web.html | Good | Includes KrakenLabs attribution, Jan 24 initial post date |
| SecureWorld | https://www.secureworld.io/industry-news/omnigpt-massive-data-breach | Good | KrakenLabs Jan 27 discovery date; API endpoint detail |
| CyberInsider | https://cyberinsider.com/omnigpt-allegedly-breached-34-million-user-messages-leaked/ | Good | Feb 9 date; good aggregator context |
| FireTail | https://www.firetail.ai/blog/omnigpts-massive-alleged-breach | Good | AI-specific risk framing; behavioral analysis |
| CPO Magazine | https://www.cpomagazine.com/cyber-security/ai-aggregator-omnigpt-suffers-a-security-breach-exposing-sensitive-data-including-credentials/ | N/A | 403 Forbidden — could not fetch |
| NHIMG | https://nhimg.org/omnigpt-breach-34m-conversations-exposed | Good | Non-human identity angle; NHI chain risk analysis |
| Forcepoint | https://www.forcepoint.com/blog/insights/omnigpt-gen-ai-data-breach | Good | Shadow AI / GenAI governance framing |
| SC Media | https://www.scworld.com/brief/omnigpt-claimed-to-be-subjected-to-extensive-breach | Referenced via search | Brief only |
| PurePrivacy | https://www.pureprivacy.com/blog/dark-web-monitoring/omnigpt-security-breach/ | Referenced via search | User-facing guidance |
| HIBP | haveibeenpwned.com | No listing found | OmniGPT not in HIBP database |
| Gloomer (BreachForums) | Primary threat actor source | Unverifiable | Sole originator of breach claim |
