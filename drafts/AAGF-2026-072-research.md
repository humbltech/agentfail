# AAGF-2026-072 Research: Microsoft Semantic Kernel Prompt Injection RCE

**Research date:** 2026-05-07
**Researcher:** Stage 1 Research Agent
**Sources consulted:** 12+ (Microsoft Security Blog, NVD, GitHub Security Advisories, SentinelOne, Nuka-AI, WindowsNews, GitLab Advisory DB, OpenClawAI, ThreatINT, Feedly, SANS At-Risk)

---

## Source Assessment

**Primary disclosing entity:** Microsoft Defender Security Research Team — named researchers are Uri Oren (Security Researcher), Amit Eliahu (Security Researcher), and Dor Edry (Senior Security Researcher). The same trio (credited as `urioren`, `amiteliahu`, `doredry` in GitHub advisory) are listed as discoverers on BOTH CVEs. This is an internal Microsoft security team finding, not an external researcher coordinated disclosure — the researchers are Microsoft employees disclosing Microsoft's own product vulnerabilities.

**Disclosure vehicle:** Microsoft Security Blog post titled "When prompts become shells: RCE vulnerabilities in AI agent frameworks" published May 7, 2026. The blog is JavaScript-rendered (confirmed per triage), which is why the original fetch failed. Direct content confirmed via multiple secondary sources that cite and quote it.

**Secondary researcher disclosure (separate, later):** Nuka-AI (Jeff Ponte, independent) discovered six patch bypass vectors for CVE-2026-25592 after the February 6 official patch. Disclosed April 25, 2026. Microsoft dismissed Nuka-AI's findings as "developer error" without issuing a new CVE — this is a significant editorial note for the AgentFail incident framing.

**Source credibility rating:** HIGH for the two core CVEs. The NVD entries, GitHub Security Advisories (GHSA-2ww3-72rp-wpp4 and GHSA-xjw9-4gw8-4rqx), SentinelOne vulnerability database, and GitLab Advisory DB all independently corroborate. Nuka-AI disclosure is credible but adversarial and post-dates the core incident.

**Conflicting data notes:**
- CVSS for CVE-2026-25592: sources report both 9.9 and 10.0. NVD shows 9.9 (GitHub as CNA); some secondary sources (ThreatINT, Nuka-AI) cite 10.0. The GitHub Advisory (GHSA-2ww3-72rp-wpp4) gives 9.9. Using 9.9 as authoritative (NVD/GitHub CNA).
- CVSS for CVE-2026-26030: NVD shows 9.9 (GitHub as CNA); WindowsNews cites 9.8; ThreatINT cites 10.0. GitHub Advisory (GHSA-xjw9-4gw8-4rqx) gives 9.9. Using 9.9 as authoritative.
- Affected versions for CVE-2026-25592 (.NET): some sources say "prior to 1.70.0," others say "prior to 1.71.0." The GitHub GHSA advisory explicitly states 1.71.0 as patched version. Using 1.71.0.

---

## Timeline

| Date | Event |
|------|-------|
| 2026-02-03 | CVE-2026-25592 reserved (MSRC) |
| **2026-02-06** | CVE-2026-25592 published to NVD — patch released (.NET 1.71.0, Python 1.39.3) |
| 2026-02-10 | PR #13505 merged (CVE-2026-26030 fix, InMemoryVectorStore filter) |
| 2026-02-13 | CVE-2026-25592 public vulnerability disclosure (secondary coverage) |
| **2026-02-19** | CVE-2026-26030 published to NVD — patch: Python 1.39.4 |
| 2026-03-03 | CVE-2026-26030 last modified on NVD |
| 2026-03-12 | CVE-2026-26030 featured in Microsoft March 2026 Patch Tuesday (82 vulnerabilities) |
| 2026-03-24 | Nuka-AI files disclosure to MSRC with PoC recordings (6 patch bypass vectors) |
| 2026-04-03 | Microsoft Agent Framework 1.0 launches — built on Semantic Kernel, inherits vulnerabilities |
| 2026-04-07–09 | Microsoft merges "shadow patches" without CVE assignment; MSRC closes Nuka-AI case as "Developer Error" |
| 2026-04-14 | CVE-2026-25592 last modified on NVD |
| 2026-04-21 | SK v1.48.0 released — Nuka-AI confirms all 6 bypass vectors still functional |
| 2026-04-25 | Nuka-AI publishes public disclosure ("The Cracked Kernel") |
| **2026-05-07** | Microsoft Security Blog "When prompts become shells" published — umbrella disclosure covering both CVEs |

