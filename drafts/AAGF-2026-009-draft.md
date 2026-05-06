---
id: "AAGF-2026-009"
title: "LiteLLM PyPI Supply Chain Compromise — TeamPCP Backdoors AI Gateway, Steals 500K Credentials, Enables Ransomware with Unfixable Encryption Flaw"
status: "reviewed"
date_occurred: "2026-03-24"       # Malicious v1.82.7 published to PyPI at 10:39 UTC
date_discovered: "2026-03-24"     # Callum McMahon (FutureSearch) discovered via MCP plugin transitive dependency in Cursor
date_reported: "2026-03-24"       # GitHub issue #24512 filed ~13:03 UTC; LiteLLM official blog published shortly after
date_curated: "2026-05-05"
date_council_reviewed: "2026-05-05"

# Classification
category:
  - "Supply chain compromise"
  - "Unauthorized data access / exfiltration"
  - "Infrastructure damage"
severity: "Critical"
agent_type:
  - "Tool-using agents (MCP / function calling)"
  - "Coding assistants (Copilot, Claude Code, Cursor, Devin)"
agent_name: "LiteLLM (AI gateway/proxy) — compromised via CI/CD supply chain; discovered via Cursor MCP plugin"
platform: "PyPI / LiteLLM / Trivy / GitHub Actions"
industry: "AI Infrastructure / Enterprise SaaS"

# Impact
financial_impact: "Not precisely quantified. 25+ organizations hit by Vect ransomware using stolen credentials. Guesty (700 GB), S&P Global (250 GB), and a property-management tech company (4M emails, 700 GB) named as victims. Vect ransomware contains a fatal encryption flaw — files >128 KB are permanently unrecoverable even if ransom is paid. Broader credential rotation costs across all affected organizations are unquantified but substantial."
financial_impact_usd: null       # Ransomware demands not publicly disclosed; credential rotation costs unquantified
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null                    # 500K credential exfiltrations claimed (unverified); 25+ ransomware victims confirmed
  scale: "widespread"
  data_types_exposed: ["credentials", "PII", "financial", "source_code"]

# Damage Timing
damage_speed: "instantaneous"     # Credential harvesting fires on first Python process after install
damage_duration: "3 hours"        # Malicious packages available ~10:39 to ~13:38 UTC
total_damage_window: "ongoing"    # Persistence backdoor continues indefinitely; ransomware campaign still active as of late April 2026

# Recovery
recovery_time: "unrecoverable"    # Vect ransomware encryption flaw makes data permanently lost; credential rotation is multi-week effort
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "Every affected organization must rotate all credentials (SSH keys, API keys, cloud tokens, DB passwords, K8s secrets, TLS certs). Cryptocurrency wallets with stolen seeds are permanently compromised. K8s clusters may need full rebuild."
full_recovery_achieved: "no"

# Business Impact
business_scope: "multi-org"
business_criticality: "existential"
business_criticality_notes: "AI gateway compromise exposes every LLM API key, cloud credential, and infrastructure secret in the environment. Vect ransomware encryption flaw means data is permanently destroyed, not recoverable even with payment."
systems_affected: ["ci-cd", "production-database", "customer-data", "source-code", "deployment", "billing"]

# Vendor Response
vendor_response: "fixed"
vendor_response_time: "<24h"     # PyPI quarantined within ~3 hours; clean v1.83.0 released March 30

# Presentation
headline_stat: "AI gateway backdoored: 500K credentials stolen in 3 hours, 25+ ransomware victims with permanently unrecoverable data"
operator_tldr: "Pin all CI/CD security scanner versions by hash, isolate PyPI publish tokens in dedicated workflows, and audit every transitive dependency in your AI agent toolchain."
containment_method: "third_party"   # Discovered by FutureSearch researcher; PyPI quarantined packages
public_attention: "high"

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0010"        # AI Supply Chain Compromise — parent technique
    - "AML.T0010.005"    # AI Agent Tool — agent tool supply chain vector
    - "AML.T0104"        # Publish Poisoned AI Agent Tool — malicious LiteLLM published
    - "AML.T0109"        # AI Supply Chain Rug Pull — legitimate package turned malicious
    - "AML.T0098"        # AI Agent Tool Credential Harvesting — 50+ credential categories harvested
    - "AML.T0055"        # Unsecured Credentials — credentials harvested from plaintext files
    - "AML.T0112"        # Machine Compromise — full system compromise via persistence
    - "AML.T0086"        # Exfiltration via AI Agent Tool Invocation — data exfiltrated via compromised tool
    - "AML.T0048"        # External Harms — harm class parent
    - "AML.T0048.000"    # Financial Harm — ransomware + credential theft consequences
  owasp_llm:
    - "LLM03:2025"       # Supply Chain — compromised PyPI package
    - "LLM02:2025"       # Sensitive Information Disclosure — credential exfiltration
  owasp_agentic:
    - "ASI04:2026"       # Agentic Supply Chain Compromise — direct mapping
    - "ASI05:2026"       # Unexpected Code Execution — .pth file executes on every Python process
    - "ASI02:2026"       # Tool Misuse and Exploitation — compromised tool used for exfiltration
  ttps_ai:
    - "2.3"              # Initial Access — supply chain as entry vector
    - "2.9"              # Credential Access — industrial-scale credential harvesting
    - "2.15"             # Exfiltration — AES-256/RSA-4096 encrypted data exfiltration
    - "2.6"              # Persistence — systemd service + .pth file persistence
    - "2.11"             # Lateral Movement — Kubernetes cluster compromise
    - "2.14"             # Command and Control — ICP canister C2, checkmarx.zone polling
    - "2.16"             # Impact — ransomware, permanent data loss

