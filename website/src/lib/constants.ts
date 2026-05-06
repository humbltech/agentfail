import type { Severity, FrameworkRefs } from "./content/types";

// ─── Severity display tokens ──────────────────────────────────────────────────

/**
 * Maps each Severity level to CSS custom property references.
 * The actual color values are defined in globals.css as CSS variables.
 */
export const SEVERITY_COLORS: Record<Severity, { text: string; bg: string }> = {
  Critical: {
    text: "var(--severity-critical)",
    bg: "var(--severity-critical-bg)",
  },
  High: {
    text: "var(--severity-high)",
    bg: "var(--severity-high-bg)",
  },
  Medium: {
    text: "var(--severity-medium)",
    bg: "var(--severity-medium-bg)",
  },
  Low: {
    text: "var(--severity-low)",
    bg: "var(--severity-low-bg)",
  },
} satisfies Record<Severity, { text: string; bg: string }>;

// ─── Category slug map ────────────────────────────────────────────────────────
// Keys must exactly match the strings used in incident frontmatter `category` arrays.

export const CATEGORY_SLUGS: Record<string, string> = {
  "Financial loss (unauthorized transactions, billing errors)": "financial-loss",
  "Hallucinated actions": "hallucinated-actions",
  "Tool misuse / unintended tool execution": "tool-misuse",
  "Prompt injection / jailbreak exploitation": "prompt-injection",
  "Context poisoning": "context-poisoning",
  "Autonomous escalation (exceeded intended scope)": "autonomous-escalation",
  "Infrastructure damage": "infrastructure-damage",
  "Privacy violation": "privacy-violation",
  "Supply chain compromise": "supply-chain",
  "Social engineering via AI": "social-engineering",
  "Model / training data attack": "model-attack",
  "Denial of service / resource exhaustion": "denial-of-service",
  // Variant forms observed in actual incident files
  "Infrastructure damage (indirectly — billing infrastructure integrity)": "infrastructure-damage",
  "Context poisoning (user-controlled input affecting system-level classification)": "context-poisoning",
  "Hallucinated actions (confident false output treated as factual by user)": "hallucinated-actions",
};

// ─── Agent type slug map ──────────────────────────────────────────────────────
// Keys must exactly match the strings used in incident frontmatter `agent_type` arrays.

export const AGENT_TYPE_SLUGS: Record<string, string> = {
  "Coding assistants (Copilot, Claude Code, Cursor, Devin)": "coding-assistants",
  // Variant form observed in actual incident files
  "Coding assistants (Claude Code)": "coding-assistants",
  "Customer service bots": "customer-service",
  "Autonomous research agents": "research-agents",
  "Task automation agents": "task-automation",
  "Multi-agent systems": "multi-agent",
  // Variant form observed in actual incident files
  "Multi-agent systems (parent + subagent architecture)": "multi-agent",
  "RAG-augmented agents": "rag-agents",
  "Tool-using agents (MCP / function calling)": "tool-using-agents",
  // Variant form observed in actual incident files
  "Tool-using agents (Agent tool spawning)": "tool-using-agents",
  "Memory-persistent agents": "memory-persistent",
  "Email/calendar agents": "email-calendar",
  "Financial agents": "financial-agents",
  "Embodied agents / robotics": "embodied-robotics",
  "Browser/web agents": "browser-agents",
};

// ─── Framework reference URL builders ────────────────────────────────────────

export const FRAMEWORK_URLS: Record<keyof FrameworkRefs, (id: string) => string> = {
  mitre_atlas: (id) => `https://atlas.mitre.org/techniques/${id}`,
  owasp_llm: (id) =>
    `https://genai.owasp.org/llmrisk/${id.toLowerCase().replace(":", "-")}`,
  owasp_agentic: (id) =>
    `https://genai.owasp.org/agentic/${id.toLowerCase().replace(":", "-")}`,
  ttps_ai: (id) => `https://ttps.ai/techniques/${id}`,
};

// ─── Site metadata ────────────────────────────────────────────────────────────

export const SITE_META = {
  name: "AgentFail",
  description:
    "A curated database of real-world AI agent incidents — root cause analyzed, operator actionable.",
  url: "https://agentfail.org",
} as const;
