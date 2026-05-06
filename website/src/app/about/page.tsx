import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SITE_META } from "@/lib/constants";

/**
 * CONTRACT:
 * - WHAT: Static about page explaining AgentFail's mission, methodology, and audience.
 * - INPUTS: None
 * - OUTPUTS: Static HTML page — no dynamic data
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Content is fully static; no server/client data fetching needed
 */

export const metadata: Metadata = {
  title: `About | ${SITE_META.name}`,
  description:
    "Learn about AgentFail — a curated database of real-world AI agent incidents with root cause analysis and operator-actionable insights.",
};

const PIPELINE_STAGES = [
  {
    step: "01",
    name: "Discovery",
    description:
      "Monitoring public reports, security disclosures, postmortems, and community discussions to surface candidate incidents.",
  },
  {
    step: "02",
    name: "Research",
    description:
      "Deep-diving primary sources, vendor statements, affected operator accounts, and technical analyses to establish facts.",
  },
  {
    step: "03",
    name: "Analysis",
    description:
      "5 Whys root cause analysis, attack chain reconstruction, severity scoring, and solution rating against each incident.",
  },
  {
    step: "04",
    name: "Council Review",
    description:
      "Multi-perspective strategic review examining operator impact, systemic risk, and actionable mitigations before publication.",
  },
] as const;

const DIFFERENTIATORS = [
  {
    title: "Root Cause, Not Just Symptoms",
    body: "Every incident includes a 5 Whys analysis that traces failures back to their structural cause — not just what broke, but why the system allowed it to break.",
  },
  {
    title: "Operator-Actionable TL;DR",
    body: "Each incident includes a concise operator brief: what happened, what to check in your own stack, and what to change.",
  },
  {
    title: "Solution Ratings",
    body: "Mitigations are rated for effectiveness and feasibility — so you can prioritize the fixes that actually move the needle.",
  },
  {
    title: "Strategic Council Review",
    body: "Before publication, every incident is reviewed from multiple stakeholder perspectives: security, product, legal, and operations.",
  },
] as const;

const AUDIENCES = [
  { label: "Security teams", description: "building threat models for agentic AI systems" },
  { label: "AI operators", description: "deploying LLM-powered products in production" },
  { label: "Platform builders", description: "designing guardrails and sandboxing primitives" },
  { label: "Researchers", description: "studying real-world failure modes in autonomous systems" },
] as const;

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <PageHeader
          title="About AgentFail"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        />
      </div>

      <div className="max-w-3xl space-y-16">
        {/* ── What is AgentFail ─────────────────────────────────────── */}
        <section aria-labelledby="what-heading">
          <h2
            id="what-heading"
            className="text-2xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]"
          >
            What is AgentFail?
          </h2>
          <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed">
            <p>
              AgentFail is a curated database of real-world AI agent incidents. Not theoretical
              attacks, not red-team exercises — verified production failures with root cause
              analysis.
            </p>
            <p>
              As autonomous AI agents enter production at scale, the failure modes are no longer
              abstract. Agents have deleted production data, charged users unauthorized amounts,
              executed unintended actions, and leaked sensitive information — often because no
              one had documented what could go wrong.
            </p>
            <p>
              AgentFail exists to close that gap. Every documented incident is a signal for
              everyone building with AI agents: here is what broke, here is why, and here is
              what you can do about it.
            </p>
          </div>
        </section>

        {/* ── Methodology ───────────────────────────────────────────── */}
        <section aria-labelledby="methodology-heading">
          <h2
            id="methodology-heading"
            className="text-2xl font-semibold text-[var(--text-primary)] mb-6 font-[family-name:var(--font-display)]"
          >
            Methodology
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8">
            Every incident passes through a 4-stage analysis pipeline before publication.
          </p>
          <ol className="space-y-6 list-none m-0 p-0">
            {PIPELINE_STAGES.map(({ step, name, description }) => (
              <li key={step} className="flex gap-5">
                <span
                  className="flex-shrink-0 font-[family-name:var(--font-display)] text-[var(--accent)] text-sm leading-7"
                  aria-hidden="true"
                >
                  {step}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                    {name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── What makes it different ───────────────────────────────── */}
        <section aria-labelledby="differentiators-heading">
          <h2
            id="differentiators-heading"
            className="text-2xl font-semibold text-[var(--text-primary)] mb-6 font-[family-name:var(--font-display)]"
          >
            What makes it different
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {DIFFERENTIATORS.map(({ title, body }) => (
              <div
                key={title}
                className="rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
              >
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Who it's for ──────────────────────────────────────────── */}
        <section aria-labelledby="audience-heading">
          <h2
            id="audience-heading"
            className="text-2xl font-semibold text-[var(--text-primary)] mb-6 font-[family-name:var(--font-display)]"
          >
            Who it&rsquo;s for
          </h2>
          <ul className="space-y-3 list-none m-0 p-0">
            {AUDIENCES.map(({ label, description }) => (
              <li key={label} className="flex items-start gap-3 text-sm">
                <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                <span>
                  <span className="font-medium text-[var(--text-primary)]">{label}</span>
                  <span className="text-[var(--text-secondary)]"> — {description}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── GitHub link ───────────────────────────────────────────── */}
        <section aria-labelledby="contribute-heading">
          <h2
            id="contribute-heading"
            className="text-2xl font-semibold text-[var(--text-primary)] mb-4 font-[family-name:var(--font-display)]"
          >
            Open source
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-6">
            AgentFail is open source. The incident database, analysis pipeline, and this website
            are all available on GitHub. Contributions, corrections, and new incident reports are
            welcome.
          </p>
          <Link
            href="https://github.com/agentfail"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-sm border border-[var(--border-visible)] bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </Link>
        </section>
      </div>
    </main>
  );
}
