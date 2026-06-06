import type { ReactNode } from "react";

interface JsonLdProps {
  data: unknown;
  id?: string;
}

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

const HTML_ESCAPE_MAP: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LINE_SEPARATOR]: "\\u2028",
  [PARAGRAPH_SEPARATOR]: "\\u2029",
};

const UNSAFE_PATTERN = new RegExp(`[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`, "g");

function safeJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(UNSAFE_PATTERN, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

export function JsonLd({ data, id }: JsonLdProps): ReactNode {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: safeJsonLdString(data) }}
    />
  );
}
