# AAGF-2026-071 Research: LMDeploy CVE-2026-33626 SSRF

---

## Source Assessment

**Primary source — HIGH CONFIDENCE:**
- Sysdig Threat Research Team blog post: "CVE-2026-33626: How attackers exploited LMDeploy LLM Inference Engines in 12 hours" (April 22, 2026). Direct honeypot observation data with specific timestamps, attacker IP, payloads, and OAST infrastructure details. This is first-party forensic evidence.

**Secondary sources — HIGH CONFIDENCE:**
- GitHub Security Advisory GHSA-6w67-hwm5-92mq (April 18–21, 2026): Official advisory from InternLM/LMDeploy repo, published by researcher Igor Stepansky (Orca Security).
- NVD entry CVE-2026-33626: CVSS scoring, affected version range, and CWE classification.
- GitHub PR #4447: Patch diff confirming the fix (merged March 27, 2026 — notably *before* public advisory).

**Corroboration:**
- Sysdig "Security Briefing: April 2026" (May 5, 2026): Independently summarizes the 12-hour exploitation window, confirming the primary blog post findings.
- NVD confirms CVE-2026-33626 received April 20, 2026, published April 20, 2026.

**Independent confirmation status:** The Sysdig honeypot is the sole source of exploitation-in-the-wild evidence. No independent honeypot operators or CERT advisories have been found confirming separate exploitation chains. Orca Security (discoverer) has not published their own blog post at time of research. Classification confidence: HIGH for the Sysdig observations; the absence of independent honeypot corroboration is a known limitation.

**Distinguishing note on "12 hours":** The triage context says "12h 31m." This is confirmed precisely: advisory published April 21, 2026, 15:04 UTC; first exploit attempt April 22, 2026, 03:35 UTC = 12 hours 31 minutes.

---

## Timeline

| Event | Date/Time (UTC) | Source |
|-------|----------------|--------|
| Vulnerability reported to InternLM (responsible disclosure) | Unknown (advisory implies ~March 2026 based on patch merge date) | Inferred from PR #4447 |
| Fix merged — PR #4447, `_is_safe_url()` added | March 27, 2026 | GitHub PR #4447 |
| LMDeploy v0.12.3 released (patch included, "fix security issues") | April 8, 2026, 03:37 UTC | GitHub releases |
| GitHub Security Advisory GHSA-6w67-hwm5-92mq published | April 18, 2026 | GitHub advisory |
| CVE-2026-33626 received and published by NVD | April 20, 2026 | NVD |
| **Advisory confirmed public on GitHub** | **April 21, 2026, 15:04 UTC** | Sysdig honeypot reference |
| **First exploitation attempt observed (Sysdig honeypot)** | **April 22, 2026, 03:35 UTC** | Sysdig blog |
| Attack session ends | April 22, 2026, 03:43 UTC | Sysdig blog |
| Sysdig blog post published | April 22, 2026 | Sysdig |
| Sysdig April 2026 Security Briefing corroborates | May 5, 2026 | Sysdig |

**Advisory-to-exploitation gap:** 12 hours, 31 minutes

**Patch-to-advisory gap:** The fix was merged March 27, 2026 and included in v0.12.3 (April 8, 2026) before the advisory went public (April 18–21, 2026). This means operators who were tracking releases had ~13 days of silent patching opportunity — but the advisory itself prompted exploitation by making the vulnerability actionable.

**date_occurred:** April 22, 2026 (first confirmed exploitation)
**date_discovered:** March 27, 2026 (patch merged, implying private disclosure existed)
**date_reported:** April 18–21, 2026 (public GitHub advisory and NVD publication)

---

## Technical Mechanism

### What is CVE-2026-33626?

A Server-Side Request Forgery (SSRF) vulnerability in LMDeploy's vision-language model (VLM) image loading subsystem. CWE-918.

**CVSS 3.1:** 7.5 (High) — AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

The vulnerability requires no authentication and no user interaction. The network attack vector with low complexity means it is trivially exploitable by any attacker who can reach the LMDeploy API endpoint.

### Vulnerable Component

**File:** `lmdeploy/vl/utils.py` — the `load_image()` function
**File:** `lmdeploy/vl/media/connection.py` — the `_load_http_url()` function (actual fetcher)

The `load_image()` function delegates to `load_from_url()`, which routes HTTP(S) URLs to `_load_http_url()`. In vulnerable versions, `_load_http_url()` called `requests.get(url)` without any IP range validation, redirect control, or scheme restriction.

### The VLM Image-Loader as SSRF Pivot

