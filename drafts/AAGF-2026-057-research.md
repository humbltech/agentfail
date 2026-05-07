# AAGF-2026-057 Research: Windsurf Zero-Click MCP Prompt Injection RCE (CVE-2026-30615)

## Source Inventory

| # | Source | URL | Date Accessed |
|---|--------|-----|---------------|
| S1 | OX Security — MCP Supply Chain Advisory (full technical advisory) | https://www.ox.security/blog/mcp-supply-chain-advisory-rce-vulnerabilities-across-the-ai-ecosystem/ | 2026-05-07 |
| S2 | NVD CVE Record | https://nvd.nist.gov/vuln/detail/CVE-2026-30615 | 2026-05-07 |
| S3 | PolicyLayer — Windsurf Zero-Click MCP RCE incident writeup | https://policylayer.com/mcp-incidents/windsurf-zero-click-mcp-rce-cve-2026-30615 | 2026-05-07 |
| S4 | The Hacker News — Anthropic MCP Design Vulnerability | https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html | 2026-05-07 |
| S5 | SecurityWeek — By-Design Flaw in MCP | https://www.securityweek.com/by-design-flaw-in-mcp-could-enable-widespread-ai-supply-chain-attacks/ | 2026-05-07 |
| S6 | GitHub Advisory GHSA-wj2m-jvpr-64cq | https://github.com/advisories/GHSA-wj2m-jvpr-64cq | 2026-05-07 |
| S7 | SentinelOne Vulnerability DB | https://www.sentinelone.com/vulnerability-database/cve-2026-30615/ | 2026-05-07 |
| S8 | Cloud Security Alliance — Research Note | https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-by-design-rce-ox-security-20260420-csa/ | 2026-05-07 |
| S9 | BackBox / Wired coverage | https://news.backbox.org/2026/05/01/200000-mcp-servers-expose-a-command-execution-flaw-that-anthropic-calls-a-feature/ | 2026-05-07 |
| S10 | OX Security — "Mother of All AI Supply Chains" (broader advisory) | https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/ | 2026-05-07 |
| S11 | Windsurf Changelog | https://windsurf.com/changelog | 2026-05-07 |
| S12 | CISA Known Exploited Vulnerabilities Catalog | https://www.cisa.gov/known-exploited-vulnerabilities-catalog | 2026-05-07 |

---

## Source Bias Assessment

**OX Security (S1, S10) is the disclosing researcher.** Four-person team (Moshe Siman Tov Bustan, Mustafa Naamnih, Nir Zadok, Roni Bar). All primary technical claims about the zero-click mechanism, the comparative IDE testing, and the "six live production platforms" originate from OX Security. Commercial security company with clear interest in high-profile disclosure. The technical claims are independently corroborated by CSA's separate analysis (S8) and NVD assignment (S2), but quantitative claims (200K servers, platform execution specifics) should be treated as OX-originated and unverified by third parties.

**NVD (S2) is authoritative for CVSS and description.** Published April 15, 2026. Notably marked "Not scheduled for NVD enrichment efforts due to resource constraints." The 8.0 CVSS score and CWE-77 classification are from CISA-ADP (not NVD independent assessment). NVD has not independently reviewed the score.

**PolicyLayer (S3) is technically focused and MCP-specialist.** Best single source for CVE-2026-30615 specifics. Content is consistent with OX Security's findings but appears to include independent editorial analysis. No obvious commercial interest in amplifying the finding. Treated as Medium-High credibility.

**GitHub Advisory (S6) is ground-truth for vulnerability metadata** (GHSA-wj2m-jvpr-64cq). Published April 15, 2026. Confirms affected version is Windsurf 1.9544.26, CVSS 8.0. Lists patched version as "Unknown" — confirming no patch was formally documented in the advisory database as of research date.

**The Hacker News / SecurityWeek (S4, S5)** are derivative secondary sources. Both draw from OX Security's advisory with no independent technical investigation. Treat as trade press amplification, not primary evidence.

**Cloud Security Alliance (S8)** provides independent third-party validation of the broader MCP design flaw. Does not focus specifically on CVE-2026-30615 but confirms the zero-click distinction for Windsurf within the broader advisory context.

**Windsurf Changelog (S11):** Fetched directly. Does NOT contain a specific security advisory for CVE-2026-30615 or any mention of the mcp.json overwrite fix. The changelog shows MCP-related bug fixes (authentication issues, server bugs) in April-May 2026 versions, but no security patch attributed to CVE-2026-30615.

