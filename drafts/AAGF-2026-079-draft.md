---
id: "AAGF-2026-079"
title: "UNC1069 Compromises axios via Deepfake Teams Call and ClickFix RAT, Delivering WAVESHAPER.V2 to 135+ Endpoints During 3-Hour npm Window"
status: "reviewed"
date_occurred: "2026-03-31"
date_discovered: "2026-03-31"       # Socket.dev automated detection at 00:05:41 UTC; community issue at 02:19
date_reported: "2026-03-31"         # Jason Saayman public acknowledgment at 04:08 UTC
date_curated: "2026-05-08"
date_council_reviewed: "2026-05-08"

# Classification
category:
  - "Supply Chain Compromise"
  - "Social Engineering"
  - "Unauthorized Data Access"
  - "Infrastructure Damage"
agent_type:
  - "Tool-Using Agent"
  - "Coding Assistant"
agent_name: "Any Node.js AI agent (LangChain.js, LangGraph.js) with axios as HTTP transport; WAVESHAPER.V2 RAT as the delivered payload"
platform: "npm / Node.js ecosystem"
industry: "Software Development / Open Source Infrastructure / AI Infrastructure"
severity: "critical"

# Impact
financial_impact: "Credentials exposed on 135+ confirmed endpoints (Huntress partner base only); Backstage CI beacon confirmed; Datadog acknowledged exposure in 'several components'; no confirmed financial theft disclosed as of curation date"
financial_impact_usd: null
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null                        # 135+ Huntress-confirmed endpoints; Wiz estimates 3% of ~178K install operations during window (~5,340 environments at risk)
  scale: "widespread"
  data_types_exposed:
    - "credentials"
    - "source_code"

# Damage Timing
damage_speed: "1.1 seconds"          # StepSecurity Harden-Runner detected C2 callback 1.1s into npm install on Backstage CI
damage_duration: "~2h54m"            # axios@1.14.1 published 00:21; npm removed malicious versions ~03:15 UTC
total_damage_window: "~3 hours"      # Full window from first malicious axios publish to npm removal

# Recovery
recovery_time: "partial"             # npm removed packages; macOS infections real but extent unknown; Windows/Linux bugs prevented execution
recovery_labor_hours: null
recovery_cost_usd: 1350000           # 135 confirmed endpoints × $10,000/machine minimum for Huntress-disclosed subset
recovery_cost_notes: "135-endpoint figure from Huntress partner base only — does not capture direct Datadog, Backstage, or independent organization remediation. Wiz's 3% execution rate against ~5,340 at-risk environments implies potentially far higher actual scope. macOS infections were fully functional; Windows and Linux implementation bugs prevented execution on those platforms."
full_recovery_achieved: "unknown"    # macOS infections real but scope not fully determined; no confirmed public disclosure of cleaned endpoints

# Business Impact
business_scope: "multi-org"
business_criticality: "existential"
business_criticality_notes: "axios has ~100M weekly downloads and 174,000 npm packages depending on it. LangChain.js and LangGraph.js use axios for HTTP transport, meaning any Node.js AI agent making LLM API calls was transitively exposed. WAVESHAPER.V2's peinject capability (reflective .NET assembly injection) could silently intercept API keys with billing access on any infected system. A functioning Linux payload would have converted global CI/CD infrastructure into a persistent nation-state RAT network at unprecedented scale."
systems_affected:
  - "ci-cd"
  - "source-code"
  - "customer-data"
  - "deployment"

# Vendor Response
vendor_response: "fixed"             # npm removed malicious axios versions; issued security stub for plain-crypto-js
vendor_response_time: "~3h"          # Malicious axios@1.14.1 published 00:21; npm removal ~03:15 UTC (~2h54m); plain-crypto-js replaced with security stub at 04:26

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null           # No disclosed financial theft; credentials exposed but monetization not confirmed
  recovery_cost_usd: 1350000         # 135 Huntress-confirmed endpoints × $10,000/machine; labeled minimum known
  averted_damage_usd: 25000000       # Conservative: ~5,000 additional machines × $10K × 0.5 probability weight
  averted_range_low: 10000000        # 5,000 × $10K × 0.2
  averted_range_high: 50000000       # 5,000 × $10K × 1.0 (if bugs fixed and full 3-hour window exploited)
  composite_damage_usd: 26350000     # recovery_cost + averted_damage
  confidence: "estimated"
  probability_weight: 0.5            # Partial exploitation confirmed (macOS fully functional; Windows/Linux bugs prevented execution); significant uncertainty on undisclosed macOS infection scope
  methodology: "135 confirmed Huntress endpoints × $10K/machine for recovery floor; 5,000 additional at-risk environments (100M weekly downloads ÷ 7 days ÷ 24h × 3h = ~178K installs × 3% Wiz execution rate = ~5,340, rounded conservative to 5,000) × $10K × 0.5 probability weight for averted damage"
  methodology_detail:
    per_unit_cost_usd: 10000         # Per-machine credential compromise and remediation (IBM Cost of a Data Breach 2024: ~$4.8M avg / ~500 avg affected systems)
    unit_count: 5135                 # 135 confirmed (Huntress) + 5,000 estimated at-risk environments
    unit_type: "machine"
    multiplier: 0.5                  # Partial: macOS fully functional; Windows/Linux implementation bugs prevented execution; 3-hour window avoided Monday morning CI surge
    benchmark_source: "IBM Cost of a Data Breach Report 2024; Wiz 3% execution rate estimate; Huntress partner disclosure"
  estimation_date: "2026-05-08"
  human_override: false
  notes: "The Huntress 135-endpoint figure is the only confirmed, named count. Wiz's '3% execution rate among environments running npm install during window' and '80% of cloud environments had axios installed' are estimates, not confirmed infection counts. Windows and Linux implementation bugs are a critical modifier: the averted_damage_usd specifically represents damage that would have occurred if these bugs had not existed. The 3-hour window narrowly avoided the Monday 09:00 UTC global CI/CD surge that would have multiplied the install count by an order of magnitude. UNIT CAVEAT: The IBM Cost of a Data Breach 2024 benchmark ($4.8M avg / ~500 avg affected systems) expresses cost per breach record, not per compromised machine. The $10K/machine approximation treats each compromised endpoint as a discrete breach event. Depending on the number of credentials and records accessible per machine, this figure may overstate (single-purpose CI runner with one token) or understate (developer workstation with access to multiple production systems and stored credentials). The figure should be read as an order-of-magnitude floor for remediation and credential rotation cost, not a precise per-machine recovery figure."

# Presentation
headline_stat: "UNC1069 (DPRK) planted a nation-state RAT inside axios — 100M weekly downloads, 174K dependent packages — for 3 hours: 135+ confirmed C2 beacons, limited to macOS only by a Windows coding bug"
operator_tldr: "Enable npm provenance attestation verification in your CI pipeline, deploy runtime egress monitoring (StepSecurity Harden-Runner or equivalent) that alerts on unexpected outbound connections during npm install, add package-lock.json integrity checks before deployment, and enforce hardware security keys for npm publisher accounts at your organization."
actual_vs_potential: "partial"        # Real macOS infections and C2 beacons occurred; Windows and Linux implementation bugs prevented full exploitation; 3-hour window avoided Monday CI surge
potential_damage: "If the Windows and Linux payloads had been bug-free, WAVESHAPER.V2 would have established persistent RAT footholds across every CI/CD pipeline globally that ran npm install during the window — an estimated ~5,000+ environments in the 3-hour exposure period alone. Monday morning's global CI/CD surge would have multiplied this by 5-10x. The RAT's peinject capability enables silent .NET assembly injection on Windows — meaning API keys, cloud credentials, and billing tokens in developer environments could be harvested without any visible process or network anomaly. WAVESHAPER.V2's FirstInfo beacon exfiltrates home directory, Desktop, Documents, and .config directory listings immediately on first contact, followed by full command execution capability. For AI infrastructure specifically: LangChain.js and LangGraph.js both depend on axios for LLM API calls, meaning infected environments would have placed nation-state actors inside the HTTP layer of every LLM API call — positioned to intercept, modify, or exfiltrate AI agent traffic at the transport level."
intervention: "Socket.dev automated malware detection flagged plain-crypto-js@4.2.1 six minutes after publish (00:05:41 UTC), before axios@1.14.1 was even published. StepSecurity Harden-Runner detected the C2 callback from Backstage CI 1.1 seconds into npm install at 01:30:51. Community issue filed at 02:19. npm removed malicious versions at approximately 03:15 (~2h54m after axios@1.14.1 published). Jason Saayman's own acknowledgment came at 04:08. Critical secondary factor: implementation bugs in both Windows (work() function never called) and Linux (os.getlogin() crash in containers, undefined b64_string variable) prevented payload delivery on the two platforms most commonly used in CI/CD environments — the attacker's primary target."
containment_method: "third_party"    # Socket.dev (automated detection 6 min post-publish); StepSecurity Harden-Runner (CI egress monitoring); npm removal

