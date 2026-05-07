# AAGF-2026-040 Research: Vertex AI P4SA Over-Permissioning (Unit 42 "Double Agents")

## Triage Verdict

**QUALIFIES — BORDERLINE on criterion 1**

All four criteria pass, with one flag:

1. **Real-world deployment** — PARTIAL. The P4SA over-permissioning is a default configuration flaw in Google's production Vertex AI Agent Engine platform, affecting every organization that deploys an Agent Engine application without opting into BYOSA. This is not a research demo environment — the permissioned accounts exist in real customer projects. However, Unit 42 demonstrated exploitation in a controlled research environment; no confirmed exploitation in the wild was found. The flaw is real-production in the sense that the misconfiguration is baked into the platform default, not in the sense that a real attacker compromised a real organization.
2. **Autonomous agent involved** — PASS. The P4SA is associated with AI agents deployed via Vertex AI Agent Development Kit (ADK) and Agent Engine. Agents act autonomously and inherit the over-permissioned service account credentials.
3. **Verifiable** — PASS. Disclosed by Unit 42 (Palo Alto Networks), covered by The Hacker News, Dark Reading, SecurityWeek, TechRadar, SDxCentral, GBHackers, CyberPress, CybersecurityNews, and a dozen others. Google updated documentation in response.
4. **Meaningful impact** — PASS. Unrestricted read access to all Cloud Storage buckets in a project, plus access to restricted Google-owned Artifact Registry repositories containing Vertex AI infrastructure container images. Real customer data at risk; real infrastructure exposure.

**Recommended framing:** Platform default design flaw enabling privilege escalation from AI agent context into host project. Qualifies as a structural/systemic failure in AI agent IAM, not a one-off coding bug.

---

## Source Attribution

| Source | URL | Date | Quality |
|--------|-----|------|---------|
| Unit 42 primary research (Ofir Shaty) | https://unit42.paloaltonetworks.com/double-agents-vertex-ai/ | 2026-03-31 | Primary — fetched directly |
| The Hacker News | https://thehackernews.com/2026/03/vertex-ai-vulnerability-exposes-google.html | 2026-03-31 | High — independent secondary |
| SecurityWeek | https://www.securityweek.com/google-addresses-vertex-security-issues-after-researchers-weaponize-ai-agent/ | 2026-04-01 | High — independent secondary, confirmed Google response |
| Dark Reading | https://www.darkreading.com/cyber-risk/googles-vertex-ai-over-privilege-problem | n/a | High — 403 at fetch time; referenced in search |
| TechRadar | https://www.techradar.com/pro/security/what-if-the-ai-agent-you-just-deployed-was-secretly-working-against-you-vertex-ai-double-agent-flaw-exposes-customer-data-and-googles-internal-code | n/a | Medium |
| SDxCentral | https://www.sdxcentral.com/news/google-vertex-agentic-flaw-latest-chink-in-hyperscale-ai-armor/ | n/a | Medium |
| VentureBeat (context article) | https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them | 2026-04-30 | High — 429 at fetch time; extensively quoted in search summaries |
| Softtechhub (VentureBeat summary) | https://softtechhub.us/2026/04/30/codex-claude-code-and-copilot-breached/ | 2026-04-30 | Medium — secondary summary of VentureBeat content |

---

## What Exactly Is the P4SA Issue?

### The Flaw

When an organization deploys an AI agent using Google's Vertex AI Agent Development Kit (ADK) via the Agent Engine service, Google automatically provisions a Per-Project, Per-Product Service Agent (P4SA). This is a Google-managed service account that the agent uses to authenticate to GCP services.

The P4SA is provisioned with **default permissions that far exceed what an AI agent requires**, specifically:

- `storage.buckets.get`
- `storage.buckets.list`
- `storage.objects.get`
- `storage.objects.list`

These permissions grant **unrestricted read access to every Cloud Storage bucket in the entire GCP project** — not just the buckets the agent legitimately needs to access.

The same P4SA credentials also provide access to **restricted, Google-owned Artifact Registry repositories** that are exposed during Agent Engine deployment.

### The Attack Chain (as demonstrated by Unit 42)

