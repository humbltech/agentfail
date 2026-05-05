---
id: "TEST-2026-001"
title: "Test Incident: Agent Did Something Bad"
status: "published"
date_occurred: "2026-04-15"
date_discovered: "2026-04-15"
date_reported: "2026-04-16"
date_curated: "2026-05-01"
date_council_reviewed: "2026-05-01"
category:
  - "Financial loss (unauthorized transactions, billing errors)"
  - "Tool misuse / unintended tool execution"
severity: "High"
agent_type:
  - "Coding assistants (Copilot, Claude Code, Cursor, Devin)"
agent_name: "Test Agent"
platform: "Test Platform"
industry: "Software Development"
financial_impact: "$1,000 USD"
financial_impact_usd: 1000
refund_status: "none"
refund_amount_usd: null
affected_parties:
  count: 1
  scale: "individual"
  data_types_exposed: ["financial"]
damage_speed: "5 minutes"
damage_duration: "5 minutes"
total_damage_window: "5 minutes"
recovery_time: "1 hour"
recovery_labor_hours: 2
recovery_cost_usd: null
recovery_cost_notes: ""
full_recovery_achieved: "yes"
business_scope: "individual"
business_criticality: "medium"
business_criticality_notes: ""
systems_affected: ["billing"]
vendor_response: "none"
vendor_response_time: "none"
headline_stat: "$1,000 in 5 minutes"
operator_tldr: "Set spending caps before running agents."
containment_method: "manual_discovery"
public_attention: "medium"
framework_refs:
  mitre_atlas: ["AML.T0034"]
  owasp_llm: ["LLM06:2025"]
  owasp_agentic: []
  ttps_ai: []
related_incidents: []
pattern_group: "test-pattern"
tags: ["billing", "test"]
sources: ["https://example.com/test"]
researcher_notes: ""
council_verdict: "Test verdict"
---

# Test Incident

## Executive Summary

A test incident for unit testing.

## What Happened

The agent did something bad.