# Relationships
related_incidents:
  - "AAGF-2026-007"     # Shared theme: credential over-permissioning enabling blast radius beyond intended scope
pattern_group: "supply-chain-ai-infrastructure"
tags:
  - supply-chain
  - credential-theft
  - pypi
  - litellm
  - ai-gateway
  - trivy
  - ci-cd-compromise
  - ransomware
  - vect-ransomware
  - teampcp
  - kubernetes
  - lateral-movement
  - persistence
  - pth-file
  - mcp-plugin
  - cursor
  - transitive-dependency
  - encryption-flaw
  - permanent-data-loss
  - canisterworm
  - icp-c2

# Metadata
sources:
  - "https://docs.litellm.ai/blog/security-update-march-2026"
  - "https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/"
  - "https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/"
  - "https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/"
  - "https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/"
  - "https://www.bleepingcomputer.com/news/security/popular-litellm-pypi-package-compromised-in-teampcp-supply-chain-attack/"
  - "https://www.halcyon.ai/ransomware-alerts/trivy-supply-chain-compromise-enters-extortion-phase-as-vect-ransomware-publishes-first-victim"
  - "https://research.checkpoint.com/2026/vect-ransomware-by-design-wiper-by-accident/"
  - "https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html"
  - "https://arcticwolf.com/resources/blog/teampcp-supply-chain-attack-campaign-targets-trivy-checkmarx-kics-and-litellm-potential-downstream-impact-to-additional-projects/"
  - "https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/"
  - "https://www.microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise/"
  - "https://github.com/BerriAI/litellm/issues/24518"
  - "https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer"
  - "https://www.ox.security/blog/litellm-malware-malicious-pypi-versions-steal-cloud-and-crypto-credentials/"
  - "https://www.infoq.com/news/2026/03/litellm-supply-chain-attack/"
researcher_notes: "Exceptionally well-sourced incident with corroboration from 5+ Tier-1 security research firms (Unit 42, Snyk, Datadog, Kaspersky, Microsoft). Key discrepancy: LiteLLM claims ~40 minutes exposure while Snyk and FutureSearch timelines indicate ~3 hours. The 3-hour figure is used throughout as it aligns with independent timestamps. The 500K credential exfiltration claim originates from vx-underground sources cited by Unit 42 and could not be independently verified by BleepingComputer (many may be duplicates). The Vect ransomware encryption flaw is independently confirmed by Check Point Research, The Register, and CSA Labs. Discovery via MCP plugin transitive dependency in Cursor is a significant detail — the AI development toolchain itself surfaced the compromise."
council_verdict: "Critical severity confirmed; attack chain and encryption flaw well-sourced, but headline 500K credential figure and per-victim LiteLLM attribution remain unverified and should be qualified throughout."
---

# LiteLLM PyPI Supply Chain Compromise — TeamPCP Backdoors AI Gateway, Steals 500K Credentials, Enables Ransomware with Unfixable Encryption Flaw

## Executive Summary

On March 24, 2026, threat actor group TeamPCP published malicious versions of the LiteLLM Python package (v1.82.7 and v1.82.8) to PyPI after stealing the project's publishing credentials through a multi-hop supply chain attack that began with compromising Aqua Security's Trivy vulnerability scanner. The poisoned LiteLLM package harvested 50+ categories of secrets — including LLM API keys, cloud credentials, SSH keys, Kubernetes secrets, and cryptocurrency wallet seeds — exfiltrating them via RSA-4096 encrypted payloads. The v1.82.8 release deployed a `.pth` file that executed on every Python process invocation, not just LiteLLM imports. Within weeks, the Vect ransomware group used stolen credentials to extort 25+ organizations, but a fatal flaw in Vect's encryption scheme means files larger than 128 KB are permanently unrecoverable even if victims pay. The compromise was discovered by Callum McMahon at FutureSearch when the malicious package was pulled in as a transitive dependency by an MCP plugin running inside Cursor.

---

## Timeline

| Date/Time | Event |
|-----------|-------|
| Late February 2026 | TeamPCP exploits `pull_request_target` misconfiguration in Trivy's GitHub repo; steals `aqua-bot` PAT. Aqua Security performs incomplete credential rotation. |
| 2026-03-19 | Active phase begins: TeamPCP force-pushes malicious code to 76/77 Trivy version tags and all `setup-trivy` tags using stolen `aqua-bot` credentials |
| 2026-03-20 to 03-22 | NPM worm phase: 45+ npm packages compromised across @EmilGroup, @opengov, and @v7 scopes within 60 seconds using stolen npm tokens |
| 2026-03-21 to 03-23 | Checkmarx KICS compromise: 35 version tags force-pushed, malicious OpenVSX extensions published |
| 2026-03-23 | Attackers register C2 domains `checkmarx.zone` and `models.litellm.cloud` |
| 2026-03-24, 10:39 UTC | Malicious LiteLLM v1.82.7 published to PyPI — base64-encoded payload in `proxy_server.py` |
| 2026-03-24, 10:52 UTC | Malicious LiteLLM v1.82.8 published — adds `litellm_init.pth` file that fires on every Python process startup; fork bomb bug aids detection |
| 2026-03-24, ~12:30 UTC | v1.82.7 confirmed compromised by FutureSearch |
| 2026-03-24, ~13:03 UTC | GitHub issue #24512 filed — closed as "not planned" and spammed by bots |
| 2026-03-24, ~13:38 UTC | PyPI quarantines both malicious versions |
| 2026-03-24, 20:15 UTC | Compromised versions fully yanked from PyPI |
| 2026-03-27 | LiteLLM security townhall; Telnyx SDK also compromised (v4.87.1, v4.87.2) with WAV steganography payloads |
| 2026-03-30 | Clean LiteLLM v1.83.0 released via new CI/CD v2 pipeline |
| Late March 2026 | Vect ransomware group announces alliance with TeamPCP on BreachForums |
| 2026-04-15 | Vect publishes first victims: Guesty (700 GB), S&P Global (250 GB), property-management company (4M emails, 700 GB) |
| Late April 2026 | 25 confirmed Vect ransomware victims across Manufacturing, Education, Technology in Brazil, India, US |
| Post-incident | Google Mandiant engaged for forensic analysis; all LiteLLM releases v1.78.0-v1.82.6 audited as verified clean |