LMDeploy serves vision-language models via an OpenAI-compatible HTTP API. Clients submit multimodal chat completion requests that include `image_url` parameters:

```json
POST /v1/chat/completions
{
  "model": "InternVL2-8B",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "describe this image"},
      {"type": "image_url", "image_url": {"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}}
    ]
  }]
}
```

The server accepts this request, internally calls `load_image()` with the attacker-supplied URL, and the underlying `requests.get()` call dereferences the link-local AWS IMDS endpoint. The VLM endpoint effectively becomes "a generic HTTP GET that can reach addresses the external network cannot" (Sysdig).

**Why this is particularly dangerous in AI infrastructure:**
1. LMDeploy defaults to binding on `0.0.0.0` — publicly reachable without deliberate exposure hardening
2. API authentication is disabled by default — no credentials needed to submit requests
3. Cloud-deployed inference nodes (the predominant deployment pattern) run on EC2/GCE/Azure instances where IMDS is always available at the link-local address
4. The attack requires no special tooling — a standard `curl` or Python `requests` call suffices

### Attack Chain: SSRF → Credential Theft → Lateral Movement

1. **Initial SSRF probe:** Attacker submits VLM request with `image_url` pointing to `http://169.254.169.254/latest/meta-data/iam/security-credentials/` — server returns role names attached to the instance
2. **Credential harvest:** Follow-up request to `http://169.254.169.254/latest/meta-data/iam/security-credentials/{role-name}` returns temporary AWS credentials: `AccessKeyId`, `SecretAccessKey`, `Token`, `Expiration`
3. **Out-of-band exfiltration:** Attacker uses OAST (Out-of-band Application Security Testing) callback URL to confirm blind SSRF and exfiltrate data without reading HTTP responses directly
4. **Internal reconnaissance:** Probe Redis (6379), MySQL (3306), admin interfaces (8080, 80)
5. **Lateral movement:** With stolen IAM credentials, attacker authenticates to AWS APIs — S3 data access, EC2 control, IAM privilege escalation depending on instance role permissions

### What AWS IMDS Returns

AWS Instance Metadata Service at `169.254.169.254` (IMDSv1, unauthenticated) returns:
- IAM role name at `/latest/meta-data/iam/security-credentials/`
- Temporary STS credentials (AccessKeyId + SecretAccessKey + SessionToken) valid ~6 hours
- Instance identity document (account ID, region, instance type, AMI)
- User data scripts (which often contain environment variables, secrets, bootstrap configurations)

IMDSv2 requires a PUT token exchange first, limiting SSRF exploitation — but many deployments remain on IMDSv1.

---

## Exploitation Evidence

### Sysdig Honeypot Observations

**Attack session:** April 22, 2026, 03:35–03:43 UTC (8 minutes, 10 distinct requests)
**Attacker IP:** 103.116.72.119 (Kowloon Bay, Hong Kong; AS400618 — Prime Security Corp.)
**OAST infrastructure:** `cw2mhnbd.requestrepo.com` (requestrepo.com service)

The honeypot was running a genuine LMDeploy instance with VLM models loaded. The attacker tested against two model identifiers: `internlm-xcomposer2` and `OpenGVLab/InternVL2-8B`.

**Phase 1 — Cloud Metadata & Data Store Discovery:**
- `http://169.254.169.254/latest/meta-data/iam/security-credentials/` (AWS IMDS IAM role enumeration)
- `http://127.0.0.1:6379` (Redis default port probe)

**Phase 2 — Egress Testing & API Enumeration:**
- `http://cw2mhnbd.requestrepo.com` (OAST callback for blind SSRF confirmation)
- `GET /openapi.json` (API surface enumeration — lists all endpoints and parameters)

**Phase 3 — Administrative Plane & Systematic Port Sweep:**
- `POST /distserve/p2p_drop_connect` (distributed-serving internal endpoint probe)
- `http://127.0.0.1:8080` (secondary HTTP/admin interface)
- `http://127.0.0.1:3306` (MySQL)
- `http://127.0.0.1` port 80

**Were credentials exfiltrated?** Unknown — not confirmed. The Sysdig honeypot observed that IMDS was reached, but the honeypot setup prevented confirmation of credential data extraction. Sysdig explicitly states the attacker reached the endpoint but does not confirm successful credential retrieval. Real production deployments without egress controls would have returned live IAM credentials.

**No public PoC existed** at the time of the attack. Sysdig confirmed no exploit code was available on GitHub or major exploit repositories when the first attack was observed.

### Exploitation Speed Context

