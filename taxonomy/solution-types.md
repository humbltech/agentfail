# Solution Types

Each incident report evaluates applicable solutions and rates them on two dimensions:

- **Plausibility** (1–5): How technically feasible is this solution? Could it actually prevent or mitigate this class of incident?
- **Practicality** (1–5): How realistic is it to implement? Accounts for cost, disruption, adoption friction, and organizational factors.

A solution can be highly plausible (technically sound) but low practicality (too expensive/disruptive to implement in reality), or vice versa.

---

## Solution Types

### 1. Architectural Redesign
Fundamentally change how the agent system is designed — its permissions model, tool access, or decision architecture.

**Examples:** Switch from autonomous execution to human-in-the-loop for sensitive operations, redesign tool access to be read-before-write, implement capability separation between agents.

**Best for:** Incidents caused by fundamental design flaws, not just implementation bugs.

---

### 2. Guardrails / Output Filters
Add safety layers that intercept and filter agent outputs or actions before they execute.

**Examples:** Content moderation on agent outputs, action classifiers that flag dangerous operations, regex/semantic filters on tool calls, constitutional AI approaches.

**Best for:** Catching specific classes of harmful outputs. Less effective against novel attack vectors.

---

### 3. Permission Scoping / Least Privilege
Reduce the agent's capabilities to the minimum required for its task. Remove access to tools, APIs, or data it doesn't need.

**Examples:** Read-only file system access for analysis tasks, scoped API tokens that can only do specific operations, sandboxed execution environments, time-limited credentials.

**Best for:** Incidents where the agent had more access than needed. High plausibility, often high practicality.

---

### 4. Human-in-the-Loop (HITL)
Require human approval before the agent takes certain actions, especially irreversible or high-impact ones.

**Examples:** Approval step before any file deletion, confirmation before financial transactions, review queue for outbound communications, two-person rule for infrastructure changes.

**Best for:** High-stakes, irreversible actions. Trade-off: reduces autonomy and throughput.

---

### 5. Monitoring and Detection
Instrument the agent to detect anomalous behavior and alert humans or halt execution.

**Examples:** Anomaly detection on tool usage patterns, rate limiting on sensitive operations, audit logging with alerting, behavioral baselines with drift detection.

**Best for:** Catching incidents as they happen rather than preventing them. Complements prevention rather than replacing it.

---

### 6. Input Validation and Sanitization
Validate and sanitize all inputs to the agent — from users, from tools, from external sources — before processing.

**Examples:** Strip instruction-like content from web-scraped data, validate tool outputs against expected schemas, enforce structured input formats, content-aware parsing.

**Best for:** Prompt injection prevention. Technically sound but difficult to implement comprehensively.

---

### 7. Sandboxing and Isolation
Run agent execution in an isolated environment where it cannot affect systems outside the sandbox.

**Examples:** Containerized execution with no network access, read-only file systems, isolated compute environments, network egress filtering.

**Best for:** Preventing lateral movement and blast radius containment. High plausibility; practicality depends on the use case.

---

### 8. Policy and Governance Controls
Organizational policies, training, and processes that reduce incident likelihood or improve response.

**Examples:** Mandatory security review before deploying agent access to production, user education on agent limitations, incident response playbooks, vendor security assessments.

**Best for:** Addressing human and process factors. Often underrated but highly practical.

---

### 9. Model-Level Controls
Controls applied at the AI model level — system prompt hardening, fine-tuning for safety, constitutional constraints.

**Examples:** Strong system prompt instructions, fine-tuning on safe behavior examples, RLHF for refusal training, jailbreak-resistant model variants.

**Best for:** Defense against jailbreaks and prompt injection at the model layer. Plausibility depends on access to the model.

---

### 10. Cryptographic / Integrity Controls
Using cryptographic techniques to verify the integrity of inputs, outputs, or agent state.

**Examples:** Signed tool outputs, verified prompt chains, tamper-evident audit logs, attestation of agent identity.

**Best for:** Supply chain and trust chain attacks. High plausibility; low current adoption, so practicality varies.

---

## Rating Scale

| Score | Plausibility Meaning | Practicality Meaning |
|-------|---------------------|---------------------|
| 5 | Would definitively prevent/mitigate this incident | Any team could implement this today with reasonable effort |
| 4 | Strong evidence this would help significantly | Requires some investment but clearly feasible |
| 3 | Likely to help but not a complete solution | Moderate effort, some friction or trade-offs |
| 2 | Might help in theory but limited evidence | Difficult, expensive, or requires major changes |
| 1 | Theoretical only, questionable effectiveness | Impractical for most organizations in most scenarios |

---

## How to Use in Reports

For each solution in the Solutions Analysis section:

```
### [Solution Name]
- **Type:** [from taxonomy above]
- **Plausibility:** X/5 — [brief justification]
- **Practicality:** X/5 — [brief justification]
- **How it applies:** [specific to this incident]
- **Limitations:** [why it's not a complete solution]
```
