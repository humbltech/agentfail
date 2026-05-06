# AAGF-2026-028 Research: ClawJacked — OpenClaw WebSocket Hijacking (CVE-2026-28472)

**Researcher:** Claude (automated deep research)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-028
**Status:** SUFFICIENT MATERIAL — proceed to draft

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| Oasis Security Blog | https://www.oasis.security/blog/openclaw-vulnerability | Security research firm (disclosing researcher) | High | Original discovery; detailed technical write-up with PoC demonstration video. Primary bias risk: disclosing vendor. |
| SonicWall Blog | https://www.sonicwall.com/blog/openclaw-auth-token-theft-leading-to-rce-cve-2026-25253 | Security vendor blog | Medium-High | URL targets CVE-2026-25253; page returned empty content on fetch — may not cover CVE-2026-28472 directly |
| NVD/NIST | https://nvd.nist.gov/vuln/detail/CVE-2026-28472 | Government vulnerability database | Authoritative | Official CVSS scoring and CWE classification. Published 2026-03-05. |
| CVEReports.com | https://cvereports.com/reports/CVE-2026-28472 | CVE aggregator | Medium | Provides CVSS scores, CWE, root cause code analysis; independently processed |
| The Hacker News | https://thehackernews.com/2026/02/clawjacked-flaw-lets-malicious-sites.html | Security journalism | High | Independent corroboration of mechanism and patch. No CVE or CVSS cited. |
| OpenClaw official blog | https://openclawai.io/blog/clawjacked-vulnerability-what-happened/ | Vendor self-disclosure | High | Vendor's own account; confirms patch timeline, attack chain, and that localhost exemption was a design decision later corrected |
| ThreatIntelReport | https://www.threatintelreport.com/2026/03/02/articles/openclaw-clawjacked-chain-malicious-websites-can-hijack-local-ai-agents-via-localhost-websockets/ | Threat intelligence blog | High | Published 2026-03-02; most complete step-by-step mechanism writeup; confirms no in-the-wild exploitation as of that date |
| Security Affairs | https://securityaffairs.com/188749/hacking/clawjacked-flaw-exposed-openclaw-users-to-data-theft.html | Security journalism | High | Independently corroborates attack mechanism; PoC video confirmed; no quantitative victim counts |
| BleepingComputer | https://www.bleepingcomputer.com/news/security/clawjacked-attack-let-malicious-websites-hijack-openclaw-to-steal-data/ | Security journalism | High | Independent corroboration; no CVE number cited in article text; no user counts |
| VulnCheck Advisory | https://www.vulncheck.com/advisories/openclaw-password-brute-force-via-browser-origin-websocket-authentication-bypass | Vulnerability intelligence | High | Provides CWE-307 classification for the brute-force variant (CVE-2026-32025); clarifies two overlapping CVEs cover related issues |
| Blink Blog CVE Timeline | https://blink.new/blog/openclaw-2026-cve-complete-timeline-security-history | Security blog | Medium-High | Most complete OpenClaw CVE chronology; covers all 2026 CVEs |
| Privacy Guides | https://www.privacyguides.org/news/2026/03/02/clawjacked-vulnerability-allows-malicious-websites-to-take-control-of-openclaw/ | Privacy advocacy/journalism | Medium-High | Consumer-facing coverage; confirms patch and mechanism |
| SOCRadar | https://socradar.io/blog/openclaws-clawjacked-vulnerability/ | Threat intelligence | Medium-High | 403 on fetch; referenced in multiple search results |
| IBM X-Force | https://www.ibm.com/think/x-force/agentic-ai-growing-fast-vulnerabilities | Enterprise security research | High | Frames ClawJacked in broader agentic AI security context |
| Belgian CCB Advisory | https://ccb.belgium.be/advisories/warning-critical-vulnerability-openclaw-allows-1-click-remote-code-execution-when | Government CERT | Authoritative | Government advisory citing ClawJacked in March 2026; confirms official response |
| GitHub CVE Tracker | https://github.com/jgamblin/OpenClawCVEs/ | Community tracking | Medium | Community-maintained list of all OpenClaw CVEs |

---

## Source Bias Flag

**Disclosing researcher bias:** Oasis Security is both the discoverer and the primary technical source. All quantitative claims about attack speed ("hundreds of guesses per second") originate from Oasis Security's own report and have not been independently verified by a third party with their own measurement. The attack mechanism itself is corroborated by multiple independent outlets, but performance figures are Oasis-only.