The Sysdig Threat Research Team explicitly notes the accelerating weaponization trend:

- **Marimo CVE-2026-39987** (pre-auth RCE): exploited under 10 hours post-disclosure; subsequently used to deploy a blockchain botnet via HuggingFace
- **LMDeploy CVE-2026-33626:** 12 hours 31 minutes
- **LiteLLM CVE-2026-42208** (SQL injection): 36 hours post-disclosure

The LMDeploy exploitation was faster than Langflow CVE-2026-33017 (≈20 hours, AAGF-2026-052) but slower than Marimo (≈10 hours). Sysdig references the "Zero Day Clock" project as evidence of an industry-wide acceleration trend.

Sysdig's commentary on why: "Any advisory that names the vulnerable function, shows the missing check, or quotes the affected code pattern, in the age of capable code-generation models, becomes a turnkey exploit." GHSA-6w67-hwm5-92mq was specific enough (named `load_image()`, showed the missing IP validation) that LLM-assisted exploit generation was likely used — matching the Marimo pattern.

---

## Affected Versions and Patch

**Vulnerable versions:** LMDeploy ≤ 0.12.2

**Note on version discrepancy:** The GitHub advisory (GHSA-6w67-hwm5-92mq) lists "≤ 0.12.0" as the affected range, while NVD and the advisory also reference ≤ 0.12.2. The NVD entry uses the range "prior to 0.12.3" which is the authoritative statement. The advisory may have been filed before 0.12.1/0.12.2 were released. Use "prior to 0.12.3" as the canonical affected range.

**Fixed version:** v0.12.3 (released April 8, 2026)

### Patch Details (PR #4447, merged March 27, 2026)

The fix introduced two changes:

1. **`lmdeploy/vl/media/connection.py` — `_is_safe_url()` function:**
   - Validates all resolved IP addresses using Python `ipaddress.ip_address().is_global`
   - Blocks any IP that is not globally routable (covers loopback, private RFC 1918, link-local 169.254.x.x, multicast, reserved, unspecified)
   - Sets `allow_redirects=False` to prevent redirect-based bypass (note: the current codebase shows max_redirects=3 with allow_redirects=True — this may be a later softening of the initial strict fix; **open question**, see below)

2. **`lmdeploy/pytorch/config.py` — `eval()` removal:**
   - Replaced `eval(f"torch.{...}")` with `getattr(torch, ...)` for dtype resolution
   - Secondary fix bundled in the same PR, unrelated to SSRF

3. **`tests/test_lmdeploy/test_vl/test_safe_url.py`:**
   - Unit tests for URL safety validation and redirect handling

**PR merged by:** lvhan028 (InternLM core team)
**Reviewed for:** DNS rebinding attack scenarios (reviewers specifically flagged this edge case)

---

## Damage Assessment

### Confirmed
- Active exploitation against at least one exposed LMDeploy instance (Sysdig honeypot) within 12h 31m of advisory publication
- IMDS endpoint reached: `http://169.254.169.254/latest/meta-data/iam/security-credentials/`
- Redis and MySQL ports probed on loopback
- Distributed-serving admin endpoint probed
- API surface (openapi.json) enumerated — attacker gained knowledge of available endpoints and model names

### Suspected / Not Confirmed
- AWS IAM credential exfiltration: Honeypot design prevented confirmation; real production instances with unfiltered egress are assumed vulnerable to credential theft
- Exploitation of production instances beyond the honeypot: No external reporting of production breaches attributed to CVE-2026-33626 at time of research

### Exposure Surface
- LMDeploy GitHub stars: ~7,798 (Sysdig figure) — described as "an order of magnitude less than mainstream projects like vLLM or Ollama"
- Shodan results at time of research (May 7, 2026): 3 instances found — suggesting most deployments are not directly internet-facing, or are behind reverse proxies. This limits the confirmed public attack surface but does not account for cloud instances accessible within VPCs or corporate networks.
- The advisory's 0.0.0.0 default binding and no-auth-by-default configuration means any cloud deployment with an open security group is immediately reachable

### actual_vs_potential assessment: **"partial"**
- Confirmed exploitation (attacker successfully reached IMDS endpoint) but no confirmed credential exfiltration or downstream damage
- Near-miss potential is HIGH: successful IMDS credential theft on a production EC2 inference node could yield IAM credentials enabling S3 data access, lateral movement, or full account compromise
- The 8-minute structured attack session indicates an experienced operator with a clear kill chain in mind — this was not casual scanning

---

## Vendor Response

