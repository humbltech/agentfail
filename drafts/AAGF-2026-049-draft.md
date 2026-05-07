---
id: "AAGF-2026-049"
title: "Morris II / ComPromptMized — First Adversarial Self-Replicating AI Worm via RAG Poisoning and Email Propagation"
status: "reviewed"
date_occurred: "2024-03-05"      # arXiv submission — first public disclosure of PoC existence
date_discovered: "2024-03-05"    # Researcher-originated; discovery = disclosure
date_reported: "2024-03-05"      # First public disclosure via arXiv (v1); vendor disclosure to OpenAI/Google concurrent
date_curated: "2026-05-07"
date_council_reviewed: "2026-05-07"

# Classification
category: ["Prompt Injection", "Context Poisoning", "Unauthorized Data Access", "Tool Misuse"]
severity: "medium"
agent_type: ["Email Agent", "RAG Agent"]
agent_name: "GenAI Email Assistant (GPT-4 / Gemini Pro / LLaVA — research prototype)"
platform: "LangChain (research prototype); attack architecture applicable to any RAG-based email assistant"
industry: "Research / Security (cross-industry applicability)"

# Impact
financial_impact: "None (lab environment only; authors' own systems and emails)"
financial_impact_usd: null
refund_status: "not applicable"
refund_amount_usd: null
affected_parties:
  count: null                     # Lab environment; 50 real academic emails used by authors with their own consent
  scale: "unknown"                # No production deployment; research PoC only
  data_types_exposed: ["email_addresses", "phone_numbers", "physical_addresses"]  # Demonstrated in lab on authors' own data

# Damage Timing
damage_speed: "not applicable"    # Lab only; no real-world deployment or exploitation
damage_duration: "not applicable"
total_damage_window: "not applicable"

# Recovery
recovery_time: "not applicable"   # No production incident; researchers voluntarily stopped at PoC
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: ""
full_recovery_achieved: "not applicable"

# Business Impact
business_scope: "unknown"         # Near-miss; attack class applicable to any RAG-based email assistant in production
business_criticality: "high"
business_criticality_notes: "While no production system was exploited, the demonstrated attack class is applicable to any commercial RAG-based email assistant (e.g., GPT-4-powered inbox management tools). The worm's super-linear propagation (~20 new infections per 1–3 days in testing) means a single compromise could cascade across an entire enterprise email network without user interaction."
systems_affected: ["email-system", "rag-database", "vector-store", "llm-api"]

# Vendor Response
vendor_response: "none"           # No public acknowledgment from OpenAI or Google; framed as architectural design issue, not patchable at API level
vendor_response_time: "none"

# actual_vs_potential classification
actual_vs_potential: "near-miss"
potential_damage: "Mass exfiltration of contact information (email addresses, phone numbers, physical addresses) from any RAG-based AI email assistant ecosystem; spam and phishing at organizational or inter-organizational scale via legitimate email accounts compromised by the worm's propagation chain; super-linear spread (~20 new clients per 1–3 days demonstrated in testing) could cascade across an entire enterprise email network without any user clicking anything."
intervention: "Research conducted entirely in a controlled lab environment using authors' own systems and emails; researchers voluntarily stopped at PoC demonstration and disclosed to OpenAI and Google via bug bounty programs; no commercial AI email assistant was publicly available at production scale with the exact vulnerable architecture at the time of publication."

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: 2475000     # Order-of-magnitude estimate; see methodology below
  averted_range_low: 247500
  averted_range_high: 24750000
  composite_damage_usd: null      # No confirmed production harm; averted estimate is probability-weighted near-miss
  confidence: "order-of-magnitude"
  probability_weight: 0.03        # PoC exists; no wild exploitation to date; researchers estimated 2–3 year horizon to weaponization
  methodology: "near-miss-averted"
  methodology_detail:
    per_unit_cost_usd: 165        # IBM 2024 Cost of a Data Breach: per-record cost for contact information
    unit_count: 500000            # ~1,000 organizations with RAG email assistants × 500 contacts/org
    unit_type: "contact-records"
    multiplier: 0.03              # Probability weight: PoC published, not yet weaponized
    benchmark_source: "IBM 2024 Cost of a Data Breach Report"
  estimation_date: "2026-05-07"
  human_override: false
  notes: "Estimate stacks multiple speculative assumptions: number of vulnerable RAG email assistant deployments in 2024 (~1,000 orgs) is not empirically sourced; 500 contacts/org is a conservative average; IBM per-record cost ($165) applies to breach notification overhead and is a proxy for contact-data exfiltration. Averted range spans one order of magnitude. Probability weight of 0.03 reflects: attack exists as PoC (raises floor), no confirmed weaponization (keeps probability low), researchers' own 2–3 year horizon estimate. This estimate is appropriate for comparative context on the dashboard only; do not present as quantified realized harm."

# Presentation
headline_stat: "First AI worm: zero-click email propagation demonstrated at ~20 new infections per 1–3 days, requiring no user interaction beyond receiving an email"
operator_tldr: "If you operate any RAG-based AI email assistant that can autonomously send or forward email, you are running the precise architecture Morris II exploited: isolate the agent's email-send capability behind mandatory human approval, treat all incoming emails as untrusted adversarial inputs before RAG ingestion, and audit your vector store for poisoned entries."
containment_method: "researcher-public-disclosure"  # Responsible disclosure to OpenAI + Google; voluntary PoC stopping point
public_attention: "high"          # Wired, Ars Technica, The Verge, Bruce Schneier, ACM CCS 2025

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0051"    # LLM Prompt Injection
    - "AML.T0054"    # LLM Jailbreak
    - "AML.T0085"    # Adversarial Input
    - "AML.T0043"    # Craft Adversarial Data
  owasp_llm:
    - "LLM01:2025"   # Prompt Injection
    - "LLM02:2025"   # Insecure Output Handling (model output contains and propagates the malicious prompt)
  owasp_agentic:
    - "ASI01:2026"   # Indirect Prompt Injection in Agentic Contexts
    - "ASI02:2026"   # Unsafe Tool Invocation (email send/forward weaponized)
  ttps_ai: []

# Relationships
related_incidents:
  - "AAGF-2026-044"   # ZombAI — direct research descendant; same wormable AI agent propagation class; production-grade CVE in enterprise Copilot
