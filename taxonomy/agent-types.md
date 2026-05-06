# Agent Type Taxonomy

Used to classify what kind of AI agent was involved in the incident. Understanding which agent architectures are most vulnerable is one of AgentFail's core analytical contributions.

---

## Agent Types

### Coding Assistant
AI agents that write, edit, review, or execute code on behalf of developers.

**Products:** GitHub Copilot, Claude Code, Cursor, Devin, Replit Agent, Windsurf, Aider
**Key risks:** File system access, shell execution, git operations, secret exposure, unintended code changes

---

### Customer Service Bot
AI agents deployed to handle customer inquiries, support tickets, or sales interactions.

**Products:** Intercom AI, Zendesk AI, custom chatbots, voice bots
**Key risks:** Data leakage between customers, social engineering, unauthorized refunds/actions, impersonation

---

### Autonomous Research Agent
AI agents that browse the web, gather information, synthesize research, and produce reports with minimal human oversight.

**Products:** Perplexity, custom research pipelines, Auto-GPT derivatives, deep research modes
**Key risks:** Prompt injection from web content, hallucinated citations, distributing misinformation

---

### Task Automation Agent
AI agents embedded in workflow automation platforms that execute multi-step business processes.

**Products:** Zapier AI, Make (Integromat), Microsoft Power Automate AI, n8n AI nodes
**Key risks:** Chain-reaction failures, unauthorized API calls, financial transactions, data exposure across integrations

---

### Multi-Agent System
Architectures where multiple AI agents communicate and delegate tasks to each other, often with one orchestrator and multiple sub-agents.

**Products:** AutoGen, CrewAI, LangGraph, custom orchestration
**Key risks:** Trust propagation between agents, emergent behavior, one compromised agent affecting all, amplified scope

---

### RAG Agent
Agents that retrieve context from a knowledge base (vector database, document store) to augment their responses.

**Products:** Any agent with Pinecone, Weaviate, Qdrant, pgvector integration
**Key risks:** Knowledge base poisoning, data leakage between tenants, retrieval manipulation, stale dangerous information

---

### Tool-Using Agent
Agents that can invoke external tools, APIs, and services via structured function calls or MCP servers.

**Products:** Any agent using OpenAI function calling, Anthropic tool use, MCP protocol
**Key risks:** Tool misuse, prompt injection via tool outputs, unauthorized API calls, capability escalation

---

### Memory-Persistent Agent
Agents with long-term memory that persists across sessions, allowing them to learn and adapt over time.

**Products:** MemGPT, agents with external memory stores, custom memory architectures
**Key risks:** Memory poisoning, privacy accumulation, behavioral drift, cross-user memory leakage

---

### Email Agent
Agents with access to email, calendar, and communication tools — often with send/write privileges.

**Products:** Microsoft Copilot for Outlook, Google Workspace AI, custom email agents
**Key risks:** Prompt injection via email, unauthorized sends, data exfiltration via email, impersonation

---

### Financial Agent
Agents with access to financial accounts, payment systems, or trading platforms.

**Products:** AI-powered expense management, trading bots, accounting AI, bill-pay automation
**Key risks:** Unauthorized transactions, financial manipulation, compliance violations

---

### Embodied Agent
AI agents that control physical hardware — robots, autonomous vehicles, drones, or industrial systems.

**Products:** Autonomous vehicles, warehouse robots, drone systems, industrial AI controllers
**Key risks:** Physical safety, property damage, irreversible real-world actions

---

### Browser Agent
Agents that control a web browser to automate tasks — filling forms, clicking buttons, navigating sites.

**Products:** Operator (OpenAI), Computer Use (Anthropic), custom Playwright/Selenium agents
**Key risks:** CSRF-like attacks, credential theft, unauthorized form submissions, data exfiltration via web

---

## Tagging Guidelines

- Tag with the **primary agent type** involved
- If an incident involves multiple agent types (e.g., a coding assistant with email access), tag all relevant types
- If the product doesn't fit cleanly into a category, use the closest match and note in `researcher_notes`

## Valid Values (use exactly as written)

```
Coding Assistant
Customer Service Bot
Autonomous Research Agent
Task Automation Agent
Multi-Agent System
RAG Agent
Tool-Using Agent
Memory-Persistent Agent
Email Agent
Financial Agent
Embodied Agent
Browser Agent
```
