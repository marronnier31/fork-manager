import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();

vi.mock("../../../src/lib/db", () => ({
  db: {
    repository: {
      findMany
    }
  }
}));

describe("dashboard repository stats", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-13T00:00:00.000Z"));
    findMany.mockResolvedValue([
      {
        updatedAt: new Date("2026-04-08T00:00:00.000Z"),
        isLikelyAbandoned: false,
        personal: {
          status: "watching",
          note: null,
          isFavorite: false
        }
      },
      {
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        isLikelyAbandoned: true,
        personal: {
          status: "active",
          note: "keep",
          isFavorite: true
        }
      },
      {
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
        isLikelyAbandoned: true,
        personal: null
      }
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
    findMany.mockReset();
  });

  it("returns total, recent, unclassified, cleanup, and favorite counts", async () => {
    const { getDashboardStats } = await import("../../../src/lib/repos/queries");

    const stats = await getDashboardStats();

    expect(findMany).toHaveBeenCalledWith({ include: { personal: true } });
    expect(stats).toEqual({
      totalForks: 3,
      recentForks: 1,
      unclassifiedForks: 1,
      cleanupCandidates: 2,
      activeFavorites: 1
    });
  });
});
