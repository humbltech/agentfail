# Stage 1 Research: AAGF-2026-049
## Candidate: ComPromptMized — First AI Worm: Agent-to-Agent Propagation via Adversarial Self-Replicating Prompts

**Research date:** 2026-05-07

---

## TRIAGE VERDICT

**QUALIFIED WITH CAVEATS** — This is a landmark security research paper demonstrating a genuine and novel architectural threat class against production-grade GenAI systems. Testing used real models (GPT-4, Gemini Pro) in a controlled lab environment built to production architectural specifications; it was not conducted on actual deployed Gmail/Outlook installations. The attack surface is real and directly applicable to any production RAG-based email assistant using these APIs. No confirmed in-the-wild exploitation exists. Classification is **near-miss at the architectural level**: the vulnerability class affects any production deployment matching the tested architecture, and the paper explicitly disclosed to OpenAI and Google. The paper has since been peer-reviewed and accepted to ACM CCS 2025 (the field's top venue), confirming research quality. This qualifies for AgentFail as the foundational "wormable GenAI agent" case study — the canonical predecessor to AAGF-2026-044 (ZombAI) in the self-replicating AI agent failure mode taxonomy.

**Caveat:** `actual_vs_potential` should be flagged as `near-miss` rather than `actual`, and the record must be explicit that no production email system was compromised. The significance is architectural: the demonstrated attack works against systems built from production APIs under realistic conditions.

---

## AgentFail Scope Assessment

**Does this qualify?** Yes, with the near-miss designation.

**Key factors supporting inclusion:**

1. **Production-grade systems tested.** The worm was tested against GPT-4 (ChatGPT 4.0), Gemini Pro, and LLaVA — the actual production model APIs, not toy models. The research environment used LangChain (a standard production framework), real email data from the authors (50 authentic academic emails), and virtual machines representing victim hosts. This is not a whiteboard exercise; it is a functional PoC built on the same components as production AI email assistants.

2. **Zero confirmed in-the-wild exploitation.** No commercial AI email assistant was attacked. The researchers explicitly state experiments were "done in a lab environment on their own systems." OECD.AI classifies this as a hazard (demonstrated capability with plausible harm) rather than an incident (realized harm).

3. **Genuine threat to production deployments.** Any company that built a RAG-based email assistant on GPT-4 or Gemini Pro — a natural and common architecture at the time — would have been directly vulnerable to this attack class. The researchers noted worms could "appear in the wild in the next two to three years" (from March 2024).

4. **Responsible disclosure to OpenAI and Google.** The researchers submitted findings to both companies via their bug bounty programs. Both companies received the disclosure; vendor responses are not publicly documented but the disclosure was made.

5. **Peer-reviewed at ACM CCS 2025.** The paper was accepted to the ACM Conference on Computer and Communications Security 2025, the flagship academic security venue. This is not a preprint curiosity — it passed rigorous peer review by the security research community.

6. **Foundational predecessor to AAGF-2026-044.** ComPromptMized (March 2024) is the research ancestor of ZombAI (August 2025). Both involve: prompt injection → self-replicating payload → propagation across connected parties via normal workflows. The conceptual lineage is direct. Including ComPromptMized anchors the AgentFail corpus's understanding of how this attack class evolved from theoretical PoC to CVE-assigned production exploit.

**Factors requiring caveats:**

- No production system was compromised; no user data was exfiltrated in real deployment.
- The lab environment, while realistic, was not the actual Gmail/Outlook ecosystem.
- Vendor response from OpenAI and Google is not publicly documented; we do not know if either company made architectural changes in response.
- The paper frames the vulnerability as an "architectural design" issue of GenAI ecosystems, not a vulnerability in the GenAI services themselves — meaning neither Google nor OpenAI could patch it without operators redesigning how they build on top of the APIs.

---

## Key Facts

| Field | Value |
|-------|-------|
| Worm name | Morris II (homage to the 1988 Morris Worm) |
| Project name | ComPromptMized |
| Paper title (arXiv v1) | "Here Comes The AI Worm: Unleashing Zero-click Worms that Target GenAI-Powered Applications" |
| Paper title (ACM CCS) | "Here Comes the AI Worm: Preventing the Propagation of Adversarial Self-Replicating Prompts Within GenAI Ecosystems" |
| Authors | Stav Cohen (Technion), Ron Bitton (Intuit / Technion), Ben Nassi (Cornell Tech / Tel Aviv University) |
| Models tested | GPT-4 (ChatGPT 4.0), Gemini Pro, LLaVA |
| Attack vectors | Text-based (prompt injection in email body) + Image-based (adversarial perturbed attachments) |
| Use cases demonstrated | Email spamming + personal data exfiltration |
| Data exfiltrated | Email addresses, phone numbers, physical addresses |
| Real production systems targeted? | No — lab environment using real production model APIs |
| Confirmed in-the-wild exploitation? | None |
| Disclosure | Reported to OpenAI and Google via bug bounty programs |
| Vendor response | Not publicly documented; framed as architectural issue, not API-level vulnerability |
| Defense developed | "DonkeyRail" guardrail (1.0 TPR, 0.017 FPR, 7.6–38.3ms latency) |
| GitHub repository | https://github.com/StavC/Here-Comes-the-AI-Worm (code publicly released) |
| OECD.AI classification | AI Hazard (demonstrated capability, no realized harm) |
| Bruce Schneier assessment | "Natural extension of prompt injection — neat to see it actually working" (measured interest, not alarm) |
| Simon Willison connection | Willison's "Lethal Trifecta" framework (sensitive data + untrusted content + external comms) is cited in the paper as foundational theory for why these attacks work |

---

## Dates

| Event | Date | Source |
|-------|------|--------|
| arXiv submission (v1) | March 5, 2024 | arXiv 2403.02817 |
| arXiv revision (v2) | January 30, 2025 | arXiv 2403.02817 |
| Wired / major press coverage | March 2024 | Wired, Ars Technica, The Verge, PCMag, Tom's Hardware |
| Bruce Schneier blog post | March 2024 | schneier.com/blog/archives/2024/03/llm-prompt-injection-worm.html |
| ACM CCS 2025 acceptance | Mid-2025 (estimated acceptance) | ACM DOI 10.1145/3719027.3765196 |
| ACM CCS 2025 conference | October 13–17, 2025 | sigsac.org/ccs/CCS2025 |
| No confirmed in-the-wild exploitation | Through research date (2026-05-07) | Multiple security sources |

**Note on the title change between v1 (arXiv) and ACM CCS:** The arXiv title is "Unleashing Zero-click Worms…" (offensive framing); the ACM CCS title is "Preventing the Propagation…" (defensive framing). This shift reflects academic peer review norms at CCS, which favor defensive/protective framings. The technical content is substantially the same paper, with v2 incorporating the DonkeyRail defense system prominently.

---

## Technical Analysis

### What is an Adversarial Self-Replicating Prompt?

The paper introduces a formal definition: an adversarial self-replicating prompt is a crafted input `x` such that when processed by a GenAI model `G`, the model's output includes the prompt itself (in addition to any payload):

- **Form 1:** `G(x) → x` — output equals input, containing both the malicious prompt and the payload
- **Form 2:** `G(w ∥ x ∥ y) → payload ∥ x` — a jailbreak `w` embedded in email context forces output that contains the payload and the prompt replication

This is analogous to classic data-vs-code confusion attacks (SQL injection, buffer overflows). The GenAI model is tricked into treating data (an email) as code (an instruction), and outputs code (the prompt) instead of data (a response).

### Attack Vector 1: Text-Based Self-Replication

The attacker embeds a jailbreaking prompt directly in an email message. When an AI email assistant (built on GPT-4 or Gemini Pro via LangChain) processes the incoming email through its RAG pipeline:

1. The poisoned email is stored in the RAG database
2. When the assistant generates replies to similar incoming messages, it retrieves the poisoned email
3. The GenAI model, processing the retrieved content, replicates the adversarial prompt in its output
4. The replicated prompt triggers the defined payload actions (exfiltrate data, send spam to contacts)
5. The generated response email contains the adversarial prompt, infecting the recipient's AI email assistant

This achieves **passive zero-click propagation**: the victim never clicks anything; the worm propagates automatically when the recipient's AI assistant processes the email.

### Attack Vector 2: Image-Based Self-Replication

For multimodal assistants (e.g., those using GPT-4V or LLaVA), the researchers extended the Bagdasaryan et al. method: adversarial perturbations are applied to images using the Fast Gradient Sign Method (FGSM) until the model, upon seeing the perturbed image, outputs the desired text triggering application flow steering.

This allows the worm to propagate through **image attachments**, bypassing text-only prompt injection defenses.

### RAG Exploitation: The RAGworm

The attack specifically exploits Retrieval-Augmented Generation architectures:

1. The worm-containing email is stored in the victim's email assistant's RAG database
2. Subsequent queries that retrieve this email cause the model to process the adversarial prompt
3. The model replicates and executes the payload
4. Super-linear propagation: each compromised client can compromise **20 new clients within 1–3 days** (per experimental data)

The RAG component is critical: without RAG, the worm would not persist. With RAG, the poisoned email becomes a persistent infection vector in the database.

### Two Access Settings Tested

- **Black-box:** Attacker has no knowledge of the model's internals; attacks via standard API
- **White-box:** Attacker has model weights/configuration knowledge (e.g., self-hosted LLaVA)

Both settings were successfully exploited, making the attack applicable across the full spectrum of commercial and open-source deployments.

### What Data Can the Worm Exfiltrate?

In the demonstrated experiments, the worm extracted:
- Email addresses
- Phone numbers  
- Physical addresses

The OECD.AI incident database entry (citing what the worm *could* do in more capable deployments) also references SSNs, credit card information, and spam/malware deployment — but these represent extended capability claims, not what was demonstrated in the paper's experiments. The paper's own demonstrations were limited to contact information extracted from the 50 authentic academic emails used in the research.

### Naming: Morris II

Named in homage to the 1988 Morris Worm — the first significant internet worm, which crashed approximately 6,000 computers (10% of the internet at the time). Both Morris and Morris II were developed by Cornell-affiliated researchers. The 1988 original exploited UNIX vulnerabilities; Morris II exploits the LLM context window's inability to distinguish instructions from data.

---

## Damage Assessment

### Actual Damage (Production)
- **None.** No production AI email assistant was compromised. No real user data was exfiltrated.

### Demonstrated Damage (Lab)
- Email address, phone number, and physical address exfiltration from 50 real academic emails
- Successful spam propagation across test nodes
- Super-linear propagation rate: ~20 new clients compromised per 1–3 days in controlled testing

### Potential Damage (Near-Miss Assessment)

**Immediate scope (2024 context):** Any company that deployed a RAG-based email assistant using GPT-4 or Gemini Pro was architecturally vulnerable. Google and Microsoft had both been discussing AI email assistant features (Google Workspace AI, Microsoft Copilot for Outlook). Third-party developers building email agents via OpenAI/Google APIs were the primary risk cohort.

**If exploited at scale:**
- Mass exfiltration of contact books across an email network — a single initial infection could propagate across an entire organization's AI assistant ecosystem in days
- Spam campaign infrastructure built from compromised AI assistants, using legitimate email accounts (high deliverability)
- Phishing at scale using context-aware content generated by the compromised assistant

**Quantification challenge:** Unlike ZombAI (AAGF-2026-044), which had a defined user base (GitHub Copilot's 20M users), the vulnerable population here is the set of organizations that deployed RAG-based AI email assistants on GPT-4/Gemini Pro — an unknown quantity in March 2024, likely in the thousands of developer organizations given the early state of AI assistant deployment at that time.

### actual_vs_potential Classification
**`near-miss`** — The vulnerability was demonstrated to work against production-grade model APIs under production-realistic conditions. No production system was compromised, but the gap between lab and production was architectural rather than technical: the attack worked; it just wasn't deployed against real targets.

### potential_damage (frontmatter text suggestion)
"Mass exfiltration of contact information (email addresses, phone numbers, physical addresses) from any RAG-based AI email assistant ecosystem; spam and phishing at organizational or inter-organizational scale via legitimate email accounts compromised by the worm's propagation chain; super-linear spread (~20 new clients per 1–3 days in testing) could cascade across an entire enterprise email network without any user clicking anything."

### intervention (frontmatter text suggestion)
"Research conducted entirely in a controlled lab environment using authors' own systems and emails; researchers voluntarily stopped at PoC demonstration and responsibly disclosed to OpenAI and Google via bug bounty programs before any production deployment; no commercial AI email assistant was publicly available with the exact vulnerable architecture at the time of publication."

---

## Vendor Response

### OpenAI
- **Disclosure:** Researchers submitted findings via OpenAI's bug bounty program
- **Public response:** Not documented in any source reviewed
- **Classification used:** Researchers explicitly framed this as an "architectural design issue" of how developers build GenAI ecosystems, not a vulnerability in OpenAI's API or models. This framing likely informed OpenAI's response (or lack of public response): they cannot patch an architectural choice made by third-party developers.

### Google
- **Disclosure:** Researchers submitted findings via Google's bug bounty program
- **Public response:** Not documented in any source reviewed
- **Same framing applies:** The Gemini Pro API behaved as designed; the vulnerability is in how applications are architectured on top of it.

### Structural implication of the "architectural design" framing
This is not a CVE-class vulnerability: there is no single fix that OpenAI or Google can ship. The vulnerability exists in the design pattern of (1) trusting LLM outputs as instructions + (2) RAG-based persistence + (3) inter-agent connectivity. Operators who build these systems must redesign them. The vendors can (and may have) added guardrails in their system prompts, but any developer building a similar application from scratch would recreate the same vulnerability.

---

## Classification Assessment

### Categories
- **Prompt Injection** (primary) — adversarial prompts injected via email content
- **Agent-to-Agent Propagation** / **Wormable** — the defining novel characteristic
- **Unauthorized Data Access** — contact information exfiltration via the agent
- **Tool Misuse** — the email assistant's send/reply capability weaponized for spam propagation

### Severity
**High** — for the following reasons:
- The vulnerability class is architectural, not implementation-level; every developer who builds this pattern is vulnerable
- Zero-click propagation: no user interaction required beyond receiving an email
- Super-linear propagation rate demonstrated empirically
- Demonstrated against production-grade models (GPT-4, Gemini Pro)

If treating this as strictly a research/PoC with no confirmed production exploitation, some frameworks would rate this Medium. AgentFail's `near-miss` framework keeps it High due to the genuineness of the architectural threat and the production-grade testing conditions.

### agent_type
- `Email Assistant` (primary)
- `RAG-based Agent`

### Relationship to AAGF-2026-044 (ZombAI)

**ComPromptMized is the research predecessor to ZombAI.** Both incidents share:

| Characteristic | ComPromptMized (2024) | ZombAI AAGF-2026-044 (2025) |
|---------------|----------------------|------------------------------|
| Attack vector | Prompt injection via email content | Prompt injection via PR description |
| Propagation mechanism | Worm via AI-to-AI email forwarding | Worm via infected files committed to git |
| Zero-click | Yes (email received and processed automatically) | Partial (developer must ask Copilot to process content) |
| Self-replication | Adversarial self-replicating prompt embedded in output | Copilot embeds payload in new source files |
| Real production systems | No (lab with production APIs) | No (PoC, no confirmed exploitation) |
| Status | PoC / academic research | CVE-2025-53773, CVSS 7.8 HIGH |
| Venue | arXiv → ACM CCS 2025 | Researcher blog → Patch Tuesday |

**Key differences:**
1. ZombAI also includes a **permission escalation** primitive (YOLO mode bootstrapping) absent in ComPromptMized
2. ZombAI has a CVE and a named vendor patch; ComPromptMized has no CVE (it's an architectural class, not an implementation bug)
3. ComPromptMized propagates between AI agents (email assistant to email assistant); ZombAI propagates between developer workstations via the git workflow
4. ComPromptMized is the theoretical/research foundation (2024); ZombAI is the production-class exploitation of the same conceptual lineage (2025)

**Tagging recommendation:** ComPromptMized should be listed as a `related_incident` for ZombAI and vice versa, with the `wormable-ai-agent` cross-incident tag.

### MITRE ATLAS Mapping
- AML.T0051 / AML.T0051.000 — LLM Prompt Injection (direct + indirect)
- AML.T0054 — LLM Jailbreak
- AML.T0085 — Adversarial Input
- AML.T0043 — Craft Adversarial Data

### OWASP LLM Top 10 Mapping
- LLM01:2025 — Prompt Injection (primary)
- LLM02:2025 — Insecure Output Handling (the model's output contains and propagates the malicious prompt)

### OWASP Agentic AI
- ASI01:2026 — Indirect Prompt Injection in Agentic Contexts
- ASI02:2026 — Unsafe Tool Invocation (email send/forward weaponized)

---

## Sources Reviewed

| Source | URL | Credibility | Notes |
|--------|-----|-------------|-------|
| arXiv paper (v1, HTML) | https://arxiv.org/html/2403.02817v1 | High — primary source | Full technical details extracted |
| arXiv abstract (v2, Jan 2025) | https://arxiv.org/abs/2403.02817 | High — primary source | Submission and revision dates confirmed |
| Project website | https://sites.google.com/view/compromptmized | High — researcher-authored | Author affiliations, ACM CCS acceptance, demo links, GitHub |
| GitHub repository | https://github.com/StavC/Here-Comes-the-AI-Worm | High — researcher-authored | Code publicly released, DonkeyRail guardrail included |
| ACM CCS 2025 listing | https://dl.acm.org/doi/10.1145/3719027.3765196 | High — authoritative publication record | Peer review confirmation; 403 on full fetch, existence confirmed via search |
| Schneier on Security | https://www.schneier.com/blog/archives/2024/03/llm-prompt-injection-worm.html | High — respected independent commentator | "Natural extension of prompt injection — neat to see working" |
| OECD.AI Incident Monitor | https://oecd.ai/en/incidents/2024-03-01-7805 | High — authoritative incident classification | "AI Hazard" classification; harm categories confirmed |
| Infosecurity Magazine | https://www.infosecurity-magazine.com/news/worm-created-generative-ai-systems/ | Medium — trade press | Technical overview; confirmed lab-only setting |
| IT Brew | https://www.itbrew.com/stories/2024/03/08/ai-worms-demonstrate-new-kind-of-cyberattack | Medium — trade press | Coverage context and quotations |
| Security Boulevard | https://securityboulevard.com/2024/03/compromptmized-ai-worm-malware-richixbw/ | Medium — trade press | Media coverage scope |
| SentinelOne AI Worms explainer | https://www.sentinelone.com/cybersecurity-101/cybersecurity/ai-worms/ | Medium — vendor commentary | Propagation rate detail (~20 new clients/1-3 days) |
| IBM Think (Morris II) | https://www.ibm.com/think/insights/morris-ii-self-replicating-malware-genai-email-assistants | Medium — vendor commentary | Lab-only confirmation; capability summary |
| PacketWatch blog | https://packetwatch.com/resources/blog/ai-cybersecurity-morris-worm | Low-Medium — vendor blog | Morris/Morris II historical comparison |
| Cyber Magazine | https://cybermagazine.com/news/morris-ii-worm-inside-ais-first-self-replicating-malware | Low-Medium — trade press | Coverage context |
| ResearchGate listing | https://www.researchgate.net/publication/397881340 | Medium — academic record | Confirms author affiliations: Technion, Cornell Tech, TAU, Intuit |

### Not Accessed / Could Not Verify
- Wired original article (blocked)
- ACM CCS full paper text (paywall / 403)
- No Simon Willison blog post specifically on ComPromptMized was found; his "Lethal Trifecta" framework is cited *within* the paper rather than as external commentary on it

---

## Recommended Frontmatter Values

```yaml
id: "AAGF-2026-049"
title: "ComPromptMized — Morris II: First AI Worm Demonstrating Zero-Click Agent-to-Agent Propagation via Adversarial Self-Replicating Prompts"
status: "published"
date_occurred: "2024-03-05"        # arXiv submission date — the first public disclosure of the demonstrated capability
date_discovered: "2024-03-05"      # Same; this is researcher-originated disclosure, not external discovery
date_reported: "2024-03-05"        # Responsible disclosure to OpenAI/Google via bug bounty; public via arXiv same date
date_curated: "2026-05-07"

category: ["Prompt Injection", "Agent-to-Agent Propagation", "Unauthorized Data Access", "Tool Misuse"]
severity: "High"
agent_type: ["Email Assistant", "RAG-based Agent"]
platform: "GPT-4 (ChatGPT 4.0), Gemini Pro, LLaVA via LangChain"
industry: "Cross-industry (GenAI application ecosystem)"

actual_vs_potential: "near-miss"
potential_damage: "Mass exfiltration of contact information (email addresses, phone numbers, physical addresses) from any RAG-based AI email assistant ecosystem; spam and phishing at organizational or inter-organizational scale via legitimate email accounts compromised by the worm's propagation chain; super-linear spread (~20 new clients per 1–3 days demonstrated in testing) could cascade across an entire enterprise email network without any user clicking anything."
intervention: "Research conducted entirely in a controlled lab environment using authors' own systems and emails; researchers voluntarily stopped at PoC demonstration and disclosed to OpenAI and Google via bug bounty programs; no commercial AI email assistant was publicly available at production scale with the exact vulnerable architecture at the time of publication."

related_incidents:
  - "AAGF-2026-044"    # ZombAI — same wormable AI agent propagation lineage
tags:
  - "wormable"
  - "zero-click"
  - "prompt-injection"
  - "rag-poisoning"
  - "adversarial-self-replicating-prompt"
  - "agent-to-agent-propagation"
  - "email-assistant"
  - "morris-ii"
  - "compromptmized"
  - "acm-ccs-2025"
  - "responsible-disclosure"
  - "near-miss"
  - "research-poc"
  - "gemini-pro"
  - "gpt-4"
  - "langchain"
  - "super-linear-propagation"
```

---

## Open Questions for Stage 2 (Pipeline)

1. **Vendor response specifics:** What did OpenAI and Google actually say in response to the bug bounty submission? Were any changes made to their API guardrails? This is unknown from public sources.

2. **Post-publication exploitation:** Has any threat actor demonstrably used the adversarial self-replicating prompt technique in production between March 2024 and now? The researchers' "2–3 year" timeline for in-the-wild appearance is now approaching. Any exploitation evidence would change `actual_vs_potential` from `near-miss` to `actual`.

3. **DonkeyRail adoption:** Was the defense system adopted by any production email assistant builders? This would affect the intervention narrative.

4. **Wired original article:** Full text unavailable; could contain additional vendor quotes or expert commentary.

5. **Google Workspace / Microsoft 365 Copilot response:** Did either company explicitly redesign their AI email assistant architectures in response to this research? Given the paper's acceptance at ACM CCS 2025, this would have been known in the security community for ~18 months before publication.
