# AAGF-2026-060 Research Notes
## McKinsey Lilli AI Platform — Autonomous AI Agent Achieves Full DB Read-Write via SQL Injection

**Triage Verdict: PROCEED**
**Near-Miss Designation: YES** — Vulnerability was real and exploited (by responsible researcher). Full data exfiltration and system-prompt poisoning were technically achievable but not executed. Responsible disclosure limited actual harm.

**Classification:**
- Primary: Unauthorized Data Access (read-write to production database achieved)
- Secondary: Tool Misuse / Autonomous Escalation (agent selected target, enumerated, and exploited without human guidance)
- Tertiary: Context Poisoning (system prompts writable via SQL UPDATE — not executed, but fully accessible)

---

## Source Inventory

1. **[CodeWall primary blog](https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform)** — The disclosing researcher's own account. Primary source for all technical details. Commercial bias: CodeWall is an offensive AI tool vendor; the incident demonstrates their product's capabilities.
2. **[The Register](https://www.theregister.com/2026/03/09/mckinsey_ai_chatbot_hacked/)** — First independent publication (March 9, 2026). Obtained McKinsey's official statement. Corroborates attack surface and patch timeline but does not independently verify data scope claims.
3. **[NeuralTrust blog](https://neuraltrust.ai/blog/agent-hacked-mckinsey)** — Security vendor secondary analysis. Reproduces CodeWall's technical claims. Notes all technical details derive exclusively from CodeWall. Publication date: March 12, 2026.
4. **[BankInfoSecurity](https://www.bankinfosecurity.com/autonomous-agent-hacked-mckinseys-ai-in-2-hours-a-31007)** — Security trade press. Reproduces CodeWall claims. Includes independent analyst commentary from Edward Kiledjian raising scope questions.
5. **[Treblle blog](https://treblle.com/blog/codewall-hack-mckinsey-ai-platform-lilli)** — API management vendor analysis. Adds usage statistics (43,000+ employees, 70% adoption, 500K prompts/month). Sourcing unclear — may derive from CodeWall or public McKinsey statements.
6. **[Outpost24 blog](https://outpost24.com/blog/ai-agent-hacked-mckinsey-ai-platform/)** — Penetration testing vendor analysis. Promotional framing. Corroborates usage statistics (70% of McKinsey staff, 500K prompts/month). No additional independent detail.
7. **[The Decoder](https://the-decoder.com/an-ai-agent-hacked-mckinseys-internal-ai-platform-in-two-hours-using-a-decades-old-technique/)** — Tech news. Includes Kiledjian's skepticism about whether "having access" equals "exfiltrating data," and questions whether HackerOne responsible disclosure policy covers systematically reading millions of production records.
8. **[State of Surveillance](https://stateofsurveillance.org/news/mckinsey-lilli-ai-agent-hack-codewall-sql-injection-2026/)** — 403 Forbidden; content unavailable.
9. **[1Kosmos blog](https://www.1kosmos.com/resources/blog/mckinsey-lilli-breach-agent-authentication)** — Authentication vendor analysis. No independent detail. Notes ~40,000 consultants and system prompt behavioral compromise framing.

---

## 1. Attack Mechanism

### Endpoint Enumeration
- CodeWall's autonomous agent discovered publicly exposed API documentation listing **200+ endpoints**. [Source: CodeWall]
- Of these, **22 endpoints required no authentication**. [Source: CodeWall; corroborated by The Register, all secondaries]
- The agent autonomously selected McKinsey as a target by identifying the firm's **public responsible disclosure policy (HackerOne)**. [Source: CodeWall; CodeWall CEO quoted by The Register: "fully autonomous from researching the target, analyzing, attacking, and reporting"]

### SQL Injection Vector: JSON Key Concatenation
The vulnerability is technically precise and significant:

- The vulnerable endpoint accepted **user search queries** that were processed against the database.
- Values (field contents) were **safely parameterized** — standard SQL injection protection was in place.
- However, **JSON key names** (field identifiers, not their values) were **concatenated directly into SQL queries** without sanitization. [Source: CodeWall; reproduced verbatim by The Register, NeuralTrust, BankInfoSecurity]
- This is the technical meaning of "JSON key concatenation": the attacker controls the key name in a JSON payload (e.g., `{"malicious_key": "value"}`), and that key name is inserted raw into the SQL string instead of being treated as a parameter.
- **Why standard scanners missed it**: Standard SQL injection tools (OWASP ZAP, etc.) typically probe values, not key names. The vulnerability resided in an unconventional code path. [Source: CodeWall; Kiledjian independent analysis via The Decoder: "technically sound" assessment of the vector]

### Exploit Progression
1. Agent submitted crafted JSON payloads with manipulated key names to the unauthenticated search endpoint.
2. **Database error messages reflected the injected key names verbatim** — a classic blind SQL injection signal. [Source: CodeWall, NeuralTrust]
3. Agent performed **15 iterative blind SQL injection probes** to progressively extract the query structure and database schema. [Source: CodeWall; corroborated by Treblle, The Decoder]
4. Full read-write access to the production database was achieved in **approximately 2 hours** from start of reconnaissance. [Source: CodeWall; all sources corroborate the 2-hour timeframe]

### Autonomy Level
- CodeWall CEO described the process as **"fully autonomous from researching the target, analyzing, attacking, and reporting" without human direction**. [Source: The Register, quoting CodeWall CEO]
- The agent chained: target selection → public documentation discovery → endpoint enumeration → vulnerability identification → exploit construction → data enumeration — all without human intervention.
- Classification: **Fully autonomous offensive agent**, supervised only in the sense that researchers monitored but did not direct.

---

## 2. What Was Exposed

### Data Inventory (All figures from CodeWall; no independent third-party audit of counts)

| Category | Count |
|---|---|
| Chat messages (plaintext) | 46.5 million |
| Files (confidential client data) | 728,000 |
| — of which PDFs | 192,000 |
| — of which spreadsheets | 93,000 |
| — of which PowerPoints | 93,000 |
| — of which Word docs | 58,000 |
| User accounts | 57,000 |
| AI assistants | 384,000 |
| Workspaces | 94,000 |
| RAG document chunks (proprietary research frameworks) | 3.68 million |
| OpenAI vector stores with embedding pipeline details | 266,000+ |
| System prompt configurations | 95 (across 12 model types) |

### Nature of Chat Messages
Lilli serves as McKinsey's primary internal AI assistant. Chat messages therefore cover: **strategy discussions, financial modeling, M&A engagements, client deliverables, internal research, and consultant-client advisory exchanges**. McKinsey did not confirm or deny that specific message categories were accessible to CodeWall. [McKinsey statement: "no evidence that client data...were accessed by this researcher or any other unauthorized third party" — The Register]

### Writable System Prompts — Blast Radius Analysis

This is the most consequential finding:

- **95 system prompts** controlled Lilli's behavior across **12 model types**. [Source: CodeWall]
- These prompts were stored **in the same production database** that the SQL injection gave write access to. [Source: CodeWall; all secondaries]
- An attacker could have modified any or all system prompts via **a single UPDATE statement wrapped in a single HTTP request** — no code deployment, no git commit, no CI/CD trigger. [Source: CodeWall, quoted by The Register]
- **No trace in traditional audit logs**: Code deployment logs, audit trails for application changes, and standard change management records would show nothing. [Source: CodeWall, Treblle]

**Blast radius if executed:**
- Lilli is used by **43,000+ McKinsey employees** (Treblle, Outpost24: "70% of McKinsey staff"); other sources reference "30,000+ consultants" — the lower figure likely refers to fee-earning staff specifically.
- Platform processes **500,000+ prompts per month** [Treblle, Outpost24].
- Poisoned system prompts could: alter financial models, embed silent data exfiltration into AI responses, strip safety guardrails, insert disinformation into M&A analysis or strategic recommendations. [Source: CodeWall; Treblle expands on scenarios]
- McKinsey's Lilli connects to the firm's **proprietary research frameworks and decades of consulting methodology** (3.68M RAG chunks) — poisoning prompts corrupts the epistemic layer guiding all of this.
- Because Lilli's outputs appear under McKinsey's institutional authority, poisoned advice carries enormous trust amplification. A consultant receiving subtly wrong financial modeling guidance from Lilli would have no signal that the underlying prompt had been modified.

---

## 3. Timeline

| Date | Event | Source |
|---|---|---|
| Before 2026-02-28 | Lilli platform operational (reportedly for 2+ years) | NeuralTrust |
| 2026-02-28 | CodeWall autonomous agent identifies SQL injection; full database enumeration begins | CodeWall |
| 2026-03-01 | Responsible disclosure sent to McKinsey | CodeWall; The Register (date approximate — The Register says "late February 2026" for discovery, March 1 for disclosure) |
| 2026-03-02 | McKinsey CISO acknowledges; all unauthenticated endpoints patched, development environment taken offline, public API documentation blocked | CodeWall; The Register |
| 2026-03-09 | The Register first independent public report | The Register |
| 2026-03-12 | NeuralTrust secondary analysis published | NeuralTrust |

**date_occurred**: 2026-02-28 (when vulnerability was active and CodeWall's agent achieved access)
**date_discovered**: 2026-02-28
**date_reported**: 2026-03-01 (to McKinsey)
**date_patched**: 2026-03-02 (same day as CISO acknowledgment — within ~24 hours of notification)
**date_disclosed_publicly**: 2026-03-09

**Note on "two years" claim**: NeuralTrust states the platform had been operational for over two years before detection. This is not independently verified — it could reflect Lilli's general rollout history rather than time the specific vulnerability was present.

---

## 4. McKinsey's Response

Official McKinsey statement (to The Register): *"Our investigation, supported by a leading third-party forensics firm, identified no evidence that client data or client confidential information were accessed by this researcher or any other unauthorized third party."*

Actions taken (all within ~24 hours of disclosure):
- Patched all unauthenticated endpoints
- Took development environment offline
- Blocked public API documentation

**Notable omissions in McKinsey's response:**
- No acknowledgment of the write-access risk or system prompt vulnerability specifically
- No disclosure of whether consultants or clients were notified
- Third-party forensics firm findings were not published

---

## 5. Source Bias and Independent Corroboration

### What Only CodeWall Claims
- Specific data counts (46.5M messages, 728K files, 57K accounts, 95 system prompts, etc.)
- The 15-iteration blind SQL injection progression
- The specific JSON key concatenation mechanism
- Full autonomy of the agent throughout the attack chain
- The "2 hours" completion time
- System prompts being writable via UPDATE statement

### What The Register Independently Corroborated
- Attack occurred; McKinsey confirmed it was notified and patched
- McKinsey's official statement denying evidence of actual data access
- Timeline: disclosure March 1, patch March 2, public report March 9
- CodeWall CEO's autonomy claim (quoted directly)
- 22 unauthenticated endpoints (general corroboration of the attack surface)

### Independent Skepticism
**Edward Kiledjian** (security analyst, cited by BankInfoSecurity and The Decoder):
- "Likely found a serious vulnerability" but the blog post "overstates what was actually demonstrated"
- "Blurs the line between having access and actually exfiltrating data"
- Nine days between patch and publication was "insufficient for complete forensic review"
- Questions whether McKinsey's HackerOne responsible disclosure policy actually covers "systematically reading a production database containing millions of real user records" — raising whether this was truly authorized responsible disclosure or an edge case

### Assessment
The core technical claim (SQL injection via JSON key concatenation giving read-write DB access) is plausible, technically sound per Kiledjian, and consistent with the class of vulnerability (non-standard injection point bypassing parameterization). McKinsey's response implicitly confirms the vulnerability was real (they patched it same day). The data volume claims are unverified by any independent party. The autonomy claims derive entirely from CodeWall.

**Commercial interest flag**: CodeWall is an offensive AI tool vendor. The incident is a demonstration of their autonomous agent's capabilities — a marketing event with responsible disclosure framing. This does not invalidate the technical findings but colors the framing (e.g., the "2 hours" metric serves as a product specification).

---

## 6. Triage Validation

| Criterion | Assessment |
|---|---|
| Real production system | YES — McKinsey's production Lilli platform, confirmed by McKinsey's own response and patch |
| Autonomous agent involved | YES — CodeWall's agent selected target, enumerated, exploited, and reported without human direction (per CodeWall CEO) |
| Verifiable | PARTIAL — Core vulnerability confirmed by McKinsey's patch; data scope unverified by third parties |
| Meaningful impact | YES — Read-write DB access on a platform serving 43K+ consultants with M&A-grade data; writable system prompts representing near-miss context poisoning at institutional scale |
| Near-miss designation | YES — Technical capability for mass data exfiltration and system prompt poisoning existed; responsible disclosure prevented execution |

---

## 7. Classification

**Primary failure mode**: Missing authentication on API endpoints + SQL injection via non-parameterized JSON key names in production
**Agent failure pattern**: Autonomous offensive agent successfully chains target selection → reconnaissance → exploitation → escalation with no human intervention

**Category assignments:**
- `Unauthorized Data Access` — read-write access to production DB achieved
- `Tool Misuse / Autonomous Escalation` — agent autonomously selected target and executed full attack chain
- `Context Poisoning` — system prompts were writable (not executed; near-miss)

**Severity**: High (near-miss for catastrophic; actual exposure was the vulnerability and access, not data exfiltration)

---

## 8. Pattern Group Analysis

### Relationship to AAGF-2026-039 (EmailGPT, CVE-2024-5184)
**Weak connection.** Both involve LLM integrations with no input sanitization. But EmailGPT's failure was prompt injection into an LLM pipeline (no SQL layer). AAGF-2026-060's failure is SQL injection at the database layer — a different architectural failure. Pattern group `no-input-sanitization-llm-agent` does not fit cleanly because the injection is at the DB layer, not the LLM input layer.

### Relationship to AAGF-2026-040 (Google Vertex AI P4SA over-permissioning)
**Moderate connection.** Both involve AI agent platforms with excessive permissions (writable system prompts in the same DB as user data; P4SA with project-wide storage read). Both are near-misses. Both affect enterprise AI platforms at scale. Pattern group `ai-agent-platform-security-crisis` is a candidate but per existing review of AAGF-2026-040, this group was flagged as "too broad to carry analytical signal."

### Proposed Pattern Group
**`autonomous-ai-agent-offensive-use`** — This incident seeds a new pattern:
- An autonomous AI agent is deployed *offensively* to discover and exploit vulnerabilities in another AI agent platform
- The attacker *is itself an AI agent*, not a human using AI tools
- The target is an AI platform (Lilli), making this agent-attacks-agent at the infrastructure level
- This is distinct from `ai-augmented-cyberattack` (which involves AI assisting human attackers) — here the agent operates end-to-end autonomously

**Alternative**: Could also fit `ai-agent-platform-security-crisis` (n=2 with AAGF-2026-040) if the focus is on the *target* being an AI platform rather than the *attacker* being an AI agent. The more analytically precise grouping is the offensive-use pattern.

**Recommendation**: Seed `autonomous-ai-agent-offensive-use` as a new pattern group. Cross-reference `ai-agent-platform-security-crisis` as a secondary tag.

---

## 9. Damage Estimate Inputs

### Confirmed Loss
- **$0 confirmed** — responsible disclosure; McKinsey states no evidence of actual data access

### Averted Damage: Data Exfiltration Scenario

**Baseline**: IBM Cost of Data Breach Report 2024 average = $4.88M per breach (all industries). Healthcare and financial services command premiums.

**M&A strategy data premium**: McKinsey's Lilli chat logs contain M&A advisory discussions — among the most commercially sensitive data categories. Information asymmetry in M&A contexts can be worth hundreds of millions (insider trading, competitive intelligence, deal sabotage). Standard per-record breach costs dramatically undercount this.

**Conservative calculation using IBM CODB methodology:**
- 57,000 user accounts × $165/record (IBM per-record average, B2B premium) = ~$9.4M
- 46.5M chat messages: if treated as records, IBM healthcare rate ($10.93/record) × 10% of messages containing PII/client data = 4.65M × $10.93 = ~$50.8M
- More realistic framing: treat the breach as an enterprise financial services breach affecting a single organization (not per-record); IBM financial services average breach cost = $6.08M, but McKinsey is not a financial institution in the traditional sense

**Strategic intelligence premium**: The actual economic harm from an adversary gaining read access to McKinsey's M&A strategy conversations (46.5M messages) is better estimated via intelligence value, not per-record costs. A single leaked M&A deal could result in deal collapse, regulatory intervention, or competitor advantage worth 10x–1000x the IBM CODB baseline. Not quantifiable without knowing the specific conversations.

**System prompt poisoning scenario (averted)**:
- If prompts were poisoned to subtly skew financial models for 43,000+ consultants across 500K monthly prompts, the downstream harm could include: incorrect M&A valuations, mispriced risk in strategic recommendations, regulatory compliance failures in advice given to financial services clients
- No reliable dollar figure available; potential client liability and reputational damage could reach the billions across McKinsey's ~$16B annual revenue base if poisoning were systematic and undetected

**Recommended averted_damage_usd framing**: Use a conservative floor. Per IBM CODB 2024 for "professional services" sector (~$4.5M average) × organizational complexity multiplier for McKinsey's data sensitivity = **$45M–$500M range** for data exfiltration alone. System prompt poisoning is order-of-magnitude larger but speculative.

**For `averted_damage_usd` field**: Suggest $45,000,000 (conservative floor, data exfiltration only, professional services baseline adjusted for 57K accounts + M&A data sensitivity) with explicit caveat that strategic intelligence value is unquantifiable.

---

## 10. Key Facts for Stage 2 (Structured Frontmatter)

- **agent_type**: `autonomous-offensive-ai-agent` (attacking agent); `enterprise-ai-assistant` (Lilli, the target platform)
- **agent_name**: CodeWall autonomous agent (attacker); McKinsey Lilli (target)
- **platform**: McKinsey Lilli AI Platform (production); CodeWall offensive AI agent platform
- **industry**: Management Consulting / Professional Services
- **affected_parties.count**: 57,000 user accounts accessible (43,000+ active users)
- **data_types_exposed**: chat_messages, client_files, user_accounts, system_prompts, ai_model_configurations, rag_document_chunks, embedding_pipeline_details
- **vendor_response**: acknowledged + patched within 24 hours of disclosure
- **actual_vs_potential**: `near-miss`
- **intervention**: CodeWall's responsible disclosure (March 1); McKinsey CISO patch (March 2); no actual data exfiltration or prompt poisoning executed

---

## Open Questions for Stage 2

1. Does McKinsey's HackerOne responsible disclosure policy scope actually cover autonomous database enumeration of production data? (Kiledjian's question — affects the "authorized research" framing)
2. Were the 95 system prompts actually read, or was write-access only demonstrated theoretically? CodeWall's account is ambiguous on whether they enumerated prompt contents vs. confirmed writeability.
3. Was the 2-year platform operational period claim (NeuralTrust) independently sourced, or inferred from Lilli's known public rollout (~2023)?
4. What is the relationship between the "development environment taken offline" and the production environment? Suggests dev and prod shared the same vulnerable API surface.
5. No incident report from McKinsey's third-party forensics firm has been published — their conclusion ("no evidence of access") should be noted as an unverified organizational claim, not an independent technical finding.
