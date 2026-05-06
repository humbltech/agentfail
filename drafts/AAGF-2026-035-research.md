# AAGF-2026-035 Research: Vertex AI P4SA Over-Permissioning — Default Service Account Grants AI Agents Read Access to All Cloud Storage Buckets

## Source Inventory

| # | Source | Type | Date | Credibility |
|---|--------|------|------|-------------|
| S1 | [Unit 42 / Palo Alto Networks — "Double Agents: Exposing Security Blind Spots in GCP Vertex AI"](https://unit42.paloaltonetworks.com/double-agents-vertex-ai/) | PRIMARY — original research | March 31, 2026 | High. Named researchers, responsible disclosure process, technical PoC |
| S2 | [The Hacker News — "Vertex AI Vulnerability Exposes Google Cloud Data and Private Artifacts"](https://thehackernews.com/2026/03/vertex-ai-vulnerability-exposes-google.html) | Secondary — tech press | March 31, 2026 | Medium-high. Accurate summary of S1 |
| S3 | [SecurityWeek — "Google Addresses Vertex Security Issues After Researchers Weaponize AI Agent"](https://www.securityweek.com/google-addresses-vertex-security-issues-after-researchers-weaponize-ai-agent/) | Secondary — security press | April 1, 2026 | Medium-high. Adds Google response detail |
| S4 | [Dark Reading — "Google's Vertex AI Is Over-Privileged. That's a Problem"](https://www.darkreading.com/cyber-risk/googles-vertex-ai-over-privilege-problem) | Secondary — security press | ~April 2026 | Medium-high. Editorial framing of design issue |
| S5 | [VentureBeat — "AI coding agents breached: attackers targeted credentials, not models"](https://venturebeat.com/security/six-exploits-broke-ai-coding-agents-iam-never-saw-them) | Tertiary — mainstream tech press | ~April–May 2026 | Medium. Aggregates multiple incidents; could not fully fetch (429) |
| S6 | [Paubox — "Google Cloud's Vertex AI could turn AI agents into insider threats"](https://www.paubox.com/blog/google-clouds-vertex-ai-could-turn-ai-agents-into-insider-threats) | Secondary — healthcare IT press | ~April 2026 | Medium. Good attack chain summary |
| S7 | [Unit 42 / Palo Alto Networks — "ModeLeak: Privilege Escalation to LLM Model Exfiltration in Vertex AI"](https://unit42.paloaltonetworks.com/privilege-escalation-llm-model-exfil-vertex-ai/) | PREDECESSOR research | November 12, 2024 | High. Same researchers (Ofir Balassiano + Ofir Shaty), establishes pattern |
| S8 | [Google Cloud Documentation — "Use a custom service account"](https://docs.cloud.google.com/vertex-ai/docs/general/custom-service-account) | PRIMARY — vendor documentation | Ongoing | High. Official acknowledgment of default permission scope |

**VentureBeat primary source note:** The VentureBeat article (primary source URL provided for this task) could not be fetched due to rate limiting (HTTP 429). Its content was partially reconstructed from search result snippets. Key detail confirmed: it aggregates several 2026 AI agent credential incidents, including this one, under the framing that attackers target credentials rather than models. VentureBeat is a secondary source for the P4SA finding — the actual primary source is the Unit 42 research (S1).

---

## Source Bias Assessment

**Researcher conflict of interest:** Ofir Shaty is a Palo Alto Networks Unit 42 researcher. Palo Alto Networks sells cloud security products (Prisma Cloud) that directly benefit from publicizing IAM over-permissioning risks. This is a standard industry research bias — the finding itself is technically sound and independently corroborated by Google's documentation response, but the severity framing should be read with that context.

**Two-level finding:** The 2026 Double Agents research (S1) is the second Vertex AI IAM study by the same researchers at Unit 42. The 2024 ModeLeak research (S7, same authors Balassiano + Shaty) found different but related privilege escalation paths. The 2026 work represents a deliberate, sustained research program targeting Vertex AI's IAM model — not an independent discovery.

**Google's response bias:** Google's response (documentation updates + BYOSA recommendation) is non-committal on whether the default permissions constitute a bug or a design choice. Google has not issued a CVE, formal security advisory, or stated intent to change the defaults. This suggests Google may not consider the default P4SA scope a vulnerability per se — rather, an over-broad default that users can and should scope down.

**Press amplification:** The VentureBeat "six exploits" framing conflates this credential over-permissioning finding with separate, active exploitation incidents (e.g., the BeyondTrust Codex OAuth token theft, the Claude Code npm registry incident). This may overstate the urgency of the Vertex AI P4SA finding specifically.

**No confirmed victim:** No secondary source identifies a real production organization that was harmed by P4SA over-permissioning. All described harms are researcher-demonstrated in test environments.

---

## Key Facts (with source attribution)

### Dates

- **date_occurred:** N/A — this is an architectural/design issue present since Vertex AI Agent Engine launch. No single incident date.
- **date_discovered:** November 12, 2024 (ModeLeak, S7 — Balassiano + Shaty first document Vertex AI service account over-permissioning pattern). The specific P4SA/Agent Engine variant discovered during the 2026 Double Agents research, likely late 2025 or early 2026 (exact discovery date not published).
- **date_reported:** March 31, 2026 (Unit 42 public disclosure, S1). This is the first public disclosure of the specific Double Agents / P4SA-over-permissioning finding.
- **Google documentation updated:** April 1, 2026 (concurrent with public disclosure — Google revised docs same day as publication per S3).

---

### Technical Details

#### What is a P4SA?

A **Per-Project, Per-Product Service Agent** (P4SA) is a Google-managed service account automatically created by Google Cloud when certain products are enabled in a project. For Vertex AI Agent Engine, the relevant P4SA identity is:

```
service-<PROJECT_NUMBER>@gcp-sa-aiplatform-re.iam.gserviceaccount.com
```

P4SAs are distinct from user-managed service accounts. They are created and managed by Google, not the customer. Customers do not directly control what roles the P4SA holds — Google assigns its permissions when the service is enabled.

#### What permissions does the Vertex AI Agent Engine P4SA have by default?

The specific storage permissions confirmed by Unit 42 research (S1) and corroborated by multiple secondary sources:

- `storage.buckets.get`
- `storage.buckets.list`
- `storage.objects.get`
- `storage.objects.list`

These permissions apply **project-wide** — not scoped to any specific bucket or path. An agent running under this P4SA can enumerate and read the contents of every Cloud Storage bucket in the customer's GCP project.

Google's own documentation (S8) acknowledges: "The default Vertex AI service agent has access to BigQuery and Cloud Storage."

#### Which services are affected?

The specific over-permissioning finding applies to **Vertex AI Agent Engine** (also called Vertex AI Reasoning Engine), specifically agents deployed using the Vertex AI Agent Development Kit (ADK). The predecessor 2024 ModeLeak research found similar issues in:
- Vertex AI custom training jobs (via `service-<PROJECT_NUMBER>@gcp-sa-aiplatform-cc.iam.gserviceaccount.com`)
- Vertex AI model deployment / online prediction endpoints

The scope appears to be the entire Vertex AI platform's service agent architecture, not just Agent Engine.

#### The attack chain

The Double Agents attack chain (S1, confirmed by S2, S3, S6):

1. **Attacker deploys a Vertex AI agent** via the ADK. This can be a malicious agent the attacker controls, or it can be a legitimate agent manipulated via prompt injection.
2. **Agent execution exposes metadata service credentials.** Every call to the Agent Engine invokes Google's GCE metadata service (`metadata.google.internal/computeMetadata/v1/instance/?recursive=true`), which returns the P4SA's short-lived credentials, along with the GCP project ID, agent identity, and OAuth scopes.
3. **Attacker extracts P4SA credentials** via a custom tool embedded in the agent (or via prompt injection into a legitimate agent). The credentials are short-lived but functional.
4. **Credentials are used to pivot.** With P4SA credentials, the attacker:
   - Reads every Cloud Storage bucket in the consumer's GCP project
   - Accesses restricted Google-owned Artifact Registry repositories exposed during Agent Engine deployment
   - Downloads container images constituting the Vertex AI Reasoning Engine core (`reasoning-engine`, `llm-extension` components)

#### Is this a misconfiguration or a Google design decision?

This is a **Google design decision** — not a customer misconfiguration. The P4SA is created and permissioned by Google, not the customer. Every Vertex AI Agent Engine deployment inherits this scope by default unless the customer explicitly implements BYOSA. There is no customer-side misconfiguration that triggers it; it is the default behavior.

Dark Reading (S4) frames it explicitly: "Vertex AI's default Per-Project, Per-Product Service Agent (P4SA) is over-privileged by design."

#### The prompt injection vector

The Unit 42 research specifically highlights a second attack path that does not require the attacker to control the deployed agent: **prompt injection**. A malicious input to a legitimately deployed agent (e.g., via user-supplied text, a poisoned document the agent reads, a crafted web page) can cause the agent to execute a tool that extracts and exfiltrates P4SA credentials. This path is particularly relevant to production deployments because it requires no attacker access to the deployment infrastructure.

---

### Affected System

- **Platform:** Google Cloud Vertex AI — specifically Agent Engine (Reasoning Engine) and agents deployed via the Agent Development Kit (ADK)
- **Agent types:** Any agent deployed to Vertex AI Agent Engine using default P4SA configuration
- **Scope:** All GCP projects using Vertex AI Agent Engine without BYOSA
- **Scale:** Vertex AI is one of the largest enterprise AI platforms globally; the number of production Agent Engine deployments is not published by Google

---

### Impact and Damage

#### Actual harm documented: None confirmed

No secondary source documents a real-world incident where the P4SA over-permissioning was exploited against a production customer. All reported harms are researcher-demonstrated in controlled test environments.

#### Potential harm (researcher-demonstrated):

1. **Cloud Storage data exfiltration:** Unrestricted read of all GCS buckets in the affected GCP project. For enterprise customers this could include training data, model weights, PII datasets, logs, backups, credentials stored in object storage.

2. **Artifact Registry access — internal Google infrastructure:** The research demonstrated access to restricted, Google-owned Artifact Registry repositories not intended for customer access, containing core Vertex AI Reasoning Engine code. This is notable: the blast radius extends beyond customer data into Google's own internal infrastructure.

3. **Software supply chain risk:** By accessing internal Google container images, an attacker gains visibility into the architecture of the Vertex AI platform itself — potentially enabling future attacks.

4. **Google Workspace data:** Multiple secondary sources (S3, S6) note that the same P4SA credentials potentially reach Google Workspace (Gmail, Drive) data in some configurations, though this was not the central demonstrated finding.

5. **Prompt-injection-to-credential-theft pipeline:** The combination of prompt injection + P4SA over-permissioning creates a path from user-controlled input in a production chat interface to full project-wide Cloud Storage read. This is a realistic production attack scenario.

#### Severity calibration:

The finding is not trivial. For an enterprise running Vertex AI agents over sensitive GCP projects (healthcare, finance, legal), the default P4SA scope represents a significant blast-radius amplifier for any agent compromise — whether via prompt injection, supply chain attack, or insider threat. The key question is: how many production deployments are running with default P4SA (no BYOSA)? That number is unknown.

---

### Vendor Response

Google's response to the Double Agents disclosure:

1. **Documentation revised** (April 1, 2026, concurrent with Unit 42 publication): Google updated official Vertex AI documentation to explicitly document how the service uses resources, accounts, and agents — adding transparency to what P4SA permissions exist.

2. **BYOSA recommendation elevated:** Google published and promoted the Bring Your Own Service Account (BYOSA) pattern as the recommended mitigation, giving customers a path to replace the default P4SA with a custom, least-privilege service account.

3. **Production safeguards statement:** Google stated that "strong, non-overridable controls are in place to prevent service agents from altering production images" — addressing the Artifact Registry write-access concern, though not the read-access concern.

4. **No CVE issued.** Google did not issue a CVE number or a formal Google Security Advisory (GCP-SA-*) for this finding.

5. **No default change announced.** Google has not announced any intent to change the default P4SA permissions. BYOSA remains opt-in.

**Google's framing is instructive:** By not issuing a CVE and not changing the default, Google is implicitly treating this as a configuration guidance issue rather than a vulnerability. This is contested by the researchers and press coverage, which frames it as a design flaw.

---

### Affected Parties

- **Direct victims:** None confirmed in public record.
- **At-risk population:** Any organization using Vertex AI Agent Engine with default service account configuration. This includes all Vertex AI Agent Engine customers who have not explicitly configured BYOSA.
- **Google's internal infrastructure:** The Artifact Registry access finding affects Google's own internal code repositories — Google is itself an affected party in the researcher's demonstrated scenario.

---

## Classification Assessment

- **Likely categories:** `credential-theft` (P4SA credential extraction), `privilege-escalation` (agent-to-project pivot), `over-permissioned-agent` (root cause), `prompt-injection` (attack vector for production exploitation)
- **Likely severity:** HIGH (for production systems with default config) / MEDIUM (as a research finding without confirmed production victims)
- **actual_vs_potential:** `near-miss` — no confirmed production exploitation; researcher-demonstrated PoC shows the blast radius is real and large
- **potential_damage:** An AI agent with default P4SA credentials, if compromised via prompt injection, can read all Cloud Storage data across the entire GCP project — training datasets, model artifacts, PII, credentials in object storage, audit logs. The demonstrated path also reaches restricted Google-owned container registries, exposing internal Vertex AI infrastructure.
- **intervention:** No confirmed intervention in a production incident (there is no known production incident to intervene in). For the research finding: responsible disclosure process; Google's documentation update; BYOSA recommendation. In production, the intervention is customer adoption of BYOSA — which is opt-in and not measured.

---

## Triage Assessment

**PARK — with strong case for conditional PUBLISH**

### Against PUBLISHABLE (right now):

1. **No confirmed production victims.** All damage is researcher-demonstrated in test environments. This does not meet the triage criterion "real-world deployment with meaningful impact" as typically construed.
2. **No CVE, no formal advisory.** Google has not treated this as a reportable vulnerability. There is no authoritative incident record.
3. **Design issue, not incident.** This is a persistent architectural over-permissioning that creates risk — it is a precondition for an incident, not an incident itself.

### For PUBLISHABLE (strong arguments):

1. **The design flaw is real and documented.** Google's own documentation confirms the scope of default P4SA access. This is not contested.
2. **The attack chain is fully demonstrated.** Unit 42 produced a working PoC with credential extraction via metadata service — this is not theoretical.
3. **Production risk is live and widespread.** Any Vertex AI Agent Engine deployment without BYOSA is currently exposed. The number of such deployments is unknown but potentially large.
4. **Prompt injection vector makes it production-realistic.** Unlike a theoretical flaw that requires attacker access to the deployment, prompt injection + P4SA over-permissioning is a realistic attack against any production chat application built on Vertex AI ADK.
5. **Pattern significance.** This is a third-generation finding (2024 ModeLeak → 2026 Double Agents) showing a systemic IAM design pattern in Vertex AI that over-privileges agents by default. The pattern itself is worth documenting even without a confirmed incident.

### Recommendation:

PARK pending one of:
- A confirmed report of actual production exploitation (which would make it PUBLISHABLE immediately)
- Or a editorial decision to publish "design flaw / near-miss" entries — in which case this is publishable as a `near-miss` with explicit labeling

The finding is substantively important for the AgentFail mission (operator-actionable intelligence). The absence of a confirmed victim is a real limitation, but the production risk is live, the attack chain is demonstrated, and Google's opt-in-only mitigation means most deployments remain exposed today.

---

## Pattern Connections

- **Lineage:** Directly builds on [AAGF-2026 ModeLeak / Vertex AI Privilege Escalation] (November 2024 — same researchers, different Vertex AI attack surface). If the 2024 ModeLeak finding has been published as an AgentFail incident, this is a follow-on.
- **Credential over-permissioning class:** Connects to any AgentFail entries involving agents operating with excessive IAM/credential scope (a recurring failure mode across AWS, Azure, and GCP agent deployments).
- **Prompt injection → credential theft chain:** Connects to incidents where prompt injection is the delivery mechanism for credential exfiltration — the P4SA case is notable because the injected payload doesn't need to contain credentials itself; it just needs to trigger a metadata service call.
- **VentureBeat "six exploits" cluster:** The VentureBeat article groups this with concurrent 2026 incidents including BeyondTrust's Codex OAuth token theft (GitHub branch name → cleartext token) and the Claude Code npm registry source code leak. These share the pattern: agents hold live production credentials; IAM policies don't govern agent actions; human session anchoring is absent.
- **PromptIntel cross-reference:** Nova Hunting's PromptIntel "Agentic Misuse" subcategory likely covers the prompt injection → P4SA exfiltration path. The P4SA finding is a concrete instantiation of their taxonomy.

---

## Open Questions

1. **Has Google changed P4SA defaults?** The April 2026 response was documentation-only. Have subsequent GCP releases scoped down default P4SA permissions for Agent Engine? Check Google Cloud release notes post-April 2026.

2. **How many production deployments lack BYOSA?** Google has not published adoption metrics for BYOSA. Enterprise security surveys (e.g., the VentureBeat statistic that "78% of organizations have AI agents running with real production credentials ungoverned by IAM policy") suggest low BYOSA adoption, but this is from a secondary aggregated source.

3. **Does the metadata service exposure apply to all Vertex AI deployments, or only Agent Engine?** The 2024 ModeLeak research showed similar credential exposure via custom training jobs — suggesting the metadata service issue is platform-wide, not limited to ADK-deployed agents.

4. **Is the Artifact Registry access still possible post-April 2026?** Google stated "non-overridable controls prevent service agents from altering production images" — but the demonstrated finding was read access, not write. Has read access to restricted internal repos been revoked?

5. **What is the exact responsible disclosure timeline?** The March 31, 2026 publication is the public disclosure date. The disclosure-to-publication window is not stated in any source — important for understanding whether Google had time to mitigate before the finding went public.

6. **Are there analogues in AWS Bedrock or Azure AI Studio?** Both platforms have their own default service role / managed identity patterns. If P4SA is the Google manifestation of a broader "AI platform default credential over-scoping" problem, this pattern likely exists in the other hyperscalers and merits cross-platform research.

7. **VentureBeat primary source:** The primary source URL for this task assignment was the VentureBeat article, which could not be fetched (HTTP 429 rate limiting). Full fetch should be reattempted to confirm whether VentureBeat had any exclusive detail about P4SA not present in the Unit 42 primary research (unlikely but not verified).
