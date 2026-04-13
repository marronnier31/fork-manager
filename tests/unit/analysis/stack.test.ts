import { describe, expect, it } from "vitest";

describe("detectStackHints", () => {
  it("detects stack hints from readme content", async () => {
    const { detectStackHints } = await import("../../../src/lib/analysis/stack");

    expect(detectStackHints("Next.js TypeScript Tailwind Prisma")).toEqual([
      "Next.js",
      "TypeScript",
      "Tailwind",
      "Prisma"
    ]);
  });
});