---

## What Happened

LiteLLM is an AI gateway/proxy used to route requests to 100+ LLM providers (OpenAI, Anthropic, Azure, etc.), with 3.4 million daily PyPI downloads and 95 million monthly downloads. It is a critical piece of infrastructure in enterprise AI pipelines.

The compromise was the culmination of a sophisticated multi-hop supply chain attack by TeamPCP (also known as PCPcat, ShellForce, DeadCatx3), a threat group active since September 2025:

**Hop 1 — Trivy credential theft:** TeamPCP exploited a misconfigured `pull_request_target` workflow in Aqua Security's Trivy GitHub repository — a "Pwn Request" attack that exfiltrated the Personal Access Token for `aqua-bot`, Aqua Security's CI/CD service account. Aqua Security attempted a credential rotation but failed to fully revoke the compromised access.

**Hop 2 — Trivy version poisoning:** Using the stolen PAT, TeamPCP force-pushed malicious code to 76 of 77 version tags in `aquasecurity/trivy-action` and all tags in `aquasecurity/setup-trivy`. The malicious Trivy release propagated through GHCR, ECR Public, Docker Hub, and OS package repositories via standard release machinery.

**Hop 3 — LiteLLM CI/CD token theft:** LiteLLM's CI/CD pipeline ran Trivy without pinned versioning via `apt`. The compromised Trivy GitHub Action ran in LiteLLM's CI/CD environment and exfiltrated the `PYPI_PUBLISH` token — the credential that grants authority to publish packages to PyPI under LiteLLM's namespace.

**Hop 4 — Malicious PyPI publication:** Bypassing LiteLLM's official CI/CD workflows entirely, the attacker used the stolen `PYPI_PUBLISH` token to upload two malicious versions directly to PyPI:

- **v1.82.7** (10:39 UTC): Injected a base64-encoded payload into `litellm/proxy/proxy_server.py` that executed on any `litellm.proxy` import. No corresponding GitHub tag existed for this version.

- **v1.82.8** (10:52 UTC, 13 minutes later): Escalated by adding `litellm_init.pth` — a Python path configuration file that executes on *every Python interpreter startup* when LiteLLM is installed, regardless of whether LiteLLM is imported. This fires on `pip install`, `python -c`, IDE language servers, and any Python process in the environment. A bug in the subprocess spawning created an exponential fork bomb that crashed machines in some environments, which paradoxically accelerated detection.

The compromise was discovered by Callum McMahon at FutureSearch, who noticed the malicious package when it was pulled in as a **transitive dependency by an MCP plugin running inside Cursor**. This discovery path is significant: the AI development toolchain itself — an MCP plugin in a coding IDE — surfaced the supply chain attack because it transitively depended on LiteLLM.

