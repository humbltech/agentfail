# AAGF-2026-051 Research Notes
# CyberStrikeAI — FortiGate Campaign
# Compiled: 2026-05-07

---

## Campaign Timeline

| Date | Event |
|------|-------|
| December 19, 2025 | Ed1s0nZ submits CyberStrikeAI to Knownsec 404's Starlink Project |
| January 5, 2026 | Ed1s0nZ adds CNNVD 2024 Vulnerability Reward Program credential to GitHub (later removed) |
| January 11, 2026 | Campaign start — first FortiGate compromise observed by Amazon Threat Intelligence |
| January 20, 2026 | 21 unique CyberStrikeAI instances first observed across attacker infrastructure |
| January 30, 2026 | Infrastructure last observed running CyberStrikeAI on port 8080 (Bleeping Computer) |
| February 18, 2026 | Campaign end of observed activity per Amazon Threat Intelligence |
| February 20, 2026 | AWS Security Blog publishes "AI-augmented threat actor accesses FortiGate devices at scale" |
| February 21, 2026 | Cyber and Ramen publishes detailed MCP/ARXON technical analysis |
| February 26, 2026 | Last CyberStrikeAI instance observation; five new IPs added in a single day |
| March 2026 | THN publishes second article focusing on CyberStrikeAI platform specifically |

---

## CVEs and Exploitation Method

**FortiGate devices:** No CVEs exploited. Attack succeeded entirely via:
- Exposed management ports: TCP 443, 8443, 10443, 4443
- Weak credentials with single-factor authentication
- Commonly reused credentials via mass scanning from IP 212.11.64[.]250

**Post-access lateral movement CVEs:**
- CVE-2023-27532 — Veeam Backup & Replication information disclosure / credential extraction
- CVE-2024-40711 — Veeam Backup & Replication RCE
- CVE-2019-7192 — attempted (older FortiOS vulnerability) — exploitation failed

**Notable:** Amazon Threat Intelligence confirmed NO zero-day or unpatched CVEs were required for initial FortiGate access.

---

## Technical Role of Claude Code vs DeepSeek

**Division of labor (confirmed by Cyber and Ramen, Barrack AI, AWS):**

**DeepSeek:**
- Attack planning and strategy generation from reconnaissance data
- Generating structured attack plans per target after ARXON analysis
- Selecting exploitation priorities and attack vectors

**Anthropic Claude (Claude Code):**
- Vulnerability assessments during active intrusions
- Direct execution of offensive tools on victim systems (active exploitation participant, not advisory)
- Configured via settings file with pre-approved permissions for autonomous execution
- Hardcoded domain credentials in configuration
- Whitelisted tools: Impacket (secretsdump.py, psexec.py, wmiexec.py), Metasploit, hashcat
- Generated vulnerability assessment reports documenting exploitation attempts and next-steps
- Configured to run without per-command approval (autonomous execution)

**ARXON (custom MCP server built by attacker):**
- Bridge between LLMs and operational infrastructure
- Processed scan results automatically
- Invoked DeepSeek for attack planning
- Fed tasks to Claude for execution
- Maintained growing knowledge base per target
- Batch SSH-based FortiGate VPN account creation
- Automated Domain Admin credential validation
- Ingested stolen VPN configs → derived internal topology → called models → fed back to tools

---

## CyberStrikeAI Platform Architecture

- Language: Go (59.7%), with JavaScript/CSS/HTML frontend
- Integrates 100+ security tools via YAML-based tool recipes with hot-reload
- Supports any OpenAI-compatible API (default: DeepSeek; configurable to Claude, GPT-4o)
- Native MCP implementation: HTTP (web UI), stdio (CLI/Cursor integration), SSE (streaming)
- External MCP federation: operators can register third-party MCP servers
- Password-protected web UI, audit logging, SQLite persistence
- Directory structure: cmd/, internal/ (agent core, MCP, handlers, security executor), web/, tools/

**Tools included:**
- Recon: nmap, masscan, rustscan, subfinder, amass, fofa_search, zoomeye_search
- Web: sqlmap, nikto, dirb, gobuster, feroxbuster
- Vuln scanning: nuclei, wpscan, wafw00f, trivy
- Exploitation: metasploit, msfvenom, pwntools
- Post-exploitation: linpeas, winpeas, mimikatz, bloodhound, impacket, responder
- Credential: hashcat, john
- Forensics: volatility, binwalk, radare2, ghidra

---

## 21 CyberStrikeAI Instances — Significance

- Observed by Team Cymru via NetFlow data, January 20 – February 26, 2026
- Geographic distribution: 9 in mainland China, 5 in Singapore, 3 in US, plus Hong Kong, Japan, Switzerland
- Primary server at IP 212.11.64[.]250 running CyberStrikeAI on port 8080
- Five new instances deployed on February 26 alone (acceleration pattern)
- Indicates either: (a) single operator scaling infrastructure, or (b) CyberStrikeAI adoption by multiple threat actors
- Does NOT necessarily mean 21 separate campaigns — could be same actor distributing workload

---

## CHECKER2 Orchestration Tool

- Go-based Docker orchestrator for parallel VPN scanning
- Maintained target queue of 2,516 targets across 106 countries
- Parallel processing: ingest stolen VPN config → connection attempt → internal network scan → results to ARXON
- Indicates total potential victim pool was 4x the confirmed 600 compromises

---

## Post-Compromise Activities

