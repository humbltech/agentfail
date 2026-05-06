# AAGF-2026-009 Research Document

**Subject:** LiteLLM PyPI Supply Chain Compromise — Credential-Stealing Backdoor via Poisoned Trivy Security Scanner
**Researcher:** Claude (automated Stage 1)
**Date researched:** 2026-05-05
**Suggested ID:** AAGF-2026-009

---

## Source Inventory

| Source | URL | Type | Credibility | Notes |
|--------|-----|------|-------------|-------|
| LiteLLM official security update | https://docs.litellm.ai/blog/security-update-march-2026 | Primary — vendor disclosure | High | Official timeline, affected versions, remediation. Fetched successfully. |
| Snyk blog | https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/ | Security research firm | High | Full attack chain from Trivy to LiteLLM, .pth mechanism, credential categories, IOCs. Fetched successfully. |
| Trend Micro research | https://www.trendmicro.com/en_us/research/26/c/inside-litellm-supply-chain-compromise.html | Security research firm | High | 403 on fetch; details confirmed via search results and cross-references. |
| Datadog Security Labs | https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/ | Security research firm | High | Full TeamPCP campaign timeline including Telnyx, npm worm, IOCs. Fetched successfully. |
| Palo Alto Unit 42 | https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/ | Security research firm | High | TeamPCP attribution, CanisterWorm, 500K credential estimate, Phase breakdown. Fetched successfully. |
| FutureSearch blog (discoverer) | https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/ | Primary — discoverer | High | Discovery details (Cursor MCP plugin transitive dependency), fork bomb bug, timeline. Fetched successfully. |
| BleepingComputer | https://www.bleepingcomputer.com/news/security/popular-litellm-pypi-package-compromised-in-teampcp-supply-chain-attack/ | Independent journalism | High | 500K exfiltration claim (unconfirmed independently), remediation guidance. Fetched successfully. |
| Halcyon ransomware alert | https://www.halcyon.ai/ransomware-alerts/trivy-supply-chain-compromise-enters-extortion-phase-as-vect-ransomware-publishes-first-victim | Ransomware intelligence | High | Vect ransomware extortion phase, first victims published. 403 on fetch; details from search. |
| The Hacker News | https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html | Security journalism | High | From search results. |
| Arctic Wolf advisory | https://arcticwolf.com/resources/blog/teampcp-supply-chain-attack-campaign-targets-trivy-checkmarx-kics-and-litellm-potential-downstream-impact-to-additional-projects/ | Security firm | High | From search results. |
| Kaspersky blog | https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/ | Security firm | High | From search results. |
| Microsoft Security Blog | https://www.microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise/ | Vendor advisory | High | Trivy compromise guidance. From search results. |
| GitHub issue #24518 | https://github.com/BerriAI/litellm/issues/24518 | Primary — project tracker | High | Full timeline and status from maintainers. From search results. |
| Sonatype blog | https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer | Security firm | Medium | Multi-stage credential stealer analysis. From search results. |
| OX Security blog | https://www.ox.security/blog/litellm-malware-malicious-pypi-versions-steal-cloud-and-crypto-credentials/ | Security firm | Medium | Cloud and crypto credential theft focus. From search results. |
| InfoQ | https://www.infoq.com/news/2026/03/litellm-supply-chain-attack/ | Tech journalism | Medium | From search results. |
| Check Point Research | https://research.checkpoint.com/2026/vect-ransomware-by-design-wiper-by-accident/ | Security firm | High | Vect ransomware encryption flaw analysis. From search results. |

**Source quality summary:** Exceptionally strong. Multiple Tier-1 security research firms (Unit 42, Trend Micro, Datadog, Snyk, Kaspersky, Microsoft) plus the discoverer (FutureSearch) and vendor (LiteLLM) all corroborate core facts. The Vect ransomware escalation is independently confirmed by Halcyon, Check Point, and CSA Labs. Key claims cross-verified across 5+ independent sources.

