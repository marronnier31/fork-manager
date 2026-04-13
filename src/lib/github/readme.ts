function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeReadmeText(readme: string): string {
  return collapseWhitespace(
    readme
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/[`*_~]/g, " ")
  );
}

export function extractReadmeExcerpt(readme: string, maxLength = 120): string {
  return normalizeReadmeText(readme).slice(0, maxLength).trim();
}