pattern_group: "wormable-ai-agent-propagation"   # New provisional group; Morris II is the seed incident
tags:
  - "ai-worm"
  - "morris-ii"
  - "compromptmized"
  - "self-replicating-prompt"
  - "rag-poisoning"
  - "zero-click"
  - "email-agent"
  - "multimodal"
  - "fgsm"
  - "langchain"
  - "gpt-4"
  - "gemini-pro"
  - "llava"
  - "donkeyrail"
  - "acm-ccs-2025"
  - "responsible-disclosure"
  - "near-miss"
  - "research-paper"
  - "simon-willison-lethal-trifecta"
  - "wormable-ai-agent-propagation"

# Metadata
sources:
  - "https://arxiv.org/html/2403.02817v1"
  - "https://arxiv.org/abs/2403.02817"
  - "https://sites.google.com/view/compromptmized"
  - "https://github.com/StavC/Here-Comes-the-AI-Worm"
  - "https://dl.acm.org/doi/10.1145/3719027.3765196"
  - "https://www.schneier.com/blog/archives/2024/03/llm-prompt-injection-worm.html"
  - "https://oecd.ai/en/incidents/2024-03-01-7805"
  - "https://www.infosecurity-magazine.com/news/worm-created-generative-ai-systems/"
  - "https://www.ibm.com/think/insights/morris-ii-self-replicating-malware-genai-email-assistants"
  - "https://www.sentinelone.com/cybersecurity-101/cybersecurity/ai-worms/"
researcher_notes: "This is a landmark research paper, not a production incident. It qualifies for AgentFail under the near-miss criterion: the attack architecture is directly applicable to any RAG-based email assistant using production-grade APIs (GPT-4, Gemini Pro), and the absence of confirmed in-the-wild exploitation reflects the controlled disclosure posture rather than any structural mitigation. The paper was accepted to ACM CCS 2025, a top-tier peer-reviewed security venue, confirming the technical rigor of the claims. The arXiv v1 (March 5, 2024) established the core attack; arXiv v2 (January 30, 2025) added the DonkeyRail guardrail defense (1.0 TPR, 0.017 FPR, 7.6–38.3ms latency). Vendor response from OpenAI and Google was non-public and framed as an architectural design issue rather than an API vulnerability — consistent with the research team's own framing. Bruce Schneier's assessment ('natural extension of prompt injection — neat to see it actually working') reflects broad expert consensus that this was a predicted attack class now empirically demonstrated. The Simon Willison 'lethal trifecta' (sensitive data + untrusted content + external comms channel) is cited in the paper itself as foundational theory. The DonkeyRail defense name is researcher-coined; its formal name in the ACM CCS paper is an adversarial prompt detection guardrail. Pattern group 'wormable-ai-agent-propagation' is created provisionally with this incident as the seed; AAGF-2026-044 (ZombAI) is a related incident in a different pattern group (enterprise-copilot-prompt-injection-exfiltration) because the attack vectors, platforms, and mechanisms are sufficiently distinct (email RAG worm vs. IDE config injection worm). Researchers' own estimate: in-the-wild weaponization is '2–3 years' from 2024 publication."
council_verdict: "Include at Medium severity: the lab-only scope is mitigated by production-grade API use and direct applicability to deployed systems, the $2.475M estimate should be labeled order-of-magnitude speculation rather than an estimate, DonkeyRail's plausibility rating should be caveated for self-assessment bias, and the wormable-ai-agent-propagation pattern group is justified as a distinct seed given the mechanism difference from ZombAI."
---

# Morris II / ComPromptMized — First Adversarial Self-Replicating AI Worm via RAG Poisoning and Email Propagation

## Executive Summary