**No confirmed user/instance counts:** Unlike CVE-2026-25253 (where Censys independently counted 21,639 exposed instances), ClawJacked has no independently corroborated count of affected users or instances. No source provides a quantitative impact figure that is independently verified.

**CVE number confusion:** Some sources conflate the localhost brute-force vulnerability with CVE-2026-28472 (which NVD describes as a dummy-token WebSocket handshake bypass, fixed in 2026.2.2) and CVE-2026-32025 (which VulnCheck describes as the browser-origin WebSocket auth bypass / localhost rate-limiter bypass, fixed in 2026.2.25). The "ClawJacked" name as publicized by Oasis Security most accurately describes the compound attack chain that combines both weaknesses. This research document covers the full ClawJacked chain as attributed in context to CVE-2026-28472, while noting the overlap.

---

## Key Facts

| Field | Value |
|-------|-------|
| Incident name | ClawJacked |
| Primary CVE | CVE-2026-28472 |
| Related CVE | CVE-2026-32025 (brute-force rate-limit bypass variant) |
| CVSS v3.1 (NIST) | 9.8 CRITICAL — `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| CVSS v3.1 (CNA) | 8.1 HIGH — `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| CVSS v4.0 (CNA) | 9.2 CRITICAL — `CVSS:4.0/AV:N/AC:H/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N` |
| CWE | CWE-306 (Missing Authentication for Critical Function) — NVD; CWE-307 (Improper Restriction of Excessive Authentication Attempts) — VulnCheck for brute-force variant |
| Platform | OpenClaw (open-source AI agent framework; aka Moltbot/Clawdbot) |
| Affected versions | All OpenClaw versions prior to 2026.2.2 (device identity bypass) and prior to 2026.2.25 (localhost rate-limit exemption) |
| Fixed version | 2026.2.25 (comprehensive patch covering both weaknesses) |
| date_occurred | Not precisely established; vulnerability was present in the codebase from an indeterminate point; platform had significant growth in early 2026 making exploitation viable from approximately January 2026 |
| date_discovered | February 2026 (Oasis Security; exact day not publicly disclosed) |
| date_reported | **2026-02-26** — First public disclosure via Oasis Security blog post; OpenClaw patch released same day |
| NVD published | 2026-03-05 |
| NVD last modified | 2026-03-09 |
| Discoverer | Oasis Research Team (Oasis Security) |
| Patch commit | `fe81b1d7125a014b8280da461f34efbf5f761575` (GitHub) |
| GitHub advisory | GHSA-rv39-79c4-7459 |
| In-the-wild exploitation | Not confirmed as of 2026-03-02; government CERTs (Belgian CCB) issued advisories in March 2026 citing exploit chain; CNCERT, CrowdStrike, Cisco, Microsoft advisories followed |

---

## Vulnerability Mechanism

### The Three Architectural Gaps (Combined = ClawJacked)

The ClawJacked attack chain exploits three compounding weaknesses in OpenClaw's local gateway trust model:

#### Gap 1: WebSocket CORS Exception
Browsers enforce same-origin policy on HTTP requests, blocking cross-origin fetch/XHR. However, **WebSocket connections to localhost are not blocked** by browser cross-origin policies. Any website a victim visits can open a WebSocket to `ws://localhost:<port>` — the browser permits it. This is a known browser security gap, not unique to OpenClaw, but OpenClaw's architecture made it uniquely dangerous.

#### Gap 2: Localhost Rate Limiter Exemption
OpenClaw's gateway rate limiter was configured to **completely exempt loopback connections** (127.0.0.1 / localhost). According to Oasis Security's report:

> "The gateway's rate limiter completely exempts loopback connections — failed attempts are not counted, not throttled, and not logged."

This allowed malicious JavaScript to brute-force the gateway password at **hundreds of attempts per second** with no cooldown, no lockout, and no audit trail. OpenClaw's own post-mortem does not explicitly state whether this was an intentional design decision (i.e., "local traffic is trusted") or an oversight — but the effect was that local traffic received a blanket security exemption.

**Note:** VulnCheck tracks the rate-limit bypass specifically as CVE-2026-32025 (CWE-307, published 2026-03-19, fixed in 2026.2.25). NVD tracks CVE-2026-28472 as the broader device identity check bypass. Both are components of the compound ClawJacked chain.

#### Gap 3: Auto-Approved Device Pairings from Localhost
When a new device connects to OpenClaw and requests pairing, the gateway normally requires **explicit user confirmation** via a prompt. However, connections originating from localhost were auto-approved with no user interaction:

