interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * CONTRACT:
 * - WHAT: Injects a JSON-LD structured data script tag.
 * - INPUTS: data object to serialize as JSON-LD
 * - OUTPUTS: <script type="application/ld+json"> with serialized data
 * - ERRORS: None — JSON.stringify is total for well-formed objects
 * - SIDE EFFECTS: None
 * - INVARIANTS: Script type is always "application/ld+json"
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