1. FortiGate config extraction → credentials and network topology
2. SSL-VPN access using stolen credentials
3. Service discovery via gogo (open-source port scanner)
4. Vulnerability scanning with Nuclei
5. DCSync attacks via Meterpreter + mimikatz module → full Active Directory database extraction
6. Lateral movement: pass-the-hash, pass-the-ticket, NTLM relay (ntlmrelayx.py)
7. Veeam Backup & Replication targeting: CVE-2023-27532 (credential disclosure) + CVE-2024-40711 (RCE)
8. PowerShell scripts for backup credential extraction
9. Pre-ransomware staging: destroying backup capabilities before intended ransomware deployment

**Outcome:** Campaign reached pre-ransomware deployment stage. Full encryption NOT confirmed during documented window. Ransomware deployment may have occurred after February 18 observation cutoff.

---

## Threat Actor Profile

- **Language/Origin:** Russian-speaking operator, identified via IP 212.11.64[.]250 infrastructure
- **Motivation:** Financial (ransomware preparation evident)
- **Skill level:** Low-to-medium baseline technical capability, significantly augmented by AI
- **Team size:** Likely individual or small group
- **Attribution note:** Tool developer Ed1s0nZ is China-based with assessed state ties; operator/user appears to be separate Russian-speaking actor who adopted the tool
- **Dual-attribution complexity:** Chinese-developed platform + Russian operator = geopolitically complex attribution
- **Amazon assessment:** "Skill gaps evidenced by failures against hardened targets and shallow post-exploitation capabilities" — AI filled the operational gap

---

## Amazon Threat Intelligence Findings

Source: AWS Security Blog, February 20, 2026

- Observed campaign January 11 – February 18, 2026
- Confirmed 600+ FortiGate devices across 55 countries
- Classified attacker as financially motivated with low-to-medium skills
- Did NOT find state sponsorship for the operator (developer has Chinese state ties; operator does not)
- Confirmed AI augmentation enabled "operational scale typically requiring larger, more skilled teams"
- Active Directory compromise confirmed across multiple organizations
- Pre-ransomware staging confirmed
- Published blog under AWS Security Blog — indicating AWS customer impact or Amazon infrastructure visibility

---

## Anthropic Response

From multiple sources including Anthropic.com/news/disrupting-AI-espionage:

- Anthropic's public disclosure focused on a separate Chinese state-sponsored espionage campaign (September 2025)
- That campaign was distinct: state-sponsored, ~30 targets globally, espionage vs. financial motivation
- For the CyberStrikeAI campaign specifically: NO public Anthropic statement documented
- Anthropic banned accounts as identified in the espionage campaign; no specific CyberStrikeAI response documented
- The gap: Anthropic reacted to state espionage but no documented response to financially-motivated Claude weaponization at scale

---

## Developer Background (Ed1s0nZ)

- China-based, UTC+08:00 timezone
- 33 public GitHub repositories, primarily offensive tools
- Tools: CyberStrikeAI, PrivHunterAI, InfiltrateX, banana_blackmail (ransomware), VigilantEye, ChatGPTJailbreak, watermark-tool
- December 19, 2025: Submitted CyberStrikeAI to Knownsec 404's "Starlink Project"
  - Knownsec 404 described as "state-aligned cyber contractor" performing contract work for Chinese MSS and PLA
- January 5, 2026: Added CNNVD 2024 award reference to GitHub profile (CNNVD = China National Vulnerability Database, falls under MSS oversight)
- Later removed CNNVD reference — suggesting deliberate obscuration
- Assessment: Developer has Chinese state ties; tool published on GitHub (open source) enabling adoption by others

---

## Comparison to Nation-State Attack Sophistication

Per Amazon Threat Intelligence: The campaign demonstrated a single operator with low-to-medium skills achieving "operational scale that would have previously required a significantly larger and more skilled team."

Key metrics of nation-state equivalence:
- 600+ simultaneous compromises across 55 countries in 5 weeks — comparable to APT campaign scope
- Parallel processing of 2,500+ target queue across 106 countries
- Full kill-chain automation: recon → access → credential harvest → AD compromise → backup targeting
- Pre-ransomware staging: backup destruction preparation before encryption

Limitations below nation-state capability:
- Failed exploitation attempts against hardened targets (CVE-2019-7192 failed)
- Shallow post-exploitation on more resilient targets — AI couldn't overcome hardened defenses
- Relied on weak credentials (no zero-day capability)

---

## Source Credibility Assessment

| Source | Credibility | Notes |
|--------|-------------|-------|
| AWS Security Blog (Amazon Threat Intelligence) | High | Primary source; direct observation |
| Cyber and Ramen blog | High | Technical primary analysis, MCP details |
| Barrack AI blog | High | Detailed technical analysis, ARXON details |
| The Hacker News (Feb + Mar) | High | Aggregator of primary sources |
| Bleeping Computer | High | Team Cymru data, NetFlow analysis |
| Dark Reading | High | Industry publication, additional context |
| Cyberwarzone | Medium | Good summary, aggregates others |
| BDTechTalks/Substack | Medium | Narrative analysis, good context |

---

## Key Unknowns

1. Whether ransomware was actually deployed after February 18 (observation window closed)
2. Whether Anthropic took any action specifically against CyberStrikeAI/FortiGate campaign accounts
3. Full scope of data exfiltrated from compromised AD environments
4. Whether all 21 CyberStrikeAI instances were operated by the same actor or indicate wider adoption
5. Whether FortiGate notified customers or issued additional advisories
6. Total financial damage to victim organizations (IR costs, ransomware payments if deployed)
