---
id: "AAGF-2026-071"
title: "LMDeploy CVE-2026-33626: SSRF in VLM Image Loader Exploited 12 Hours After Advisory Publication"
status: "reviewed"
date_occurred: "2026-04-22"        # First confirmed exploitation: April 22, 2026, 03:35 UTC
date_discovered: "2026-03-27"      # Patch merged (implying private disclosure existed)
date_reported: "2026-04-18"        # GitHub Security Advisory GHSA-6w67-hwm5-92mq published
date_curated: "2026-05-07"
date_council_reviewed: "2026-05-07"

# Classification
category:
  - "Unauthorized Data Access"
  - "Tool Misuse"
severity: "high"
agent_type:
  - "Tool-Using Agent"
agent_name: "LMDeploy (InternLM/Shanghai AI Lab)"
platform: "LMDeploy v0.12.2 and earlier — OpenAI-compatible VLM inference API"
industry: "AI Infrastructure / MLOps"

# Near-miss classification
actual_vs_potential: "partial"
potential_damage: "High — any internet-exposed or VPC-internal LMDeploy instance running ≤v0.12.2 on AWS EC2 was reachable via SSRF. Successful IAM credential exfiltration would yield temporary STS credentials (AccessKeyId, SecretAccessKey, SessionToken) valid for ~6 hours, enabling S3 exfiltration of model weights and training data, EC2 control plane access, and lateral movement within the AWS account. Loopback Redis and MySQL probe phases suggest intent to enumerate additional data stores. The attack class is scalable: the same 10-request HTTP session works against any unauthenticated LMDeploy instance without modification."
intervention: "Sysdig honeypot design prevented credential confirmation — IMDS was reached but the honeypot did not return real IAM credentials. Patch (v0.12.3) was available 13 days before the advisory triggered exploitation, but without urgency signaling in the changelog; operators who had upgraded before April 21 were not exposed. IMDSv2 enforcement on the honeypot instance may have also blocked the credential harvest phase even though SSRF executed."

# Impact
financial_impact: "Not quantified — no confirmed credential exfiltration or downstream financial loss. Sysdig honeypot intercepted the attack before real-world financial damage was confirmed."
financial_impact_usd: null
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: null                    # At minimum 1 honeypot; production victim count unknown
  scale: "widespread"            # Any internet-exposed LMDeploy instance on ≤0.12.2 was at risk
  data_types_exposed:
    - "credentials"              # AWS IAM temporary credentials reachable via IMDS (not confirmed exfiltrated)

# Damage Timing
damage_speed: "8 minutes"        # Full attack session duration (03:35–03:43 UTC)
damage_duration: "8 minutes"     # Attack session; broader exploitation window open from April 22 until patched
total_damage_window: "unknown"   # No confirmed close date on exploitation activity beyond Sysdig observation

# Recovery
recovery_time: "unknown"         # Patch was available (v0.12.3, April 8) but operator deployment lag unknown
recovery_labor_hours: null
recovery_cost_usd: null
recovery_cost_notes: "Operators must upgrade to v0.12.3; cloud deployments should rotate IAM credentials and audit IMDS access logs for the exploitation window."
full_recovery_achieved: "unknown"

# Business Impact
business_scope: "multi-org"      # Any organization running exposed LMDeploy ≤0.12.2 in cloud
business_criticality: "high"
business_criticality_notes: "Confirmed exploitation of AWS IMDS endpoint on a live inference node. Successful credential theft in a real production environment would yield IAM credentials enabling S3 data access, EC2 control, and potential full account compromise."
systems_affected:
  - "ai-inference-api"
  - "cloud-metadata-service"
  - "customer-data"             # S3 model weights and training data accessible via likely IAM roles
  - "production-database"       # Redis and MySQL probed on loopback

# Vendor Response
vendor_response: "fixed"
vendor_response_time: "7-30 days"    # Private disclosure ~early March; fix merged March 27; v0.12.3 released April 8

# Damage Quantification
damage_estimate:
  confirmed_loss_usd: null
  recovery_cost_usd: null
  averted_damage_usd: 2625000        # See methodology
  averted_range_low: 750000
  averted_range_high: 7500000
  composite_damage_usd: 2625000
  confidence: "estimated"
  probability_weight: 0.35           # Confirmed exploitation + IMDS reached, no confirmed exfiltration
  methodology: "5,000 exposed LMDeploy instances × $1,500 avg breach cost per instance × 0.35 probability weight"
  methodology_detail:
    per_unit_cost_usd: 1500          # Average breach cost per compromised instance (conservative; IBM CODB uses $4.9M/org but for small AI infra deployments $1,500 per instance is defensible)
    unit_count: 5000                 # Estimated cloud-deployed instances; Shodan shows 3 internet-facing but most are VPC-internal
    unit_type: "machine"
    multiplier: 1.0
    benchmark_source: "IBM Cost of a Data Breach 2024 (scaled to single-instance exposure); Sysdig 2026 AI Infrastructure Threat Report"
  estimation_date: "2026-05-07"
  human_override: false
  notes: "The 5,000-instance estimate is highly uncertain. Shodan showed only 3 internet-facing instances but the vast majority of LMDeploy deployments are behind VPC security groups — reachable from within corporate networks or by attackers who establish initial access. The $1,500 per-instance figure is a conservative floor; a successful IAM credential theft on a production ML node could enable S3 exfiltration of proprietary model weights or training data, making per-incident costs orders of magnitude higher. Probability weight of 0.35 reflects: confirmed exploitation (IMDS reached) but no confirmed exfiltration from any real production instance."