> "The gateway auto-approves device pairings from localhost with no user prompt."

Technically, the check-before-validation flaw in `src/gateway/server/ws-connection/message-handler.ts` evaluated token *presence* (boolean: does `auth.token` field exist?) rather than token *validity* before setting `canSkipDevice = true`. An attacker could supply `"dummy"` as the token value — `hasTokenAuth` would evaluate `true` and the device would be registered as trusted without authentication. Combined with the brute-force avenue, the attacker could either bypass via dummy token OR brute-force the password to reach the auto-pairing step.

### Step-by-Step Attack Chain

1. **Setup:** Victim has OpenClaw gateway running locally (common for developers). Gateway binds to localhost on its WebSocket port.
2. **Lure:** Victim visits an attacker-controlled or compromised website (no special permissions or extensions required).
3. **WebSocket connection:** Malicious JavaScript embedded in the page opens a WebSocket connection to `ws://localhost:<OpenClaw_port>`. Browser permits this.
4. **Brute-force authentication:** Script submits hundreds of password guesses per second against the gateway. No rate limiting fires because the source is localhost/loopback. No failed attempts are logged.
5. **Authentication achieved:** Password is guessed (or dummy token bypass is used). Gateway grants authenticated access.
6. **Silent device pairing:** Script registers the malicious browser session as a trusted paired device. Gateway auto-approves because the source is localhost. **No user prompt appears.**
7. **Full agent takeover:** Attacker now has operator-level access to the OpenClaw gateway and can:
   - Send messages to and receive responses from the AI agent
   - Dump gateway configuration and all connected integrations
   - Enumerate all paired devices and their platforms
   - Access application and conversation logs
   - Exfiltrate API keys stored for AI providers (OpenAI, Anthropic, etc.)
   - Execute shell commands on connected devices (if agent has those permissions)
   - Access connected messaging platforms (Slack, Telegram, email)
   - Access connected cloud storage and OAuth-integrated services
   - Perform lateral movement using harvested credentials

### Why This Is Distinctly an "Agent" Problem
The harm is amplified by the agent's built-in autonomy. OpenClaw agents hold credentials, maintain persistent tool access, and can execute actions with real-world consequences (sending emails, writing files, running commands). A hijacked agent is not just a data leak — it is an autonomous actor operating under attacker control with the victim's full set of permissions.

---

## Vendor Response

| Date | Event |
|------|-------|
| February 2026 | Oasis Security discovers the vulnerability chain via internal research |
| ~February 25, 2026 | Responsible disclosure report submitted to OpenClaw team |
| **February 26, 2026** | OpenClaw releases patch version 2026.2.25 — **within 24 hours of disclosure** |
| **February 26, 2026** | Oasis Security publishes public disclosure blog post ("ClawJacked") |
| March 1–2, 2026 | BleepingComputer, The Hacker News, Security Affairs, ThreatIntelReport publish coverage |
| March 5, 2026 | NVD publishes CVE-2026-28472 formally |
| March 2026 | Government CERTs (Belgian CCB, CNCERT) and enterprise security vendors (CrowdStrike, Cisco, Microsoft) issue advisories |
| March 19, 2026 | NVD publishes CVE-2026-32025 (the rate-limit brute-force variant, same fix) |

**Patch changes in version 2026.2.25:**
- Added rate limiting to authentication attempts on **all** connections, including loopback/localhost
- Required **explicit user approval** for all new device registrations, including those from localhost (removed auto-approval exception)
- Enforced origin checks for browser-origin WebSocket clients beyond the Control UI/Webchat
- Applied password-auth failure throttling specifically to browser-origin loopback attempts

**Communication:** OpenClaw published their own incident post-mortem blog at `openclawai.io/blog/clawjacked-vulnerability-what-happened/`, contextualizing ClawJacked as the fourth major vulnerability disclosed in February 2026 alone — a remarkable admission that reflects the broader security crisis the platform faced.

---

## Impact Assessment

### Technical Impact
- **Confidentiality:** Full compromise — all data accessible to the agent (API keys, conversation history, credentials, file contents) exposed
- **Integrity:** Full compromise — attacker can issue arbitrary commands via the agent
- **Availability:** High — agent can be commandeered, reconfigured, or disabled

### Scope
- **Affected population:** All users running OpenClaw gateway locally prior to version 2026.2.25. Given OpenClaw had 135,000+ GitHub stars and 21,639 publicly exposed instances (Censys, as of Jan 31, 2026), the developer/enthusiast population was large. No independent count of local-only instances is available.
- **Attack prerequisites:** Victim must have OpenClaw running locally AND visit a malicious/compromised webpage. No plugins, extensions, or special user interaction required beyond normal web browsing.
- **Exploitation complexity:** Low — the attack requires only a small JavaScript payload and is trivially reproducible from Oasis Security's PoC.

