# Framework Mapping Reference

Maps AgentFail's custom taxonomy to four external security frameworks. Use this file when filling in `framework_refs` in an incident report — look up the incident's categories, copy the applicable IDs.

Last updated: 2026-05-03

---

## Frameworks in Use

### MITRE ATLAS v5.6.0
**URL:** https://atlas.mitre.org  
**Data:** https://github.com/mitre-atlas/atlas-data (YAML/JSON, machine-readable)  
**Updated:** April 30, 2026  
**ID format:** `AML.Txxxx` (techniques), `AML.Txxxx.xxx` (subtechniques), `AML.TAxxxx` (tactics)  
**Scope:** AI/ML system attacks — the most widely adopted framework; cross-industry standard  
**Size:** 16 tactics, 113 parent techniques, 57 subtechniques

### OWASP Top 10 for LLM Applications 2025
**URL:** https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/  
**Updated:** November 18, 2024 (v2.0)  
**ID format:** `LLMxx:2025`  
**Scope:** LLM-layer risks; partially applicable to agents (LLM06 Excessive Agency is the most relevant)

### OWASP Top 10 for Agentic Applications 2026
**URL:** https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/  
**Updated:** December 10, 2025  
**ID format:** `ASIxx:2026` (ASI = Agentic Security Issue)  
**Scope:** Exclusively for autonomous and agentic AI systems — most directly applicable framework for this database

### ttps.ai GenAI Attacks Matrix
**URL:** https://ttps.ai / https://github.com/mbrg/genai-attacks  
**Updated:** January 2025 (integrated into MITRE ATLAS)  
**ID format:** `2.X` (tactic), `2.X.Y` (technique)  
**Scope:** Agent/copilot-specific attacks with real-world procedure examples; higher resolution than ATLAS for agentic TTPs

---

## Framework Quick Reference

### MITRE ATLAS Tactics
| ID | Tactic |
|----|--------|
| AML.TA0000 | AI Model Access |
| AML.TA0001 | AI Attack Staging |
| AML.TA0002 | Reconnaissance |
| AML.TA0003 | Resource Development |
| AML.TA0004 | Initial Access |
| AML.TA0005 | Execution |
| AML.TA0006 | Persistence |
| AML.TA0007 | Defense Evasion |
| AML.TA0008 | Discovery |
| AML.TA0009 | Collection |
| AML.TA0010 | Exfiltration |
| AML.TA0011 | Impact |
| AML.TA0012 | Privilege Escalation |
| AML.TA0013 | Credential Access |
| AML.TA0014 | Command and Control |
| AML.TA0015 | Lateral Movement |

### OWASP LLM Top 10 2025
| ID | Name |
|----|------|
| LLM01:2025 | Prompt Injection |
| LLM02:2025 | Sensitive Information Disclosure |
| LLM03:2025 | Supply Chain |
| LLM04:2025 | Data and Model Poisoning |
| LLM05:2025 | Improper Output Handling |
| LLM06:2025 | Excessive Agency |
| LLM07:2025 | System Prompt Leakage |
| LLM08:2025 | Vector and Embedding Weaknesses |
| LLM09:2025 | Misinformation |
| LLM10:2025 | Unbounded Consumption |

### OWASP Agentic Top 10 2026
| ID | Name |
|----|------|
| ASI01:2026 | Agent Goal Hijack |
| ASI02:2026 | Tool Misuse and Exploitation |
| ASI03:2026 | Agent Identity and Privilege Abuse |
| ASI04:2026 | Agentic Supply Chain Compromise |
| ASI05:2026 | Unexpected Code Execution |
| ASI06:2026 | Memory and Context Poisoning |
| ASI07:2026 | Insecure Inter-Agent Communication |
| ASI08:2026 | Cascading Agent Failures |
| ASI09:2026 | Human-Agent Trust Exploitation |
| ASI10:2026 | Rogue Agents |

### ttps.ai Tactics
| ID | Tactic |
|----|--------|
| 2.1 | Reconnaissance |
| 2.2 | Resource Development |
| 2.3 | Initial Access |
| 2.4 | AI Model Access |
| 2.5 | Execution |
| 2.6 | Persistence |
| 2.7 | Privilege Escalation |
| 2.8 | Defense Evasion |
| 2.9 | Credential Access |
| 2.10 | Discovery |
| 2.11 | Lateral Movement |
| 2.12 | Collection |
| 2.13 | AI Attack Staging |
| 2.14 | Command & Control |
| 2.15 | Exfiltration |
| 2.16 | Impact |

---

## AgentFail Category → Framework Mapping

For each AgentFail incident category, the applicable framework IDs are listed below. When an incident is classified under a category, apply all listed IDs unless noted as conditional.

---