# Presentation
headline_stat: "12h 31m from CVE advisory to active exploitation of AI inference infrastructure — no PoC needed, likely LLM-assisted weaponization"
operator_tldr: "Upgrade LMDeploy to v0.12.3 immediately; enforce IMDSv2 on all EC2 inference nodes; add API authentication and network egress controls to block SSRF to 169.254.169.254 and RFC 1918 ranges."
containment_method: "third_party"    # Sysdig honeypot intercepted and documented the attack
public_attention: "medium"

# Framework References
framework_refs:
  mitre_atlas:
    - "AML.T0024"      # Exfiltration via AI Inference API — attacker used the inference API as the SSRF vector
    - "AML.T0085"      # Data from AI Services — IMDS credential data reached via the AI service
    - "AML.T0085.001"  # AI Agent Tools — image loader tool was the pivot
    - "AML.T0086"      # Exfiltration via AI Agent Tool Invocation — tool call executed the SSRF
    - "AML.T0053"      # AI Agent Tool Invocation — load_image() called attacker URL
    - "AML.T0055"      # Unsecured Credentials — IMDS IAM credentials reachable without additional auth
    - "AML.T0098"      # AI Agent Tool Credential Harvesting — credentials harvested via tool output
    - "AML.T0012"      # Valid Accounts — temporary AWS credentials targeted for lateral movement
  owasp_llm:
    - "LLM02:2025"     # Sensitive Information Disclosure — AWS IAM credentials exposed via inference
    - "LLM06:2025"     # Excessive Agency — inference server executed outbound HTTP to attacker-supplied URLs
  owasp_agentic:
    - "ASI02:2026"     # Tool Misuse and Exploitation — VLM image loader weaponized as SSRF pivot
    - "ASI03:2026"     # Agent Identity and Privilege Abuse — inference server's IAM role exceeded its needed scope
  ttps_ai:
    - "2.9"            # Credential Access — IMDS IAM credential targeting
    - "2.12"           # Collection — API surface enumeration via openapi.json
    - "2.15"           # Exfiltration — credential theft attempt (confirmed IMDS reach)
    - "2.10"           # Discovery — Redis, MySQL, admin port probing
    - "2.11"           # Lateral Movement — IAM credentials enable AWS lateral movement

# Relationships
related_incidents:
  - "AAGF-2026-052"    # Langflow CVE-2026-33017: SSRF/RCE → IMDS credential theft, same attack pattern, ~20h advisory-to-exploit
pattern_group: "ai-infrastructure-ssrf"
tags:
  - "ssrf"
  - "vlm"
  - "image-loader"
  - "aws-imds"
  - "credential-theft"
  - "lmdeploy"
  - "ai-inference"
  - "rapid-exploitation"
  - "llm-assisted-weaponization"
  - "missing-input-validation"
  - "insecure-default-configuration"
  - "cve-2026-33626"
  - "honeypot"

# Metadata
sources:
  - "https://sysdig.com/blog/cve-2026-33626-how-attackers-exploited-lmdeploy-llm-inference-engines-in-12-hours"
  - "https://github.com/InternLM/lmdeploy/security/advisories/GHSA-6w67-hwm5-92mq"
  - "https://nvd.nist.gov/vuln/detail/CVE-2026-33626"
  - "https://github.com/InternLM/lmdeploy/pull/4447"
  - "https://github.com/InternLM/lmdeploy/releases/tag/v0.12.3"
researcher_notes: "Sysdig honeypot is the sole source of in-the-wild exploitation evidence. No independent honeypot or CERT corroboration identified as of 2026-05-07. Orca Security (Igor Stepansky, discoverer) has not published a separate disclosure blog post. Open question: the patch description mentions allow_redirects=False but current main branch shows allow_redirects=True with max_redirects=3 — verify whether v0.12.3 tag retains strict redirect-blocking. CISA KEV status should be rechecked after 2026-05-14. Agent type is Tool-Using Agent because the AI inference server uses load_image() as an HTTP-fetching tool; the LLM/VLM component itself is not making the decision — the tool call is hardcoded to execute on any image_url in the request. This sits at the AI infrastructure/tool layer, not the LLM reasoning layer."
council_verdict: "publish-with-caveats"
---

# LMDeploy CVE-2026-33626: SSRF in VLM Image Loader Exploited 12 Hours After Advisory Publication

## Executive Summary

