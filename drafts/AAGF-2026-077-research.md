# AAGF-2026-077 Stage 1 Research
## Spring AI Five-CVE Batch: Cross-Tenant Memory Exfiltration and Vector Store Injection (April 2026)

**Researched:** 2026-05-08  
**Researcher:** Stage 1 automated research pass

---

## Executive Summary

This incident covers two temporally overlapping but **distinct** Spring AI vulnerability disclosures in March–April 2026, together affecting Spring AI 1.0.x and 1.1.x:

1. **CVE-2026-22738** — Critical SpEL injection in SimpleVectorStore, RCE. Disclosed **March 27, 2026**. Fixed in 1.0.5 / 1.1.4. CVSS 9.8. A public PoC exists. A TryHackMe room was built around it. Italy's ACN flagged it for immediate patching.

2. **Five-CVE batch** — Disclosed **April 27–28, 2026**. Fixed in 1.0.6 / 1.1.5. Covers cross-tenant memory exfiltration (CVSS 5.9), vector store filter injection (CVSS 8.6), CosmosDB SQL injection (CVSS 8.8), ONNX model cache tampering (CVSS 6.1), and PDF OOM DoS (CVSS 6.5). The ACN advisory covered **8 total Spring vulnerabilities** patched across both disclosure rounds.

No confirmed exploitation in the wild for any CVE as of the research date.

**Recommendation on split vs. single incident:** These should be **one incident** framed as a systemic failure in Spring AI's agentic security posture — a critical RCE in March followed by five more vulns in April reveals a platform whose AI-specific security primitives (vector stores, conversation memory, filter expressions) were not designed with adversarial inputs in mind. The story is about the class of failure, not individual CVEs.

---

## CVE-2026-22738 — Clarification (SEPARATE, Earlier Disclosure)

**Status:** This is definitively NOT part of the April 27 five-CVE batch. It is a separate disclosure from March 27, 2026 — exactly one month earlier.

| Field | Detail |
|---|---|
| CVE | CVE-2026-22738 |
| GHSA | GHSA-fvh3-672c-7p6c |
| Severity | **CRITICAL — CVSS 9.8** |
| CVSS Vector | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| CWE | CWE-94 (Code Injection), CWE-917 (Expression Language Injection) |
| Component | `SimpleVectorStore` |
| Mechanism | SpEL injection via unescaped filter expression key |
| Vulnerable Versions | 1.0.0–1.0.4, 1.1.0-M1–1.1.3 |
| Fixed In | 1.0.5, 1.1.4 |
| Disclosed | March 27, 2026 |
| Last Modified | April 16, 2026 (NVD) |
| Tenable Detection | March 30, 2026 |
| EPSS | 0.071% (16th percentile — low current probability of exploitation) |
| Public PoC | Yes: `https://github.com/n0n4m3x41/CVE-2026-22738-POC` |
| TryHackMe room | Yes — multiple public walkthroughs exist |
| Wild exploitation | Not confirmed |
| CNA | VMware |

**Technical mechanism:** Spring AI's `SimpleVectorStore` evaluates filter expressions using SpEL's `StandardEvaluationContext`, which provides unrestricted JVM access (unlike the safer `SimpleEvaluationContext`). When application code passes user-supplied input as a filter expression key, the key is concatenated directly into the expression string without sanitization:

```
"#metadata['" + filterKey + "'] == '" + filterValue + "'"
```

An attacker injects SpEL payloads via the `filterKey` parameter:

```
'] + T(java.lang.Runtime).getRuntime().exec('id') + #metadata['
```

The `T()` operator resolves arbitrary Java classes at runtime, enabling full OS command execution. A three-stage attack framework (verify → blind probe → reverse shell) is documented in public write-ups. A listener script with `--lhost`/`--lport`/`--exploit`/`--target` flags establishes reverse shell access.

**Attack prerequisites:** Network access to an exposed Spring AI search endpoint. No credentials required. No user interaction.

**Italy ACN context:** Italy's Agenzia per la Cybersicurezza Nazionale (ACN) published an advisory covering 8 total Spring vulnerabilities across the March and April disclosure rounds. CVE-2026-22738 was flagged as the critical finding requiring immediate patching.

---

