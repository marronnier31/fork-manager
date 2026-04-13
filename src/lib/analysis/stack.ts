const STACK_HINTS = [
  "Next.js",
  "TypeScript",
  "Tailwind",
  "Prisma",
  "React",
  "Node.js",
  "Python",
  "FastAPI"
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectStackHints(text: string): string[] {
  const lowerText = text.toLowerCase();

  return STACK_HINTS.filter((hint) => {
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(hint.toLowerCase())}(?=$|[^a-z0-9])`
    );

    return pattern.test(lowerText);
  });
}
