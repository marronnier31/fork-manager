import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();

vi.mock("../../../src/lib/db", () => ({
  db: {
    repository: {
      findMany
    }
  }
}));

afterEach(() => {
  vi.resetModules();
});

describe("cleanup queue", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("returns repositories flagged as cleanup candidates with parsed reasons", async () => {
    findMany.mockResolvedValue([
      {
        id: "repo-1",
        repoId: 1,
        owner: "me",
        name: "example",
        fullName: "me/example",
        htmlUrl: "https://github.com/me/example",
        description: "Reference fork",
        isFork: true,
        parentFullName: "upstream/example",
        topics: JSON.stringify(["typescript"]),
        primaryLanguage: "TypeScript",
        stargazersCount: 12,
        forksCount: 3,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-02-01T00:00:00.000Z"),
        pushedAt: new Date("2024-02-02T00:00:00.000Z"),
        defaultBranch: "main",
        summary: "Starter repo",
        techStack: JSON.stringify(["Next.js", "Prisma"]),
        category: "starter",
        hasReadme: true,
        readmeExcerpt: "Starter repo",
        analyzedAt: new Date("2024-02-03T00:00:00.000Z"),
        activityScore: 15,
        cleanupReasons: JSON.stringify(["No personal note", "No recent updates"]),
        isLikelyAbandoned: true,
        hasMyCommits: "no",
        personal: {
          status: "cleanup",
          tags: JSON.stringify([]),
          note: null,
          savedReason: null,
          reviewLaterAt: null,
          isFavorite: false,
          lastReviewedAt: null
        }
      },
      {
        id: "repo-2",
        repoId: 2,
        owner: "me",
        name: "keep-me",
        fullName: "me/keep-me",
        htmlUrl: "https://github.com/me/keep-me",
        description: "Healthy fork",
        isFork: true,
        parentFullName: "upstream/keep-me",
        topics: JSON.stringify(["go"]),
        primaryLanguage: "Go",
        stargazersCount: 2,
        forksCount: 1,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-04-01T00:00:00.000Z"),
        pushedAt: new Date("2024-04-01T00:00:00.000Z"),
        defaultBranch: "main",
        summary: "Healthy repo",
        techStack: JSON.stringify(["Go"]),
        category: "service",
        hasReadme: true,
        readmeExcerpt: "Healthy repo",
        analyzedAt: new Date("2024-04-01T00:00:00.000Z"),
        activityScore: 65,
        cleanupReasons: JSON.stringify([]),
        isLikelyAbandoned: false,
        hasMyCommits: "yes",
        personal: {
          status: "active",
          tags: JSON.stringify(["keep"]),
          note: "valuable",
          savedReason: "Still used",
          reviewLaterAt: null,
          isFavorite: true,
          lastReviewedAt: new Date("2024-04-02T00:00:00.000Z")
        }
      }
    ]);

    const { listCleanupCandidates } = await import("../../../src/lib/repos/queries");
    const candidates = await listCleanupCandidates();

    expect(findMany).toHaveBeenCalledWith({
      where: { isFork: true },
      include: { personal: true },
      orderBy: [{ updatedAt: "asc" }, { fullName: "asc" }]
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0].cleanupReasons).toContain("No personal note");
    expect(candidates[0].personal?.status).toBe("cleanup");
  });

  it("renders the cleanup page with candidate reasons and review cues", async () => {
    findMany.mockResolvedValue([
      {
        id: "repo-1",
        repoId: 1,
        owner: "me",
        name: "example",
        fullName: "me/example",
        htmlUrl: "https://github.com/me/example",
        description: "Reference fork",
        isFork: true,
        parentFullName: "upstream/example",
        topics: JSON.stringify(["typescript"]),
        primaryLanguage: "TypeScript",
        stargazersCount: 12,
        forksCount: 3,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-02-01T00:00:00.000Z"),
        pushedAt: new Date("2024-02-02T00:00:00.000Z"),
        defaultBranch: "main",
        summary: "Starter repo",
        techStack: JSON.stringify(["Next.js", "Prisma"]),
        category: "starter",
        hasReadme: true,
        readmeExcerpt: "Starter repo",
        analyzedAt: new Date("2024-02-03T00:00:00.000Z"),
        activityScore: 15,
        cleanupReasons: JSON.stringify(["No personal note", "No recent updates"]),
        isLikelyAbandoned: true,
        hasMyCommits: "unknown",
        personal: {
          status: "cleanup",
          tags: JSON.stringify(["review"]),
          note: null,
          savedReason: null,
          reviewLaterAt: null,
          isFavorite: false,
          lastReviewedAt: null
        }
      }
    ]);

    const { default: CleanupPage } = await import("../../../src/app/cleanup/page");
    const markup = renderToStaticMarkup(await CleanupPage());

    expect(markup).toContain("Cleanup Queue");
    expect(markup).toContain("me/example");
    expect(markup).toContain("No personal note");
    expect(markup).toContain("Needs review");
    expect(markup).toContain("Status: Cleanup");
  });
});
