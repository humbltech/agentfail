Search monitoring sources for new AI agent incidents and produce a triage candidate list.

Arguments: $ARGUMENTS

Parse the arguments to extract:
- **source filter**: one or more of `hn`, `reddit`, `github`, `security-blogs`, `aiid`, `aiaaic`, `twitter`, `all` (default: `all`)
- **time period**: natural language or shorthand like `30d`, `90d`, `6m`, `1y`, `past month`, `past year` (default: `30d`)

If no arguments are provided, search all sources for the past 30 days.

---

## Your Task

Search the specified monitoring sources for AI agent incidents published within the time period. Your goal is **triage only** — find incidents, verify they qualify, and document them at a high level. Do NOT do deep research. Do NOT fetch every link. Move fast.

### Sources to Search (apply source filter)

**hn** — Hacker News  
Search: `site:news.ycombinator.com "AI agent" incident` and `site:news.ycombinator.com LLM agent fail` and `site:news.ycombinator.com prompt injection attack`. Also search: `hn.algolia.com` queries for `AI agent incident`, `LLM breach`, `agent deleted`, `prompt injection`.

**reddit**  
Search for posts in: r/MachineLearning, r/artificial, r/ChatGPT, r/LocalLLaMA, r/ClaudeAI, r/netsec, r/AIAssistants  
Search terms: `AI agent fail`, `agent security incident`, `AI deleted`, `prompt injection`, `jailbreak real world`, `LLM breach`

**github**  
Search GitHub issues with: `AI agent security vulnerability`, `LLM agent unintended`, `agent data leak`, `prompt injection exploit`  
Focus repositories: LangChain, AutoGen, CrewAI, LangGraph, Semantic Kernel, Anthropic SDK

**security-blogs**  
Search/fetch recent posts from: simonwillison.net, embracethered.com, hiddenlayer.ai/research, adversa.ai/blog, zenity.io/blog, barrack.ai/blog  
Look for posts about AI agent failures, prompt injection, agent security incidents

**aiid**  
Search incidentdatabase.ai for recent entries — filter for autonomous agents, tool-using AI, chatbot incidents with real-world harm

**aiaaic**  
Search aiaaic.org/aiaaic-repository for recent additions involving AI agents or autonomous systems

**twitter**  
Search recent posts from: @simonw, @llm_sec, @greshake, @wunderwuzzi23, @PromptArmor  
Search Twitter/X for: `"AI agent" incident`, `"prompt injection" real`, `LLM agent fail`, `AI deleted production`

---

## Triage Criteria

For each result you find, check all four criteria. Discard if ANY fail:

1. **Real-world deployment** — Must be a production system, not a research demo, CTF challenge, or controlled experiment
2. **Autonomous agent involved** — Must involve an AI agent acting autonomously (not just a chatbot giving a bad answer)
3. **Verifiable** — At least one credible source (news article, GitHub issue, vendor disclosure, firsthand account with details)
4. **Meaningful impact** — At least some real-world consequence (financial loss, data exposure, system damage, reputational harm)

---

## Deduplication

Before including a candidate, check the existing published incidents in the `incidents/` folder and the draft in `drafts/`. If an incident is already documented (same event, same timeframe), skip it.

---

## Output Format

For each qualifying incident, produce an entry in this format:

```
### [Incident Title — be specific, not generic]

**Date:** YYYY-MM-DD (when it occurred or was reported)
**Primary URL:** [most authoritative source]
**Secondary URLs:** [additional coverage, if any]
**Summary:** 2-3 sentences. What happened, what agent was involved, what the impact was.
**Why it qualifies:** One sentence explaining which triage criteria it meets.
**Rough category:** [from: Unauthorized Data Access | Hallucinated Actions | Tool Misuse | Prompt Injection | Context Poisoning | Autonomous Escalation | Financial Loss | Infrastructure Damage | Privacy Violation | Supply Chain | Social Engineering | Model Attack | Denial of Service]
**Rough severity:** [Critical / High / Medium / Low] — one phrase justification
**Related to existing:** [AAGF-ID if this seems connected to an existing incident, otherwise "none"]
```

---

## Save Output

Save the candidate list to: `drafts/candidates-YYYY-MM-DD.md` (use today's date)

Include at the top:
- Search date
- Sources searched
- Time period covered
- Total candidates found

At the bottom, include a brief **Search Notes** section: what sources returned good signal, what searches were noisy, any sources that were inaccessible.

---

## Final Report to User

After saving the file, tell the user:
- How many candidates were found
- The filename saved
- The 1-2 highest-priority incidents (by severity or novelty)
- Any sources that couldn't be searched
- Command to run the pipeline on any candidate: `/run-pipeline [URL]`