---

## Who Was Affected

**Primary target:** Organizations using LiteLLM as an AI gateway/proxy
- LiteLLM is a unified API gateway for 100+ LLM providers (OpenAI, Anthropic, Azure, etc.)
- Used in production AI pipelines by enterprises managing multi-model LLM deployments
- 3.4 million daily PyPI downloads; 95 million downloads in the preceding month [LiteLLM official; BleepingComputer]

**Exposure window:**
- Malicious v1.82.7 published: March 24, 2026 at 10:39 UTC [LiteLLM official]
- Malicious v1.82.8 published: March 24, 2026 at 10:52 UTC [FutureSearch]
- PyPI quarantine: approximately 13:38 UTC (Snyk says ~3 hours) or ~16:00 UTC (LiteLLM says ~40 minutes — discrepancy between sources) [Snyk; LiteLLM official]
- Packages yanked: 20:15 UTC [FutureSearch]

**Note on exposure duration discrepancy:** LiteLLM's official post says "approximately 40 minutes." Snyk says "approximately three hours." FutureSearch's timeline shows packages quarantined around 13:38 and yanked at 20:15. The 3-hour figure appears more consistent with independent timelines. The 40-minute figure may refer to peak exposure before initial reports surfaced.

**Estimated impact:**
- ~500,000 credential exfiltrations claimed (per vx-underground sources cited by Unit 42), though BleepingComputer notes "many being duplicates" and could not independently confirm [Unit 42; BleepingComputer]
- 300+ GB of exfiltrated data [Unit 42]
- 500,000 credentials stolen [Unit 42]
- At least 16 victim organizations published on leak sites as of late March 2026 [Unit 42]
- 25 confirmed Vect ransomware victims as of April 2026 [Halcyon; search results]
- 1,000+ enterprise SaaS environments affected in broader campaign [Halcyon]

**Who was NOT affected:**
- Users running official LiteLLM Proxy Docker images (dependencies pinned in requirements.txt) [LiteLLM official]
- LiteLLM Cloud users [LiteLLM official]
- Users pinned to v1.82.6 or earlier [LiteLLM official]
- Users who did not install/upgrade LiteLLM via pip during the exposure window [LiteLLM official]

---

## What Happened (Chronological)

### Phase 0: Initial Trivy Compromise (Late February — March 19, 2026)

**Late February 2026:** TeamPCP exploited a misconfigured `pull_request_target` workflow in Aqua Security's Trivy GitHub repository. This "Pwn Request" attack stole the Personal Access Token (PAT) for `aqua-bot`, Aqua Security's service account. Aqua Security performed an incomplete credential rotation that failed to fully revoke the compromised access. [Unit 42; Snyk; Datadog]

**March 19, 2026:** TeamPCP launched the active phase. Using the stolen `aqua-bot` credentials, they force-pushed malicious code to 76 of 77 version tags in `aquasecurity/trivy-action` and all tags in `aquasecurity/setup-trivy`. The malicious v0.69.4 tag triggered Trivy's standard release machinery, pushing compromised builds through GHCR, ECR Public, Docker Hub, deb/rpm packages, and get.trivy.dev. [Unit 42; Snyk; Microsoft]

**Trivy payload variants:**
- Version 1: 150-line monolithic bash script for environment fingerprinting and credential harvesting from AWS/GCP/Azure via IMDS, bypassing GitHub's secret masking by reading `runner.worker` process memory [Unit 42]
- Version 2: 15-line modular loader downloading `kube.py` as second-stage payload with self-deletion [Unit 42]
- Version 3: Self-replicating malware dubbed "CanisterWorm" with Docker API scanning (port 2375) and SSH key harvesting, using Internet Computer Protocol (ICP) canisters as tamper-proof C2 [Unit 42]

### Phase 1: NPM Worm Propagation (March 20-22, 2026)

