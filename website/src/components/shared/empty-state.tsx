import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a centered empty-state message with optional CTA link.
 * - INPUTS: title (required), optional description, optional action with label/href, optional className
 * - OUTPUTS: <div> centered with title, description, and optional link button
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Always renders title; action link only appears when action prop is provided
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4 gap-4",
        className
      )}
    >
      <p className="text-base font-medium text-[var(--text-muted)] m-0">
        {title}
      </p>

      {description && (
        <p className="text-sm text-[var(--text-muted)] m-0 max-w-sm">
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-[4px] text-sm font-medium text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--bg-raised)] transition-colors duration-150 mt-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