In March 2024, researchers at Cornell Tech and the Technion published the first empirical demonstration of a self-replicating AI worm — named Morris II — capable of propagating through a network of GenAI-powered email assistants without any user interaction, using nothing more than a crafted incoming email. The worm exploited the fundamental inability of large language models to distinguish between data (an email's content) and instructions (commands to the agent), poisoning the RAG database that email assistants use for context retrieval and weaponizing the agent's legitimate email-send capability as a propagation channel. This is a near-miss incident: no production system was exploited, but the attack was demonstrated using real production model APIs (GPT-4, Gemini Pro, LLaVA) in a controlled lab, published at ACM CCS 2025, and directly applicable to any deployed RAG-based email assistant — making it the foundational predecessor to the production-grade AI worm class that AAGF-2026-044 (ZombAI) later instantiated in enterprise Copilot.

---

## Timeline

| Date | Event |
|------|-------|
| 1988-11-02 | Original Morris Worm crashes ~6,000 computers (10% of the internet at the time); developed by Robert Tappan Morris at Cornell — named Morris II in tribute |
| 2024-03-05 | arXiv v1 submission: "Here Comes The AI Worm" — first public disclosure; simultaneous responsible disclosure to OpenAI and Google via bug bounty programs |
| 2024-03 (early) | Wired, Ars Technica, The Verge, PCMag publish coverage within days of arXiv submission |
| 2024-03 (mid) | Bruce Schneier blog post: "LLM Prompt Injection Worm" — assesses as natural extension of known prompt injection class |
| 2024-03 | OECD.AI Incident Monitor classification: AI Hazard (demonstrated capability, no realized harm) |
| 2024-03 | OpenAI and Google receive bug bounty reports; no public response documented from either vendor |
| 2025-01-30 | arXiv v2 submitted — adds DonkeyRail guardrail defense (1.0 TPR, 0.017 FPR, 7.6–38.3ms latency overhead) |
| 2025-08 | AAGF-2026-044 (ZombAI / CVE-2025-53773) disclosed — direct production-grade descendant of the wormable AI agent propagation class first demonstrated by Morris II |
| 2025-10-13/17 | ACM CCS 2025 conference presentation: peer-reviewed, top-tier venue confirmation of technical claims |

---

## What Happened

### Background

By early 2024, RAG-based AI email assistants were emerging as a category — products that coupled a large language model with a retrieval-augmented generation pipeline to help users manage, summarize, and reply to email. These systems typically stored recent emails in a vector database; when generating a reply or taking a requested action, the assistant would retrieve semantically relevant past emails as context for the LLM.

Stav Cohen (Technion), Ron Bitton (Intuit/Technion), and Ben Nassi (Cornell Tech/Tel Aviv University) recognized that this architecture contained a structural vulnerability inherited from the broader prompt injection class: the LLM had no mechanism to distinguish between email content it was supposed to read and instructions it was supposed to follow. They set out to determine whether this vulnerability could be made self-replicating — creating the first AI worm.

### The Research Contribution

The team built a research prototype called ComPromptMized using the LangChain framework, connected to real production model APIs (GPT-4 / ChatGPT 4.0, Gemini Pro, and the open-source multimodal LLaVA). They demonstrated two distinct attack vectors, both achieving zero-click propagation — no user interaction beyond receiving an email was required.

The paper was submitted to arXiv on March 5, 2024, generating immediate coverage in Wired, Ars Technica, The Verge, and PCMag. It was accepted to and presented at ACM CCS 2025, one of the top-tier peer-reviewed venues in computer security.

### What the Worm Demonstrated

The researchers used their own systems and 50 of their own academic emails throughout testing. Two functional use cases were demonstrated: email spamming (the worm sending spam from compromised accounts) and personal data exfiltration (the worm extracting email addresses, phone numbers, and physical addresses from contact information visible in the RAG context).

No external parties' data was accessed without consent. The researchers disclosed to OpenAI and Google via bug bounty programs before publication, framing the vulnerability as an architectural design issue rather than an API-level defect — a framing both vendors implicitly accepted by not issuing patches at the API level.

---

## Technical Analysis

### Formal Definition: Adversarial Self-Replicating Prompt

The paper formalizes the attack as an input `x` such that `G(x) → x`: the model's output equals its input, preserving the payload. More precisely: `G(w ∥ x ∥ y) → payload ∥ x`, where `w` is a jailbreaking instruction embedded in the email, `x` is the adversarial self-replicating prompt, and `y` is the legitimate content. The model outputs the payload plus a copy of `x` — which then propagates in the model's response.

The structural analogy to classical vulnerabilities is exact: SQL injection treats data (user input) as code (SQL); buffer overflows treat data as executable code. Morris II treats data (email content) as code (LLM instructions), and outputs code (the adversarial prompt) instead of data (a response). The LLM's context window cannot enforce the data/instruction boundary.

### Attack Vector 1: Text-Based Self-Replication (RAGworm)

The propagation chain:

1. Attacker sends a poisoned email to a victim. The email body contains an embedded jailbreaking prompt alongside the adversarial self-replicating text — invisible or embedded within innocuous-seeming content.
2. The victim's RAG-based email assistant stores the incoming email in its RAG vector database as part of normal ingestion.
3. When the assistant subsequently generates replies to future emails — a routine, triggered-on-receipt operation — it retrieves semantically relevant emails from the RAG database. The poisoned email is retrieved as context.
4. The LLM encounters the adversarial self-replicating prompt in its context and replicates it in its output, executing the embedded payload (exfiltrate contact data, send spam, forward the worm).
5. The assistant's legitimate email-send capability delivers the response email — which now contains the adversarial prompt — to recipients.
6. Recipients' AI email assistants receive the email, store it in their own RAG databases, and the cycle repeats.

This is passive zero-click propagation: the victim never clicks, opens, or forwards anything. The propagation is driven entirely by the assistant's normal automated behavior.

**Propagation rate demonstrated in testing:** ~20 new client infections per 1–3 days (super-linear spread characteristic of worm dynamics, not linear phishing).

### Attack Vector 2: Image-Based Self-Replication

For multimodal assistants (GPT-4V, LLaVA), the researchers demonstrated propagation via adversarially perturbed image attachments. The Fast Gradient Sign Method (FGSM) — a standard adversarial machine learning technique — was used to apply imperceptible pixel-level perturbations to images. When the multimodal assistant processes the perturbed image attachment, the perturbation steers the model's output to contain the desired adversarial text, triggering the application flow (exfiltration, forwarding). This vector bypasses text-only input sanitization defenses: the payload is encoded in the image's pixel values, not in text.

### RAG Persistence Amplification

Classical prompt injection requires an attacker to deliver the payload fresh on each interaction. The RAGworm amplifies this by exploiting the persistence layer: once the poisoned email is stored in the vector database, it persists indefinitely. Every future query to the RAG database that semantically matches the poisoned email's content retrieves it as context — meaning the attacker delivers the payload once, and it re-executes on every relevant subsequent interaction. The RAG database becomes a persistent infection reservoir.

### Black-Box and White-Box Exploitation

The attack was demonstrated successfully under both access models:
- **Black-box (API-only access):** Attacker knows only that the target uses a GPT-4 or Gemini Pro backend, with no access to model weights or architecture details. The adversarial prompts were crafted to work without white-box knowledge.
- **White-box (model weights known):** Demonstrated for the open-source LLaVA model; FGSM image perturbations were computed with access to the model's gradient information. Production-grade deployments are typically black-box; the white-box result confirms the attack class generalizes across access models.

### Connection to Simon Willison's Lethal Trifecta

The paper explicitly cites Simon Willison's "lethal trifecta" as foundational theoretical context: an AI agent becomes critically vulnerable when it simultaneously has access to (1) sensitive data, (2) untrusted external content it processes as instructions, and (3) an external communications channel. A RAG-based email assistant satisfies all three conditions by design: it stores contacts and correspondence (sensitive data), processes incoming emails without sanitization (untrusted content), and can send email (external communications channel).

### Defense: DonkeyRail Guardrail

The arXiv v2 (January 2025) adds a guardrail the researchers call DonkeyRail, designed to detect adversarial self-replicating prompts in real time before they are processed. Published performance:
- **True Positive Rate (TPR):** 1.0 (100% detection of adversarial prompts in their test set)
- **False Positive Rate (FPR):** 0.017 (1.7% false alarm rate on benign emails)
- **Latency overhead:** 7.6–38.3 ms per email processed

The guardrail operates as a classifier layer between email ingestion and LLM processing, detecting patterns characteristic of adversarial self-replicating prompt structure before they reach the model's context.

---

## Root Cause Analysis

**Proximate cause:** A RAG-based email assistant processed adversarial prompts embedded in incoming email bodies as LLM instructions, replicating those instructions in output emails and executing attached payloads (data exfiltration, spam propagation) via the agent's legitimate email-send capability.

**Why 1:** Why did the LLM process adversarial email content as instructions rather than as inert data?

LLMs have no native mechanism to distinguish between content they are instructed to process and content that contains instructions. The context window is a flat token sequence; system prompts, user instructions, retrieved RAG context, and email bodies all occupy the same space. A well-crafted adversarial prompt in an email body is structurally indistinguishable from a developer-authored instruction.

**Why 2:** Why did the RAG architecture not quarantine untrusted incoming email content before LLM retrieval?

The RAG architecture was designed for utility: retrieving semantically relevant past emails as context for generation improves response quality and enables personalization. The retrieval pipeline did not differentiate between emails the user authored (developer-trusted) and emails received from external, potentially adversarial sources (untrusted). All emails entered the vector database on equal footing and were retrieved with equal authority to shape LLM behavior.

**Why 3:** Why did the agent's email-send tool not require human approval for outbound messages?

Autonomous email sending is the core productivity value proposition of a fully agentic email assistant. Requiring human approval for every outbound email — including automated replies — would defeat the purpose of the automation. The email-send tool was designed to operate without per-send confirmation, treating the LLM's decision to send as a sufficient authorization signal.

**Why 4:** Why was the email-send tool's authorization model not scoped to human-initiated actions only?

No trust-tier distinction was implemented between actions the human user explicitly requested and actions the LLM autonomously decided to take after processing retrieved context. From the tool's perspective, a send instruction from the LLM is a send instruction, regardless of whether that decision was made in response to the user's request or in response to adversarial instructions in a retrieved email.

**Why 5 / Root cause:** The LLM context window cannot enforce a boundary between data (email content to be processed) and instructions (commands to the agent). RAG-based email assistants ingest untrusted external content (incoming emails) directly into the same context that governs agent behavior, while possessing an outbound communications capability (email send) that enables propagation. The agent's architecture satisfies all conditions of Simon Willison's lethal trifecta by design — not by configuration error or implementation defect. The root cause is the absence of any trust-tier architecture that distinguishes instruction-bearing context from untrusted-content context.

**Root cause summary:** RAG-based email assistants treat incoming emails (externally controlled, adversarially manipulable) and developer-authored instructions as equivalent inputs to the LLM context, while possessing the email-send tool as a propagation channel. This structural conflation is not a bug in any specific system — it is an architectural property of the RAG + agentic email class, applicable to any system built on this pattern.

---

## Impact Assessment

**Severity:** Medium

**Severity justification:** By AgentFail's taxonomy, research demonstrations with no production deployment are rated Low. The medium rating reflects the near-miss criterion: conditions for serious harm are present, production-grade model APIs were tested, and the attack class is directly applicable to deployed systems. Mitigating factors include: lab-only scope, authors' own data only, voluntary PoC stopping point, responsible disclosure, and no confirmed in-the-wild exploitation to date (as of the date of curation, May 2026 — more than two years after disclosure).

**Actual impact (production):**
- Users affected: 0
- Data exposed: None (authors' own academic emails, used with their own consent)
- Financial impact: None
- Systems compromised: None outside research lab

**Demonstrated impact (lab environment):**
- Email addresses, phone numbers, and physical addresses exfiltrated from 50 real academic emails (authors' own)
- Successful spam propagation across research test nodes
- Propagation rate: ~20 new infections per 1–3 days (super-linear)
- Attack demonstrated on GPT-4 (ChatGPT 4.0), Gemini Pro, and LLaVA — production-grade models via live APIs

**Potential impact (near-miss scenario):**
- Mass exfiltration of contact books across any RAG-based email assistant network
- Spam and phishing at organizational or inter-organizational scale, using legitimate email accounts as propagation carriers
- Super-linear spread that could cascade across an enterprise email network without any user action beyond receiving email
- Estimated probability-weighted averted damage: ~$2.5M (order-of-magnitude confidence; see frontmatter methodology)

**Actual vs. potential contrast:** The gap between the documented lab demonstration and the potential production harm is large. The $8-9K average documented financial loss across AgentFail incidents does not apply here — this incident has no documented financial harm and high potential harm. This contrast is why it qualifies for the database despite lab-only scope.

---

## How It Could Have Been Prevented

1. **Trust-tiered context architecture:** Implement structural separation between developer-authored instructions (system prompt, user prompt) and externally ingested content (incoming emails, retrieved RAG context from external senders). Externally ingested content processed in a read-only, instruction-inert context: the LLM can summarize, categorize, and report on it, but adversarial instructions embedded within it are not actable. This is the architectural fix; everything else is defense-in-depth.

2. **Mandatory human approval for email-send on LLM-initiated actions:** Distinguish between emails the user explicitly requested to send and emails the LLM autonomously decided to send after processing retrieved context. Any outbound email not directly triggered by an explicit, session-bounded user instruction should require human confirmation. This breaks the zero-click propagation chain at its final link.

3. **RAG ingestion sanitization and source trust scoring:** Before inserting incoming emails into the vector database, classify each email by sender trust (known contact vs. unknown external sender) and apply sanitization to strip adversarial prompt patterns. Apply DonkeyRail-style guardrail classification before RAG ingestion. Emails from unknown external senders should be stored in a lower-trust partition of the vector database, retrieved with reduced authority to shape agent behavior.

4. **Output inspection before send:** Apply a classifier to the LLM's draft output — before the email is sent — to detect whether the output contains adversarial self-replicating prompt patterns. DonkeyRail's 7.6–38.3ms latency overhead makes this practical at production email volumes. A draft output that contains its own instructions (the formal definition of a self-replicating prompt) is almost certainly malicious.

5. **Least-privilege email-send tool scoping:** The email-send tool should enforce strict least-privilege: it can only send to recipients that the user has explicitly approved in the current session, and cannot include content not reviewed by a human unless the email is a simple pre-approved template. This requires a more constrained agentic email architecture but eliminates the propagation channel.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**

No production patch was issued by OpenAI or Google. Both vendors received responsible disclosure reports via bug bounty programs. Neither issued a public response or public patch, consistent with the research team's framing: this is an architectural design issue with no API-level fix available. The underlying LLM APIs do not natively enforce data/instruction boundaries; fixing the vulnerability requires changes at the application architecture layer, not the model API layer.

The research team developed DonkeyRail (published in arXiv v2, January 2025) as a detection guardrail. DonkeyRail is not a vendor patch — it is a research artifact for deployment by operators building RAG-based email systems.

**Recommended fixes for operators:**

- **Deploy a guardrail classifier (DonkeyRail or equivalent) on both RAG ingestion and output paths.** The input path intercepts adversarial prompts before they poison the vector database; the output path intercepts worm payloads before they propagate. Both gates are required.
- **Audit your RAG vector store for existing poisoned entries.** If your system has been receiving external email without guardrail protection, adversarial prompts may already be stored in your vector database. Scan for self-replicating prompt signatures using the patterns described in the ComPromptMized paper.
- **Implement mandatory human-in-the-loop for autonomous outbound email.** Even a lightweight confirmation step — showing the human the draft before sending — breaks the zero-click propagation chain. This is the single most effective near-term operational mitigation.
- **Apply image sanitization or disable multimodal attachments in email context.** The FGSM image attack vector cannot be detected by text-only guardrails. Until multimodal input can be reliably sanitized, treat image attachments from unknown senders as untrusted inputs that should not be processed by multimodal agents.
- **Separate RAG partitions by sender trust.** Do not store emails from unknown external senders in the same vector partition as emails from known, trusted contacts. Retrieve lower-trust-partition content with higher scrutiny or require human approval before acting on it.

---

## Solutions Analysis

### DonkeyRail Guardrail (Adversarial Prompt Detection)

- **Type:** Detection and Guardrail
- **Plausibility:** 5/5 — Purpose-built and empirically validated by the same researchers who characterized the attack. 1.0 TPR and 0.017 FPR on the test set is strong performance. Published in peer-reviewed venue (ACM CCS 2025). Addresses both the ingestion path (block poisoned emails from entering the RAG database) and the output path (block worm payloads before sending).
- **Practicality:** 4/5 — 7.6–38.3ms latency overhead is practical at production email volumes. Implementation requires integrating a classifier at two points in the pipeline (ingestion and output). Open-source research artifact; would require productionization for commercial deployment. Not available as an off-the-shelf commercial product as of curation date.
- **How it applies:** DonkeyRail targets the formal definition of the adversarial self-replicating prompt: it detects inputs structured as `G(x) → x`. Both the text-based and image-based attack paths require the LLM to replicate the prompt in output; DonkeyRail's output-path classifier catches this pattern before the email is sent.
- **Limitations:** Test set performance (1.0 TPR, 0.017 FPR) was measured against the attack variants the researchers generated. Adversarially evolved prompts not represented in the training distribution may evade detection. Semantic attacks (adversarial prompts that convey the instruction meaning without triggering pattern-based classifiers) are an open problem. The image attack vector requires a separate, multimodal-aware classifier variant.

### Mandatory Human Approval for LLM-Initiated Outbound Email

- **Type:** Human-in-the-Loop (HITL)
- **Plausibility:** 5/5 — Directly breaks the propagation chain at the outbound link. If the agent cannot send email without human approval of the draft, zero-click worm propagation is impossible: the human sees the worm payload in the draft and rejects it (assuming the payload is detectable to a human reader, which text-based payloads are when visible).
- **Practicality:** 3/5 — Fundamental tension with the value proposition of a fully autonomous email assistant. Requiring human approval for every outbound email defeats the automation. Practical deployment requires a tiered approach: human approval for emails to new recipients, emails exceeding a size/content threshold, or emails triggered by incoming-email context (i.e., the propagation scenario) rather than by explicit user request. Risk-tiered HITL is achievable but requires careful UX design.
- **How it applies:** In the Morris II attack chain, the propagation step is the LLM autonomously sending an email to new recipients. A HITL gate at this step — even a lightweight "here is the draft email, confirm?" — would surface the adversarial payload to the user before it propagates. The user would see the unusual self-replicating content and reject it.
- **Limitations:** Sophisticated attacks may embed payloads in email content that appears benign to a human reader (e.g., encoded in innocuous-looking formatting or metadata). If the payload is concealed from human review, HITL becomes a weaker defense. Also: user fatigue with frequent confirmations leads to approval without review — the same problem as browser security dialog fatigue.

### RAG Ingestion Sanitization and Trust Partitioning

- **Type:** Input Validation and Trust Architecture
- **Plausibility:** 5/5 — Addresses the persistence amplification mechanism. Preventing poisoned emails from entering the vector database stops the worm from persisting across interactions, converting a self-sustaining infection into a one-shot injection that does not re-execute.
- **Practicality:** 3/5 — Requires architectural changes to the RAG pipeline: sender trust classification, content sanitization, and partition-aware retrieval with trust-weighted context authority. Each component is individually achievable; integrating them into a production email assistant requires significant design work. Current RAG frameworks (LangChain and equivalents) do not natively support trust-partitioned retrieval.
- **How it applies:** The RAGworm's persistence property requires the poisoned email to be stored and subsequently retrieved as authoritative context. A trust-partitioned RAG database that stores external-sender emails in a lower-authority partition — retrieved with explicit uncertainty signaling or human-review flags — would prevent the poisoned email from silently shaping agent behavior on future interactions.
- **Limitations:** Trust classification of senders is imperfect: an attacker can compromise a known contact's email account and send the poisoned email from a "trusted" address. Trust partitioning by sender reduces attack surface but does not eliminate it. Content sanitization must handle both text and image-encoded payloads; multimodal sanitization is not a solved problem.

### Output Inspection Before Send

- **Type:** Output Validation and Guardrail
- **Plausibility:** 4/5 — A classifier applied to the LLM's draft email before transmission catches worm payloads at the propagation point. The formal definition of a self-replicating prompt (output that contains its own input instructions) provides a detectable signal.
- **Practicality:** 4/5 — Output inspection is architecturally simpler than RAG pipeline changes: it is a single gate between the LLM's output and the email-send tool invocation. DonkeyRail's 7.6–38.3ms overhead is acceptable at production email throughput. Requires integration into the tool invocation chain (inspect output before tool call, not after).
- **How it applies:** Even if the poisoned email successfully enters the RAG database and successfully influences the LLM's output, output inspection catches the worm payload in the draft before it is sent. This breaks the propagation chain at the final link and is complementary to ingestion-path guardrails.
- **Limitations:** An LLM that has been thoroughly compromised by an adversarial prompt might generate a payload that evades the output classifier — either by semantic encoding (natural language that conveys the instruction without triggering classifier patterns) or by splitting the payload across multiple emails or interactions. Output inspection also does not prevent data exfiltration payloads that are semantically indistinguishable from benign email content (e.g., "here is your contact's phone number" in a legitimate-looking reply).

### Least-Privilege Tool Scoping with Content Isolation

- **Type:** Architectural Redesign and Permission Scoping
- **Plausibility:** 4/5 — Addresses the root cause (data/instruction conflation) and the propagation mechanism (email-send tool) simultaneously. Implementing structural content isolation in the LLM context and scoping the email-send tool to human-confirmed recipients closes both the injection and propagation surfaces.
- **Practicality:** 2/5 — This is the correct architectural fix and the hardest to implement. Retrofitting an existing agentic email assistant with trust-tiered context requires rearchitecting how the system passes content to the LLM and how tool invocations are authorized. LangChain and equivalent frameworks do not natively support trust-tiered context. The productivity value of the email assistant depends on the agent freely interpreting and acting on email content — restricting this fundamentally changes the system's capability profile. This is a 12–18 month engineering effort for a mature production system, not a configuration change.
- **How it applies:** A properly scoped architecture would: (1) pass incoming email content in a flagged read-only context tier that the LLM can report on but cannot treat as instructions; (2) restrict the email-send tool to recipients explicitly named in the user's session-level instruction, blocking autonomous sends to new recipients encountered in email context; and (3) require a formal authorization signal (human confirmation or a signed user intent) for any tool invocation not directly traceable to a user-originated instruction. This architecture prevents Morris II at the root cause level — not as a detection workaround.
- **Limitations:** Enforcing a hard data/instruction boundary in an LLM that processes flat token sequences requires either formal context labeling that current models do not natively support, or a wrapper architecture that pre-processes content before LLM ingestion. Neither is a trivial engineering solution. The boundary also creates legitimate utility trade-offs: an email assistant that cannot act on information in received emails is significantly less useful.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-044]] | ZombAI (CVE-2025-53773, GitHub Copilot) — direct research descendant in the wormable AI agent propagation class. ZombAI demonstrated the same worm propagation mechanism in a production IDE context rather than a research email prototype, using git workflows rather than email as the propagation channel. Where Morris II demonstrated the attack class at lab scale, ZombAI confirmed it at production scale (20M Copilot users in scope). ZombAI received a CVE and a vendor patch; Morris II received no patch due to architectural framing. The research lineage from Morris II to ZombAI is the primary reason Morris II qualifies for this database despite lab-only scope. |

---

## Strategic Council Review

### Phase 1 — Challenger

**C1. The root cause analysis stops at the symptom level, not the structural root.**

The draft's "root cause" — "LLMs cannot enforce a data/instruction boundary" — is a correct description of a LLM property, not an explanation of an organizational or engineering failure. Real root causes answer: why did engineers build and deploy this architecture without addressing a known risk class? Prompt injection in web applications (SQL injection, XSS) was already a decades-old lesson about trusting untrusted input. The root cause is not that LLMs can't distinguish data from instructions; it is that engineers and product teams building agentic email assistants in 2023-2024 did not apply the trust boundary principle that has governed secure software engineering for 30 years. By stopping at the LLM's technical limitation, the analysis lets the actual decision-making chain — product design, security review, threat modeling — off the hook entirely. The 5 Whys does not reach the human/organizational level: Why did no one run a threat model on the lethal trifecta before shipping an agent with all three conditions?

**C2. Severity Medium is not justified by the near-miss criterion as applied here.**

The draft invokes "near-miss" to elevate from Low to Medium, but the near-miss criterion in AgentFail's taxonomy requires that harm conditions are concretely present in a deployed system that was not exploited. Morris II was never deployed. The architecture it describes was not a specific deployed product — it was a research prototype that demonstrably exploited live API endpoints (GPT-4, Gemini Pro), but the "victim" system was the researchers' own machines, their own email accounts. No commercial RAG-based email assistant was demonstrated to be vulnerable. Calling this a near-miss implies there was a real system that narrowly escaped harm; what actually happened is that researchers proved an attack class would work if such a system existed and was attacked. The more precise framing is "demonstrated architectural vulnerability with no deployed victim" — which is a Low by strict taxonomy, elevated to borderline Low-Medium by the production-API use and the ACM CCS peer review, but not a clean Medium.

**C3. The $2.475M averted damage estimate is not an estimate — it is a stacked speculation that should not appear as a dollar figure.**

The methodology stacks at least four unsupported assumptions: (a) approximately 1,000 organizations had RAG-based email assistants in production in 2024 — this number is not empirically sourced and is quite possibly inflated, since in March 2024 RAG-based email assistants were an emerging category with limited commercial deployment; (b) 500 contacts per organization — sourced from nothing; (c) the IBM $165 per-record figure — this is the full cost-of-a-breach figure covering notification, credit monitoring, legal, and regulatory costs, not the value of contact-record exfiltration specifically; applying it to contact records silently inflates the estimate by the full breach overhead cost for every exfiltrated contact, which is not how breach costs work; (d) the 0.03 probability weight — described as a researcher-derived estimate ("2-3 years to weaponization"), not a formal probability elicitation. The compound uncertainty across four speculative inputs is not "order-of-magnitude confidence" — it is two-orders-of-magnitude uncertainty. The draft's own notes acknowledge this ("do not present as quantified realized harm") but the YAML still contains a field `averted_damage_usd: 2475000` that will appear as a number on the dashboard. That number will be treated as real by users who do not read the methodology footnote.

**C4. DonkeyRail's 5/5 plausibility rating is compromised by self-assessment bias — and the limitation section buries the most important caveat.**

The draft rates DonkeyRail at 5/5 plausibility and 4/5 practicality. DonkeyRail was designed, trained, and evaluated by the same three researchers who designed and executed the attack. The test set it was measured on was generated by the same researchers. There is no independent adversarial evaluation: no red team tried to evade DonkeyRail with adversarially evolved prompts; no third-party lab validated the 1.0 TPR / 0.017 FPR numbers on a held-out distribution. The limitations section does mention this ("adversarially evolved prompts not represented in the training distribution may evade detection") but buries it after the headline numbers. A guardrail evaluated exclusively by its creators against their own attacks is, at best, 3/5 plausibility from an independent security assessment standpoint. The plausibility score should be reduced or the self-assessment bias should appear in the primary rating justification, not the limitations footnote.

**C5. The new pattern group `wormable-ai-agent-propagation` is premature with a single seed incident and creates a taxonomy fragmentation risk.**

The draft creates a new pattern group containing one incident (Morris II), while noting that AAGF-2026-044 (ZombAI) is in a different group. The stated rationale is that "the attack vectors, platforms, and mechanisms are sufficiently distinct." But the core propagation mechanism — a self-replicating adversarial prompt that exploits an agent's external communications capability to spread without user interaction — is the same in both. The distinction between "email RAG worm" and "IDE config injection worm" is at the platform/vector level, not the mechanism level. Creating separate pattern groups for the same mechanism applied to different platforms will fragment the taxonomy as more worm variants emerge. A single `wormable-ai-agent-propagation` group should contain both Morris II and ZombAI, with the platform distinction captured in tags and the incident description, not the pattern group assignment.

**C6. The incident fails AgentFail's stated inclusion criterion ("real-world deployment") and the justification for inclusion is not made explicit enough.**

The `researcher_notes` field acknowledges this is a research paper and argues for inclusion under "near-miss criterion." But the public-facing incident page does not prominently state this justification. A reader landing on the page sees "severity: medium" and a $2.5M damage figure before encountering the qualifier "lab-only scope." The inclusion justification — this is a PoC that demonstrates a vulnerability class directly applicable to deployed production systems, included for its predictive value about deployed-system risk — should be the first sentence of the executive summary, not a nuance buried in metadata. Failure to be explicit risks undermining database credibility: if AgentFail includes research PoCs without prominent disclosure, the "real incidents" framing of the database is weakened.

---

### Phase 2 — Steelman

**S1. Medium severity is defensible because "lab-only" does not mean "production-safe" when production-grade APIs are the attack surface.**

The Challenger argues Low because no deployed system was exploited. But the production-grade API argument is not cosmetic: GPT-4 and Gemini Pro are the exact models powering commercial email assistants. The researchers did not simulate a theoretical LLM — they exploited the live inference APIs that production systems call. When GPT-4's production API endpoint yields to the adversarial self-replicating prompt, that is not a lab result: that is a characterization of how GPT-4 behaves in production. Any operator using GPT-4 as the inference backend for a RAG email assistant is running code that has been empirically demonstrated to execute the Morris II payload. The lab was not a simulated environment — it was a controlled environment using the production API surface that real products share. Medium severity is appropriate because the gap between "demonstrated in lab" and "exploitable in production" is narrower than the Challenger implies: it is the gap between the researchers' own email infrastructure and a commercial product's email infrastructure, with the same model at the center.

**S2. The $2.475M figure is analytically legitimate as a comparative anchor if clearly labeled as speculative modeling, not empirical estimation.**

The Challenger is correct that the stacked assumptions introduce large uncertainty. But the Steelman is that the figure serves a legitimate communicative purpose on the AgentFail dashboard: it anchors the "near-miss potential" column with a number that is directionally correct (millions, not thousands) even if the precision is illusory. The methodology note explicitly says "do not present as quantified realized harm" and labels it "order-of-magnitude confidence." The probability weight (0.03) is explicitly conservative — the researchers themselves put weaponization at "2-3 years." The IBM $165 per-record figure, while not perfectly matched to contact-record exfiltration, is a widely cited and recognized industry benchmark that provides a common reference point. The estimate does not claim precision; it claims order of magnitude. Order-of-magnitude estimates of averted harm are standard practice in risk quantification and appear in insurance, regulatory impact assessments, and security program justifications. The issue is not whether the number should exist — it should — but whether it is labeled correctly.

**S3. DonkeyRail's inclusion as a defense option is justified even with the self-assessment caveat, because the formal structural insight it represents is independently verifiable.**

The Challenger is right that DonkeyRail has not been independently red-teamed. But the core insight of DonkeyRail — that adversarial self-replicating prompts have a structural signature (output that contains its own input instructions) that can be detected at the ingestion and output path — is independently derivable from the formal definition `G(x) → x`. That structural signature is not a DonkeyRail-specific claim: it is a logical consequence of what it means for a prompt to self-replicate. Any guardrail designed around that structural definition will catch naive implementations of Morris II-class attacks. The Steelman is not that DonkeyRail is battle-hardened — it is not — but that the design principle it embodies is sound and independently valid. Operators who implement a guardrail based on DonkeyRail's structural insight (without using DonkeyRail's specific classifier) are building on a valid theoretical foundation. The ratings should be preserved but the primary justification should foreground the structural insight and the self-assessment caveat should be upgraded from "limitations" to the main justification paragraph.

