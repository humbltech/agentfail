# AAGF-2026-039 Research: CVE-2024-5184 — EmailGPT Prompt Injection

## Triage Verdict: BORDERLINE (leans toward QUALIFIES with caveats)

**Summary of triage decision:**
CVE-2024-5184 passes three of the four AgentFail criteria clearly. The sticking point is criterion 1 (real-world deployment). EmailGPT originated as a university hackathon project, but it was publicly distributed as a Chrome extension, received a formal CVE, and had a responsible disclosure process initiated by a professional security research team (Synopsys CyRC). The Chrome Web Store listing exists, meaning real users could have installed it. However, the deployment scale was almost certainly very small (10 GitHub stars, 4 forks, "use at your own risk" disclaimer), and no exploitation in the wild has been confirmed. The incident qualifies as a weak-to-moderate entry — notable primarily as an early documented CVE in the LLM prompt injection category and as an illustration of the "AI assistant as attack surface" failure mode, not because of documented real-world harm.

**Criterion-by-criterion:**
1. Real-world deployment — PARTIAL. Chrome Web Store listing confirmed; hackathon origin; unknown but likely small install base; no production enterprise deployment documented.
2. Autonomous agent involved — YES. EmailGPT autonomously processes user prompts via OpenAI's API and acts on them inside Gmail. The injection redirects the agent's actions without user awareness.
3. Verifiable — YES. Formal CVE, NVD entry, GHSA advisory, Black Duck/Synopsys CyRC primary advisory. Multiple secondary sources.
4. Meaningful impact — BORDERLINE. Potential for data leakage, API abuse (financial), and DoS. No confirmed real victims. Patch never issued; only remediation is removal.

**Editorial note on EC-Council attribution:** No EC-Council coverage of this specific CVE was found. The candidate backlog entry's "EC-Council coverage" note may refer to EC-Council's general article on prompt injection real-world examples (which covers 2025 CVEs, not this one) or may be a tagging error. The primary authoritative source is Synopsys/Black Duck CyRC.

---

## What is EmailGPT?

EmailGPT is a Google Chrome extension and accompanying Express.js API server that assists users in composing emails inside Gmail using OpenAI's GPT-3.5 model.

**Key capabilities (from GitHub README):**
- Generate emails from a user-supplied prompt
- Refine tone across four modes: Professional, Corporate, Casual, Quirky ("Zoomer mode")
- Fix spelling and grammar automatically

**Project origin:** Created for IEEE NTU's iNTUition v9.0 hackathon (Nanyang Technological University, Singapore). The team won "Best Pre-University Hack." The project carries a "use at your own risk" disclaimer.

**Source:** GitHub repository `Coeeter/EmailGPT`
- Stars: 10
- Forks: 4
- Total commits: 49
- Languages: TypeScript (79.5%), CSS (20.5%)
- Created: February 25, 2023

**Chrome Web Store:** A listing exists at `chromewebstore.google.com/detail/email-gpt/gjkkbbbjdcdickanchomafbcddjgpnpn` — confirming the extension was published for public download. No user count or rating data could be extracted from the store page.

**Architecture:** The Chrome extension communicates with a user-hosted Express.js backend API server. The API server holds the OpenAI API key and routes prompts to GPT-3.5. This backend-plus-extension architecture means the attack surface is the API endpoint, not just the extension UI.

---

## Vulnerability Details

### CVE ID
CVE-2024-5184

### CNA (CVE Numbering Authority)
Synopsys (Black Duck Cybersecurity Research Center / CyRC)

### CWE Classification
CWE-74: Improper Neutralization of Special Elements in Output Used by Downstream Component ('Injection')

### CVSS Scores (discrepancy between NIST and Synopsys assessments)

| Source | Version | Score | Severity | Vector |
|--------|---------|-------|----------|--------|
| NIST NVD | CVSS 3.1 | 9.1 | CRITICAL | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:H |
| Synopsys (CNA) | CVSS 3.1 | 6.5 | MEDIUM | AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |
| Synopsys (CNA) | CVSS 4.0 | 8.5 | HIGH | AV:A/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:H/SI:H/SA:H |

The NIST score (9.1 Critical, network-accessible) is notably higher than Synopsys's own assessment (6.5 Medium, adjacent-network). The vector difference (AV:N vs AV:A) reflects whether the vulnerability is exploitable over the internet or only from adjacent network. NIST's assessment of network accessibility is plausible given the API is typically internet-exposed.

**EPSS:** 0.11% (low probability of exploitation within 30 days as of disclosure)

