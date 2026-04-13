function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function replaceMarkdownLinks(value: string): string {
  let result = "";

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "[") {
      result += value[index];
      continue;
    }

    const labelEnd = value.indexOf("](", index);

    if (labelEnd === -1) {
      result += value[index];
      continue;
    }

    const label = value.slice(index + 1, labelEnd);
    let cursor = labelEnd + 2;
    let depth = 1;

    while (cursor < value.length && depth > 0) {
      if (value[cursor] === "(") {
        depth += 1;
      } else if (value[cursor] === ")") {
        depth -= 1;
      }

      cursor += 1;
    }

    if (depth !== 0) {
      result += value[index];
      continue;
    }

    result += label;
    index = cursor - 1;
  }

  return result;
}

export function normalizeReadmeText(readme: string): string {
  return collapseWhitespace(
    replaceMarkdownLinks(
      readme
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/[`*_~]/g, " ")
    )
  );
}

export function extractReadmeExcerpt(readme: string, maxLength = 120): string {
  return normalizeReadmeText(readme).slice(0, maxLength).trim();
}