**S4. The wormable-ai-agent-propagation pattern group is justified as a distinct mechanism class, not just a platform variant.**

The Challenger argues that Morris II and ZombAI share the same propagation mechanism and should be in the same group. The Steelman: the mechanism distinction is real at the level of what makes the worm work. Morris II's worm dynamics depend on the RAG persistence layer — the fact that the poisoned email is stored and re-retrieved. ZombAI's mechanism (IDE config injection) does not use a persistence layer in the same way: it exploits a configuration file that is committed to git and propagated through repository clones. These are structurally different propagation channels: RAG database retrieval vs. version control propagation. They require different defenses at the operator level (RAG ingestion guardrails vs. code review and config signing). A pattern group that conflates them obscures operationally relevant differences. The provisional status of the group (one seed incident) is an honest acknowledgment of the taxonomy's immaturity — not a defect.

**S5. The inclusion of research PoCs is a legitimate and important part of a near-miss incident database, and Morris II is the strongest possible example of why.**

The Challenger argues that including research PoCs without prominent disclosure weakens the "real incidents" framing. The Steelman: near-miss incident databases that exclude research PoCs are systematically blind to the most actionable category of risk signals. The Morris II PoC is exactly the kind of incident that operators should know about before they ship a RAG-based email assistant — not after a production exploitation occurs. The direct lineage from Morris II (2024, lab) to ZombAI (2025, CVE, 20M users in scope) proves this empirically: the research warning preceded the production incident by approximately 18 months. An incident database that had Morris II would have given operators 18 months of lead time. The inclusion criterion should not be "did it happen in production" but "is this a credible signal of a harm class that will or has materialized in production" — and Morris II passes that test definitively.

