import Link from "next/link";
import { cn, getCategorySlug } from "@/lib/utils";

interface CategoryTagProps {
  category: string;
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders a small pill linking to a category page.
 * - INPUTS: category string (full display name as in frontmatter), optional className
 * - OUTPUTS: A Next.js <Link> pill showing the display name before the first parenthesis
 * - ERRORS: None
 * - SIDE EFFECTS: None
 * - INVARIANTS: href always points to /categories/{slug}
 */
export function CategoryTag({ category, className }: CategoryTagProps) {
  // Extract display name: text before first "(" or the full string
  const parenIndex = category.indexOf("(");
  const displayName =
    parenIndex !== -1 ? category.slice(0, parenIndex).trim() : category;

  const slug = getCategorySlug(category);

  return (
    <Link
      href={`/categories/${slug}`}
      className={cn(
        "inline-block rounded-[4px] transition-colors duration-150",
        "bg-[var(--bg-overlay)] text-[var(--text-secondary)]",
        "hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)]",
        className
      )}
      style={{
        padding: "2px 8px",
        fontSize: "12px",
      }}
    >
      {displayName}
    </Link>
  );
}