### Confirmed Exploitation
- **Not confirmed in the wild as of 2026-03-02** (ThreatIntelReport; Oasis Security)
- Government advisory issuances (Belgian CCB, CNCERT, Cisco, Microsoft, CrowdStrike) in March 2026 reflect heightened concern but do not confirm observed exploitation of this specific CVE
- CVE-2026-25253 (the related auth token theft RCE) IS confirmed as actively exploited in the wild; ClawJacked (CVE-2026-28472) has no equivalent confirmation
- EPSS probability: 0.04% (CVEReports.com)

### Post-Exploitation Attacker Capabilities
Per Oasis Security's research and OpenClaw's own documentation:
- Interact with the AI agent (full conversational and tool-use access)
- Dump gateway configuration and connected integrations
- Enumerate all paired devices and their platforms
- Read application and conversation logs
- **Exfiltrate AI provider API keys** (OpenAI, Anthropic, etc.)
- **Execute shell commands** on nodes where the agent has that permission
- Access all OAuth-connected services (email, calendar, cloud storage, Slack, Telegram)
- Potential for lateral movement into organizational infrastructure

---

## Relationship to AAGF-2026-010 (CVE-2026-25253)

AAGF-2026-010 covers the broader OpenClaw security crisis of early 2026, with CVE-2026-25253 as its seed incident.

| Attribute | AAGF-2026-010 / CVE-2026-25253 | AAGF-2026-028 / CVE-2026-28472 (ClawJacked) |
|-----------|--------------------------------|---------------------------------------------|
| Platform | OpenClaw | OpenClaw |
| Vulnerability type | SSRF-like: `gatewayUrl` parameter accepts attacker URL; agent auto-connects and sends auth token | CSWSH + brute-force: malicious site opens WebSocket to localhost, brute-forces password, exploits auto-approval |
| CWE | CWE-669 (Incorrect Resource Transfer Between Spheres) | CWE-306 (Missing Authentication for Critical Function) |
| CVSS | 8.8 HIGH | 8.1–9.8 (CNA vs NIST differ) |
| Fixed in | OpenClaw 2026.1.29 | OpenClaw 2026.2.25 |
| Confirmed exploitation | YES — actively exploited in the wild | NO — PoC exists; government advisories issued; no confirmed in-the-wild exploitation |
| Attack requires | Victim to click a malicious link (1-click) | Victim to visit a malicious webpage (drive-by) |
| Discovery | External researcher (SonicWall/Ethiack) | Oasis Security research team |
| Agent autonomy abuse | Token auto-sent to attacker server | Agent commands executed under attacker control |

**Key distinction:** CVE-2026-25253 exploits the agent *initiating* a connection to an attacker server and leaking its token (the agent acts on a crafted `gatewayUrl`). CVE-2026-28472 (ClawJacked) exploits the attacker *connecting to* the agent's local gateway by abusing browser WebSocket permissiveness. Both leverage agent autonomy — in the former, the agent trustingly connects out; in the latter, the attacker connects in and hijacks the agent's autonomous capabilities.

**Escalation chain:** Security researchers note that combining CVE-2026-28472 with CVE-2026-32922 (a separate OpenClaw privilege escalation) creates a "full unauthenticated RCE chain."

**Context in the crisis:** OpenClaw disclosed four major vulnerabilities in February 2026 alone. ClawJacked was part of a cluster that included CVE-2026-25253 (token theft RCE), ClawHavoc (341+ malicious skills on the ClawHub marketplace), and the Moltbook database breach (1.5M API tokens exposed). These are treated as a connected crisis in AAGF-2026-010 but ClawJacked's distinct CVE, mechanism, and patch timeline justify a separate AAGF entry.

---

## Classification Notes

### Triage Criteria (All Met)
1. **Real-world deployment:** Yes — OpenClaw is a widely deployed open-source AI agent platform (135,000+ GitHub stars)
2. **Autonomous agent involved:** Yes — OpenClaw agents hold credentials, execute tools, and take autonomous actions. Post-exploitation access is explicitly agent-mediated.
3. **Verifiable:** Yes — NVD entry, GitHub security advisory, Oasis Security PoC, OpenClaw vendor post-mortem, 10+ independent security journalism outlets
4. **Meaningful impact:** Yes — full agent takeover, potential API key exfiltration, shell command execution; government CERTs issued advisories