### Category 1: Unauthorized Data Access / Exfiltration
Agent accessed, read, or transmitted data it was not authorized to handle.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0024` Exfiltration via AI Inference API | Core exfil technique |
| | `AML.T0024.001` Invert AI Model | If training data reconstructed |
| | `AML.T0057` LLM Data Leakage | If via prompting/output |
| | `AML.T0085` Data from AI Services | If agent collected from connected services |
| | `AML.T0085.001` AI Agent Tools | If agent invoked tools to collect |
| | `AML.T0086` Exfiltration via AI Agent Tool Invocation | If tools used to exfiltrate |
| OWASP LLM | `LLM02:2025` Sensitive Information Disclosure | Primary LLM mapping |
| OWASP Agentic | `ASI02:2026` Tool Misuse and Exploitation | If exfil occurred via tool |
| | `ASI03:2026` Agent Identity and Privilege Abuse | If agent accessed beyond its delegated scope |
| ttps.ai | `2.12` Collection | Data gathering phase |
| | `2.15` Exfiltration | Data extraction phase |

---

### Category 2: Hallucinated Actions
Agent performed actions not requested, not intended, or fabricated based on incorrect reasoning.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0053` AI Agent Tool Invocation | Core: uninstructed tool use |
| | `AML.T0101` Data Destruction via AI Agent Tool Invocation | If destruction resulted |
| | `AML.T0048` External Harms | For the downstream harm class |
| OWASP LLM | `LLM06:2025` Excessive Agency | Primary LLM mapping — autonomy without oversight |
| OWASP Agentic | `ASI02:2026` Tool Misuse and Exploitation | Uninstructed tool invocation |
| | `ASI10:2026` Rogue Agents | Agent acting outside intended objectives |
| ttps.ai | `2.5.4` AI Agent Tool Invocation | Uninstructed execution via tools |
| | `2.16` Impact | If harm resulted |

---

### Category 3: Tool Misuse / Unintended Tool Execution
Agent invoked a tool in an unintended way or context. The tool was real; its use was wrong.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0053` AI Agent Tool Invocation | Primary: agent tool call |
| | `AML.T0101` Data Destruction via AI Agent Tool Invocation | If destruction resulted |
| | `AML.T0086` Exfiltration via AI Agent Tool Invocation | If exfil resulted |
| OWASP LLM | `LLM06:2025` Excessive Agency | Agent had too much tool authority |
| OWASP Agentic | `ASI02:2026` Tool Misuse and Exploitation | Direct mapping |
| ttps.ai | `2.5.4` AI Agent Tool Invocation | Core technique |

---

### Category 4: Prompt Injection / Jailbreak Exploitation
External content hijacked agent behavior, or safety guardrails were bypassed.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0051` LLM Prompt Injection | Parent technique |
| | `AML.T0051.000` Direct Prompt Injection | If attacker controlled user input |
| | `AML.T0051.001` Indirect Prompt Injection | If injected via external content (web, docs, email) |
| | `AML.T0051.002` Triggered Prompt Injection | If triggered by specific condition/event |
| | `AML.T0054` LLM Jailbreak | If safety guardrails were bypassed |
| | `AML.T0080` AI Agent Context Poisoning | If persisted across context window |
| | `AML.T0093` Prompt Infiltration via Public-Facing Application | If via public input surface |
| OWASP LLM | `LLM01:2025` Prompt Injection | Direct mapping |
| OWASP Agentic | `ASI01:2026` Agent Goal Hijack | Hijacked agent objectives |
| ttps.ai | `2.5.5` LLM Prompt Injection | Parent |
| | `2.5.9` Indirect Prompt Injection | Via retrieved content |
| | `2.5.10` Direct Prompt Injection | Via user-facing input |
| | `2.5.8` Triggered Prompt Injection | Conditional activation |

---

### Category 5: Context Poisoning
Agent's memory, RAG, MCP outputs, or system prompt manipulated with malicious/misleading content.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0080` AI Agent Context Poisoning | Core technique |
| | `AML.T0080.000` Memory | If memory store targeted |
| | `AML.T0080.001` Thread | If within-session thread targeted |
| | `AML.T0070` RAG Poisoning | If RAG database poisoned |
| | `AML.T0099` AI Agent Tool Data Poisoning | If tool output data poisoned |
| OWASP LLM | `LLM08:2025` Vector and Embedding Weaknesses | If RAG/vector DB involved |
| OWASP Agentic | `ASI06:2026` Memory and Context Poisoning | Direct mapping |
| ttps.ai | `2.6` Persistence | Context poisoning enables persistence |

---

