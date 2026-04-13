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

export function detectStackHints(text: string): string[] {
  const lowerText = text.toLowerCase();

  return STACK_HINTS.filter((hint) => lowerText.includes(hint.toLowerCase()));
}