Using npm publishing tokens stolen during the Trivy phase, TeamPCP deployed a self-propagating worm across 45+ npm packages within 60 seconds:
- @EmilGroup (28 packages)
- @opengov (16 packages)
- @v7 (additional packages)

The worm "stole npm tokens from compromised environments, resolved which packages each token could publish," and automatically published malicious versions. [Datadog; Unit 42]

A destructive "kamikaze" container payload was observed targeting Iranian systems based on timezone/locale detection, performing filesystem deletion. [Datadog]

### Phase 2: Checkmarx KICS Compromise (March 21-23, 2026)

Using stolen GitHub PATs, TeamPCP force-pushed malicious commits to 35 version tags of `checkmarx/kics-github-action` and poisoned v2.3.28 of `checkmarx/ast-github-action`. Malicious OpenVSX extensions (ast-results 2.53.0, cx-dev-assist 1.7.0) were also published. C2 domain: `checkmarx[.]zone`. [Unit 42; Datadog; Snyk]

### Phase 3: LiteLLM PyPI Compromise (March 23-24, 2026)

**March 23, 2026:** Attackers registered C2 domains `checkmarx.zone` and `models.litellm.cloud`. [Snyk]

**Root cause — how LiteLLM was compromised:** LiteLLM's CI/CD pipeline ran Trivy without pinned versioning via `apt`. The compromised Trivy GitHub Action exfiltrated the `PYPI_PUBLISH` token from the CI/CD runner environment, giving attackers direct PyPI package publication rights. The attacker bypassed official CI/CD workflows and uploaded malicious packages directly to PyPI using these stolen credentials. [Snyk; LiteLLM official]

**March 24, 2026, 10:39 UTC — v1.82.7 published:**
- Malicious base64-encoded payload injected into `litellm/proxy/proxy_server.py`
- Executed on any `litellm.proxy` import
- No corresponding GitHub tag existed [FutureSearch]

**March 24, 2026, 10:52 UTC — v1.82.8 published (escalation):**
- Added `litellm_init.pth` file — a Python path configuration file that **executes on every Python interpreter startup** when litellm is installed, requiring no import
- This fires on `pip`, `python -c`, IDE language servers — any Python process [Snyk; FutureSearch]
- Also retained the `proxy_server.py` payload [LiteLLM official]
- A bug in the subprocess spawning caused an "exponential fork bomb that crashed the machine" in some environments, which paradoxically helped with detection [FutureSearch]

**March 24, ~12:30 UTC:** v1.82.7 also confirmed compromised [FutureSearch]

**March 24, ~13:03 UTC:** GitHub issue #24512 filed but "closed as 'not planned' and spammed by bots" [FutureSearch]

**March 24, ~13:38 UTC:** PyPI quarantined packages [Snyk timeline]

**March 24, 20:15 UTC:** Compromised versions fully yanked from PyPI [FutureSearch]

### Phase 4: Telnyx SDK Compromise (March 27, 2026)

Malicious telnyx versions 4.87.1 and 4.87.2 published to PyPI. Used WAV steganography — downloading `ringtone.wav` (Linux) or `hangup.wav` (Windows) from `83.142.209[.]203:8080` containing XOR-encrypted second-stage payloads hidden in audio frames. [Datadog]

### Phase 5: Ransomware Escalation (April 2026)

**Late March 2026:** Vect ransomware group announced alliance with TeamPCP on BreachForums, declaring intent to pursue ransomware operations against every organization compromised during the supply chain campaigns. [Halcyon; search results]

**April 15, 2026:** Vect published first victims:
- A property-management technology company (~4 million emails, 700 GB)
- Guesty (700 GB)
- S&P Global (250 GB)
All allegedly tied to TeamPCP supply chain compromises. [Halcyon; search results]

**As of late April 2026:** 25 confirmed Vect ransomware victims across Manufacturing, Education, and Technology sectors in Brazil, India, and the United States. [Search results]