public_attention: "high"

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0010"           # AI Supply Chain Compromise (parent)
    - "AML.T0010.005"       # AI Agent Tool — npm package as agent tool dependency (axios used by LangChain.js/LangGraph.js)
    - "AML.T0109"           # AI Supply Chain Rug Pull — clean version (axios@1.13.x) swapped to malicious (axios@1.14.1)
    - "AML.T0112"           # Machine Compromise — WAVESHAPER.V2 achieves machine-level persistent access
    - "AML.T0112.000"       # Local AI Agent — agent process compromised via infected HTTP transport dependency
    - "AML.T0052"           # Phishing — social engineering of maintainer Jason Saayman
    - "AML.T0052.001"       # Deepfake-Assisted Phishing — Microsoft Teams call with deepfake/pre-recorded participants
    - "AML.T0098"           # AI Agent Tool Credential Harvesting — RAT targets API keys and credentials in agent environment
  owasp_llm:
    - "LLM03:2025"          # Supply Chain — malicious package injected into Node.js AI agent dependencies
  owasp_agentic:
    - "ASI04:2026"          # Agentic Supply Chain Compromise — npm ecosystem as AI agent tool supply chain vector
    - "ASI09:2026"          # Human-Agent Trust Exploitation — social engineering exploited human trust in software supply chain and video call authenticity
  ttps_ai:
    - "2.2"                 # Resource Development — staging phantom dependency (plain-crypto-js), C2 infrastructure (sfrclak[.]com)
    - "2.3"                 # Initial Access — supply chain compromise via compromised maintainer account
    - "2.9"                 # Credential Access — WAVESHAPER.V2 RAT harvests API keys and credentials
    - "2.15"                # Exfiltration — FirstInfo beacon exfiltrates directory listings; peinject enables credential interception

# Relationships
related_incidents:
  - "AAGF-2026-009"         # Prior npm supply chain attack in same pattern group
  - "AAGF-2026-020"         # Supply chain AI infrastructure — same pattern group
  - "AAGF-2026-055"         # Supply chain AI infrastructure — same pattern group
  - "AAGF-2026-067"         # hackerbot-claw Trivy compromise — same date (March 31), unrelated but illustrates concurrent supply chain threat landscape; same pattern group
pattern_group: "supply-chain-ai-infrastructure"
tags:
  - "npm"
  - "axios"
  - "supply-chain"
  - "unc1069"
  - "dprk"
  - "sapphire-sleet"
  - "bluenoroff"
  - "waveshaper"
  - "rat"
  - "social-engineering"
  - "deepfake"
  - "clickfix"
  - "phantom-dependency"
  - "postinstall-hook"
  - "langchain"
  - "langgraph"
  - "ai-infrastructure"
  - "contagious-interview"
  - "anti-forensics"
  - "ci-cd"

# Metadata
sources:
  - "https://socket.dev/blog/malicious-package-detected-in-axios-1-14-1"
  - "https://www.stepsecurity.io/blog/axios-supply-chain-attack-waveshaper-v2"
  - "https://www.datadog.com/blog/axios-supply-chain-compromise-2026/"
  - "https://www.huntress.com/blog/axios-waveshaper-npm-supply-chain"
  - "https://www.wiz.io/blog/axios-npm-supply-chain-attack-march-2026"
  - "https://www.mandiant.com/resources/blog/unc1069-axios-npm-supply-chain"
  - "https://github.com/advisories/GHSA-fw8c-xr5c-95f9"
  - "https://osv.dev/vulnerability/MAL-2026-2307"
  - "https://security.snyk.io/vuln/SNYK-JS-AXIOS-15850650"
  - "https://github.com/axios/axios/issues/axios-1-14-1-security"
researcher_notes: "CRITICAL CLARIFICATION: This incident (AAGF-2026-079) is entirely separate from AAGF-2026-076 (Claude Code sourcemap leak), which also occurred on March 31, 2026. Socket.dev confirmed no link between the two incidents. PLATFORM PAYLOAD BUGS: The Windows and Linux implementation bugs are load-bearing facts — they are what prevented this from becoming one of the most consequential software supply chain attacks in history. The Windows 'work() function never called' finding is from Datadog's analysis. The Linux 'os.getlogin() crashes in TTY-less containers' and 'undefined b64_string variable' bugs are confirmed by Socket.dev. These bugs should NOT be minimized — they are the difference between 135 confirmed C2 beacons and potentially tens of thousands. SOCIAL ENGINEERING TIMELINE: The 2-week gap between Saayman's social engineering (approximately March 17) and the attack (March 31) is consistent with UNC1069/Sapphire Sleet operational patterns where initial-stage RATs are used to harvest credentials over days before operational use. ATTRIBUTION CONFIDENCE: HIGH per Mandiant/Google (UNC1069), Microsoft (Sapphire Sleet), and Kaspersky (BlueNoroff, older designation). The Contagious Interview campaign context (1,700+ malicious packages, simultaneous targeting of Lodash, Fastify, dotenv maintainers) establishes this as a systematic nation-state operation, not an opportunistic attack. ANTI-FORENSICS: The manifest swap (post-infection npm list shows clean 4.2.0 rather than malicious 4.2.1) is a significant detection evasion technique — standard incident response tooling would miss infections on compromised machines."
council_verdict: "Strong, technically thorough report on a genuinely critical AI-infrastructure supply chain incident; approved after corrections for attribution overstatement in narrative, IBM cost-benchmark unit conflation, Windows-payload caveat missing from the AI transport-interception claim, and uneven vendor bias disclosure across sources."
---

# UNC1069 Compromises axios via Deepfake Teams Call and ClickFix RAT, Delivering WAVESHAPER.V2 to 135+ Endpoints During 3-Hour npm Window

## Executive Summary

On March 31, 2026, threat group UNC1069 — assessed with high confidence by Mandiant/Google as North Korean state-sponsored (Sapphire Sleet/BlueNoroff) — published two malicious versions of axios — one of npm's most widely downloaded JavaScript libraries, with ~100M weekly downloads — via a compromised maintainer account obtained through a deepfake Microsoft Teams call and ClickFix social engineering attack. The malicious packages delivered WAVESHAPER.V2, a fully functional remote access trojan, across 135+ confirmed endpoints within a 2-hour 54-minute window before npm removed them. macOS payloads were fully operational; Windows and Linux implementation bugs — a `work()` function never called on Windows, and a TTY-dependent crash plus undefined variable on Linux — prevented the attack from extending to CI/CD pipelines globally, which were the primary intended target. Any Node.js AI agent using LangChain.js or LangGraph.js had axios as a transitive HTTP transport dependency, meaning the attack was positioned to place nation-state actors inside the HTTP layer of LLM API traffic.

---

## Timeline

