# AAGF-2026-038 Research: Sears Home Services AI Chatbot Data Leak

**Triage verdict: QUALIFIES — with classification caveats (see below)**

---

## Source Attribution Table

| Source | Type | URL | Date Published | Reliability |
|--------|------|-----|----------------|-------------|
| ExpressVPN Blog (Jeremiah Fowler) | Primary researcher report | https://www.expressvpn.com/blog/searshomeservices-data-exposed/ | 2026-03-17 | High — Fowler is the discoverer; ExpressVPN commissioned the research |
| DataBreaches.net | Aggregator/secondary | https://databreaches.net/2026/03/17/sears-exposed-ai-chatbot-phone-calls-and-text-chats-to-anyone-on-the-web/ | 2026-03-17 | High — reputable breach tracking outlet |
| Wired | Journalism/secondary | Referenced via AI CERTs and search results | 2026-03-17 | High — independent journalism corroboration |
| Cybernews | Journalism/secondary | https://cybernews.com/ai-news/ai-chatbot-data-leak-sears/ | 2026-03-17 | Medium-High |
| SC Media | Industry security press | https://www.scworld.com/brief/misconfigured-ai-bot-databases-leak-millions-of-sears-home-services-customer-records | 2026-03-17 | High |
| Security Magazine | Industry press | https://www.securitymagazine.com/articles/102188-37m-records-exposed-many-belonging-to-sears-home-services | 2026-03-23 | Medium-High |
| TechRadar | Tech press | https://www.techradar.com/vpn/vpn-privacy-security/expressvpn-uncovers-3-7-million-items-of-leaked-ai-chatbot-data-a-reminder-of-how-vital-encryption-is | 2026-03-18 | Medium |
| AI CERTs News | Security news | https://www.aicerts.ai/news/sears-chatbot-data-security-breach-exposes-millions-of-calls/ | 2026-03-17 | Medium |
| BeyondMachines | Security aggregator | https://beyondmachines.net/event_details/sears-home-services-ai-chatbot-logs-and-audio-recordings-exposed-in-massive-data-leak-u-j-g-w-c/gD2P6Ple2L | 2026-03-17 | Medium |
| Jeremiah Fowler (X/Twitter) | Researcher social | https://x.com/yoda69/status/2033867636749041745 | ~2026-03-17 | High — primary researcher |

---

## Source Bias Assessment

**PRIMARY SOURCE IS A SECURITY VENDOR RESEARCHER — FLAG APPLIED.**

Jeremiah Fowler conducted this research commissioned by/published through ExpressVPN, a commercial VPN provider. ExpressVPN has a commercial interest in publicizing data leak incidents (it reinforces their product value proposition). However:

- Fowler is a well-established independent security researcher with a track record of credible disclosures (multiple prior verified incidents)
- The quantitative claims (3.7M records, 4.3TB data, file type breakdown) are consistent across all secondary sources
- Wired independently covered the story on the same day (2026-03-17), providing corroboration from a non-commercial outlet
- The core technical facts (publicly accessible storage buckets, PII exposure) are not disputed by any source
- No independent verification of the 3.7M figure beyond Fowler's count — Transformco has not confirmed specific numbers

**Conclusion**: Quantitative claims should be treated as credible but unconfirmed by Transformco. The mechanism of failure (misconfigured storage buckets, no authentication) is independently corroborated.

---

## Dates Section

| Date | Event | Source |
|------|-------|--------|
| 2024 (earliest) | Oldest records in exposed databases | ExpressVPN/Fowler |
| 2026-02-03 | **date_discovered**: Jeremiah Fowler discovers three unsecured storage buckets during routine Shodan scans | AI CERTs News |
| 2026-02-03 or 2026-02-04 | Fowler sends responsible disclosure notice to Transformco | ExpressVPN/Fowler |
| 2026-02-04 (approx.) | Transformco restricts public database access — "within 24 hours" of disclosure | Multiple sources |
| 2026-03-17 | **date_reported**: ExpressVPN publishes Fowler's full report; Wired publishes independent coverage; first public disclosure | Multiple sources |
| 2026-03-23 | Security Magazine publishes follow-up coverage | Security Magazine |

**date_occurred**: Cannot be precisely determined. Data ranged from 2024 to 2026, suggesting the misconfiguration may have existed since the AI systems were deployed, potentially years before discovery. Duration of exposure before 2026-02-03 is unknown.