**Critical finding:** Vect ransomware contains a fatal encryption flaw — it discards 3 of 4 decryption nonces for files larger than 128 KB, making data recovery impossible even if ransom is paid. Check Point Research characterized it as "ransomware by design, wiper by accident." [Check Point Research; The Register; CSA Labs]

---

## Three-Stage Payload Architecture (Technical Detail)

### Stage 1: Credential Harvesting

The malware systematically collected 50+ categories of secrets: [Snyk; Datadog; Unit 42; BleepingComputer]

**System credentials:**
- SSH private keys (`~/.ssh/`)
- `/etc/shadow` password hashes
- Shell history (`.bash_history`, `.zsh_history`) containing API keys
- `.gitconfig` and Git credentials

**Cloud infrastructure:**
- AWS credentials and config (`~/.aws/credentials`, `~/.aws/config`)
- GCP service account files
- Azure service account files
- IMDS metadata queries with IMDSv2 signing
- AWS Secrets Manager and SSM Parameter Store contents

**Container orchestration:**
- Docker `config.json` registry credentials
- Kubernetes `kubeconfig` files
- Kubernetes service account tokens
- Cluster secrets across all namespaces

**CI/CD configurations:**
- Jenkins secrets
- Travis CI configuration
- Terraform state files and secrets

**Application secrets:**
- `.env` files
- Slack/Discord webhooks
- TLS private keys
- Database credentials and connection strings

**Cryptocurrency:**
- Bitcoin, Ethereum, Solana, Cardano, Monero seed phrases
- Ledger hardware wallet configurations
- Wallet files

### Stage 2: Encryption & Exfiltration

Data handling employed military-grade cryptography: [Snyk; Datadog; FutureSearch]

1. Generate 32-byte AES-256 session key via `openssl rand`
2. Encrypt harvested data with AES-256-CBC using PBKDF2 key derivation
3. Encrypt session key with hardcoded 4096-bit RSA public key (OAEP padding)
4. Bundle as `tpcp.tar.gz`
5. POST to `https://models.litellm[.]cloud/` with header `X-Filename: tpcp.tar.gz`

**Attribution link:** The identical RSA public key was used across Trivy, KICS, and LiteLLM operations — described as "the strongest single technical attribution link" tying all three compromises to TeamPCP. [Snyk]

**Fallback exfiltration:** If C2 domain was unreachable, the malware used the victim's `GITHUB_TOKEN` to create a hidden `docs-tpcp` repository and push stolen data there. [Unit 42; Datadog]

### Stage 3: Persistence & Lateral Movement

**Local persistence:** [Snyk; Datadog; BleepingComputer]
- Backdoor written to `~/.config/sysmon/sysmon.py` (masquerading as legitimate service)
- Systemd user service created at `~/.config/systemd/user/sysmon.service`
- Script polls `https://checkmarx[.]zone/raw` every 5 minutes for remote commands
- Disguised as PostgreSQL utility `pgmon` with temp files at `/tmp/pglog` and `/tmp/.pg_state`

**Kubernetes lateral movement:** [Snyk; Datadog; Unit 42]
- Reads all secrets across every namespace via service account token
- Deploys privileged pods named `node-setup-{node_name}` to `kube-system` namespace
- Mounts host filesystem to install backdoor on underlying nodes
- Destructive variant deploys privileged DaemonSets capable of bricking entire clusters

### .pth File Mechanism (Key Technical Innovation)

The `.pth` (path configuration) file is a Python mechanism where any file ending in `.pth` placed in `site-packages` is read by the Python interpreter at startup. If a line begins with `import`, it is executed as Python code. [Snyk; FutureSearch]

`litellm_init.pth` exploited this to execute malicious code on **every Python process invocation** — not just when LiteLLM was imported. This includes:
- `pip install` commands
- `python -c` one-liners
- IDE language servers (VSCode, PyCharm)
- Any Python script in the environment