---

### Phase 3 — Synthesis

**Which challenger points require updates:**

C1 (root cause stops at symptom) is partially valid. The 5 Whys chain is technically correct but does not reach the human/organizational failure: engineers built an architecture satisfying the lethal trifecta without applying the trust boundary principle that secure software engineering has required for decades. A sixth Why should be added: "Why did the agentic email assistant not receive a threat model that identified the lethal trifecta conditions before deployment?" The answer — that the AI agent deployment category in 2023-2024 moved faster than its security analysis frameworks — is a significant finding that the current draft omits. This is a substantive addition that strengthens the root cause section without contradicting the current chain.

C3 (damage estimate is stacked speculation) requires a labeling change, not a number removal. The YAML field `averted_damage_usd: 2475000` should be accompanied by a display note that explicitly prevents the number from appearing on the dashboard without its uncertainty label. The confidence field already says "order-of-magnitude," but that is insufficient — the field should be relabeled or accompanied by a flag that triggers a different display treatment (e.g., a range with explicit uncertainty bars rather than a point estimate). The number itself is defensible as a directional anchor but is misrepresented by its field name.

C4 (DonkeyRail self-assessment bias) requires a rating adjustment. The 5/5 plausibility for DonkeyRail should be downgraded to 4/5, with the primary justification paragraph explicitly stating that the rating applies to the structural design principle of the guardrail, not the specific classifier's performance, which has not been independently validated. The limitations section's caveat should be moved to the primary justification.