**CISA KEV (S12):** CVE-2026-30615 does NOT appear in the CISA Known Exploited Vulnerabilities catalog as of May 7, 2026. (Note: related CVE-2026-40933 for Flowise is in the KEV catalog — confirming OX Security's broader MCP advisory has CISA-recognized exploitation, but Windsurf specifically has not been confirmed exploited in the wild by CISA.)

---

## Key Facts (with source attribution)

### Dates

- **date_occurred:** 2026-04-15 — This is the public disclosure date, which is also the first confirmed exploitable date in the public record. The vulnerability existed in production Windsurf 1.9544.26 prior to this date, but the OX Security advisory does not specify when version 1.9544.26 was released or when the specific zero-click behavior was introduced. [S1, S2]
- **date_discovered:** Approximately 2026-01 to 2026-03 (estimated). OX Security began MCP research in November 2025 and filed first specific vulnerability to LangFlow on January 11, 2026. The advisory catalogues the IDE family (Family 3) alongside the broader advisory, suggesting the Windsurf zero-click was discovered during the same research window. No specific discovery date for CVE-2026-30615 is publicly disclosed. [S1, S10]
- **date_reported:** 2026-04-15 — OX Security published the full advisory; CVE assigned and NVD published same day. [S1, S2]
- **date_patched:** Ambiguous. PolicyLayer states "Post-1.9544.26 versions patched the zero-click vector" (S3). However, the GitHub Advisory (S6) lists patched version as "Unknown." Windsurf's public changelog (S11) does not include a security advisory for this CVE. As of May 1, 2026, secondary sources report Windsurf "remains in reported state" — suggesting no confirmed patch as of that date. As of May 7, 2026 (research date), patch status is unconfirmed. [S3, S6, S9, S11]

**Timeline reconstruction:**
- 2025-11: OX Security begins MCP protocol security research
- 2026-01-11: First specific disclosure to LangFlow; Anthropic contacted
- 2026-01 (approx, 9 days post-contact): Anthropic updates SECURITY.md; declines architectural fix
- 2026-04-15: Full advisory published; CVE-2026-30615 assigned; Windsurf 1.9544.26 identified as zero-click
- 2026-04-15 to 2026-04-27: NVD publishes and last-modifies the CVE record
- 2026-05-01: Secondary sources confirm Windsurf "remains in reported/unpatched state"
- 2026-05-07 (research date): No Codeium security advisory found; no confirmed patch in official changelog

---

### Technical Details

**Vulnerability class within OX Security's taxonomy:** Family 3 (Zero-Click Prompt Injection) — the most severe of four exploitation families documented in the broader MCP advisory. [S1, S3]

**Affected product:** Windsurf IDE version 1.9544.26. Developed by Codeium. [S2, S6]

**CVE ID:** CVE-2026-30615 | **GHSA:** GHSA-wj2m-jvpr-64cq | **CVSS v3.1:** 8.0 (HIGH) | **CWE:** CWE-77 (Command Injection) [S2, S6]

**CVSS Vector:** `CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:L/I:H/A:H` [S2]

**EPSS Score:** 0.059% (18th percentile) — low probability of exploitation, likely reflecting that specific PoC public availability was limited at time of scoring. [S6]

#### Attack Chain (Step-by-Step)

1. **Delivery:** Attacker creates or controls HTML content that Windsurf will render during normal IDE operation. Three documented delivery vectors: (a) a crafted web page the IDE browses, (b) a malicious README.md in a cloned repository, (c) a poisoned tool description returned by a remote MCP server. [S3, S4]

2. **Injection:** The HTML content embeds prompt injection payloads — instructions formatted as natural language or structured commands directed at the underlying AI model. Because Windsurf 1.9544.26 processes this HTML without adequate sanitization, the injected instructions are treated as authoritative. [S3, S7]

3. **Config overwrite:** The injected instructions cause Windsurf to silently overwrite the local `mcp.json` configuration file — the file that defines which MCP STDIO servers the IDE will spawn. The attacker's payload registers an attacker-controlled binary as a new MCP STDIO server in the configuration. [S1, S3]

4. **Execution:** When Windsurf's MCP SDK initializes (which occurs automatically on IDE load), it reads `mcp.json` and spawns the registered server using the STDIO transport. Because MCP's STDIO transport executes commands unconditionally before validation (the "execute-first, validate-never" design documented in AAGF-2026-022), the attacker-controlled binary runs immediately. [S1, S3]

5. **No user interaction:** No approval dialog, no confirmation prompt, no warning in the developer toolchain appears at any stage. The entire chain completes during normal IDE operation. [S3]

**Root cause (implementation layer):** Insufficient input validation and sanitization in Windsurf's HTML content processing pipeline — specifically, the pipeline that feeds rendered HTML content into the model's instruction context. [S7]

**Root cause (protocol layer):** MCP STDIO's unconditional command execution design (documented as the core flaw in AAGF-2026-022). Without this protocol-level design decision, even a successful `mcp.json` overwrite would not automatically execute the registered binary.

**This is a two-layer vulnerability:** The Windsurf-specific flaw (HTML → mcp.json overwrite without sanitization) enables the injection; the MCP protocol design flaw (mcp.json entries execute unconditionally) enables the RCE. Fixing only the Windsurf layer removes the zero-click path but leaves any user who can be socially engineered into one confirmation click still vulnerable via the broader MCP protocol flaw.

#### Why Windsurf Was Zero-Click — Comparative IDE Analysis

OX Security tested four IDE platforms. Results:

| Platform | Interaction Required | CVE Filed |
|----------|---------------------|-----------|
| **Windsurf 1.9544.26** | Zero clicks — automatic on IDE load | CVE-2026-30615 |
| **Cursor** | Some user involvement required | No CVE filed (declined by vendor) |
| **Claude Code** | Some user involvement required | No CVE filed (declined by vendor) |
| **Gemini-CLI** | Some user involvement required | No CVE filed (declined by vendor) |

[S3, S4]

Google, Microsoft, and Anthropic declined CVE filing for their respective tools, arguing that "explicit user permission is required to modify the relevant files" in those platforms. The implication: Windsurf 1.9544.26 uniquely allowed the `mcp.json` modification to proceed and trigger execution without reaching any permission gate. [S3]

**What specifically made Windsurf zero-click vs. others:** The exact technical difference in implementation is not publicly documented in granular form. OX Security's description indicates that in other IDEs, the attack chain requires at least one step of user action to complete (e.g., approving a file modification, confirming a tool execution, or clicking through a permission prompt). In Windsurf 1.9544.26, the HTML rendering pipeline fed injected instructions directly into a context path that modified `mcp.json` and triggered STDIO initialization without surfacing any intermediate approval gates. The specific code path has not been published. [S3]

---

### The Six Production Platforms

OX Security states they "confirmed arbitrary command execution on six live production platforms with paying customers." [S1, S10]

**What is confirmed by sources:**
- LiteLLM — explicitly named (CVE-2026-30623) [S4]
- LangChain-Chatchat — explicitly named (CVE-2026-30617) [S4]
- LangFlow (IBM/DataStax) — explicitly named (CVE-2026-40933) [S4]
- Flowise — explicitly named (CVE-2026-40933) [S4]
- Windsurf — explicitly named (CVE-2026-30615) [S2]
- One additional platform — unnamed in all sources reviewed [S8]

**Caveat:** The "six live production platforms" claim is OX Security's own characterization. The specific platforms have not been independently verified by third parties. The CSA research note (S8) states they "demonstrated proof-of-concept exploitation on six live production platforms" but does not name all six. No source specifies what commands were executed on each platform — the advisory implies credential access, API key retrieval, and command execution without providing specific payload details for each platform.

**Inference:** The "six platforms" likely refers to six of the downstream implementations listed in the broader advisory (LiteLLM, LangChain-Chatchat, LangFlow, Flowise, Windsurf, and one of: Agent Zero, Bisheng, DocsGPT, GPT Researcher, Fay Framework, Upsonic, or LettaAI). However, Windsurf is an IDE/local attack vector, not a production server — it is possible the six platform count refers only to server-side implementations, making Windsurf a separate demonstration category.

---

### Impact Assessment

**User population:** Number of Windsurf users affected is not stated in any source. Windsurf is a widely-used AI IDE; Codeium (the developer) has not disclosed user counts in the context of this CVE.

**In-the-wild exploitation:** Not confirmed. No source documents actual exploitation of CVE-2026-30615 beyond OX Security's controlled proof-of-concept demonstration. CISA has not added CVE-2026-30615 to the KEV catalog (though CVE-2026-40933 / Flowise from the same advisory is in KEV). [S12]

**Practical attack scenario:** An attacker must deliver malicious HTML content to a Windsurf user. The documented delivery vectors are:
1. **Repository poisoning:** Attacker contributes or controls a repository that a developer clones. The README.md or other project documentation contains the injection payload. When Windsurf opens the project and renders the content, the attack executes.
2. **Web page:** Attacker controls a web page (phishing, supply chain, malicious ad) that the developer views within or adjacent to their Windsurf session.
3. **MCP tool description poisoning:** If the developer is already using a compromised or malicious remote MCP server, the server's tool descriptions serve as the injection vector.

The most realistic high-volume attack vector is repository poisoning — developers routinely clone untrusted repositories for evaluation. This requires no social engineering beyond the developer's normal workflow.

**Severity of impact post-exploitation:** Full arbitrary command execution with the privileges of the running Windsurf process — typically the developer's user account. This means access to: all files on the developer's machine, environment variables (API keys, credentials), SSH keys, `.env` files, source code, and anything the developer has filesystem access to. In a CI/CD context, developer machine compromise can propagate to build pipelines.

---

### Vendor Response

**Codeium (Windsurf developer):** No public security advisory found as of May 7, 2026. Windsurf's official changelog does not contain a CVE-2026-30615 entry or describe the mcp.json overwrite fix. The patch status stated in secondary sources ("Post-1.9544.26 versions patched") is not corroborated by official Codeium communications. [S11]

**Anthropic (MCP protocol):** Declined to modify the protocol architecture. Characterized STDIO execution as "expected behavior." Updated SECURITY.md to note adapters should be used "with caution." Did not issue a CVE for Claude Code or other Anthropic tools. [S4, S5, S10]

**Google (Gemini-CLI):** Declined CVE filing; argued explicit user permission is required. [S3]

**Microsoft (GitHub Copilot/VS Code):** Not specifically addressed in the CVE-2026-30615 context; broader context suggests same "explicit user permission" position. [S3]

**CISA KEV status:** Not added. [S12]

**Coordinated disclosure:** The broader OX Security advisory involved 30+ responsible disclosures. The Windsurf-specific disclosure timeline to Codeium is not separately documented in public sources.

---

## Distinguishing Analysis: Standalone Incident or Downstream Instance?

### The Case That This Warrants a Standalone Entry

**1. The zero-click characteristic is analytically distinct and represents new failure mode documentation.**

AAGF-2026-022 documents the MCP STDIO design flaw (Family 3 is mentioned in one paragraph). AAGF-2026-016 documents the broader IDE vulnerability class without MCP-specific zero-click detail. Neither entry focuses on the specific mechanism that made Windsurf uniquely zero-click when Cursor, Claude Code, and Gemini-CLI were not.

The zero-click characteristic matters analytically because:
- It changes the threat model: no user action required = no opportunity for detection or interruption
- It identifies a specific implementation failure distinct from the protocol-level design flaw: Windsurf's HTML processing pipeline fed injected content into mcp.json modification without any intermediate permission gate
- It creates a meaningful comparative benchmark: the same attack vector (HTML content with injection payload) produces different outcomes across IDEs, revealing implementation-level variation in safety properties

**2. It is the only IDE with a formal CVE assignment from the OX Security advisory.**

The fact that Google, Microsoft, and Anthropic declined CVEs for their tools while Windsurf received CVE-2026-30615 is itself an editorial data point: Codeium either accepted the severity framing or was not offered the opportunity to decline. The CVE existence means this instance is tracked, scored, and citable in security tooling in a way that the "partial" Cursor/Claude Code/Gemini-CLI vulnerability is not.

**3. Delivery-to-execution attack path is novel within the database.**

The specific attack chain — HTML content → injected instructions → mcp.json overwrite → STDIO initialization → RCE — has not been documented as a complete path in the existing entries. AAGF-2026-022 covers the STDIO execute-first design. AAGF-2026-016 covers IDE auto-execution weaponization. CVE-2026-30615 is the specific intersection where both vulnerabilities activate together with zero user interaction, against a specific IDE's HTML rendering pipeline.

**4. Codeium's non-response is independently notable.**

Unlike LiteLLM (patched with four-layer fix), Flowise (patched, CISA KEV confirmed), DocsGPT (patched), and Bisheng (patched), Windsurf has no confirmed patch and no public security advisory from the vendor as of May 7, 2026. This persistent unpatched state for a CVE-assigned, CVSS 8.0 vulnerability in a widely-used developer IDE is itself a noteworthy failure mode worth documenting.

### The Case Against a Standalone Entry

**1. The vulnerability is a downstream manifestation of documented root causes.**

AAGF-2026-022 already identifies Windsurf by name (it appears in the tags and in the "Not remediated" section). The root cause — MCP STDIO execute-first combined with insufficient input validation — is already analyzed. A standalone entry risks documenting the same root cause analysis a third time.

**2. The "zero-click" distinction is a degree difference, not a category difference.**

The attack chain is identical across all affected IDEs; only the number of user interaction steps differs. One click vs. zero clicks is meaningful for practical exploitability but does not represent a different failure mode, control failure, or lesson. An appendix or update to AAGF-2026-022 could document the comparative IDE analysis without a new record.

**3. Limited confirmed impact.**

No in-the-wild exploitation confirmed. No Codeium advisory. No financial impact quantified. No user count. The incident adds analytical interest but limited empirical weight.

### Recommendation

**File as a standalone incident.** The balance of factors supports a distinct entry because:

1. The zero-click mechanism represents a specific implementation-level failure (HTML pipeline feeding injected content directly into mcp.json modification without permission gating) that is not documented in AAGF-2026-022 or AAGF-2026-016.
2. CVE-2026-30615 has independent NVD assignment and CVSS score, making it independently tracked and citable.
3. The comparative IDE testing (4 platforms, different interaction requirements) provides new empirical data about implementation-level variation in safety properties — a contribution that neither existing entry makes.
4. The vendor non-response (no Codeium advisory, no confirmed patch, no disclosure) adds a distinct lesson about disclosure dynamics when the vulnerable product's developer does not engage publicly.
5. The entry should explicitly cross-reference AAGF-2026-022 (parent protocol flaw) and AAGF-2026-016 (broader IDE vulnerability class), positioning CVE-2026-30615 as the specific intersection where both vulnerabilities co-activate with zero user interaction.

The standalone incident's analytical contribution is: **same root causes as existing entries, but a specific implementation failure that eliminated the last human checkpoint in the attack chain, and a vendor non-response that leaves a CVSS 8.0 CVE unpatched in a widely-used developer IDE.**

---

## Gaps and Uncertainties

| Gap | Impact on Analysis | Resolution Path |
|-----|--------------------|-----------------|
| Exact code path in Windsurf that enabled zero-click (vs. permission gate in Cursor) | Limits precision of implementation-level root cause | Codeium security disclosure or source code audit |
| Windsurf patch status | Unclear if CVE is still exploitable in current versions | Monitor Windsurf changelog for security advisory; re-test |
| Codeium's response to OX Security | Don't know if Codeium acknowledged, disputed, or ignored the disclosure | Codeium public statement or OX Security follow-up |
| Six production platforms — which sixth platform | Minor; list is largely reconstructable from advisory CVE inventory | OX Security follow-up disclosure |
| Discovery date for CVE-2026-30615 specifically | Minor; fits within the November 2025–April 2026 research window | OX Security disclosure timeline |
| In-the-wild exploitation | If exploitation has occurred, significantly raises severity | CISA KEV monitoring; threat intelligence |
| Windsurf user count | Required for impact magnitude estimation | Codeium public statements; app store download data |

---

## Data for Incident Record

### Suggested Frontmatter Values

```yaml
id: "AAGF-2026-057"
title: "Windsurf Zero-Click MCP RCE (CVE-2026-30615): HTML Prompt Injection Overwrites mcp.json with No User Interaction"
status: "draft"
date_occurred: "2026-04-15"           # Public disclosure = first confirmed exploitable date
date_discovered: "2026-01"            # Estimated; within OX Security's November 2025 – April 2026 research window
date_reported: "2026-04-15"           # OX Security advisory + CVE published
date_curated: "2026-05-07"

category:
  - "Prompt Injection"
  - "Infrastructure Damage"
  - "Supply Chain Compromise"
severity: "High"
agent_type:
  - "Coding Assistant"
agent_name: "Windsurf (Codeium)"
platform: "Windsurf IDE 1.9544.26"
industry: "Software Development"

actual_vs_potential: "near-miss"
potential_damage: "Full arbitrary RCE on any developer machine running Windsurf 1.9544.26 who opens a malicious repository or views attacker-controlled HTML — with no user interaction required. Practical blast radius: developer credentials, API keys, SSH keys, source code, and CI/CD pipeline access. No confirmed in-the-wild exploitation, but no confirmed patch either."
intervention: "OX Security responsible disclosure on April 15, 2026. Windsurf version 1.9544.26 identified as vulnerable; later versions reportedly patched the zero-click path, but no Codeium security advisory or confirmed patch version as of May 7, 2026."

financial_impact: "Not quantified — no confirmed exploitation"
financial_impact_usd: null

vendor_response: "minimal"           # No public Codeium advisory; reportedly patched in later versions but not confirmed
vendor_response_time: "unknown"      # Codeium did not issue public advisory

headline_stat: "Only IDE with zero-click MCP RCE — Cursor, Claude Code, and Gemini-CLI all required user interaction; Windsurf 1.9544.26 did not"
operator_tldr: "Update Windsurf past version 1.9544.26 immediately. Never open untrusted repositories in Windsurf without auditing README and project files first. Audit your mcp.json configuration for unexpected STDIO server entries after any session involving external content."

pattern_group: "mcp-protocol-security-crisis"   # Primary: same root cause as AAGF-2026-022
# Secondary pattern group membership: "agentic-ide-vulnerability-class" (AAGF-2026-016)
related_incidents:
  - "AAGF-2026-022"    # Parent: MCP STDIO execute-first design flaw (protocol root cause)
  - "AAGF-2026-016"    # IDEsaster: broader agentic IDE vulnerability class
  - "AAGF-2026-033"    # mcp-remote CVE-2025-6514: client-side MCP RCE (different vector, same protocol ecosystem)
```

### Suggested Damage Estimate Inputs

- Confirmed loss: null (no exploitation confirmed)
- Unit type: Developer machines running Windsurf 1.9544.26
- Unit count: Unknown — Codeium does not disclose user counts; Windsurf is one of the top-tier AI IDEs (likely millions of users, but no source supports a specific number)
- Probability weight: 0.10 (low — no confirmed exploitation; PoC available but no reported wild attacks)
- Per-unit cost: $10,000 (SANS 2024 developer machine IR benchmark — same as used in AAGF-2026-016)
- Note: Without a user count, no point estimate is defensible. Flag for HUMAN REVIEW. If Windsurf has ~500K users: 500,000 x $10,000 x 0.10 = $500M (apply absurdity guardrail, cap at $50M for order-of-magnitude). Confidence: order-of-magnitude only.

---

## Summary for Pipeline Stage 2

This is a well-substantiated incident with clear source chain (OX Security primary, NVD authoritative, PolicyLayer secondary, CSA independent validation). Key facts are consistent across sources.

**Strongest claims (high confidence):**
- CVE-2026-30615 assigned to Windsurf 1.9544.26 — confirmed by NVD, GitHub Advisory, CISA-ADP
- CVSS 8.0 HIGH, CWE-77, AV:L/AC:L/PR:N/UI:N — confirmed by NVD and GHSA
- Zero-click in Windsurf vs. at-least-one-click in Cursor, Claude Code, Gemini-CLI — stated by OX Security, corroborated by PolicyLayer and CSA
- Attack chain: HTML → injected instructions → mcp.json overwrite → STDIO init → RCE — confirmed by PolicyLayer and consistent across all sources
- Disclosed April 15, 2026 — confirmed by NVD publication date
- No confirmed in-the-wild exploitation — confirmed by absence from CISA KEV and absence of exploitation reports

**Weakest claims (low confidence):**
- Patch released in post-1.9544.26 versions — stated by PolicyLayer but contradicted by the GitHub Advisory ("Unknown" patched version), absent from official changelog, and inconsistent with "remains in reported state" as of May 1, 2026
- Sixth production platform identity — never named across any source
- Codeium's awareness/response — no public statement found; the vendor may have been contacted privately by OX Security
- Discovery date — estimated window only, not specifically disclosed

**Recommend:** File as AAGF-2026-057 with `status: draft`. The incident warrants a standalone record due to the zero-click distinction and the unpatched-vendor-non-response failure mode, cross-referenced explicitly to AAGF-2026-022 and AAGF-2026-016.
