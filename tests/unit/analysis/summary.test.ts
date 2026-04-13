import { describe, expect, it } from "vitest";

describe("summarizeRepository", () => {
  it("builds a concise summary from description and readme", async () => {
    const { summarizeRepository } = await import(
      "../../../src/lib/analysis/summary"
    );

    const summary = summarizeRepository({
      description: "Starter for AI apps",
      readme: "# AI Starter\nBuilt with Next.js and TypeScript"
    });

    expect(summary).toContain("AI apps");
    expect(summary).toContain("Next.js");
    expect(summary.length).toBeLessThanOrEqual(140);
  });
});