C5 (pattern group fragmentation) does not require immediate action but should be noted as an open taxonomy question. ZombAI and Morris II are in the same broad mechanism class; whether they belong in the same pattern group or a parent-child taxonomy structure is a question that cannot be resolved with two incidents. Flag it as an explicit open question for the taxonomy working group rather than asserting the current grouping is correct.

C6 (inclusion not prominent enough) requires a one-line addition at the top of the executive summary: explicitly state this is a research PoC included under the near-miss criterion for its predictive value. The current executive summary says "this is a near-miss incident" in the second sentence but does not say "this is a research PoC, not a production incident" until the middle of the second sentence. The order should be reversed: lead with "research PoC, not a production incident" and follow with "included because."

**Which challenger points were addressed by steelman and require no changes:**

C2 (severity Medium not fully justified) — the steelman on production-API use is persuasive. The gap between "lab" and "production" is the researchers' own email infrastructure vs. a commercial product, with the same GPT-4 inference endpoint in between. Medium is the correct call and requires no change, but the severity justification in the Impact Assessment section should be strengthened by explicitly making the production-API argument (it is currently implicit).

**Final quality assessment:** The draft is high quality. The executive summary is precise, the technical analysis is accurate, the operator TL;DR is actionable, and the near-miss framing is appropriate. The weaknesses are concentrated in three areas: (1) the root cause chain stops short of the organizational/engineering failure; (2) the damage estimate is correctly caveated in notes but the YAML structure does not prevent it from being displayed as a number; (3) DonkeyRail's rating overstates independent validation. None of these are fatal; all are fixable with targeted edits.

