import Link from "next/link";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Reusable page header with optional breadcrumbs, title, and description.
 * - INPUTS: title (required), optional description, optional breadcrumbs array, optional className
 * - OUTPUTS: <div> with breadcrumb trail, Instrument Serif title, and description paragraph
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: Last breadcrumb item never has a link; title is always rendered
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 list-none m-0 p-0 text-sm text-[var(--text-muted)]">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="flex items-center gap-1">
                  {index > 0 && (
                    <span aria-hidden="true" className="text-[var(--text-muted)]">
                      /
                    </span>
                  )}
                  {!isLast && crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[var(--text-secondary)] transition-colors duration-150"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title */}
      <h1
        className="text-4xl text-[var(--text-primary)] m-0"
        style={{ fontFamily: "var(--font-bricolage)" }}
      >
        {title}
      </h1>

      {/* Description */}
      {description && (
        <p
          className="text-base text-[var(--text-secondary)] m-0"
          style={{ maxWidth: "600px" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