| Date/Time (UTC) | Event |
|----------------|-------|
| ~2026-03-17 | UNC1069 makes initial LinkedIn contact with axios lead maintainer Jason Saayman, impersonating a legitimate company founder (social engineering begins ~2 weeks before attack) |
| ~2026-03-17 to 2026-03-30 | Fake Slack workspace established; Microsoft Teams call with deepfake/pre-recorded participants; Saayman prompted to install "fix" during call delivering initial-stage RAT; browser session and npm cookie harvesting occurs; attacker changes npm account email to `ifstap@proton.me` and harvests long-lived classic access tokens |
| 2026-03-30 05:57 | `plain-crypto-js@4.2.0` published to npm — clean stub to reserve namespace |
| 2026-03-30 16:03 | C2 domain `sfrclak[.]com` registered (Namecheap/Hostwinds; IP 142.11.206.73) |
| 2026-03-30 23:59 | `plain-crypto-js@4.2.1` published with malicious `postinstall` hook containing dropper (`setup.js`) |
| 2026-03-31 00:05:41 | Socket.dev automated detection flags `plain-crypto-js@4.2.1` as malware — **6 minutes after publish**, before axios is touched |
| 2026-03-31 00:21 | `axios@1.14.1` published via compromised `jasonsaayman` npm account, tagged `latest` — adds `plain-crypto-js@^4.2.1` as phantom dependency |
| 2026-03-31 01:00 | `axios@0.30.4` published via same compromised account |
| 2026-03-31 01:30:51 | StepSecurity Harden-Runner detects C2 callback from Backstage (CNCF) CI — **1.1 seconds** into `npm install` |
| 2026-03-31 02:19 | First community issue filed on GitHub axios repository |
| 2026-03-31 ~03:15 | npm removes malicious axios@1.14.1 and axios@0.30.4 (~2h54m exposure window for 1.14.1) |
| 2026-03-31 04:08 | Jason Saayman acknowledges compromise publicly |
| 2026-03-31 04:26 | `plain-crypto-js` replaced with security stub on npm |
| 2026-03-31 (ongoing) | Huntress confirms 135+ endpoints contacting C2; Datadog acknowledges exposure in "several components"; Wiz reports 3% execution rate among environments running `npm install` during window |

---

## What Happened

### The Setup: Nation-State Social Engineering

Approximately two weeks before the attack, a contact appeared in Jason Saayman's LinkedIn messages — an impersonation of a legitimate company founder, plausible enough to establish credibility. UNC1069 was running what researchers call the ClickFix playbook: a multi-step social engineering campaign that has been observed across dozens of software supply chain attacks attributed to North Korean operators.

The sequence followed a now-recognized pattern. First, LinkedIn contact. Then, a fake Slack workspace built with convincing brand assets — the kind of professional appearance that signals legitimacy. Then a scheduled Microsoft Teams call. On the call, Saayman encountered what appeared to be multiple participants — but the participants were deepfake or pre-recorded video. At some point during the call, Saayman was prompted to install something — framed as a fix, a tool, a requirement to participate. That install delivered an initial-stage RAT.

Over the following days, that RAT harvested Saayman's browser session tokens and npm authentication cookies. npm's two-factor authentication and its newer OIDC-based publishing protections were bypassed through session hijacking — the attacker didn't need Saayman's password or his second factor; they had his authenticated session. The attacker changed the npm account email to `ifstap@proton.me` (a Proton Mail address, unrecoverable by original owner through normal email verification) and harvested long-lived classic access tokens.

The attacker also obtained write access to the axios GitHub repository and used it to delete community issue reports during the incident — actively suppressing the community's ability to coordinate a response. Those reports were later restored.

### The Attack: Phantom Dependency and Postinstall Hook

The attack's technical elegance was in what it did *not* do. Zero lines of axios source code were modified.

Instead, the attacker modified only `package.json`, adding `plain-crypto-js@^4.2.1` as a new dependency. `plain-crypto-js` was a phantom — a package UNC1069 had published the night before, specifically to serve as the malicious delivery vehicle. Its `postinstall` hook ran `setup.js` automatically at the conclusion of `npm install`, before the installing developer had any awareness that something had executed.

The staging was deliberate and reveals operational security discipline:

1. `plain-crypto-js@4.2.0` was published first as a clean stub — to reserve the namespace without triggering immediate detection.
2. The C2 domain `sfrclak[.]com` was registered independently, separately in time from the package publications.
3. `plain-crypto-js@4.2.1` with the malicious hook followed 18 hours later.
4. Only after the phantom dependency was live did the attacker publish the malicious axios version that would pull it in.

This staged approach was designed to create plausible deniability at each step and reduce the window in which any single publish event could be flagged before the full chain was operational.

### The Dropper: Two-Layer Obfuscation

`setup.js` used a two-layer obfuscation scheme:
- **Layer 1:** String reversal combined with Base64 encoding
- **Layer 2:** XOR with key `"OrDeR_7077"` using a position-dependent index calculated as `7 * i² % 10`

The resulting dropper reached out to `sfrclak[.]com:8000/6202033` masquerading as npm registry traffic — HTTP POST requests to paths formatted as `packages.npm.org/product0`, `product1`, `product2`. Traffic blending with legitimate npm registry calls was deliberate: most CI/CD environments allow outbound traffic to npm registries without inspection.

After delivering and executing the WAVESHAPER.V2 payload, `setup.js` self-deleted. Then the malicious `package.json` was replaced with a clean version matching `plain-crypto-js@4.2.0`. The result: a post-infection `npm list` would show `plain-crypto-js@4.2.0` — the clean stub — with no indication that `4.2.1` had ever run. Standard incident response tooling would find nothing.

### Detection

Socket.dev's automated detection systems flagged `plain-crypto-js@4.2.1` as malware six minutes after it was published — before axios@1.14.1 had even been published. This early detection didn't prevent the axios publication (Socket.dev monitors for malicious packages but cannot prevent npm account takeovers), but it meant the malicious vector was already in Socket.dev's database when axios@1.14.1 appeared.

StepSecurity Harden-Runner in Backstage's CI pipeline detected C2 traffic 1.1 seconds into `npm install` — the moment the postinstall hook fired and `setup.js` made its first callback. This detection triggered the escalation chain that led to community awareness and, ultimately, npm removal within approximately 3 hours of the malicious axios publish.

The 3-hour window narrowly avoided the global Monday morning CI/CD surge. Had the malicious `latest` tag persisted into standard business hours across major time zones, the number of `npm install` operations that would have pulled `axios@1.14.1` would have been substantially higher.

---

## Technical Analysis

### The Phantom Dependency Pattern

The axios attack demonstrates a supply chain technique that is difficult to detect with conventional tooling. By not modifying any source code — only the dependency manifest — the attacker:

1. Bypassed source code review: any human review of the axios diff would show only a new dependency, not malicious code.
2. Avoided file-level hash detection: the axios tarball itself was "clean" — only `package.json` changed.
3. Separated the malicious payload into a separately published package, creating temporal and artifact distance from the trusted target.

The dependency resolution chain: `axios@1.14.1` → `plain-crypto-js@^4.2.1` → `postinstall: node setup.js` → WAVESHAPER.V2. Any tool inspecting the axios package alone would see a legitimate library with a new dependency. Only tools that analyze the full transitive dependency tree — and that actively monitor newly published dependencies — would catch this at install time.

### WAVESHAPER.V2 Capabilities

WAVESHAPER.V2 is a full remote access trojan with the following documented capabilities:

**Protocol:**
- JSON over HTTP POST
- Body: Base64-encoded
- User-Agent: hardcoded IE8 string (`mozilla/4.0 (compatible; msie 8.0; windows nt 5.1; trident/4.0)`) — a classic detection evasion technique using an anachronistic user agent that few modern security tools actively flag
- C2: `sfrclak[.]com:8000/6202033`
- Beacon interval: 60 seconds

**FirstInfo beacon (immediate on first contact):**
- Exfiltrates directory listings of: home directory, Desktop, Documents, `.config`
- Provides attackers a complete inventory of the compromised machine's user data structure without executing any further commands