This technique bypassed pip hash verification because "the package passes all standard integrity checks because the malicious content was published using legitimate credentials." [Snyk]

---

## Delivery Mechanism Comparison

| Version | Delivery | Trigger | Stealth |
|---------|----------|---------|---------|
| v1.82.7 | Base64 payload in `litellm/proxy/proxy_server.py` | On `litellm.proxy` import | Medium — requires specific import |
| v1.82.8 | `litellm_init.pth` + `proxy_server.py` payload | Every Python process startup | High — fires regardless of import, but fork bomb bug reduced stealth |

---

## Attacker Attribution

**Group:** TeamPCP (aliases: PCPcat, Persy_PCP, ShellForce, DeadCatx3) [Unit 42; Snyk; Datadog]

**Background:**
- Active since at least September 2025 [Unit 42]
- Gained prominence December 2025 with React2Shell campaign (CVE-2025-55182) [Unit 42]
- Initially focused on ransomware, then cryptocurrency mining/theft, then supply chain compromise [Unit 42]
- Used port 666 for nearly all exploitation operations during early period [Unit 42]
- Operates via Telegram channels `@Persy_PCP` and `@teampcp` [Snyk]

**Campaign designation:** Phase 09 of ongoing TeamPCP operations [Snyk]

**Tools:**
- **CanisterWorm**: Self-replicating malware using ICP (Internet Computer Protocol) canisters as resilient C2, immune to traditional domain takedowns [Unit 42; Snyk]
- **hackerbot-claw**: Automated targeting tool using `openclaw` AI agent [Snyk]
- **TeamPCP cloud stealer**: Multi-variant credential harvesting payload [Unit 42]

**Partnerships:**
- CipherForce ransomware group [Unit 42]
- Vect ransomware group (formalized via BreachForums) [Halcyon; Unit 42]

**GitHub defacement:** 44 Aqua Security repositories renamed with "tpcp-docs-" prefix [Datadog]

---

## Indicators of Compromise (IOCs)

### File Artifacts
| Artifact | Hash/Path |
|----------|-----------|
| `litellm_init.pth` | SHA256: `71e35aef03099cd1f2d6446734273025a163597de93912df321ef118bf135238` |
| `proxy_server.py` (malicious) | SHA256: `a0d229be8efcb2f9135e2ad55ba275b76ddcfeb55fa4370e0a522a5bdee0120b` |
| Persistence backdoor | `~/.config/sysmon/sysmon.py` |
| Systemd service | `~/.config/systemd/user/sysmon.service` |
| Temp state files | `/tmp/pglog`, `/tmp/.pg_state` |

### Network IOCs
| Domain/IP | Purpose |
|-----------|---------|
| `models.litellm[.]cloud` | Primary data exfiltration C2 |
| `checkmarx[.]zone` | Command polling (every 5 min) |
| `scan.aquasecurtiy[.]org` | Trivy phase exfiltration (note: typosquat of "aquasecurity") |
| `tdtqy-oyaaa-aaaae-af2dq-cai.raw.icp0[.]io` | ICP canister backup C2 |
| `83.142.209.203` | Telnyx phase C2 |
| `83.142.209.11` | Additional C2 |
| `46.151.182.203` | Additional C2 |

### Kubernetes Indicators
- Pods matching pattern `node-setup-*` in `kube-system` namespace
- Containers named `kamikaze` or `provisioner`

### Compromised PyPI Packages
- `litellm` 1.82.7, 1.82.8
- `telnyx` 4.87.1, 4.87.2

---

## Vendor Response Timeline