Twelve hours and thirty-one minutes after a public security advisory named the vulnerable function, attackers weaponized CVE-2026-33626 — a Server-Side Request Forgery flaw in LMDeploy's vision-language model image loader — to reach AWS Instance Metadata Service endpoints on cloud-deployed AI inference nodes. The attack required no proof-of-concept code, no authentication, and only a standard HTTP POST to the OpenAI-compatible endpoint; the likely attack vector was LLM-assisted exploit generation directly from the advisory text. A Sysdig honeypot captured the full 8-minute, 10-request attack session, confirming IMDS access and internal service probing, but no credential exfiltration was confirmed; a patch (v0.12.3) had been available for 13 days before the advisory made the vulnerability actionable.

---

## Timeline

| Date/Time (UTC) | Event |
|-----------------|-------|
| ~Early March 2026 | Vulnerability reported to InternLM by Igor Stepansky (Orca Security) — private disclosure (inferred from patch merge date) |
| 2026-03-27 | Fix merged — PR #4447 adds `_is_safe_url()` to `lmdeploy/vl/media/connection.py` |
| 2026-04-08 03:37 UTC | LMDeploy v0.12.3 released with "fix security issues" changelog entry (no CVE attribution) |
| 2026-04-18 | GitHub Security Advisory GHSA-6w67-hwm5-92mq published |
| 2026-04-20 | CVE-2026-33626 received and published by NVD; CVSS 7.5 (High) |
| **2026-04-21 15:04 UTC** | **Advisory confirmed public on GitHub** |
| **2026-04-22 03:35 UTC** | **First exploitation attempt observed (Sysdig honeypot) — 12h 31m after advisory** |
| 2026-04-22 03:43 UTC | Attack session ends (8 minutes, 10 distinct requests) |
| 2026-04-22 | Sysdig blog post published documenting the attack |
| 2026-05-05 | Sysdig April 2026 Security Briefing independently corroborates the 12-hour exploitation window |
| 2026-05-07 | No CISA KEV listing identified (research date) |

---

## What Happened

LMDeploy is an open-source LLM/VLM inference engine developed by InternLM (Shanghai AI Lab), providing an OpenAI-compatible HTTP API for serving vision-language models such as InternVL2 and InternLM-XComposer2. Organizations deploy it on cloud instances (primarily EC2) to serve multimodal AI workloads. By default, LMDeploy binds on `0.0.0.0` and requires no API authentication — a configuration appropriate for development but dangerous in cloud production environments.

Igor Stepansky of Orca Security discovered that LMDeploy's VLM image loading subsystem accepted arbitrary attacker-controlled URLs in chat completion requests and would fetch them server-side without any IP range validation. He reported the flaw privately to InternLM. The fix — a new `_is_safe_url()` function that blocked non-globally-routable IPs — was merged into the codebase on March 27, 2026 via PR #4447, and included in v0.12.3 released April 8. However, the release changelog contained only "fix security issues" with no CVE attribution or urgency signal, reducing operator awareness that this was a security-critical update.

On April 18, the GitHub Security Advisory GHSA-6w67-hwm5-92mq was published, and by April 20–21 the CVE was in the NVD. The advisory was specific: it named `load_image()` as the vulnerable function, described the missing IP validation, and explained the SSRF attack scenario. At 15:04 UTC on April 21, the advisory became publicly accessible on GitHub.

Twelve hours and thirty-one minutes later, at 03:35 UTC on April 22, a Sysdig honeypot running a genuine LMDeploy instance detected the first exploit attempt. The attacker — originating from a Hong Kong IP address (103.116.72.119, AS400618 Prime Security Corp.) — executed a structured, three-phase attack across 8 minutes and 10 requests. No public proof-of-concept code existed at the time; Sysdig confirmed this explicitly. The speed and structure of the attack is consistent with LLM-assisted exploit generation directly from the advisory text — a pattern Sysdig also identified in the near-simultaneous Marimo CVE-2026-39987 exploitation.

---

## Technical Analysis

### The VLM Image Loader as SSRF Pivot

LMDeploy's vision-language model endpoint accepts multimodal chat completion requests following the OpenAI specification. Requests can include `image_url` parameters containing HTTP(S) URLs to images that the model should analyze:

```json
POST /v1/chat/completions
{
  "model": "OpenGVLab/InternVL2-8B",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "describe this image"},
      {"type": "image_url", "image_url": {"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}}
    ]
  }]
}
```

The server accepts this request, internally calls `load_image()` in `lmdeploy/vl/utils.py` with the attacker-supplied URL, which delegates to `_load_http_url()` in `lmdeploy/vl/media/connection.py`. In vulnerable versions (≤0.12.2), `_load_http_url()` called `requests.get(url)` without any IP range validation, scheme restriction, or redirect control. The LMDeploy process — running on an EC2 instance — made an outbound HTTP GET to the attacker-specified address using the server's own network identity.

This transforms the VLM inference endpoint into a generic server-side HTTP proxy reachable by any unauthenticated user with network access to the API port.

### Why Cloud AI Inference Nodes Are High-Value SSRF Targets

Four compounding factors made this particularly dangerous:

1. **Default `0.0.0.0` binding**: LMDeploy listens on all interfaces without configuration hardening, making it reachable by any host with network access — including internet-facing deployments with permissive security groups.
2. **No default API authentication**: The OpenAI-compatible endpoint requires no credentials to submit requests.
3. **Cloud deployment pattern**: AI inference nodes are predominantly deployed on EC2 and similar cloud instances where IMDSv1 is available at the link-local address `169.254.169.254` — accessible only from the instance itself, but reachable via SSRF.
4. **IAM role over-scoping**: ML inference nodes typically carry IAM roles with access to S3 (model weights, training data), CloudWatch (logging), and sometimes broader permissions inherited from infrastructure templates.

### The Three-Phase Kill Chain

**Phase 1 — Cloud Metadata and Data Store Discovery (03:35 UTC)**
The attacker submitted VLM requests with `image_url` values targeting:
- `http://169.254.169.254/latest/meta-data/iam/security-credentials/` — AWS IMDS IAM role name enumeration
- `http://127.0.0.1:6379` — Redis default port probe

**Phase 2 — Egress Testing and API Enumeration (03:37 UTC)**
- `http://cw2mhnbd.requestrepo.com` — Out-of-band (OAST) callback to confirm blind SSRF and test egress path
- `GET /openapi.json` — API surface enumeration to map available endpoints and model identifiers

**Phase 3 — Administrative Plane and Port Sweep (03:39–03:43 UTC)**
- `POST /distserve/p2p_drop_connect` — LMDeploy's distributed-serving internal endpoint probed
- `http://127.0.0.1:8080` — Secondary admin HTTP interface
- `http://127.0.0.1:3306` — MySQL default port
- `http://127.0.0.1` port 80

### What Successful Exploitation Yields

AWS IMDSv1 at `169.254.169.254` returns, with no additional authentication:
- The IAM role name attached to the instance
- Temporary STS credentials: `AccessKeyId`, `SecretAccessKey`, `SessionToken` (valid ~6 hours)
- Instance identity document: AWS account ID, region, instance type, AMI ID
- User data scripts: frequently contain environment variables, bootstrap configurations, and embedded secrets

On a typical ML inference node, the instance IAM role provides access to S3 buckets (model weights, training datasets, inference results), CloudWatch Logs, and often broader permissions derived from infrastructure-as-code templates. Stolen credentials enable lateral movement within the AWS account for the credential validity window.

### The Patch

PR #4447 (merged March 27, 2026) added `_is_safe_url()` to `lmdeploy/vl/media/connection.py`:
- Resolves all IP addresses in the target URL
- Rejects any address that is not globally routable via Python's `ipaddress.ip_address().is_global` check
- Blocks loopback (127.0.0.0/8), private RFC 1918 ranges (10.x, 172.16-31.x, 192.168.x), link-local (169.254.0.0/16), multicast, and reserved ranges
- **Open question**: The initial fix description mentions `allow_redirects=False`, but the post-patch main branch shows `allow_redirects=True` with `max_redirects=3` — it is unconfirmed whether v0.12.3 retains strict redirect-blocking or whether a subsequent commit softened this. DNS rebinding and redirect-chain bypass scenarios may remain viable against the current patch.

---

## Root Cause Analysis

**Proximate cause:** The `_load_http_url()` function in LMDeploy's VLM image loading subsystem called `requests.get(url)` with an attacker-controlled URL and no IP range validation, redirect controls, or authentication requirement.

**Why 1:** Why did `load_image()` accept attacker-supplied URLs to internal addresses?
The function was designed to fetch images from user-provided URLs for legitimate VLM use cases (e.g., "analyze this public image at this URL"). The implementers did not model the threat that a user would supply an internal or cloud-metadata address rather than a public image URL. SSRF prevention was not part of the feature's acceptance criteria.

**Why 2:** Why was there no IP allowlist or denylist for outbound fetches?
The LMDeploy codebase had no established pattern for URL safety validation at the time. No shared utility existed for restricting outbound HTTP calls; each feature that made outbound requests implemented (or failed to implement) its own controls independently.

**Why 3:** Why was the API accessible without authentication by default?
LMDeploy was designed to be easy to deploy for research and development contexts. Default-secure configuration (authentication enabled by default) was not a design goal for the initial release. The documentation treats authentication as an optional operator responsibility rather than a default.

**Why 4:** Why were operators not alerted that v0.12.3 was a security-critical update?
The release changelog contained only "fix security issues" without CVE attribution, CVSS score, or affected version range. Operators tracking releases had no automated signal that this update warranted emergency deployment. Only the subsequent advisory (13 days later) made the severity clear — but by that time the advisory text had also made exploitation trivial.

**Why 5 / Root cause:** AI inference frameworks have been developed primarily with research and developer-experience goals, without inheriting the security-by-default patterns (authentication required, no outbound fetches to arbitrary IPs, CVE-tagged releases) that have become standard in production web frameworks. The AI tooling ecosystem is repeating the same growing-pain cycle that web frameworks went through circa 2005–2015, but compressed into months rather than years, with a much larger and faster-moving attacker community already familiar with the SSRF → IMDS credential theft kill chain.

**Root cause summary:** Missing SSRF input validation in a feature built for developer convenience, compounded by no default authentication and an opaque security release process, created a trivially exploitable credential theft path in cloud-deployed AI inference infrastructure.

---

## Impact Assessment

