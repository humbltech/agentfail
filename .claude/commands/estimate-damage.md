# /estimate-damage

Estimate damage quantification for one or all published AgentFail incidents.

**Usage:**
- `/estimate-damage AAGF-2026-021` — single incident
- `/estimate-damage --all` — all published incidents without `human_override: true`

Arguments: one incident ID (e.g. `AAGF-2026-021`) or `--all`

---

## Your Task

Populate the `damage_estimate:` block in each incident's YAML frontmatter. This block captures three distinct damage layers:

1. **Confirmed loss** — what actually happened and was documented (mirrors `financial_impact_usd`)
2. **Recovery cost** — what it cost to contain or fix the damage (mirrors `recovery_cost_usd`)
3. **Averted damage** — what would have happened if the incident had run to completion or if recovery had not been possible

The **composite** figure is all three summed. This is the roll-up number shown on the homepage.

---

## Benchmark Table v1 (2026-05-06)

Use these industry benchmarks for estimation. Always cite which one you used in `benchmark_source`.

| Category | Per-Unit Cost | Source |
|----------|--------------|--------|
| Developer machine full remediation | $10,000/machine | SANS 2024 IR Report |
| Credential rotation (per credential type) | $350/credential | Industry median |
| Per-record data breach (general) | $165/record | IBM 2024 Cost of Data Breach |
| Per-record data breach (healthcare) | $408/record | IBM 2024 CODB (healthcare premium) |
| Developer time lost | $150/hour | US BLS + 30% benefits, senior dev |
| E-commerce downtime (Amazon-scale) | $75,000/minute | Amazon public filings est. |
| E-commerce downtime (mid-market SaaS) | $5,000/minute | Gartner 2023 estimate |
| Supply chain downstream multiplier | 2–5× direct | CISA supply chain guidance |
| Unauthorized purchase (consumer) | $50–500/incident | FTC median fraud report |
| Enterprise email/collaboration breach | $1.5M/org | IBM CODB enterprise average |
| Source code exfiltration (per repo) | $250,000 | Ponemon 2023 IP theft study |

---

## Probability Weight Table

Near-miss and partial incidents require probability weighting — the averted damage only materializes if an attacker actually exploits the vulnerability. Use this table:

| Exploitation Evidence | Weight Range | Pick From |
|----------------------|-------------|-----------|
| No PoC, purely theoretical | 0.01–0.05 | Lower end for complex attack chains |
| PoC exists, no wild exploitation confirmed | 0.05–0.15 | Higher if PoC is weaponized/automated |
| PoC + supply chain distribution vector | 0.10–0.30 | Higher if active package downloads |
| Confirmed partial exploitation (some victims) | 0.30–0.60 | Higher if scale is unknown |
| Active exploitation confirmed at scale | 0.60–1.0 | Use 1.0 only if all exposed users affected |

For `actual_vs_potential: "actual"` incidents: `probability_weight: 1.0` — it happened.

---

## Decision Tree

### Step 1: Determine confidence level

- `actual_vs_potential == "actual"` AND `financial_impact_usd` is a number → `confidence: "cited"`
- `actual_vs_potential == "actual"` AND `financial_impact_usd` is null → `confidence: "calculated"` (derive from headline_stat, affected_parties, systems_affected)
- `actual_vs_potential == "near-miss"` or `"partial"` → `confidence: "estimated"`
- Any case requiring >2 stacked assumptions → auto-downgrade to `confidence: "order-of-magnitude"`

### Step 2: Fill confirmed_loss_usd and recovery_cost_usd

