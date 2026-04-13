import { describe, expect, it } from "vitest";

describe("scoreCleanupCandidate", () => {
  it("marks low-signal forks as cleanup candidates", async () => {
    const { scoreCleanupCandidate } = await import(
      "../../../src/lib/analysis/cleanup"
    );

    const result = scoreCleanupCandidate({
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      hasMyCommits: "no",
      note: null,
      tags: [],
      isFavorite: false,
      lastReviewedAt: null
    });

    expect(result.isCandidate).toBe(true);
    expect(result.reasons).toContain("No personal note");
    expect(result.reasons).toContain("No tags");
    expect(result.reasons).toContain("No user commits");
  });

  it("treats whitespace notes and empty tags as missing signals", async () => {
    const { scoreCleanupCandidate } = await import(
      "../../../src/lib/analysis/cleanup"
    );

    const result = scoreCleanupCandidate({
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      hasMyCommits: "unknown",
      note: "   ",
      tags: ["", "   "],
      isFavorite: true,
      lastReviewedAt: new Date("2026-03-01T00:00:00.000Z")
    });

    expect(result.reasons).toContain("No personal note");
    expect(result.reasons).toContain("No tags");
  });
});