**Command capabilities:**
- `kill` — terminate the agent
- `peinject` — reflective .NET assembly injection on Windows; enables loading arbitrary code into existing process memory without writing to disk, bypassing many EDR detections
- `runscript` — execute arbitrary scripts
- `rundir` — execute all scripts in a directory

**Platform payloads:**

| Platform | Status | Delivery Path | Notes |
|----------|--------|---------------|-------|
| macOS | Fully operational | `/Library/Caches/com.apple.act.mond` | Mach-O universal binary (x86_64 + arm64); developer build path leak: `/Users/mac/Desktop/Jain_DEV/client_mac/macWebT/` |
| Windows | Partially implemented | Registry `MicrosoftUpdate` key + `system.bat` | Persistence established but `work()` function never called — beacon loop never activated; "unfinished refactoring" per Datadog |
| Linux | Non-functional | `/tmp/ld.py` | `os.getlogin()` crashes in containers without TTY; `b64_string` undefined prevents payload delivery; CI/CD pipelines (primary target) unaffected |

### Anti-Forensics: The Manifest Swap

The most operationally significant anti-forensic technique in this attack is the post-infection manifest swap. After WAVESHAPER.V2 executes:

1. `setup.js` self-deletes from the filesystem
2. The malicious `package.json` (referencing `plain-crypto-js@4.2.1`) is replaced with a copy referencing `plain-crypto-js@4.2.0` (the clean stub)

The result: `npm list` on a compromised machine shows `plain-crypto-js@4.2.0`. `npm audit` reports nothing. The node_modules directory contains no trace of the malicious version. Standard post-incident dependency auditing would clear the machine as unaffected.

Detection of this attack pattern requires either: (1) runtime monitoring at install time (what Harden-Runner provided), (2) automated pre-install package analysis (what Socket.dev provided), or (3) network-level detection of the C2 callback.

### Why npm Provenance Failed Here

npm's Trusted Publisher model uses OIDC-based publishing via GitHub Actions, creating cryptographic attestation binding a package publish to a specific workflow run, repository, and commit. Both malicious axios versions were published **manually** — not via GitHub Actions OIDC.

The forensic signatures of a manual (vs. OIDC-attested) publish:
- No `gitHead` field in package metadata (OIDC publishes include this)
- No corresponding GitHub commit or tag for the published version
- No `npm publish --provenance` attestation in the registry
- Published to `latest` tag without corresponding git operations

Tools that verify provenance — such as `socket.dev`, Sigstore's npm plugin, or manual inspection of the npm provenance API — would have flagged both packages as lacking attestation. `npm audit` would not: it checks for known vulnerabilities in published packages, not for missing provenance. The distinction is critical: npm audit is a reactive tool (checks against known-bad); provenance is a structural control (verifies that published packages came from a trusted pipeline).

### AI Ecosystem Exposure

The axios compromise had specific and direct relevance to AI infrastructure:

- **LangChain.js** uses axios for HTTP transport for LLM API calls
- **LangGraph.js** inherits axios transitively
- Any Node.js AI agent making calls to OpenAI, Anthropic, or other LLM APIs through these frameworks had axios in its call stack

WAVESHAPER.V2's `peinject` capability — reflective .NET assembly injection — enables loading arbitrary code into a running process without writing to disk. On a Windows machine running a LangChain.js agent, this could silently intercept HTTP POST requests to `api.anthropic.com` or `api.openai.com` at the transport layer — capturing API keys, request contents, and response data, including any sensitive prompts, tool call results, or intermediate agent reasoning. **Important caveat:** `peinject` is a Windows-only capability, and the Windows WAVESHAPER.V2 payload never activated its beacon loop during this incident (the `work()` function was never called). There were zero confirmed Windows C2 beacons. The AI transport-layer interception scenario is therefore a theoretical risk that did not materialize in this attack — it describes the capability the attacker built and what it would have enabled, not what it achieved.

---

## Root Cause Analysis

**Proximate cause:** UNC1069 obtained Jason Saayman's authenticated npm session via a browser-session-harvesting RAT delivered through social engineering, used those credentials to publish malicious axios versions with a phantom dependency, and that phantom dependency's postinstall hook executed WAVESHAPER.V2 on machines that ran `npm install` during the 3-hour exposure window.

**Why 1: Why did the social engineering succeed?**
Saayman was targeted with a multi-layer, high-production-value attack: LinkedIn impersonation of a real person, a professional-looking Slack workspace, and a Microsoft Teams video call with deepfake participants. Each layer provided social proof for the next. The deepfake video call is the critical escalation — it transformed what might have been suspicious (a text-only social engineering attempt) into an apparently legitimate synchronous interaction with apparent visual verification. The combination defeated the heuristics that normally help people identify phishing: real-looking person, real-seeming real-time video, professional context.

**Why 2: Why was browser session harvesting sufficient to bypass npm 2FA?**
npm's 2FA protects against password theft but not session token theft. A valid authenticated session cookie grants the same API access as an authenticated user without requiring the second factor. Browser-session-harvesting RATs (which read from the browser's encrypted credential store after obtaining OS-level access) bypass TOTP and hardware key requirements entirely because they steal the post-authentication session, not the pre-authentication credentials. npm's Trusted Publisher (OIDC) model would have been resistant — it creates per-publish cryptographic attestations tied to GitHub Actions workflow runs, not to account sessions — but it only applies to automated publishing pipelines, not to manual publishes.

**Why 3: Why did a phantom dependency with a postinstall hook work as a delivery mechanism?**
npm's `postinstall` lifecycle hook is a first-class feature that executes arbitrary code at install time. It exists legitimately for packages that need to compile native addons, download platform-specific binaries, or perform setup operations. No npm account permissions are required to publish a package with a postinstall hook — any npm account can publish one. There is no default review gate, no sandboxing, and no capability restriction on what postinstall hooks can do. The hook executed with the same user and filesystem permissions as the developer or CI runner that ran `npm install`.

**Why 4: Why didn't standard security tooling detect this before execution?**
`npm audit` checks package names and versions against a database of known vulnerabilities. `plain-crypto-js@4.2.1` was not in that database (it was minutes old). `npm audit` does not inspect package code or analyze postinstall hooks. `package-lock.json` integrity checks verify that installed packages match the lockfile — but in CI environments where `npm install` is run without a lockfile, or where the lockfile is regenerated, this protection doesn't apply. Only tools that perform real-time behavioral analysis at publish time (Socket.dev) or at install time (Harden-Runner network monitoring) had the capability to detect this attack class.

**Why 5 / Root cause:** The npm ecosystem's trust model is built on account-level authentication rather than workflow-level cryptographic attestation. Any account with publish access can push any package version to `latest` — the infrastructure has no mechanism to distinguish "Jason Saayman, intentionally publishing a new axios version from his development machine" from "an attacker with Jason Saayman's session tokens, publishing a malicious version." The Trusted Publisher feature addresses this for automated CI pipelines, but manual publishing — which maintainers of long-established packages often use — has no equivalent structural protection. This architectural gap means that every major npm package whose maintainer can be social-engineered is a potential delivery vehicle for whatever payload the attacker wants to run on every machine that runs `npm install`.

**Root cause summary:** npm's manual publish pathway has no cryptographic binding between a publish event and a trusted, verifiable code pipeline. Account session compromise — achievable through social engineering without any npm-specific vulnerability — grants unrestricted publish access to packages with hundreds of millions of weekly downloads. The postinstall hook execution model provides a zero-friction code execution primitive that runs with full user permissions before the developer is aware it has run.

---

## Impact Assessment

**Severity:** Critical

**Criteria met:**
- Nation-state actor (UNC1069/DPRK) used compromised npm package with ~100M weekly downloads as delivery vehicle
- WAVESHAPER.V2 RAT fully functional on macOS; 135+ confirmed C2 beacons
- AI framework transitive exposure: LangChain.js, LangGraph.js, and any Node.js AI agent using axios for LLM API calls
- Anti-forensic manifest swap means actual infection scope likely understated
- Part of broader Contagious Interview campaign simultaneously targeting Lodash, Fastify, dotenv maintainers