**date_discovered**: 2026-02-03 (by Fowler; unknown if Transformco was aware prior)

**date_reported** (first public disclosure): 2026-03-17

**Gap between discovery and public disclosure**: ~6 weeks. This is standard responsible disclosure timing. Access was restricted within 24 hours of Fowler's notice; public report followed 6 weeks later, presumably to allow remediation confirmation.

---

## Technical Mechanism Section

### What Failed

Three separate cloud storage buckets (described as "storage buckets" discoverable via Shodan) were configured with no password protection and no encryption at rest. The specific cloud provider is not identified in any source (not confirmed as AWS S3, Azure Blob, or GCP — only "storage buckets" is used consistently).

The databases contained:
- **Database 1**: 2,116,011 TXT files — chat log transcripts (text conversations between customers and the Samantha AI chatbot)
- **Database 2**: 207,381 XLSX files — scheduling logs and related audio file references
- **Database 3**: 1,442,577 audio files — recordings of phone calls

Total: ~3.7 million records, ~4.3TB data (415.2GB logs + 3.9TB audio)

**Files were in English and Spanish** — suggesting multi-lingual customer base served by the AI systems.

### The AI Systems Involved

**Samantha**: An AI virtual assistant / chatbot deployed for customer-facing interactions at Sears Home Services. Function: handle inbound customer service inquiries, scheduling, support for appliance repair/service appointments. Referenced throughout both chat transcripts and audio recordings. Appears to have handled both text chat and phone-based interactions.

**KAIros**: A broader AI ecosystem built by/for Sears. Components identified:
- Service Scheduler: appointment booking
- Fix Genius: AI-driven appliance diagnostics and repair guidance
- HireHub: HR recruitment tool (candidate sourcing to onboarding)

KAIros appears to be the platform; Samantha is the customer-facing persona/interface of that platform.

### How the Exposure Happened

This was an **infrastructure misconfiguration**, not a hack, not a prompt injection, not an AI agent taking autonomous harmful action. The AI systems generated and stored interaction data (chat logs, audio recordings, transcripts) to cloud storage buckets. Those buckets were left without authentication controls, making them discoverable via Shodan and accessible to anyone with the URL.

The AI system's failure mode is: **its outputs (conversation logs, audio) were stored without access controls.** The AI itself did not expose data — the storage layer for its outputs was misconfigured.

### Recording Behavior (Aggravating Factor)

Several audio recordings ran up to **4 hours in duration** — far exceeding the length of typical customer service interactions. This indicates the chatbot/voice system continued recording after the service interaction ended, capturing:
- Background TV audio
- Household conversations
- Ambient private audio

This behavior (recording well beyond interaction scope) was not intentional design but appears to be a failure of call-end detection logic in the voice AI system. This creates voice biometric data exposure risk: "as little as 30 seconds of audio can be enough to convincingly clone a voice" (Cybernews).

### Access Method for Exposure

Fowler discovered the databases via **Shodan scans** — a search engine that indexes internet-connected devices and open services. This means the storage buckets were publicly reachable on the internet without any authentication. Files (including audio WAV files) were browsable and downloadable directly via web browser, requiring no credentials.

---

## Damage Assessment

### Direct Damage
- **Financial**: No confirmed financial loss reported. Transformco has not disclosed breach-related costs. No fines announced as of research date.
- **Operational**: Storage access restricted within 24 hours of disclosure. No operational disruption reported.
- **Data Exposure**: 3.7 million records exposed, containing PII (names, addresses, email, phone numbers), service/appointment details, internal metadata (timestamps, unique IDs, hashcodes), and voice recordings.
- **Reputational**: Covered by Wired, Cybernews, TechRadar, SC Media, Security Magazine — significant press coverage for a company already in reputational decline (Sears brand bankruptcy history).

### Duration of Exposure
Unknown. Data ranges from 2024–2026. It is possible the storage buckets were misconfigured from initial deployment of the KAIros/Samantha systems. Minimum exposure duration: the window before Fowler's Shodan scan (2026-02-03). Maximum: potentially 1–2+ years if misconfigured since deployment.

### Speed of Damage Unfolding
Passive exposure — data was available continuously but no confirmed active exfiltration event occurred. Remediation was rapid (24 hours post-disclosure).

