"use client";

import { useState, useRef, useCallback } from "react";

interface StarTooltipProps {
  nearMissCount: number;
}

/**
 * CONTRACT:
 * - WHAT: Interactive ★ badge that reveals a methodology note on hover (desktop)
 *   or tap (mobile). Used alongside damage estimates to surface the probability-
 *   weighting disclosure without cluttering the primary stat.
 * - INPUTS: nearMissCount — how many near-miss incidents contributed to the figure
 * - OUTPUTS: A ★ button with an aria-described popover
 * - ERRORS: None
 * - SIDE EFFECTS: None (no network, no storage)
 * - INVARIANTS:
 *   - Popover is only shown when open === true
 *   - Mouse leave closes the popover on desktop; second tap closes on mobile
 *   - Keyboard: Enter/Space toggles; Escape closes
 */
export function StarTooltip({ nearMissCount }: StarTooltipProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    // Small delay so moving between button → popover doesn't flicker
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    },
    [],
  );

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="About this estimate"
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        style={{
          background: "none",
          border: "none",
          padding: "0 2px",
          cursor: "pointer",
          color: "var(--accent)",
          fontSize: "inherit",
          lineHeight: "inherit",
          display: "inline-flex",
          alignItems: "center",
          minHeight: "44px",
          minWidth: "24px",
          justifyContent: "center",
        }}
      >
        ★
      </button>

      {open && (
        <span
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "240px",
            background: "var(--bg-elevated, var(--bg-surface))",
            border: "1px solid var(--border-visible)",
            borderRadius: "6px",
            padding: "10px 12px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: "1.5",
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            pointerEvents: "auto",
          }}
        >
          Probability-weighted across{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {nearMissCount} near-miss incidents
          </strong>{" "}
          using IBM Cost of Data Breach 2024 and SANS 2024 IR benchmarks. Each
          figure is weighted by exploitation probability (1–30%).{" "}
          <a
            href="/about#damage-heading"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Full methodology →
          </a>
          {/* Caret */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid var(--border-visible)",
            }}
          />
        </span>
      )}
    </span>
  );
}