**Confidence level: Medium-High.** The technical claims are well-supported by the peer-reviewed paper and independent coverage. The analytical judgments (severity, inclusion rationale, pattern group) are defensible with the amendments recommended above. The primary remaining uncertainty is the damage estimate, which cannot be resolved without empirical data on RAG-based email assistant deployment scale in 2024 — data that does not exist.

**Unresolved uncertainties:**

1. Deployment scale of RAG-based email assistants in March 2024 — the foundation of the damage estimate — is genuinely unknown and possibly significantly lower than 1,000 organizations, which would reduce the already-speculative averted damage figure by an order of magnitude.
2. Whether DonkeyRail's performance on adversarially evolved attack variants (not just the researchers' own variants) holds. This is an empirical question requiring independent red-team evaluation that has not been published as of curation date.
3. Whether `wormable-ai-agent-propagation` should be a parent group containing both Morris II and ZombAI, or whether the mechanism distinction (RAG persistence vs. VCS propagation) justifies separate leaf groups. This is an open taxonomy design question with no definitive answer at two-incident sample size.
4. Whether any commercial RAG-based email assistant was silently vulnerable between March 2024 (disclosure) and the present, and chose not to disclose — a question that cannot be resolved from public sources.

---

## Key Takeaways

1. **Zero-click is a new threat model for email agents.** Prior email security threats required the victim to click a link, open an attachment, or take some action. Morris II demonstrated that a GenAI email assistant can be compromised by simply receiving an email — the agent processes the payload on behalf of the user without any user interaction. This threat model invalidates user awareness training as a primary defense and requires architectural mitigations rather than behavioral ones.