**InternLM / Shanghai AI Lab response:**
- Accepted responsible disclosure from Igor Stepansky (Orca Security) — timeline suggests private disclosure occurred prior to March 27, 2026
- Fix merged via PR #4447 on March 27, 2026 by core maintainer lvhan028
- v0.12.3 released April 8, 2026 with "fix security issues" in changelog (sparse attribution)
- GitHub security advisory filed as GHSA-6w67-hwm5-92mq, published April 18, 2026

**Response assessment:** The vendor's handling was responsible — fix was available 13 days before public advisory. However, the sparse "fix security issues" changelog entry without CVE attribution reduced operator awareness that this was a security-critical update, contributing to unpatched production instances at time of exploitation.

**No CISA KEV listing** identified at time of research (May 7, 2026). Given the Langflow precedent (CVE-2026-33017 added to KEV within 8 days of exploitation), this may follow if additional in-the-wild exploitation is confirmed.

**Discoverer:** Igor Stepansky, Orca Security. No separate Orca blog post identified at time of research.

---

## Related Incidents Context

### Direct SSRF Comparator — Langflow CVE-2026-33017 (AAGF-2026-052)

| Dimension | LMDeploy CVE-2026-33626 | Langflow CVE-2026-33017 |
|-----------|------------------------|------------------------|
| Vulnerability type | SSRF via VLM image loader | Unauthenticated RCE via flow build endpoint |
| Advisory to exploitation | 12h 31m | ~20 hours |
| Primary target | AWS IMDS, Redis, MySQL | Credential files, botnet deployment |
| Confirmed exfiltration | No (honeypot limited) | Yes — confirmed by Sysdig |
| Default auth | None (no auth by default) | None (public endpoint) |
| Patch timeline | Fix merged 13 days before advisory | Fix merged ~7 days before advisory |
| CISA KEV | Not listed (as of 2026-05-07) | Listed March 25, 2026 |

Both follow the same attack pattern: AI tool with no default authentication + cloud deployment + missing input validation = rapid IMDS credential targeting immediately post-advisory.

### Speed-of-Exploitation Trend in AI Infrastructure (Sysdig 2026 Data)

| Incident | Tool | CVE | Advisory-to-Exploit |
|---------|------|-----|-------------------|
| Marimo pre-auth RCE | Marimo notebooks | CVE-2026-39987 | <10 hours |
| **LMDeploy SSRF** | **LMDeploy (VLM inference)** | **CVE-2026-33626** | **12h 31m** |
| Langflow RCE | Langflow (AI pipeline) | CVE-2026-33017 | ~20 hours |
| LiteLLM SQLi | LiteLLM (LLM proxy) | CVE-2026-42208 | ~36 hours |

The LMDeploy case is the second-fastest confirmed exploitation in the Sysdig 2026 AI infrastructure dataset, behind Marimo. It does not represent an absolute speed record (Marimo is faster), but it is a data point in a clear pattern of sub-24-hour weaponization against AI tooling.

### Structural Pattern: "Advisory as Exploit Prompt"

Sysdig identifies a new attack enabler: LLM-assisted exploit generation from advisory text. When a security advisory names the vulnerable function, shows the missing check, and describes the attack scenario, it provides sufficient context for a capable LLM to generate working exploit code without a human writing it from scratch. GHSA-6w67-hwm5-92mq met all three criteria. This pattern recurs across the Marimo and LiteLLM cases.

### The SSRF → Cloud Credentials Kill Chain as Standard AI Infrastructure Attack

CVE-2026-33626 is the second confirmed instance (after Langflow CVE-2026-33017) of attackers using AI tool SSRF to pivot to AWS IMDS credential theft in 2026. The attack chain is now standardized:
1. Find exposed AI tool with no default auth
2. Submit malicious input that triggers outbound HTTP request
3. Target `169.254.169.254` IMDS for IAM credentials
4. Use OAST service to confirm blind SSRF
5. Probe internal services (Redis, MySQL, admin ports)

---

## Classification Notes

**failure_modes:**
- `missing-input-validation` (primary — no URL scheme/IP validation in `load_image()`)
- `insecure-default-configuration` (secondary — no auth by default, 0.0.0.0 binding)
- `ssrf` (mechanism)
- `cloud-credential-exposure` (impact vector)

**failure_stage:** `tool-use` — the VLM image fetching functionality is the proximate failure point; the AI/LLM component is weaponized as the HTTP client