**Who was affected:**

*Confirmed:*
- **Backstage (CNCF):** Sandboxed CI environment detected C2 callback 1.1 seconds into npm install via Harden-Runner; no production impact due to sandboxing
- **Datadog:** Acknowledged exposure in "several components"; directed customers to Trust Center for status
- **Huntress partners:** 135+ endpoints confirmed contacting C2 `sfrclak[.]com:8000/6202033`
- **Wiz:** Reported 3% execution rate among cloud environments running `npm install` during the window; 80% of cloud environments had axios installed (used as exposure estimate, not confirmed infection count)

*At-risk but implementation-bug-protected:*
- All CI/CD pipelines running Linux that executed `npm install` during the window — Linux payload non-functional due to TTY crash and undefined variable
- Windows development and CI environments — Windows payload persistence established but beacon loop never activated

*Structural exposure:*
- 174,000 npm packages depend on axios
- `slack-github-action` (used by 23,000+ repositories) depended on axios — transmitted malicious version to all consumers
- LangChain.js and LangGraph.js users with transitive axios dependency

**Confirmed C2 activity:**
- 135+ endpoints (Huntress partner base only; does not capture organizations not using Huntress)
- FirstInfo beacons exfiltrated directory listings from all macOS infections on first contact

**What the Windows and Linux bugs prevented:**
The Linux payload would have been the most consequential if functional. CI/CD pipelines run overwhelmingly on Linux containers without TTYs. A functioning Linux payload during a 3-hour window that included a Saturday evening UTC low-traffic period — but preceded a Monday morning surge — would have infected every CI pipeline globally that ran `npm install` on `latest` axios without a lockfile pinning an earlier version. The scale of that exposure (estimated ~5,000+ environments during the actual window; potentially 25,000-50,000 on a Monday morning) would constitute one of the largest simultaneous CI/CD RAT infections in software supply chain history.

**Advisory coverage:**
- GHSA-fw8c-xr5c-95f9 (GitHub Advisory Database)
- MAL-2026-2307 (OSV)
- SNYK-JS-AXIOS-15850650 (Snyk)
- No traditional CVE assigned (this is a supply chain compromise, not a vulnerability in axios itself)

---

## How It Could Have Been Prevented

1. **Enable npm provenance attestation and require it in your CI pipeline.** Both malicious axios versions were published without provenance attestation — no `gitHead` field, no corresponding git commit, no cryptographic binding to a GitHub Actions workflow. Tools like Socket.dev's provenance checks, or direct inspection of the npm provenance API, would have flagged this before any `npm install`. Organizations with security-sensitive CI pipelines should configure package managers to reject packages from `latest` tags that lack provenance attestation.

2. **Pin package-lock.json and verify integrity before npm install.** CI pipelines that use `npm ci` (not `npm install`) against a committed lockfile would have rejected `axios@1.14.1` if the lockfile referenced an older version. The attack succeeded in environments running `npm install` without a pinned lockfile. `npm ci` enforces exact version matching — a single character difference in the resolved version triggers a failure, not a silent upgrade to `latest`.

3. **Deploy runtime egress monitoring on all CI runners.** StepSecurity Harden-Runner detected the attack 1.1 seconds after execution — before it could do any secondary damage to the Backstage CI environment. Harden-Runner (or equivalent egress monitoring) provides detection even when static analysis fails, because the postinstall hook must make a network call to deliver the payload. Any unexpected outbound connection during `npm install` to a non-npm-registry domain should trigger an immediate alert. In blocking mode, this would have terminated the dropper before WAVESHAPER.V2 was delivered.

4. **Require hardware security keys (FIDO2/passkeys) for npm publisher accounts on critical packages.** npm's WebAuthn/passkey support is available but not mandatory. Browser-session-harvesting RATs cannot steal hardware key credentials — the key never leaves the physical device. Requiring FIDO2 authentication for all publish operations on packages with >1M weekly downloads would have made the session hijacking attack insufficient to publish. (Note: this does not address OIDC-published packages, where the session token is not the relevant credential.)

5. **Subscribe to real-time package security monitoring.** Socket.dev detected the malicious `plain-crypto-js@4.2.1` six minutes after publication — before axios was touched. Organizations using npm ecosystem components in production should subscribe to tools that perform behavioral analysis at publish time, not just at audit time. `npm audit` is retrospective (checks against known-bad lists). Real-time behavioral monitors are prospective (flag suspicious packages at the moment of publication).

6. **Enforce 2-person review for npm publish operations on high-impact packages.** Many open source projects with large download counts are maintained by individuals or small teams with unconstrained publish access. Requiring a second reviewer or a mandatory CI pipeline for publishing to `latest` — as GitHub's Trusted Publisher model enforces for OIDC-attested packages — would require an attacker to compromise multiple accounts or workflows rather than one. This is an organizational governance change, not a technical one, but it directly addresses the single-maintainer-as-attack-surface problem.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**

*npm:*
- Removed `axios@1.14.1` and `axios@0.30.4` approximately 2h54m after the malicious publish (~03:15 UTC March 31)
- Replaced `plain-crypto-js` with a security stub at 04:26 UTC
- Restored the `jasonsaayman` account to legitimate owner control

*Jason Saayman:*
- Publicly acknowledged compromise at 04:08 UTC
- Worked with npm to remove malicious versions and restore account
- Published axios patch release to confirm clean state

*Socket.dev:*
- Detected `plain-crypto-js@4.2.1` as malware 6 minutes after publication
- Flagged axios@1.14.1 and @0.30.4 immediately upon publication
- Published malware analysis including dropper hash and C2 IOCs

*StepSecurity:*
- Harden-Runner detected C2 callback from Backstage CI 1.1 seconds after npm install began
- Published IOC list and detection guidance
- Provided cross-organization correlation of C2 beacon data (135+ confirmed endpoints via Huntress)

*Datadog:*
- Acknowledged exposure
- Directed customers to Trust Center for status updates
- Performed internal remediation of affected components

**What affected organizations should do:**

1. **If you ran `npm install` axios between 00:21 and ~03:15 UTC on March 31, 2026:** Check for the IOCs listed in the IOC Table below. On macOS specifically, check for `/Library/Caches/com.apple.act.mond`. Check outbound connection logs for `sfrclak[.]com:8000`. Do not rely on `npm list` — the manifest swap means it will show a clean version even on infected machines.

2. **Rotate all credentials accessible from affected machines:** API keys, cloud credentials, SSH keys, browser-stored passwords. The FirstInfo beacon exfiltrated directory listings on first contact; any machine that beaconed to the C2 should be treated as fully compromised from the perspective of secrets management.

3. **Audit your transitive dependency tree for axios:** Check whether `axios` appears transitively through LangChain.js, LangGraph.js, or any other dependency. If so, verify that the installed version is not `1.14.1` or `0.30.4`.

4. **Enable npm provenance checking** and configure alerting for packages in your dependency tree that publish to `latest` without provenance attestation.

---

## Solutions Analysis

### 1. npm Trusted Publisher Enforcement (Mandatory Provenance for High-Download Packages)
- **Type:** Platform-Level Cryptographic Control
- **Plausibility:** 5/5 — Both malicious versions were published without OIDC provenance attestation. Mandatory provenance for packages above a download threshold (e.g., >1M weekly) would have made the manual publish pathway unavailable — the attacker would have needed to compromise a GitHub Actions workflow, not just a session token. Provenance creates a cryptographic audit trail that can be verified at install time.
- **Practicality:** 3/5 — npm would need to make this mandatory, not optional. Large packages often have manual publish workflows by convention. Transition requires maintainer tooling changes and a grace period. The technical infrastructure exists; the governance change is the friction. npm has signaled interest in mandatory provenance but has not implemented it as of curation date.
- **How it applies:** If axios had been enrolled in mandatory provenance publishing, `axios@1.14.1` would have failed to publish — the compromised session token cannot create an OIDC attestation binding the publish to a legitimate GitHub Actions run. The phantom dependency would have had nowhere to land.
- **Limitations:** Only addresses the manual publish attack vector. A compromised GitHub Actions workflow could still publish with valid (but fraudulent) provenance. Does not prevent account takeover — only prevents takeovers from materializing as successful publishes.

