# Severity Framework

Severity is assessed on **actual impact**, not theoretical potential. If the incident was contained before harm occurred, rate it lower and note it in the report.

---

## Severity Levels

### Critical
**Definition:** Widespread real-world harm, large-scale data breach, significant financial loss, or risk to physical safety.

**Criteria (any one qualifies):**
- Data breach affecting 1,000+ individuals
- Financial loss > $100,000 USD
- Exposure of highly sensitive data (credentials, medical, financial, government)
- Physical safety risk (embodied agents, critical infrastructure)
- Systemic compromise (supply chain affecting many downstream users)
- Public disclosure of private communications at scale

**Response implication:** Urgent industry attention warranted. Likely regulatory or legal consequences.

---

### High
**Definition:** Significant harm to individuals or organizations, meaningful data exposure, or notable financial loss.

**Criteria (any one qualifies):**
- Data breach affecting 10–999 individuals
- Financial loss $10,000–$100,000 USD
- Exposure of sensitive PII (names + contact info + account data)
- Infrastructure damage requiring significant recovery effort
- Operational disruption lasting hours or days
- Breach of trust that damages relationships with customers/users

**Response implication:** Organization must take remedial action. May require regulatory notification depending on jurisdiction.

---

### Medium
**Definition:** Contained harm, limited data exposure, or recoverable damage. Real-world impact but no lasting consequences.

**Criteria:**
- Data exposure affecting < 10 individuals, or only non-sensitive data
- Financial loss < $10,000 USD
- Infrastructure damage that was quickly recovered
- Operational disruption under 1 hour
- Near-miss: conditions were right for serious harm, but it was caught in time

**Response implication:** Issue should be patched and documented. Worth tracking as a pattern indicator.

---

### Low
**Definition:** No measurable real-world harm. Theoretical risk demonstrated, proof-of-concept, or minor annoyance with no lasting impact.

**Criteria:**
- Research demonstration with no production deployment
- Bug reported before exploitation
- Unintended behavior with no harmful output
- Inconvenience without data or financial impact

**Response implication:** Worth documenting for pattern analysis and as a warning signal. Not urgent.

---

## Rating Process

1. **Start with actual impact** — What harm actually occurred? (Not: what could have happened)
2. **Apply worst single criteria** — If any criterion of a higher level is met, use the higher level
3. **Justify in the report** — The severity rating must be explained in the Impact Assessment section
4. **Note containment** — If harm was prevented by luck or quick response, document this — it affects the *lessons learned* even if it reduces severity

---

## Common Mistakes

- **Inflating severity** because an incident *sounds* dramatic — rate on evidence, not narrative
- **Deflating severity** because the victim company minimized it in their disclosure — use independent assessment
- **Ignoring scope** — 10 affected users is High; 10,000 affected users is Critical
- **Confusing potential with actual** — A proof-of-concept is Low even if it demonstrates a Critical-potential vulnerability