### Category 6: Autonomous Escalation
Agent exceeded intended scope, permissions, or authority.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0053` AI Agent Tool Invocation | Escalation via tool use |
| | `AML.T0012` Valid Accounts | If escalated by using legitimate (over-scoped) credentials |
| | `AML.T0105` Escape to Host | If escaped sandbox/container |
| OWASP LLM | `LLM06:2025` Excessive Agency | Direct mapping — too much autonomy |
| OWASP Agentic | `ASI03:2026` Agent Identity and Privilege Abuse | Exceeded delegated authority |
| | `ASI10:2026` Rogue Agents | Acting beyond intended objectives |
| ttps.ai | `2.7` Privilege Escalation | Exceeded assigned permissions |

---

### Category 7: Financial Loss
Agent caused unauthorized transactions, billing errors, or economic damage.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0034` Cost Harvesting | If adversarially triggered |
| | `AML.T0034.002` Agentic Resource Consumption | Coerced/runaway agent resource use |
| | `AML.T0029` Denial of AI Service | If service was degraded by cost |
| | `AML.T0048` External Harms | Harm class parent |
| | `AML.T0048.000` Financial Harm | Direct financial harm subtype |
| OWASP LLM | `LLM10:2025` Unbounded Consumption | Uncontrolled resource/cost usage |
| | `LLM06:2025` Excessive Agency | If agent autonomously triggered costs |
| OWASP Agentic | `ASI02:2026` Tool Misuse and Exploitation | If cost generated via tool misuse |
| | `ASI08:2026` Cascading Agent Failures | If cost propagated across systems |
| ttps.ai | `2.16` Impact | Financial harm impact category |

---

### Category 8: Infrastructure Damage
Agent caused damage to computing infrastructure — deletions, corruption, disruption.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0101` Data Destruction via AI Agent Tool Invocation | Core: data/infra destruction via tool |
| | `AML.T0112` Machine Compromise | If system-level compromise resulted |
| | `AML.T0112.000` Local AI Agent | If local agent achieved full compromise |
| | `AML.T0053` AI Agent Tool Invocation | The tool call that enabled destruction |
| | `AML.T0048` External Harms | Harm class parent |
| | `AML.T0048.000` Financial Harm | If financial consequences resulted |
| OWASP LLM | `LLM06:2025` Excessive Agency | Agent had too much destructive authority |
| OWASP Agentic | `ASI02:2026` Tool Misuse and Exploitation | Infrastructure-touching tool misuse |
| | `ASI05:2026` Unexpected Code Execution | If code execution enabled the damage |
| | `ASI10:2026` Rogue Agents | Acting outside intended objectives |
| ttps.ai | `2.16` Impact | Infrastructure destruction impact |
| | `2.5.4` AI Agent Tool Invocation | Tool-based execution |

---

### Category 9: Privacy Violation
Agent exposed, processed, or shared PII without authorization.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0057` LLM Data Leakage | Core: LLM exposes sensitive data |
| | `AML.T0024` Exfiltration via AI Inference API | If PII extracted via inference |
| | `AML.T0086` Exfiltration via AI Agent Tool Invocation | If PII exfiltrated via tools |
| | `AML.T0048` External Harms | Harm class parent |
| | `AML.T0048.003` User Harm | PII exposure harms individual users |
| OWASP LLM | `LLM02:2025` Sensitive Information Disclosure | Direct mapping |
| OWASP Agentic | `ASI03:2026` Agent Identity and Privilege Abuse | Accessed PII beyond delegated scope |
| ttps.ai | `2.12` Collection | Data collection phase |
| | `2.15` Exfiltration | Data extraction/disclosure phase |

---

### Category 10: Supply Chain Compromise
Plugin, tool, MCP server, package, or dependency used by the agent was malicious or compromised.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0010` AI Supply Chain Compromise | Parent technique |
| | `AML.T0010.005` AI Agent Tool | Agent tool supply chain vector |
| | `AML.T0104` Publish Poisoned AI Agent Tool | Attacker published malicious tool |
| | `AML.T0110` AI Agent Tool Poisoning | Persistence via tool poisoning |
| | `AML.T0109` AI Supply Chain Rug Pull | Legitimate-then-malicious update |
| | `AML.T0111` AI Supply Chain Reputation Inflation | Fake credibility building |
| | `AML.T0019` Publish Poisoned Datasets | If training data vector |
| | `AML.T0058` Publish Poisoned Models | If model supply chain |
| OWASP LLM | `LLM03:2025` Supply Chain | Direct mapping |
| OWASP Agentic | `ASI04:2026` Agentic Supply Chain Compromise | Direct agentic mapping |
| ttps.ai | `2.3` Initial Access | Supply chain as initial access vector |

---

### Category 11: Social Engineering via AI
AI agent used to deceive, manipulate, or impersonate.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0073` Impersonation | Direct: AI impersonating trusted entity |
| | `AML.T0052` Phishing | AI-assisted phishing campaigns |
| | `AML.T0052.001` Deepfake-Assisted Phishing | Deepfake used in phishing |
| | `AML.T0088` Generate Deepfakes | Synthetic media for deception |
| OWASP LLM | `LLM09:2025` Misinformation | AI-generated false/deceptive content |
| OWASP Agentic | `ASI09:2026` Human-Agent Trust Exploitation | Exploits human over-reliance on AI |
| ttps.ai | `2.8` Defense Evasion | Impersonation as evasion |