## Five-CVE Batch (April 27–28, 2026)

All five were published to NVD on April 28, 2026 (the Spring blog announced on April 27). All fixed in 1.0.6 and 1.1.5. Spring AI 2.0.0-M5 is also mentioned as containing fixes.

---

### CVE-2026-40966 — Cross-Tenant Memory Exfiltration (DEEP DIVE)

| Field | Detail |
|---|---|
| CVE | CVE-2026-40966 |
| Severity | **MEDIUM — CVSS 5.9** |
| CVSS Vector | `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N` |
| CWE | CWE-284 (Improper Access Control) |
| Component | `VectorStoreChatMemoryAdvisor` |
| Vulnerable Versions | 1.0.0–1.0.5, 1.1.0–1.1.4 |
| Fixed In | 1.0.6, 1.1.5 |
| Published | April 28, 2026 |
| Discoverer | Jinyeong Seol (Cantina's AppSec agent, Apex) |
| Wild exploitation | Not confirmed |

**Technical mechanism (deep dive):**

`VectorStoreChatMemoryAdvisor` is Spring AI's mechanism for giving agents persistent conversational memory stored in a vector database. When a user's message comes in, the advisor queries the vector store for past messages associated with the user's `conversationId`, retrieves them, and injects them into the prompt as context.

The flaw: `conversationId` values are interpolated directly into vector store filter expressions **without isolation or sanitization**. An attacker who can supply their own `conversationId` value can inject filter logic that broadens (or redirects) the filter expression, causing the advisor to fetch chat history from *other users' conversations* — bypassing the assumed per-conversation isolation.

NVD description: "An attacker can bypass conversation isolation and exfiltrate sensitive memory from other users' chat histories, including secrets and credentials, by injecting filter logic through conversationId."

**Why this is an AI-specific failure, not a generic injection:**

- The isolation model is implicit, not enforced by a security boundary. The framework *assumed* that conversationId uniquely scopes memory retrieval. There is no access control check — isolation is purely positional (the filter expression happens to use the conversationId value).
- What gets exfiltrated is *agent memory*: raw user messages, LLM responses, and any secrets or credentials a user typed into prior sessions (API keys, passwords, PII entered into chat).
- In multi-tenant agentic deployments (e.g., a SaaS AI assistant serving multiple tenants), Tenant A can read Tenant B's entire conversation history.

**CVSS notes:** Attack Complexity is High (AC:H) because "the attacker has to know enough about the structure of the stored memory to craft an effective injection" — they must be able to predict or enumerate other users' conversationId values or understand the filter schema. The confidentiality impact is High despite the medium overall score.

**Why this matters for AgentFail:** This is a textbook agentic memory isolation failure. The agent's *memory store* — one of the defining features of stateful AI agents — becomes a data exfiltration channel. It's a direct consequence of treating a user-controlled identifier as a trusted security boundary.

---

### CVE-2026-40967 — Vector Store Filter Expression Injection

| Field | Detail |
|---|---|
| CVE | CVE-2026-40967 |
| Severity | **HIGH — CVSS 8.6** |
| CVSS Vector | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:L` |
| CWE | CWE-94 (Code Injection) |
| Component | `FilterExpressionConverter` implementations (multiple) |
| Mechanism | Unescaped keys/values in filter-to-query-language translation |
| Vulnerable Versions | 1.0.0–1.0.5, 1.1.0–1.1.4 |
| Fixed In | 1.0.6, 1.1.5 |
| Published | April 28, 2026 |

**Technical mechanism:** Multiple `FilterExpressionConverter` implementations translate Spring AI's `FilterExpression` abstraction into backend-specific vector store query languages (Pinecone, Weaviate, Milvus, etc.). Keys and values from the filter expression are interpolated into target query strings without proper escaping. An unauthenticated attacker who can supply input through a `filterExpression` API call can alter query structure, potentially reading unauthorized records from the vector store.

**Relationship to CVE-2026-22738:** This is the generalized injection pattern. CVE-2026-22738 is a specific instance of the same root cause (unescaped user input in expression/query construction) in `SimpleVectorStore`; CVE-2026-40967 affects the `FilterExpressionConverter` layer across all vector store backends. Two rounds of patches — March and April — to fix the same category of vulnerability in different components.

---

### CVE-2026-40978 — CosmosDB SQL Injection via Document IDs

| Field | Detail |
|---|---|
| CVE | CVE-2026-40978 |
| Severity | **HIGH — CVSS 8.8** |
| CVSS Vector | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` |
| CWE | CWE-89 (SQL Injection) |
| Component | `CosmosDBVectorStore.doDelete()` |
| Mechanism | Document IDs interpolated directly into SQL queries |
| Vulnerable Versions | 1.0.0–1.0.5, 1.1.0–1.1.4 |
| Fixed In | 1.0.6, 1.1.5 |
| Published | April 28, 2026 |

**Is this AI-specific or generic SQL injection?**

It is SQL injection in an AI-specific database adapter. `CosmosDBVectorStore` is Spring AI's adapter for Azure Cosmos DB as a vector store backend. The `doDelete()` method, which handles deletion of vector store documents (e.g., clearing agent memory or knowledge base entries), constructs SQL queries using document IDs supplied by calling code — without parameterization or sanitization. An authenticated attacker (PR:L — Low Privileges required) who can control document IDs routed to delete operations can execute arbitrary SQL.

The AI-specific angle: vector store document deletion is a routine agentic operation (clearing stale memory, removing knowledge base entries). The attack surface is baked into normal agent lifecycle operations, not just adversarial inputs.

---

### CVE-2026-40979 — ONNX Model Cache Tampering

| Field | Detail |
|---|---|
| CVE | CVE-2026-40979 |
| Severity | **MEDIUM — CVSS 6.1** |
| CVSS Vector | `CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:N` |
| CWE | CWE-377 (Insecure Temporary File) |
| Component | `TransformersEmbeddingModel` (ONNX model cache) |
| Mechanism | World-writable `/tmp` with predictable path for cached ONNX models |
| Vulnerable Versions | 1.0.0–1.0.5, 1.1.0–1.1.4 |
| Fixed In | 1.0.6, 1.1.5 |
| Published | April 28, 2026 |

**Scope limitation:** This is a local-only attack (AV:L). Only affects shared hosting or multi-tenant Linux environments where multiple local users share the same system. Isolated container deployments (Kubernetes pods with one process per container) are not affected. In cloud-native deployments, the typical threat model is a compromised co-tenant on a shared host.

**Impact:** A local attacker can read cached ONNX models (C:L — Low confidentiality: model architecture/weights exposed) or **replace** the model with a malicious variant (I:H — High integrity: arbitrary model substitution, potentially backdoored embeddings). A backdoored embedding model is a supply-chain style attack: agents using the tampered model would generate subtly compromised embeddings across all subsequent operations.

---

### CVE-2026-40980 — PDF Parser Resource Exhaustion (OOM DoS)

| Field | Detail |
|---|---|
| CVE | CVE-2026-40980 |
| Severity | **MEDIUM — CVSS 6.5** |
| CVSS Vector | `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H` |
| CWE | CWE-400 (Uncontrolled Resource Consumption) |
| Component | `ForkPDFLayoutTextStripper` |
| Mechanism | Malicious PDF triggers unbounded memory allocation, JVM heap exhaustion |
| Vulnerable Versions | 1.0.0–1.0.5, 1.1.0–1.1.4 |
| Fixed In | 1.0.6, 1.1.5 |
| Published | April 28, 2026 |

**Context:** PDF ingestion is a primary use case for RAG-based agents (document Q&A, knowledge base construction). Agents that accept user-supplied documents as part of RAG ingestion pipelines inherit this DoS surface directly.

---

## Spring AI Market Position and Deployment Context

Spring AI reached production-grade 1.0 GA in May 2025, with Spring AI 1.1 released November 2025. It is positioned as the primary AI integration framework for the Java/Spring Boot ecosystem — the Java equivalent of LangChain (Python) for enterprise AI.

**Key adoption context:**
- Spring Boot is used by an estimated 60–70% of Java enterprise applications. Spring AI is the path-of-least-resistance AI extension for existing Spring Boot deployments.
- Spring AI 1.1 added full Model Context Protocol (MCP) integration, making it the dominant Java framework for building production MCP-compatible agents.
- Primary production use cases: RAG pipelines, stateful multi-turn customer support agents, knowledge base Q&A, internal search, developer productivity tools.
- Supports 20+ AI model providers (OpenAI, Anthropic, Bedrock, Google, Ollama, etc.) and all major vector stores (PGVector, Pinecone, Weaviate, Milvus, Chroma, CosmosDB, OpenSearch).
- Spring Boot 3.5 EOL: June 30, 2026 (six weeks after the April disclosures). Spring AI 1.0 and 1.1 both target Spring Boot 3.5, creating additional upgrade pressure.
- Java Code Geeks article (March 2026): Spring AI 1.1 described as "the most significant milestone for AI on the JVM" for enterprise agent development.

**No specific download or install count was obtainable from open sources.** However, given Spring Boot's market penetration and Spring AI's positioning as the canonical Java AI framework, the exposure surface is large and concentrated in enterprise Java shops (finance, insurance, healthcare, government) — precisely the environments where multi-tenant AI agent deployments are being built.

---

## Vendor Response and Patch Status

**Spring (VMware/Broadcom):**
- CVE-2026-22738 (March 27): Fixed in 1.0.5 / 1.1.4. Response time: patch available same day as disclosure.
- April 27 five-CVE batch: Fixed in 1.0.6 / 1.1.5 / 2.0.0-M5. Spring's blog post announced the release on April 27, 2026.
- All CVEs were managed via VMware as CNA (CVE Numbering Authority).
- No known incomplete patches. Each fix targets the specific unescaped interpolation or access control gap.

**Third-party response:**
- Tenable detection plugin available March 30, 2026 (3 days after CVE-2026-22738 disclosure).
- Endor Labs, Threatint, OpenCVE all tracking.
- Italy ACN published an official patching advisory for all 8 Spring vulnerabilities.
- Public PoC exists for CVE-2026-22738 (GitHub: `n0n4m3x41/CVE-2026-22738-POC`).
- TryHackMe published a room on CVE-2026-22738, with multiple public writeups from April 2026.
- Positive Technologies / PTSecurity tracking CVE-2026-40966.

**Exploitation status:** No confirmed exploitation in the wild for any CVE as of the research date (2026-05-08). EPSS for CVE-2026-22738 is 0.071% — low current exploitation probability despite critical severity and public PoC.

---

## Key Questions — Answers

**1. Is CVE-2026-22738 part of the April 27 five-CVE batch, or a separate disclosure?**

**Separate — disclosed one month earlier.** CVE-2026-22738 was published March 27, 2026 and fixed in 1.0.5 / 1.1.4. The five-CVE batch was published April 28, 2026 and fixed in 1.0.6 / 1.1.5. Two distinct disclosure events, two distinct patch rounds. The ACN advisory (dated April 24, 2026) flagged 8 total Spring vulnerabilities — it appears to have referenced CVE-2026-22738 retroactively alongside the incoming April batch, creating confusion about a shared announcement date.

**2. Which CVEs are most significant for autonomous AI agents?**

In order of agent-specific relevance:

1. **CVE-2026-40966** (CVSS 5.9): Most agent-specific. Direct breach of multi-tenant memory isolation — the agent's conversational memory store becomes a cross-tenant exfiltration channel. Affects any multi-tenant deployment using `VectorStoreChatMemoryAdvisor`.

2. **CVE-2026-22738** (CVSS 9.8): Most severe overall. RCE from vector store query interface. An agent exposing a search/RAG endpoint becomes an unauthenticated RCE surface.

3. **CVE-2026-40967** (CVSS 8.6): Unauthenticated vector store query manipulation across all backends. Agents using filter expressions on vector queries are affected.

4. **CVE-2026-40978** (CVSS 8.8): SQL injection via agentic memory deletion operations.

5. **CVE-2026-40979** (CVSS 6.1): Local-only model tampering — lower agentic relevance in containerized deployments.

6. **CVE-2026-40980** (CVSS 6.5): DoS via document ingestion — relevant for RAG agents accepting user PDFs.

**3. Is CVE-2026-40966 confirmed exploitable in real Spring AI agent deployments?**

Theoretically yes, practically unconfirmed in the wild. The mechanism is technically straightforward — conversation ID injection into an unguarded filter expression — but requires the attacker to (a) reach the conversationId parameter and (b) have knowledge of the filter schema or other users' conversation IDs. The CVSS AC:H rating reflects this partial-control requirement. No real-world exploitation report has surfaced.

**4. Has there been any confirmed exploitation in the wild?**

No confirmed wild exploitation for any of the six CVEs as of 2026-05-08. CVE-2026-22738 has a public PoC and a TryHackMe room, making it likely exploited in CTF contexts — no production incident reported.

---

## One Incident or Two?

**Recommendation: One incident, possibly with a note flagging that CVE-2026-22738 is a precursor.**

**Rationale:** The narrative arc — a March critical RCE in a vector store component (SimpleVectorStore), followed by a five-CVE April sweep finding injection and isolation failures across vector store, memory advisor, CosmosDB adapter, ONNX cache, and PDF parser — tells a single systemic story: Spring AI's AI-specific components were built without adversarial input assumptions. The pattern is the story, not the individual CVEs.

Possible framing: "One month after patching a critical RCE in its vector search interface, Spring AI disclosed five additional vulnerabilities in April 2026, including a direct multi-tenant memory exfiltration flaw in its conversation memory advisor — suggesting the March patch addressed a symptom while the underlying pattern (unescaped user input in AI-specific query construction) remained across the codebase."

If editorial preference is to keep one incident per disclosure event, split into:
- AAGF-2026-077: CVE-2026-22738 (March 27, RCE, CVSS 9.8) — "Spring AI SimpleVectorStore SpEL Injection: Vector Search to Remote Code Execution"
- AAGF-2026-078: Five-CVE batch (April 27) — "Spring AI Cross-Tenant Memory Exfiltration and Vector Store Injection (Five-CVE Batch)"

---

## Sources

- HeroDevs five-CVE roundup: https://www.herodevs.com/blog-posts/5-spring-ai-cves-disclosed-april-27-2026-roundup-and-eol-risk
- NVD CVE-2026-22738: https://nvd.nist.gov/vuln/detail/CVE-2026-22738
- NVD CVE-2026-40966: https://nvd.nist.gov/vuln/detail/CVE-2026-40966
- NVD CVE-2026-40967: https://nvd.nist.gov/vuln/detail/CVE-2026-40967
- NVD CVE-2026-40978: https://nvd.nist.gov/vuln/detail/CVE-2026-40978
- NVD CVE-2026-40979: https://nvd.nist.gov/vuln/detail/CVE-2026-40979
- NVD CVE-2026-40980: https://nvd.nist.gov/vuln/detail/CVE-2026-40980
- GitHub Advisory GHSA-fvh3-672c-7p6c: https://github.com/advisories/GHSA-fvh3-672c-7p6c
- Resecurity exploit write-up (CVE-2026-22738): https://www.resecurity.com/blog/article/spring-ai-spel-injection-from-vector-search-to-remote-code-execution-cve-2026-22738
- Threatint CVE-2026-40966: https://cve.threatint.eu/CVE/CVE-2026-40966
- Tenable CVE-2026-22738: https://www.tenable.com/cve/CVE-2026-22738
- Spring AI 1.0.6/1.1.5 release: https://spring.io/blog/2026/04/27/spring-ai-1-0-6-1-1-5-2-0-0-M5-available-now/
- Spring AI production agents (context): https://javapro.io/2026/04/30/building-production-ready-ai-agents-with-java-and-spring-ai/
- ACN Italy / GovPing: https://changeflow.com/govping/data-privacy-cybersecurity/spring-patches-8-vulnerabilities-including-critical-arbitrar-2026-04-24
- GitLab advisory CVE-2026-22738: https://advisories.gitlab.com/pkg/maven/org.springframework.ai/spring-ai-vector-store/CVE-2026-22738/
- Java Code Geeks Spring AI market context: https://www.javacodegeeks.com/2026/03/choosing-a-java-llm-integration-strategy-in-2026-spring-ai-1-1-vs-langchain4j-vs-direct-api-calls.html
- Spring AI production agents (JAVAPRO): https://javapro.io/2026/04/30/building-production-ready-ai-agents-with-java-and-spring-ai/