### 2. Transitive Dependency Runtime Sandboxing (postinstall Hook Restriction)
- **Type:** Runtime Sandboxing / Capability Restriction
- **Plausibility:** 4/5 — The postinstall hook is the execution primitive that made this attack work. Node.js could restrict postinstall hooks to declared capabilities (network access, filesystem writes, process spawning) similar to browser extension permissions. Tools like `socket.dev`'s capability analysis already flag hooks that request excessive capabilities.
- **Practicality:** 2/5 — Changing npm's hook execution model would break legitimate packages that depend on unrestricted postinstall for native compilation, binary downloads, and setup operations. A capability model would require npm-registry-level policy, maintainer opt-in to capability declarations, and an ecosystem-wide migration period. High value; high friction.
- **How it applies:** If postinstall hooks required explicit capability declarations and a network call to a non-npm domain required an explicit `allowedNetworkHosts` declaration, `setup.js`'s call to `sfrclak[.]com` would have been blocked at execution time without any external monitoring tooling. The hook would have been sandboxed to the local filesystem.
- **Limitations:** Does not prevent all postinstall-based attacks — only those requiring capabilities the maintainer doesn't declare. A sophisticated attacker could declare broad capabilities to avoid this control. Native addon compilation legitimately requires filesystem and subprocess access.

### 3. Social Engineering Resistance: Hardware Keys + Out-of-Band Publish Confirmation
- **Type:** Authentication Hardening / Procedural Control
- **Plausibility:** 5/5 — The attack hinged on browser session harvesting bypassing npm 2FA. A hardware FIDO2 key (YubiKey, Passkey on device) cannot be extracted by a RAT — the key never leaves the physical device, and authentication requires physical presence. Even with a fully compromised machine, a hardware key prevents the attacker from authenticating to npm on a different device.
- **Practicality:** 3/5 — Requires maintainer adoption. npm supports WebAuthn but doesn't mandate it for any account, let alone for high-impact package accounts. An npm policy requiring hardware key enrollment for accounts with publish access to packages above a download threshold would be narrow in scope (few accounts) but high in impact. The governance question is whether npm can/will mandate this.
- **How it applies:** If Saayman's npm account required hardware key authentication for all publish operations, the session token theft would have been insufficient. The attacker would have needed physical access to Saayman's enrolled device to publish. The deepfake call attack chain would have failed at the authentication step.
- **Limitations:** Does not prevent a more sophisticated attack where the attacker compromises the developer's machine at a level that can intercept FIDO2 authentication (boot-level compromise, firmware implants). For most nation-state social engineering attacks, however, hardware keys provide significant friction. Also does not address GitHub-Actions-based publishing paths, which use OIDC and are not protected by hardware keys.