- `confirmed_loss_usd` = same as `financial_impact_usd` (copy the value, or estimate it if null and it's an "actual" incident)
- `recovery_cost_usd` = same as existing `recovery_cost_usd` field, OR estimate from `recovery_labor_hours × $150/hr` if available

### Step 3: Calculate averted_damage_usd

For `actual_vs_potential == "actual"`:
- `averted_damage_usd` = null (damage materialized; averted = 0)
- Exception: if recovery was costly (recovery_cost_usd > 0), that's captured in the recovery layer

For `actual_vs_potential == "near-miss"` or `"partial"`:
- Parse `potential_damage` text to identify the primary damage category
- Match to the benchmark table
- Identify `unit_count` from `affected_parties.count` (or infer from scale: individual=1, team=10, organization=500, widespread=infer from platform context)
- Formula: `averted_damage_usd = unit_count × per_unit_cost × multiplier × probability_weight`
- Set `averted_range_low = unit_count × per_unit_cost × low_probability`
- Set `averted_range_high = unit_count × per_unit_cost × high_probability` (no multiplier for range high — shows raw ceiling)

### Step 4: Calculate composite_damage_usd

```
composite_damage_usd = (confirmed_loss_usd ?? 0) + (recovery_cost_usd ?? 0) + (averted_damage_usd ?? 0)
```

If all three are null → composite is null.

### Step 5: Write methodology

- `methodology`: one-line formula with actual numbers, e.g.:
  `"964K users × $10K/machine × 1% exploitation rate = $96.4M"`
- `methodology_detail`: fill all sub-fields with the numbers used
- `estimation_date`: today's date (2026-05-06)

---

## Absurdity Guardrails

1. `averted_damage_usd` cannot exceed $50,000,000,000 ($50B) — the nation-state attack ceiling
2. If your estimate exceeds $1B, add a note in `notes` explaining the reasoning and flag for human review
3. If you need >2 stacked assumptions, downgrade `confidence` to `"order-of-magnitude"`
4. If `affected_parties.count` is null AND scale is "widespread" AND platform is unknown → infer 50,000 as a conservative base (not 1M)
5. When uncertain between two probability weights, use the lower bound
6. Supply chain multiplier max: 5× (use only when downstream propagation is explicitly documented)

---

## Per-Incident Examples

**AAGF-2026-001** (actual, $6,000 cited):
```yaml
damage_estimate:
  confirmed_loss_usd: 6000
  recovery_cost_usd: null
  averted_damage_usd: null
  composite_damage_usd: 6000
  confidence: "cited"
  probability_weight: 1.0
  methodology: "$6,000 direct API billing loss — cited in source reporting"
  methodology_detail:
    per_unit_cost_usd: null
    unit_count: null
    unit_type: ""
    multiplier: null
    benchmark_source: "Direct citation"
  estimation_date: "2026-05-06"
  human_override: false
  notes: ""
```

**AAGF-2026-021** (near-miss, 964K devs, wiper prompt):
```yaml
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: 96400000   # 964K × $10K/machine × 1% exploitation
  averted_range_low: 9640000     # × 0.1% (low probability)
  averted_range_high: 9640000000 # 964K × $10K × 100% (uncapped ceiling, for reference)
  composite_damage_usd: 96400000
  confidence: "estimated"
  probability_weight: 0.01
  methodology: "964K extension installs × $10K/machine remediation × 1% exploitation probability"
  methodology_detail:
    per_unit_cost_usd: 10000
    unit_count: 964000
    unit_type: "machine"
    multiplier: null
    benchmark_source: "SANS 2024 IR Report"
  estimation_date: "2026-05-06"
  human_override: false
  notes: "Wiper prompt contained syntax error — damage was averted by accident. PoC did not require user interaction beyond --trust-all-tools flag. Probability 1% is conservative given the syntax error failure."
```

---

## Output Format

For each incident processed, output:

```
AAGF-2026-NNN: [title]
  confirmed_loss_usd:   $X
  recovery_cost_usd:    $X
  averted_damage_usd:   $X (probability: X%)
  composite_damage_usd: $X
  confidence: [level]
  methodology: [one-liner]
```

After all incidents (if `--all`), output a summary table:

```
| ID           | Confirmed | Recovery | Averted | Composite | Confidence |
|--------------|-----------|----------|---------|-----------|------------|
| AAGF-2026-001| $6,000    | —        | —       | $6,000    | cited      |
| AAGF-2026-008| —         | —        | $125M   | $125M     | estimated  |
| ...                                                                    |
| TOTALS       | $8,889    | $X       | $XXM    | $XXM      |            |
```

---

## Processing Rules

1. Skip any incident where `damage_estimate.human_override: true`
2. Skip TEMPLATE.md
3. Only process `status: "published"` incidents
4. Write the updated `damage_estimate:` block directly into each incident's YAML frontmatter, replacing the existing block (or inserting after the `vendor_response_time` line if no block exists yet)
5. Preserve all other frontmatter fields exactly — only modify the `damage_estimate:` block
6. Use the incident's existing `financial_impact_usd` and `recovery_cost_usd` values — do not change those fields

---

## Important Notes

- This is a quantification task, not a research task. Do not fetch URLs or search for new information. Work only from the existing frontmatter and markdown body.
- Your estimates will be marked with confidence badges in the UI. Users will see the methodology. Be honest about assumptions.
- When recovery was possible (e.g., database restored from backup), still estimate the "if recovery had failed" figure as `averted_damage_usd` — this captures what the incident COULD have cost without the safety net.
- For incidents where actual damage happened AND recovery was partial/full, `averted_damage_usd` represents the additional damage that would have occurred without recovery efforts (i.e., total potential minus confirmed loss).