**Severity: High**

The severity framework rates this High rather than Critical because no confirmed credential exfiltration or downstream financial damage was verified. The Sysdig honeypot confirmed that IMDS was reached — the first step in the credential theft chain — but the honeypot design prevented confirmation that credentials were actually extracted. No breach disclosures from production LMDeploy deployments have been attributed to CVE-2026-33626.

**Who was affected:**
- Any organization running LMDeploy ≤0.12.2 on internet-accessible cloud infrastructure as of April 21–22, 2026
- At minimum 1 confirmed instance (Sysdig honeypot)
- Production victim count unknown; Shodan identified 3 internet-facing instances (most deployments are VPC-internal but still reachable from within corporate networks)

**What was affected:**
- AWS IMDS endpoint reached on at least one instance (confirmed SSRF execution)
- Internal service reconnaissance: Redis (6379), MySQL (3306), admin interfaces (8080, 80), distributed-serving endpoint
- API surface enumerated via `openapi.json`
- AWS IAM temporary credentials: exposed but exfiltration not confirmed

**Quantified impact (confirmed):**
- Instances with confirmed exploitation: 1 (Sysdig honeypot)
- Data confirmed exfiltrated: none
- Financial loss confirmed: $0
- Averted damage estimate: $2.625M (see damage_estimate methodology; high uncertainty)

**Containment:** The Sysdig honeypot was the sole confirmed exploitation target and its design prevented credential confirmation. The patch (v0.12.3) was available 13 days before the advisory but without adequate urgency signaling; operators who had not upgraded before April 21 were exposed for the duration of their deployment lag.

---

## How It Could Have Been Prevented

1. **SSRF input validation in `load_image()`**: A denylist blocking link-local (169.254.0.0/16), loopback (127.0.0.0/8), and RFC 1918 private ranges, implemented at the time the URL-fetching feature was written, would have blocked the entire attack class. This is a solved problem with well-documented Python implementations (the `_is_safe_url()` function added in the patch is the correct fix; it should have been present from day one).

2. **API authentication enabled by default**: Requiring an API key or bearer token by default — with clear documentation for disabling it in trusted-network environments — would have eliminated unauthenticated exploitation entirely. Every production web framework requires this; LMDeploy inference frameworks should too.

3. **IMDSv2 enforcement on all cloud inference nodes**: AWS IMDSv2 requires a PUT-based token exchange before metadata is accessible, which breaks SSRF-based IMDS attacks because SSRF typically only allows GET requests. Operators enforcing IMDSv2 at the EC2 instance level (or via AWS Organizations SCP) would have blocked the IMDS credential theft even if the SSRF vulnerability was exploited.

4. **Network egress filtering**: A security group or host-based firewall rule blocking outbound connections from inference nodes to `169.254.169.254` and RFC 1918 ranges (except required services) would have blocked the IMDS reach regardless of application-level controls.

5. **CVE-attributed security releases**: Publishing release notes with explicit CVE IDs, CVSS scores, and upgrade urgency would have enabled operators to deploy v0.12.3 before the advisory made exploitation trivial. The 13-day window between patch release and advisory publication was lost due to opaque changelog practices.

---

## How It Was / Could Be Fixed

**Actual remediation taken:**
InternLM merged PR #4447 adding `_is_safe_url()` validation to `lmdeploy/vl/media/connection.py`. The function resolves all IP addresses for a given URL and rejects any that are not globally routable, using Python's `ipaddress` standard library. The fix was released in v0.12.3 (April 8, 2026).

**Additional recommended fixes for operators:**
1. **Upgrade to v0.12.3 immediately** if not already done.
2. **Enforce IMDSv2** on all EC2 instances running LMDeploy (Instance Metadata Options → `http-tokens: required`).
3. **Enable API authentication** — LMDeploy supports `--api-key` configuration; treat this as mandatory for any non-localhost deployment.
4. **Audit IMDS access logs** (AWS CloudTrail) for the period April 21–present for any IAM metadata API calls originating from LMDeploy instance IPs.
5. **Rotate IAM credentials** for any instance roles that may have been exposed; temporary credentials issued before your upgrade date may still be valid (6-hour window) but the instance role policy should be audited for over-scoping.
6. **Add network egress deny rules** for `169.254.169.254` on all AI inference nodes, regardless of patching status.
7. **Verify redirect-blocking status in v0.12.3**: Confirm whether `allow_redirects=False` was retained in the released version before considering DNS rebinding and redirect-chain bypass scenarios resolved.

---

## Solutions Analysis