### 4. Automated Dependency Behavioral Analysis at Install Time (Socket.dev-class Tooling)
- **Type:** Monitoring and Detection
- **Plausibility:** 4/5 — Socket.dev detected `plain-crypto-js@4.2.1` 6 minutes after publication, before axios@1.14.1 was even published. An organization with Socket.dev (or equivalent) in its CI pipeline would have seen an alert when axios@1.14.1 was pulled — the transitive dependency was already flagged. Real-time behavioral analysis at publish time provides a detection window that `npm audit` cannot: it flags suspicious packages based on code analysis, not just known-bad lists.
- **Practicality:** 4/5 — Socket.dev and similar tools (Snyk's package health, Phylum) are available as CI pipeline integrations. Configuration is low-friction: add a pre-install check step, configure an alert or block policy, review alerts. The main friction is organizational adoption and the occasional false positive on legitimate new packages.
- **How it applies:** A CI pipeline with Socket.dev integration running `socket npm install` instead of bare `npm install` would have blocked or flagged the axios@1.14.1 install based on the transitive `plain-crypto-js@4.2.1` detection. The install would have either failed (block policy) or triggered an alert before execution.
- **Limitations:** Real-time analysis has a latency window — Socket.dev caught the malicious package 6 minutes after publication, which is fast but not zero. A very short-lived malicious package (published and pulled within seconds) could theoretically execute before detection. Also: Socket.dev caught this specific attack; future variants using more sophisticated evasion may take longer to detect.

### 5. Cryptographic Package Lockfile Pinning with Pre-Install Integrity Verification
- **Type:** Supply Chain Integrity / Deterministic Builds
- **Plausibility:** 5/5 — `npm ci` enforces exact version matching against a committed lockfile. If the lockfile specifies `axios@1.13.6`, `npm ci` will reject `1.14.1` and fail the build. The attack depends on `npm install` resolving `latest` — which means any environment using `npm ci` against a committed lockfile pinned to a known-good axios version was structurally immune to this attack.
- **Practicality:** 4/5 — `npm ci` is already the recommended approach for CI/CD pipelines. The change is: commit `package-lock.json` to the repository, use `npm ci` in CI pipelines rather than `npm install`, and implement a formal version update review process (Dependabot or Renovate PRs reviewed before merge). This is a well-established practice with existing tooling; the friction is organizational discipline to maintain it.
- **How it applies:** Any CI pipeline running `npm ci` against a lockfile pinned to `axios@1.13.6` would have ignored the `latest` tag entirely. The lockfile resolution is deterministic — `axios@1.14.1` would never have been fetched.
- **Limitations:** Only protects environments that have committed lockfiles and use `npm ci`. Many development environments use `npm install` without lockfiles for flexibility. Local developer machines — which also ran the malicious version — frequently don't have strict lockfile discipline. The macOS infections (the fully functional infections) likely occurred on developer machines, not CI systems.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-009]] | Earlier supply chain attack in same `supply-chain-ai-infrastructure` pattern group; npm ecosystem compromise targeting AI agent dependencies |
| [[AAGF-2026-020]] | Supply chain AI infrastructure — same pattern group; postinstall hook exploitation in npm ecosystem |
| [[AAGF-2026-055]] | Supply chain AI infrastructure — same pattern group; transitive dependency exploitation in AI agent toolchain |
| [[AAGF-2026-067]] | hackerbot-claw Trivy compromise — same calendar date (March 31, 2026), entirely unrelated technically (Socket.dev confirmed no link), but illustrates that March 31 was a high-activity supply chain threat day; same `supply-chain-ai-infrastructure` pattern group |

---

## IOC Table

| IOC Type | Value | Notes |
|----------|-------|-------|
| C2 domain | `sfrclak[.]com` | Defanged; registered 2026-03-30 16:03 UTC |
| C2 endpoint | `sfrclak[.]com:8000/6202033` | Full RAT beacon endpoint |
| C2 IP | `142.11.206.73` | Namecheap/Hostwinds hosting |
| C2 path pattern | `packages.npm.org/product0`, `product1`, `product2` | Masquerades as npm registry traffic |
| Attacker npm account email | `ifstap@proton.me` | Proton Mail; used after account email change |
| Malicious npm package | `plain-crypto-js@4.2.1` | Phantom dependency; do NOT install |
| Malicious npm package | `plain-crypto-js@4.2.0` | Clean stub (namespace reservation); safe but remove |
| Malicious axios version | `axios@1.14.1` | npm shasum: `2553649f2322049666871cea80a5d0d6adc700ca` |
| Malicious axios version | `axios@0.30.4` | npm shasum: `d6f3f62fd3b9f5432f5782b62d8cfd5247d5ee71` |
| Dropper file | `setup.js` (plain-crypto-js postinstall) | SHA-256: `e10b1fa84f1d6481625f741b69892780140d4e0e7769e7491e5f4d894c2e0e09` |
| macOS payload | WAVESHAPER.V2 Mach-O universal binary | SHA-256: `92ff08773995ebc8d55ec4b8e1a225d0d1e51efa4ef88b8849d0071230c9645a` |
| macOS install path | `/Library/Caches/com.apple.act.mond` | Persistence location |
| macOS build path (leak) | `/Users/mac/Desktop/Jain_DEV/client_mac/macWebT/` | Developer path in binary; attribution artifact |
| Windows payload | PowerShell script | SHA-256: `617b67a8e1210e4fc87c92d1d1da45a2f311c08d26e89b12307cf583c900d101` |
| Windows persistence | Registry key `MicrosoftUpdate` + `system.bat` | Persistence established; beacon loop never activated |
| Linux payload | `/tmp/ld.py` | SHA-256: `fcb81618bb15edfdedfb638b4c08a2af9cac9ecfa551af135a8402bf980375cf` |
| RAT User-Agent | `mozilla/4.0 (compatible; msie 8.0; windows nt 5.1; trident/4.0)` | Hardcoded IE8 string for C2 traffic |
| XOR key | `OrDeR_7077` | Dropper obfuscation key; index: `7 * i² % 10` |
| Secondary packages | `@qqbrowser/openclaw-qbot@0.0.130` | Also compromised; same campaign |
| Secondary packages | `@shadanai/openclaw` | Also compromised; same campaign |
| Advisory | GHSA-fw8c-xr5c-95f9 | GitHub Advisory Database |
| Advisory | MAL-2026-2307 | OSV |
| Advisory | SNYK-JS-AXIOS-15850650 | Snyk |

---

## Key Takeaways

1. **The manifest swap makes post-infection npm forensics unreliable — deploy monitoring at install time, not after.** WAVESHAPER.V2 replaced the malicious `package.json` with a clean stub post-infection. `npm list`, `npm audit`, and standard dependency tree inspection will show nothing wrong on a compromised machine. Detection requires: (a) real-time behavioral monitoring at install time (Harden-Runner, Socket.dev), or (b) network-level detection of C2 callbacks, or (c) forensic analysis of process execution history. If your detection strategy relies on `npm audit` run after the fact, you will miss this attack class entirely.

2. **postinstall hooks run with full user permissions before you know they exist — treat them as untrusted code.** The npm postinstall lifecycle hook is a first-class execution primitive with no sandboxing, no capability restrictions, and no user-visible execution notification. Every `npm install` on a package with a postinstall hook executes arbitrary code as the installing user. Defending against this class of attack requires either: (a) pre-install analysis of the package being installed (not just the named package, but all transitive dependencies), or (b) network egress monitoring that fires the moment the hook makes an outbound connection. Neither is default in standard development tooling.

3. **AI agent HTTP transport dependencies are nation-state-quality attack targets.** LangChain.js and LangGraph.js depend on axios for HTTP transport — which means every LLM API call made by a Node.js AI agent in a framework passes through axios. A functioning WAVESHAPER.V2 on Windows with its `peinject` capability could have intercepted LLM API traffic at the transport layer, capturing API keys, prompt content, and agent reasoning from inside the agent process. If your AI agent depends on a popular npm HTTP library, that library's supply chain security is part of your AI security posture.

4. **The Monday morning CI/CD surge that wasn't: timing is a mitigating factor, not a reliable control.** The 3-hour exposure window coincidentally fell on a Saturday night UTC — the lowest-traffic period for global CI/CD pipelines. The estimated ~178,000 install operations during the window would have been 5-10x higher on a Monday morning. UNC1069 may have intentionally timed the attack for low-traffic hours to extend the window before detection; the same timing reduced the actual blast radius. Do not rely on timing luck as a security control. The next attack may be timed for maximum impact.

5. **Session-level npm account compromise bypasses 2FA — hardware keys for high-impact package maintainers are necessary, not optional.** npm's TOTP and hardware key 2FA protect against password theft. They do not protect against an authenticated browser session being stolen by a RAT running on the maintainer's machine. An installed RAT can read browser credential stores after obtaining OS-level access — the second factor was already satisfied by the legitimate user, and the session token represents that satisfied state. Only hardware keys (FIDO2/WebAuthn) are resistant to this attack, because they require physical device presence for each authentication operation. npm should mandate hardware key enrollment for accounts publishing packages above a meaningful download threshold.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| Socket.dev — Primary malware analysis (plain-crypto-js + axios) | https://socket.dev/blog/malicious-package-detected-in-axios-1-14-1 | 2026-03-31 | High — automated detection source; behavioral analysis of dropper; dropper SHA-256 and C2 IOCs; 6-minute detection timeline |
| StepSecurity — CI detection and Harden-Runner analysis | https://www.stepsecurity.io/blog/axios-supply-chain-attack-waveshaper-v2 | 2026-03-31 | High — primary CI detection source; Backstage C2 callback 1.1s; vendor (Harden-Runner); direct commercial interest; technical facts corroborated by independent sources |
| Datadog — Victim disclosure and platform payload analysis | https://www.datadog.com/blog/axios-supply-chain-compromise-2026/ | 2026-03-31 | High — victim organization; "unfinished refactoring" characterization of Windows work() bug; "several components" exposure acknowledgment |
| Huntress — 135+ endpoint C2 beacon confirmation | https://www.huntress.com/blog/axios-waveshaper-npm-supply-chain | 2026-03-31 | High — security vendor with direct visibility into partner endpoints; 135+ confirmed C2 beacons figure; partner-base caveat noted |
| Wiz — Cloud environment exposure analysis | https://www.wiz.io/blog/axios-npm-supply-chain-attack-march-2026 | 2026-04-01 | High — cloud security vendor with broad cloud environment telemetry; 3% execution rate and 80% axios installation rate estimates |
| Mandiant/Google — UNC1069 attribution and Contagious Interview campaign | https://www.mandiant.com/resources/blog/unc1069-axios-npm-supply-chain | 2026-04-02 | High — primary attribution source; UNC1069 designation; high-confidence DPRK attribution; Contagious Interview 1,700+ package context |
| GitHub Advisory Database | https://github.com/advisories/GHSA-fw8c-xr5c-95f9 | 2026-03-31 | High — authoritative advisory; GHSA-fw8c-xr5c-95f9 |
| OSV | https://osv.dev/vulnerability/MAL-2026-2307 | 2026-03-31 | High — open source vulnerability database; MAL-2026-2307 |
| Snyk | https://security.snyk.io/vuln/SNYK-JS-AXIOS-15850650 | 2026-03-31 | High — developer security vendor; SNYK-JS-AXIOS-15850650; technical payload details |
| axios GitHub issue (community response) | https://github.com/axios/axios/issues/axios-1-14-1-security | 2026-03-31 | Medium — first community issue filed at 02:19 UTC; Jason Saayman public acknowledgment at 04:08; community timeline corroboration |

**Source bias disclosure:** All primary technical sources (Socket.dev, StepSecurity, Datadog, Huntress, Wiz, Mandiant/Google, Snyk) are commercial security vendors with structural incentives toward high-severity characterization of incidents — each benefits from the incident being classified as serious and widespread (product validation, media coverage, client demand for their detection/response services). No independent third-party analysis (academic, non-commercial, or government CERT) is available as of curation date. Quantitative figures from vendor sources (Huntress 135-endpoint count, Wiz 3% execution rate estimate) reflect each vendor's proprietary sensor network and may not be representative of the broader affected population. Technical facts corroborated across multiple independent vendors are treated as more reliable; single-vendor figures are treated as estimates.

---

## Strategic Council Review

*Reviewed: 2026-05-08 | Confidence: Medium-High*

---

### Phase 1 — Challenger

**Challenge 1: Attribution is asserted as confirmed in the narrative, not as a high-confidence assessment.**
The draft title, headline_stat, and body text present UNC1069/DPRK as fact. The only named attribution source is Mandiant/Google. Nation-state attribution is adversarially contested and commercially incentivized for escalation. The macOS build path (`/Users/mac/Desktop/Jain_DEV/client_mac/macWebT/`) is cited as an attribution artifact but is a developer path leak — it is neither determinative of geography nor independently linked to a confirmed DPRK developer. The Contagious Interview campaign pattern matching is circumstantial. The researcher_notes caveat this correctly; the narrative body does not.

**Challenge 2: The $10,000/machine IBM cost benchmark has a unit conflation error.**
IBM's Cost of a Data Breach 2024 expresses cost per breach record across an average of ~500 affected systems, not per compromised machine. A compromised machine may expose anywhere from one credential token (a single-purpose CI runner) to thousands of records (a developer workstation with multi-system access). Applying the derived per-record rate as a per-machine rate without justification inflates or deflates the recovery estimate in ways that depend entirely on what was on each machine — which is unknown.

**Challenge 3: The averted_damage_usd figure stacks four multiplicatively uncertain estimates.**
The $25M figure multiplies: (a) Wiz's 3% execution rate (vendor sensor network estimate, not npm data); (b) ~178K installs during the window (derived from an averaging assumption that ignores the Saturday-night low-traffic effect the draft itself acknowledges); (c) $10K/machine (the contested IBM figure); (d) a 0.5 probability weight (subjective). Four uncertain multipliers produce a composite with at least ±10x uncertainty. The resulting dollar figure expressed to five significant figures implies precision that the methodology does not support.

**Challenge 4: The "partial" actual_vs_potential classification is arguable — a case exists for "actual."**
Real damage occurred: 135+ confirmed C2 beacons, FirstInfo directory listing exfiltration from all macOS infections, and a named enterprise (Datadog) acknowledged component exposure. The classification as "partial" relies on the attack's intended CI/CD-pipeline scope having been frustrated by implementation bugs — not on the absence of real harm. Whether "partial" or "actual" is correct depends on whether the schema definition anchors to intent-vs-outcome or harm-vs-no-harm, and the draft's reasoning is somewhat circular on this point.

**Challenge 5: The peinject/AI-traffic-interception scenario is Windows-only, and the Windows payload never activated.**
The AI Ecosystem Exposure section presents the scenario of WAVESHAPER.V2 intercepting LLM API traffic via `peinject` without noting that `peinject` is a Windows-only capability and the Windows payload had zero confirmed C2 beacons — the beacon loop never fired. The AI transport-layer interception threat did not materialize. The AI Ecosystem Exposure section carries this scenario without the same caveat visible in the Technical Analysis payload table, creating misleading narrative continuity between real macOS infections and a theoretical Windows threat.

**Challenge 6: Every quantitative figure and technical finding originates from commercial vendors with incentive toward high severity — the bias disclosure is uneven.**
Socket.dev, StepSecurity, Huntress, Wiz, Mandiant/Google, and Snyk all benefit commercially from this incident being classified as severe and consequential. The References credibility table singles out StepSecurity for "direct commercial interest" but applies no equivalent flag to the others. No independent source (academic, CERT, or non-commercial) is present. The draft's researcher_notes acknowledge this risk but do not address it systematically across the source table.

---

### Phase 2 — Steelman

**Defense 1: "Critical" severity is fully justified, independent of implementation bugs.**
A supply chain RAT delivery via a 100M-weekly-download package, with 135+ confirmed C2 beacons across multiple named organizations (Backstage/CNCF, Datadog), executed by a state-level actor using novel deepfake social engineering and an anti-forensic manifest swap, meets any credible "critical" threshold. Implementation bugs that limited scope do not reduce the severity of what was achieved. Critical severity is not reserved for incidents that achieve maximal damage.

**Defense 2: "Partial" is the correct actual_vs_potential classification.**
The intended primary target was Linux CI/CD pipelines — which were entirely unaffected (Linux payload non-functional in all container environments). The Windows payload was also non-functional. Only macOS developer machines were infected. The attack as designed was intended to achieve persistent nation-state RAT access across global CI/CD infrastructure; what it achieved was macOS developer machine credential exposure. "Partial" correctly distinguishes intent-vs-outcome and preserves the explanatory value of the potential_damage field. Classifying as "actual" would obscure the gap between what happened and what was designed to happen.

**Defense 3: This is a genuine AI agent incident, not merely a supply chain incident.**
axios is not incidentally present in AI infrastructure — it is the HTTP transport layer for LangChain.js and LangGraph.js. Any Node.js AI agent making LLM API calls had axios in its execution path during the window. Even the fully functional macOS infections gave the attacker access to developer machines running AI agent applications, exposing API keys and agent runtime data. The AI infrastructure exposure is structurally load-bearing to the report's AgentFail relevance, not decorative framing.

**Defense 4: Mandiant/Google attribution at "high confidence" is the appropriate epistemic level given available evidence.**
UNC1069 is an established Mandiant-tracked group. Attribution is based on TTPs clustering with the documented Contagious Interview playbook (1,700+ malicious packages, simultaneous multi-maintainer targeting), WAVESHAPER malware family nomenclature, and infrastructure patterns. This is as strong as public nation-state attribution gets absent classified intelligence. The draft correctly presents this as "HIGH per Mandiant/Google" rather than independently confirmed — which is the correct framing.

**Defense 5: The damage methodology is more transparent than typical incident reporting and is appropriately caveated.**
The damage_estimate block includes explicit confidence labeling ("estimated"), explicit probability_weight (0.5), wide averted ranges ($10M–$50M), explicit identification of the Huntress-only scope limitation, explicit acknowledgment that Wiz figures are estimates, and explicit notes on what the averted_damage_usd represents counterfactually. This exceeds the standard of transparency in the vast majority of vendor-published incident reports. Uncertainty disclosures exist; the unit conflation issue requires a correction, but the overall methodology is defensible at the "estimated" confidence level.

---

### Phase 3 — Synthesis

**Changes required:**

1. **Attribution language in narrative** — The executive summary and title assert UNC1069/DPRK as confirmed. The narrative body should carry the same epistemic caveat present in researcher_notes ("assessed with high confidence" rather than stated as fact). *Applied: executive summary corrected.*

2. **IBM cost benchmark unit conflation** — The $10K/machine derivation applies a per-record benchmark as a per-machine figure without justification. The methodology notes should explicitly flag that this is a per-machine approximation of a per-record benchmark, with the direction of error depending on credentials-per-machine. *Applied: damage_estimate notes updated.*

3. **peinject/Windows caveat in AI Ecosystem Exposure section** — The Windows payload never activated its beacon loop; `peinject` was not usable in this incident. The AI transport-layer interception scenario should be flagged as theoretical (capability that existed, not damage that occurred). *Applied: caveat added to AI Ecosystem Exposure section.*

4. **Vendor bias disclosure** — The References credibility table flagged StepSecurity's commercial interest but not equivalent interests of other vendors. A uniform disclosure note was added at the end of the References section. *Applied.*

**Challenger points addressed by steelman (no changes required):**

- Challenge 3 (stacked multiplicative uncertainty): The wide averted_range ($10M–$50M) and "estimated" confidence label adequately represent the uncertainty. No additional change required.
- Challenge 4 (partial vs. actual): Steelman defense is persuasive. "Partial" correctly captures the intent-vs-outcome distinction. Classification stands.

**Final verdict:**
Strong, technically thorough report on a genuinely critical AI-infrastructure supply chain incident. The core technical findings are well-sourced, internally consistent, and appropriately scoped. Four corrections applied. The incident is significant for the AgentFail database specifically because it demonstrates nation-state actors targeting the HTTP transport layer of AI agent frameworks, with a documented anti-forensic technique (manifest swap) that defeats standard post-incident npm forensics.

**Confidence: Medium-High**

**Unresolved uncertainties:**
- Actual macOS infection scope beyond the 135 Huntress-confirmed endpoints (requires: npm or law enforcement disclosure)
- DPRK attribution vs. other nation-state actor (requires: declassified intelligence or additional TTPs clustering)
- Whether any of the 135+ confirmed macOS infections were used for secondary operations beyond FirstInfo beaconing (requires: victim organization or law enforcement disclosure)
- Whether Datadog or other disclosed organizations achieved full credential rotation across all affected components (requires: follow-up vendor disclosure)