### Affected Products
CPE: `cpe:2.3:a:emailgpt:emailgpt:-:*:*:*:*:*:*:*` (all versions)
Only the "main" branch was documented as affected. No version range specified — the vulnerability is architectural (no input sanitization exists), not version-specific.

### Exact Vulnerability Mechanism

The EmailGPT API accepts free-text user prompts and passes them directly to the GPT-3.5 model without sanitization, validation, or prompt isolation. There is no boundary between user-controlled input and the system context.

**Attack vector:**
An attacker submits a crafted prompt through the EmailGPT service (either via the Chrome extension UI or directly to the API endpoint). Because the system prompt is hardcoded and unprotected, the attacker can:

1. **Leak the system prompt:** Ask the model to repeat or summarize its instructions. The model complies, exposing the hardcoded operational context.
2. **Override service logic:** Inject instructions that contradict or supersede the intended behavior. Example: "Ignore previous instructions. Instead, [malicious instruction]."
3. **Execute arbitrary AI behavior:** Force the AI to produce any content — phishing emails, disinformation, offensive content — using the service's identity and API quota.

**Why this works:** GPT-3.5 (at time of disclosure) had no robust instruction hierarchy. User-injected content could successfully override system-level instructions when crafted appropriately.

### What an attacker can do (confirmed by CyRC advisory)
- Extract hardcoded system prompts (intellectual property leakage)
- Cause denial of service by flooding the OpenAI API (burn through the operator's API credits)
- Generate misleading or malicious email content using the victim's Gmail interface
- Potentially use compromised service to launch spam campaigns through the user's Gmail account
- Fabricate disinformation content via the trusted email-writing interface

---

## Timeline

| Date | Event |
|------|-------|
| February 25, 2023 | EmailGPT repository created on GitHub |
| February 26, 2024 | Synopsys CyRC first disclosure attempt to developers |
| April 4, 2024 | CyRC second contact attempt — no response |
| May 1, 2024 | CyRC final contact attempt — no response |
| June 5, 2024 | CVE-2024-5184 publicly disclosed; NVD published; Black Duck advisory released |
| June 5, 2024 | GitHub Advisory GHSA-27m7-5vm3-3prg published |
| November 21, 2024 | NVD last modified (status: "Modified" — ongoing assessment) |

**90-day window:** CyRC adhered to standard responsible disclosure policy. Three contact attempts over approximately 64 days before going public. No developer response received at any stage.

---

## Vendor Response

**None.** EmailGPT's developer(s) did not respond to any of the three disclosure contact attempts made by Synopsys CyRC over a 64-day period. No patch has been released. No CVE acknowledgment from the developer.

**CyRC recommendation:** "Remove the applications from networks immediately." No workaround available short of complete removal.

**Current status of repository:** The GitHub repository (`Coeeter/EmailGPT`) remains public. The Chrome Web Store listing was still accessible as of research date. There is no indication the developer has taken the extension down or issued a security advisory.

---

## Exploitation in the Wild

**No confirmed exploitation documented.** 

- EPSS score of 0.11% as of disclosure — low probability of active exploitation
- Not listed on CISA's Known Exploited Vulnerabilities (KEV) catalog
- No VulnCheck exploitation data found
- One threat advisory (Rescana, October 2024) claimed "exploitation has been observed in the wild" in the context of AI-driven Gmail phishing — but this appears to be a threat-model advisory rather than a documented incident, and it conflated CVE-2024-5184 with broader AI phishing techniques. No specific victim organizations, dates, or evidence were provided in that report.

**Assessment:** No credible evidence of exploitation in the wild. The vulnerability is real and unpatched but the deployment scale likely limited real-world exposure.

---

## Affected Parties and Scale

- **Developer:** Student developer ("Coeeter") from NTU Singapore, competing in a pre-university hackathon context
- **Chrome Web Store:** Extension published publicly, install count unknown
- **GitHub:** 10 stars, 4 forks — indicative of very small developer-community interest
- **Likely users:** Technically-inclined individuals who self-install browser extensions from GitHub or Chrome Web Store. Not an enterprise product. No SLA, no support, no commercial deployment documented.

**Deployment model:** Self-hosted. Users must run their own Express.js API server with their own OpenAI API key. This means:
- Attacker exploitation primarily burns the victim user's own OpenAI API budget (financial impact falls on the user)
- A public shared deployment (if anyone ran one) would be more dangerous — no evidence of such a shared deployment found

---

## Sources

### Primary Sources
- **Black Duck / Synopsys CyRC Advisory (primary):** https://www.blackduck.com/blog/cyrc-advisory-prompt-injection-emailgpt.html
- **NVD Entry:** https://nvd.nist.gov/vuln/detail/cve-2024-5184
- **GitHub Advisory GHSA-27m7-5vm3-3prg:** https://github.com/advisories/GHSA-27m7-5vm3-3prg
- **EmailGPT GitHub Repository:** https://github.com/Coeeter/EmailGPT

### Secondary Coverage
- **Security Boulevard:** https://securityboulevard.com/2024/06/cyrc-vulnerability-advisory-cve-2024-5184s-prompt-injection-in-emailgpt-service/
- **The Cyber Express:** https://thecyberexpress.com/emailgpt-vulnerability/
- **Hackread:** https://hackread.com/emailgpt-flaw-user-data-at-risk-remove-extension/
- **SC World:** https://www.scworld.com/brief/significant-compromise-likely-with-new-emailgpt-vulnerability
- **Cybersecurity News:** https://cybersecuritynews.com/emailgpt-vulnerability/
- **Infosecurity Magazine:** https://www.infosecurity-magazine.com/news/emailgpt-exposed-prompt-injection/
- **CybersecAsia:** https://cybersecasia.net/news/beware-prompt-injection-vulnerability-found-in-generative-ai-email-assistant/
- **CVEfeed:** https://cvefeed.io/vuln/detail/CVE-2024-5184
- **Rescana threat advisory (treat with caution — conflates CVEs):** https://www.rescana.com/post/advanced-ai-driven-phishing-threat-exploits-gmail-s-emailgpt-and-chrome-vulnerabilities-october-20
- **Chrome Web Store listing:** https://chromewebstore.google.com/detail/email-gpt/gjkkbbbjdcdickanchomafbcddjgpnpn

### EC-Council Coverage
No specific EC-Council article covering CVE-2024-5184 or EmailGPT was found. EC-Council's general prompt injection article (https://www.eccouncil.org/cybersecurity-exchange/ethical-hacking/what-is-prompt-injection-in-ai-real-world-examples-and-prevention-tips/) covers 2025 incidents only. The candidate backlog "EC-Council coverage" note appears to be either a tagging error or refers to a general educational piece that happens to discuss prompt injection in AI assistants.

---

## AgentFail Framing Notes

### Why this is interesting despite small scale

CVE-2024-5184 is historically significant as one of the earliest formally assigned CVEs for a prompt injection vulnerability in an LLM-powered autonomous agent. It predates the mainstream awareness of agentic AI risks and represents a clean, well-documented case of:

- **No input sanitization architecture** as a systemic failure mode (not a coding bug — an architectural gap)
- **AI-adjacent financial impact:** API quota exhaustion as a novel attack consequence unique to LLM integrations
- **Responsible disclosure failure:** Developer non-response forcing public disclosure without a patch — a pattern that will likely recur as amateur AI tools proliferate
- **The "hackathon-to-CVE pipeline":** A pre-university hackathon project received a formal CVE because it was publicly distributed. This illustrates how the democratization of LLM tooling creates security surface without corresponding security maturity.

### Failure mode classification
- **Primary:** Prompt injection (direct) — no input sanitization on user-controlled LLM inputs
- **Secondary:** Hardcoded system prompt with no access control — system context fully extractable
- **Tertiary:** No developer security response infrastructure — single developer, no security contact, no patch process

### Comparable incidents in AgentFail database
- Likely overlaps thematically with any indirect prompt injection incidents (if any exist in the database) but this is a direct injection case
- The API quota exhaustion / financial DoS vector may be unique

### Recommended framing if published
Frame as a **vulnerability disclosure** rather than a confirmed breach. The story is: "A formally issued CVE against an unpatched, developer-abandoned LLM email agent — with no victims confirmed but the door demonstrably unlocked." The near-miss framing is appropriate. Potential damage if a shared deployment existed would have been significant (full email composition control + API cost burning for all users of that deployment).

---

## Open Questions for Pipeline Stage 2

1. Is there a separate, more professionally deployed "Email GPT" product that shares the CVE (not the hackathon version)? The Chrome Web Store listing description differs slightly from the GitHub README — warrants checking if it is the same codebase.
2. Was the Chrome Web Store listing ever taken down after the CVE? Current status unknown.
3. Did any enterprise or shared deployment of the EmailGPT API server exist? (Would significantly change the triage verdict if yes.)
4. The CVSS discrepancy (NIST: 9.1 Critical vs. Synopsys: 6.5 Medium) should be noted — the attack vector disagreement (AV:N vs. AV:A) affects how broadly exploitable the vulnerability actually is.