| Date | Event | Source |
|------|-------|--------|
| March 24, 10:39 UTC | v1.82.7 published to PyPI | LiteLLM official |
| March 24, 10:52 UTC | v1.82.8 published to PyPI | FutureSearch |
| March 24, ~12:30 UTC | v1.82.7 confirmed compromised | FutureSearch |
| March 24, ~13:03 UTC | Initial GitHub issue #24512 closed as "not planned" | FutureSearch |
| March 24, ~13:38 UTC | PyPI quarantines packages | Snyk |
| March 24, 20:15 UTC | Compromised versions yanked from PyPI | FutureSearch |
| March 27 | LiteLLM security townhall with investigation updates | LiteLLM official |
| March 30 | Clean v1.83.0 released via new CI/CD v2 pipeline | LiteLLM official |
| Post-incident | Google Mandiant engaged for forensic analysis | LiteLLM official |
| Post-incident | Maintainer credentials rotated | LiteLLM official |
| Post-incident | All releases v1.78.0–v1.82.6 audited as verified clean | LiteLLM official |

**Discovery credit:** Callum McMahon at FutureSearch, who found the malicious package when it was "pulled in as a transitive dependency by an MCP plugin running inside Cursor." [FutureSearch]

---

## Damage Assessment

### Direct Financial Damage
- **Confirmed:** At least 25 organizations targeted by Vect ransomware extortion using credentials stolen in the campaign [search results]
- **Claimed victims with data volumes:** Guesty (700 GB), S&P Global (250 GB), property-management tech company (4M emails, 700 GB) [Halcyon]
- **Unconfirmed total:** vx-underground sources claim ~500K credential exfiltrations, 300+ GB total exfiltrated data [Unit 42; BleepingComputer notes these are unconfirmed]
- **Irrecoverable losses:** Vect ransomware encryption flaw means paying ransom cannot recover files >128 KB — victims face permanent data loss [Check Point; CSA Labs]

### Operational Impact
- All organizations that installed malicious versions must rotate every credential, SSH key, API key, database password, cloud access token, and Kubernetes secret in their environment [LiteLLM official; BleepingComputer]
- Kubernetes clusters with compromised service accounts must be audited for unauthorized privileged pods and potentially rebuilt [Snyk; Datadog]
- CI/CD pipelines must be audited for compromised tokens [LiteLLM official]

### Data Exposure
- 50+ categories of secrets targeted including cloud credentials (AWS/GCP/Azure), SSH keys, Kubernetes secrets/tokens, database passwords, TLS private keys, cryptocurrency wallet seeds, CI/CD tokens, shell history, Docker registry credentials, .env files, Git credentials [Snyk; Datadog; BleepingComputer]

### Damage Speed
- 13 minutes between v1.82.7 and v1.82.8 (escalation to .pth mechanism) [FutureSearch; LiteLLM official]
- Credential harvesting begins immediately on first Python process execution after install [Snyk]

### Damage Duration
- Malicious packages available for approximately 3 hours (10:39 to ~13:38 UTC) before quarantine [Snyk]
- Persistence mechanism (`sysmon.service`) continues credential theft and C2 polling indefinitely until manually removed [Snyk; Datadog]
- Ransomware extortion phase began 3 weeks after initial compromise and continues [Halcyon]

### Recovery Complexity
- **High.** Credential rotation across all systems is the minimum remediation
- Kubernetes clusters may need complete rebuild if privileged pods were deployed
- Cryptocurrency wallets with stolen seed phrases are permanently compromised
- SSH keys, TLS certificates require regeneration and redistribution
- No way to confirm what data was exfiltrated due to RSA-encrypted payloads

### Business Scope
- LiteLLM: 3.4M daily downloads, 95M monthly downloads — but Docker-based deployments (majority of production proxy users) were not affected [LiteLLM official; BleepingComputer]
- Broader TeamPCP campaign: 1,000+ enterprise SaaS environments affected [Halcyon]
- 47+ npm packages also compromised in related campaign [Datadog; Unit 42]

---

## Key Dates Summary

