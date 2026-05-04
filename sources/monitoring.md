# Incident Monitoring Sources

Where to find new AI agent incidents. Check these regularly. When something looks relevant, run it through the analysis pipeline.

---

## Google Alerts

Set up the following alerts at alerts.google.com. Delivery: daily digest.

### High Signal Queries
- `"AI agent" incident`
- `"AI agent" breach`
- `"AI agent" data leak`
- `LLM agent failure`
- `"autonomous agent" security`
- `"prompt injection" site attack`
- `MCP server exploit`
- `"tool use" AI incident`

### Medium Signal (more noise, worth scanning)
- `ChatGPT incident`
- `Claude agent`
- `Copilot security`
- `AI chatbot data`
- `"AI assistant" breach`
- `"generative AI" incident`

---

## Reddit

Saved searches and subreddits to monitor:

### Subreddits
- r/MachineLearning — Academic and industry incidents
- r/artificial — General AI news including failures
- r/ChatGPT — User-reported ChatGPT issues
- r/LocalLLaMA — Open-source model incidents
- r/ClaudeAI — Claude-specific incidents
- r/netsec — AI security research and disclosures
- r/hacking — AI-related security research
- r/AIAssistants — Broad AI assistant incidents

### Search Terms (search within subreddits)
- `agent fail`
- `agent security`
- `AI breach`
- `prompt injection`
- `jailbreak real world`
- `AI deleted`

---

## Hacker News

Monitor via:
- Keyword alerts: `hn.algolia.com` with queries: "AI agent incident", "LLM breach", "prompt injection attack"
- RSS: `hnrss.org/newest?q=AI+agent+security`
- `news.ycombinator.com/ask` — practitioners often report real incidents here before formal disclosure

---

## Security Research Blogs

| Source | Focus | URL |
|--------|-------|-----|
| Barrack AI Blog | AI app data breaches | barrack.ai/blog |
| Zenity Blog | Enterprise AI agent security | zenity.io/blog |
| HiddenLayer | ML security research | hiddenlayer.ai/research |
| Adversa AI | AI red teaming | adversa.ai/blog |
| MITRE ATLAS | New technique additions | atlas.mitre.org |
| Simon Willison | LLM security commentary | simonwillison.net |
| Embrace The Red | AI security experiments | embracethered.com |

---

## Incident Databases (Filter for Agent-Specific)

Check these periodically and filter for incidents involving autonomous agents or tool-using AI:

| Database | URL | How to Filter |
|----------|-----|---------------|
| AI Incident Database | incidentdatabase.ai | Search: "agent", "autonomous", "chatbot", "copilot" |
| AIAAIC Repository | aiaaic.org/aiaaic-repository | Filter by category, look for tool-using AI |
| OECD AI Incidents | oecd.ai/en/incidents | Browse by harm type |

---

## Twitter / X Accounts to Follow

High signal accounts for AI security incidents:

- @simonw (Simon Willison) — LLM security
- @llm_sec — AI/LLM security aggregator
- @greshake (Kai Greshake) — Prompt injection research
- @wunderwuzzi23 (Johann Rehberger) — AI red teaming
- @MarkRiedl — AI safety research
- @mmitchell_ai — AI ethics and safety
- @PromptArmor — AI security tooling

---

## Newsletters

| Newsletter | Focus |
|-----------|-------|
| AI Snake Oil | Critical AI analysis |
| Import AI (Jack Clark) | AI capabilities and risks |
| The Batch (deeplearning.ai) | AI news including incidents |
| Cybersecurity newsletters | Many cover AI-specific incidents |

---

## GitHub

Monitor for AI agent security disclosures:

- Watch: LangChain, AutoGen, CrewAI, LangGraph, Semantic Kernel repositories for security-tagged issues
- Search: `github.com/search?q=AI+agent+security+vulnerability&type=repositories`
- CVE database: Search for AI/ML framework CVEs

---

## Disclosure Channels

Some incidents come through formal disclosure:

- CVE database (cve.mitre.org) — Framework vulnerabilities
- HackerOne / Bugcrowd disclosed reports — AI company bug bounties
- Vendor security advisories — OpenAI, Anthropic, Microsoft, Google

---

## Triage Criteria

Not everything that surfaces is worth documenting. Qualify an incident if it meets **all** of:

1. **Real-world deployment** — Not a pure research demo or CTF challenge
2. **Autonomous agent involved** — Not a simple chatbot response issue
3. **Verifiable** — At least one credible source confirms the incident
4. **Meaningful impact** — At least Low severity by our framework

If borderline, add to `drafts/` with notes and revisit when more information emerges.