1. Attacker deploys (or compromises) a Vertex AI agent via ADK with a custom credential-extraction tool embedded
2. Agent queries the Google metadata service endpoint: `metadata.google.internal/computeMetadata/v1/instance/?recursive=true`
3. The metadata service returns the P4SA credentials along with: GCP project ID, agent identity, and OAuth scopes of the host machine
4. Attacker uses stolen P4SA credentials to pivot out of the agent's execution context and into the customer project
5. Attacker gains unrestricted read access to all Cloud Storage buckets in the project
6. Attacker also gains access to restricted `cloud-aiplatform-private` Artifact Registry repositories, downloading container images that constitute the core of Vertex AI Reasoning Engine infrastructure — including `reasoning-engine` and `llm-extension/reasoning-engine-py310` images
7. Internal Google Cloud Storage bucket paths are revealed (e.g., `gs://reasoning-engine-restricted/versioned_py/Dockerfile.zip`), further exposing infrastructure topology

### Why This Is a Design Flaw, Not a Bug

The P4SA over-permissioning is not an accidental misconfiguration in one deployment — it is Google's default configuration for every Agent Engine deployment. The principle of least privilege requires that service accounts hold only the permissions they need. An AI agent that needs to run user queries has no legitimate need to read every bucket in a project; that access is granted because the P4SA was designed for broad platform utility rather than scoped agent isolation.

The OAuth scope issue compounds this: even if IAM were tightened, overly broad OAuth scopes at the API level can bypass IAM's granular controls.

---

## Who Discovered It and When?

**Researcher:** Ofir Shaty, Unit 42, Palo Alto Networks  
**Research name:** "Double Agents: Exposing Security Blind Spots in GCP Vertex AI"  
**Publication date:** March 31, 2026  
**Disclosure process:** Responsible disclosure to Google prior to publication. Google updated documentation before or concurrent with the March 31 disclosure. No CVE was assigned.

---

## What Could an Attacker Do?

An attacker who can influence or deploy a Vertex AI agent (or who can compromise an existing one via prompt injection or supply chain attack) could:

1. **Exfiltrate all data in Cloud Storage** — every bucket in the project, regardless of intended agent access scope. If the project stores customer PII, training data, sensitive documents, or backups in GCS, all of it is readable.
2. **Access Google infrastructure blueprints** — download container images from restricted `cloud-aiplatform-private` registries that were not intended to be accessible, including Vertex AI Reasoning Engine internals. This exposes Google's proprietary infrastructure code and could enable targeted attacks against the Vertex AI platform itself.
3. **Create backdoors** — with write permissions (if present beyond read), an attacker could modify stored data or artifacts in ways that persist after the initial compromise.
4. **Enumerate the internal Google infrastructure** — the metadata service response and Artifact Registry access reveal internal GCS paths, project IDs, and image names that constitute an infrastructure map useful for further attacks.

Ofir Shaty's framing: "A misconfigured or compromised agent can become a 'double agent' that appears to serve its intended purpose, while secretly exfiltrating sensitive data, compromising infrastructure, and creating backdoors into an organization's most critical systems."

---

## Real Production Deployment or Research Finding?

**Both, with a critical distinction.**