**frameworks:**
- OWASP SSRF (A10:2021 — Server-Side Request Forgery)
- MITRE ATT&CK: T1552.007 (Container API — credential access via metadata service)
- MITRE ATT&CK: T1046 (Network Service Scanning — internal port probe)
- MITRE ATT&CK: T1090 (Proxy — attacker IP through commercial hosting, requestrepo OAST)

**actual_vs_potential:** `partial`
- Actual: Confirmed IMDS reach + internal service probing + API enumeration
- Potential: Full IAM credential theft → S3/EC2/IAM lateral movement; Redis/MySQL data access

**potential_damage:** Temporary IAM credential theft enabling full AWS account lateral movement. On a production ML inference node, the instance role typically has permissions to access model weights (S3), logging (CloudWatch), and potentially training data. Escalation to admin-level IAM roles is possible if instance permissions are broad. Redis exposure could yield cached inference results, API keys, or session tokens.

**intervention:** Sysdig honeypot intercepted the attack. The attacker hit IMDS but could not confirm successful credential extraction. Patch (v0.12.3) was available before the advisory — operators who tracked releases were protected 13 days prior to exploitation.

---

## Open Questions

1. **Redirect bypass in current patch:** The PR #4447 description mentions `allow_redirects=False`, but the current `connection.py` code shows `allow_redirects=True` with `max_redirects=3`. Was the strict redirect-blocking relaxed in a subsequent commit? Does the current patched version remain vulnerable to DNS rebinding or redirect-chain attacks? **Needs verification against v0.12.3 tag specifically.**

2. **Orca Security disclosure timeline:** When exactly did Igor Stepansky report to InternLM? The PR merge date (March 27) suggests a private disclosure several weeks earlier, but no Orca blog post has been published. What is the full responsible disclosure timeline?

3. **Production victim confirmation:** Were any production LMDeploy instances compromised beyond the Sysdig honeypot? No breach disclosures attributed to CVE-2026-33626 have been found. Given the sparse deployment footprint (Shodan shows 3 instances), the impact may remain limited to the honeypot observation.

4. **Affected version ceiling:** The advisory lists "≤ 0.12.0" but NVD says "prior to 0.12.3." Were 0.12.1 and 0.12.2 released between the fix merge (March 27) and the v0.12.3 release (April 8)? If so, did those intermediate versions carry the fix or not?

5. **CISA KEV listing:** Will CVE-2026-33626 be added to CISA KEV? Based on the Langflow precedent, confirmed in-the-wild exploitation typically triggers KEV addition within 1–2 weeks. Status should be checked after May 14, 2026.

6. **GCP/Azure IMDS targeting:** The attack probed only AWS IMDS. Were GCP (`metadata.google.internal`) or Azure IMDS (`169.254.169.254/metadata/instance`) endpoints tested? Sysdig data does not mention non-AWS targets.

7. **LLM-assisted exploit generation confirmation:** Sysdig asserts LLM-generated exploits likely, but does not name a specific tool or provide direct evidence. Is there forensic evidence (user-agent, payload phrasing, timing patterns) that distinguishes LLM-generated from human-crafted payloads?

---

## Sources

| # | Source | URL | Confidence | Date |
|---|--------|-----|-----------|------|
| 1 | Sysdig Threat Research Team blog — primary exploitation evidence | https://sysdig.com/blog/cve-2026-33626-how-attackers-exploited-lmdeploy-llm-inference-engines-in-12-hours | HIGH | April 22, 2026 |
| 2 | GitHub Advisory GHSA-6w67-hwm5-92mq | https://github.com/InternLM/lmdeploy/security/advisories/GHSA-6w67-hwm5-92mq | HIGH | April 18, 2026 |
| 3 | NVD CVE-2026-33626 | https://nvd.nist.gov/vuln/detail/CVE-2026-33626 | HIGH | April 20, 2026 |
| 4 | GitHub PR #4447 — patch diff | https://github.com/InternLM/lmdeploy/pull/4447 | HIGH | Merged March 27, 2026 |
| 5 | LMDeploy v0.12.3 release notes | https://github.com/InternLM/lmdeploy/releases/tag/v0.12.3 | MEDIUM | April 8, 2026 |
| 6 | Sysdig Security Briefing: April 2026 | https://sysdig.com/blog/ (post dated May 5, 2026) | HIGH | May 5, 2026 |
| 7 | Shodan search for LMDeploy exposure | https://www.shodan.io/search?query=lmdeploy | MEDIUM | Queried May 7, 2026 |
| 8 | `lmdeploy/vl/media/connection.py` (post-patch) | https://github.com/InternLM/lmdeploy/blob/main/lmdeploy/vl/media/connection.py | MEDIUM | Current main branch |