### Severity Estimate
**HIGH** (consistent with CNA CVSS 8.1; NIST 9.8 likely inflated by treating the network vector as low complexity, which overstates real-world exploitation difficulty given password brute-force prerequisite)

### Suggested Categories
- `ai-agent-platform-security`
- `websocket-hijacking`
- `authentication-bypass`
- `local-service-attack`
- `data-exfiltration`
- `agent-takeover`

### MITRE ATLAS Techniques
- **AML.T0012** — Valid Accounts (leveraging brute-forced credentials)
- **AML.T0040** — Network Access (exploiting local network trust via WebSocket)
- **AML.T0048** — Exploit Public-Facing Application (gateway WebSocket endpoint)
- **AML.T0025** — Exfiltration via AI APIs (exfiltrating API keys and agent data)
- **AML.T0050** — Command and Scripting Interpreter (shell command execution post-takeover)

### MITRE ATT&CK Techniques (conventional)
- T1059 — Command and Scripting Interpreter
- T1552 — Unsecured Credentials (API key theft)
- T1190 — Exploit Public-Facing Application
- T1110.001 — Brute Force: Password Guessing

---

## Raw Notes / Quotes

**Oasis Security (primary source, disclosing researcher):**
> "Any website you visit can open one to your localhost...the browser doesn't block these cross-origin connections."

> "The gateway's rate limiter completely exempts loopback connections — failed attempts are not counted, not throttled, and not logged."

> "Auto-approves device pairings from localhost with no user prompt."

**ThreatIntelReport (2026-03-02), on patch changes:**
> "Enforced origin checks for direct browser WebSocket clients beyond the Control UI/Webchat"
> "Applied throttling to password-auth failure throttling to browser-origin loopback attempts (including localhost)"
> "Blocked silent auto-pairing for non-Control-UI browser clients"

**ThreatIntelReport (2026-03-02), on exploitation:**
> "Neither Oasis nor OpenClaw has publicly reported confirmed in-the-wild exploitation specific to this chain" (as of March 2, 2026)

**CVEReports.com, on root cause code:**
> "The system completely failed to validate the contents of this token before granting the bypass authorization. An attacker could supply `'dummy'` as the token value, causing `hasTokenAuth` to evaluate true and set `canSkipDevice` to true."
> Source file: `src/gateway/server/ws-connection/message-handler.ts`

**OpenClaw official blog (vendor post-mortem):**
> "The gateway relaxes several security mechanisms for local connections — including silently approving new device registrations without prompting the user."
> (Note: vendor does not explicitly characterize the localhost exemption as intentional vs. oversight)

**NVD description (CVE-2026-28472):**
> "OpenClaw versions before 2026.2.2 contain a gateway WebSocket handshake vulnerability allowing attackers to 'skip device identity checks when auth.token is present but not validated,' potentially gaining operator access."

**Blink Blog CVE Timeline:**
> "Both CVE-2026-25253 (ClawBleed) and CVE-2026-28472 (ClawJacked) are among five formal CVE identifiers assigned to OpenClaw vulnerabilities. CVE-2026-25253 is the only 2026 OpenClaw CVE confirmed as actively exploited in the wild."

**BleepingComputer (independent corroboration):**
> "OpenClaw agents can hold API keys for AI providers, connect to messaging platforms, and execute system commands on connected devices."

---

## CVE Disambiguation Note

Multiple sources use "ClawJacked" to describe a compound attack chain that spans two CVEs:

- **CVE-2026-28472:** Device identity check bypass — dummy token in WebSocket handshake skips `canSkipDevice` validation. Fixed in 2026.2.2. NVD published 2026-03-05.
- **CVE-2026-32025:** Browser-origin WebSocket auth bypass / localhost rate-limit exemption. CWE-307. Fixed in 2026.2.25. NVD published 2026-03-19. Credited to "luz-oasis" (Oasis Security researcher).

The "ClawJacked" attack as described by Oasis Security likely requires both gaps in combination — the rate-limit exemption to brute-force, and the device auto-approval to silently register. The incident context assigns this to CVE-2026-28472 (CVSS 8.8 per task brief; 8.1 CNA per NVD). Both CVEs were fixed together in the 2026.2.25 patch, which is the authoritative "safe" version for this vulnerability cluster.

For the AAGF entry, recommend citing **both CVEs** as components of the ClawJacked chain, with CVE-2026-28472 as primary.
