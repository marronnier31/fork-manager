import { extractReadmeExcerpt } from "../github/readme";

const MAX_SUMMARY_LENGTH = 140;

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeSentence(value: string): string {
  return collapseWhitespace(value.replace(/[.?!]+$/g, ""));
}

export function summarizeRepository(input: {
  description?: string | null;
  readme?: string | null;
}): string {
  const parts: string[] = [];

  if (input.description?.trim()) {
    parts.push(normalizeSentence(input.description));
  }

  if (input.readme?.trim()) {
    parts.push(extractReadmeExcerpt(input.readme, 120));
  }

  if (parts.length === 0) {
    return "";
  }

  const summary = collapseWhitespace(parts.join(". "));

  if (summary.length <= MAX_SUMMARY_LENGTH) {
    return summary;
  }

  return summary.slice(0, MAX_SUMMARY_LENGTH).trim().replace(/[.,;:!-]+$/g, "");
}