**Date of first public disclosure (date_reported):** 2026-02-06 (CVE-2026-25592 to NVD); 2026-02-19 (CVE-2026-26030 to NVD). The May 7 blog post is a retrospective/synthesizing disclosure, not the first.

---

## Technical Mechanism (per CVE)

### CVE-2026-25592 — SessionsPythonPlugin Arbitrary File Write via Path Traversal

**CWE:** CWE-22 (Path Traversal — Improper Limitation of a Pathname to a Restricted Directory)
**CVSS:** 9.9 CRITICAL — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H`
**Affected component:** `SessionsPythonPlugin` (also `SessionsPythonTool`) in the Microsoft Semantic Kernel .NET SDK

**What the component does:** SessionsPythonPlugin is a code interpreter plugin that enables AI agents to write and execute Python code in sandboxed sessions (Microsoft Azure Container Apps dynamic sessions). It exposes file upload (`UploadFileAsync`) and file download (`DownloadFileAsync`) functions that agents can invoke to transfer files between the host filesystem and the sandbox.

**The vulnerability:** `DownloadFileAsync` and `UploadFileAsync` accept a `localFilePath` parameter representing the host-side file path. Neither method validates or canonicalizes this path — there is no check that the provided path remains within an intended directory. An attacker who controls the agent's prompt can inject path traversal sequences (`../`, absolute paths, encoded variants) causing the agent to write files to arbitrary locations on the host filesystem.

**Attack chain:**
1. Attacker has a prompt injection vector (malicious document, web content, tool output, or direct input) that influences the agent
2. Agent's LLM is prompted to invoke `UploadFileAsync` or `DownloadFileAsync` with a crafted `localFilePath` like `../../../../etc/cron.d/backdoor` or a startup directory
3. Framework invokes the function without path validation (AutoInvokeKernelFunctions passes tool calls to the plugin automatically)
4. Attacker writes an arbitrary file — a malicious script, modified binary, or cron entry — to any filesystem location accessible by the process
5. File execution → RCE (e.g., overwriting a startup script, planting a cronjob, overwriting application source code)

**Why this is RCE, not just file write:** Writing to executable locations — startup scripts, cron directories, Python source files of the running application, or SSH authorized_keys — converts arbitrary file write to code execution. Nuka-AI demonstrated the "Self-Nuke" vector: agent overwrites its own application source code.

**Patch:** Microsoft.SemanticKernel.Plugins.Core ≥ 1.71.0 (.NET); semantic-kernel ≥ 1.39.3 (Python). Fix adds path canonicalization and validation. Interim mitigation: implement a Function Invocation Filter that allowlists valid `localFilePath` values before invocation.

**Patch bypass (Nuka-AI finding):** Six encoding/obfuscation vectors defeat the string-pattern filter used in the patch:
1. JSON array wrapping (`["../etc/passwd"]` instead of `"../etc/passwd"`)
2. Object reflection (anonymous object containing the path)
3. Base64 encoding (decoded at execution time)
4. URL encoding (`%2e%2e%2f` for `../`)
5. Unicode homoglyphs (U+2044 fraction slash normalizes to `/` during file I/O)
6. Hybrid canonicalization (combining multiple encodings to exhaust non-recursive sanitizers)

Microsoft declined to assign a new CVE for these bypasses (characterized as "Developer Error"). Nuka-AI confirms v1.74.0 remains exploitable via bypass vectors.

---

### CVE-2026-26030 — InMemoryVectorStore Filter Code Injection

**CWE:** CWE-94 (Code Injection — Improper Control of Generation of Code)
**CVSS:** 9.9 CRITICAL — `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H`
**Affected component:** `InMemoryVectorStore` filter functionality in the Semantic Kernel Python SDK

**What the component does:** InMemoryVectorStore is a built-in vector store (no external database required) used for Retrieval-Augmented Generation (RAG) workflows. When an AI agent performs similarity search, it can apply filter expressions to narrow results — e.g., filtering by metadata fields. This is a core pattern in RAG-based Copilot and enterprise search agents.

**The vulnerability:** The filter expression parser evaluates filter expressions without sanitization, using unsafe Python evaluation (effectively `eval()`-equivalent behavior) on user-controllable input. Attackers who can influence the filter expression — through injected document content, crafted vector store entries, or direct API manipulation — can embed Python code that executes in the application's context when the filter runs.

**Attack chain:**
1. Attacker has a path to influence filter expressions passed to `similarity_search_with_score` or `similarity_search_with_relevance_scores`
2. Malicious filter expression contains embedded Python code (e.g., `__import__('os').system('calc.exe')`)
3. InMemoryVectorStore evaluates the expression without sanitization
4. Arbitrary Python code executes in the application process context
5. Full application-level RCE — attacker can exfiltrate data, pivot to other services, establish persistence

**Microsoft PoC detail:** Microsoft's own blog demonstrates launching `calc.exe` on the device running the AI agent via a single malicious prompt — confirming trivial exploitation once an injection vector exists.

**Patch:** semantic-kernel Python ≥ 1.39.4 (PR #13505 merges February 10, 2026). Fix blocks dangerous attribute access in filter evaluation. Interim mitigation: avoid `InMemoryVectorStore` in production.

---

### Are these two separate vulnerabilities or two facets of one issue?

They are **architecturally related but technically distinct vulnerabilities** affecting different components and requiring different attack paths:

| | CVE-2026-25592 | CVE-2026-26030 |
|--|--|--|
| Component | SessionsPythonPlugin (file I/O) | InMemoryVectorStore (filter eval) |
| Language SDK | .NET (+ Python) | Python only |
| Root cause | Missing path validation | Unsafe code evaluation |
| CWE | CWE-22 (Path Traversal) | CWE-94 (Code Injection) |
| Attack vector | Prompt injection → file write → RCE | Prompt injection → filter injection → direct code exec |
| Patch version | .NET 1.71.0 / Python 1.39.3 | Python 1.39.4 |

Both share the same **architectural root cause**: the framework passes LLM-generated output to system-level operations without sanitization. Both are triggered by prompt injection. The Microsoft blog groups them under the same "prompts become shells" framing for this reason.

---

## Scope and Affected Versions

**Affected versions:**

| CVE | SDK | Affected | Patched |
|-----|-----|---------|---------|
| CVE-2026-25592 | Microsoft.SemanticKernel.Plugins.Core (.NET) | < 1.71.0 | ≥ 1.71.0 |
| CVE-2026-25592 | semantic-kernel (Python) | < 1.39.3 | ≥ 1.39.3 |
| CVE-2026-26030 | semantic-kernel (Python) | < 1.39.4 | ≥ 1.39.4 |

**Note on bypass:** Nuka-AI analysis finds CVE-2026-25592 patch bypasses remain functional through at least v1.74.0. Microsoft disputes this characterization.

**Who uses Semantic Kernel:**
- 27,000+ GitHub stars (ranging 27,307–27,770 across 2026 measurements)
- Microsoft's primary open-source AI orchestration framework, supporting C#, Python, Java
- Powers bidirectional integration with **Copilot Studio** — SK applications can embed Copilot Studio agents and vice versa
- Underpins **Azure AI Foundry** agent tooling
- The framework handles **millions of requests per day** in production at enterprise scale (multiple sources)
- Used by any organization running Azure OpenAI with agent orchestration patterns

**Is SK used in Microsoft products directly?** Yes:
- Copilot Studio integrates with SK (bidirectional via DirectLine API)
- Azure AI Foundry uses SK as its agent orchestration layer
- **Microsoft Agent Framework 1.0** (released April 3, 2026) is built directly on Semantic Kernel — it launched while CVE-2026-25592 was unpatched for the bypass vectors

**Specific industries affected:** Any enterprise using RAG (InMemoryVectorStore is the default no-setup vector store, commonly used in demos that become production), and any enterprise using Azure Container Apps dynamic sessions with code interpreter agents.

**Estimated vulnerable production deployments:** No confirmed figure available. Given 27K+ stars, enterprise-scale adoption, and Copilot Studio/Azure AI Foundry integration, exposure is broad. Microsoft's own products are among the affected.

---

## Exploitation Evidence

**CVE-2026-25592 (SessionsPythonPlugin path traversal):**
- PoC: Confirmed available. SentinelOne rates exploitation as "Trivial." EPSS probability: 0.11% (low, but EPSS is a poor predictor for AI-framework-specific attacks).
- In-the-wild: No confirmed exploitation reported in any source.
- Nuka-AI demo: Five recorded demonstration videos showing successful autonomous exploitation achieving "complete host takeover with service account privileges" via the Self-Nuke vector. These are researcher PoCs, not in-the-wild.

**CVE-2026-26030 (InMemoryVectorStore filter injection):**
- PoC: Microsoft's own blog demonstrates launching `calc.exe` via a single malicious prompt (confirmed via multiple sources citing the blog). This is a researcher-produced PoC from the discovering team.
- In-the-wild: No confirmed exploitation reported.
- Exploitation requirements: Attacker must (a) have a prompt injection vector giving influence over agent inputs, and (b) the targeted agent must use the Search Plugin backed by InMemoryVectorStore in the default configuration.

**actual_vs_potential classification:** `near-miss` — No confirmed in-the-wild exploitation for either CVE. Both have researcher PoCs demonstrating feasibility. The attack prerequisites (prompt injection vector + target agent must use the vulnerable component) mean exploitation is not trivially automated against arbitrary Semantic Kernel deployments — an attacker needs knowledge of the target's architecture.

---

## Vendor Response

**CVE-2026-25592:**
- Assigned by: GitHub (CNA)
- CVSS: 9.9 (GitHub/CNA), some sources report 10.0
- Patched: .NET 1.71.0, Python 1.39.3 (released February 6, 2026, same day as CVE publication)
- Advisory: GHSA-2ww3-72rp-wpp4
- Microsoft response to Nuka-AI bypass report: Dismissed as "Developer Error," no new CVE assigned, "shadow patches" merged under benign commit titles without security advisory

**CVE-2026-26030:**
- Assigned by: GitHub (CNA)
- CVSS: 9.9 (GitHub/CNA)
- Patched: Python 1.39.4 (February 19, 2026 publication; PR merged February 10, 2026)
- Advisory: GHSA-xjw9-4gw8-4rqx
- Included in Microsoft March 2026 Patch Tuesday (March 12, 2026)

**May 7, 2026 Microsoft Security Blog:** Published same day as this research (today). This is Microsoft's synthesizing public narrative — framing both CVEs together, disclosing the attack chain publicly, likely timed with broader agentic security guidance. Authors: Uri Oren, Amit Eliahu, Dor Edry (Microsoft Defender Security Research Team).

**Responsible disclosure posture:** Mixed. The core CVEs were handled by the same researchers who found them (internal team), so standard responsible disclosure doesn't fully apply. The Nuka-AI bypass was handled poorly — Microsoft dismissed rather than patching, a concerning response given CVSS 10.0 bypass claims.

---

## Damage Assessment

**What an attacker gains with RCE in a Semantic Kernel agent:**

For CVE-2026-25592 (file write → RCE):
- Overwrite application source code → persistent backdoor in the agent itself ("Self-Nuke")
- Plant persistence in cron, startup scripts, SSH authorized_keys
- Write malicious executables to PATH locations
- Exfiltrate any file readable by the application process (secrets, database credentials, API keys, private keys)
- In cloud deployments (Azure Container Apps): escape to host or pivot to adjacent services via stolen credentials

For CVE-2026-26030 (direct code execution):
- Immediate arbitrary Python execution in the application process
- Full access to in-process memory, environment variables, credentials
- Network pivoting from the application's network position (which in enterprise deployments often has broad internal access)
- Data exfiltration from the vector store itself (which may contain proprietary documents)

**Documented actual damage:** None confirmed. Both are near-misses with researcher-demonstrated PoCs.

**Near-miss potential (potential_damage):**
In a production enterprise Copilot or Azure AI Foundry deployment — where the agent has access to internal document stores, Azure credentials, and broad network access — successful exploitation would yield:
- Complete exfiltration of the RAG knowledge base (potentially containing proprietary IP, customer PII, financial data)
- Lateral movement across Azure subscriptions via managed identity tokens
- Persistent access to production AI infrastructure
- In multi-tenant deployments (Copilot Studio): potential cross-tenant data access

The surface area is particularly severe because InMemoryVectorStore is the **default** no-configuration vector store — many production "quick-start" deployments use it without understanding the security implications.

**Intervention (what stopped full damage):**
- Microsoft's internal security team found these vulnerabilities before external attackers
- Patches released same day or within days of CVE publication
- No evidence of attack tooling targeting these specific CVEs in the wild (as of research date)
- The attack prerequisites (needing a prompt injection vector AND the vulnerable component) create a non-trivial bar

---

## Enterprise Context

**Semantic Kernel's role in the Azure AI stack:**
Semantic Kernel is the orchestration layer that Microsoft recommends for enterprise AI agent development. It integrates directly with:
- **Azure OpenAI Service** (the primary LLM backend for enterprise)
- **Azure AI Foundry** (agent hosting and tooling platform)
- **Copilot Studio** (low-code agent builder used across Microsoft 365)
- **Microsoft 365 Copilot** (via Copilot Studio integration)

This means vulnerabilities in SK are effectively vulnerabilities in the agent layer for any enterprise using Microsoft's AI stack. An organization building internal agents via Azure AI Foundry, or using Copilot Studio, is running code that depends on Semantic Kernel.

**Agent Framework 1.0 timing issue:**
Microsoft launched Agent Framework 1.0 on April 3, 2026 — marketing it as "production-ready with stable APIs and long-term support commitment." At this point:
- CVE-2026-25592's official patch existed but Nuka-AI's bypass vectors were already demonstrated (disclosed to MSRC March 24)
- Agent Framework 1.0 inherits Semantic Kernel's orchestration layer, including the architectural vulnerability (AutoInvokeKernelFunctions trust gap)

This creates a credibility problem: Microsoft's "production-ready" stamp was applied to a framework where bypass vectors for a CVSS 9.9 path traversal were already known internally.

**Does this affect Azure OpenAI Service customers using SK as orchestration?**
Yes — any customer using the SK SessionsPythonPlugin (code interpreter scenarios) or InMemoryVectorStore (RAG without external vector DB) is affected. These are not edge-case configurations; they are explicitly documented quickstart patterns in Microsoft Learn.

---

## Classification Notes

**actual_vs_potential:** `near-miss` — Researcher PoC exists for both CVEs. No confirmed in-the-wild exploitation.

**failure_mode candidates:**
- Prompt injection → tool misuse (primary: agent trusts LLM output as safe input to system operations)
- Unsafe deserialization / code evaluation (CVE-2026-26030: filter eval)
- Missing input validation (CVE-2026-25592: path traversal)
- Insufficient patch quality (patch bypass via encoding variants)
- Architectural trust gap: AutoInvokeKernelFunctions passes LLM-generated parameters directly to privileged system operations without a security boundary

**Severity:** This is a high-priority incident for AgentFail because:
1. Both CVEs are CVSS 9.9 — maximum practical severity for network-exploitable vulnerabilities
2. The attack vector (prompt injection) is the defining attack class for the agentic era
3. Semantic Kernel is the Microsoft-endorsed enterprise agent framework — broad organizational exposure
4. The "prompts become shells" demonstration is a clear, documentable example of the prompt injection → RCE kill chain
5. The post-patch bypass situation reveals systemic problems in how Microsoft handles AI framework security (cosmetic filters vs. architectural fixes)

**AgentFail fit:** Excellent. This is the canonical prompt-injection-to-RCE case in enterprise agent frameworks. The Nuka-AI bypass saga adds a secondary failure mode story: vendor dismissal of legitimate security findings post-patch.

---

## Open Questions

1. **What exactly does the May 7 blog post say beyond what's reconstructed from secondary sources?** The JavaScript-rendered page couldn't be fetched directly. Secondary sources confirm the core content but the blog may contain additional attack chain details or mitigation guidance not captured here.

2. **Nuka-AI bypass CVE status:** Is there now a CVE assigned for the six bypass vectors, or does Microsoft continue to treat them as out-of-scope? Check MSRC or NVD as of late April/May 2026.

3. **Agent Framework 1.0 and the architectural "trust gap":** Has Microsoft addressed the `AutoInvokeKernelFunctions` architecture in a way that prevents prompt injection from reaching privileged tool calls? Or only surface-level filter patches?

4. **Copilot Studio / M365 Copilot exposure:** Is there a separate advisory for Copilot Studio products that embed SK? Microsoft has not (per available sources) disclosed whether customer-facing Copilot products were assessed for these vulnerabilities.

5. **Azure AI Foundry production deployments:** Were any production Azure AI Foundry deployments running InMemoryVectorStore in a configuration reachable by external prompt injection? No data available.

6. **Version conflict (1.70.0 vs 1.71.0):** Some sources say the .NET fix is in 1.70.0, others say 1.71.0. The GitHub GHSA advisory is authoritative here — it says 1.71.0. Should verify against the actual NuGet package changelog.

7. **Java SDK exposure:** Semantic Kernel also has a Java SDK. Neither CVE mentions Java. Was it assessed?

---

## Sources

### Primary
- [Microsoft Security Blog — "When prompts become shells: RCE vulnerabilities in AI agent frameworks" (2026-05-07)](https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/) — JavaScript-rendered, content confirmed via secondary sources
- [NVD — CVE-2026-25592](https://nvd.nist.gov/vuln/detail/CVE-2026-25592)
- [NVD — CVE-2026-26030](https://nvd.nist.gov/vuln/detail/cve-2026-26030)
- [GitHub Security Advisory GHSA-2ww3-72rp-wpp4 (CVE-2026-25592)](https://github.com/microsoft/semantic-kernel/security/advisories/GHSA-2ww3-72rp-wpp4)
- [GitHub Security Advisory GHSA-xjw9-4gw8-4rqx (CVE-2026-26030)](https://github.com/microsoft/semantic-kernel/security/advisories/GHSA-xjw9-4gw8-4rqx)
- [GitHub PR #13505 — CVE-2026-26030 fix merged 2026-02-10](https://github.com/microsoft/semantic-kernel/pull/13505)

### CVE Detail / Vulnerability Databases
- [SentinelOne Vulnerability Database — CVE-2026-25592](https://www.sentinelone.com/vulnerability-database/cve-2026-25592/)
- [GitLab Advisory Database — CVE-2026-26030](https://advisories.gitlab.com/pkg/pypi/semantic-kernel/CVE-2026-26030/)
- [ThreatINT — CVE-2026-25592](https://cve.threatint.eu/CVE/CVE-2026-25592)
- [ThreatINT — CVE-2026-26030](https://cve.threatint.eu/CVE/CVE-2026-26030)

### Researcher Disclosures
- [Nuka-AI — "Microsoft's Semantic Kernel: The Cracked Kernel" (2026-07-28 post; April 25 disclosure)](https://nuka-ai.github.io/posts/2026-07-28-Semantic-Kernel-disclosure/) — Six patch bypass vectors, shadow patching critique
- [CVE-2026-25592 GitHub Gist — "The Agent Inside: Arbitrary File Write in Microsoft Semantic Kernel"](https://gist.github.com/alon710/52261fea2d6335abf9dd90d11344bc38)

### Enterprise and Context
- [WindowsNews — "CVE-2026-26030: Critical RCE in Microsoft Semantic Kernel Python SDK"](https://windowsnews.ai/article/cve-2026-26030-critical-rce-in-microsoft-semantic-kernel-python-sdk-exposes-ai-applications.404644)
- [OpenClawAI — March Patch Tuesday: Copilot Agent and CVE-2026-26030](https://openclawai.io/blog/march-2026-patch-tuesday-copilot-agent-cve)
- [Visual Studio Magazine — Microsoft Ships Agent Framework 1.0 (2026-04-06)](https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx)
- [SANS At-Risk Newsletter Vol. XXVI No. 10 (March 12, 2026)](https://www.sans.org/newsletters/at-risk/xxvi-10)