2. **RAG persistence amplifies prompt injection from one-shot to self-sustaining.** Classical prompt injection delivers the payload on a single interaction and is done. RAGworm stores the payload in the vector database, re-executing it on every future retrieval that matches the poisoned content. A single poisoned email becomes a persistent infection source that shapes agent behavior indefinitely — until the vector database is audited and cleaned. Operators of RAG-based systems must treat the vector database as an attack surface requiring integrity monitoring, not just a data store.

3. **DonkeyRail is the closest thing to a shipped defense — but it is a research artifact, not a production product.** The 1.0 TPR / 0.017 FPR performance is impressive, but it was measured on the same researchers' attack variants. Adversarially evolved prompts or semantic attacks may evade it. Operators should treat DonkeyRail as a starting point for guardrail design rather than a deployable solution. The key design insight — inspect for the self-replicating structural signature at both the ingestion path and the output path — is the transferable lesson.

4. **Wormable means organizational threat, not per-user threat.** A non-wormable prompt injection attack requires the attacker to target each victim individually. A wormable attack requires one successful compromise to propagate to ~20 new victims per 1–3 days via normal communication channels. For enterprise email environments where AI assistants communicate with each other as well as with humans, the exposure is organizational in scope: one compromised assistant can cascade through a team, a department, or an organization before any human observer detects the propagation. Security controls must be organizational (network-level, RAG-level, tool-level), not per-user.

5. **The lethal trifecta is a checklist for architectural risk.** Simon Willison's three-condition framework — sensitive data + untrusted content + external communications channel — is a direct checklist for operators evaluating any agentic system's risk profile. Any agent that satisfies all three conditions simultaneously is structurally vulnerable to a Morris II-class attack. The evaluation should happen at design time, before deployment, not after incident discovery. RAG-based email assistants satisfy all three by design; the risk should be a known, explicitly mitigated input to the product architecture.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| Cohen, S., Bitton, R., Nassi, B. "Here Comes The AI Worm" (arXiv v1) | https://arxiv.org/html/2403.02817v1 | 2024-03-05 | High — Primary technical source; peer-reviewed at ACM CCS 2025; authors used real production model APIs |
| Cohen, S., Bitton, R., Nassi, B. "Here Comes the AI Worm" (arXiv v2 — adds DonkeyRail) | https://arxiv.org/abs/2403.02817 | 2025-01-30 | High — Revised paper with defense; same authors |
| ComPromptMized project website | https://sites.google.com/view/compromptmized | 2024 | High — Official project site with demos and materials |
| GitHub: StavC/Here-Comes-the-AI-Worm | https://github.com/StavC/Here-Comes-the-AI-Worm | 2024 | High — Research code repository; verifiable implementation |
| ACM CCS 2025 paper record | https://dl.acm.org/doi/10.1145/3719027.3765196 | 2025-10 | High — Peer-reviewed top-tier venue; confirms technical rigor of claims |
| Schneier, B. "LLM Prompt Injection Worm" | https://www.schneier.com/blog/archives/2024/03/llm-prompt-injection-worm.html | 2024-03 | High — Credible independent security commentator; provides expert consensus framing |
| OECD.AI Incident Monitor — Incident 7805 | https://oecd.ai/en/incidents/2024-03-01-7805 | 2024 | High — International regulatory monitoring body; classification: AI Hazard |
| Infosecurity Magazine — "Worm Created to Target Generative AI Systems" | https://www.infosecurity-magazine.com/news/worm-created-generative-ai-systems/ | 2024-03 | Medium — Trade press; corroborates news coverage timeline |
| IBM Think — "Morris II: Self-Replicating Malware Targeting GenAI Email Assistants" | https://www.ibm.com/think/insights/morris-ii-self-replicating-malware-genai-email-assistants | 2024 | Medium — Enterprise security vendor analysis; useful practitioner framing |
| SentinelOne — "AI Worms" explainer | https://www.sentinelone.com/cybersecurity-101/cybersecurity/ai-worms/ | 2024 | Medium — Security vendor explainer; broad context |