### Recovery
Access restricted within 24 hours. No forensic audit confirmation published. Whether unauthorized access occurred before Fowler's discovery is unknown and unverifiable.

---

## Affected Parties

| Party | Role | Data Exposed |
|-------|------|-------------|
| Sears Home Services customers | Primary victims | Names, addresses, emails, phone numbers, service/repair/appointment details, voice recordings |
| Sears Home Services / Transformco | Operator | Organizational reputation, internal operational metadata |
| Third-party vendors/contractors | Possible — unconfirmed | Internal operational details if referenced in logs |

**Record count**: 3.7 million records across three databases
**Data types exposed**:
- PII: names, physical addresses, email addresses, phone numbers
- Behavioral: chat histories, service/appointment details, product/repair details
- Biometric-adjacent: voice recordings (up to 4 hours; potential voice cloning risk)
- Operational metadata: timestamps, unique IDs, hashcodes, internal event logs
- Scheduling data: XLSX files with appointment and service information

**Geography**: US-based (Sears Home Services operates in the United States). CCPA likely applies to California residents in the dataset. No GDPR applicability noted.

**Language**: English and Spanish.

---

## Vendor Response Section

**Transformco response**:
- Received responsible disclosure notice from Fowler (approximately 2026-02-03/04)
- Forwarded notice to "chatbot manager" — suggesting internal routing, not direct security team response
- Restricted database access within 24 hours of notification
- **Did not respond** to WIRED reporters who requested comment before publication (2026-03-17)
- No official public statement identified in any source
- No CVE assigned
- No regulatory notification (CCPA, FTC) confirmed or denied

**Transparency level**: Minimal. Restriction was fast but no acknowledgment of the incident to customers, no breach notification communications reported, no public statement.

---

## Actual vs. Potential Classification

**actual_vs_potential**: `partial`

Rationale: The exposure was real and the data was genuinely accessible. The question is whether it was accessed maliciously before Fowler's discovery. No evidence of malicious exfiltration was found, but the exposure window is unknown (potentially 1–2+ years). The partial classification reflects: real exposure occurred, real data was at risk, but confirmed harm from unauthorized access is unverified.

**potential_damage**: Voice biometric data from 1.4 million audio recordings (some up to 4 hours) represents a significant voice cloning risk. Deepfake fraud using voice clones is projected to reach $40 billion by 2027 (Cybernews). Combined with PII (names, addresses, phone numbers), the dataset would be highly valuable for targeted social engineering and fraud against Sears appliance service customers. AI chatbot behavioral data (prompts, conversation flows, refusal patterns) exposed in chat logs makes the Samantha system significantly easier to manipulate through prompt injection or social engineering attacks against the chatbot itself ("Knowing exactly how the bot decides, escalates, refuses, or complies makes it far easier to manipulate it for fraud" — Fowler).

**intervention**: Jeremiah Fowler's responsible disclosure. Without his discovery, the exposure would have continued indefinitely. Transformco showed no sign of proactive monitoring.

---

## Classification Assessment

### Triage Criteria — All Four Checked

1. **Real-world deployment**: YES — Production customer service AI systems (Samantha chatbot, KAIros platform) actively handling customer calls and chats for Sears Home Services.
2. **Autonomous agent involved**: PARTIAL — The AI systems (Samantha/KAIros) are autonomous in the sense that they handle customer interactions without human agents for each interaction. However, the failure mode is the storage misconfiguration, not the AI acting autonomously in a harmful way. The AI's involvement is relevant as context (this is specifically AI-generated data that was exposed), but the agent did not autonomously expose the data.
3. **Verifiable**: YES — Multiple independent sources (ExpressVPN/Fowler primary report, Wired journalism, SC Media, Security Magazine). Consistent data across sources.
4. **Meaningful impact**: YES — 3.7 million records, 4.3TB data, PII + voice biometrics exposed. Significant privacy harm to an unknown number of customers.

### AgentFail Category Assessment

**Primary category**: `Privacy Violation` — The core failure is exposure of AI-generated interaction data (chat logs, voice recordings) without access controls.

**Secondary category**: `Unauthorized Data Access` — The storage buckets were publicly accessible; any party with Shodan access and the URL could access all data without authorization.

