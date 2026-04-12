import type { ImportedRepository } from "../../../src/lib/repos/types";
import { describe, expect, it } from "vitest";

describe("upsert fork repositories", () => {
  it("persists fork fields and preserves personal metadata when imported fields refresh", async () => {
    const { upsertForkRepositories } = await import(
      "../../../src/lib/repos/upsert"
    );

    const importedRepository: ImportedRepository = {
      repoId: 1,
      owner: "me",
      name: "example",
      fullName: "me/example",
      htmlUrl: "https://github.com/me/example",
      description: "updated description",
      isFork: true,
      parentFullName: "upstream/example",
      topics: ["typescript"],
      primaryLanguage: "TypeScript",
      stargazersCount: 12,
      forksCount: 3,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-02-01T00:00:00.000Z"),
      pushedAt: new Date("2024-02-02T00:00:00.000Z"),
      defaultBranch: "main",
      summary: null,
      techStack: ["Next.js", "Prisma"],
      category: null,
      hasReadme: true,
      readmeExcerpt: "Starter repo",
      analyzedAt: null,
      activityScore: null,
      cleanupReasons: [],
      isLikelyAbandoned: false,
      hasMyCommits: "unknown"
    };

    const result = await upsertForkRepositories([importedRepository]);

    expect(result[0].github.repoId).toBe(1);
    expect(result[0].github.fullName).toBe("me/example");
    expect(result[0].github.isFork).toBe(true);
    expect(result[0].github.description).toBe("updated description");
    expect(result[0].personal).toBeDefined();
    expect(result[0].personal?.status).toBe("watching");
    expect(result[0].personal?.note).toBe("keep for later");
  });
});