---

### Category 12: Model / Training Data Attack
Underlying model behavior manipulated through training data, fine-tuning, or model weights.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0020` Poison Training Data | Core: training data poisoning |
| | `AML.T0018` Manipulate AI Model | Direct model manipulation |
| | `AML.T0018.000` Poison AI Model | Weight manipulation |
| | `AML.T0018.001` Modify AI Model Architecture | Architecture modification |
| | `AML.T0018.002` Embed Malware | Malware in model file |
| | `AML.T0019` Publish Poisoned Datasets | Public dataset poisoning |
| | `AML.T0058` Publish Poisoned Models | Public model poisoning |
| OWASP LLM | `LLM04:2025` Data and Model Poisoning | Direct mapping |
| OWASP Agentic | `ASI04:2026` Agentic Supply Chain Compromise | If model is part of agent supply chain |
| ttps.ai | `2.6` Persistence | Poisoning as persistence mechanism |
| | `2.2` Resource Development | Developing poisoned artifacts |

---

### Category 13: Denial of Service / Resource Exhaustion
Agent caused resource exhaustion — runaway loops, excessive API calls, compute saturation.

| Framework | IDs | Notes |
|-----------|-----|-------|
| MITRE ATLAS | `AML.T0029` Denial of AI Service | Core DoS technique |
| | `AML.T0034` Cost Harvesting | Adversarial resource depletion |
| | `AML.T0034.000` Excessive Queries | Query flooding |
| | `AML.T0034.001` Resource-Intensive Queries | Compute-heavy crafted inputs |
| | `AML.T0034.002` Agentic Resource Consumption | Agent-driven resource exhaustion |
| | `AML.T0046` Spamming AI System with Chaff Data | False detection flooding |
| OWASP LLM | `LLM10:2025` Unbounded Consumption | Direct mapping |
| OWASP Agentic | `ASI08:2026` Cascading Agent Failures | Failure propagation across systems |
| ttps.ai | `2.16` Impact | DoS/resource exhaustion impact |

---

## Credential-Related Techniques (Cross-Category)

When an incident involves an agent finding or using credentials (regardless of primary category), add these:

| Framework | IDs | When to Add |
|-----------|-----|-------------|
| MITRE ATLAS | `AML.T0055` Unsecured Credentials | Agent found credentials in plaintext file |
| | `AML.T0083` Credentials from AI Agent Configuration | Agent found credentials in config/project files |
| | `AML.T0098` AI Agent Tool Credential Harvesting | Agent harvested credentials via tool output |
| | `AML.T0082` RAG Credential Harvesting | Credentials retrieved via RAG lookup |
| | `AML.T0012` Valid Accounts | Agent used a legitimate (possibly over-scoped) credential to gain access |
| ttps.ai | `2.9` Credential Access | Any credential discovery or misuse |

---

## Framework Mapping Notes

**When ATLAS is ambiguous:** ATLAS was designed for adversarial attacks. For incidents where the agent itself failed (no external attacker), ATLAS techniques describe *what the failure looked like* from a threat perspective, not that an adversary caused it. Note this in `researcher_notes`.

**OWASP LLM vs. OWASP Agentic:** Use both. They operate at different layers. LLM-level (LLM06 Excessive Agency) captures the model behavior; agent-level (ASI02 Tool Misuse) captures the system behavior. They're complementary, not alternatives.

**ttps.ai resolution:** ttps.ai provides finer-grained subtechnique IDs (e.g., `2.5.4` vs just `2.5`). Use the most specific ID that applies. If only the tactic applies and no specific technique fits, use the tactic ID only.

**Frameworks NOT included in `framework_refs` (but noted here for completeness):**
- **OpenA2A Agent Threat Matrix** (March 2026) — too new, limited adoption; the `SOUL-*` and `MCP-EXPLOIT` class names are useful for incident narrative but not yet standard enough for indexing
- **NIST AI 600-1** — risk governance framework, not attack taxonomy; no per-incident IDs
- **OWASP Agentic Skills Top 10 (AST)** — use for incidents specifically involving poisoned/malicious MCP tools or agent plugins; IDs: `AST01`–`AST10`