### 1. Input Validation and Sanitization (URL Safety)
- **Type:** Input Validation and Sanitization
- **Plausibility:** 5/5 — The patch proves this works. `_is_safe_url()` using `ipaddress.ip_address().is_global` definitively blocks link-local, loopback, and private-range SSRF targets. This is the canonical fix for this vulnerability class.
- **Practicality:** 5/5 — The fix is already implemented in v0.12.3. For new projects: adding URL safety validation is a one-hour implementation task using Python's standard library. Zero external dependencies.
- **How it applies:** Any function that accepts attacker-controlled URLs and makes outbound HTTP requests must validate the resolved IP before connecting. For VLM image loaders specifically: resolve the hostname, check all returned IPs against non-routable ranges, reject if any fail.
- **Limitations:** DNS rebinding attacks can bypass IP-at-resolve-time checks (attacker's DNS returns a public IP at validation, then a private IP at connect time). The patch must also set `allow_redirects=False` or implement post-redirect IP re-validation. This open question about the current patch needs verification.

### 2. Default API Authentication
- **Type:** Architectural Redesign
- **Plausibility:** 5/5 — Authentication is a prerequisite for meaningful access control. Without it, any network-reachable attacker can submit requests. With it, the attacker must first compromise a valid credential.
- **Practicality:** 4/5 — Straightforward to implement (bearer token validation is a standard middleware pattern). Requires operators to provision API keys; adds friction to development workflows. Breaking change for existing deployments.
- **How it applies:** LMDeploy should ship with `--api-key` required for all non-localhost deployments. The current "optional API key" model is inverted; security should be the default, convenience should be opt-in.
- **Limitations:** Does not prevent SSRF if an authenticated attacker (or a compromised credential) submits malicious image URLs. Authentication gates access; it does not eliminate the vulnerability. Defense in depth requires both authentication and URL validation.

### 3. Cloud Metadata Service Protection (IMDSv2 Enforcement)
- **Type:** Sandboxing and Isolation
- **Plausibility:** 4/5 — IMDSv2's token-exchange requirement blocks SSRF-based IMDS access because SSRF typically only allows attacker-controlled GET requests, not the required PUT token exchange. Widely deployed across AWS customer environments.
- **Practicality:** 5/5 — AWS provides a one-click instance setting, an EC2 launch template option, and an Organizations SCP for enforcement at scale. No application code changes required. This is a cloud configuration change any DevOps team can make in under an hour.
- **How it applies:** Enforcing IMDSv2 at the instance level means that even if the SSRF vulnerability is exploited (unpatched instances, future bypasses), the IMDS credential theft portion of the kill chain fails. The SSRF still exists but cannot harvest IAM credentials.
- **Limitations:** Only addresses the AWS IMDS portion of the kill chain. SSRF to Redis, MySQL, and internal admin interfaces remains possible. IMDSv2 does not protect GCP or Azure IMDS (which use different token mechanisms). The underlying SSRF vulnerability must still be patched.

### 4. Network Egress Filtering
- **Type:** Sandboxing and Isolation
- **Plausibility:** 5/5 — A network-level block on outbound connections to `169.254.0.0/16`, `127.0.0.0/8`, and RFC 1918 ranges from inference nodes eliminates SSRF reachability to internal services entirely — independent of application code.
- **Practicality:** 3/5 — Requires infrastructure team coordination to modify security groups, host-based firewalls, or network ACLs. In practice, many cloud deployments have implicit egress allow-all rules. Implementing egress controls without breaking legitimate outbound traffic (model downloads, telemetry, package updates) requires careful enumeration of required egress paths.
- **How it applies:** Any AI inference node that processes attacker-supplied URLs should have its egress filtered to explicitly allowed destinations only. This is a defense-in-depth layer that operates below the application — no amount of application-layer bypass (redirect chains, DNS rebinding) can overcome a properly configured security group rule.
- **Limitations:** Requires ongoing maintenance as egress requirements evolve. Can break legitimate functionality if misconfigured. Does not prevent SSRF to external attacker-controlled infrastructure (OAST callbacks confirming blind SSRF still work).

### 5. Monitoring and Detection (SSRF Behavioral Alerting)
- **Type:** Monitoring and Detection
- **Monitoring and Detection:** 4/5 — Detecting outbound HTTP requests from inference processes to link-local addresses is deterministic: any request to `169.254.x.x` from an LMDeploy process is anomalous. OAST callback detection (DNS/HTTP requests to requestrepo.com, interact.sh, and similar services from inference nodes) is also high-signal.
- **Practicality:** 4/5 — CloudTrail IMDS API logging is available by default. Network-level detection (VPC flow logs, eBPF-based process network monitoring) is straightforward in modern cloud environments. Behavioral rules for inference process outbound connections to RFC 1918 and link-local are simple to write.
- **How it applies:** A detection rule: "alert if any process on an inference node makes an outbound HTTP request to 169.254.0.0/16 or an OAST domain" would have flagged this attack in Phase 1. Combined with automatic instance quarantine, this could limit the blast radius of future SSRF exploits before they reach Phase 3.
- **Limitations:** Detection is reactive — it catches exploitation as it happens, not before. A fast attacker (this session was 8 minutes) can complete credential exfiltration before alerting triggers human response. Detection must be paired with automated blocking (not just alerting) to be effective in sub-15-minute attack windows.

---

## Related Incidents

| Incident | Connection |
|----------|------------|
| AAGF-2026-052 — Langflow CVE-2026-33017 | Direct structural parallel: AI tool with no default auth + SSRF/RCE + AWS IMDS credential targeting + Sysdig honeypot documentation + sub-24-hour advisory-to-exploit. Langflow was ~20 hours; LMDeploy was 12h 31m. Both confirm the standardized AI infrastructure SSRF kill chain. CISA KEV listed Langflow; LMDeploy may follow. |

*Note: Marimo CVE-2026-39987 (pre-auth RCE, <10 hours) and LiteLLM CVE-2026-42208 (SQLi, ~36 hours) are contextually related as members of the same 2026 AI-infrastructure rapid-exploitation trend but are not yet in the AgentFail database.*

---

## Strategic Council Review

### Challenger Findings

1. **The "LLM-assisted weaponization" claim is asserted, not evidenced.** Sysdig states that LLM-assisted exploit generation is "likely" based on the advisory's specificity, but provides no forensic evidence distinguishing LLM-generated payloads from human-crafted ones. The absence of a public PoC shows the attacker did not need one, but this is consistent with both a skilled human analyst reading the advisory and LLM-assisted generation. The 12h 31m gap is equally explained by a human attacker who found the advisory, read the function name, and wrote a 10-line Python script. This claim should carry lower confidence than the exploitation facts themselves.

2. **The 5,000-instance exposure estimate is not anchored to evidence.** Shodan returned 3 internet-facing instances. The research note acknowledges most deployments are VPC-internal, but provides no methodology for reaching 5,000. The averted damage estimate ($2.625M) is therefore highly uncertain. Given LMDeploy's GitHub stars (~7,798) and its specialized use case (VLM inference, not general-purpose), the realistic exposed deployment count for a production attack is almost certainly lower than 5,000. The damage figure should be presented as a wide-range estimate, not a point estimate.

3. **Sole-source exploitation evidence is a genuine limitation.** Sysdig is the only party reporting in-the-wild exploitation. No independent honeypot, no CERT advisory, no victim disclosure has been identified. The Sysdig blog is high-quality first-party forensic reporting, but the possibility that this was an isolated scan against a known honeypot (rather than broad exploitation) cannot be excluded. The "widespread" scale rating in affected_parties may overstate the confirmed impact.

4. **The severity "High" classification is borderline.** The severity framework defines High as requiring one of: 10–999 individuals' data breached, financial loss $10K–$100K, infrastructure damage requiring significant recovery. By confirmed evidence, none of these thresholds are met — one honeypot was exploited, no data was exfiltrated, no financial loss confirmed. On confirmed evidence alone, this is "Medium" (near-miss: conditions were right for serious harm, caught in time). The "High" rating is defensible on the near-miss potential and confirmed IMDS access, but should be explicitly justified.

### Steelman Defense

1. **The near-miss potential meets the High severity bar under the severity framework's own terms.** The framework states: "Near-miss: conditions were right for serious harm, but it was caught in time" under Medium — but also allows High when "infrastructure damage requiring significant recovery effort" would have occurred. A production EC2 instance with IAM credentials exfiltrated is not recoverable without credential rotation, audit, and potential regulatory notification. The Sysdig honeypot prevented that outcome; the potential damage was genuinely in the High-to-Critical range. Rating High based on near-miss potential with explicit justification is correct.

2. **The exploitation speed and attack structure confirm a human-or-automated actor with the full AWS credential kill chain in mind, not a casual scanner.** The 8-minute session with a structured three-phase progression (credential harvest → egress confirmation → port sweep) is not consistent with generic vulnerability scanners. Whether the exploit was LLM-assisted or human-written, it was purpose-built for this CVE. The advisory's specificity (naming `load_image()`, showing the missing check) was sufficient for any competent attacker to generate a working exploit in under an hour.

3. **The standardized attack pattern across Langflow, LMDeploy, and Marimo confirms a systemic trend, not isolated events.** Three AI infrastructure tools exploited within weeks of each other, all following the same SSRF → IMDS credential kill chain, all documented by Sysdig honeypots, all within 36 hours of advisory publication. This is a repeatable, scalable attack pattern targeting the AI tooling ecosystem. The damage estimate's uncertainty does not reduce the systemic risk signal.

4. **The averted damage estimate is conservative, not aggressive.** $1,500 per instance is far below the IBM CODB figure for an actual breach ($4.9M per incident). The methodology explicitly weights down to 0.35 probability. A more aggressive estimate — using the IBM figure with even a 0.01 probability weight — yields comparable numbers. The $2.625M figure is defensible as a floor, not a ceiling.

### Synthesis

CVE-2026-33626 is a well-documented, technically sound incident whose facts are not in dispute: SSRF in VLM image loader, no auth by default, IMDS reached, patch available but not yet deployed. The Sysdig honeypot evidence is high-quality. The open questions (LLM-assisted weaponization certainty, production victim count, redirect bypass in current patch) are genuine uncertainties that should be flagged rather than papered over.

**Final assessment:** Severity High is correct but must be explicitly justified on near-miss grounds — the confirmed impact (one honeypot, IMDS reached, no exfiltration) is Medium by the letter of the framework; the near-miss potential (production IAM credential theft, lateral movement) is High. The "partial" actual_vs_potential classification correctly captures this. The damage estimates should be presented with explicit uncertainty bounds, not as point estimates. The LLM-assisted weaponization claim should be framed as "consistent with" rather than "confirmed." The redirect bypass question in the current patch is the most operationally important open item and should trigger a follow-up check against the v0.12.3 tag.

**Confidence level:** High — on the exploitation facts. Medium — on the damage estimates and LLM-weaponization attribution. Low — on the count of production victims beyond the honeypot.

**Unresolved uncertainties:**
- **Redirect bypass in v0.12.3**: The patch description mentions `allow_redirects=False` but the current main branch shows otherwise. DNS rebinding and redirect-chain bypass scenarios may remain viable. Resolution: check v0.12.3 tag specifically; if relaxed, this is a partial-fix issue requiring a follow-up advisory.
- **Production victim count**: No breach disclosures attributed to CVE-2026-33626 exist. The exploitation may be limited to the Sysdig honeypot, or production victims may exist without public disclosure. Resolution: monitor CISA KEV listings, breach notification filings, and security community reports through June 2026.
- **LLM-assisted weaponization confirmation**: The speed and no-PoC facts are consistent with LLM-assisted generation but not confirmatory. Resolution: forensic payload analysis (user-agent strings, timing jitter, payload phrasing patterns) if Sysdig publishes raw honeypot data.

---

## Key Takeaways

1. **AI inference APIs are SSRF attack surfaces by design — treat them as such.** Any VLM or multimodal endpoint that fetches attacker-controlled URLs is a potential SSRF pivot. Apply the same URL safety patterns used in web applications (IP range denylist, redirect-blocking, scheme restriction) to every outbound HTTP call in AI inference code. This is not a novel problem; it is a solved problem being re-learned in a new context.

2. **Default authentication is not optional for AI tooling.** LMDeploy, Langflow, and other AI infrastructure tools share a common failure mode: no authentication required by default. The development-convenience default must be inverted: authentication on, documentation for disabling it in trusted environments. Any tool that binds `0.0.0.0` and serves external requests should require credentials.

3. **IMDSv2 enforcement is a mandatory baseline for cloud AI deployments.** IMDSv2 breaks the SSRF → IMDS credential kill chain at the cloud infrastructure layer, independent of application code. It costs nothing beyond a configuration change and provides defense-in-depth against the entire class of SSRF attacks targeting cloud metadata. Treat IMDSv2 enforcement as a prerequisite for any production AI workload on AWS.

4. **Advisory text is now weaponizable by LLMs — silent patching has new urgency.** When a security advisory names the vulnerable function and describes the missing check, it provides sufficient context for automated exploit generation. The 13-day window between v0.12.3's release and the advisory that triggered exploitation was not effectively used because the release had no urgency signal. For AI tooling maintainers: CVE-attributed, urgency-tagged release notes are now a security control, not just documentation hygiene. For operators: treat any "fix security issues" entry as a potential critical patch until proven otherwise.

5. **The SSRF → IMDS kill chain is now standardized across the AI infrastructure ecosystem.** This is the second confirmed instance of this exact attack pattern in 2026 (after Langflow). Security teams should run this kill chain against every AI tool in their stack: Does it accept user-supplied URLs? Does it make server-side HTTP requests? Is it deployed on cloud infrastructure with IMDS access? If yes to all three, the blast radius of a future SSRF CVE is IAM credential theft and lateral movement, not just a security finding.

---

## References

| Source | URL | Date | Credibility |
|--------|-----|------|-------------|
| Sysdig Threat Research Team — primary exploitation evidence and honeypot forensics | https://sysdig.com/blog/cve-2026-33626-how-attackers-exploited-lmdeploy-llm-inference-engines-in-12-hours | 2026-04-22 | High — first-party honeypot data with specific timestamps, IP, payloads, and OAST infrastructure details |
| GitHub Security Advisory GHSA-6w67-hwm5-92mq | https://github.com/InternLM/lmdeploy/security/advisories/GHSA-6w67-hwm5-92mq | 2026-04-18 | High — official vendor advisory |
| NVD CVE-2026-33626 | https://nvd.nist.gov/vuln/detail/CVE-2026-33626 | 2026-04-20 | High — CVSS scoring and CWE classification |
| GitHub PR #4447 — patch diff | https://github.com/InternLM/lmdeploy/pull/4447 | 2026-03-27 | High — confirms fix implementation and merge date |
| LMDeploy v0.12.3 release notes | https://github.com/InternLM/lmdeploy/releases/tag/v0.12.3 | 2026-04-08 | Medium — sparse changelog entry; no CVE attribution |
| Sysdig Security Briefing: April 2026 (independent corroboration) | https://sysdig.com/blog/ (post dated 2026-05-05) | 2026-05-05 | High — independently corroborates the 12-hour exploitation window |
| Shodan LMDeploy exposure survey | https://www.shodan.io/search?query=lmdeploy | 2026-05-07 | Medium — point-in-time snapshot; 3 internet-facing instances found |
| LMDeploy connection.py (post-patch source) | https://github.com/InternLM/lmdeploy/blob/main/lmdeploy/vl/media/connection.py | 2026-05-07 | Medium — current main branch; v0.12.3 tag needs separate verification for redirect-blocking behavior |