The P4SA over-permissioning is a **platform default that exists in every real production Vertex AI Agent Engine deployment** unless the customer has explicitly opted into the BYOSA (Bring Your Own Service Account) pattern. This means:
- Every organization that has deployed a Vertex AI agent via Agent Engine and has NOT implemented BYOSA is exposed
- The flaw is not hypothetical — the over-permissioned service accounts exist in real customer GCP projects today (or did before Google's documentation update prompted customers to remediate)

However, the exploitation was **demonstrated in a Unit 42 controlled research environment**, not observed in a real-world attack. No confirmed exploitation in the wild has been reported.

Since the publication date (March 31, 2026), Google has modified the ADK deployment workflow. Earlier exploitation is unknown but cannot be ruled out.

**AgentFail classification:** Structural platform default flaw with real-world exposure surface. The same category as a cloud provider shipping an insecure default — the vulnerability is real and production, the demonstrated exploitation is research.

---

## Was It Patched? Google's Response

Google's response was **documentation-based, not code-based**:

1. **Documentation update** — Google revised official Vertex AI documentation to explicitly document how Vertex AI uses resources, service accounts, and agents. Previously, the P4SA's broad permissions were not clearly documented.
2. **BYOSA recommendation** — Google recommended that customers adopt the Bring Your Own Service Account pattern: create a dedicated IAM service account before deploying each Agent Engine application, pass it explicitly at deployment time, and scope it to only the roles the agent legitimately needs.
3. **ADK deployment workflow modification** — "Since this discovery, Google has modified the ADK deployment workflow." (Unit 42, primary source)
4. **Infrastructure integrity statement** — Google confirmed "strong, non-overridable controls are in place to prevent service agents from altering production images" — addressing the Artifact Registry exposure but not reversing the GCS read access design.

**No CVE was assigned.** No code patch has been confirmed. The fix relies on customers proactively implementing BYOSA — the insecure default remains the default unless customers opt out.

This is a significant weakness in the response: the onus is on every affected organization to discover they need BYOSA and implement it, rather than Google tightening the default.

---

## Other Exploits in the VentureBeat Article — AgentFail Pipeline Status

The VentureBeat article (published April 30, 2026) covers seven distinct vulnerability instances across four platforms over a nine-month window. The framing is that every exploit hit **runtime credentials that IAM tools never tracked**, not the AI model itself.

### Exploit 1: Codex Branch Name OAuth Token Exfiltration (BeyondTrust)
- **Already published:** AAGF-2026-029
- **Summary:** BeyondTrust Phantom Labs (Tyler Jespersen, Fletcher Davis, Simon Stewart) discovered that git branch names flowed unsanitized into setup scripts in OpenAI Codex containers, allowing OAuth token exfiltration via shell injection. Unicode Ideographic Space (U+3000 × 94) made the payload invisible in the Codex UI. OpenAI classified Critical P1; fully remediated by February 5, 2026.

### Exploit 2: Claude Code Sandbox Escape (CVE-2026-25723)
- **Pipeline status:** NOT YET in pipeline — not found in incidents/ or drafts/
- **Summary:** Piped shell commands using `sed` and `echo` lacked validation for command chaining, permitting escape from the project directory sandbox despite restrictions. Discovered by Anthropic during internal security review. Patched in Claude Code version 2.0.55.
- **AgentFail fit:** QUALIFIES. Real platform, real deployed agent, real escape from intended security boundary. Somewhat undercut by Anthropic discovering it themselves (no external pressure to disclose), but the boundary violation is meaningful.

### Exploit 3: Claude Code Trust Dialog Bypass (CVE-2026-33068)
- **Pipeline status:** NOT YET in pipeline
- **Summary:** Claude Code loaded `.claude/settings.json` **before** displaying the trust confirmation dialog to users. Malicious repositories could embed `permissions.defaultMode: bypassPermissions` to silently grant themselves elevated access. Patched in version 2.1.53.
- **AgentFail fit:** QUALIFIES. The race condition between permission grant and user confirmation is a real agentic autonomy/consent failure pattern. Relevant to any organization where developers clone untrusted repositories with Claude Code.

### Exploit 4: Claude Code 50-Subcommand Deny-Rule Bypass (Adversa AI)
- **Already published:** AAGF-2026-036
- **Summary:** A hard-coded 50-subcommand threshold in the legacy parser caused Claude Code to silently stop enforcing deny rules for complex command chains. In non-interactive CI/CD environments, the fallback prompt was auto-approved. Adversa AI disclosure forced deployment of a pre-existing fix; patched in version 2.1.90.

### Exploit 5: GitHub Copilot PR Description Prompt Injection → Auto-Approve (CVE-2025-53773)
- **Pipeline status:** NOT YET in pipeline — not found in incidents/ or drafts/
- **Summary:** Johann Rehberger (with Markus Vervier, Persistent Security) discovered that hidden instructions in pull request descriptions caused Copilot to flip `.vscode/settings.json` to enable `auto-approve`, disabling all confirmation dialogs and granting unrestricted shell execution. Patched in Microsoft's August 2025 Patch Tuesday release.
- **AgentFail fit:** QUALIFIES. Real platform, real production deployment pattern, real privilege escalation from PR interaction to unrestricted shell access. Strong prompt injection → agentic privilege escalation chain.

### Exploit 6: GitHub Copilot GitHub Issues Token Exfiltration via Symlink (Orca Security)
- **Pipeline status:** NOT YET in pipeline
- **Summary:** Orca Security found that malicious instructions in GitHub Issues could manipulate Copilot into checking out hostile pull requests containing symbolic links pointing to `/workspaces/.codespaces/shared/user-secrets-envs.json`. JSON schema fields exfiltrated the privileged `GITHUB_TOKEN`, enabling complete repository takeover. Patched by Microsoft.
- **AgentFail fit:** QUALIFIES. Specific, well-sourced, real platform. Symlink-based TOCTOU exfiltration of service-level credentials through an AI agent is a clean agentic failure pattern.

### Exploit 7 (Primary): Vertex AI P4SA Over-Permissioning (Unit 42)
- **This document** — see above.

---

## AgentFail Qualification Analysis for AAGF-2026-040

### Criterion 1: Real-world deployment
**PASS (with note)** — The P4SA over-permissioning exists in every production Vertex AI Agent Engine deployment that hasn't opted into BYOSA. This is not a CTF or research demo environment. The flaw is the platform default; the exploitation was demonstrated in a controlled research context. Categorize as: "platform default creates real attack surface; no confirmed in-the-wild exploitation."

### Criterion 2: Autonomous agent involved
**PASS** — Vertex AI Agent Engine agents operate autonomously. The P4SA credentials are used by the agent during autonomous execution, not by a human operator. An attacker who controls the agent's inputs (e.g., via prompt injection) could trigger the credential extraction without human intervention.

### Criterion 3: Verifiable
**PASS** — Primary source: Unit 42 blog (fetched directly). 10+ high-quality independent secondary sources. Google's documentation response provides third-party corroboration that the issue was real. No CVE, but the disclosure is well-documented.

### Criterion 4: Meaningful impact
**PASS** — Unrestricted read access to all project Cloud Storage data (potential customer PII, sensitive data, backups) plus access to Google's proprietary Vertex AI infrastructure code. The blast radius is the entire GCP project's storage layer, not a single resource.

### Recommended differentiation from AAGF-2026-029 (Codex OAuth Token)
Both incidents are about AI coding/development agents holding over-scoped credentials. The key differentiators:
- AAGF-2026-029: **Input validation failure** (branch name injection) enabling credential theft — a coding bug in a specific feature
- AAGF-2026-040: **Platform design default** (P4SA granted project-wide storage access by design) — a systemic IAM architecture failure

AAGF-2026-040 is the stronger "IAM as AI agent attack surface" narrative because the over-permissioning is intentional by design, not an accidental coding flaw.

---

## Key Narrative for Incident Write-Up

**The headline story:** Google's Vertex AI platform ships AI agents with a service account that reads every Cloud Storage bucket in your project by default. If any attacker can influence your agent — via prompt injection, a compromised tool, or a malicious repository — they can read all of it. The fix is documented, but the default is still insecure, and the onus is on customers to know they need to fix it.

**The 5 Whys root cause:** Why did the agent have project-wide storage access? Because P4SA was provisioned with broad defaults. Why were the defaults broad? Because Google designed P4SA for platform utility, not agent isolation. Why was isolation not a design requirement? Because AI agents were not anticipated to be compromise vectors when P4SA was architected. Why wasn't it updated when agents became attack vectors? Because the platform team and security team did not audit P4SA permissions against the new threat model. Why wasn't the threat model updated? Because IAM governance for AI agents was not owned by anyone with authority to change platform defaults.

**The actual_vs_potential classification:** `near-miss` — The vulnerability existed in real production deployments and was demonstrated functional by Unit 42, but no customer data is confirmed exfiltrated.

**Potential damage:** Every Cloud Storage bucket in every Vertex AI Agent Engine deployment that hasn't implemented BYOSA. Google Cloud has millions of customers; Vertex AI Agent Engine is an enterprise product. Even if 1% of deployments had sensitive data in GCS accessible to the P4SA, the aggregate exposure is enormous.
