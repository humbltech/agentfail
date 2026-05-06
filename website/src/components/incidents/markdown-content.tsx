import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  html: string;
  className?: string;
}

/**
 * CONTRACT:
 * - WHAT: Renders pre-rendered incident markdown HTML with dark-theme prose styling.
 * - INPUTS: html (pre-rendered HTML string), optional className override
 * - OUTPUTS: A styled <div> with dangerouslySetInnerHTML
 * - ERRORS: None — rendering is delegated to the browser
 * - SIDE EFFECTS: None
 * - INVARIANTS: The rendered HTML comes from the server-side markdown pipeline, not user input
 */
export function MarkdownContent({ html, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        // Headings
        "prose-headings:text-[var(--text-primary)]",
        "prose-headings:font-[family-name:var(--font-display)]",
        // Paragraphs
        "prose-p:text-[var(--text-secondary)]",
        // Links
        "prose-a:text-[var(--accent)] hover:prose-a:text-[var(--accent-bright)]",
        "prose-a:no-underline hover:prose-a:underline",
        // Strong / em
        "prose-strong:text-[var(--text-primary)]",
        "prose-em:text-[var(--text-secondary)]",
        // Inline code
        "prose-code:text-[var(--accent)] prose-code:bg-[var(--bg-overlay)]",
        "prose-code:rounded prose-code:px-1 prose-code:py-0.5",
        "prose-code:font-mono prose-code:text-sm",
        // Code blocks
        "prose-pre:bg-[var(--bg-overlay)] prose-pre:border prose-pre:border-[var(--border-subtle)]",
        "prose-pre:rounded-sm",
        // Tables
        "prose-table:border-collapse",
        "prose-th:bg-[var(--bg-surface)] prose-th:text-[var(--text-primary)] prose-th:border prose-th:border-[var(--border-visible)]",
        "prose-td:text-[var(--text-secondary)] prose-td:border prose-td:border-[var(--border-subtle)]",
        // Blockquote
        "prose-blockquote:border-l-[var(--accent)] prose-blockquote:text-[var(--text-secondary)]",
        // Horizontal rule
        "prose-hr:border-[var(--border-subtle)]",
        // Lists
        "prose-li:text-[var(--text-secondary)]",
        // H2 left border — via prose-h2 modifier
        "[&_.prose-h2]:border-l-4 [&_.prose-h2]:border-[var(--accent)] [&_.prose-h2]:pl-3",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