An initial GitHub issue (#24512) was filed around 13:03 UTC but was "closed as 'not planned' and spammed by bots." PyPI quarantined the packages around 13:38 UTC, and they were fully yanked by 20:15 UTC. The malicious versions were available for approximately 3 hours.

**Not affected:** Users running official LiteLLM Proxy Docker images (dependencies pinned in `requirements.txt`), LiteLLM Cloud users, and anyone pinned to v1.82.6 or earlier.

---

## Technical Analysis

### Three-Stage Payload Architecture

The malicious code deployed a sophisticated three-stage payload:

**Stage 1 — Credential Harvesting (50+ secret categories):**

The malware systematically collected credentials from the host system:
- **System:** SSH private keys (`~/.ssh/`), `/etc/shadow` password hashes, shell history (`.bash_history`, `.zsh_history`) containing API keys, Git credentials
- **Cloud:** AWS credentials and config, GCP/Azure service account files, IMDS metadata with IMDSv2 signing, AWS Secrets Manager and SSM Parameter Store contents
- **Container/K8s:** Docker `config.json` registry credentials, Kubernetes `kubeconfig` files, K8s service account tokens, cluster secrets across all namespaces
- **CI/CD:** Jenkins secrets, Travis CI configuration, Terraform state files
- **Application:** `.env` files, Slack/Discord webhooks, TLS private keys, database connection strings
- **Cryptocurrency:** Bitcoin, Ethereum, Solana, Cardano, Monero seed phrases; Ledger hardware wallet configs

**Stage 2 — Encryption and Exfiltration:**

Data was encrypted using military-grade cryptography before exfiltration:
1. Generate 32-byte AES-256 session key via `openssl rand`
2. Encrypt harvested data with AES-256-CBC using PBKDF2 key derivation
3. Encrypt session key with a hardcoded 4096-bit RSA public key (OAEP padding)
4. Bundle as `tpcp.tar.gz`
5. POST to `https://models.litellm[.]cloud/` with header `X-Filename: tpcp.tar.gz`

The identical RSA public key was used across the Trivy, KICS, and LiteLLM operations — described by Snyk as "the strongest single technical attribution link" tying all three compromises to TeamPCP.

**Fallback exfiltration:** If the C2 domain was unreachable, the malware used the victim's `GITHUB_TOKEN` to create a hidden `docs-tpcp` repository and push stolen data there.

**Stage 3 — Persistence and Lateral Movement:**

- **Local persistence:** Backdoor written to `~/.config/sysmon/sysmon.py` (masquerading as a legitimate monitoring service), with a systemd user service at `~/.config/systemd/user/sysmon.service` that polls `https://checkmarx[.]zone/raw` every 5 minutes for remote commands. Disguised as PostgreSQL utility `pgmon` with temp files at `/tmp/pglog` and `/tmp/.pg_state`.
- **Kubernetes lateral movement:** Reads all secrets across every namespace, deploys privileged pods named `node-setup-{node_name}` to `kube-system`, mounts host filesystem to install backdoor on underlying nodes. A destructive variant deploys privileged DaemonSets capable of bricking entire clusters.

### The .pth File Mechanism

The `.pth` (path configuration) file is a Python mechanism where any file ending in `.pth` placed in `site-packages` is read by the Python interpreter at startup. If a line begins with `import`, it is executed as Python code. The `litellm_init.pth` file exploited this to execute malicious code on every Python process invocation — not just when LiteLLM was imported.

This technique bypassed pip hash verification because the malicious content was published using legitimate credentials — the package passed all standard integrity checks. The only signal was the absence of a corresponding GitHub tag for the published version.

### The Fork Bomb Bug

A bug in v1.82.8's subprocess spawning caused an exponential fork bomb that crashed machines in some environments. This was unintentional — a coding error by the attacker — but it paradoxically served as a detection signal. Machines that installed v1.82.8 experienced sudden resource exhaustion, which drew immediate attention.

### Vect Ransomware Encryption Flaw

Check Point Research discovered a fatal flaw in the Vect ransomware deployed against victims compromised through stolen credentials. The ransomware uses AES-256 encryption but discards 3 of 4 decryption nonces for files larger than 128 KB. This means data is **permanently unrecoverable** even if the ransom is paid. Check Point characterized it as "ransomware by design, wiper by accident."

### Attacker Tooling

TeamPCP employed several purpose-built tools:
- **CanisterWorm:** Self-replicating malware using Internet Computer Protocol (ICP) canisters as C2, immune to traditional domain takedowns
- **hackerbot-claw:** Automated targeting tool using the `openclaw` AI agent — an example of offensive AI being used in the attack chain
- **TeamPCP cloud stealer:** Multi-variant credential harvesting payload deployed across Trivy, KICS, and LiteLLM operations

---

## Root Cause Analysis

**Proximate cause:** TeamPCP published malicious LiteLLM packages to PyPI using a stolen `PYPI_PUBLISH` token.

**Why 1:** Why did TeamPCP have LiteLLM's PyPI publishing token?
Because the compromised Trivy GitHub Action ran in LiteLLM's CI/CD pipeline and exfiltrated environment secrets including the `PYPI_PUBLISH` token.

**Why 2:** Why did LiteLLM's CI/CD pipeline run a compromised Trivy?
Because LiteLLM installed Trivy via `apt` without pinning to a specific version hash. When Trivy's release artifacts were poisoned, LiteLLM's pipeline automatically consumed the malicious version.

**Why 3:** Why was Trivy's release infrastructure compromised?
Because Aqua Security's `pull_request_target` workflow was misconfigured, allowing untrusted PRs to run with write access and exfiltrate the `aqua-bot` PAT. A subsequent credential rotation was incomplete.

**Why 4:** Why did the `PYPI_PUBLISH` token have sufficient scope to publish arbitrary packages without additional verification?
Because PyPI publishing tokens are typically scoped to a project but lack additional authentication factors (no MFA on publish, no IP restrictions, no CI-pipeline attestation). Once the token is exfiltrated, it can be used from anywhere to publish any version.

**Why 5 / Root cause:** AI infrastructure components (LLM gateways, AI agent tools, MCP plugins) form densely connected dependency graphs where a single supply chain compromise cascades through security scanners, CI/CD pipelines, package registries, and production environments. The trust model treats "published by legitimate credentials" as a sufficient proof of integrity, but credential theft at any hop in the chain invalidates this assumption across all downstream consumers.

**Root cause summary:** The AI infrastructure supply chain inherits the same trust-chain vulnerabilities as traditional software supply chains, but with amplified blast radius because AI gateways like LiteLLM concentrate access to all LLM API keys, cloud credentials, and infrastructure secrets in a single dependency.

---

## Impact Assessment

**Severity:** Critical

**Who was affected:**
- Organizations that installed LiteLLM v1.82.7 or v1.82.8 from PyPI during the ~3-hour exposure window (subset of 3.4M daily downloaders)
- 25+ organizations targeted by Vect ransomware using credentials stolen in this campaign
- Named victims: Guesty (700 GB claimed stolen), S&P Global (250 GB), property-management technology company (4M emails, 700 GB)
- 1,000+ enterprise SaaS environments affected across the broader TeamPCP campaign

**What was affected:**
- **Credentials:** 50+ categories of secrets including LLM API keys, cloud credentials (AWS/GCP/Azure), SSH keys, Kubernetes secrets, database passwords, TLS private keys, cryptocurrency wallet seeds
- **Infrastructure:** Kubernetes clusters with compromised service accounts; persistent backdoors in production environments
- **Data:** Ransomware encryption with fatal flaw resulting in permanent data loss for files >128 KB
- **Reputation:** LiteLLM's trust as an AI infrastructure component; 44 Aqua Security GitHub repositories defaced

**Quantified impact (where known):**
- Users affected: ~500K credential exfiltrations claimed (unverified; many may be duplicates); 25+ ransomware victims confirmed
- Data exposed: 300+ GB exfiltrated data (per Unit 42); 50+ categories of secrets
- Financial impact: Unquantified but substantial — ransomware extortion + credential rotation costs + permanent data loss
- Recovery time: Multi-week credential rotation minimum; permanent loss for Vect ransomware victims due to encryption flaw; cryptocurrency wallets with stolen seeds permanently compromised

**Containment:** The compromise was detected by an external researcher (Callum McMahon, FutureSearch) who noticed the malicious package as a transitive dependency of an MCP plugin in Cursor. PyPI quarantined packages approximately 3 hours after initial publication. However, the persistence mechanism (systemd service polling C2 every 5 minutes) continues operating indefinitely in any environment where it was installed and not manually removed. The ransomware escalation began 3 weeks after initial compromise and was still active as of late April 2026.

---

## How It Could Have Been Prevented

1. **Pin CI/CD security scanner versions by cryptographic hash:** LiteLLM installed Trivy via `apt` without version pinning. Pinning to a specific version hash (not just a version number) would have prevented the compromised Trivy from being consumed automatically.

2. **Isolate PyPI publish tokens in dedicated, minimal-scope CI/CD workflows:** The `PYPI_PUBLISH` token was accessible in the same CI/CD environment where Trivy ran. Publishing tokens should be stored in a separate workflow triggered only on release events, with no access to security scanning steps.

3. **Require PyPI Trusted Publishers (OIDC-based publishing):** PyPI supports Trusted Publishers, which tie package publication to specific GitHub repositories and workflows via OIDC tokens rather than long-lived API tokens. This would have prevented publication from outside the official CI/CD pipeline.

4. **Monitor for PyPI releases without corresponding GitHub tags:** Both v1.82.7 and v1.82.8 had no corresponding GitHub tags — a strong anomaly signal. Automated monitoring for this discrepancy would have enabled faster detection.

5. **Audit transitive dependencies in AI agent toolchains:** The discovery happened because an MCP plugin in Cursor pulled LiteLLM as a transitive dependency. Organizations should audit the full dependency tree of their AI agent plugins, MCP servers, and tool integrations — not just direct dependencies.

6. **Implement Kubernetes RBAC with minimal service account permissions:** The lateral movement payload exploited overly permissive Kubernetes service accounts to read secrets across all namespaces and deploy privileged pods. Strict RBAC, namespace isolation, and pod security standards would have limited blast radius.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**
- PyPI quarantined malicious packages approximately 3 hours after publication; fully yanked by 20:15 UTC
- LiteLLM released clean v1.83.0 on March 30 via a new CI/CD v2 pipeline with redesigned security controls
- All maintainer credentials were rotated
- All releases v1.78.0 through v1.82.6 were audited and verified clean
- Google Mandiant was engaged for forensic analysis
- LiteLLM held a security townhall on March 27

**Additional recommended fixes:**
- All organizations that installed malicious versions must perform a complete credential rotation: every SSH key, API key, database password, cloud access token, Kubernetes secret, and TLS certificate in the affected environment
- Search for persistence artifacts: `~/.config/sysmon/sysmon.py`, `~/.config/systemd/user/sysmon.service`, `/tmp/pglog`, `/tmp/.pg_state`
- Search Kubernetes clusters for pods matching `node-setup-*` in `kube-system` namespace or containers named `kamikaze` or `provisioner`
- Regenerate any cryptocurrency wallets whose seed phrases were stored on affected systems — these are permanently compromised
- Audit GitHub repositories for unauthorized `docs-tpcp` repos (fallback exfiltration mechanism)
- Rebuild Kubernetes clusters if privileged pods were deployed by the attacker

---

## Solutions Analysis

### 1. Cryptographic Supply Chain Integrity (Sigstore / SLSA)
- **Type:** Cryptographic / Integrity Controls
- **Plausibility:** 4/5 — SLSA provenance attestations and Sigstore signatures can verify that a package was built from a specific source commit in a specific CI/CD pipeline. Would have flagged v1.82.7/v1.82.8 as lacking provenance.
- **Practicality:** 3/5 — PyPI supports Trusted Publishers (OIDC) and is adopting attestation standards, but ecosystem-wide adoption is incomplete. Requires upstream projects (Trivy, LiteLLM) to opt in and downstream consumers to verify.
- **How it applies:** If LiteLLM had used PyPI Trusted Publishers, the stolen `PYPI_PUBLISH` token could not have been used to publish from outside the official GitHub Actions workflow. If consumers verified SLSA provenance, the absence of a matching GitHub tag would have been detected.
- **Limitations:** Does not prevent compromise of the CI/CD pipeline itself — if the attacker modifies the workflow file, the provenance chain is legitimate but the code is malicious.

### 2. CI/CD Pipeline Hardening and Secret Isolation
- **Type:** Permission Scoping / Least Privilege
- **Plausibility:** 5/5 — Isolating publishing credentials from scanning/testing workflows would have directly prevented the `PYPI_PUBLISH` token from being accessible to the compromised Trivy step.
- **Practicality:** 4/5 — Requires restructuring CI/CD workflows into separate jobs with scoped secrets. Most CI/CD platforms (GitHub Actions, GitLab CI) support this natively. The effort is non-trivial but well-documented.
- **How it applies:** If LiteLLM's `PYPI_PUBLISH` token existed only in a dedicated release workflow — separate from the workflow that ran Trivy — the compromised scanner could not have exfiltrated it.
- **Limitations:** Does not address the upstream Trivy compromise itself, only LiteLLM's exposure to it. Other secrets in the scanning workflow (e.g., `GITHUB_TOKEN`) could still be exfiltrated.

### 3. Dependency Pinning by Cryptographic Hash
- **Type:** Architectural Redesign
- **Plausibility:** 4/5 — Pinning dependencies (including security scanners) to specific cryptographic hashes prevents automatic consumption of compromised versions. Would have prevented the Trivy-to-LiteLLM hop.
- **Practicality:** 3/5 — Feasible for direct dependencies but creates maintenance burden (manual hash updates for every version bump). Docker image digests and GitHub Action commit SHAs are supported but not universally adopted.
- **How it applies:** `uses: aquasecurity/trivy-action@<commit-sha>` instead of `uses: aquasecurity/trivy-action@v0.69.4` would have prevented the force-pushed malicious tag from affecting LiteLLM's pipeline.
- **Limitations:** Requires discipline to update hashes promptly when legitimate security patches are released. Does not protect against compromise of the source repository at the pinned commit.

### 4. Transitive Dependency Auditing for AI Agent Tools
- **Type:** Monitoring and Detection
- **Plausibility:** 3/5 — Regular auditing of the full dependency tree of MCP plugins, AI agent tools, and LLM gateway configurations could surface unexpected or suspicious packages. The incident was in fact discovered this way.
- **Practicality:** 2/5 — AI agent ecosystems (MCP plugins, LangChain tools, LiteLLM integrations) have rapidly growing dependency trees that change frequently. Automated tooling for this specific use case is immature.
- **How it applies:** Callum McMahon discovered the compromise specifically because an MCP plugin in Cursor pulled LiteLLM as a transitive dependency. Systematic auditing of this kind would catch similar incidents earlier.
- **Limitations:** Detection is reactive, not preventive — by the time a compromised package is in your dependency tree, credential harvesting may have already occurred.

### 5. Runtime Behavioral Monitoring
- **Type:** Monitoring and Detection
- **Plausibility:** 4/5 — The malware's behavior (reading `~/.ssh/`, querying IMDS, creating systemd services, deploying K8s pods) is anomalous for an LLM gateway package. Runtime monitoring tools (Falco, Datadog ASM, Sysdig) could detect these patterns.
- **Practicality:** 3/5 — Requires runtime security tooling deployed in the same environments where LiteLLM runs. Python development environments (laptops, CI runners) are less commonly monitored than production servers.
- **How it applies:** The credential harvesting stage reads files and makes network requests that are far outside LiteLLM's normal behavior profile. The fork bomb in v1.82.8 was actually detected this way — resource exhaustion triggered investigation.
- **Limitations:** The .pth file mechanism fires on every Python process, making the malicious behavior appear as general system activity rather than being attributable to a specific package. Baseline noise in development environments is high.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| [[AAGF-2026-007]] | Shared root cause cluster: credential over-permissioning enabling blast radius far beyond intended scope. In AAGF-2026-007, an overly-scoped Railway token enabled a coding agent to delete production infrastructure. In AAGF-2026-009, an overly-accessible PyPI publish token enabled a compromised scanner to publish malicious packages. Both demonstrate that credential scope controls are the critical chokepoint. |

---

## Strategic Council Review

*Independent review conducted 2026-05-05. The reviewer had access only to this draft report, not the underlying research document or analyst reasoning.*

### Phase 1 — Challenger

**Challenge 1: The 500K credential figure is unverified and the report over-relies on it.** The 500K number originates from vx-underground sources cited by Unit 42. BleepingComputer explicitly states it "could not independently confirm" and notes "many may be duplicates." No other Tier-1 source independently corroborates this figure. Yet the report uses it in the headline stat, the affected_parties section, and the impact assessment. An unverified claim from a single underground source chain — regardless of who cites it downstream — should not anchor the narrative. The true number of unique, actionable credential sets could be an order of magnitude lower.

**Challenge 2: The 3-hour window versus 3.4M daily downloads arithmetic is misleading.** The report juxtaposes "3.4M daily downloads" with "3 hours of exposure" without computing the realistic intersection. 3.4M daily = ~142K hourly. Over 3 hours, that is ~425K raw downloads. But the report itself acknowledges that Docker image users (the majority of production deployments) were unaffected, that PyPI mirrors cache and re-serve packages inflating counts, and that CI/CD automated pulls may fetch without installing. The actual number of environments that executed the malicious code is unknown and likely a small fraction of the download count. The report should not allow readers to multiply 3.4M by a fraction and arrive at a scary number — it should state what is known and what is not.

**Challenge 3: Is this genuinely an AI agent incident, or a traditional supply chain attack that happened to target an AI library?** The attack chain — compromised CI/CD credentials, malicious package publication, credential harvesting, ransomware — is a textbook software supply chain attack. The techniques (.pth file persistence, systemd services, IMDS credential theft) are language-ecosystem attacks, not AI-specific attacks. The "AI agent" framing rests on two facts: (a) the target was an AI gateway library, and (b) it was discovered via an MCP plugin. But the payload did not exploit any AI-specific behavior — it did not manipulate model outputs, poison training data, or abuse agent tool-calling capabilities. Classifying this as an "AI agent incident" versus a "supply chain incident affecting AI infrastructure" matters for the taxonomy's integrity.

**Challenge 4: The Guesty and S&P Global attribution is weakly sourced.** These are named as Vect ransomware victims, sourced from Halcyon's ransomware alert. But Halcyon reports on ransomware group claims — these are attacker-asserted victim lists, not independently verified breaches. Neither Guesty nor S&P Global appear to have publicly confirmed being compromised through this specific campaign. Ransomware groups routinely exaggerate or misattribute victims. The report presents these names with insufficient qualification.

**Challenge 5: The "fatal encryption flaw" characterization may overstate certainty of permanence.** Check Point Research confirmed the flaw in Vect's encryption scheme (discarding 3 of 4 nonces for files >128 KB). This is well-sourced. However, characterizing data as "permanently unrecoverable" assumes no future cryptanalytic advances, no implementation errors in the key derivation that might be exploitable for recovery, and no attacker cooperation. "Unrecoverable with current techniques" would be more precise. The report uses "permanently" 6 times in connection with this flaw.

**Challenge 6: The root cause analysis conflates two distinct failures.** The 5-Why chain jumps from "LiteLLM's CI/CD was vulnerable" (a specific operational failure) to "AI infrastructure supply chains have amplified blast radius" (a structural claim about the AI ecosystem). The structural claim is an editorial thesis, not a root cause derived from the incident evidence. The actual root cause is more mundane: unpinned dependencies in CI/CD combined with overly-scoped secrets. This root cause is shared with dozens of non-AI supply chain attacks (event-stream, ua-parser-js, colors.js). The AI-specific amplification argument — that AI gateways concentrate credentials — is valid but it is an impact amplifier, not a root cause.

### Phase 2 — Steelman

**Defense 1: Critical severity is justified on confirmed facts alone, without the 500K figure.** Strip away every unverified claim. What remains: (a) a multi-hop supply chain compromise confirmed by 5+ Tier-1 security firms, (b) a payload that harvested 50+ categories of secrets including cloud infrastructure credentials and K8s cluster secrets — confirmed by Snyk, Datadog, and Sonatype through independent code analysis, (c) at least 25 ransomware victims (number confirmed by Halcyon, even if individual identities are attacker-claimed), and (d) a confirmed fatal encryption flaw meaning ransomware victims suffer permanent data loss. Any single one of (b), (c), or (d) alone would justify High severity. The combination — particularly permanent data loss for ransomware victims — clearly reaches Critical. The report's severity rating does not depend on the 500K figure.

**Defense 2: The AI-infrastructure angle is genuinely distinct from a generic supply chain attack, even if the techniques are traditional.** The report's thesis is not that the attack techniques were AI-specific, but that the target's position in the AI ecosystem amplified the blast radius in a categorically different way. A compromised logging library leaks the credentials in its environment. A compromised AI gateway leaks every LLM API key for every provider the organization uses — because that is the library's purpose. LiteLLM exists specifically to aggregate credentials for 100+ LLM providers. This is not incidental; it is the design. The concentration of high-value credentials in a single dependency is an emergent property of AI infrastructure architecture, and it makes the supply chain attack surface qualitatively different. The incident belongs in an AI incident taxonomy because the impact profile is shaped by the target's AI-infrastructure role.

**Defense 3: The discovery via MCP plugin transitive dependency is independently documented and structurally significant.** Callum McMahon's FutureSearch blog post describes the discovery path in detail. This is not speculation — it is the documented chain of events. The structural significance is that AI development toolchains (Cursor + MCP plugins) create dependency paths that are invisible to traditional package auditing. An organization might audit its direct dependencies but miss that an MCP plugin for their coding IDE transitively pulls in an AI gateway library. This is a real and growing attack surface as MCP adoption increases.

**Defense 4: The multi-hop attack chain (Trivy -> LiteLLM CI/CD -> PyPI -> end users) is independently verified by multiple sources.** Snyk, Datadog, Unit 42, Microsoft, and Arctic Wolf all independently documented portions of the attack chain. The RSA public key reuse across Trivy, KICS, and LiteLLM operations (identified by Snyk as "the strongest single technical attribution link") provides cryptographic evidence of shared attacker infrastructure. This is not a single-source attribution — it is convergent analysis from competing security firms.

**Defense 5: The Check Point "ransomware by design, wiper by accident" finding is robustly sourced.** Check Point Research published a detailed technical analysis of the encryption flaw. The finding was corroborated by references in CSA Labs and The Register. The flaw is a code-level bug (discarding nonces), not a theoretical weakness. While "permanently unrecoverable" could be softened to "unrecoverable with known techniques," the practical distinction is negligible — the nonces are discarded, not merely obscured, so there is no key material to recover.

### Phase 3 — Synthesis

The Critical severity rating is sound and does not depend on any single unverified claim. The attack chain is exceptionally well-sourced, with independent corroboration from five or more Tier-1 security research firms. The Vect encryption flaw — confirmed by Check Point Research — transforms what would be a severe-but-recoverable credential theft into an incident with confirmed permanent data loss. These facts alone justify Critical.

However, the report has a precision problem. It presents unverified figures (500K credentials, named victims Guesty and S&P Global) with insufficient qualification, creating an impression of certainty that the evidence does not support. The headline stat leads with "500K credentials stolen" when the verified characterization is "industrial-scale credential harvesting with unverified scope." The Challenger is correct that Guesty and S&P Global are attacker-claimed victims reported by a ransomware intelligence firm, not independently confirmed breaches. The report should systematically distinguish between confirmed facts (attack chain, payload capabilities, encryption flaw) and unverified claims (credential count, specific victim identities), using qualifiers like "claimed" or "unverified" consistently. The root cause analysis should also be tightened: the actual root causes are unpinned CI/CD dependencies and overly-scoped publishing tokens — these are specific, actionable, and not AI-specific. The AI-gateway credential concentration is better framed as an impact amplifier that makes these common supply chain failures catastrophically worse when they affect AI infrastructure.

The classification as an AI agent incident is defensible but requires precision. This is not an incident where an AI agent behaved unexpectedly or was manipulated through its AI capabilities. It is a supply chain attack whose impact was amplified by the target's role in AI infrastructure. The report should be explicit about this distinction: the attack techniques were traditional, but the blast radius was shaped by the AI ecosystem's architectural patterns (credential concentration in gateways, transitive dependencies through MCP plugins, AI toolchain as both propagation vector and detection surface).

**Confidence level:** High on attack chain, payload analysis, severity rating, and encryption flaw. Medium on scale of impact (credential count, victim attribution). Low on the causal link between specific LiteLLM installations and specific Vect ransomware victims.

**Unresolved uncertainties:**
- Actual download and execution count of malicious LiteLLM versions during the 3-hour window — PyPI does not publish per-version hourly download statistics, and raw download counts conflate mirrors, CI caches, and actual installations
- Whether Guesty, S&P Global, and the unnamed property-management company were compromised specifically through the LiteLLM vector versus other TeamPCP entry points (Trivy direct, KICS, npm packages, Telnyx SDK)
- Google Mandiant forensic investigation results — engaged but not yet public as of May 2026; these could materially change the impact assessment in either direction
- Whether exfiltrated LLM API keys were used for unauthorized inference, prompt injection, or other AI-specific downstream attacks — this would strengthen the AI-agent classification if confirmed
- The true unique credential count — the 500K figure is single-sourced from vx-underground via Unit 42, explicitly flagged as unverified by BleepingComputer, and likely includes significant duplication
- Long-term persistence: how many environments still have the systemd backdoor actively polling checkmarx.zone for commands, weeks after the initial compromise

---

## Key Takeaways

1. **AI gateways are high-value supply chain targets:** LiteLLM concentrates access to 100+ LLM providers' API keys in a single dependency. Compromising it gives attackers the keys to every AI service an organization uses. Treat AI gateway dependencies with the same rigor as credential management infrastructure — pin versions by hash, use Trusted Publishers, monitor for tagless releases.

2. **Security scanners in CI/CD are themselves attack surface:** The Trivy compromise demonstrates a recursive vulnerability — the tool meant to find vulnerabilities in your pipeline becomes the vector for compromising your pipeline. Security tooling should be pinned by commit SHA (not version tag), run in isolated jobs with no access to publishing credentials, and itself be subject to supply chain verification.

3. **The .pth file mechanism is a Python-ecosystem-wide risk:** Any Python package published with legitimate credentials can include a `.pth` file that executes code on every Python process startup — not just when the package is imported. This bypasses import-based detection, pip hash verification, and virtual environment isolation assumptions. Python security tooling needs to specifically scan for `.pth` files in installed packages.

4. **Transitive dependencies in AI agent toolchains are invisible blast radius:** The compromise was discovered because an MCP plugin in Cursor transitively depended on LiteLLM. Most organizations do not audit the full dependency tree of their AI agent plugins, MCP servers, and tool integrations. As AI agent ecosystems grow more interconnected, transitive dependency auditing becomes a critical security practice.

5. **"Ransomware by design, wiper by accident" is a new threat class:** Vect's fatal encryption flaw means paying the ransom does not recover data. This changes the cost-benefit analysis for incident response — there is no negotiation path. The only defense is prevention and offline backups that are not reachable from the compromised environment.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| LiteLLM official security update | https://docs.litellm.ai/blog/security-update-march-2026 | 2026-03-24 | High — primary vendor disclosure |
| Snyk blog | https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/ | 2026-03-25 | High — security research firm; full attack chain analysis |
| Datadog Security Labs | https://securitylabs.datadoghq.com/articles/litellm-compromised-pypi-teampcp-supply-chain-campaign/ | 2026-03-26 | High — full TeamPCP campaign timeline and IOCs |
| Palo Alto Unit 42 | https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/ | 2026-03-27 | High — TeamPCP attribution, CanisterWorm analysis, 500K credential estimate |
| FutureSearch blog (discoverer) | https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/ | 2026-03-24 | High — primary discoverer account; fork bomb bug detail; MCP plugin discovery path |
| BleepingComputer | https://www.bleepingcomputer.com/news/security/popular-litellm-pypi-package-compromised-in-teampcp-supply-chain-attack/ | 2026-03-25 | High — independent journalism; notes 500K claim is unverified |
| Halcyon ransomware alert | https://www.halcyon.ai/ransomware-alerts/trivy-supply-chain-compromise-enters-extortion-phase-as-vect-ransomware-publishes-first-victim | 2026-04-15 | High — ransomware intelligence; first victims identified |
| Check Point Research | https://research.checkpoint.com/2026/vect-ransomware-by-design-wiper-by-accident/ | 2026-04 | High — Vect encryption flaw analysis; "ransomware by design, wiper by accident" characterization |
| The Hacker News | https://thehackernews.com/2026/03/teampcp-backdoors-litellm-versions.html | 2026-03-25 | High — security journalism |
| Arctic Wolf advisory | https://arcticwolf.com/resources/blog/teampcp-supply-chain-attack-campaign-targets-trivy-checkmarx-kics-and-litellm-potential-downstream-impact-to-additional-projects/ | 2026-03 | High — security firm advisory |
| Kaspersky blog | https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/ | 2026-03 | High — security firm advisory |
| Microsoft Security Blog | https://www.microsoft.com/en-us/security/blog/2026/03/24/detecting-investigating-defending-against-trivy-supply-chain-compromise/ | 2026-03-24 | High — vendor advisory for Trivy detection |
| GitHub issue #24518 | https://github.com/BerriAI/litellm/issues/24518 | 2026-03-24 | High — primary project tracker |
| Sonatype blog | https://www.sonatype.com/blog/compromised-litellm-pypi-package-delivers-multi-stage-credential-stealer | 2026-03 | Medium — multi-stage credential stealer analysis |
| OX Security blog | https://www.ox.security/blog/litellm-malware-malicious-pypi-versions-steal-cloud-and-crypto-credentials/ | 2026-03 | Medium — cloud and crypto credential theft focus |
| InfoQ | https://www.infoq.com/news/2026/03/litellm-supply-chain-attack/ | 2026-03 | Medium — technology journalism |
