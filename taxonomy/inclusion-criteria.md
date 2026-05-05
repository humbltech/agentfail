# Incident Inclusion Criteria

This document defines what qualifies for inclusion in AgentFail and at what publication tier.

---

## Publication Tiers

### Tier 1: Publish
Full incident report, publicly visible on the website.

### Tier 2: Document Only
Full incident report written and stored in `incidents/`, but flagged `visibility: internal` in frontmatter. Not displayed on the public website. May be promoted to Tier 1 later.

### Tier 3: Exclude
Not documented. Does not enter the database.

---

## Tier 1 — Publish

An incident qualifies for publication when **all four** of these conditions are met:

### 1. Autonomous agent involvement
An AI agent acted autonomously — making decisions, executing tools, calling APIs, or taking actions without direct human instruction for that specific action.

**Qualifies:**
- Coding agent deletes production database while fixing a bug
- AI agent executes unauthorized financial transaction
- MCP tool-using agent exfiltrates data via prompt injection
- Agent escalates its own permissions without authorization

**Does not qualify:**
- Chatbot gives wrong answer (no autonomous action taken)
- User copies AI output and pastes it somewhere harmful (human action)
- AI model produces biased output (no agent, no action)

### 2. Real-world production deployment
The incident occurred in a production system, commercial product, or real-world deployment — not a research lab, CTF challenge, or controlled experiment.

**Qualifies:**
- Incident in Cursor, Claude Code, Devin, Replit, GitHub Copilot in real use
- Attack against a deployed MCP server with real users
- Exploit of a production AI-powered service

**Does not qualify:**
- Academic paper demonstrating a theoretical attack
- CTF challenge or red-team exercise
- Proof-of-concept with no confirmed production impact

### 3. Meaningful impact
The incident caused real, measurable harm — not a minor inconvenience or amusing misbehavior.

**Impact types that qualify:**
- **Financial loss** — Unauthorized charges, billing exploits, transaction fraud (any amount if systemic; >$100 if individual)
- **Data exposure** — PII, credentials, private code, confidential documents accessed or exfiltrated
- **Infrastructure damage** — Deleted databases, corrupted systems, service outages
- **Security compromise** — Unauthorized access, privilege escalation, malware installation
- **Supply chain impact** — Compromised packages, tools, or extensions affecting downstream users
- **Operational disruption** — Systems taken offline, workflows broken, recovery required

**Does not qualify:**
- "Agent did X when I asked it to do Y" with no real consequence
- Funny or surprising agent behavior with no harm
- Agent took slightly longer or used more tokens than expected
- Agent produced wrong output that was caught before any action

### 4. Verifiable
At least one credible source documents the incident: news article, GitHub issue with details, vendor disclosure, CVE, firsthand account with technical specifics, or regulatory filing.

**Does not qualify:**
- Unverified social media claim with no technical details
- "I heard that..." with no source
- Vendor marketing FUD without a specific incident

---

## Tier 2 — Document Only (Not Published)

Incidents that are real and significant but fall outside AgentFail's core digital/software agent focus. These are documented for internal intelligence and may be promoted to Tier 1 if the scope expands.

### Categories for Tier 2:

**Physical world / embodied agents**
- Autonomous vehicle incidents (Waymo, Cruise, etc.)
- Robotics failures
- Drone incidents
- Any incident where the primary harm is physical, not digital

**State-actor / intentional misuse**
- Nation-state actors using AI agents as offensive weapons
- AI agents deliberately deployed for cyberattacks, espionage, or fraud
- The agent didn't fail — it was used as intended by a malicious operator

**Platform data breaches (non-agent vector)**
- AI platform gets hacked and user data is exposed
- The breach targeted the platform infrastructure, not the AI agent
- The AI agent was not the attack vector or the autonomous actor

---

## Tier 3 — Exclude Entirely

These do not enter the database in any form:

- **Chatbot hallucinations without action** — AI said something wrong but took no autonomous action (Air Canada chatbot, hallucinated legal citations)
- **Human error using AI tools** — Human pasted sensitive data into ChatGPT, human deployed AI-generated code without review
- **Research/PoC without production impact** — Academic demonstrations, red-team exercises, theoretical attacks not confirmed in the wild
- **Minor misbehavior** — Agent was slightly wrong, slow, or inefficient with no real consequence
- **Broad AI harms** — Bias, discrimination, surveillance, deepfakes (covered by AIID, AIAAIC, not AgentFail's scope)
- **Duplicate** — Same event already documented under a different source

---

## Edge Case Decision Framework

When an incident doesn't clearly fit a tier, ask these questions in order:

1. **Did an AI agent act autonomously?** No → Tier 3 (exclude)
2. **Was it a production system?** No → Tier 3 (exclude)
3. **Was there meaningful real-world impact?** No → Tier 3 (exclude)
4. **Is the primary harm digital/software?** No → Tier 2 (document only)
5. **Was the agent the failing/exploited component (vs. intentional weapon)?** No → Tier 2 (document only)
6. **Is it verifiable?** No → Tier 3 (exclude)
7. If all yes → **Tier 1 (publish)**

---

## Frontmatter Fields for Tier Control

```yaml
# In incident frontmatter:
visibility: public    # Tier 1 — published on website
visibility: internal  # Tier 2 — documented, not published
# Tier 3 incidents are never written as files
```

---

## Updating This Document

If a pattern of edge cases emerges that this framework doesn't handle well, update this document. The goal is clear, consistent triage — not rigid rules that force bad decisions.
