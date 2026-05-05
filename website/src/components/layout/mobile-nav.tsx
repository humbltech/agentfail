"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HeaderNav } from "./header-nav";

/**
 * CONTRACT:
 * - WHAT: Renders a hamburger button (mobile-only) that opens a slide-in nav sheet.
 * - INPUTS: None
 * - OUTPUTS: A <div> containing the trigger button and Sheet with nav links
 * - ERRORS: None
 * - SIDE EFFECTS: Controls sheet open/closed state; closes on nav link click
 * - INVARIANTS: Trigger button is only visible below md breakpoint
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 bg-transparent border-0 cursor-pointer"
        >
          {open ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </SheetTrigger>
        <SheetContent
          side="right"
          className="border-l border-[var(--border-subtle)]"
          style={{ backgroundColor: "var(--bg-surface)" }}
        >
          <SheetHeader>
            <SheetTitle className="text-left text-[var(--text-primary)]">
              Navigation
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 px-4">
            <HeaderNav onLinkClick={() => setOpen(false)} vertical />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