| Date Field | Value | Source |
|------------|-------|--------|
| `date_occurred` | 2026-03-24 (malicious packages published to PyPI at 10:39 UTC) | LiteLLM official; FutureSearch |
| `date_discovered` | 2026-03-24 (discovered by FutureSearch's Callum McMahon; quarantined by ~13:38 UTC) | FutureSearch; Snyk |
| `date_reported` | 2026-03-24 (GitHub issue filed ~13:03 UTC; LiteLLM official blog published shortly after) | FutureSearch; LiteLLM official |
| Campaign start (Trivy) | 2026-02-27 (initial credential theft) / 2026-03-19 (active phase) | Unit 42; Snyk |
| Ransomware escalation | 2026-04-15 (first Vect victims published) | Halcyon |

---

## Classification Assessment

### Suggested AgentFail Categories

1. **Supply Chain Compromise** — Primary category. A security scanning tool (Trivy) used in CI/CD was poisoned, which cascaded into stealing PyPI publishing credentials, which led to malicious package publication.

2. **Credential Theft / Data Exfiltration** — The payload's primary function was harvesting credentials and secrets at industrial scale.

3. **AI Infrastructure Attack** — LiteLLM is a core AI gateway/proxy used to route requests to LLM providers. Compromising it gives access to LLM API keys, potentially enabling unauthorized model access and prompt/response interception.

4. **Autonomous Tool Misuse** — The CanisterWorm and hackerbot-claw components used AI agents (`openclaw`) for automated targeting, representing AI-assisted offensive operations.

### Severity Assessment

**Severity: CRITICAL**

Justification:
- Industrial-scale credential harvesting (claimed 500K exfiltrations)
- Three-stage payload with persistence and Kubernetes lateral movement
- Ransomware escalation with confirmed victims and permanent data loss (Vect encryption flaw)
- Targeted AI infrastructure specifically (LLM API keys, AI gateway)
- Supply chain attack on security tooling itself (Trivy — a vulnerability scanner)
- Extremely sophisticated: RSA-4096 encrypted exfiltration, .pth file execution, ICP canister C2

### Harm Classification

**Actual harm — confirmed:**
- Malicious packages published and downloaded during 3-hour window
- Credential exfiltration infrastructure was operational
- 25+ organizations targeted by ransomware using stolen credentials
- At least 3 named victims (Guesty, S&P Global, property-management company) with large data volumes claimed stolen
- 44 Aqua Security GitHub repositories defaced

**Potential harm — scale uncertain:**
- 500K credential exfiltration claim is unverified
- Unknown how many of 3.4M daily downloaders actually pulled malicious versions
- Cryptocurrency wallet theft (seed phrases stolen) — losses unquantified
- Persistent backdoors may remain undiscovered in some environments

### Key Distinguishing Factors for AgentFail

This incident is notable for AgentFail because:
1. **AI infrastructure was the specific target** — LiteLLM is an AI gateway proxying requests to 100+ LLM providers
2. **LLM API keys were among the targeted secrets** — stolen keys enable unauthorized AI model access
3. **AI agents were used offensively** — TeamPCP's `openclaw` agent automated targeting
4. **Discovery happened via AI tooling** — found when malicious package was pulled as transitive dependency by an MCP plugin running inside Cursor
5. **The attack chain weaponized security tools** — Trivy (a vulnerability scanner) became the attack vector, demonstrating that AI/ML pipelines' security dependencies are themselves attack surfaces

---

## Open Questions for Further Research

1. **Exact download count** for malicious LiteLLM versions during the exposure window — no source provides this specific number
2. **Confirmed financial losses** from credential theft (beyond ransomware claims)
3. **How many LLM API keys were stolen** and whether unauthorized AI model usage occurred
4. **Status of Mandiant forensic investigation** — results not yet public as of research date
5. **Whether the .pth technique has been replicated** by other threat actors since this incident
6. **Full scope of Vect ransomware campaign** — 25 victims as of April 2026, likely still growing
7. **Downstream impact on organizations whose AI pipelines used stolen LLM API keys** — potential prompt injection, data leakage, or unauthorized inference costs