**Tertiary consideration**: This incident borders on being a pure infrastructure misconfiguration rather than an "AI agent failure" in the agentic sense. The AI systems involved are conversational AI (chatbot + voice assistant) rather than autonomous agents with tool use, multi-step planning, or autonomous action loops. The AI's role is: it generated the data that was then stored insecurely.

**Why it still qualifies**: The incident is specifically about AI-generated interaction data (not a generic database breach of customer records). The recording behavior anomaly (recording for up to 4 hours post-interaction) is an AI system behavior failure. The scale and nature of the data (voice biometrics, conversation patterns, refusal/escalation logic) is uniquely dangerous in an AI context in ways that generic CRM data is not.

**Severity**: `High`
- 3.7M records is large-scale
- Voice biometric data creates downstream fraud risk (voice cloning)
- AI conversation patterns exposed create system manipulation risk
- Unknown exposure duration (potentially years)
- Transformco showed no proactive security posture

**NOT Critical** because: no confirmed malicious exploitation, remediation was fast post-disclosure, no confirmed financial loss from the exposure.

---

## Gaps and Uncertainties

| Gap | Impact on Analysis | Resolvable? |
|-----|-------------------|-------------|
| Exact cloud provider for storage buckets (S3? Azure? GCP?) | Low — doesn't change failure classification | Possibly — Fowler's full technical report may specify |
| Whether storage buckets were operated by Sears directly or a third-party AI vendor | Medium — affects responsibility attribution | Unknown — Transformco silence |
| Exact duration of exposure before 2026-02-03 | High — determines scale of potential unauthorized access | Unlikely to be determined without Transformco cooperation |
| Whether any unauthorized party accessed the data before Fowler | High — determines actual vs near-miss classification | Unknown — requires forensic audit Transformco has not confirmed |
| Whether Samantha/KAIros are built on a commercial AI platform (OpenAI, Google, etc.) or proprietary | Medium — relevant to supply chain context | Not found in any source |
| Transformco's regulatory response (CCPA notification to California AG?) | Medium — affects accountability assessment | Not reported as of 2026-05-06 |
| Customer notification: were affected customers informed? | High — determines compliance posture | Not reported |
| Whether the 4-hour recordings are a known chatbot design choice or a bug | Medium — affects blame attribution | Not clarified by any source |
| Number of unique customers affected (vs. 3.7M record count) | Medium — 3.7M records ≠ 3.7M individuals | Not reported |

---

## Raw Notes

- Fowler Shodan discovery date: **2026-02-03** (confirmed in AI CERTs source)
- Public disclosure date: **2026-03-17** (ExpressVPN report + Wired same day)
- 6-week gap between discovery and public report: standard responsible disclosure window
- "Storage buckets" language used consistently — likely cloud object storage (AWS S3, Azure Blob, or GCP Cloud Storage) but unconfirmed
- Data included both English and Spanish interactions — multi-lingual customer base
- Fowler quote: "Knowing exactly how the bot decides, escalates, refuses, or complies makes it far easier to manipulate it for fraud" — this is the AI-specific risk dimension
- Security Magazine publication date was March 23, 2026 (6 days after initial disclosure) — they ran a standalone analysis
- Wired reporters requested comment from Sears Home Services and Transformco on March 17, 2026 — no response before publication
- No CVE assigned — typical for misconfiguration incidents that are not exploitable vulnerabilities per se
- KAIros components: Service Scheduler, Fix Genius (appliance diagnostics), HireHub (HR recruitment) — this is a multi-function AI ecosystem, not just a chatbot
- Audio files were WAV format (per AI CERTs source mentioning "WAV audio files")
- Some chat logs contained 54,359 complete conversations in a single file (Security Magazine)
- Voice cloning risk: deepfake fraud projected $40B by 2027 (Cybernews)
- Fowler's report was published through ExpressVPN — commercial relationship should be noted but does not invalidate findings
- No indication this was an active hack — purely a misconfiguration (no authentication on publicly accessible storage)
- Transformco forwarded disclosure to "chatbot manager" rather than security team — suggests immature incident response process
- "The following day" access restriction suggests swift response once aware, but lack of proactive monitoring is the core failure

---

*Research completed: 2026-05-06*
*Researcher: Stage 1 Research Agent*
*Sources consulted: 10 URLs (6 successfully fetched, 4 blocked/403)*
