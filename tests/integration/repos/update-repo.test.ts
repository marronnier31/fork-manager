import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const update = vi.fn();

vi.mock("../../../src/lib/db", () => ({
  db: {
    repository: {
      findUnique,
      update
    }
  }
}));

afterEach(() => {
  vi.resetModules();
});

describe("repository detail and metadata editing", () => {
  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
  });

  it("renders the repository detail page with imported data and personal metadata", async () => {
    findUnique.mockResolvedValue({
      id: "repo-1",
      repoId: 1,
      owner: "me",
      name: "example",
      fullName: "me/example",
      htmlUrl: "https://github.com/me/example",
      description: "updated description",
      isFork: true,
      parentFullName: "upstream/example",
      topics: JSON.stringify(["typescript", "fork"]),
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
      cleanupReasons: JSON.stringify(["No recent updates"]),
      isLikelyAbandoned: false,
      hasMyCommits: "unknown",
      personal: {
        status: "watching",
        tags: JSON.stringify(["keep", "starter"]),
        note: "Review when starting a new project",
        savedReason: "Useful reference",
        reviewLaterAt: null,
        isFavorite: true,
        lastReviewedAt: new Date("2024-02-04T00:00:00.000Z")
      }
    });

    const { default: RepoDetailPage } = await import(
      "../../../src/app/repos/[id]/page"
    );
    const markup = renderToStaticMarkup(
      await RepoDetailPage({ params: { id: "repo-1" } })
    );

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "repo-1" },
      include: { personal: true }
    });
    expect(markup).toContain("me/example");
    expect(markup).toContain("updated description");
    expect(markup).toContain("Watching");
    expect(markup).toContain("Review when starting a new project");
    expect(markup).toContain("keep, starter");
    expect(markup).toContain("Favorite");
  });

  it("updates personal metadata without changing imported repository fields", async () => {
    update.mockResolvedValue({
      id: "repo-1",
      fullName: "me/example",
      personal: {
        status: "active",
        tags: JSON.stringify(["ai", "starter"]),
        note: "use for future AI tooling",
        savedReason: "Worth keeping",
        reviewLaterAt: new Date("2026-05-01T00:00:00.000Z"),
        isFavorite: true,
        lastReviewedAt: new Date("2026-04-20T00:00:00.000Z")
      }
    });

    const { PATCH } = await import("../../../src/app/api/repos/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/repos/repo-1", {
        method: "PATCH",
        body: JSON.stringify({
          status: "active",
          note: "use for future AI tooling",
          tags: ["ai", "starter"],
          savedReason: "Worth keeping",
          reviewLaterAt: "2026-05-01T00:00:00.000Z",
          isFavorite: true
        })
      }),
      { params: { id: "repo-1" } }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "repo-1",
      fullName: "me/example",
      personal: {
        status: "active",
        tags: JSON.stringify(["ai", "starter"]),
        note: "use for future AI tooling",
        savedReason: "Worth keeping",
        reviewLaterAt: "2026-05-01T00:00:00.000Z",
        isFavorite: true,
        lastReviewedAt: "2026-04-20T00:00:00.000Z"
      }
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "repo-1" },
        data: expect.not.objectContaining({
          fullName: expect.anything(),
          owner: expect.anything(),
          htmlUrl: expect.anything()
        })
      })
    );
  });

  it("marks a repository as favorited without changing imported fields", async () => {
    findUnique.mockResolvedValue({
      id: "repo-1",
      personal: {
        isFavorite: false,
        status: "watching",
        tags: JSON.stringify([]),
        note: null,
        savedReason: null,
        reviewLaterAt: null,
        lastReviewedAt: null
      }
    });
    update.mockResolvedValue({
      id: "repo-1",
      fullName: "me/example",
      personal: {
        isFavorite: true,
        status: "watching",
        tags: JSON.stringify([]),
        note: null,
        savedReason: null,
        reviewLaterAt: null,
        lastReviewedAt: new Date("2026-04-20T00:00:00.000Z")
      }
    });

    const { POST } = await import("../../../src/app/api/repos/[id]/favorite/route");
    const response = await POST(new Request("http://localhost/api/repos/repo-1/favorite"), {
      params: { id: "repo-1" }
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "repo-1",
      fullName: "me/example",
      personal: {
        isFavorite: true,
        status: "watching",
        tags: JSON.stringify([]),
        note: null,
        savedReason: null,
        reviewLaterAt: null,
        lastReviewedAt: "2026-04-20T00:00:00.000Z"
      }
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "repo-1" },
      include: { personal: true }
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "repo-1" },
        data: expect.not.objectContaining({
          fullName: expect.anything(),
          owner: expect.anything(),
          htmlUrl: expect.anything()
        })
      })
    );
  });
});
