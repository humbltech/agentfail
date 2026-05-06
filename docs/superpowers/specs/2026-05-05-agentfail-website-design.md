# AgentFail Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public-facing Next.js 15 website for AgentFail that renders incident reports from markdown files with search, filtering, pattern groups, taxonomy pages, OG images, and structured data.

**Architecture:** Next.js 15 App Router in `website/` folder, reading markdown content from sibling directories (`../incidents/`, `../taxonomy/`, `../relationships/`) at build time via gray-matter + remark/rehype. All pages statically generated. Client-side search/filtering via Fuse.js with URL param persistence.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, gray-matter, unified/remark/rehype, Fuse.js, Vitest, Vercel (deployment TBD)

---

## UI/UX Design Specification

### Aesthetic Direction: "Intelligence Briefing"

Not a generic SaaS dashboard. Not a sterile government database. AgentFail should feel like an **editorial intelligence briefing** — the visual language of investigative journalism applied to security incident data. Think: The Economist meets a security operations center. Every page should feel like opening a classified dossier.

**One thing someone will remember:** The headline stats. "$6,000 in 26 hours." "9 seconds to delete production DB." These numbers are the hook — they should be the most visually prominent element on every card, every page. Make them impossible to ignore.

---

### Typography

**Display / Headlines:** `Instrument Serif` (Google Fonts)
- Editorial, investigative feel. Unusual for a tech/security site — that's the point.
- Used for: page titles, hero headline, incident titles on detail pages, pattern group names
- Weight: 400 (regular only — it's a display font)
- Sizing: Hero 64px/72px, H1 40px/48px, H2 28px/36px

**Body / UI:** `Geist Sans` (Vercel, bundled with Next.js)
- Clean, modern, excellent readability at small sizes. Pairs well with the serif display.
- Used for: all body text, navigation, buttons, labels, descriptions, sidebar content
- Weights: 400 (body), 500 (medium emphasis), 600 (strong emphasis), 700 (bold)
- Body size: 16px/24px, Small: 14px/20px, Caption: 12px/16px

**Monospace:** `Geist Mono` (Vercel)
- Used for: incident IDs (AAGF-2026-001), code blocks, technical data, damage speed, framework reference IDs
- Weight: 400
- Size: 14px typically, matches body context

**Font loading:** Use `next/font/google` for Instrument Serif, `next/font/local` for Geist (ships with Next.js).

---

### Color System

```
Background layers (darkest → lightest):
  --bg-deep:    hsl(0, 0%, 3%)      #080808  — page background
  --bg-surface: hsl(0, 0%, 6%)      #0f0f0f  — card backgrounds
  --bg-raised:  hsl(0, 0%, 9%)      #171717  — hover states, active cards
  --bg-overlay: hsl(0, 0%, 12%)     #1f1f1f  — dropdowns, modals, tooltips

Borders:
  --border-subtle:  hsl(0, 0%, 12%)  #1f1f1f  — card borders, dividers
  --border-visible: hsl(0, 0%, 18%)  #2e2e2e  — input borders, focused elements

Text:
  --text-primary:   hsl(0, 0%, 93%)  #ededed  — headings, primary content
  --text-secondary: hsl(0, 0%, 63%)  #a1a1a1  — descriptions, meta text
  --text-muted:     hsl(0, 0%, 40%)  #666666  — timestamps, tertiary info

Accent (teal):
  --accent:         hsl(168, 76%, 40%)  #14b8a6  — links, active states, key data
  --accent-dim:     hsl(168, 40%, 20%)  #1a4a43  — accent backgrounds, subtle highlights
  --accent-bright:  hsl(168, 76%, 55%)  #2dd4bf  — hover states on accent elements

Severity (these are attention colors — must pop against dark bg):
  --severity-critical:  hsl(0, 84%, 60%)     #ef4444   red
  --severity-high:      hsl(25, 95%, 53%)    #f97316   orange
  --severity-medium:    hsl(48, 96%, 53%)    #eab308   yellow
  --severity-low:       hsl(142, 71%, 45%)   #22c55e   green

Severity backgrounds (for badges — 15% opacity of severity color):
  --severity-critical-bg:  hsla(0, 84%, 60%, 0.15)
  --severity-high-bg:      hsla(25, 95%, 53%, 0.15)
  --severity-medium-bg:    hsla(48, 96%, 53%, 0.15)
  --severity-low-bg:       hsla(142, 71%, 45%, 0.15)

Vendor response (status colors):
  --vendor-none:         hsl(0, 0%, 40%)    #666  — grey (no response)
  --vendor-acknowledged: hsl(48, 96%, 53%)  #eab  — yellow
  --vendor-fixed:        hsl(142, 71%, 45%) #22c  — green
  --vendor-disputed:     hsl(0, 84%, 60%)   #ef4  — red
  --vendor-refunded:     hsl(168, 76%, 40%) #14b  — teal
```

---

### Spatial System

**Grid:** 8px base unit. All spacing is multiples of 8.
```
--space-1:  4px   (half — only for tight inline gaps)
--space-2:  8px   (compact padding, icon gaps)
--space-3:  12px  (list item spacing)
--space-4:  16px  (card padding, section gaps)
--space-5:  24px  (between components)
--space-6:  32px  (section spacing)
--space-7:  48px  (major section breaks)
--space-8:  64px  (page-level spacing)
--space-9:  96px  (hero spacing)
```

**Max width:** 1280px content area. Wider for homepage hero (full bleed).
**Card border radius:** 8px (--radius-md). Badges: 4px (--radius-sm).

---

### Component Designs

#### Severity Badge
```
┌──────────┐
│ ● Critical │  — colored dot + text, colored bg at 15% opacity
└──────────┘
```
- Pill shape (border-radius: 4px)
- Colored dot (6px circle) before text
- Background: severity color at 15% opacity
- Text: severity color at full saturation
- Font: Geist Sans 12px/16px, weight 600, uppercase, letter-spacing 0.5px
- Padding: 4px 10px

#### Incident Card (for list pages, homepage)
```
┌─────────────────────────────────────────────────┐
│ ● High          Apr 2, 2026          AAGF-2026-001 │  ← severity badge, date (muted), ID (mono, muted)
│                                                     │
│ Claude Code /loop Command Runaway:                  │  ← title (Geist Sans 18px, semibold, --text-primary)
│ $6,000 Billing Explosion                            │     max 2 lines, ellipsis
│                                                     │
│ $6,000 in 26 hours                                  │  ← headline_stat (Instrument Serif 24px, --accent)
│                                                     │
│ Set a spending cap in your Anthropic account        │  ← operator_tldr (14px, --text-secondary)
│ before running any unattended /loop workflow.       │     max 2 lines
│                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────┐      │  ← category tags (compact pills)
│ │ Financial Loss│ │ Tool Misuse  │ │ +2 more  │      │
│ └─────────────┘ └─────────────┘ └──────────┘      │
│                                                     │
│ Platform: Anthropic Claude API    Vendor: No response│  ← meta row (12px, --text-muted)
└─────────────────────────────────────────────────────┘
```
- Background: --bg-surface
- Border: 1px --border-subtle
- Hover: border → --border-visible, bg → --bg-raised, subtle lift (translateY -1px)
- Padding: 24px
- The **headline_stat** is the visual anchor — Instrument Serif, teal accent, largest text on the card
- Category tags: small pills with --bg-overlay bg, --text-secondary text, max 2 visible + "+N more"
- Entire card is clickable (link wraps)

#### Key Facts Sidebar (incident detail page)
```
┌────────────────────────────┐
│  KEY FACTS                 │  ← label (12px, uppercase, letter-spacing 1px, --text-muted)
│                            │
│  Financial Impact          │  ← label (12px, --text-muted)
│  $6,000                    │  ← value (20px, Geist Mono, --text-primary)
│                            │
│  ─────────────────────     │  ← subtle divider (--border-subtle)
│                            │
│  Damage Speed              │
│  26 hours                  │  ← value (Geist Mono)
│                            │
│  ─────────────────────     │
│                            │
│  Recovery                  │
│  Unrecoverable             │  ← red text for "no" / "unrecoverable"
│                            │
│  ─────────────────────     │
│                            │
│  Vendor Response           │
│  ● No response             │  ← colored dot matching vendor status
│                            │
│  ─────────────────────     │
│                            │
│  Containment               │
│  Usage limit               │
│                            │
│  ─────────────────────     │
│                            │
│  Public Attention           │
│  ● Viral                   │  ← colored dot (viral=red, high=orange, etc.)
│                            │
│  ─────────────────────     │
│                            │
│  HEADLINE                  │
│  "$6,000 in 26 hours"      │  ← Instrument Serif, --accent, 18px
│                            │
│  OPERATOR ACTION           │
│  Set a spending cap...     │  ← 14px, --text-secondary, italic
│                            │
└────────────────────────────┘
```
- Background: --bg-surface
- Border: 1px --border-subtle
- Position: sticky, top: 80px (below header)
- Width: ~320px on desktop
- On mobile: becomes a horizontal summary strip below the title

#### Filter Panel (incidents list page)
```
┌─────────────────────────┐
│  FILTERS          Clear  │  ← header with clear all link
│                          │
│  ▼ Severity              │  ← collapsible sections
│  ☑ Critical  (2)         │
│  ☑ High      (4)         │
│  ☐ Medium    (1)         │
│  ☐ Low       (0)         │
│                          │
│  ▼ Category              │
│  ☑ Financial Loss    (5) │
│  ☐ Tool Misuse       (3) │
│  ☐ Prompt Injection  (1) │
│  ...                     │
│                          │
│  ▼ Agent Type            │
│  ☑ Coding Assistants (6) │
│  ☐ Task Automation   (2) │
│  ...                     │
│                          │
│  ▼ Vendor Response       │
│  ☐ No response       (4) │
│  ☐ Fixed             (1) │
│  ...                     │
└─────────────────────────┘
```
- Counts in parentheses update reactively as other filters change
- Checkboxes use accent color when checked
- Sections collapse/expand with smooth animation
- On mobile: slides in from left as a sheet/drawer
- "Clear" resets all filters and URL params

---

### Page Layouts

#### Homepage
```
┌───────────────────────────────────────────────────────────────────┐
│  [HEADER: AgentFail logo | Incidents | Patterns | Categories | About | 🔍]  │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│                                                                   │
│        When AI Agents Fail                                        │  ← Instrument Serif, 64px
│                                                                   │
│        Root cause analysis of real-world AI agent                 │  ← Geist Sans, 20px, --text-secondary
│        incidents. Not what could go wrong —                       │
│        what already did.                                          │
│                                                                   │
│        [Browse Incidents →]  [View Patterns →]                    │  ← CTA buttons (teal primary, ghost secondary)
│                                                                   │
├─────────────┬──────────────┬──────────────┬───────────────────────┤
│  7           │  $8,432      │  13          │  5                    │  ← stats bar
│  Incidents   │  Total Loss  │  Categories  │  Platforms            │  ← big number (Instrument Serif 36px, --accent)
│  Analyzed    │  Documented  │  Tracked     │  Covered              │    label below (14px, --text-muted)
├─────────────┴──────────────┴──────────────┴───────────────────────┤
│                                                                   │
│  LATEST INCIDENTS                            View all →           │  ← section header
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Incident Card   │  │  Incident Card   │  │  Incident Card   │ │  ← 3 latest, grid
│  │  (most recent)   │  │                  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  INCIDENT PATTERNS                                                │  ← section header
│                                                                   │
│  These aren't isolated failures. They cluster.                    │  ← subtext
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐ │
│  │ Billing Path Opacity        │  │ Runaway Context Loop        │ │  ← pattern cards
│  │ 3 incidents                 │  │ 2 incidents                 │ │
│  │ Silent routing to wrong     │  │ Loop accumulates context    │ │
│  │ billing account             │  │ across iterations...        │ │
│  └─────────────────────────────┘  └─────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐ │
│  │ Wrong Cost Estimate         │  │ Autonomous Infrastructure   │ │
│  │ 1 incident                  │  │ Destruction — 1 incident    │ │
│  └─────────────────────────────┘  └─────────────────────────────┘ │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  WHAT MAKES AGENTFAIL DIFFERENT                                   │
│                                                                   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐        │
│  │ Root Cause│ │ Operator  │ │ Solutions │ │ Strategic │        │  ← 4 feature cards
│  │ Analysis  │ │ Actionable│ │ Rated     │ │ Review    │        │
│  │ (5 Whys)  │ │ (TL;DR)   │ │ (1-5)     │ │ (3-phase) │        │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘        │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│  [FOOTER: © AgentFail 2026 | GitHub | Related Resources]         │
└───────────────────────────────────────────────────────────────────┘
```

**Mobile (375px):** Single column. Stats bar wraps to 2x2 grid. Incident cards stack vertically. Pattern cards full width.

---

#### Incidents List Page (`/incidents`)
```
┌───────────────────────────────────────────────────────────────────┐
│  [HEADER]                                                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Incidents                                                        │  ← Instrument Serif, 40px
│  7 documented incidents across 5 platforms                        │  ← subtext (--text-secondary)
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  🔍 Search incidents...                    Sort: Date ▼    │   │  ← search bar + sort dropdown
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐   │
│  │ FILTERS  │  │                                              │   │
│  │          │  │  ┌────────────────────────────────────────┐  │   │
│  │ Severity │  │  │  Incident Card 1                       │  │   │
│  │ ☑ High   │  │  └────────────────────────────────────────┘  │   │
│  │          │  │                                              │   │
│  │ Category │  │  ┌────────────────────────────────────────┐  │   │
│  │ ...      │  │  │  Incident Card 2                       │  │   │
│  │          │  │  └────────────────────────────────────────┘  │   │
│  │ Agent    │  │                                              │   │
│  │ Type     │  │  ┌────────────────────────────────────────┐  │   │
│  │ ...      │  │  │  Incident Card 3                       │  │   │
│  │          │  │  └────────────────────────────────────────┘  │   │
│  │ Vendor   │  │                                              │   │
│  │ Response │  │  ... (remaining cards)                       │   │
│  │ ...      │  │                                              │   │
│  └──────────┘  └──────────────────────────────────────────────┘   │
│   240px fixed    Fluid, single-column card list                   │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│  [FOOTER]                                                         │
└───────────────────────────────────────────────────────────────────┘
```

**Layout:** Two-column — 240px filter sidebar (left) + fluid card list (right).
**Cards:** Single column list (not grid) — incident data is dense, needs horizontal space.
**Active filters:** Show as removable pills above the card list.
**Result count:** "Showing 4 of 7 incidents" above cards when filtered.
**Empty state:** "No incidents match your filters. [Clear filters]"
**Mobile:** Filter sidebar hidden, accessible via "Filters" button that opens a sheet.

---

#### Incident Detail Page (`/incidents/AAGF-2026-001`)
```
┌───────────────────────────────────────────────────────────────────┐
│  [HEADER]                                                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Incidents / AAGF-2026-001                                        │  ← breadcrumb (14px, --text-muted)
│                                                                   │
│  ● High                                 Apr 2, 2026               │  ← severity badge + date
│                                                                   │
│  Claude Code /loop Command Runaway:                               │  ← title (Instrument Serif, 36px)
│  $6,000 Billing Explosion via                                     │
│  Compounding Token Mechanisms                                     │
│                                                                   │
│  ┌────────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐       │  ← tags row
│  │Financial Loss│ │Tool Misuse│ │Autonomous Esc│ │DoS / Exhaust│       │
│  └────────────┘ └──────────┘ └─────────────┘ └──────────┘       │
│                                                                   │
│  Agent: Claude Code CLI  ·  Platform: Anthropic  ·  Industry: SWE │  ← meta line (14px, --text-muted)
│                                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← teal accent divider
│                                                                   │
│  ┌─────────────────────────────────┐  ┌────────────────────────┐  │
│  │                                 │  │  KEY FACTS             │  │
│  │  EXECUTIVE SUMMARY              │  │                        │  │
│  │  A developer ran Claude Code... │  │  Financial Impact      │  │
│  │                                 │  │  $6,000                │  │
│  │  ──────────────────────         │  │  ────────────          │  │
│  │                                 │  │  Damage Speed          │  │
│  │  TIMELINE                       │  │  26 hours              │  │
│  │  | Date    | Event         |    │  │  ────────────          │  │
│  │  | Apr 2   | Loop started  |    │  │  Recovery              │  │
│  │  | Apr 3   | Discovered    |    │  │  Unrecoverable         │  │
│  │  |         |               |    │  │  ────────────          │  │
│  │                                 │  │  Vendor                │  │
│  │  ──────────────────────         │  │  ● No response         │  │
│  │                                 │  │  ────────────          │  │
│  │  WHAT HAPPENED                  │  │                        │  │
│  │  ...                            │  │  "$6,000 in 26 hours"  │  │  ← headline stat in teal
│  │                                 │  │                        │  │
│  │  ──────────────────────         │  │  "Set a spending       │  │  ← operator TLDR
│  │                                 │  │   cap before..."       │  │
│  │  TECHNICAL ANALYSIS             │  │                        │  │
│  │  ...                            │  ├────────────────────────┤  │
│  │                                 │  │  FRAMEWORKS            │  │
│  │  ROOT CAUSE ANALYSIS            │  │                        │  │
│  │  Proximate cause: ...           │  │  MITRE ATLAS           │  │
│  │  Why 1: ...                     │  │  AML.T0034 →           │  │
│  │  Why 2: ...                     │  │  AML.T0029 →           │  │
│  │  Why 3: ...                     │  │                        │  │
│  │  Root cause: ...                │  │  OWASP LLM             │  │
│  │                                 │  │  LLM06:2025 →          │  │
│  │  ... (remaining sections)       │  │  LLM10:2025 →          │  │
│  │                                 │  │                        │  │
│  │  ──────────────────────         │  │  OWASP Agentic         │  │
│  │                                 │  │  ASI02:2026 →          │  │
│  │  STRATEGIC COUNCIL REVIEW       │  │                        │  │
│  │  Challenger: ...                │  │  ttps.ai               │  │
│  │  Steelman: ...                  │  │  2.5.4 →               │  │
│  │  Synthesis: ...                 │  │                        │  │
│  │                                 │  └────────────────────────┘  │
│  └─────────────────────────────────┘                              │
│       ~66% width (fluid)               ~33% width (320px sticky)  │
│                                                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                   │
│  RELATED INCIDENTS                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ AAGF-2026-002│ │ AAGF-2026-003│ │ AAGF-2026-004│              │  ← compact cards
│  │ claude-code-  │ │ Ghost Billing│ │ Subagent Key │              │
│  │ guide harmful│ │ on Disabled  │ │ Inheritance  │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
│                                                                   │
│  REFERENCES                                                       │
│  | Source          | URL | Credibility |                          │
│  | ...             | ... | ...         |                          │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│  [FOOTER]                                                         │
└───────────────────────────────────────────────────────────────────┘
```

**Key detail page decisions:**
- Teal accent divider below the title block — creates a visual "fold" between metadata and content
- Markdown content uses `@tailwindcss/typography` prose-invert (dark theme) with custom styles:
  - H2 sections get a left teal border (4px) for visual anchoring
  - Tables get --bg-surface background with --border-subtle borders
  - Code blocks get --bg-overlay background with syntax highlighting
- Section navigation: no visible TOC — rely on the natural scroll of the 14 sections. Sections are visually separated with horizontal rules.
- Framework refs in sidebar: each ID is a link (Geist Mono, --accent, external link icon)
- On mobile: sidebar content moves to a horizontal scrollable summary strip below the title block, then full content below

---

#### Pattern Group Detail Page (`/patterns/runaway-context-loop`)
```
┌───────────────────────────────────────────────────────────────────┐
│  [HEADER]                                                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Patterns / Runaway Context Loop                                  │  ← breadcrumb
│                                                                   │
│  Runaway Context Loop                                             │  ← Instrument Serif, 36px
│  2 incidents share this pattern                                   │  ← subtext
│                                                                   │
│  Loop accumulates context across iterations, leading to           │  ← pattern description
│  super-linear cost growth with no circuit breaker.                │
│                                                                   │
│  SHARED ROOT CAUSES                                               │
│  • No default spending cap / platform-level circuit breaker       │  ← bulleted list, --text-secondary
│  • Real-time billing visibility failure                           │
│                                                                   │
│  INCIDENTS IN THIS PATTERN                                        │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Incident Card: AAGF-2026-001                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Incident Card: AAGF-2026-003                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│  [FOOTER]                                                         │
└───────────────────────────────────────────────────────────────────┘
```

---

#### Header
```
┌───────────────────────────────────────────────────────────────────┐
│  AgentFail     Incidents  Patterns  Categories  About    🔍       │
│  (logo)        (nav links, Geist Sans 14px, --text-secondary)     │
│                active link: --text-primary + teal underline       │
└───────────────────────────────────────────────────────────────────┘
```
- Background: --bg-deep with subtle bottom border (--border-subtle)
- Height: 64px
- Logo: "AgentFail" in Instrument Serif, 20px, --text-primary
- Search icon opens a command-palette style overlay (Cmd+K) — or navigates to /search
- Sticky (position: sticky, top: 0, z-index: 50)
- Mobile: hamburger icon replaces nav links, opens sheet from right

---

#### Footer
```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  AgentFail                                                        │
│  A curated database of real-world AI agent incidents.             │
│                                                                   │
│  Incidents · Patterns · Categories · About · GitHub               │
│                                                                   │
│  © 2026 AgentFail. Data is CC BY 4.0.                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```
- Background: --bg-deep (same as page, separated by --border-subtle top border)
- Compact. No multi-column grid — single centered block.
- Font: Geist Sans 14px, --text-muted

---

### Interaction & Motion

**Philosophy:** Restrained. This is an intelligence tool, not a marketing site. Motion exists to communicate state, not to entertain.

- **Page load:** No stagger animations. Content appears immediately. Speed is the UX.
- **Card hover:** 150ms transition — border brightens, subtle translateY(-1px), bg shifts to --bg-raised
- **Filter changes:** Instant re-render (no loading state — it's client-side)
- **Section anchors:** Smooth scroll (scroll-behavior: smooth)
- **Mobile nav:** Sheet slides in from right, 200ms ease-out
- **Badge hover:** No animation — badges are informational, not interactive
- **Links:** Underline on hover (text-decoration), color transition to --accent-bright, 100ms
- **Focus states:** 2px ring in --accent, offset 2px. Visible on keyboard navigation only (:focus-visible)

### Responsive Breakpoints

```
Mobile:   < 640px   — single column, stacked layout, sheet-based filters
Tablet:   640-1024px — two-column grids, sidebar collapses
Desktop:  > 1024px  — full layout with fixed sidebar, multi-column grids
Wide:     > 1440px  — max-width container centers, extra breathing room
```

---

## Critical Reference Files

- `incidents/TEMPLATE.md` — canonical 44-field frontmatter schema
- `incidents/AAGF-2026-001.md` — reference incident with all fields populated
- `taxonomy/categories.md` — 13 categories (full string format, e.g., `"Financial loss (unauthorized transactions, billing errors)"`)
- `taxonomy/severity.md` — 4 severity levels with threshold criteria
- `taxonomy/agent-types.md` — 12 agent types (full string format)
- `taxonomy/solution-types.md` — 10 solution types with plausibility/practicality ratings
- `taxonomy/framework-mapping.md` — MITRE ATLAS, OWASP LLM, OWASP Agentic, ttps.ai mappings
- `taxonomy/inclusion-criteria.md` — Tier 1 (publish) / Tier 2 (internal) / Tier 3 (exclude) system
- `relationships/graph.md` — pattern groups, root cause clusters, platform clusters, emerging patterns

## Key Data Facts

- Categories and agent types are **full descriptive strings** in frontmatter, need slug mapping
- `vendor_response` enum includes undocumented value `"disputed_then_refund_issued"` (used in AAGF-2026-005)
- No `visibility` field exists yet — filter on `status === "published"` only
- Taxonomy files are **structured markdown** (H3 headings + prose), NOT frontmatter-based
- Pattern group slugs in `pattern_group` field are already URL-safe (e.g., `"runaway-context-loop"`)

---

## File Structure

```
website/
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.ts
├── vitest.config.ts
├── components.json
├── .eslintrc.json
├── .gitignore
│
├── public/
│   └── og-default.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                         # Homepage
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── incidents/
│   │   │   ├── page.tsx                     # List + search/filter
│   │   │   └── [id]/
│   │   │       ├── page.tsx                 # Detail page
│   │   │       └── opengraph-image.tsx      # OG image generation
│   │   ├── patterns/
│   │   │   ├── page.tsx                     # Pattern groups index
│   │   │   └── [slug]/
│   │   │       └── page.tsx                 # Pattern detail
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── agent-types/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   │
│   ├── lib/
│   │   ├── content/
│   │   │   ├── types.ts                     # All TypeScript interfaces
│   │   │   ├── incidents.ts                 # Parse & query incidents
│   │   │   ├── taxonomy.ts                  # Parse taxonomy files
│   │   │   ├── relationships.ts             # Parse graph.md
│   │   │   └── markdown.ts                  # Remark/rehype pipeline
│   │   ├── utils.ts                         # cn(), slugify(), formatDate(), formatUSD()
│   │   └── constants.ts                     # Severity colors, slug maps, framework URLs, site metadata
│   │
│   ├── components/
│   │   ├── ui/                              # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── site-header.tsx
│   │   │   ├── site-footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── incidents/
│   │   │   ├── incident-card.tsx
│   │   │   ├── incident-list.tsx            # Client component: filter/sort state
│   │   │   ├── incident-filters.tsx         # Client component: filter controls
│   │   │   ├── incident-search.tsx          # Client component: Fuse.js input
│   │   │   ├── incident-sort.tsx            # Client component: sort controls
│   │   │   ├── severity-badge.tsx
│   │   │   ├── category-tag.tsx
│   │   │   ├── key-facts-sidebar.tsx
│   │   │   ├── framework-refs.tsx
│   │   │   ├── related-incidents.tsx
│   │   │   └── markdown-content.tsx
│   │   ├── patterns/
│   │   │   └── pattern-card.tsx
│   │   ├── home/
│   │   │   ├── hero.tsx
│   │   │   ├── stats-bar.tsx
│   │   │   ├── latest-incidents.tsx
│   │   │   └── featured-patterns.tsx
│   │   ├── shared/
│   │   │   ├── json-ld.tsx
│   │   │   ├── page-header.tsx
│   │   │   └── empty-state.tsx
│   │   └── search/
│   │       └── search-results.tsx
│   │
│   └── styles/
│       └── globals.css
│
└── __tests__/
    ├── lib/
    │   ├── content/
    │   │   ├── incidents.test.ts
    │   │   ├── taxonomy.test.ts
    │   │   ├── relationships.test.ts
    │   │   └── markdown.test.ts
    │   └── utils.test.ts
    ├── components/
    │   ├── severity-badge.test.tsx
    │   ├── incident-card.test.tsx
    │   ├── key-facts-sidebar.test.tsx
    │   └── json-ld.test.tsx
    └── fixtures/
        ├── test-incident.md
        └── test-incident-draft.md
```

---

## Design Tokens

```css
:root {
  --background: 0 0% 4%;           /* #0a0a0a */
  --foreground: 0 0% 95%;          /* #f2f2f2 */
  --card: 0 0% 7%;                 /* #121212 */
  --primary: 168 76% 40%;          /* teal #14b8a6 */
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 64%;
  --border: 0 0% 15%;
  --severity-critical: 0 84% 60%;       /* red */
  --severity-high: 25 95% 53%;          /* orange */
  --severity-medium: 48 96% 53%;        /* yellow */
  --severity-low: 142 71% 45%;          /* green */
}
```

Dark theme primary. Teal (#14b8a6) accent. Monospace for IDs/codes, sans-serif for body.

---

## Tasks

### Task 1: Project Scaffolding

**Files:** Create all config files in `website/`

- [ ] **Step 1: Create Next.js 15 project**

```bash
cd /Users/atinderpalsingh/projects/agentfail
mkdir website && cd website
pnpm init
pnpm add next@15 react@19 react-dom@19
pnpm add -D typescript@5 @types/node @types/react @types/react-dom
```

- [ ] **Step 2: Configure TypeScript strict mode**

Create `website/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Configure Tailwind CSS v4 with design tokens**

```bash
pnpm add -D tailwindcss@4 @tailwindcss/postcss postcss @tailwindcss/typography
```

Create `website/src/styles/globals.css` with Tailwind directives and the design token CSS variables listed above.

Create `website/postcss.config.ts` and `website/tailwind.config.ts` with dark mode class strategy and custom color extensions for severity levels and teal primary.

- [ ] **Step 4: Configure Next.js**

Create `website/next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // Static export for now; remove when adding server features
};

export default nextConfig;
```

- [ ] **Step 5: Install content parsing dependencies**

```bash
pnpm add gray-matter unified remark-parse remark-gfm remark-rehype rehype-stringify rehype-slug rehype-autolink-headings rehype-pretty-code fuse.js
```

- [ ] **Step 6: Install UI dependencies**

```bash
pnpm add clsx tailwind-merge class-variance-authority lucide-react
pnpm dlx shadcn@latest init
```

Configure shadcn/ui for dark theme with teal primary.

- [ ] **Step 7: Configure Vitest**

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

Create `website/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 8: Create minimal app shell**

Create `website/src/app/layout.tsx` (root layout with dark theme body class, font loading, basic metadata).
Create `website/src/app/page.tsx` (placeholder "AgentFail" heading).
Create `website/.gitignore` (node_modules, .next, out).

- [ ] **Step 9: Add scripts to package.json**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 10: Verify**

```bash
pnpm build    # Should succeed
pnpm test     # Should run (0 tests)
pnpm lint     # Should pass
```

- [ ] **Step 11: Commit**

```bash
git add website/
git commit -m "scaffold: Next.js 15 project with TypeScript strict, Tailwind v4, Vitest"
```

---

### Task 2: TypeScript Types, Constants, and Utilities

**Files:**
- Create: `website/src/lib/content/types.ts`
- Create: `website/src/lib/constants.ts`
- Create: `website/src/lib/utils.ts`
- Create: `website/__tests__/lib/utils.test.ts`

- [ ] **Step 1: Write utility tests**

`website/__tests__/lib/utils.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { slugify, formatDate, formatUSD, cn } from "@/lib/utils";

describe("slugify", () => {
  it("converts category string to URL-safe slug", () => {
    expect(slugify("Financial loss (unauthorized transactions, billing errors)"))
      .toBe("financial-loss-unauthorized-transactions-billing-errors");
  });
  it("handles simple strings", () => {
    expect(slugify("Coding Assistants")).toBe("coding-assistants");
  });
});

describe("formatDate", () => {
  it("formats YYYY-MM-DD to readable date", () => {
    expect(formatDate("2026-04-02")).toBe("Apr 2, 2026");
  });
});

describe("formatUSD", () => {
  it("formats number to USD string", () => {
    expect(formatUSD(6000)).toBe("$6,000");
  });
  it("returns 'Unknown' for null", () => {
    expect(formatUSD(null)).toBe("Unknown");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd website && pnpm test
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Implement types**

Create `website/src/lib/content/types.ts` with all interfaces:
- `Severity`, `IncidentStatus`, `VendorResponse` (include `"disputed_then_refund_issued"`), `Scale`, `PublicAttention`, `ContainmentMethod`, `RefundStatus`
- `AffectedParties`, `FrameworkRefs`, `IncidentFrontmatter`, `Incident`, `IncidentSection`, `IncidentCard`
- `TaxonomyCategory`, `SeverityLevel`, `AgentType`, `SolutionType`
- `PatternGroup`, `RootCauseCluster`
- Type guard: `isPublishedIncident(data: unknown): data is IncidentFrontmatter`

- [ ] **Step 4: Implement constants**

Create `website/src/lib/constants.ts`:
- `SEVERITY_COLORS` map: `{ Critical: "var(--severity-critical)", High: "var(--severity-high)", ... }`
- `CATEGORY_SLUGS` map: full category string → short slug (13 entries)
- `AGENT_TYPE_SLUGS` map: full agent type string → short slug (12 entries)
- `FRAMEWORK_URLS` map: base URLs for each framework (MITRE ATLAS: `https://atlas.mitre.org/techniques/`, OWASP LLM: `https://genai.owasp.org/llmrisk/`, etc.)
- `SITE_META`: name, description, url defaults

- [ ] **Step 5: Implement utilities**

Create `website/src/lib/utils.ts`:
- `cn(...inputs)` — clsx + tailwind-merge
- `slugify(str: string): string` — lowercase, replace non-alphanumeric with hyphens, collapse multiples, trim
- `formatDate(dateStr: string): string` — "Apr 2, 2026" format
- `formatUSD(amount: number | null): string` — "$6,000" or "Unknown"
- `getCategorySlug(category: string): string` — lookup in CATEGORY_SLUGS, fallback to slugify
- `getAgentTypeSlug(agentType: string): string` — lookup in AGENT_TYPE_SLUGS, fallback to slugify

- [ ] **Step 6: Run tests**

```bash
pnpm test
```

Expected: ALL PASS.

- [ ] **Step 7: Commit**

```bash
git add website/src/lib/ website/__tests__/
git commit -m "feat: add TypeScript types, constants, and utility functions"
```

---

### Task 3: Markdown Rendering Pipeline

**Files:**
- Create: `website/src/lib/content/markdown.ts`
- Create: `website/__tests__/lib/content/markdown.test.ts`

- [ ] **Step 1: Write markdown pipeline tests**

Test: renders GFM tables to HTML, adds slug IDs to headings, applies autolink headings, handles code blocks.
Test: `splitIntoSections()` splits markdown at H2 boundaries, returns array of `{ id, title, level, html }`.

- [ ] **Step 2: Run tests — verify fail**

- [ ] **Step 3: Implement markdown pipeline**

`website/src/lib/content/markdown.ts`:
- `renderMarkdown(content: string): Promise<string>` — unified pipeline: remark-parse → remark-gfm → remark-rehype → rehype-slug → rehype-autolink-headings → rehype-pretty-code → rehype-stringify
- `splitIntoSections(content: string): Promise<IncidentSection[]>` — split at `## ` boundaries, render each section independently, return array with slugified IDs

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement remark/rehype markdown pipeline with section splitting"
```

---

### Task 4: Incident Content Parser

**Files:**
- Create: `website/src/lib/content/incidents.ts`
- Create: `website/__tests__/lib/content/incidents.test.ts`
- Create: `website/__tests__/fixtures/test-incident.md` (copy from AAGF-2026-001 with status: published)
- Create: `website/__tests__/fixtures/test-incident-draft.md` (same but status: draft)

- [ ] **Step 1: Create test fixtures**

`test-incident.md`: Minimal valid incident with all required fields, status: "published".
`test-incident-draft.md`: Same but status: "draft" — must be filtered out.

- [ ] **Step 2: Write incident parser tests**

Tests against fixtures directory:
- `getAllIncidents(fixturesDir)` returns only published incidents, excludes TEMPLATE.md
- `getIncidentBySlug("AAGF-2026-001", fixturesDir)` returns correct data
- `getAllIncidentCards(fixturesDir)` returns lightweight objects (no contentHtml)
- `getStats(fixturesDir)` returns correct counts
- `getUniqueCategories(fixturesDir)` deduplicates
- `getIncidentsByPatternGroup("runaway-context-loop", fixturesDir)` filters correctly
- Frontmatter fields parse correctly: arrays, nested objects (affected_parties, framework_refs), nulls

- [ ] **Step 3: Run tests — verify fail**

- [ ] **Step 4: Implement incident parser**

`website/src/lib/content/incidents.ts`:
- All functions accept optional `basePath` parameter (defaults to `path.resolve(process.cwd(), '..', 'incidents')`)
- `getAllIncidents()`: read all `.md` files, parse with gray-matter, filter `status === "published"`, exclude TEMPLATE.md, sort by `date_occurred` descending, render markdown content
- `getIncidentBySlug()`: single lookup
- `getAllIncidentCards()`: same filtering but return `IncidentCard` subset (no HTML)
- `getStats()`: aggregate counts
- `getUniqueCategories()`, `getUniquePlatforms()`, `getUniqueAgentTypes()`
- `getIncidentsByCategory()`, `getIncidentsByPatternGroup()`, `getIncidentsByAgentType()`

- [ ] **Step 5: Run tests — verify pass**

- [ ] **Step 6: Integration test against real incidents**

```bash
# Quick manual verification
cd website && node -e "
const { getAllIncidents } = require('./src/lib/content/incidents');
const incidents = getAllIncidents();
console.log('Found', incidents.length, 'published incidents');
incidents.forEach(i => console.log(i.id, i.title));
"
```

Should output 7 incidents.

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: implement incident content parser with frontmatter extraction"
```

---

### Task 5: Taxonomy and Relationships Parsers

**Files:**
- Create: `website/src/lib/content/taxonomy.ts`
- Create: `website/src/lib/content/relationships.ts`
- Create: `website/__tests__/lib/content/taxonomy.test.ts`
- Create: `website/__tests__/lib/content/relationships.test.ts`

- [ ] **Step 1: Write taxonomy parser tests**

Test against real files at `../../taxonomy/`:
- `getCategories()` returns 13 items with `name` and `description`
- `getSeverityLevels()` returns 4 items with criteria
- `getAgentTypes()` returns 12 items
- `getSolutionTypes()` returns 10 items

- [ ] **Step 2: Write relationships parser tests**

Test against real file at `../../relationships/graph.md`:
- `getPatternGroups()` returns 4 groups with incident IDs
- Each pattern group has `slug`, `name`, `description`, `incidentIds[]`

- [ ] **Step 3: Run tests — verify fail**

- [ ] **Step 4: Implement taxonomy parser**

Parse structured markdown (H3 headings with descriptions). Use regex or remark AST walking.
Each taxonomy function accepts optional `basePath`.

- [ ] **Step 5: Implement relationships parser**

Parse `graph.md` sections: Pattern Groups (H3 headings with incident IDs in parentheses), Root Cause Clusters (bulleted lists), Platform Clusters.

- [ ] **Step 6: Run tests — verify pass**

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: implement taxonomy and relationship graph parsers"
```

---

### Task 6: Layout Shell and Shared Components

**Files:**
- Create: shadcn/ui primitives in `src/components/ui/`
- Create: `src/components/layout/site-header.tsx`, `site-footer.tsx`, `mobile-nav.tsx`
- Create: `src/components/incidents/severity-badge.tsx`, `category-tag.tsx`
- Create: `src/components/shared/page-header.tsx`, `empty-state.tsx`, `json-ld.tsx`
- Create: `__tests__/components/severity-badge.test.tsx`
- Update: `src/app/layout.tsx`

- [ ] **Step 1: Install shadcn components**

```bash
pnpm dlx shadcn@latest add badge button card input select checkbox separator sheet
```

- [ ] **Step 2: Write severity badge test**

Test: renders "Critical" with red styling, "High" with orange, "Medium" with yellow, "Low" with green.

- [ ] **Step 3: Implement severity badge and category tag**

`severity-badge.tsx`: Badge component with severity-specific background colors using CSS variables.
`category-tag.tsx`: Pill component linking to `/categories/[slug]`.

- [ ] **Step 4: Implement layout components**

`site-header.tsx`: Logo/wordmark, nav links (Incidents, Patterns, Categories, About), search input, mobile hamburger.
`site-footer.tsx`: Copyright, links to GitHub, related resources.
`mobile-nav.tsx`: Sheet-based mobile navigation.

- [ ] **Step 5: Implement shared components**

`page-header.tsx`: Reusable page title + description + optional breadcrumb.
`empty-state.tsx`: "No results found" component.
`json-ld.tsx`: Renders `<script type="application/ld+json">` with typed data.

- [ ] **Step 6: Update root layout**

Integrate header, footer, Inter font + JetBrains Mono for monospace, dark body class, metadata.

- [ ] **Step 7: Run tests — verify pass**

- [ ] **Step 8: Verify build**

```bash
pnpm build && pnpm dev
```

Confirm layout renders with header/footer.

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add layout shell, shared components, severity badge, category tag"
```

---

### Task 7: Homepage

**Files:**
- Create: `src/components/home/hero.tsx`, `stats-bar.tsx`, `latest-incidents.tsx`, `featured-patterns.tsx`
- Create: `src/components/incidents/incident-card.tsx`
- Create: `__tests__/components/incident-card.test.tsx`
- Update: `src/app/page.tsx`

- [ ] **Step 1: Write incident card test**

Test: renders title, severity badge, date, headline_stat, operator_tldr, category tags. Links to `/incidents/[id]`.

- [ ] **Step 2: Implement incident card**

Card component showing: title, date (formatted), severity badge, first 2 category tags, headline_stat, operator_tldr. Entire card is a link.

- [ ] **Step 3: Implement hero**

Dark background, large headline: "When AI Agents Fail". Subtext: "A curated database of real-world AI agent incidents — root cause analyzed, operator actionable." Teal accent on key words.

- [ ] **Step 4: Implement stats bar**

Row of stats cards: Total Incidents, Total Financial Impact, Categories Covered, Platforms Tracked. Data from `getStats()`.

- [ ] **Step 5: Implement latest incidents**

Grid of the 5 most recent incident cards. "View all →" link to `/incidents`.

- [ ] **Step 6: Implement featured patterns**

Cards for each pattern group showing: name, incident count, brief description. Links to `/patterns/[slug]`.

- [ ] **Step 7: Compose homepage**

Update `src/app/page.tsx`: server component that calls content layer functions, renders hero → stats → latest → patterns. Add homepage JSON-LD (WebSite schema).

- [ ] **Step 8: Verify**

```bash
pnpm build && pnpm dev
```

Homepage renders with real data.

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: implement homepage with hero, stats, latest incidents, patterns"
```

---

### Task 8: Incident Detail Page

**Files:**
- Create: `src/app/incidents/[id]/page.tsx`
- Create: `src/components/incidents/key-facts-sidebar.tsx`
- Create: `src/components/incidents/framework-refs.tsx`
- Create: `src/components/incidents/related-incidents.tsx`
- Create: `src/components/incidents/markdown-content.tsx`
- Create: `__tests__/components/key-facts-sidebar.test.tsx`

- [ ] **Step 1: Write key facts sidebar test**

Test: renders financial impact, damage speed, recovery time, vendor response, headline stat. Handles null values.

- [ ] **Step 2: Implement key facts sidebar**

Sticky sidebar with key incident facts. Each fact is a label + value pair. Color-coded severity at top.

- [ ] **Step 3: Implement framework refs**

Renders framework reference links grouped by framework (MITRE ATLAS, OWASP LLM, OWASP Agentic, ttps.ai). Each ID links to external URL using `FRAMEWORK_URLS` from constants.

- [ ] **Step 4: Implement related incidents**

Renders list of related incident cards (from `related_incidents` array). Fetches card data for each related ID.

- [ ] **Step 5: Implement markdown content**

Renders pre-rendered HTML sections with proper styling using `@tailwindcss/typography` prose classes. Adds anchor links to each section. Dark theme prose styles.

- [ ] **Step 6: Implement detail page**

`src/app/incidents/[id]/page.tsx`:
- `generateStaticParams()`: returns all published incident IDs
- `generateMetadata()`: title, description (from operator_tldr), OG tags
- Layout: top section (title, severity, categories, agent types, date), two-column (main content + sidebar on desktop, stacked on mobile), related incidents at bottom
- JSON-LD Article schema

- [ ] **Step 7: Verify**

```bash
pnpm build
```

Should generate 7 incident pages. Visit `/incidents/AAGF-2026-001` in dev mode.

- [ ] **Step 8: Commit**

```bash
git commit -m "feat: implement incident detail page with sidebar, framework refs, JSON-LD"
```

---

### Task 9: OG Image Generation

**Files:**
- Create: `src/app/incidents/[id]/opengraph-image.tsx`

- [ ] **Step 1: Implement OG image route**

Uses Next.js `ImageResponse` from `next/og`. 1200x630px.
Design: dark background (#0a0a0a), 4px teal top bar, incident title (white, bold, max 2 lines), severity badge (colored), headline_stat in teal, "AgentFail" at bottom.

`generateStaticParams()` returns all published incident IDs.

**Note:** `output: "export"` in next.config.ts does NOT support `ImageResponse`. This task requires temporarily switching to standard build mode or deferring OG images until deployment. **Decision: defer OG image generation to when deployment is configured (remove `output: "export"` at that point). For now, use static default OG image.**

- [ ] **Step 2: Add default OG image**

Place a pre-designed `public/og-default.png` (1200x630) with AgentFail branding. Reference in metadata defaults.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add default OG image, defer dynamic OG to deployment phase"
```

---

### Task 10: Incidents List Page with Search, Filters, Sort

**Files:**
- Create: `src/app/incidents/page.tsx`
- Create: `src/components/incidents/incident-list.tsx` (client)
- Create: `src/components/incidents/incident-filters.tsx` (client)
- Create: `src/components/incidents/incident-search.tsx` (client)
- Create: `src/components/incidents/incident-sort.tsx` (client)

- [ ] **Step 1: Implement server page**

`src/app/incidents/page.tsx`: SSG page that fetches all `IncidentCard[]` + filter options (unique categories, severities, agent types, platforms, vendor responses) at build time. Passes as props to client component.

- [ ] **Step 2: Implement incident filters**

Checkbox groups for: Severity (4 options), Category (13), Agent Type (12), Vendor Response (6), Platform (derived from data). Collapsible sections. Mobile: slide-out sheet.

- [ ] **Step 3: Implement incident search**

Fuse.js search over: title, category, agent_type, platform, headline_stat, operator_tldr, tags. Debounced input (300ms).

- [ ] **Step 4: Implement incident sort**

Sort options: Date (newest first, default), Severity (critical → low), Financial Impact (highest first).

- [ ] **Step 5: Implement incident list container**

Client component that:
1. Receives all cards + filter options as props
2. Manages filter/sort/search state
3. Syncs state to URL search params (`useSearchParams`) for shareable URLs
4. Applies Fuse.js search → filter predicates → sort function
5. Renders filtered incident cards in a responsive grid
6. Shows result count and empty state

- [ ] **Step 6: Verify**

```bash
pnpm build && pnpm dev
```

Test: filters work, search returns results, sort changes order, URL params persist.

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: implement incidents list with search, filters, and sort"
```

---

### Task 11: Pattern Groups Pages

**Files:**
- Create: `src/app/patterns/page.tsx`
- Create: `src/app/patterns/[slug]/page.tsx`
- Create: `src/components/patterns/pattern-card.tsx`

- [ ] **Step 1: Implement pattern card**

Card showing: pattern name, incident count, brief description, link to detail page.

- [ ] **Step 2: Implement patterns index page**

Grid of pattern cards. Data from `getPatternGroups()`.

- [ ] **Step 3: Implement pattern detail page**

`generateStaticParams()` from pattern group slugs. Shows: pattern name, full description, root cause analysis, all incidents in pattern rendered as incident cards. `generateMetadata()` for SEO.

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Should generate 4 pattern pages.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement pattern groups index and detail pages"
```

---

### Task 12: Taxonomy Pages

**Files:**
- Create: `src/app/categories/page.tsx`
- Create: `src/app/categories/[slug]/page.tsx`
- Create: `src/app/agent-types/[slug]/page.tsx`

- [ ] **Step 1: Implement categories index**

Grid of category cards showing: name, incident count, description. Uses `CATEGORY_SLUGS` for URLs.

- [ ] **Step 2: Implement category detail page**

`generateStaticParams()` from `CATEGORY_SLUGS`. Shows: category name, description from taxonomy, framework mappings for this category, all incidents tagged with this category as cards.

- [ ] **Step 3: Implement agent type detail page**

Same pattern as categories but using `AGENT_TYPE_SLUGS`.

- [ ] **Step 4: Verify**

```bash
pnpm build
```

Should generate pages for all categories and agent types that have at least one incident.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement taxonomy pages for categories and agent types"
```

---

### Task 13: Search Page

**Files:**
- Create: `src/app/search/page.tsx`
- Create: `src/components/search/search-results.tsx`

- [ ] **Step 1: Implement search page**

Client component that reads `?q=` from URL params, runs Fuse.js search over all incident cards (passed as prop from server component), renders results as incident cards.

- [ ] **Step 2: Connect header search input**

Update `site-header.tsx`: search input navigates to `/search?q=...` on enter/submit.

- [ ] **Step 3: Verify**

Navigate to `/search?q=billing` — should show relevant incidents.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: implement dedicated search page with Fuse.js"
```

---

### Task 14: About Page, Sitemap, Robots, 404

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Implement about page**

Static content: What is AgentFail, methodology (4-stage pipeline), what makes it different (comparison table from README), who it's for, link to GitHub.

- [ ] **Step 2: Implement sitemap**

Programmatic sitemap listing: homepage, /incidents, all incident detail pages, /patterns, all pattern pages, /categories, all category pages, /about, /search.

**Note:** With `output: "export"`, `sitemap.ts` must export a static function. Generate from content data at build time.

- [ ] **Step 3: Implement robots.ts**

Allow all crawlers, reference sitemap URL.

- [ ] **Step 4: Implement 404 page**

Styled 404 with AgentFail branding, link back to homepage and incidents.

- [ ] **Step 5: Verify**

```bash
pnpm build
```

Check `/sitemap.xml` lists all pages. `/robots.txt` is valid.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add about page, sitemap, robots.txt, and 404 page"
```

---

### Task 15: SEO and Metadata Finalization

**Files:**
- Update: every `page.tsx` to add `generateMetadata`

- [ ] **Step 1: Add metadata to all pages**

Every page route gets `generateMetadata` with:
- `title`: page-specific, following pattern "Page Name | AgentFail"
- `description`: derived from content
- `openGraph`: title, description, default OG image
- `twitter`: card type "summary_large_image"

- [ ] **Step 2: Add JSON-LD to list pages**

- Homepage: WebSite schema with SearchAction
- Incidents list: CollectionPage schema
- Pattern/category pages: CollectionPage schema

- [ ] **Step 3: Verify**

```bash
pnpm build
```

Inspect generated HTML for meta tags on multiple pages.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: finalize SEO metadata, OG tags, and JSON-LD across all pages"
```

---

### Task 16: Responsive Design and Accessibility Polish

**Files:**
- Update: all component files

- [ ] **Step 1: Mobile layout pass**

- Incident detail: single column, sidebar becomes summary card above content
- Incident list: filters collapse into sheet/drawer on mobile
- Pattern/category grids: single column on mobile
- Header: hamburger menu triggers mobile-nav sheet

- [ ] **Step 2: Tablet layout pass**

- Two-column grids where appropriate
- Sidebar visible but narrower

- [ ] **Step 3: Accessibility pass**

- Skip-to-content link in layout
- ARIA labels on: filter controls, search input, navigation, severity badges
- Focus-visible styles on all interactive elements
- Color contrast: verify severity badge text readable on dark background

- [ ] **Step 4: Verify**

Manual testing at 375px, 768px, 1024px, 1440px viewport widths. Keyboard-only navigation through all interactive elements.

- [ ] **Step 5: Final build verification**

```bash
pnpm build && pnpm test && pnpm lint
```

All must pass.

- [ ] **Step 6: Commit**

```bash
git commit -m "polish: responsive design and accessibility across all pages"
```

---

## Verification Plan

After all tasks complete:

1. **Build succeeds:** `pnpm build` — zero errors
2. **Tests pass:** `pnpm test` — all green
3. **Lint passes:** `pnpm lint` — zero warnings
4. **Content renders:** `pnpm dev` — visit every page type:
   - Homepage: stats, latest incidents, pattern groups render
   - `/incidents`: all 7 incidents visible, filters work, search works, sort works
   - `/incidents/AAGF-2026-001`: full report renders with sidebar, framework refs, related incidents
   - `/patterns`: 4 pattern groups listed
   - `/patterns/runaway-context-loop`: pattern detail with linked incidents
   - `/categories`: 13 categories listed
   - `/categories/financial-loss`: category detail with filtered incidents
   - `/search?q=billing`: returns relevant results
   - `/about`: static content renders
   - `/nonexistent`: 404 page renders
5. **Responsive:** Check all above at 375px and 1440px
6. **SEO:** View source on incident detail page — confirm meta tags, JSON-LD present
7. **Static export:** `out/` directory contains all generated HTML files
